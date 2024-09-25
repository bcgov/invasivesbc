import { Knex } from 'knex';

export async function up(knex: Knex) {
  await knex.raw(
    //language=PostgreSQL
    `
        -- Enable PostGIS (includes raster)
        CREATE EXTENSION IF NOT EXISTS postgis;
        
        -- Enable Topology
        CREATE EXTENSION IF NOT EXISTS postgis_topology;
        
        CREATE SCHEMA invasivesbc;

        set search_path to invasivesbc, public;

        CREATE EXTENSION IF NOT EXISTS btree_gist WITH SCHEMA invasivesbc;
        CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA public;
        CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;

        CREATE TYPE invasivesbc.batch_upload_status AS ENUM (
            'NEW',
            'PROCESSING',
            'ERROR',
            'SUCCESS'
            );
        CREATE TYPE invasivesbc.geo_autofill AS
        (
            geo          public.geometry,
            geog         public.geography,
            geojson      text,
            latitude     double precision,
            longitude    double precision,
            utm_zone     integer,
            utm_northing integer,
            utm_easting  integer,
            area         integer,
            within_bc    boolean
        );
        CREATE TYPE invasivesbc.validation_status AS ENUM (
            'VALID',
            'INVALID'
            );
        CREATE TYPE public.embedded_metabase_resource_type AS ENUM (
            'dashboard',
            'question'
            );
        CREATE FUNCTION invasivesbc.activity_subtype_update() RETURNS trigger
            LANGUAGE plpgsql
        AS
        $$
        BEGIN
            set search_path = invasivesbc,public;

            UPDATE activity_incoming_data aid
            SET activity_subtype_full = asm.full_subtype
            FROM activity_subtype_mapping asm
            WHERE aid.activity_subtype = asm.form_subtype
              AND aid.activity_incoming_data_id = NEW.activity_incoming_data_id;

            RETURN NEW;
        END
        $$;
        CREATE FUNCTION invasivesbc.agency_mapping() RETURNS trigger
            LANGUAGE plpgsql
        AS
        $$
        BEGIN
            set search_path = invasivesbc,public;

            -- Get mapping table of agencies
            WITH codes AS
                     (SELECT *
                      FROM code
                      WHERE code_header_id = (SELECT code_header_id
                                              FROM code_header
                                              WHERE code_header_description = 'invasive_species_agency_code')),
                 -- Get rows of the listed agencies
                 payload AS
                     (SELECT activity_incoming_data_id AS id,
                             string_to_array(activity_payload -> 'form_data' -> 'activity_data' ->>
                                             'invasive_species_agency_code',
                                             ',')      AS acronym
                      FROM activity_incoming_data
                      where activity_id = NEW.activity_id),
                 -- Map unnested rows to proper. full code_description names
                 mapped AS
                     (SELECT id, unnested_code_name, code_description
                      FROM (SELECT id, UNNEST(acronym) AS unnested_code_name FROM payload) AS foo,
                           codes
                      WHERE code_name = unnested_code_name),
                 -- Collect mapped descriptions by their id
                 collected AS
                     (SELECT id, array_to_string(ARRAY_AGG(code_description), ', ') AS agency_list
                      FROM mapped
                      GROUP BY id)

                 -- Update column
            UPDATE activity_incoming_data
            SET agency = agency_list
            FROM collected
            WHERE activity_incoming_data_id = collected.id
              AND activity_incoming_data_id = NEW.activity_incoming_data_id;
            RETURN NEW;
        END
        $$;
        CREATE FUNCTION invasivesbc.batch_and_row_id_autofill() RETURNS trigger
            LANGUAGE plpgsql
        AS
        $$


        begin
            if (new.batch_id is null) then


                new.batch_id := (select batch_id
                                 from invasivesbc.activity_incoming_data
                                 where batch_id is not null
                                   and activity_id = new.activity_id
                                 limit 1);
            end if;
            if (new.row_number is null) then
                new.row_number := (select row_number
                                   from invasivesbc.activity_incoming_data
                                   where row_number is not null
                                     and activity_id = new.activity_id
                                   limit 1);
            end if;
            return new;
        END;
        $$;
        CREATE FUNCTION invasivesbc.code_to_name() RETURNS trigger
            LANGUAGE plpgsql
        AS
        $$
        BEGIN
            set
                search_path = invasivesbc,
                    public;
            WITH species_code_by_activity_id AS (select aid.activity_incoming_data_id,
                                                        aid.activity_id,
                                                        species_positive_col as positive_code,
                                                        species_negative_col as negative_code,
                                                        species_treated_col  as treated_code,
                                                        species_biocontrol   as biocontrol_code
                                                 from activity_incoming_data aid
                                                          left join jsonb_array_elements_text(
                                                         case jsonb_typeof(species_positive)
                                                             when 'array' then species_positive
                                                             else '[]' end
                                                     ) species_positive_col on true
                                                          left join jsonb_array_elements_text(
                                                         case jsonb_typeof(species_negative)
                                                             when 'array' then species_negative
                                                             else '[]' end
                                                     ) species_negative_col on true
                                                          left join jsonb_array_elements_text(
                                                         case jsonb_typeof(species_treated)
                                                             when 'array' then species_treated
                                                             else '[]' end
                                                     ) species_treated_col on true
                                                          left join jsonb_array_elements(
                                                         case jsonb_typeof(
                                                                 coalesce(
                                                                             activity_payload #>
                                                                             '{form_data, activity_subtype_data, Biocontrol_Collection_Information}',
                                                                             activity_payload #>
                                                                             '{form_data, activity_subtype_data, Monitoring_BiocontrolDispersal_Information}',
                                                                             activity_payload #>
                                                                             '{form_data, activity_subtype_data, Monitoring_BiocontrolRelease_TerrestrialPlant_Information}',
                                                                             activity_payload #>
                                                                             '{form_data, activity_subtype_data, Biocontrol_Release_Information}'))
                                                             when 'array' then coalesce(
                                                                         activity_payload #>
                                                                         '{form_data, activity_subtype_data, Biocontrol_Collection_Information}',
                                                                         activity_payload #>
                                                                         '{form_data, activity_subtype_data, Monitoring_BiocontrolDispersal_Information}',
                                                                         activity_payload #>
                                                                         '{form_data, activity_subtype_data, Monitoring_BiocontrolRelease_TerrestrialPlant_Information}',
                                                                         activity_payload #>
                                                                         '{form_data, activity_subtype_data, Biocontrol_Release_Information}')
                                                             else '[]' end
                                                     ) species_biocontrol on true
                                                 where aid.iscurrent
                                                   and aid.activity_id = new.activity_id),
                 species_positive_translated_by_activity_id as (select im.char_code,
                                                                       sid.positive_code,
                                                                       im.invbc_name,
                                                                       sid.activity_id,
                                                                       sid.activity_incoming_data_id
                                                                from iapp_invbc_mapping im
                                                                         inner join species_code_by_activity_id sid on sid.positive_code = im.char_code),
                 species_negative_translated_by_activity_id as (select im.char_code,
                                                                       sid.negative_code,
                                                                       im.invbc_name,
                                                                       sid.activity_id,
                                                                       sid.activity_incoming_data_id
                                                                from iapp_invbc_mapping im
                                                                         inner join species_code_by_activity_id sid on sid.negative_code = im.char_code),
                 species_treated_translated_by_activity_id as (select im.char_code,
                                                                      sid.treated_code,
                                                                      im.invbc_name,
                                                                      sid.activity_id,
                                                                      sid.activity_incoming_data_id
                                                               from iapp_invbc_mapping im
                                                                        inner join species_code_by_activity_id sid on sid.treated_code = im.char_code),
                 species_biocontrol_translated_by_activity_id as (select im.code_name,
                                                                         sid.biocontrol_code ->> 'biological_agent_code',
                                                                         im.code_description,
                                                                         sid.activity_id,
                                                                         sid.activity_incoming_data_id
                                                                  from code im
                                                                           inner join species_code_by_activity_id sid
                                                                                      on sid.biocontrol_code ->> 'biological_agent_code' = im.code_name
                                                                  where im.code_header_id = 43),
                 species_positive_description_aggregated_by_activity_id as (select array_to_string(
                                                                                           ARRAY_AGG(distinct st.invbc_name),
                                                                                           ', '
                                                                                       ) as species_positive_full,
                                                                                   st.activity_id,
                                                                                   st.activity_incoming_data_id
                                                                            from species_positive_translated_by_activity_id st
                                                                            group by st.activity_id,
                                                                                     st.activity_incoming_data_id),
                 species_negative_description_aggregated_by_activity_id as (select array_to_string(
                                                                                           ARRAY_AGG(distinct st.invbc_name),
                                                                                           ', '
                                                                                       ) as species_negative_full,
                                                                                   st.activity_id,
                                                                                   st.activity_incoming_data_id
                                                                            from species_negative_translated_by_activity_id st
                                                                            group by st.activity_id,
                                                                                     st.activity_incoming_data_id),
                 species_treated_description_aggregated_by_activity_id as (select array_to_string(
                                                                                          ARRAY_AGG(distinct st.invbc_name),
                                                                                          ', '
                                                                                      ) as species_treated_full,
                                                                                  st.activity_id,
                                                                                  st.activity_incoming_data_id
                                                                           from species_treated_translated_by_activity_id st
                                                                           group by st.activity_id,
                                                                                    st.activity_incoming_data_id),
                 species_biocontrol_description_aggregated_by_activity_id as (select array_to_string(
                                                                                             ARRAY_AGG(distinct st.code_description),
                                                                                             ', '
                                                                                         ) as species_biocontrol_full,
                                                                                     st.activity_id,
                                                                                     st.activity_incoming_data_id
                                                                              from species_biocontrol_translated_by_activity_id st
                                                                              group by st.activity_id,
                                                                                       st.activity_incoming_data_id),
                 species_full_descriptions_by_activity_id as (select a.activity_id,
                                                                     a.activity_incoming_data_id,
                                                                     sp.species_positive_full,
                                                                     sn.species_negative_full,
                                                                     st.species_treated_full,
                                                                     sb.species_biocontrol_full
                                                              from activity_incoming_data a
                                                                       left join species_positive_description_aggregated_by_activity_id sp
                                                                                 on sp.activity_id = a.activity_id
                                                                       left join species_negative_description_aggregated_by_activity_id sn
                                                                                 on sn.activity_id = a.activity_id
                                                                       left join species_treated_description_aggregated_by_activity_id st
                                                                                 on st.activity_id = a.activity_id
                                                                       left join species_biocontrol_description_aggregated_by_activity_id sb
                                                                                 on sb.activity_id = a.activity_id
                                                              where a.iscurrent
                                                                and a.activity_id = new.activity_id)
            UPDATE
                activity_incoming_data aid
            set species_positive_full   = sf.species_positive_full,
                species_negative_full   = sf.species_negative_full,
                species_treated_full    = sf.species_treated_full,
                species_biocontrol_full = sf.species_biocontrol_full
            FROM species_full_descriptions_by_activity_id sf
            WHERE aid.activity_incoming_data_id = sf.activity_incoming_data_id
              and aid.activity_incoming_data_id = new.activity_incoming_data_id
              and aid.activity_id = new.activity_id;
            RETURN NEW;
        END
        $$;
        CREATE FUNCTION invasivesbc.compute_geo_autofill(wkt text) RETURNS invasivesbc.geo_autofill
            LANGUAGE plpgsql
        AS
        $_$
        DECLARE
            centroid                     public.geometry;
            DECLARE utm_srid             integer;
            DECLARE centroid_in_utm_srid public.geometry;
            DECLARE ret                  invasivesbc.geo_autofill;
        BEGIN
            -- assume source data are in srid 4326 (lat/lon)
            SELECT public.ST_GeomFromText($1, 4326) INTO ret.geo;

            SELECT public.ST_centroid(ret.geo, true) INTO centroid;

            SELECT round(public.ST_X(centroid)::numeric, 6)::float8 INTO ret.longitude;
            SELECT round(public.ST_Y(centroid)::numeric, 6)::float8 INTO ret.latitude;

            -- to compute utm zone for lat/lon coordinates
            SELECT floor((ret.longitude + 180) / 6) + 1 INTO ret.utm_zone;

            -- srid for utm zone in northern hemisphere is zone + 32600
            SELECT 32600 + ret.utm_zone INTO utm_srid;

            -- transform centroid lat/lon into utm spatial reference for that zone
            SELECT public.ST_Transform(centroid, utm_srid) INTO centroid_in_utm_srid;

            SELECT round(public.ST_X(centroid_in_utm_srid)::numeric)::integer INTO ret.utm_easting;
            SELECT round(public.ST_Y(centroid_in_utm_srid)::numeric)::integer INTO ret.utm_northing;

            SELECT public.ST_AsGeoJSON(ret.geo) INTO ret.geojson;

            -- boolean -- true if it is wholly covered by the poly bounding the province
            SELECT exists(select public.ST_Intersects((SELECT public.ST_Subdivide(geog::public.geometry)
                                                       from invasivesbc.provincial_boundary
                                                       where id = 1), ret.geo))
            INTO ret.within_bc;

            select public.geography(
                           public.ST_Force2D(
                                   public.ST_SetSRID(
                                           ret.geo, 4326
                                       )
                               )
                       )
            into ret.geog;

            -- in srid 4326, so result is square meters.
            SELECT case
                       when round(public.ST_Area(ret.geog))::integer = 0 then 1
                       else round(public.ST_Area(ret.geog))::integer end
            INTO ret.area;

            RETURN ret;
        END;
        $_$;
        CREATE FUNCTION invasivesbc.context_autofill() RETURNS trigger
            LANGUAGE plpgsql
        AS
        $$
        BEGIN
            UPDATE invasivesbc.activity_incoming_data
            SET invasive_plant_management_areas              = (select ipma
                                                                from public.invasive_plant_management_areas
                                                                where public.st_intersects(
                                                                              public.st_geographyFromText((
                                                                                                  'POINT('::TEXT ||
                                                                                                  (activity_payload -> 'form_data' -> 'activity_data' ->> 'longitude')::TEXT ||
                                                                                                  ' '::TEXT ||
                                                                                                  (activity_payload -> 'form_data' -> 'activity_data' ->> 'latitude')::TEXT ||
                                                                                                  ')'::TEXT)::TEXT),
                                                                              invasive_plant_management_areas.geog
                                                                          )
                                                                limit 1),
                regional_invasive_species_organization_areas = (select string_agg(agency, ', ')
                                                                from public.regional_invasive_species_organization_areas
                                                                where public.st_intersects(
                                                                              public.st_geographyFromText((
                                                                                                  'POINT('::TEXT ||
                                                                                                  (activity_payload -> 'form_data' -> 'activity_data' ->> 'longitude')::TEXT ||
                                                                                                  ' '::TEXT ||
                                                                                                  (activity_payload -> 'form_data' -> 'activity_data' ->> 'latitude')::TEXT ||
                                                                                                  ')'::TEXT)::TEXT),
                                                                              regional_invasive_species_organization_areas.geog
                                                                          )),
                regional_districts                           = (select agency
                                                                from public.regional_districts
                                                                where public.st_intersects(
                                                                              public.st_geographyFromText((
                                                                                                  'POINT('::TEXT ||
                                                                                                  (activity_payload -> 'form_data' -> 'activity_data' ->> 'longitude')::TEXT ||
                                                                                                  ' '::TEXT ||
                                                                                                  (activity_payload -> 'form_data' -> 'activity_data' ->> 'latitude')::TEXT ||
                                                                                                  ')'::TEXT)::TEXT),
                                                                              regional_districts.geog
                                                                          )
                                                                limit 1)
            WHERE activity_id = NEW.activity_id;

            RETURN NEW;
        END;
        $$;
        CREATE FUNCTION invasivesbc.current_activity_function() RETURNS trigger
            LANGUAGE plpgsql
        AS
        $$
        BEGIN
            update invasivesbc.activity_incoming_data
            set iscurrent = false
            where activity_id = new.activity_id
              and activity_incoming_data_id != new.activity_incoming_data_id
              and new.deleted_timestamp is null;

            update invasivesbc.activity_incoming_data
            set deleted_timestamp = NOW()
            where activity_id = new.activity_id
              and activity_incoming_data_id != new.activity_incoming_data_id
              and deleted_timestamp is null;

            RETURN NEW;

        END;
        $$;
        CREATE FUNCTION invasivesbc.delete_last_activity() RETURNS trigger
            LANGUAGE plpgsql
        AS
        $$
        BEGIN
            update invasivesbc.activity_incoming_data
            set deleted_timestamp = NOW()
            where activity_id = new.activity_id
              and deleted_timestamp is null;
            RETURN NEW;
        END;
        $$;
        CREATE FUNCTION invasivesbc.immutable_to_date(the_date text) RETURNS date
            LANGUAGE sql
            IMMUTABLE
        AS
        $$
        select to_date(the_date, 'yyyy-mm-dd');
        $$;
        CREATE FUNCTION invasivesbc.invasives_array_coalesce_to_jsonb(input jsonb) RETURNS jsonb
            LANGUAGE plpgsql
        AS
        $$
        BEGIN
            if jsonb_typeof(input) <> 'array' or input = '[]' then
                return '[null]';
            else
                return jsonb_array_elements(input);
            END if;
        END
        $$;
        CREATE FUNCTION invasivesbc.invasives_array_coalesce_to_jsonb_test(input jsonb) RETURNS jsonb
            LANGUAGE plpgsql
        AS
        $$
        BEGIN
            if jsonb_typeof(input) <> 'array' or input = '[]' then
                return '[null]';
            else
                return jsonb_array_elements(input);
            END if;
        END
        $$;
        CREATE FUNCTION invasivesbc.invasives_array_coalesce_to_text(input jsonb) RETURNS text
            LANGUAGE plpgsql
        AS
        $$
        BEGIN
            if jsonb_typeof(input) <> 'array' or input = '[]' then
                return '[null]';
            else
                return jsonb_array_elements_text(input);
            END if;
        END
        $$;
        CREATE FUNCTION invasivesbc.invasives_array_coalesce_to_text_test(input jsonb) RETURNS text
            LANGUAGE plpgsql
        AS
        $$
        BEGIN
            if jsonb_typeof(input) <> 'array' or input = '[]' then
                return '[null]';
            else
                return jsonb_array_elements_text(input);
            END if;
        END
        $$;
        CREATE FUNCTION invasivesbc.jsonb_array_to_text_array(_js jsonb) RETURNS text[]
            LANGUAGE sql
            IMMUTABLE STRICT PARALLEL SAFE
        AS
        $$
        SELECT ARRAY(SELECT jsonb_array_elements_text(_js))
        $$;
        CREATE FUNCTION invasivesbc.jurisdiction_mapping() RETURNS trigger
            LANGUAGE plpgsql
        AS
        $$
        BEGIN
            set search_path = invasivesbc,public;
            -- Get mapping table
            WITH codes AS
                     (SELECT *
                      FROM code
                      WHERE code_header_id =
                            (SELECT code_header_id
                             FROM code_header
                             WHERE code_header_description = 'jurisdiction_code')),
                 -- Get jurisdiction codes
                 mapped AS
                     (SELECT activity_id, jurisdiction_percentage, code_description
                      FROM activity_jurisdictions,
                           codes
                      WHERE jurisdiction_code = code_name),
                 -- Collect jurisdiction codes into strings
                 stringified AS
                     (SELECT activity_id,
                             STRING_AGG(code_description::text || ' (' || jurisdiction_percentage::TEXT || '%)',
                                        ', ') AS jurisdictions
                      FROM mapped
                      GROUP BY activity_id)
            UPDATE activity_incoming_data
            SET jurisdiction_display = s.jurisdictions
            FROM stringified s
            WHERE activity_incoming_data.activity_id = s.activity_id
              AND activity_incoming_data.activity_id = NEW.activity_id;
            RETURN NEW;
        END
        $$;
        CREATE FUNCTION invasivesbc.short_id_update() RETURNS trigger
            LANGUAGE plpgsql
        AS
        $$
        BEGIN
            WITH short_payload AS (SELECT activity_id                     AS id,
                                          activity_payload ->> 'short_id' AS short_id
                                   FROM invasivesbc.activity_incoming_data
                                   where activity_id = NEW.activity_id)
            UPDATE
                invasivesbc.activity_incoming_data
            SET short_id = sp.short_id
            FROM short_payload sp
            WHERE activity_id = sp.id
              AND activity_incoming_data_id = NEW.activity_incoming_data_id;
            RETURN NEW;
        END
        $$;
        CREATE FUNCTION invasivesbc.update_cache_version() RETURNS trigger
            LANGUAGE plpgsql
        AS
        $$
        begin
            set search_path = invasivesbc,public;
            INSERT INTO cache_versions(cache_name, updated_at)
            values (TG_ARGV[0], current_timestamp)
            on conflict (cache_name) do update set updated_at = current_timestamp;

            RETURN NULL;
        END;
        $$;
        CREATE FUNCTION invasivesbc.update_created_by_on_activity_updates_function() RETURNS trigger
            LANGUAGE plpgsql
        AS
        $$
        BEGIN
            UPDATE invasivesbc.activity_incoming_data
            SET created_by = (SELECT created_by
                              FROM invasivesbc.activity_incoming_data
                              WHERE NEW.activity_id = activity_id
                                AND created_by IS NOT null
                              ORDER BY created_timestamp ASC
                              LIMIT 1)
            WHERE activity_id = new.activity_id
              AND NEW.created_by is null;
            RETURN new;
        END
        $$;
        CREATE FUNCTION invasivesbc.update_iscurrent() RETURNS trigger
            LANGUAGE plpgsql
        AS
        $$
        begin
            if new.deleted_timestamp is not null then
                new.iscurrent = false;
            end if;
            return new;
        end;
        $$;

        CREATE FUNCTION public.convert_string_list_to_array_elements(text)
            RETURNS TABLE
                    (
                        f1 text
                    )
            LANGUAGE sql
        AS
        $_$
        SELECT unnest(('{' || $1::text || '}')::text[]);
        $_$;
        CREATE FUNCTION public.st_intersects2(geog1 public.geography, geog2 public.geography) RETURNS boolean
            LANGUAGE sql
            IMMUTABLE
        AS
        $_$
        SELECT $1 && $2 AND ST_Intersects($1, $2)
        $_$;
        CREATE FUNCTION public.st_intersects2(geom1 public.geometry, geom2 public.geometry) RETURNS boolean
            LANGUAGE sql
            IMMUTABLE
        AS
        $_$
        SELECT $1 && $2 AND _ST_Intersects($1, $2)
        $_$;
        SET default_tablespace = '';
        SET default_table_access_method = heap;
        CREATE TABLE invasivesbc.access_request
        (
            access_request_id    integer                                                                    NOT NULL,
            idir_account_name    character varying(100),
            bceid_account_name   character varying(100),
            first_name           character varying(50)                                                      NOT NULL,
            last_name            character varying(50)                                                      NOT NULL,
            primary_email        character varying(100)                                                     NOT NULL,
            work_phone_number    character varying(25),
            funding_agencies     character varying(1000),
            pac_number           integer,
            employer             character varying(100),
            pac_service_number_1 character varying(1000),
            pac_service_number_2 character varying(1000),
            comments             character varying(1000),
            status               character varying(100)      DEFAULT 'Awaiting Approval'::character varying NOT NULL,
            requested_roles      character varying(1000),
            idir_userid          character varying(100),
            bceid_userid         character varying(100),
            created_at           timestamp without time zone DEFAULT now(),
            updated_at           timestamp without time zone DEFAULT now(),
            request_type         character varying(15)       DEFAULT 'ACCESS'::character varying
        );
        CREATE SEQUENCE invasivesbc.access_request_access_request_id_seq
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;
        ALTER SEQUENCE invasivesbc.access_request_access_request_id_seq OWNED BY invasivesbc.access_request.access_request_id;
        CREATE TABLE invasivesbc.activity_incoming_data
        (
            activity_incoming_data_id                    integer                                   NOT NULL,
            activity_id                                  uuid,
            version                                      integer,
            activity_type                                character varying(200),
            activity_subtype                             character varying(200),
            created_timestamp                            timestamp without time zone DEFAULT now() NOT NULL,
            received_timestamp                           timestamp without time zone DEFAULT now() NOT NULL,
            deleted_timestamp                            timestamp without time zone,
            geom                                         public.geometry(Geometry, 3005),
            geog                                         public.geography(Geometry, 4326),
            media_keys                                   text[],
            activity_payload                             jsonb,
            biogeoclimatic_zones                         character varying(30),
            regional_invasive_species_organization_areas character varying(100),
            invasive_plant_management_areas              character varying(100),
            ownership                                    character varying(100),
            regional_districts                           character varying(100),
            flnro_districts                              character varying(100),
            moti_districts                               character varying(100),
            elevation                                    integer,
            well_proximity                               integer,
            utm_zone                                     integer,
            utm_northing                                 real,
            utm_easting                                  real,
            albers_northing                              real,
            albers_easting                               real,
            created_by                                   character varying(100),
            form_status                                  character varying(100)      DEFAULT 'Not Validated'::character varying,
            sync_status                                  character varying(100)      DEFAULT 'Save Successful'::character varying,
            review_status                                character varying(100)      DEFAULT 'Not Reviewed'::character varying,
            reviewed_by                                  character varying(100),
            reviewed_at                                  timestamp without time zone,
            species_positive                             jsonb,
            species_negative                             jsonb,
            jurisdiction                                 character varying[]         DEFAULT '{}'::character varying[],
            updated_by                                   character varying(100),
            species_treated                              jsonb,
            species_positive_full                        text,
            species_negative_full                        text,
            species_treated_full                         text,
            agency                                       text,
            jurisdiction_display                         text,
            short_id                                     text,
            created_by_with_guid                         text,
            updated_by_with_guid                         text,
            activity_subtype_full                        text,
            batch_id                                     integer,
            row_number                                   integer,
            species_biocontrol_full                      text,
            iscurrent                                    boolean                     DEFAULT true  NOT NULL,
            CONSTRAINT activity_incoming_data_geom_check CHECK (public.st_isvalid(geom))
        );
        COMMENT ON TABLE invasivesbc.activity_incoming_data IS 'Store all incoming data if valid. All mandatory columns must be preset (type & geometry). This is a staging area for further propagation and acts as a source of truth for all field data.';
        COMMENT ON COLUMN invasivesbc.activity_incoming_data.activity_incoming_data_id IS 'Auto generated primary key';
        COMMENT ON COLUMN invasivesbc.activity_incoming_data.activity_id IS 'Unique record number. Can occur multiple times with record updates.';
        COMMENT ON COLUMN invasivesbc.activity_incoming_data.version IS 'Indicative of the version for each unique record. Calculated server side.';
        COMMENT ON COLUMN invasivesbc.activity_incoming_data.activity_type IS 'Type of record';
        COMMENT ON COLUMN invasivesbc.activity_incoming_data.activity_subtype IS 'Sub Type of record';
        COMMENT ON COLUMN invasivesbc.activity_incoming_data.created_timestamp IS 'The date and time data was created on the users device.';
        COMMENT ON COLUMN invasivesbc.activity_incoming_data.received_timestamp IS 'The date and time data was received and inserted into the database.';
        COMMENT ON COLUMN invasivesbc.activity_incoming_data.deleted_timestamp IS 'The date and time the record was marked as deleted. Also used to indicate old versions. Calculated server side.';
        COMMENT ON COLUMN invasivesbc.activity_incoming_data.geom IS 'Geometry in Albers projection.';
        COMMENT ON COLUMN invasivesbc.activity_incoming_data.geog IS 'Geography type containing a geometry.';
        COMMENT ON COLUMN invasivesbc.activity_incoming_data.media_keys IS 'Array of keys used to fetch original files from external storage';
        COMMENT ON COLUMN invasivesbc.activity_incoming_data.activity_payload IS 'Raw data upload in compressed JSON format.';
        COMMENT ON COLUMN invasivesbc.activity_incoming_data.biogeoclimatic_zones IS 'Biogeoclimatic Ecosystem Classification (BEC) Zone/Subzone/Variant/Phase';
        COMMENT ON COLUMN invasivesbc.activity_incoming_data.regional_invasive_species_organization_areas IS 'Regional Invasive Species Organizations (RISO) are non-profit societies in BC that provide invasive species education and management under the collective Invasive Species Council of BC.';
        COMMENT ON COLUMN invasivesbc.activity_incoming_data.invasive_plant_management_areas IS 'Regional Invasive Species Organizations (RISO) are non-profit societies in BC that provide invasive species education and management under the collective Invasive Species Council of BC. Within several RISO areas, they subdivide the land area in smaller management areas (Invasive Plant Management Areas).';
        COMMENT ON COLUMN invasivesbc.activity_incoming_data.ownership IS 'The information is sourced from the Crown Land Registry which is the primary government record of lands transferred out of Crown Provincial ownership (as defined under the Land Act).';
        COMMENT ON COLUMN invasivesbc.activity_incoming_data.regional_districts IS 'Regional districts of British Columbia: https://catalogue.data.gov.bc.ca/dataset/d1aff64e-dbfe-45a6-af97-582b7f6418b9';
        COMMENT ON COLUMN invasivesbc.activity_incoming_data.flnro_districts IS 'Ministry of Forest Lands and Natural Resources districts';
        COMMENT ON COLUMN invasivesbc.activity_incoming_data.moti_districts IS 'Ministry of Transportation and Infrastructure districts';
        COMMENT ON COLUMN invasivesbc.activity_incoming_data.elevation IS 'Corporate provincial digital Biogeoclimatic Ecosystem Classification (BEC) Zone/Subzone/Variant/Phase map';
        COMMENT ON COLUMN invasivesbc.activity_incoming_data.well_proximity IS 'Distance to the closest well in metres.';
        COMMENT ON COLUMN invasivesbc.activity_incoming_data.utm_zone IS 'Northern hemisphere UTM zone number.';
        COMMENT ON COLUMN invasivesbc.activity_incoming_data.utm_northing IS 'Northern hemisphere UTM Y coordinate in metres.';
        COMMENT ON COLUMN invasivesbc.activity_incoming_data.utm_easting IS 'Northern hemisphere UTM X coordinate in metres.';
        COMMENT ON COLUMN invasivesbc.activity_incoming_data.albers_northing IS 'Albers Y coordinate in metres.';
        COMMENT ON COLUMN invasivesbc.activity_incoming_data.albers_easting IS 'Albers X coordinate in metres.';
        COMMENT ON COLUMN invasivesbc.activity_incoming_data.created_by IS 'Identifier of the author of an activity';
        COMMENT ON COLUMN invasivesbc.activity_incoming_data.form_status IS 'Validation status of the activity form';
        COMMENT ON COLUMN invasivesbc.activity_incoming_data.sync_status IS 'Sync/Save status of the activity form';
        COMMENT ON COLUMN invasivesbc.activity_incoming_data.review_status IS 'Indicator of whether the activity is up for review by administrators';
        COMMENT ON COLUMN invasivesbc.activity_incoming_data.reviewed_by IS 'Identifier of the latest reviewer approving an activity for wide usage';
        COMMENT ON COLUMN invasivesbc.activity_incoming_data.reviewed_at IS 'Timestamp of when the activity was last reviewed';
        CREATE VIEW invasivesbc.activity_current AS
        SELECT activity_incoming_data.activity_id,
               max(activity_incoming_data.activity_incoming_data_id) AS incoming_data_id
        FROM invasivesbc.activity_incoming_data
        WHERE (activity_incoming_data.deleted_timestamp IS NULL)
        GROUP BY activity_incoming_data.activity_id;
        CREATE TABLE invasivesbc.code
        (
            code_id            integer                                NOT NULL,
            code_header_id     integer,
            code_name          character varying(40)                  NOT NULL,
            code_description   character varying(300)                 NOT NULL,
            code_sort_order    integer,
            valid_from         timestamp with time zone DEFAULT now() NOT NULL,
            valid_to           timestamp with time zone,
            created_at         timestamp with time zone DEFAULT now() NOT NULL,
            updated_at         timestamp with time zone DEFAULT now(),
            created_by_user_id integer                                NOT NULL,
            updated_by_user_id integer                                NOT NULL
        );
        CREATE TABLE invasivesbc.code_header
        (
            code_header_id          integer                                NOT NULL,
            code_category_id        integer,
            code_header_name        character varying(100)                 NOT NULL,
            code_header_title       character varying(40),
            code_header_description character varying(4096),
            valid_from              timestamp with time zone DEFAULT now() NOT NULL,
            valid_to                timestamp with time zone,
            created_at              timestamp with time zone DEFAULT now() NOT NULL,
            updated_at              timestamp with time zone DEFAULT now(),
            created_by_user_id      integer                                NOT NULL,
            updated_by_user_id      integer                                NOT NULL
        );
        CREATE VIEW invasivesbc.current_negative_observations AS
        WITH spatial_explode_negative AS (SELECT activity_incoming_data.activity_type,
                                                 activity_incoming_data.activity_subtype,
                                                 activity_incoming_data.created_timestamp,
                                                 activity_incoming_data.activity_incoming_data_id,
                                                 jsonb_array_elements(activity_incoming_data.species_negative)     AS species,
                                                 public.st_makevalid(public.geometry(activity_incoming_data.geog)) AS geom
                                          FROM invasivesbc.activity_incoming_data
                                          WHERE (((activity_incoming_data.activity_type)::text = 'Observation'::text) AND
                                                 ((activity_incoming_data.form_status)::text = 'Submitted'::text) AND
                                                 (activity_incoming_data.activity_incoming_data_id IN
                                                  (SELECT activity_current.incoming_data_id
                                                   FROM invasivesbc.activity_current)) AND
                                                 (activity_incoming_data.species_negative IS NOT NULL) AND
                                                 ((activity_incoming_data.species_negative)::text !~~ '[null]'::text) AND
                                                 ((activity_incoming_data.species_negative)::text !~~ 'null'::text))),
             spatial_negative AS (SELECT spatial_explode_negative.activity_type,
                                         spatial_explode_negative.activity_subtype,
                                         spatial_explode_negative.created_timestamp,
                                         spatial_explode_negative.activity_incoming_data_id,
                                         spatial_explode_negative.species,
                                         CASE
                                             WHEN (public.st_geometrytype(spatial_explode_negative.geom) =
                                                   'ST_Point'::text)
                                                 THEN (public.st_buffer(
                                                     (spatial_explode_negative.geom)::public.geography,
                                                     (0.56425)::double precision,
                                                     'quad_segs=30'::text))::public.geometry
                                             ELSE spatial_explode_negative.geom
                                             END AS geom
                                  FROM spatial_explode_negative),
             spatial_explode_positive AS (SELECT activity_incoming_data.activity_subtype,
                                                 activity_incoming_data.created_timestamp,
                                                 activity_incoming_data.activity_incoming_data_id,
                                                 jsonb_array_elements(activity_incoming_data.species_positive)     AS species,
                                                 public.st_makevalid(public.geometry(activity_incoming_data.geog)) AS geom
                                          FROM invasivesbc.activity_incoming_data
                                          WHERE (((activity_incoming_data.activity_type)::text = 'Observation'::text) AND
                                                 ((activity_incoming_data.form_status)::text = 'Submitted'::text) AND
                                                 (activity_incoming_data.activity_incoming_data_id IN
                                                  (SELECT activity_current.incoming_data_id
                                                   FROM invasivesbc.activity_current)) AND
                                                 (activity_incoming_data.species_positive IS NOT NULL) AND
                                                 ((activity_incoming_data.species_positive)::text !~~ '[null]'::text) AND
                                                 ((activity_incoming_data.species_positive)::text !~~ 'null'::text))),
             spatial_positive AS (SELECT spatial_explode_positive.activity_subtype,
                                         spatial_explode_positive.created_timestamp,
                                         spatial_explode_positive.activity_incoming_data_id,
                                         spatial_explode_positive.species,
                                         CASE
                                             WHEN (public.st_geometrytype(spatial_explode_positive.geom) =
                                                   'ST_Point'::text)
                                                 THEN (public.st_buffer(
                                                     (spatial_explode_positive.geom)::public.geography,
                                                     (0.56425)::double precision,
                                                     'quad_segs=30'::text))::public.geometry
                                             ELSE spatial_explode_positive.geom
                                             END AS geom
                                  FROM spatial_explode_positive),
             spatial_positive_negative AS (SELECT row_number() OVER ()           AS ctid,
                                                  (neg.species #>> '{}'::text[]) AS species,
                                                  neg.activity_type,
                                                  neg.created_timestamp,
                                                  neg.activity_incoming_data_id,
                                                  CASE
                                                      WHEN public.st_intersects(neg.geom, pos.geom)
                                                          THEN public.st_difference(neg.geom, pos.geom)
                                                      ELSE neg.geom
                                                      END                        AS geom
                                           FROM (spatial_negative neg
                                               LEFT JOIN spatial_positive pos
                                                 ON ((public.st_intersects(neg.geom, pos.geom) AND
                                                      (neg.species = pos.species) AND
                                                      (neg.created_timestamp < pos.created_timestamp))))),
             spatial_full_overlap AS (SELECT t.activity_incoming_data_id,
                                             t.species,
                                             public.st_area((t.geom)::public.geography, true) AS area,
                                             t.geom,
                                             t.created_timestamp,
                                             t.activity_type
                                      FROM (spatial_positive_negative t
                                          JOIN (SELECT a.activity_incoming_data_id,
                                                       min(public.st_area((a.geom)::public.geography, true)) AS area
                                                FROM spatial_positive_negative a,
                                                     spatial_positive_negative b
                                                WHERE ((a.species = b.species) AND
                                                       public.st_contains(a.geom, b.geom) AND
                                                       (a.ctid <> b.ctid) AND
                                                       (a.activity_incoming_data_id = b.activity_incoming_data_id))
                                                GROUP BY a.activity_incoming_data_id) m
                                            ON ((t.activity_incoming_data_id = m.activity_incoming_data_id)))
                                      WHERE (public.st_area((t.geom)::public.geography, true) = m.area)),
             spatial_partial_overlap AS (SELECT a.activity_incoming_data_id,
                                                a.species,
                                                public.st_intersection(a.geom, b.geom) AS geom,
                                                a.created_timestamp,
                                                a.activity_type
                                         FROM spatial_positive_negative a,
                                              spatial_positive_negative b
                                         WHERE ((a.species = b.species) AND public.st_intersects(a.geom, b.geom) AND
                                                (a.ctid <> b.ctid) AND
                                                (a.activity_incoming_data_id = b.activity_incoming_data_id) AND
                                                (NOT (a.activity_incoming_data_id IN
                                                      (SELECT a_1.activity_incoming_data_id
                                                       FROM spatial_positive_negative a_1,
                                                            spatial_positive_negative b_1
                                                       WHERE ((a_1.species = b_1.species) AND
                                                              public.st_contains(a_1.geom, b_1.geom) AND
                                                              (a_1.ctid <> b_1.ctid) AND
                                                              (a_1.activity_incoming_data_id = b_1.activity_incoming_data_id))
                                                       GROUP BY a_1.activity_incoming_data_id))))
                                         GROUP BY a.activity_incoming_data_id, a.species, a.geom, b.geom,
                                                  a.created_timestamp,
                                                  a.activity_type),
             spatial_others AS (SELECT spatial_positive_negative.activity_incoming_data_id,
                                       spatial_positive_negative.species,
                                       spatial_positive_negative.geom,
                                       spatial_positive_negative.created_timestamp,
                                       spatial_positive_negative.activity_type
                                FROM spatial_positive_negative
                                WHERE (NOT (spatial_positive_negative.activity_incoming_data_id IN
                                            (SELECT a.activity_incoming_data_id
                                             FROM spatial_positive_negative a,
                                                  spatial_positive_negative b
                                             WHERE ((a.species = b.species) AND public.st_intersects(a.geom, b.geom) AND
                                                    (a.ctid <> b.ctid) AND
                                                    (a.activity_incoming_data_id = b.activity_incoming_data_id))
                                             GROUP BY a.activity_incoming_data_id)))
                                UNION
                                SELECT spatial_full_overlap.activity_incoming_data_id,
                                       spatial_full_overlap.species,
                                       spatial_full_overlap.geom,
                                       spatial_full_overlap.created_timestamp,
                                       spatial_full_overlap.activity_type
                                FROM spatial_full_overlap
                                UNION
                                SELECT spatial_partial_overlap.activity_incoming_data_id,
                                       spatial_partial_overlap.species,
                                       spatial_partial_overlap.geom,
                                       spatial_partial_overlap.created_timestamp,
                                       spatial_partial_overlap.activity_type
                                FROM spatial_partial_overlap),
             coalesce_invasive_plant AS (SELECT o.activity_incoming_data_id,
                                                o.species                                               AS species_code,
                                                COALESCE(invasive_plant_codes.code_description,
                                                         invasive_plant_aquatic_codes.code_description) AS invasive_plant,
                                                invasive_plant_codes.code_description                   AS terrestrial_invasive_plant,
                                                invasive_plant_aquatic_codes.code_description           AS aquatic_invasive_plant,
                                                o.geom,
                                                o.created_timestamp
                                         FROM ((((spatial_others o
                                             LEFT JOIN invasivesbc.code_header invasive_plant_code_header ON ((
                                                 ((invasive_plant_code_header.code_header_title)::text =
                                                  'invasive_plant_code'::text) AND
                                                 (invasive_plant_code_header.valid_to IS NULL))))
                                             LEFT JOIN invasivesbc.code invasive_plant_codes ON ((
                                                 (invasive_plant_codes.code_header_id =
                                                  invasive_plant_code_header.code_header_id) AND
                                                 (o.species = (invasive_plant_codes.code_name)::text))))
                                             LEFT JOIN invasivesbc.code_header invasive_plant_aquatic_code_header ON ((
                                                 ((invasive_plant_aquatic_code_header.code_header_title)::text =
                                                  'invasive_plant_aquatic_code'::text) AND
                                                 (invasive_plant_aquatic_code_header.valid_to IS NULL))))
                                             LEFT JOIN invasivesbc.code invasive_plant_aquatic_codes ON ((
                                                 (invasive_plant_aquatic_codes.code_header_id =
                                                  invasive_plant_aquatic_code_header.code_header_id) AND
                                                 (o.species = (invasive_plant_aquatic_codes.code_name)::text))))
                                         WHERE (public.st_area(o.geom) > (0)::double precision))
        SELECT coalesce_invasive_plant.activity_incoming_data_id,
               coalesce_invasive_plant.species_code,
               concat(coalesce_invasive_plant.activity_incoming_data_id, '-',
                      coalesce_invasive_plant.species_code) AS id_species,
               coalesce_invasive_plant.invasive_plant,
               coalesce_invasive_plant.geom,
               coalesce_invasive_plant.created_timestamp
        FROM coalesce_invasive_plant;
        CREATE VIEW invasivesbc.current_positive_observations AS
        WITH spatial_explode_positive AS (SELECT activity_incoming_data.activity_type,
                                                 activity_incoming_data.activity_subtype,
                                                 activity_incoming_data.created_timestamp,
                                                 activity_incoming_data.activity_incoming_data_id,
                                                 jsonb_array_elements(activity_incoming_data.species_positive)     AS species,
                                                 public.st_makevalid(public.geometry(activity_incoming_data.geog)) AS geom
                                          FROM invasivesbc.activity_incoming_data
                                          WHERE (((activity_incoming_data.activity_type)::text = 'Observation'::text) AND
                                                 ((activity_incoming_data.form_status)::text = 'Submitted'::text) AND
                                                 (activity_incoming_data.activity_incoming_data_id IN
                                                  (SELECT activity_current.incoming_data_id
                                                   FROM invasivesbc.activity_current)) AND
                                                 (activity_incoming_data.species_positive IS NOT NULL) AND
                                                 ((activity_incoming_data.species_positive)::text !~~ '[null]'::text) AND
                                                 ((activity_incoming_data.species_positive)::text !~~ 'null'::text))),
             spatial_positive AS (SELECT spatial_explode_positive.activity_type,
                                         spatial_explode_positive.activity_subtype,
                                         spatial_explode_positive.created_timestamp,
                                         spatial_explode_positive.activity_incoming_data_id,
                                         spatial_explode_positive.species,
                                         CASE
                                             WHEN (public.st_geometrytype(spatial_explode_positive.geom) =
                                                   'ST_Point'::text)
                                                 THEN (public.st_buffer(
                                                     (spatial_explode_positive.geom)::public.geography,
                                                     (0.56425)::double precision,
                                                     'quad_segs=30'::text))::public.geometry
                                             ELSE spatial_explode_positive.geom
                                             END AS geom
                                  FROM spatial_explode_positive),
             spatial_explode_negative AS (SELECT activity_incoming_data.activity_subtype,
                                                 activity_incoming_data.created_timestamp,
                                                 activity_incoming_data.activity_incoming_data_id,
                                                 jsonb_array_elements(activity_incoming_data.species_negative)     AS species,
                                                 public.st_makevalid(public.geometry(activity_incoming_data.geog)) AS geom
                                          FROM invasivesbc.activity_incoming_data
                                          WHERE (((activity_incoming_data.activity_type)::text = 'Observation'::text) AND
                                                 ((activity_incoming_data.form_status)::text = 'Submitted'::text) AND
                                                 (activity_incoming_data.activity_incoming_data_id IN
                                                  (SELECT activity_current.incoming_data_id
                                                   FROM invasivesbc.activity_current)) AND
                                                 (activity_incoming_data.species_negative IS NOT NULL) AND
                                                 ((activity_incoming_data.species_negative)::text !~~ '[null]'::text) AND
                                                 ((activity_incoming_data.species_negative)::text !~~ 'null'::text))),
             spatial_negative AS (SELECT spatial_explode_negative.activity_subtype,
                                         spatial_explode_negative.created_timestamp,
                                         spatial_explode_negative.activity_incoming_data_id,
                                         spatial_explode_negative.species,
                                         CASE
                                             WHEN (public.st_geometrytype(spatial_explode_negative.geom) =
                                                   'ST_Point'::text)
                                                 THEN (public.st_buffer(
                                                     (spatial_explode_negative.geom)::public.geography,
                                                     (0.56425)::double precision,
                                                     'quad_segs=30'::text))::public.geometry
                                             ELSE spatial_explode_negative.geom
                                             END AS geom
                                  FROM spatial_explode_negative),
             spatial_positive_negative AS (SELECT row_number() OVER ()           AS ctid,
                                                  (pos.species #>> '{}'::text[]) AS species,
                                                  pos.activity_type,
                                                  pos.created_timestamp,
                                                  pos.activity_incoming_data_id,
                                                  CASE
                                                      WHEN public.st_intersects(pos.geom, neg.geom)
                                                          THEN public.st_difference(pos.geom, neg.geom)
                                                      ELSE pos.geom
                                                      END                        AS geom
                                           FROM (spatial_positive pos
                                               LEFT JOIN spatial_negative neg
                                                 ON ((public.st_intersects(pos.geom, neg.geom) AND
                                                      (pos.species = neg.species) AND
                                                      (pos.created_timestamp < neg.created_timestamp))))),
             spatial_full_overlap AS (SELECT t.activity_incoming_data_id,
                                             t.species,
                                             public.st_area((t.geom)::public.geography, true) AS area,
                                             t.geom,
                                             t.created_timestamp,
                                             t.activity_type
                                      FROM (spatial_positive_negative t
                                          JOIN (SELECT a.activity_incoming_data_id,
                                                       min(public.st_area((a.geom)::public.geography, true)) AS area
                                                FROM spatial_positive_negative a,
                                                     spatial_positive_negative b
                                                WHERE ((a.species = b.species) AND
                                                       public.st_contains(a.geom, b.geom) AND
                                                       (a.ctid <> b.ctid) AND
                                                       (a.activity_incoming_data_id = b.activity_incoming_data_id))
                                                GROUP BY a.activity_incoming_data_id) m
                                            ON ((t.activity_incoming_data_id = m.activity_incoming_data_id)))
                                      WHERE (public.st_area((t.geom)::public.geography, true) = m.area)),
             spatial_partial_overlap AS (SELECT a.activity_incoming_data_id,
                                                a.species,
                                                public.st_intersection(a.geom, b.geom) AS geom,
                                                a.created_timestamp,
                                                a.activity_type
                                         FROM spatial_positive_negative a,
                                              spatial_positive_negative b
                                         WHERE ((a.species = b.species) AND public.st_intersects(a.geom, b.geom) AND
                                                (a.ctid <> b.ctid) AND
                                                (a.activity_incoming_data_id = b.activity_incoming_data_id) AND
                                                (NOT (a.activity_incoming_data_id IN
                                                      (SELECT a_1.activity_incoming_data_id
                                                       FROM spatial_positive_negative a_1,
                                                            spatial_positive_negative b_1
                                                       WHERE ((a_1.species = b_1.species) AND
                                                              public.st_contains(a_1.geom, b_1.geom) AND
                                                              (a_1.ctid <> b_1.ctid) AND
                                                              (a_1.activity_incoming_data_id = b_1.activity_incoming_data_id))
                                                       GROUP BY a_1.activity_incoming_data_id))))
                                         GROUP BY a.activity_incoming_data_id, a.species, a.geom, b.geom,
                                                  a.created_timestamp,
                                                  a.activity_type),
             spatial_others AS (SELECT spatial_positive_negative.activity_incoming_data_id,
                                       spatial_positive_negative.species,
                                       spatial_positive_negative.geom,
                                       spatial_positive_negative.created_timestamp,
                                       spatial_positive_negative.activity_type
                                FROM spatial_positive_negative
                                WHERE (NOT (spatial_positive_negative.activity_incoming_data_id IN
                                            (SELECT a.activity_incoming_data_id
                                             FROM spatial_positive_negative a,
                                                  spatial_positive_negative b
                                             WHERE ((a.species = b.species) AND public.st_intersects(a.geom, b.geom) AND
                                                    (a.ctid <> b.ctid) AND
                                                    (a.activity_incoming_data_id = b.activity_incoming_data_id))
                                             GROUP BY a.activity_incoming_data_id)))
                                UNION
                                SELECT spatial_full_overlap.activity_incoming_data_id,
                                       spatial_full_overlap.species,
                                       spatial_full_overlap.geom,
                                       spatial_full_overlap.created_timestamp,
                                       spatial_full_overlap.activity_type
                                FROM spatial_full_overlap
                                UNION
                                SELECT spatial_partial_overlap.activity_incoming_data_id,
                                       spatial_partial_overlap.species,
                                       spatial_partial_overlap.geom,
                                       spatial_partial_overlap.created_timestamp,
                                       spatial_partial_overlap.activity_type
                                FROM spatial_partial_overlap),
             coalesce_invasive_plant AS (SELECT o.activity_incoming_data_id,
                                                o.species                                               AS species_code,
                                                COALESCE(invasive_plant_codes.code_description,
                                                         invasive_plant_aquatic_codes.code_description) AS invasive_plant,
                                                invasive_plant_codes.code_description                   AS terrestrial_invasive_plant,
                                                invasive_plant_aquatic_codes.code_description           AS aquatic_invasive_plant,
                                                o.geom,
                                                o.created_timestamp
                                         FROM ((((spatial_others o
                                             LEFT JOIN invasivesbc.code_header invasive_plant_code_header ON ((
                                                 ((invasive_plant_code_header.code_header_title)::text =
                                                  'invasive_plant_code'::text) AND
                                                 (invasive_plant_code_header.valid_to IS NULL))))
                                             LEFT JOIN invasivesbc.code invasive_plant_codes ON ((
                                                 (invasive_plant_codes.code_header_id =
                                                  invasive_plant_code_header.code_header_id) AND
                                                 (o.species = (invasive_plant_codes.code_name)::text))))
                                             LEFT JOIN invasivesbc.code_header invasive_plant_aquatic_code_header ON ((
                                                 ((invasive_plant_aquatic_code_header.code_header_title)::text =
                                                  'invasive_plant_aquatic_code'::text) AND
                                                 (invasive_plant_aquatic_code_header.valid_to IS NULL))))
                                             LEFT JOIN invasivesbc.code invasive_plant_aquatic_codes ON ((
                                                 (invasive_plant_aquatic_codes.code_header_id =
                                                  invasive_plant_aquatic_code_header.code_header_id) AND
                                                 (o.species = (invasive_plant_aquatic_codes.code_name)::text))))
                                         WHERE (public.st_area(o.geom) > (0)::double precision))
        SELECT coalesce_invasive_plant.activity_incoming_data_id,
               coalesce_invasive_plant.species_code,
               concat(coalesce_invasive_plant.activity_incoming_data_id, '-',
                      coalesce_invasive_plant.species_code) AS id_species,
               coalesce_invasive_plant.invasive_plant,
               coalesce_invasive_plant.geom,
               coalesce_invasive_plant.created_timestamp
        FROM coalesce_invasive_plant;
        CREATE MATERIALIZED VIEW invasivesbc.activities_spatial AS
        WITH currentpositiveobservations AS (SELECT cpo.activity_incoming_data_id,
                                                    string_agg((cpo.invasive_plant)::text, ', '::text) AS current_positive_species
                                             FROM invasivesbc.current_positive_observations cpo
                                             GROUP BY cpo.activity_incoming_data_id),
             currentnegativeobservations AS (SELECT cno.activity_incoming_data_id,
                                                    string_agg((cno.invasive_plant)::text, ', '::text) AS current_negative_species
                                             FROM invasivesbc.current_negative_observations cno
                                             GROUP BY cno.activity_incoming_data_id)
        SELECT jsonb_build_object('type', 'Feature', 'properties',
                                  json_build_object('id', a.activity_id, 'type', a.activity_type, 'subtype',
                                                    a.activity_subtype,
                                                    'created', a.created_timestamp, 'bec', a.biogeoclimatic_zones,
                                                    'riso',
                                                    a.regional_invasive_species_organization_areas, 'ipma',
                                                    a.invasive_plant_management_areas, 'own', a.ownership,
                                                    'regionalDist',
                                                    a.regional_districts, 'flnroDist', a.flnro_districts, 'motiDist',
                                                    a.moti_districts, 'elev', a.elevation, 'wellProx', a.well_proximity,
                                                    'species_positive', a.species_positive, 'species_negative',
                                                    a.species_negative, 'species_treated', a.species_treated,
                                                    'jurisdiction',
                                                    ((((a.activity_payload)::json -> 'form_data'::text) ->
                                                      'activity_data'::text) -> 'jurisdictions'::text), 'reported_area',
                                                    ((((a.activity_payload)::json -> 'form_data'::text) ->
                                                      'activity_data'::text) -> 'reported_area'::text), 'short_id',
                                                    ((a.activity_payload)::json -> 'short_id'::text)), 'geometry',
                                  (public.st_asgeojson(a.geog))::jsonb) AS geojson
        FROM (invasivesbc.activity_incoming_data a
            JOIN invasivesbc.activity_current b ON ((a.activity_incoming_data_id = b.incoming_data_id)))
        WITH NO DATA;
        CREATE SEQUENCE invasivesbc.activity_incoming_data_activity_incoming_data_id_seq
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;
        ALTER SEQUENCE invasivesbc.activity_incoming_data_activity_incoming_data_id_seq OWNED BY invasivesbc.activity_incoming_data.activity_incoming_data_id;
        CREATE VIEW invasivesbc.activity_jurisdictions AS
        WITH jurisdictions AS (SELECT a_1.activity_incoming_data_id,
                                      jsonb_array_elements((a_1.activity_payload #>
                                                            '{form_data,activity_data,jurisdictions}'::text[])) AS jurisdictions_array
                               FROM (invasivesbc.activity_incoming_data a_1
                                   JOIN invasivesbc.activity_current b_1
                                     ON ((a_1.activity_incoming_data_id = b_1.incoming_data_id))))
        SELECT a.activity_id,
               a.activity_incoming_data_id,
               j.jurisdictions_array,
               btrim(((j.jurisdictions_array -> 'jurisdiction_code'::text))::text, '"'::text) AS jurisdiction_code,
               (btrim(((j.jurisdictions_array -> 'percent_covered'::text))::text,
                      '"'::text))::double precision                                           AS jurisdiction_percentage
        FROM ((invasivesbc.activity_incoming_data a
            JOIN invasivesbc.activity_current b ON ((a.activity_incoming_data_id = b.incoming_data_id)))
            LEFT JOIN jurisdictions j ON ((j.activity_incoming_data_id = a.activity_incoming_data_id)))
        ORDER BY a.activity_id DESC;
        CREATE VIEW invasivesbc.activity_monitoring_biological_terrestrialplant_with_codes AS
        SELECT activity_incoming_data.activity_id,
               btrim(
                       (((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) ->
                          'activity_subtype_data'::text) ->
                         'invasive_plant_code'::text))::text, '"'::text)      AS invasive_plant_code,
               btrim(
                       (((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) ->
                          'activity_subtype_data'::text) ->
                         'mechanical_method_code'::text))::text, '"'::text)   AS mechanical_method_code,
               btrim(
                       (((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) ->
                          'activity_subtype_data'::text) ->
                         'mechanical_disposal_code'::text))::text, '"'::text) AS mechanical_disposal_code,
               btrim(
                       (((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) ->
                          'activity_subtype_data'::text) ->
                         'root_removal_code'::text))::text, '"'::text)        AS root_removal_code,
               btrim(
                       (((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) ->
                          'activity_subtype_data'::text) ->
                         'soil_disturbance_code'::text))::text, '"'::text)    AS soil_disturbance_code,
               ((((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) ->
                   'activity_subtype_data'::text) ->
                  'signage_on_site'::text))::text)::boolean                   AS signage_on_site
        FROM invasivesbc.activity_incoming_data
        WHERE (((activity_incoming_data.activity_type)::text = 'Monitoring'::text) AND
               ((activity_incoming_data.activity_subtype)::text = 'Monitoring_BiologicalTerrestrialPlant'::text) AND
               (activity_incoming_data.deleted_timestamp IS NULL));
        COMMENT ON VIEW invasivesbc.activity_monitoring_biological_terrestrialplant_with_codes IS 'View on terrestrial plant mechanical treatments specific fields, with raw code table values';
        CREATE VIEW invasivesbc.activity_observation_aquaticplant_with_codes AS
        SELECT activity_incoming_data.activity_id,
               activity_incoming_data.version,
               btrim(
                       (((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) ->
                          'activity_subtype_data'::text) ->
                         'invasive_plant_code'::text))::text, '"'::text)       AS invasive_plant_code,
               btrim(
                       (((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) ->
                          'activity_subtype_data'::text) ->
                         'specific_use_code'::text))::text, '"'::text)         AS specific_use_code,
               btrim(
                       (((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) ->
                          'activity_subtype_data'::text) ->
                         'proposed_treatment_code'::text))::text, '"'::text)   AS proposed_treatment_code,
               ((((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) ->
                   'activity_subtype_data'::text) ->
                  'flowering'::text))::text)::boolean                          AS flowering,
               btrim(
                       (((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) ->
                          'activity_subtype_data'::text) ->
                         'plant_life_stage_code'::text))::text, '"'::text)     AS plant_life_stage_code,
               btrim(
                       (((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) ->
                          'activity_subtype_data'::text) ->
                         'plant_health_code'::text))::text, '"'::text)         AS plant_health_code,
               btrim(
                       (((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) ->
                          'activity_subtype_data'::text) ->
                         'plant_seed_stage_code'::text))::text, '"'::text)     AS plant_seed_stage_code,
               btrim(
                       (((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) ->
                          'activity_subtype_data'::text) ->
                         'range_unit_number'::text))::text, '"'::text)         AS range_unit_number,
               ((((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) ->
                   'activity_subtype_data'::text) ->
                  'legacy_site_ind'::text))::text)::boolean                    AS legacy_site_ind,
               ((((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) ->
                   'activity_subtype_data'::text) ->
                  'early_detection_rapid_resp_ind'::text))::text)::boolean     AS early_detection_rapid_resp_ind,
               ((((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) ->
                   'activity_subtype_data'::text) ->
                  'research_detection_ind'::text))::text)::boolean             AS research_detection_ind,
               btrim(
                       (((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) ->
                          'activity_subtype_data'::text) ->
                         'sample_point_number'::text))::text, '"'::text)       AS sample_point_number,
               ((((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) ->
                   'activity_subtype_data'::text) ->
                  'special_care_ind'::text))::text)::boolean                   AS special_care_ind,
               ((((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) ->
                   'activity_subtype_data'::text) ->
                  'biological_ind'::text))::text)::boolean                     AS biological_ind,
               ((((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) ->
                   'activity_subtype_data'::text) ->
                  'secchi_depth'::text))::text)::numeric                       AS secchi_depth,
               ((((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) ->
                   'activity_subtype_data'::text) ->
                  'water_depth'::text))::text)::numeric                        AS water_depth,
               ((((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) ->
                   'activity_subtype_data'::text) ->
                  'voucher_submitted_ind'::text))::text)::boolean              AS voucher_submitted_ind,
               btrim(
                       (((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) ->
                          'activity_subtype_data'::text) ->
                         'voucher_submission_detail'::text))::text, '"'::text) AS voucher_submission_detail
        FROM invasivesbc.activity_incoming_data
        WHERE (((activity_incoming_data.activity_type)::text = 'Observation'::text) AND
               ((activity_incoming_data.activity_subtype)::text = 'Activity_Observation_PlantAquatic'::text) AND
               (activity_incoming_data.deleted_timestamp IS NULL));
        COMMENT ON VIEW invasivesbc.activity_observation_aquaticplant_with_codes IS 'View on aquatic plant observation specific fields, with raw code table values';
        CREATE VIEW invasivesbc.activity_observation_terrestrialplant_with_codes AS
        SELECT activity_incoming_data.activity_id,
               activity_incoming_data.version,
               btrim(
                       (((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) ->
                          'activity_subtype_data'::text) ->
                         'invasive_plant_code'::text))::text, '"'::text)         AS invasive_plant_code,
               btrim(
                       (((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) ->
                          'activity_subtype_data'::text) ->
                         'invasive_plant_density_code'::text))::text, '"'::text) AS invasive_plant_density_code,
               btrim(
                       (((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) ->
                          'activity_subtype_data'::text) ->
                         'invasive_plant_distribution_code'::text))::text,
                       '"'::text)                                                AS invasive_plant_distribution_code,
               btrim(
                       (((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) ->
                          'activity_subtype_data'::text) ->
                         'soil_texture_code'::text))::text, '"'::text)           AS soil_texture_code,
               btrim(
                       (((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) ->
                          'activity_subtype_data'::text) ->
                         'specific_use_code'::text))::text, '"'::text)           AS specific_use_code,
               btrim(
                       (((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) ->
                          'activity_subtype_data'::text) ->
                         'slope_code'::text))::text, '"'::text)                  AS slope_code,
               btrim(
                       (((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) ->
                          'activity_subtype_data'::text) ->
                         'aspect_code'::text))::text, '"'::text)                 AS aspect_code,
               btrim(
                       (((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) ->
                          'activity_subtype_data'::text) ->
                         'proposed_treatment_code'::text))::text, '"'::text)     AS proposed_treatment_code,
               btrim(
                       (((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) ->
                          'activity_subtype_data'::text) ->
                         'range_unit_number'::text))::text, '"'::text)           AS range_unit_number,
               btrim(
                       (((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) ->
                          'activity_subtype_data'::text) ->
                         'plant_life_stage_code'::text))::text, '"'::text)       AS plant_life_stage_code,
               btrim(
                       (((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) ->
                          'activity_subtype_data'::text) ->
                         'plant_health_code'::text))::text, '"'::text)           AS plant_health_code,
               btrim(
                       (((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) ->
                          'activity_subtype_data'::text) ->
                         'plant_seed_stage_code'::text))::text, '"'::text)       AS plant_seed_stage_code,
               ((((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) ->
                   'activity_subtype_data'::text) ->
                  'flowering'::text))::text)::boolean                            AS flowering,
               ((((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) ->
                   'activity_subtype_data'::text) ->
                  'legacy_site_ind'::text))::text)::boolean                      AS legacy_site_ind,
               ((((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) ->
                   'activity_subtype_data'::text) ->
                  'early_detection_rapid_resp_ind'::text))::text)::boolean       AS early_detection_rapid_resp_ind,
               ((((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) ->
                   'activity_subtype_data'::text) ->
                  'research_detection_ind'::text))::text)::boolean               AS research_detection_ind,
               ((((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) ->
                   'activity_subtype_data'::text) ->
                  'well_ind'::text))::text)::boolean                             AS well_ind,
               ((((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) ->
                   'activity_subtype_data'::text) ->
                  'special_care_ind'::text))::text)::boolean                     AS special_care_ind,
               ((((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) ->
                   'activity_subtype_data'::text) ->
                  'biological_ind'::text))::text)::boolean                       AS biological_ind
        FROM invasivesbc.activity_incoming_data
        WHERE (((activity_incoming_data.activity_type)::text = 'Observation'::text) AND
               ((activity_incoming_data.activity_subtype)::text = 'Activity_Observation_PlantTerrestrial'::text) AND
               (activity_incoming_data.deleted_timestamp IS NULL));
        COMMENT ON VIEW invasivesbc.activity_observation_terrestrialplant_with_codes IS 'View on terrestrial plant observation specific fields, with raw code table values';
        CREATE TABLE invasivesbc.activity_subtype_mapping
        (
            mapping_id   integer NOT NULL,
            form_subtype character varying(100),
            full_subtype character varying(100)
        );
        CREATE SEQUENCE invasivesbc.activity_subtype_mapping_mapping_id_seq
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;
        ALTER SEQUENCE invasivesbc.activity_subtype_mapping_mapping_id_seq OWNED BY invasivesbc.activity_subtype_mapping.mapping_id;
        CREATE VIEW invasivesbc.activity_treatment_biological_terrestrialplant_with_codes AS
        SELECT activity_incoming_data.activity_id,
               btrim(
                       (((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) ->
                          'activity_subtype_data'::text) ->
                         'invasive_plant_code'::text))::text, '"'::text)           AS invasive_plant_code,
               btrim(
                       (((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) ->
                          'activity_subtype_data'::text) ->
                         'classified_area_code'::text))::text, '"'::text)          AS classified_area_code,
               ((((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) ->
                   'activity_subtype_data'::text) ->
                  'applicator1_licence_number'::text))::text)::integer             AS applicator1_licence_number,
               btrim(
                       (((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) ->
                          'activity_subtype_data'::text) ->
                         'agent_source'::text))::text, '"'::text)                  AS agent_source,
               btrim(
                       (((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) ->
                          'activity_subtype_data'::text) ->
                         'biological_agent_code'::text))::text, '"'::text)         AS biological_agent_code,
               btrim(
                       (((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) ->
                          'activity_subtype_data'::text) ->
                         'biological_agent_stage_code'::text))::text, '"'::text)   AS biological_agent_stage_code,
               btrim(
                       (((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) ->
                          'activity_subtype_data'::text) ->
                         'bioagent_maturity_status_code'::text))::text, '"'::text) AS bioagent_maturity_status_code
        FROM invasivesbc.activity_incoming_data
        WHERE (((activity_incoming_data.activity_type)::text = 'Treatment'::text) AND
               ((activity_incoming_data.activity_subtype)::text = 'Treatment_BiologicalPlant'::text) AND
               (activity_incoming_data.deleted_timestamp IS NULL));
        COMMENT ON VIEW invasivesbc.activity_treatment_biological_terrestrialplant_with_codes IS 'View on terrestrial plant biological treatments specific fields, with raw code table values';
        CREATE VIEW invasivesbc.activity_treatment_chemical_terrestrialplant_with_codes AS
        SELECT activity_incoming_data.activity_id,
               btrim(
                       (((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) ->
                          'activity_subtype_data'::text) ->
                         'applicator1_first_name'::text))::text, '"'::text)   AS applicator1_first_name,
               btrim(
                       (((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) ->
                          'activity_subtype_data'::text) ->
                         'applicator1_last_name'::text))::text, '"'::text)    AS applicator1_last_name,
               ((((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) ->
                   'activity_subtype_data'::text) ->
                  'applicator1_licence_number'::text))::text)::integer        AS applicator1_licence_number,
               btrim(
                       (((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) ->
                          'activity_subtype_data'::text) ->
                         'applicator2_first_name'::text))::text, '"'::text)   AS applicator2_first_name,
               btrim(
                       (((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) ->
                          'activity_subtype_data'::text) ->
                         'applicator2_last_name'::text))::text, '"'::text)    AS applicator2_last_name,
               ((((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) ->
                   'activity_subtype_data'::text) ->
                  'applicator2_licence_number'::text))::text)::numeric        AS applicator2_licence_number,
               btrim(
                       (((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) ->
                          'activity_subtype_data'::text) ->
                         'pesticide_employer_code'::text))::text, '"'::text)  AS pesticide_employer_code,
               btrim(
                       (((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) ->
                          'activity_subtype_data'::text) ->
                         'pesticide_use_permit_PUP'::text))::text, '"'::text) AS pesticide_use_permit_pup,
               btrim(
                       (((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) ->
                          'activity_subtype_data'::text) ->
                         'pest_management_plan'::text))::text, '"'::text)     AS pest_management_plan,
               btrim(
                       (((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) ->
                          'activity_subtype_data'::text) ->
                         'treatment_issues_code'::text))::text, '"'::text)    AS treatment_issues_code,
               btrim(
                       (((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) ->
                          'activity_subtype_data'::text) ->
                         'chemical_method_code'::text))::text, '"'::text)     AS chemical_method_code,
               ((((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) ->
                   'activity_subtype_data'::text) ->
                  'temperature'::text))::text)::integer                       AS temperature,
               ((((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) ->
                   'activity_subtype_data'::text) ->
                  'wind_speed'::text))::text)::integer                        AS wind_speed,
               btrim(
                       (((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) ->
                          'activity_subtype_data'::text) ->
                         'wind_direction_code'::text))::text, '"'::text)      AS wind_direction_code,
               ((((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) ->
                   'activity_subtype_data'::text) ->
                  'humidity'::text))::text)::integer                          AS humidity
        FROM invasivesbc.activity_incoming_data
        WHERE (((activity_incoming_data.activity_type)::text = 'Treatment'::text) AND
               ((activity_incoming_data.activity_subtype)::text = 'Activity_Treatment_ChemicalPlant'::text) AND
               (activity_incoming_data.deleted_timestamp IS NULL));
        COMMENT ON VIEW invasivesbc.activity_treatment_chemical_terrestrialplant_with_codes IS 'View on terrestrial plant chemical treatments specific fields, with raw code table values';
        CREATE VIEW invasivesbc.activity_treatment_mechanical_terrestrialplant_with_codes AS
        SELECT activity_incoming_data.activity_id,
               btrim(
                       (((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) ->
                          'activity_subtype_data'::text) ->
                         'invasive_plant_code'::text))::text, '"'::text)      AS invasive_plant_code,
               btrim(
                       (((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) ->
                          'activity_subtype_data'::text) ->
                         'mechanical_method_code'::text))::text, '"'::text)   AS mechanical_method_code,
               btrim(
                       (((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) ->
                          'activity_subtype_data'::text) ->
                         'mechanical_disposal_code'::text))::text, '"'::text) AS mechanical_disposal_code,
               btrim(
                       (((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) ->
                          'activity_subtype_data'::text) ->
                         'root_removal_code'::text))::text, '"'::text)        AS root_removal_code,
               btrim(
                       (((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) ->
                          'activity_subtype_data'::text) ->
                         'soil_disturbance_code'::text))::text, '"'::text)    AS soil_disturbance_code,
               ((((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) ->
                   'activity_subtype_data'::text) ->
                  'signage_on_site'::text))::text)::boolean                   AS signage_on_site
        FROM invasivesbc.activity_incoming_data
        WHERE (((activity_incoming_data.activity_type)::text = 'Treatment'::text) AND
               ((activity_incoming_data.activity_subtype)::text = 'Treatment_MechanicalPlant'::text) AND
               (activity_incoming_data.deleted_timestamp IS NULL));
        COMMENT ON VIEW invasivesbc.activity_treatment_mechanical_terrestrialplant_with_codes IS 'View on terrestrial plant mechanical treatments specific fields, with raw code table values';
        CREATE TABLE invasivesbc.admin_defined_shapes
        (
            id         integer                                   NOT NULL,
            visible    boolean                     DEFAULT true  NOT NULL,
            created_at timestamp without time zone DEFAULT now() NOT NULL,
            created_by character varying(100),
            title      character varying(100),
            geog       public.geography(Geometry, 4326)
        );
        COMMENT ON COLUMN invasivesbc.admin_defined_shapes.visible IS 'show or hide this shape';
        COMMENT ON COLUMN invasivesbc.admin_defined_shapes.created_at IS 'creation timestamp';
        COMMENT ON COLUMN invasivesbc.admin_defined_shapes.created_by IS 'ID of uploading user or null if system/unknown';
        CREATE SEQUENCE invasivesbc.admin_defined_shapes_id_seq
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;
        ALTER SEQUENCE invasivesbc.admin_defined_shapes_id_seq OWNED BY invasivesbc.admin_defined_shapes.id;
        CREATE TABLE invasivesbc.application_user
        (
            user_id              integer                NOT NULL,
            first_name           character varying(100),
            last_name            character varying(100),
            email                character varying(300) NOT NULL,
            preferred_username   character varying(300) NOT NULL,
            account_status       smallint                    DEFAULT 1,
            expiry_date          date,
            activation_status    smallint                    DEFAULT 0,
            active_session_id    integer,
            created_at           timestamp without time zone DEFAULT now(),
            updated_at           timestamp without time zone DEFAULT now(),
            idir_userid          character varying(100),
            bceid_userid         character varying(100),
            idir_account_name    character varying(100),
            bceid_account_name   character varying(100),
            work_phone_number    character varying(100),
            funding_agencies     character varying(1000),
            employer             character varying(100),
            pac_number           integer,
            pac_service_number_1 character varying(100),
            pac_service_number_2 character varying(100),
            v2beta               boolean                     DEFAULT false
        );
        COMMENT ON TABLE invasivesbc.application_user IS 'User of the application is a person with valid IDR or BCeID. Default role of the user is Viewer of InvasiveBC data records. Other typical user types are admin, subject matter expert (sme/ or data editor)';
        COMMENT ON COLUMN invasivesbc.application_user.user_id IS 'Auto generated primary key. Uniquely identify user';
        COMMENT ON COLUMN invasivesbc.application_user.first_name IS 'First name of the user';
        COMMENT ON COLUMN invasivesbc.application_user.last_name IS 'Last name of the user';
        COMMENT ON COLUMN invasivesbc.application_user.email IS 'Email address of user';
        COMMENT ON COLUMN invasivesbc.application_user.preferred_username IS 'IDR of BCeID associated with user';
        COMMENT ON COLUMN invasivesbc.application_user.account_status IS 'Status of user account. This application level enum flag values. 0 => Inactive, 1 => Active, 2 => Suspended. Currently this values are managed by application, no code table for business';
        COMMENT ON COLUMN invasivesbc.application_user.expiry_date IS 'Expiry date of the account';
        COMMENT ON COLUMN invasivesbc.application_user.activation_status IS 'Flag to check account is active or not';
        COMMENT ON COLUMN invasivesbc.application_user.active_session_id IS 'Reference to active session table. This is non referential colum to create soft link to user_session table. This column will used to keep track current active session of the user';
        COMMENT ON COLUMN invasivesbc.application_user.created_at IS 'Timestamp column to check creation time of record';
        COMMENT ON COLUMN invasivesbc.application_user.updated_at IS 'Timestamp column to check modify time of record';
        CREATE SEQUENCE invasivesbc.application_user_user_id_seq
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;
        ALTER SEQUENCE invasivesbc.application_user_user_id_seq OWNED BY invasivesbc.application_user.user_id;
        CREATE TABLE invasivesbc.batch_uploads
        (
            id                  integer                                                                                    NOT NULL,
            csv_data            text,
            status              invasivesbc.batch_upload_status DEFAULT 'NEW'::invasivesbc.batch_upload_status             NOT NULL,
            validation_messages jsonb,
            created_at          timestamp without time zone     DEFAULT now()                                              NOT NULL,
            json_representation jsonb,
            template            character varying(255)          DEFAULT 'observation_terrestrial_plant'::character varying NOT NULL,
            created_by          integer
        );
        COMMENT ON COLUMN invasivesbc.batch_uploads.json_representation IS 'JSON representation of the original CSV';
        CREATE SEQUENCE invasivesbc.batch_uploads_id_seq
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;
        ALTER SEQUENCE invasivesbc.batch_uploads_id_seq OWNED BY invasivesbc.batch_uploads.id;
        CREATE TABLE invasivesbc.bc_large_grid
        (
            id  integer                          NOT NULL,
            geo public.geography(Geometry, 4326) NOT NULL
        );
        CREATE TABLE invasivesbc.bc_small_grid
        (
            id                 integer                          NOT NULL,
            geo                public.geography(Geometry, 4326) NOT NULL,
            large_grid_item_id integer                          NOT NULL
        );
        CREATE SEQUENCE invasivesbc.bc_small_grid_id_seq
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;
        ALTER SEQUENCE invasivesbc.bc_small_grid_id_seq OWNED BY invasivesbc.bc_small_grid.id;
        CREATE VIEW invasivesbc.biocontrol_collection_summary AS
        WITH array_elements AS (SELECT activity_incoming_data.activity_incoming_data_id,
                                       activity_incoming_data.activity_subtype,
                                       jurisdictions_array.value AS jurisdictions_array,
                                       project_code_array.value  AS project_code_array,
                                       person_array.value        AS person_array,
                                       funding_list.f1           AS funding_list
                                FROM ((((invasivesbc.activity_incoming_data
                                    LEFT JOIN LATERAL jsonb_array_elements((activity_incoming_data.activity_payload #>
                                                                            '{form_data,activity_data,jurisdictions}'::text[])) jurisdictions_array(value)
                                         ON (true))
                                    LEFT JOIN LATERAL jsonb_array_elements((activity_incoming_data.activity_payload #>
                                                                            '{form_data,activity_data,project_code}'::text[])) project_code_array(value)
                                        ON (true))
                                    LEFT JOIN LATERAL jsonb_array_elements((activity_incoming_data.activity_payload #>
                                                                            '{form_data,activity_type_data,activity_persons}'::text[])) person_array(value)
                                       ON (true))
                                    LEFT JOIN LATERAL public.convert_string_list_to_array_elements((
                                            activity_incoming_data.activity_payload #>>
                                            '{form_data,activity_data,invasive_species_agency_code}'::text[])) funding_list(f1)
                                      ON (true))
                                WHERE ((activity_incoming_data.activity_incoming_data_id IN
                                        (SELECT activity_current.incoming_data_id
                                         FROM invasivesbc.activity_current)) AND
                                       ((activity_incoming_data.form_status)::text = 'Submitted'::text) AND
                                       (activity_incoming_data.deleted_timestamp IS NULL) AND
                                       ((activity_incoming_data.activity_subtype)::text =
                                        'Activity_Biocontrol_Collection'::text))),
             array_aggregate AS (SELECT a.activity_incoming_data_id,
                                        string_agg(DISTINCT (a.project_code_array #>> '{description}'::text[]),
                                                   ', '::text) AS project,
                                        string_agg(DISTINCT (a.person_array #>> '{person_name}'::text[]),
                                                   ', '::text) AS person_name,
                                        string_agg(DISTINCT
                                                   CASE
                                                       WHEN ((a.person_array #>> '{applicator_license}'::text[]) IS NOT NULL)
                                                           THEN concat((a.person_array #>> '{person_name}'::text[]),
                                                                       ', ',
                                                                       (a.person_array #>> '{applicator_license}'::text[]))
                                                       ELSE (a.person_array #>> '{person_name}'::text[])
                                                       END,
                                                   ', '::text) AS treatment_person_name,
                                        string_agg(DISTINCT concat(jurisdiction_codes.code_description, ' ',
                                                                   ((a.jurisdictions_array #>> '{percent_covered}'::text[]) || '%'::text)),
                                                   ', '::text) AS jurisdiction,
                                        string_agg(DISTINCT (invasive_species_agency_codes.code_description)::text,
                                                   ', '::text) AS funding_agency
                                 FROM ((((array_elements a
                                     LEFT JOIN invasivesbc.code_header jurisdiction_code_header ON ((
                                         ((jurisdiction_code_header.code_header_title)::text =
                                          'jurisdiction_code'::text) AND
                                         (jurisdiction_code_header.valid_to IS NULL))))
                                     LEFT JOIN invasivesbc.code jurisdiction_codes
                                         ON (((jurisdiction_codes.code_header_id =
                                               jurisdiction_code_header.code_header_id) AND
                                              ((a.jurisdictions_array #>> '{jurisdiction_code}'::text[]) =
                                               (jurisdiction_codes.code_name)::text))))
                                     LEFT JOIN invasivesbc.code_header invasive_species_agency_code_header ON ((
                                         ((invasive_species_agency_code_header.code_header_title)::text =
                                          'invasive_species_agency_code'::text) AND
                                         (invasive_species_agency_code_header.valid_to IS NULL))))
                                     LEFT JOIN invasivesbc.code invasive_species_agency_codes ON ((
                                         (invasive_species_agency_codes.code_header_id =
                                          invasive_species_agency_code_header.code_header_id) AND
                                         (a.funding_list = (invasive_species_agency_codes.code_name)::text))))
                                 GROUP BY a.activity_incoming_data_id),
             common_fields AS (SELECT p.jurisdiction,
                                      a.activity_incoming_data_id,
                                      a.activity_id,
                                      (a.activity_payload #>> '{short_id}'::text[])                            AS short_id,
                                      p.project                                                                AS project_code,
                                      (a.activity_payload #>> '{activity_type}'::text[])                       AS activity_type,
                                      (a.activity_payload #>> '{activity_subtype}'::text[])                    AS activity_subtype,
                                      a.form_status,
                                      to_char(to_timestamp(
                                                      (a.activity_payload #>>
                                                       '{form_data,activity_data,activity_date_time}'::text[]),
                                                      'YYYY-MM-DD"T"HH24:MI:SS'::text),
                                              'YYYY-MM-DD HH24:MI:SS'::text)                                   AS activity_date_time,
                                      (a.activity_payload #>> '{form_data,activity_data,utm_zone}'::text[])    AS utm_zone,
                                      (a.activity_payload #>> '{form_data,activity_data,utm_easting}'::text[]) AS utm_easting,
                                      (a.activity_payload #>>
                                       '{form_data,activity_data,utm_northing}'::text[])                       AS utm_northing,
                                      (a.activity_payload #>> '{form_data,activity_data,latitude}'::text[])    AS latitude,
                                      (a.activity_payload #>> '{form_data,activity_data,longitude}'::text[])   AS longitude,
                                      translate((a.activity_payload #>> '{species_positive}'::text[]), '[]"'::text,
                                                ''::text)                                                      AS species_positive,
                                      jsonb_array_length((a.activity_payload #> '{species_positive}'::text[])) AS positive_species_count,
                                      translate((a.activity_payload #>> '{species_negative}'::text[]), '[]"'::text,
                                                ''::text)                                                      AS species_negative,
                                      jsonb_array_length((a.activity_payload #> '{species_negative}'::text[])) AS negative_species_count,
                                      (a.activity_payload #>>
                                       '{form_data,activity_data,reported_area}'::text[])                      AS reported_area_sqm,
                                      (a.activity_payload #>>
                                       '{form_data,activity_type_data,pre_treatment_observation}'::text[])     AS pre_treatment_observation,
                                      p.person_name                                                            AS observation_person,
                                      p.treatment_person_name                                                  AS treatment_person,
                                      (a.activity_payload #>>
                                       '{form_data,activity_data,employer_code}'::text[])                      AS employer_code,
                                      employer_codes.code_description                                          AS employer_description,
                                      p.funding_agency,
                                      (a.activity_payload #>>
                                       '{form_data,activity_data,access_description}'::text[])                 AS access_description,
                                      (a.activity_payload #>>
                                       '{form_data,activity_data,location_description}'::text[])               AS location_description,
                                      (a.activity_payload #>>
                                       '{form_data,activity_data,general_comment}'::text[])                    AS comment,
                                      a.elevation,
                                      a.well_proximity,
                                      a.geog,
                                      a.biogeoclimatic_zones,
                                      a.regional_invasive_species_organization_areas,
                                      a.invasive_plant_management_areas,
                                      a.ownership,
                                      a.regional_districts,
                                      a.flnro_districts,
                                      a.moti_districts,
                                      CASE
                                          WHEN (a.media_keys IS NULL) THEN 'No'::text
                                          ELSE 'Yes'::text
                                          END                                                                  AS photo,
                                      a.created_timestamp,
                                      a.received_timestamp
                               FROM (((invasivesbc.activity_incoming_data a
                                   LEFT JOIN array_aggregate p
                                       ON ((p.activity_incoming_data_id = a.activity_incoming_data_id)))
                                   LEFT JOIN invasivesbc.code_header employer_code_header
                                      ON ((((employer_code_header.code_header_title)::text = 'employer_code'::text) AND
                                           (employer_code_header.valid_to IS NULL))))
                                   LEFT JOIN invasivesbc.code employer_codes
                                     ON (((employer_codes.code_header_id = employer_code_header.code_header_id) AND
                                          ((a.activity_payload #>> '{form_data,activity_data,employer_code}'::text[]) =
                                           (employer_codes.code_name)::text))))
                               WHERE ((a.activity_incoming_data_id IN (SELECT activity_current.incoming_data_id
                                                                       FROM invasivesbc.activity_current)) AND
                                      ((a.form_status)::text = 'Submitted'::text) AND (a.deleted_timestamp IS NULL) AND
                                      ((a.activity_subtype)::text = 'Activity_Biocontrol_Collection'::text))),
             biocontrol_collection_json AS (SELECT activity_incoming_data.activity_incoming_data_id,
                                                   activity_incoming_data.activity_subtype,
                                                   activity_incoming_data.form_status,
                                                   (activity_incoming_data.activity_payload #>>
                                                    '{form_data,activity_type_data,linked_id}'::text[]) AS linked_treatment_id,
                                                   (activity_incoming_data.activity_payload #>
                                                    '{form_data,activity_subtype_data}'::text[])        AS json_data
                                            FROM invasivesbc.activity_incoming_data
                                            WHERE ((activity_incoming_data.activity_incoming_data_id IN
                                                    (SELECT activity_current.incoming_data_id
                                                     FROM invasivesbc.activity_current)) AND
                                                   ((activity_incoming_data.form_status)::text = 'Submitted'::text) AND
                                                   (activity_incoming_data.deleted_timestamp IS NULL) AND
                                                   ((activity_incoming_data.activity_subtype)::text =
                                                    'Activity_Biocontrol_Collection'::text))),
             collection_array AS (SELECT concat(activity_incoming_data.activity_incoming_data_id, '-',
                                                (biocontrol_collection_information.value ->> 'invasive_plant_code'::text),
                                                '-',
                                                (biocontrol_collection_information.value ->>
                                                 'biological_agent_code'::text))                                   AS agent_id,
                                         activity_incoming_data.activity_incoming_data_id,
                                         (biocontrol_collection_information.value ->> 'invasive_plant_code'::text) AS invasive_plant_code,
                                         (biocontrol_collection_information.value ->> 'comment'::text)             AS collection_comment,
                                         (biocontrol_collection_information.value ->> 'stop_time'::text)           AS stop_time,
                                         (biocontrol_collection_information.value ->> 'start_time'::text)          AS start_time,
                                         (biocontrol_collection_information.value ->> 'plant_count'::text)         AS plant_count,
                                         (biocontrol_collection_information.value ->> 'collection_type'::text)     AS collection_type,
                                         (biocontrol_collection_information.value ->> 'collection_method'::text)   AS collection_method_code,
                                         (biocontrol_collection_information.value ->>
                                          'biological_agent_code'::text)                                           AS biological_agent_code,
                                         (biocontrol_collection_information.value ->>
                                          'historical_iapp_site_id'::text)                                         AS historical_iapp_site_id,
                                         (biocontrol_collection_information.value ->>
                                          'total_bio_agent_quantity_actual'::text)                                 AS total_agent_quantity_actual,
                                         (biocontrol_collection_information.value ->>
                                          'total_bio_agent_quantity_estimated'::text)                              AS total_agent_quantity_estimated
                                  FROM invasivesbc.activity_incoming_data,
                                       LATERAL jsonb_array_elements((activity_incoming_data.activity_payload #>
                                                                     '{form_data,activity_subtype_data,Biocontrol_Collection_Information}'::text[])) biocontrol_collection_information(value)
                                  WHERE ((activity_incoming_data.activity_incoming_data_id IN
                                          (SELECT activity_current.incoming_data_id
                                           FROM invasivesbc.activity_current)) AND
                                         ((activity_incoming_data.form_status)::text = 'Submitted'::text) AND
                                         (activity_incoming_data.deleted_timestamp IS NULL) AND
                                         ((activity_incoming_data.activity_subtype)::text =
                                          'Activity_Biocontrol_Collection'::text))),
             actual_agents AS (SELECT concat(activity_incoming_data.activity_incoming_data_id, '-',
                                             (biocontrol_collection_information.value ->> 'invasive_plant_code'::text),
                                             '-',
                                             (biocontrol_collection_information.value ->>
                                              'biological_agent_code'::text))                                    AS agent_id,
                                      activity_incoming_data.activity_incoming_data_id,
                                      string_agg((biological_agent_stage_codes.code_description)::text, ', '::text
                                                 ORDER BY (biological_agent_stage_codes.code_description)::text) AS actual_agent_stage,
                                      string_agg((actual_biological_agents.value ->> 'release_quantity'::text), ', '::text
                                                 ORDER BY biological_agent_stage_codes.code_description)         AS actual_agent_count
                               FROM invasivesbc.activity_incoming_data,
                                    (((LATERAL jsonb_array_elements((activity_incoming_data.activity_payload #>
                                                                     '{form_data,activity_subtype_data,Biocontrol_Collection_Information}'::text[])) biocontrol_collection_information(value)
                                        LEFT JOIN LATERAL jsonb_array_elements((
                                                biocontrol_collection_information.value #>
                                                '{actual_biological_agents}'::text[])) actual_biological_agents(value)
                                       ON (true))
                                        LEFT JOIN invasivesbc.code_header biological_agent_stage_code_header ON ((
                                            ((biological_agent_stage_code_header.code_header_title)::text =
                                             'biological_agent_stage_code'::text) AND
                                            (biological_agent_stage_code_header.valid_to IS NULL))))
                                        LEFT JOIN invasivesbc.code biological_agent_stage_codes ON ((
                                            (biological_agent_stage_codes.code_header_id =
                                             biological_agent_stage_code_header.code_header_id) AND
                                            ((actual_biological_agents.value ->> 'biological_agent_stage_code'::text) =
                                             (biological_agent_stage_codes.code_name)::text))))
                               WHERE ((activity_incoming_data.activity_incoming_data_id IN
                                       (SELECT activity_current.incoming_data_id
                                        FROM invasivesbc.activity_current)) AND
                                      ((activity_incoming_data.form_status)::text = 'Submitted'::text) AND
                                      (activity_incoming_data.deleted_timestamp IS NULL) AND
                                      ((activity_incoming_data.activity_subtype)::text =
                                       'Activity_Biocontrol_Collection'::text))
                               GROUP BY activity_incoming_data.activity_incoming_data_id,
                                        (concat(activity_incoming_data.activity_incoming_data_id, '-',
                                                (biocontrol_collection_information.value ->> 'invasive_plant_code'::text),
                                                '-',
                                                (biocontrol_collection_information.value ->>
                                                 'biological_agent_code'::text)))),
             estimated_agents AS (SELECT concat(activity_incoming_data.activity_incoming_data_id, '-',
                                                (biocontrol_collection_information.value ->> 'invasive_plant_code'::text),
                                                '-',
                                                (biocontrol_collection_information.value ->>
                                                 'biological_agent_code'::text))                                    AS agent_id,
                                         activity_incoming_data.activity_incoming_data_id,
                                         string_agg((biological_agent_stage_codes.code_description)::text, ', '::text
                                                    ORDER BY (biological_agent_stage_codes.code_description)::text) AS estimated_agent_stage,
                                         string_agg((estimated_biological_agents.value ->> 'release_quantity'::text),
                                                    ', '::text
                                                    ORDER BY biological_agent_stage_codes.code_description)         AS estimated_agent_count
                                  FROM invasivesbc.activity_incoming_data,
                                       (((LATERAL jsonb_array_elements((activity_incoming_data.activity_payload #>
                                                                        '{form_data,activity_subtype_data,Biocontrol_Collection_Information}'::text[])) biocontrol_collection_information(value)
                                           LEFT JOIN LATERAL jsonb_array_elements((
                                                   biocontrol_collection_information.value #>
                                                   '{estimated_biological_agents}'::text[])) estimated_biological_agents(value)
                                          ON (true))
                                           LEFT JOIN invasivesbc.code_header biological_agent_stage_code_header ON ((
                                               ((biological_agent_stage_code_header.code_header_title)::text =
                                                'biological_agent_stage_code'::text) AND
                                               (biological_agent_stage_code_header.valid_to IS NULL))))
                                           LEFT JOIN invasivesbc.code biological_agent_stage_codes ON ((
                                               (biological_agent_stage_codes.code_header_id =
                                                biological_agent_stage_code_header.code_header_id) AND
                                               ((estimated_biological_agents.value ->>
                                                 'biological_agent_stage_code'::text) =
                                                (biological_agent_stage_codes.code_name)::text))))
                                  WHERE ((activity_incoming_data.activity_incoming_data_id IN
                                          (SELECT activity_current.incoming_data_id
                                           FROM invasivesbc.activity_current)) AND
                                         ((activity_incoming_data.form_status)::text = 'Submitted'::text) AND
                                         (activity_incoming_data.deleted_timestamp IS NULL) AND
                                         ((activity_incoming_data.activity_subtype)::text =
                                          'Activity_Biocontrol_Collection'::text))
                                  GROUP BY activity_incoming_data.activity_incoming_data_id,
                                           (concat(activity_incoming_data.activity_incoming_data_id, '-',
                                                   (biocontrol_collection_information.value ->> 'invasive_plant_code'::text),
                                                   '-', (biocontrol_collection_information.value ->>
                                                         'biological_agent_code'::text)))),
             collection_array_select AS (SELECT c_1.activity_incoming_data_id,
                                                invasive_plant_codes.code_description                AS invasive_plant,
                                                a.actual_agent_stage,
                                                a.actual_agent_count,
                                                e.estimated_agent_stage,
                                                e.estimated_agent_count,
                                                c_1.total_agent_quantity_actual,
                                                c_1.total_agent_quantity_estimated,
                                                c_1.collection_comment,
                                                c_1.stop_time,
                                                c_1.start_time,
                                                c_1.plant_count,
                                                c_1.collection_type,
                                                biocontrol_monitoring_methods_codes.code_description AS collection_method,
                                                biological_agent_codes.code_description              AS biological_agent,
                                                c_1.historical_iapp_site_id
                                         FROM ((((((((collection_array c_1
                                             LEFT JOIN actual_agents a ON ((a.agent_id = c_1.agent_id)))
                                             LEFT JOIN estimated_agents e ON ((e.agent_id = c_1.agent_id)))
                                             LEFT JOIN invasivesbc.code_header invasive_plant_code_header ON ((
                                                 ((invasive_plant_code_header.code_header_title)::text =
                                                  'invasive_plant_code'::text) AND
                                                 (invasive_plant_code_header.valid_to IS NULL))))
                                             LEFT JOIN invasivesbc.code invasive_plant_codes ON ((
                                                 (invasive_plant_codes.code_header_id =
                                                  invasive_plant_code_header.code_header_id) AND
                                                 (c_1.invasive_plant_code = (invasive_plant_codes.code_name)::text))))
                                             LEFT JOIN invasivesbc.code_header biological_agent_code_header ON ((
                                                 ((biological_agent_code_header.code_header_title)::text =
                                                  'biological_agent_code'::text) AND
                                                 (biological_agent_code_header.valid_to IS NULL))))
                                             LEFT JOIN invasivesbc.code biological_agent_codes ON ((
                                                 (biological_agent_codes.code_header_id =
                                                  biological_agent_code_header.code_header_id) AND
                                                 (c_1.biological_agent_code = (biological_agent_codes.code_name)::text))))
                                             LEFT JOIN invasivesbc.code_header biocontrol_monitoring_methods_code_header
                                                ON ((
                                                        ((biocontrol_monitoring_methods_code_header.code_header_title)::text =
                                                         'biocontrol_collection_code'::text) AND
                                                        (biocontrol_monitoring_methods_code_header.valid_to IS NULL))))
                                             LEFT JOIN invasivesbc.code biocontrol_monitoring_methods_codes ON ((
                                                 (biocontrol_monitoring_methods_codes.code_header_id =
                                                  biocontrol_monitoring_methods_code_header.code_header_id) AND
                                                 (c_1.collection_method_code =
                                                  (biocontrol_monitoring_methods_codes.code_name)::text))))),
             biocontrol_collection_monitoring_select AS (SELECT b_1.activity_incoming_data_id,
                                                                b_1.linked_treatment_id,
                                                                (b_1.json_data #>> '{Weather_Conditions,temperature}'::text[])         AS temperature,
                                                                (b_1.json_data #>> '{Weather_Conditions,cloud_cover_code}'::text[])    AS cloud_cover_code,
                                                                cloud_cover_codes.code_description                                     AS cloud_cover,
                                                                (b_1.json_data #>> '{Weather_Conditions,precipitation_code}'::text[])  AS precipitation_code,
                                                                precipitation_codes.code_description                                   AS precipitation,
                                                                (b_1.json_data #>> '{Weather_Conditions,wind_speed}'::text[])          AS wind_speed,
                                                                (b_1.json_data #>> '{Weather_Conditions,wind_direction_code}'::text[]) AS wind_aspect,
                                                                (b_1.json_data #>> '{Weather_Conditions,weather_comments}'::text[])    AS weather_comments,
                                                                (b_1.json_data #>>
                                                                 '{Microsite_Conditions,mesoslope_position_code}'::text[])             AS mesoslope_position_code,
                                                                mesoslope_position_codes.code_description                              AS mesoslope_position,
                                                                (b_1.json_data #>>
                                                                 '{Microsite_Conditions,site_surface_shape_code}'::text[])             AS site_surface_shape_code,
                                                                site_surface_shape_codes.code_description                              AS site_surface_shape,
                                                                (b_1.json_data #>>
                                                                 '{Target_Plant_Phenology,phenology_details_recorded}'::text[])        AS phenology_details_recorded,
                                                                translate((b_1.json_data #>>
                                                                           '{Target_Plant_Phenology,target_plant_heights}'::text[]),
                                                                          '[{}]'::text,
                                                                          ''::text)                                                    AS target_plant_heights,
                                                                (b_1.json_data #>> '{Target_Plant_Phenology,winter_dormant}'::text[])  AS winter_dormant,
                                                                (b_1.json_data #>> '{Target_Plant_Phenology,seedlings}'::text[])       AS seedlings,
                                                                (b_1.json_data #>> '{Target_Plant_Phenology,rosettes}'::text[])        AS rosettes,
                                                                (b_1.json_data #>> '{Target_Plant_Phenology,bolts}'::text[])           AS bolts,
                                                                (b_1.json_data #>> '{Target_Plant_Phenology,flowering}'::text[])       AS flowering,
                                                                (b_1.json_data #>> '{Target_Plant_Phenology,seeds_forming}'::text[])   AS seeds_forming,
                                                                (b_1.json_data #>> '{Target_Plant_Phenology,senescent}'::text[])       AS senescent,
                                                                c_1.invasive_plant,
                                                                c_1.biological_agent,
                                                                c_1.historical_iapp_site_id,
                                                                c_1.collection_type,
                                                                c_1.plant_count,
                                                                c_1.collection_method,
                                                                c_1.start_time,
                                                                c_1.stop_time,
                                                                c_1.actual_agent_stage,
                                                                c_1.actual_agent_count,
                                                                c_1.estimated_agent_stage,
                                                                c_1.estimated_agent_count,
                                                                c_1.total_agent_quantity_actual,
                                                                c_1.total_agent_quantity_estimated
                                                         FROM (((((((((((((((collection_array_select c_1
                                                             JOIN biocontrol_collection_json b_1
                                                                             ON ((b_1.activity_incoming_data_id = c_1.activity_incoming_data_id)))
                                                             LEFT JOIN invasivesbc.code_header cloud_cover_code_header
                                                                            ON ((
                                                                                    ((cloud_cover_code_header.code_header_title)::text =
                                                                                     'cloud_cover_code'::text) AND
                                                                                    (cloud_cover_code_header.valid_to IS NULL))))
                                                             LEFT JOIN invasivesbc.code cloud_cover_codes ON ((
                                                                 (cloud_cover_codes.code_header_id =
                                                                  cloud_cover_code_header.code_header_id) AND
                                                                 ((b_1.json_data #>> '{Weather_Conditions,cloud_cover_code}'::text[]) =
                                                                  (cloud_cover_codes.code_name)::text))))
                                                             LEFT JOIN invasivesbc.code_header precipitation_code_header
                                                                          ON ((
                                                                                  ((precipitation_code_header.code_header_title)::text =
                                                                                   'precipitation_code'::text) AND
                                                                                  (precipitation_code_header.valid_to IS NULL))))
                                                             LEFT JOIN invasivesbc.code precipitation_codes ON ((
                                                                 (precipitation_codes.code_header_id =
                                                                  precipitation_code_header.code_header_id) AND
                                                                 ((b_1.json_data #>> '{Weather_Conditions,precipitation_code}'::text[]) =
                                                                  (precipitation_codes.code_name)::text))))
                                                             LEFT JOIN invasivesbc.code_header mesoslope_position_code_header
                                                                        ON ((
                                                                                ((mesoslope_position_code_header.code_header_title)::text =
                                                                                 'mesoslope_position_code'::text) AND
                                                                                (mesoslope_position_code_header.valid_to IS NULL))))
                                                             LEFT JOIN invasivesbc.code mesoslope_position_codes ON ((
                                                                 (mesoslope_position_codes.code_header_id =
                                                                  mesoslope_position_code_header.code_header_id) AND
                                                                 ((b_1.json_data #>>
                                                                   '{Microsite_Conditions,mesoslope_position_code}'::text[]) =
                                                                  (mesoslope_position_codes.code_name)::text))))
                                                             LEFT JOIN invasivesbc.code_header site_surface_shape_code_header
                                                                      ON ((
                                                                              ((site_surface_shape_code_header.code_header_title)::text =
                                                                               'site_surface_shape_code'::text) AND
                                                                              (site_surface_shape_code_header.valid_to IS NULL))))
                                                             LEFT JOIN invasivesbc.code site_surface_shape_codes ON ((
                                                                 (site_surface_shape_codes.code_header_id =
                                                                  site_surface_shape_code_header.code_header_id) AND
                                                                 ((b_1.json_data #>>
                                                                   '{Microsite_Conditions,site_surface_shape_code}'::text[]) =
                                                                  (site_surface_shape_codes.code_name)::text))))
                                                             LEFT JOIN invasivesbc.code_header invasive_plant_code_header
                                                                    ON ((
                                                                            ((invasive_plant_code_header.code_header_title)::text =
                                                                             'invasive_plant_code'::text) AND
                                                                            (invasive_plant_code_header.valid_to IS NULL))))
                                                             LEFT JOIN invasivesbc.code invasive_plant_codes ON ((
                                                                 (invasive_plant_codes.code_header_id =
                                                                  invasive_plant_code_header.code_header_id) AND
                                                                 ((b_1.json_data #>>
                                                                   '{Biocontrol_Collection_Information,invasive_plant_code}'::text[]) =
                                                                  (invasive_plant_codes.code_name)::text))))
                                                             LEFT JOIN invasivesbc.code_header biological_agent_code_header
                                                                  ON ((
                                                                          ((biological_agent_code_header.code_header_title)::text =
                                                                           'biological_agent_code'::text) AND
                                                                          (biological_agent_code_header.valid_to IS NULL))))
                                                             LEFT JOIN invasivesbc.code biological_agent_codes ON ((
                                                                 (biological_agent_codes.code_header_id =
                                                                  biological_agent_code_header.code_header_id) AND
                                                                 ((b_1.json_data #>>
                                                                   '{Biocontrol_Collection_Information,biological_agent_code}'::text[]) =
                                                                  (biological_agent_codes.code_name)::text))))
                                                             LEFT JOIN invasivesbc.code_header biological_agent_presence_code_header
                                                                ON ((
                                                                        ((biological_agent_presence_code_header.code_header_title)::text =
                                                                         'biological_agent_presence_code'::text) AND
                                                                        (biological_agent_presence_code_header.valid_to IS NULL))))
                                                             LEFT JOIN invasivesbc.code biological_agent_presence_codes
                                                               ON ((
                                                                       (biological_agent_presence_codes.code_header_id =
                                                                        biological_agent_presence_code_header.code_header_id) AND
                                                                       ((b_1.json_data #>>
                                                                         '{Biocontrol_Collection_Information,biological_agent_presence_code}'::text[]) =
                                                                        (biological_agent_presence_codes.code_name)::text)))))
        SELECT c.activity_incoming_data_id,
               c.activity_id,
               c.short_id,
               c.project_code,
               c.activity_date_time,
               c.reported_area_sqm,
               c.latitude,
               c.longitude,
               c.utm_zone,
               c.utm_easting,
               c.utm_northing,
               c.employer_description                 AS employer,
               c.funding_agency,
               c.jurisdiction,
               c.access_description,
               c.location_description,
               c.comment,
               c.observation_person,
               b.temperature,
               b.cloud_cover,
               b.precipitation,
               b.wind_speed,
               b.wind_aspect                          AS wind_direction,
               b.weather_comments,
               b.mesoslope_position,
               b.site_surface_shape,
               b.invasive_plant,
               b.biological_agent,
               b.historical_iapp_site_id,
               b.collection_type,
               b.plant_count,
               b.collection_method,
               to_char(to_timestamp(b.start_time, 'YYYY-MM-DD"T"HH24:MI:SS'::text),
                       'YYYY-MM-DD HH24:MI:SS'::text) AS start_time,
               to_char(to_timestamp(b.stop_time, 'YYYY-MM-DD"T"HH24:MI:SS'::text),
                       'YYYY-MM-DD HH24:MI:SS'::text) AS stop_time,
               b.actual_agent_stage,
               b.actual_agent_count,
               b.estimated_agent_stage,
               b.estimated_agent_count,
               b.total_agent_quantity_actual,
               b.total_agent_quantity_estimated,
               b.phenology_details_recorded,
               b.target_plant_heights,
               b.winter_dormant,
               b.seedlings,
               b.rosettes,
               b.bolts,
               b.flowering,
               b.seeds_forming,
               b.senescent,
               c.elevation,
               c.well_proximity,
               c.biogeoclimatic_zones,
               c.regional_invasive_species_organization_areas,
               c.invasive_plant_management_areas,
               c.ownership,
               c.regional_districts,
               c.flnro_districts,
               c.moti_districts,
               c.photo,
               c.created_timestamp,
               c.received_timestamp,
               public.st_astext(c.geog)               AS geography
        FROM (common_fields c
            JOIN biocontrol_collection_monitoring_select b
              ON ((b.activity_incoming_data_id = c.activity_incoming_data_id)));
        CREATE VIEW invasivesbc.biocontrol_dispersal_monitoring_summary AS
        WITH array_elements AS (SELECT activity_incoming_data.activity_incoming_data_id,
                                       activity_incoming_data.activity_subtype,
                                       jurisdictions_array.value AS jurisdictions_array,
                                       project_code_array.value  AS project_code_array,
                                       person_array.value        AS person_array,
                                       funding_list.f1           AS funding_list
                                FROM ((((invasivesbc.activity_incoming_data
                                    LEFT JOIN LATERAL jsonb_array_elements((activity_incoming_data.activity_payload #>
                                                                            '{form_data,activity_data,jurisdictions}'::text[])) jurisdictions_array(value)
                                         ON (true))
                                    LEFT JOIN LATERAL jsonb_array_elements((activity_incoming_data.activity_payload #>
                                                                            '{form_data,activity_data,project_code}'::text[])) project_code_array(value)
                                        ON (true))
                                    LEFT JOIN LATERAL jsonb_array_elements((activity_incoming_data.activity_payload #>
                                                                            '{form_data,activity_type_data,activity_persons}'::text[])) person_array(value)
                                       ON (true))
                                    LEFT JOIN LATERAL public.convert_string_list_to_array_elements((
                                            activity_incoming_data.activity_payload #>>
                                            '{form_data,activity_data,invasive_species_agency_code}'::text[])) funding_list(f1)
                                      ON (true))
                                WHERE ((activity_incoming_data.activity_incoming_data_id IN
                                        (SELECT activity_current.incoming_data_id
                                         FROM invasivesbc.activity_current)) AND
                                       ((activity_incoming_data.form_status)::text = 'Submitted'::text) AND
                                       (activity_incoming_data.deleted_timestamp IS NULL) AND
                                       ((activity_incoming_data.activity_subtype)::text =
                                        'Activity_Monitoring_BiocontrolDispersal_TerrestrialPlant'::text))),
             array_aggregate AS (SELECT a.activity_incoming_data_id,
                                        string_agg(DISTINCT (a.project_code_array #>> '{description}'::text[]),
                                                   ', '::text) AS project,
                                        string_agg(DISTINCT (a.person_array #>> '{person_name}'::text[]),
                                                   ', '::text) AS person_name,
                                        string_agg(DISTINCT
                                                   CASE
                                                       WHEN ((a.person_array #>> '{applicator_license}'::text[]) IS NOT NULL)
                                                           THEN concat((a.person_array #>> '{person_name}'::text[]),
                                                                       ', ',
                                                                       (a.person_array #>> '{applicator_license}'::text[]))
                                                       ELSE (a.person_array #>> '{person_name}'::text[])
                                                       END,
                                                   ', '::text) AS treatment_person_name,
                                        string_agg(DISTINCT concat(jurisdiction_codes.code_description, ' ',
                                                                   ((a.jurisdictions_array #>> '{percent_covered}'::text[]) || '%'::text)),
                                                   ', '::text) AS jurisdiction,
                                        string_agg(DISTINCT (invasive_species_agency_codes.code_description)::text,
                                                   ', '::text) AS funding_agency
                                 FROM ((((array_elements a
                                     LEFT JOIN invasivesbc.code_header jurisdiction_code_header ON ((
                                         ((jurisdiction_code_header.code_header_title)::text =
                                          'jurisdiction_code'::text) AND
                                         (jurisdiction_code_header.valid_to IS NULL))))
                                     LEFT JOIN invasivesbc.code jurisdiction_codes
                                         ON (((jurisdiction_codes.code_header_id =
                                               jurisdiction_code_header.code_header_id) AND
                                              ((a.jurisdictions_array #>> '{jurisdiction_code}'::text[]) =
                                               (jurisdiction_codes.code_name)::text))))
                                     LEFT JOIN invasivesbc.code_header invasive_species_agency_code_header ON ((
                                         ((invasive_species_agency_code_header.code_header_title)::text =
                                          'invasive_species_agency_code'::text) AND
                                         (invasive_species_agency_code_header.valid_to IS NULL))))
                                     LEFT JOIN invasivesbc.code invasive_species_agency_codes ON ((
                                         (invasive_species_agency_codes.code_header_id =
                                          invasive_species_agency_code_header.code_header_id) AND
                                         (a.funding_list = (invasive_species_agency_codes.code_name)::text))))
                                 GROUP BY a.activity_incoming_data_id),
             common_fields AS (SELECT p.jurisdiction,
                                      a.activity_incoming_data_id,
                                      a.activity_id,
                                      (a.activity_payload #>> '{short_id}'::text[])                            AS short_id,
                                      p.project                                                                AS project_code,
                                      (a.activity_payload #>> '{activity_type}'::text[])                       AS activity_type,
                                      (a.activity_payload #>> '{activity_subtype}'::text[])                    AS activity_subtype,
                                      a.form_status,
                                      to_char(to_timestamp(
                                                      (a.activity_payload #>>
                                                       '{form_data,activity_data,activity_date_time}'::text[]),
                                                      'YYYY-MM-DD"T"HH24:MI:SS'::text),
                                              'YYYY-MM-DD HH24:MI:SS'::text)                                   AS activity_date_time,
                                      (a.activity_payload #>> '{form_data,activity_data,utm_zone}'::text[])    AS utm_zone,
                                      (a.activity_payload #>> '{form_data,activity_data,utm_easting}'::text[]) AS utm_easting,
                                      (a.activity_payload #>>
                                       '{form_data,activity_data,utm_northing}'::text[])                       AS utm_northing,
                                      (a.activity_payload #>> '{form_data,activity_data,latitude}'::text[])    AS latitude,
                                      (a.activity_payload #>> '{form_data,activity_data,longitude}'::text[])   AS longitude,
                                      translate((a.activity_payload #>> '{species_positive}'::text[]), '[]"'::text,
                                                ''::text)                                                      AS species_positive,
                                      jsonb_array_length((a.activity_payload #> '{species_positive}'::text[])) AS positive_species_count,
                                      translate((a.activity_payload #>> '{species_negative}'::text[]), '[]"'::text,
                                                ''::text)                                                      AS species_negative,
                                      jsonb_array_length((a.activity_payload #> '{species_negative}'::text[])) AS negative_species_count,
                                      (a.activity_payload #>>
                                       '{form_data,activity_data,reported_area}'::text[])                      AS reported_area_sqm,
                                      (a.activity_payload #>>
                                       '{form_data,activity_type_data,pre_treatment_observation}'::text[])     AS pre_treatment_observation,
                                      p.person_name                                                            AS observation_person,
                                      p.treatment_person_name                                                  AS treatment_person,
                                      (a.activity_payload #>>
                                       '{form_data,activity_data,employer_code}'::text[])                      AS employer_code,
                                      employer_codes.code_description                                          AS employer_description,
                                      p.funding_agency,
                                      (a.activity_payload #>>
                                       '{form_data,activity_data,access_description}'::text[])                 AS access_description,
                                      (a.activity_payload #>>
                                       '{form_data,activity_data,location_description}'::text[])               AS location_description,
                                      (a.activity_payload #>>
                                       '{form_data,activity_data,general_comment}'::text[])                    AS comment,
                                      a.elevation,
                                      a.well_proximity,
                                      a.geog,
                                      a.biogeoclimatic_zones,
                                      a.regional_invasive_species_organization_areas,
                                      a.invasive_plant_management_areas,
                                      a.ownership,
                                      a.regional_districts,
                                      a.flnro_districts,
                                      a.moti_districts,
                                      CASE
                                          WHEN (a.media_keys IS NULL) THEN 'No'::text
                                          ELSE 'Yes'::text
                                          END                                                                  AS photo,
                                      a.created_timestamp,
                                      a.received_timestamp
                               FROM (((invasivesbc.activity_incoming_data a
                                   LEFT JOIN array_aggregate p
                                       ON ((p.activity_incoming_data_id = a.activity_incoming_data_id)))
                                   LEFT JOIN invasivesbc.code_header employer_code_header
                                      ON ((((employer_code_header.code_header_title)::text = 'employer_code'::text) AND
                                           (employer_code_header.valid_to IS NULL))))
                                   LEFT JOIN invasivesbc.code employer_codes
                                     ON (((employer_codes.code_header_id = employer_code_header.code_header_id) AND
                                          ((a.activity_payload #>> '{form_data,activity_data,employer_code}'::text[]) =
                                           (employer_codes.code_name)::text))))
                               WHERE ((a.activity_incoming_data_id IN (SELECT activity_current.incoming_data_id
                                                                       FROM invasivesbc.activity_current)) AND
                                      ((a.form_status)::text = 'Submitted'::text) AND (a.deleted_timestamp IS NULL) AND
                                      ((a.activity_subtype)::text =
                                       'Activity_Monitoring_BiocontrolDispersal_TerrestrialPlant'::text))),
             biocontrol_dispersal_monitoring_json AS (SELECT activity_incoming_data.activity_incoming_data_id,
                                                             activity_incoming_data.activity_subtype,
                                                             activity_incoming_data.form_status,
                                                             (activity_incoming_data.activity_payload #>>
                                                              '{form_data,activity_type_data,linked_id}'::text[]) AS linked_treatment_id,
                                                             (activity_incoming_data.activity_payload #>
                                                              '{form_data,activity_subtype_data}'::text[])        AS json_data
                                                      FROM invasivesbc.activity_incoming_data
                                                      WHERE ((activity_incoming_data.activity_incoming_data_id IN
                                                              (SELECT activity_current.incoming_data_id
                                                               FROM invasivesbc.activity_current)) AND
                                                             ((activity_incoming_data.form_status)::text = 'Submitted'::text) AND
                                                             (activity_incoming_data.deleted_timestamp IS NULL) AND
                                                             ((activity_incoming_data.activity_subtype)::text =
                                                              'Activity_Monitoring_BiocontrolDispersal_TerrestrialPlant'::text))),
             agent_location_code AS (SELECT concat(activity_incoming_data.activity_incoming_data_id, '-',
                                                   (biocontrol_dispersal_information.value ->> 'invasive_plant_code'::text),
                                                   '-', (biocontrol_dispersal_information.value ->>
                                                         'biological_agent_code'::text)) AS agent_id,
                                            public.convert_string_list_to_array_elements((
                                                    biocontrol_dispersal_information.value ->>
                                                    'bio_agent_location_code'::text))    AS bio_agent_location_code
                                     FROM invasivesbc.activity_incoming_data,
                                          LATERAL jsonb_array_elements((activity_incoming_data.activity_payload #>
                                                                        '{form_data,activity_subtype_data,Monitoring_BiocontrolDispersal_Information}'::text[])) biocontrol_dispersal_information(value)
                                     WHERE ((activity_incoming_data.activity_incoming_data_id IN
                                             (SELECT activity_current.incoming_data_id
                                              FROM invasivesbc.activity_current)) AND
                                            ((activity_incoming_data.form_status)::text = 'Submitted'::text) AND
                                            (activity_incoming_data.deleted_timestamp IS NULL) AND
                                            ((activity_incoming_data.activity_subtype)::text =
                                             'Activity_Monitoring_BiocontrolDispersal_TerrestrialPlant'::text))),
             agent_location_code_agg AS (SELECT a.agent_id,
                                                string_agg((location_agents_found_codes.code_description)::text, ', '::text
                                                           ORDER BY (location_agents_found_codes.code_description)::text) AS location_agent_found
                                         FROM ((agent_location_code a
                                             LEFT JOIN invasivesbc.code_header location_agents_found_code_header ON ((
                                                 ((location_agents_found_code_header.code_header_title)::text =
                                                  'location_agents_found_code'::text) AND
                                                 (location_agents_found_code_header.valid_to IS NULL))))
                                             LEFT JOIN invasivesbc.code location_agents_found_codes ON ((
                                                 (location_agents_found_codes.code_header_id =
                                                  location_agents_found_code_header.code_header_id) AND
                                                 (a.bio_agent_location_code =
                                                  (location_agents_found_codes.code_name)::text))))
                                         GROUP BY a.agent_id),
             agent_presence_code AS (SELECT concat(activity_incoming_data.activity_incoming_data_id, '-',
                                                   (biocontrol_dispersal_information.value ->> 'invasive_plant_code'::text),
                                                   '-', (biocontrol_dispersal_information.value ->>
                                                         'biological_agent_code'::text))     AS agent_id,
                                            public.convert_string_list_to_array_elements((
                                                    biocontrol_dispersal_information.value ->>
                                                    'biological_agent_presence_code'::text)) AS biological_agent_presence_code
                                     FROM invasivesbc.activity_incoming_data,
                                          LATERAL jsonb_array_elements((activity_incoming_data.activity_payload #>
                                                                        '{form_data,activity_subtype_data,Monitoring_BiocontrolDispersal_Information}'::text[])) biocontrol_dispersal_information(value)
                                     WHERE ((activity_incoming_data.activity_incoming_data_id IN
                                             (SELECT activity_current.incoming_data_id
                                              FROM invasivesbc.activity_current)) AND
                                            ((activity_incoming_data.form_status)::text = 'Submitted'::text) AND
                                            (activity_incoming_data.deleted_timestamp IS NULL) AND
                                            ((activity_incoming_data.activity_subtype)::text =
                                             'Activity_Monitoring_BiocontrolDispersal_TerrestrialPlant'::text))),
             agent_presence_code_agg AS (SELECT a.agent_id,
                                                string_agg((biological_agent_presence_codes.code_description)::text,
                                                           ', '::text
                                                           ORDER BY (biological_agent_presence_codes.code_description)::text) AS biological_agent_presence
                                         FROM ((agent_presence_code a
                                             LEFT JOIN invasivesbc.code_header biological_agent_presence_code_header
                                                ON ((
                                                        ((biological_agent_presence_code_header.code_header_title)::text =
                                                         'biological_agent_presence_code'::text) AND
                                                        (biological_agent_presence_code_header.valid_to IS NULL))))
                                             LEFT JOIN invasivesbc.code biological_agent_presence_codes ON ((
                                                 (biological_agent_presence_codes.code_header_id =
                                                  biological_agent_presence_code_header.code_header_id) AND
                                                 (a.biological_agent_presence_code =
                                                  (biological_agent_presence_codes.code_name)::text))))
                                         GROUP BY a.agent_id),
             biocontrol_dispersal_monitoring_array AS (SELECT concat(activity_incoming_data.activity_incoming_data_id,
                                                                     '-',
                                                                     (biocontrol_dispersal_information.value ->> 'invasive_plant_code'::text),
                                                                     '-', (biocontrol_dispersal_information.value ->>
                                                                           'biological_agent_code'::text))                             AS agent_id,
                                                              activity_incoming_data.activity_incoming_data_id,
                                                              (biocontrol_dispersal_information.value ->> 'invasive_plant_code'::text) AS invasive_plant_code,
                                                              (biocontrol_dispersal_information.value ->>
                                                               'biological_agent_code'::text)                                          AS biological_agent_code,
                                                              (biocontrol_dispersal_information.value ->> 'biocontrol_present'::text)  AS biocontrol_present,
                                                              (biocontrol_dispersal_information.value ->> 'monitoring_type'::text)     AS monitoring_type,
                                                              (biocontrol_dispersal_information.value ->> 'plant_count'::text)         AS plant_count,
                                                              (biocontrol_dispersal_information.value ->>
                                                               'biocontrol_monitoring_methods_code'::text)                             AS biocontrol_monitoring_methods_code,
                                                              (biocontrol_dispersal_information.value ->> 'linear_segment'::text)      AS linear_segment,
                                                              (biocontrol_dispersal_information.value ->> 'start_time'::text)          AS start_time,
                                                              (biocontrol_dispersal_information.value ->> 'stop_time'::text)           AS stop_time,
                                                              (biocontrol_dispersal_information.value ->>
                                                               'total_bio_agent_quantity_actual'::text)                                AS total_bio_agent_quantity_actual,
                                                              (biocontrol_dispersal_information.value ->>
                                                               'total_bio_agent_quantity_estimated'::text)                             AS total_bioagent_quantity_estimated
                                                       FROM invasivesbc.activity_incoming_data,
                                                            LATERAL jsonb_array_elements((
                                                                    activity_incoming_data.activity_payload #>
                                                                    '{form_data,activity_subtype_data,Monitoring_BiocontrolDispersal_Information}'::text[])) biocontrol_dispersal_information(value)
                                                       WHERE ((activity_incoming_data.activity_incoming_data_id IN
                                                               (SELECT activity_current.incoming_data_id
                                                                FROM invasivesbc.activity_current)) AND
                                                              ((activity_incoming_data.form_status)::text = 'Submitted'::text) AND
                                                              (activity_incoming_data.deleted_timestamp IS NULL) AND
                                                              ((activity_incoming_data.activity_subtype)::text =
                                                               'Activity_Monitoring_BiocontrolDispersal_TerrestrialPlant'::text))),
             actual_agents AS (SELECT concat(activity_incoming_data.activity_incoming_data_id, '-',
                                             (biocontrol_dispersal_information.value ->> 'invasive_plant_code'::text),
                                             '-',
                                             (biocontrol_dispersal_information.value ->>
                                              'biological_agent_code'::text))                                    AS agent_id,
                                      activity_incoming_data.activity_incoming_data_id,
                                      string_agg((biological_agent_stage_codes.code_description)::text, ', '::text
                                                 ORDER BY (biological_agent_stage_codes.code_description)::text) AS actual_biological_agent_stage,
                                      string_agg((actual_biological_agents.value ->> 'release_quantity'::text), ', '::text
                                                 ORDER BY biological_agent_stage_codes.code_description)         AS actual_release_quantity,
                                      string_agg((actual_plant_position_codes.code_description)::text, ', '::text
                                                 ORDER BY biological_agent_stage_codes.code_description)         AS actual_agent_location,
                                      string_agg((actual_agent_location_codes.code_description)::text, ', '::text
                                                 ORDER BY biological_agent_stage_codes.code_description)         AS actual_plant_position
                               FROM invasivesbc.activity_incoming_data,
                                    (((((((LATERAL jsonb_array_elements((activity_incoming_data.activity_payload #>
                                                                         '{form_data,activity_subtype_data,Monitoring_BiocontrolDispersal_Information}'::text[])) biocontrol_dispersal_information(value)
                                        LEFT JOIN LATERAL jsonb_array_elements((
                                                biocontrol_dispersal_information.value #>
                                                '{actual_biological_agents}'::text[])) actual_biological_agents(value)
                                           ON (true))
                                        LEFT JOIN invasivesbc.code_header biological_agent_stage_code_header ON ((
                                            ((biological_agent_stage_code_header.code_header_title)::text =
                                             'biological_agent_stage_code'::text) AND
                                            (biological_agent_stage_code_header.valid_to IS NULL))))
                                        LEFT JOIN invasivesbc.code biological_agent_stage_codes ON ((
                                            (biological_agent_stage_codes.code_header_id =
                                             biological_agent_stage_code_header.code_header_id) AND
                                            ((actual_biological_agents.value ->> 'biological_agent_stage_code'::text) =
                                             (biological_agent_stage_codes.code_name)::text))))
                                        LEFT JOIN invasivesbc.code_header actual_plant_position_code_header ON ((
                                            ((actual_plant_position_code_header.code_header_title)::text =
                                             'plant_position_code'::text) AND
                                            (actual_plant_position_code_header.valid_to IS NULL))))
                                        LEFT JOIN invasivesbc.code actual_plant_position_codes ON ((
                                            (actual_plant_position_codes.code_header_id =
                                             actual_plant_position_code_header.code_header_id) AND
                                            ((actual_biological_agents.value ->> 'plant_position'::text) =
                                             (actual_plant_position_codes.code_name)::text))))
                                        LEFT JOIN invasivesbc.code_header actual_agent_location_code_header ON ((
                                            ((actual_agent_location_code_header.code_header_title)::text =
                                             'agent_location_code'::text) AND
                                            (actual_agent_location_code_header.valid_to IS NULL))))
                                        LEFT JOIN invasivesbc.code actual_agent_location_codes ON ((
                                            (actual_agent_location_codes.code_header_id =
                                             actual_agent_location_code_header.code_header_id) AND
                                            ((actual_biological_agents.value ->> 'agent_location'::text) =
                                             (actual_agent_location_codes.code_name)::text))))
                               WHERE ((activity_incoming_data.activity_incoming_data_id IN
                                       (SELECT activity_current.incoming_data_id
                                        FROM invasivesbc.activity_current)) AND
                                      ((activity_incoming_data.form_status)::text = 'Submitted'::text) AND
                                      (activity_incoming_data.deleted_timestamp IS NULL) AND
                                      ((activity_incoming_data.activity_subtype)::text =
                                       'Activity_Monitoring_BiocontrolDispersal_TerrestrialPlant'::text))
                               GROUP BY activity_incoming_data.activity_incoming_data_id,
                                        (concat(activity_incoming_data.activity_incoming_data_id, '-',
                                                (biocontrol_dispersal_information.value ->> 'invasive_plant_code'::text),
                                                '-',
                                                (biocontrol_dispersal_information.value ->>
                                                 'biological_agent_code'::text)))),
             estimated_agents AS (SELECT concat(activity_incoming_data.activity_incoming_data_id, '-',
                                                (biocontrol_dispersal_information.value ->> 'invasive_plant_code'::text),
                                                '-',
                                                (biocontrol_dispersal_information.value ->>
                                                 'biological_agent_code'::text))                                    AS agent_id,
                                         activity_incoming_data.activity_incoming_data_id,
                                         string_agg((biological_agent_stage_codes.code_description)::text, ', '::text
                                                    ORDER BY (biological_agent_stage_codes.code_description)::text) AS estimated_biological_agent_stage,
                                         string_agg((estimated_biological_agents.value ->> 'release_quantity'::text),
                                                    ', '::text
                                                    ORDER BY biological_agent_stage_codes.code_description)         AS estimated_release_quantity,
                                         string_agg((estimated_plant_position_codes.code_description)::text, ', '::text
                                                    ORDER BY biological_agent_stage_codes.code_description)         AS estimated_agent_location,
                                         string_agg((estimated_agent_location_codes.code_description)::text, ', '::text
                                                    ORDER BY biological_agent_stage_codes.code_description)         AS estimated_plant_position
                                  FROM invasivesbc.activity_incoming_data,
                                       (((((((LATERAL jsonb_array_elements((activity_incoming_data.activity_payload #>
                                                                            '{form_data,activity_subtype_data,Monitoring_BiocontrolDispersal_Information}'::text[])) biocontrol_dispersal_information(value)
                                           LEFT JOIN LATERAL jsonb_array_elements((
                                                   biocontrol_dispersal_information.value #>
                                                   '{estimated_biological_agents}'::text[])) estimated_biological_agents(value)
                                              ON (true))
                                           LEFT JOIN invasivesbc.code_header biological_agent_stage_code_header ON ((
                                               ((biological_agent_stage_code_header.code_header_title)::text =
                                                'biological_agent_stage_code'::text) AND
                                               (biological_agent_stage_code_header.valid_to IS NULL))))
                                           LEFT JOIN invasivesbc.code biological_agent_stage_codes ON ((
                                               (biological_agent_stage_codes.code_header_id =
                                                biological_agent_stage_code_header.code_header_id) AND
                                               ((estimated_biological_agents.value ->>
                                                 'biological_agent_stage_code'::text) =
                                                (biological_agent_stage_codes.code_name)::text))))
                                           LEFT JOIN invasivesbc.code_header estimated_plant_position_code_header ON ((
                                               ((estimated_plant_position_code_header.code_header_title)::text =
                                                'plant_position_code'::text) AND
                                               (estimated_plant_position_code_header.valid_to IS NULL))))
                                           LEFT JOIN invasivesbc.code estimated_plant_position_codes ON ((
                                               (estimated_plant_position_codes.code_header_id =
                                                estimated_plant_position_code_header.code_header_id) AND
                                               ((estimated_biological_agents.value ->> 'plant_position'::text) =
                                                (estimated_plant_position_codes.code_name)::text))))
                                           LEFT JOIN invasivesbc.code_header estimated_agent_location_code_header ON ((
                                               ((estimated_agent_location_code_header.code_header_title)::text =
                                                'agent_location_code'::text) AND
                                               (estimated_agent_location_code_header.valid_to IS NULL))))
                                           LEFT JOIN invasivesbc.code estimated_agent_location_codes ON ((
                                               (estimated_agent_location_codes.code_header_id =
                                                estimated_agent_location_code_header.code_header_id) AND
                                               ((estimated_biological_agents.value ->> 'agent_location'::text) =
                                                (estimated_agent_location_codes.code_name)::text))))
                                  WHERE ((activity_incoming_data.activity_incoming_data_id IN
                                          (SELECT activity_current.incoming_data_id
                                           FROM invasivesbc.activity_current)) AND
                                         (activity_incoming_data.deleted_timestamp IS NULL) AND
                                         ((activity_incoming_data.form_status)::text = 'Submitted'::text) AND
                                         ((activity_incoming_data.activity_subtype)::text =
                                          'Activity_Monitoring_BiocontrolDispersal_TerrestrialPlant'::text))
                                  GROUP BY activity_incoming_data.activity_incoming_data_id,
                                           (concat(activity_incoming_data.activity_incoming_data_id, '-',
                                                   (biocontrol_dispersal_information.value ->> 'invasive_plant_code'::text),
                                                   '-', (biocontrol_dispersal_information.value ->>
                                                         'biological_agent_code'::text)))),
             monitoring_array_select AS (SELECT d.activity_incoming_data_id,
                                                invasive_plant_codes.code_description                AS invasive_plant,
                                                biological_agent_codes.code_description              AS biological_agent,
                                                d.biocontrol_present,
                                                l.location_agent_found,
                                                p.biological_agent_presence,
                                                d.monitoring_type,
                                                d.plant_count,
                                                biocontrol_monitoring_methods_codes.code_description AS monitoring_method,
                                                d.linear_segment,
                                                d.start_time,
                                                d.stop_time,
                                                a.actual_biological_agent_stage,
                                                a.actual_release_quantity,
                                                a.actual_plant_position,
                                                a.actual_agent_location,
                                                e.estimated_biological_agent_stage,
                                                e.estimated_release_quantity,
                                                e.estimated_plant_position,
                                                e.estimated_agent_location,
                                                d.total_bio_agent_quantity_actual,
                                                d.total_bioagent_quantity_estimated
                                         FROM ((((((((((biocontrol_dispersal_monitoring_array d
                                             LEFT JOIN actual_agents a ON ((a.agent_id = d.agent_id)))
                                             LEFT JOIN estimated_agents e ON ((e.agent_id = d.agent_id)))
                                             LEFT JOIN agent_location_code_agg l ON ((l.agent_id = d.agent_id)))
                                             LEFT JOIN agent_presence_code_agg p ON ((p.agent_id = d.agent_id)))
                                             LEFT JOIN invasivesbc.code_header invasive_plant_code_header ON ((
                                                 ((invasive_plant_code_header.code_header_title)::text =
                                                  'invasive_plant_code'::text) AND
                                                 (invasive_plant_code_header.valid_to IS NULL))))
                                             LEFT JOIN invasivesbc.code invasive_plant_codes ON ((
                                                 (invasive_plant_codes.code_header_id =
                                                  invasive_plant_code_header.code_header_id) AND
                                                 (d.invasive_plant_code = (invasive_plant_codes.code_name)::text))))
                                             LEFT JOIN invasivesbc.code_header biological_agent_code_header ON ((
                                                 ((biological_agent_code_header.code_header_title)::text =
                                                  'biological_agent_code'::text) AND
                                                 (biological_agent_code_header.valid_to IS NULL))))
                                             LEFT JOIN invasivesbc.code biological_agent_codes ON ((
                                                 (biological_agent_codes.code_header_id =
                                                  biological_agent_code_header.code_header_id) AND
                                                 (d.biological_agent_code = (biological_agent_codes.code_name)::text))))
                                             LEFT JOIN invasivesbc.code_header biocontrol_monitoring_methods_code_header
                                                ON ((
                                                        ((biocontrol_monitoring_methods_code_header.code_header_title)::text =
                                                         'biocontrol_monitoring_methods_code'::text) AND
                                                        (biocontrol_monitoring_methods_code_header.valid_to IS NULL))))
                                             LEFT JOIN invasivesbc.code biocontrol_monitoring_methods_codes ON ((
                                                 (biocontrol_monitoring_methods_codes.code_header_id =
                                                  biocontrol_monitoring_methods_code_header.code_header_id) AND
                                                 (d.biocontrol_monitoring_methods_code =
                                                  (biocontrol_monitoring_methods_codes.code_name)::text))))),
             biocontrol_release_monitoring_select AS (SELECT b_1.activity_incoming_data_id,
                                                             b_1.linked_treatment_id,
                                                             (b_1.json_data #>> '{Weather_Conditions,temperature}'::text[])         AS temperature,
                                                             (b_1.json_data #>> '{Weather_Conditions,cloud_cover_code}'::text[])    AS cloud_cover_code,
                                                             cloud_cover_codes.code_description                                     AS cloud_cover,
                                                             (b_1.json_data #>> '{Weather_Conditions,precipitation_code}'::text[])  AS precipitation_code,
                                                             precipitation_codes.code_description                                   AS precipitation,
                                                             (b_1.json_data #>> '{Weather_Conditions,wind_speed}'::text[])          AS wind_speed,
                                                             (b_1.json_data #>> '{Weather_Conditions,wind_direction_code}'::text[]) AS wind_aspect,
                                                             (b_1.json_data #>> '{Weather_Conditions,weather_comments}'::text[])    AS weather_comments,
                                                             (b_1.json_data #>>
                                                              '{Microsite_Conditions,mesoslope_position_code}'::text[])             AS mesoslope_position_code,
                                                             mesoslope_position_codes.code_description                              AS mesoslope_position,
                                                             (b_1.json_data #>>
                                                              '{Microsite_Conditions,site_surface_shape_code}'::text[])             AS site_surface_shape_code,
                                                             site_surface_shape_codes.code_description                              AS site_surface_shape,
                                                             a.invasive_plant,
                                                             a.biological_agent,
                                                             a.biocontrol_present,
                                                             a.biological_agent_presence,
                                                             a.monitoring_type,
                                                             a.plant_count,
                                                             a.monitoring_method,
                                                             a.linear_segment,
                                                             a.start_time,
                                                             a.stop_time,
                                                             a.location_agent_found,
                                                             a.actual_biological_agent_stage,
                                                             a.actual_release_quantity,
                                                             a.actual_plant_position,
                                                             a.actual_agent_location,
                                                             a.estimated_biological_agent_stage,
                                                             a.estimated_release_quantity,
                                                             a.estimated_plant_position,
                                                             a.estimated_agent_location,
                                                             a.total_bio_agent_quantity_actual,
                                                             a.total_bioagent_quantity_estimated,
                                                             (b_1.json_data #>>
                                                              '{Target_Plant_Phenology,phenology_details_recorded}'::text[])        AS phenology_details_recorded,
                                                             translate((b_1.json_data #>>
                                                                        '{Target_Plant_Phenology,target_plant_heights}'::text[]),
                                                                       '[{}]'::text,
                                                                       ''::text)                                                    AS target_plant_heights,
                                                             (b_1.json_data #>> '{Target_Plant_Phenology,winter_dormant}'::text[])  AS winter_dormant,
                                                             (b_1.json_data #>> '{Target_Plant_Phenology,seedlings}'::text[])       AS seedlings,
                                                             (b_1.json_data #>> '{Target_Plant_Phenology,rosettes}'::text[])        AS rosettes,
                                                             (b_1.json_data #>> '{Target_Plant_Phenology,bolts}'::text[])           AS bolts,
                                                             (b_1.json_data #>> '{Target_Plant_Phenology,flowering}'::text[])       AS flowering,
                                                             (b_1.json_data #>> '{Target_Plant_Phenology,seeds_forming}'::text[])   AS seeds_forming,
                                                             (b_1.json_data #>> '{Target_Plant_Phenology,senescent}'::text[])       AS senescent
                                                      FROM (((((((((biocontrol_dispersal_monitoring_json b_1
                                                          JOIN monitoring_array_select a
                                                                    ON ((a.activity_incoming_data_id = b_1.activity_incoming_data_id)))
                                                          LEFT JOIN invasivesbc.code_header cloud_cover_code_header
                                                                   ON ((
                                                                           ((cloud_cover_code_header.code_header_title)::text =
                                                                            'cloud_cover_code'::text) AND
                                                                           (cloud_cover_code_header.valid_to IS NULL))))
                                                          LEFT JOIN invasivesbc.code cloud_cover_codes ON ((
                                                              (cloud_cover_codes.code_header_id =
                                                               cloud_cover_code_header.code_header_id) AND
                                                              ((b_1.json_data #>> '{Weather_Conditions,cloud_cover_code}'::text[]) =
                                                               (cloud_cover_codes.code_name)::text))))
                                                          LEFT JOIN invasivesbc.code_header precipitation_code_header
                                                                 ON ((
                                                                         ((precipitation_code_header.code_header_title)::text =
                                                                          'precipitation_code'::text) AND
                                                                         (precipitation_code_header.valid_to IS NULL))))
                                                          LEFT JOIN invasivesbc.code precipitation_codes ON ((
                                                              (precipitation_codes.code_header_id =
                                                               precipitation_code_header.code_header_id) AND
                                                              ((b_1.json_data #>> '{Weather_Conditions,precipitation_code}'::text[]) =
                                                               (precipitation_codes.code_name)::text))))
                                                          LEFT JOIN invasivesbc.code_header mesoslope_position_code_header
                                                               ON ((
                                                                       ((mesoslope_position_code_header.code_header_title)::text =
                                                                        'mesoslope_position_code'::text) AND
                                                                       (mesoslope_position_code_header.valid_to IS NULL))))
                                                          LEFT JOIN invasivesbc.code mesoslope_position_codes ON ((
                                                              (mesoslope_position_codes.code_header_id =
                                                               mesoslope_position_code_header.code_header_id) AND
                                                              ((b_1.json_data #>>
                                                                '{Microsite_Conditions,mesoslope_position_code}'::text[]) =
                                                               (mesoslope_position_codes.code_name)::text))))
                                                          LEFT JOIN invasivesbc.code_header site_surface_shape_code_header
                                                             ON ((
                                                                     ((site_surface_shape_code_header.code_header_title)::text =
                                                                      'site_surface_shape_code'::text) AND
                                                                     (site_surface_shape_code_header.valid_to IS NULL))))
                                                          LEFT JOIN invasivesbc.code site_surface_shape_codes ON ((
                                                              (site_surface_shape_codes.code_header_id =
                                                               site_surface_shape_code_header.code_header_id) AND
                                                              ((b_1.json_data #>>
                                                                '{Microsite_Conditions,site_surface_shape_code}'::text[]) =
                                                               (site_surface_shape_codes.code_name)::text)))))
        SELECT c.activity_incoming_data_id,
               c.activity_id,
               c.short_id,
               c.project_code,
               c.activity_date_time,
               c.reported_area_sqm,
               c.latitude,
               c.longitude,
               c.utm_zone,
               c.utm_easting,
               c.utm_northing,
               c.employer_description                 AS employer,
               c.funding_agency,
               c.jurisdiction,
               c.access_description,
               c.location_description,
               c.comment,
               c.observation_person,
               b.temperature,
               b.cloud_cover,
               b.precipitation,
               b.wind_speed,
               b.wind_aspect                          AS wind_direction,
               b.weather_comments,
               b.mesoslope_position,
               b.site_surface_shape,
               b.invasive_plant,
               b.biological_agent,
               CASE
                   WHEN (b.biocontrol_present = 'true'::text) THEN 'Yes'::text
                   ELSE 'No'::text
                   END                                AS biocontrol_present,
               b.biological_agent_presence,
               b.monitoring_type,
               b.plant_count,
               b.monitoring_method,
               b.linear_segment,
               to_char(to_timestamp(b.start_time, 'YYYY-MM-DD"T"HH24:MI:SS'::text),
                       'YYYY-MM-DD HH24:MI:SS'::text) AS start_time,
               to_char(to_timestamp(b.stop_time, 'YYYY-MM-DD"T"HH24:MI:SS'::text),
                       'YYYY-MM-DD HH24:MI:SS'::text) AS stop_time,
               b.location_agent_found,
               b.actual_biological_agent_stage,
               b.actual_release_quantity              AS actual_agent_count,
               b.actual_plant_position,
               b.actual_agent_location,
               b.estimated_biological_agent_stage,
               b.estimated_release_quantity           AS estimated_agent_count,
               b.estimated_plant_position,
               b.estimated_agent_location,
               b.total_bio_agent_quantity_actual      AS total_agent_quantity_actual,
               b.total_bioagent_quantity_estimated    AS total_agent_quantity_estimated,
               b.phenology_details_recorded,
               b.target_plant_heights,
               b.winter_dormant,
               b.seedlings,
               b.rosettes,
               b.bolts,
               b.flowering,
               b.seeds_forming,
               b.senescent,
               c.elevation,
               c.well_proximity,
               c.biogeoclimatic_zones,
               c.regional_invasive_species_organization_areas,
               c.invasive_plant_management_areas,
               c.ownership,
               c.regional_districts,
               c.flnro_districts,
               c.moti_districts,
               c.photo,
               c.created_timestamp,
               c.received_timestamp,
               public.st_astext(c.geog)               AS geography
        FROM (common_fields c
            JOIN biocontrol_release_monitoring_select b
              ON ((b.activity_incoming_data_id = c.activity_incoming_data_id)));
        CREATE VIEW invasivesbc.biocontrol_release_monitoring_summary AS
        WITH array_elements AS (SELECT activity_incoming_data.activity_incoming_data_id,
                                       activity_incoming_data.activity_subtype,
                                       jurisdictions_array.value AS jurisdictions_array,
                                       project_code_array.value  AS project_code_array,
                                       person_array.value        AS person_array,
                                       funding_list.f1           AS funding_list
                                FROM ((((invasivesbc.activity_incoming_data
                                    LEFT JOIN LATERAL jsonb_array_elements((activity_incoming_data.activity_payload #>
                                                                            '{form_data,activity_data,jurisdictions}'::text[])) jurisdictions_array(value)
                                         ON (true))
                                    LEFT JOIN LATERAL jsonb_array_elements((activity_incoming_data.activity_payload #>
                                                                            '{form_data,activity_data,project_code}'::text[])) project_code_array(value)
                                        ON (true))
                                    LEFT JOIN LATERAL jsonb_array_elements((activity_incoming_data.activity_payload #>
                                                                            '{form_data,activity_type_data,activity_persons}'::text[])) person_array(value)
                                       ON (true))
                                    LEFT JOIN LATERAL public.convert_string_list_to_array_elements((
                                            activity_incoming_data.activity_payload #>>
                                            '{form_data,activity_data,invasive_species_agency_code}'::text[])) funding_list(f1)
                                      ON (true))
                                WHERE ((activity_incoming_data.activity_incoming_data_id IN
                                        (SELECT activity_current.incoming_data_id
                                         FROM invasivesbc.activity_current)) AND
                                       ((activity_incoming_data.form_status)::text = 'Submitted'::text) AND
                                       (activity_incoming_data.deleted_timestamp IS NULL) AND
                                       ((activity_incoming_data.activity_subtype)::text =
                                        'Activity_Monitoring_BiocontrolRelease_TerrestrialPlant'::text))),
             array_aggregate AS (SELECT a.activity_incoming_data_id,
                                        string_agg(DISTINCT (a.project_code_array #>> '{description}'::text[]),
                                                   ', '::text) AS project,
                                        string_agg(DISTINCT (a.person_array #>> '{person_name}'::text[]),
                                                   ', '::text) AS person_name,
                                        string_agg(DISTINCT
                                                   CASE
                                                       WHEN ((a.person_array #>> '{applicator_license}'::text[]) IS NOT NULL)
                                                           THEN concat((a.person_array #>> '{person_name}'::text[]),
                                                                       ', ',
                                                                       (a.person_array #>> '{applicator_license}'::text[]))
                                                       ELSE (a.person_array #>> '{person_name}'::text[])
                                                       END,
                                                   ', '::text) AS treatment_person_name,
                                        string_agg(DISTINCT concat(jurisdiction_codes.code_description, ' ',
                                                                   ((a.jurisdictions_array #>> '{percent_covered}'::text[]) || '%'::text)),
                                                   ', '::text) AS jurisdiction,
                                        string_agg(DISTINCT (invasive_species_agency_codes.code_description)::text,
                                                   ', '::text) AS funding_agency
                                 FROM ((((array_elements a
                                     LEFT JOIN invasivesbc.code_header jurisdiction_code_header ON ((
                                         ((jurisdiction_code_header.code_header_title)::text =
                                          'jurisdiction_code'::text) AND
                                         (jurisdiction_code_header.valid_to IS NULL))))
                                     LEFT JOIN invasivesbc.code jurisdiction_codes
                                         ON (((jurisdiction_codes.code_header_id =
                                               jurisdiction_code_header.code_header_id) AND
                                              ((a.jurisdictions_array #>> '{jurisdiction_code}'::text[]) =
                                               (jurisdiction_codes.code_name)::text))))
                                     LEFT JOIN invasivesbc.code_header invasive_species_agency_code_header ON ((
                                         ((invasive_species_agency_code_header.code_header_title)::text =
                                          'invasive_species_agency_code'::text) AND
                                         (invasive_species_agency_code_header.valid_to IS NULL))))
                                     LEFT JOIN invasivesbc.code invasive_species_agency_codes ON ((
                                         (invasive_species_agency_codes.code_header_id =
                                          invasive_species_agency_code_header.code_header_id) AND
                                         (a.funding_list = (invasive_species_agency_codes.code_name)::text))))
                                 GROUP BY a.activity_incoming_data_id),
             common_fields AS (SELECT p.jurisdiction,
                                      a.activity_incoming_data_id,
                                      a.activity_id,
                                      (a.activity_payload #>> '{short_id}'::text[])                            AS short_id,
                                      p.project                                                                AS project_code,
                                      (a.activity_payload #>> '{activity_type}'::text[])                       AS activity_type,
                                      (a.activity_payload #>> '{activity_subtype}'::text[])                    AS activity_subtype,
                                      a.form_status,
                                      to_char(to_timestamp(
                                                      (a.activity_payload #>>
                                                       '{form_data,activity_data,activity_date_time}'::text[]),
                                                      'YYYY-MM-DD"T"HH24:MI:SS'::text),
                                              'YYYY-MM-DD HH24:MI:SS'::text)                                   AS activity_date_time,
                                      (a.activity_payload #>> '{form_data,activity_data,utm_zone}'::text[])    AS utm_zone,
                                      (a.activity_payload #>> '{form_data,activity_data,utm_easting}'::text[]) AS utm_easting,
                                      (a.activity_payload #>>
                                       '{form_data,activity_data,utm_northing}'::text[])                       AS utm_northing,
                                      (a.activity_payload #>> '{form_data,activity_data,latitude}'::text[])    AS latitude,
                                      (a.activity_payload #>> '{form_data,activity_data,longitude}'::text[])   AS longitude,
                                      translate((a.activity_payload #>> '{species_positive}'::text[]), '[]"'::text,
                                                ''::text)                                                      AS species_positive,
                                      jsonb_array_length((a.activity_payload #> '{species_positive}'::text[])) AS positive_species_count,
                                      translate((a.activity_payload #>> '{species_negative}'::text[]), '[]"'::text,
                                                ''::text)                                                      AS species_negative,
                                      jsonb_array_length((a.activity_payload #> '{species_negative}'::text[])) AS negative_species_count,
                                      (a.activity_payload #>>
                                       '{form_data,activity_data,reported_area}'::text[])                      AS reported_area_sqm,
                                      (a.activity_payload #>>
                                       '{form_data,activity_type_data,pre_treatment_observation}'::text[])     AS pre_treatment_observation,
                                      p.person_name                                                            AS observation_person,
                                      p.treatment_person_name                                                  AS treatment_person,
                                      (a.activity_payload #>>
                                       '{form_data,activity_data,employer_code}'::text[])                      AS employer_code,
                                      employer_codes.code_description                                          AS employer_description,
                                      p.funding_agency,
                                      (a.activity_payload #>>
                                       '{form_data,activity_data,access_description}'::text[])                 AS access_description,
                                      (a.activity_payload #>>
                                       '{form_data,activity_data,location_description}'::text[])               AS location_description,
                                      (a.activity_payload #>>
                                       '{form_data,activity_data,general_comment}'::text[])                    AS comment,
                                      a.elevation,
                                      a.well_proximity,
                                      a.geom,
                                      a.geog,
                                      a.biogeoclimatic_zones,
                                      a.regional_invasive_species_organization_areas,
                                      a.invasive_plant_management_areas,
                                      a.ownership,
                                      a.regional_districts,
                                      a.flnro_districts,
                                      a.moti_districts,
                                      CASE
                                          WHEN (a.media_keys IS NULL) THEN 'No'::text
                                          ELSE 'Yes'::text
                                          END                                                                  AS photo,
                                      a.created_timestamp,
                                      a.received_timestamp
                               FROM (((invasivesbc.activity_incoming_data a
                                   LEFT JOIN array_aggregate p
                                       ON ((p.activity_incoming_data_id = a.activity_incoming_data_id)))
                                   LEFT JOIN invasivesbc.code_header employer_code_header
                                      ON ((((employer_code_header.code_header_title)::text = 'employer_code'::text) AND
                                           (employer_code_header.valid_to IS NULL))))
                                   LEFT JOIN invasivesbc.code employer_codes
                                     ON (((employer_codes.code_header_id = employer_code_header.code_header_id) AND
                                          ((a.activity_payload #>> '{form_data,activity_data,employer_code}'::text[]) =
                                           (employer_codes.code_name)::text))))
                               WHERE ((a.activity_incoming_data_id IN (SELECT activity_current.incoming_data_id
                                                                       FROM invasivesbc.activity_current)) AND
                                      ((a.form_status)::text = 'Submitted'::text) AND (a.deleted_timestamp IS NULL) AND
                                      ((a.activity_subtype)::text =
                                       'Activity_Monitoring_BiocontrolRelease_TerrestrialPlant'::text))),
             biocontrol_release_monitoring_json AS (SELECT activity_incoming_data.activity_incoming_data_id,
                                                           activity_incoming_data.activity_subtype,
                                                           activity_incoming_data.form_status,
                                                           (activity_incoming_data.activity_payload #>>
                                                            '{form_data,activity_type_data,linked_id}'::text[]) AS linked_treatment_id,
                                                           (activity_incoming_data.activity_payload #>
                                                            '{form_data,activity_subtype_data}'::text[])        AS json_data
                                                    FROM invasivesbc.activity_incoming_data
                                                    WHERE ((activity_incoming_data.activity_incoming_data_id IN
                                                            (SELECT activity_current.incoming_data_id
                                                             FROM invasivesbc.activity_current)) AND
                                                           ((activity_incoming_data.form_status)::text = 'Submitted'::text) AND
                                                           (activity_incoming_data.deleted_timestamp IS NULL) AND
                                                           ((activity_incoming_data.activity_subtype)::text =
                                                            'Activity_Monitoring_BiocontrolRelease_TerrestrialPlant'::text))),
             agent_location_code AS (SELECT concat(activity_incoming_data.activity_incoming_data_id, '-',
                                                   (biocontrol_release_information.value ->> 'invasive_plant_code'::text),
                                                   '-',
                                                   (biocontrol_release_information.value ->> 'biological_agent_code'::text)) AS agent_id,
                                            public.convert_string_list_to_array_elements((
                                                    biocontrol_release_information.value ->>
                                                    'bio_agent_location_code'::text))                                        AS bio_agent_location_code
                                     FROM invasivesbc.activity_incoming_data,
                                          LATERAL jsonb_array_elements((activity_incoming_data.activity_payload #>
                                                                        '{form_data,activity_subtype_data,Monitoring_BiocontrolRelease_TerrestrialPlant_Information}'::text[])) biocontrol_release_information(value)
                                     WHERE ((activity_incoming_data.activity_incoming_data_id IN
                                             (SELECT activity_current.incoming_data_id
                                              FROM invasivesbc.activity_current)) AND
                                            ((activity_incoming_data.form_status)::text = 'Submitted'::text) AND
                                            (activity_incoming_data.deleted_timestamp IS NULL) AND
                                            ((activity_incoming_data.activity_subtype)::text =
                                             'Activity_Monitoring_BiocontrolRelease_TerrestrialPlant'::text))),
             agent_location_code_agg AS (SELECT a.agent_id,
                                                string_agg((location_agents_found_codes.code_description)::text, ', '::text
                                                           ORDER BY (location_agents_found_codes.code_description)::text) AS location_agent_found
                                         FROM ((agent_location_code a
                                             LEFT JOIN invasivesbc.code_header location_agents_found_code_header ON ((
                                                 ((location_agents_found_code_header.code_header_title)::text =
                                                  'location_agents_found_code'::text) AND
                                                 (location_agents_found_code_header.valid_to IS NULL))))
                                             LEFT JOIN invasivesbc.code location_agents_found_codes ON ((
                                                 (location_agents_found_codes.code_header_id =
                                                  location_agents_found_code_header.code_header_id) AND
                                                 (a.bio_agent_location_code =
                                                  (location_agents_found_codes.code_name)::text))))
                                         GROUP BY a.agent_id),
             agent_presence_code AS (SELECT concat(activity_incoming_data.activity_incoming_data_id, '-',
                                                   (biocontrol_release_information.value ->> 'invasive_plant_code'::text),
                                                   '-',
                                                   (biocontrol_release_information.value ->> 'biological_agent_code'::text)) AS agent_id,
                                            public.convert_string_list_to_array_elements((
                                                    biocontrol_release_information.value ->>
                                                    'biological_agent_presence_code'::text))                                 AS biological_agent_presence_code
                                     FROM invasivesbc.activity_incoming_data,
                                          LATERAL jsonb_array_elements((activity_incoming_data.activity_payload #>
                                                                        '{form_data,activity_subtype_data,Monitoring_BiocontrolRelease_TerrestrialPlant_Information}'::text[])) biocontrol_release_information(value)
                                     WHERE ((activity_incoming_data.activity_incoming_data_id IN
                                             (SELECT activity_current.incoming_data_id
                                              FROM invasivesbc.activity_current)) AND
                                            ((activity_incoming_data.form_status)::text = 'Submitted'::text) AND
                                            (activity_incoming_data.deleted_timestamp IS NULL) AND
                                            ((activity_incoming_data.activity_subtype)::text =
                                             'Activity_Monitoring_BiocontrolRelease_TerrestrialPlant'::text))),
             agent_presence_code_agg AS (SELECT a.agent_id,
                                                string_agg((biological_agent_presence_codes.code_description)::text,
                                                           ', '::text
                                                           ORDER BY (biological_agent_presence_codes.code_description)::text) AS biological_agent_presence
                                         FROM ((agent_presence_code a
                                             LEFT JOIN invasivesbc.code_header biological_agent_presence_code_header
                                                ON ((
                                                        ((biological_agent_presence_code_header.code_header_title)::text =
                                                         'biological_agent_presence_code'::text) AND
                                                        (biological_agent_presence_code_header.valid_to IS NULL))))
                                             LEFT JOIN invasivesbc.code biological_agent_presence_codes ON ((
                                                 (biological_agent_presence_codes.code_header_id =
                                                  biological_agent_presence_code_header.code_header_id) AND
                                                 (a.biological_agent_presence_code =
                                                  (biological_agent_presence_codes.code_name)::text))))
                                         GROUP BY a.agent_id),
             biocontrol_release_monitoring_array AS (SELECT concat(activity_incoming_data.activity_incoming_data_id,
                                                                   '-',
                                                                   (biocontrol_release_information.value ->> 'invasive_plant_code'::text),
                                                                   '-',
                                                                   (biocontrol_release_information.value ->> 'biological_agent_code'::text)) AS agent_id,
                                                            activity_incoming_data.activity_incoming_data_id,
                                                            (biocontrol_release_information.value ->> 'invasive_plant_code'::text)           AS invasive_plant_code,
                                                            (biocontrol_release_information.value ->> 'biological_agent_code'::text)         AS biological_agent_code,
                                                            (biocontrol_release_information.value ->> 'biocontrol_present'::text)            AS biocontrol_present,
                                                            (biocontrol_release_information.value ->> 'monitoring_type'::text)               AS monitoring_type,
                                                            (biocontrol_release_information.value ->> 'plant_count'::text)                   AS plant_count,
                                                            (biocontrol_release_information.value ->>
                                                             'biocontrol_monitoring_methods_code'::text)                                     AS biocontrol_monitoring_methods_code,
                                                            (biocontrol_release_information.value ->> 'start_time'::text)                    AS start_time,
                                                            (biocontrol_release_information.value ->> 'stop_time'::text)                     AS stop_time,
                                                            (biocontrol_release_information.value ->>
                                                             'total_bio_agent_quantity_actual'::text)                                        AS total_bio_agent_quantity_actual,
                                                            (biocontrol_release_information.value ->>
                                                             'total_bio_agent_quantity_estimated'::text)                                     AS total_bio_agent_quantity_estimated
                                                     FROM invasivesbc.activity_incoming_data,
                                                          LATERAL jsonb_array_elements((
                                                                  activity_incoming_data.activity_payload #>
                                                                  '{form_data,activity_subtype_data,Monitoring_BiocontrolRelease_TerrestrialPlant_Information}'::text[])) biocontrol_release_information(value)
                                                     WHERE ((activity_incoming_data.activity_incoming_data_id IN
                                                             (SELECT activity_current.incoming_data_id
                                                              FROM invasivesbc.activity_current)) AND
                                                            ((activity_incoming_data.form_status)::text = 'Submitted'::text) AND
                                                            (activity_incoming_data.deleted_timestamp IS NULL) AND
                                                            ((activity_incoming_data.activity_subtype)::text =
                                                             'Activity_Monitoring_BiocontrolRelease_TerrestrialPlant'::text))),
             actual_agents AS (SELECT concat(activity_incoming_data.activity_incoming_data_id, '-',
                                             (biocontrol_release_information.value ->> 'invasive_plant_code'::text),
                                             '-',
                                             (biocontrol_release_information.value ->> 'biological_agent_code'::text)) AS agent_id,
                                      activity_incoming_data.activity_incoming_data_id,
                                      string_agg((biological_agent_stage_codes.code_description)::text, ', '::text
                                                 ORDER BY (biological_agent_stage_codes.code_description)::text)       AS actual_biological_agent_stage,
                                      string_agg((actual_biological_agents.value ->> 'release_quantity'::text), ', '::text
                                                 ORDER BY biological_agent_stage_codes.code_description)               AS actual_release_quantity,
                                      string_agg((actual_plant_position_codes.code_description)::text, ', '::text
                                                 ORDER BY biological_agent_stage_codes.code_description)               AS actual_agent_location,
                                      string_agg((actual_agent_location_codes.code_description)::text, ', '::text
                                                 ORDER BY biological_agent_stage_codes.code_description)               AS actual_plant_position
                               FROM invasivesbc.activity_incoming_data,
                                    (((((((LATERAL jsonb_array_elements((activity_incoming_data.activity_payload #>
                                                                         '{form_data,activity_subtype_data,Monitoring_BiocontrolRelease_TerrestrialPlant_Information}'::text[])) biocontrol_release_information(value)
                                        LEFT JOIN LATERAL jsonb_array_elements((biocontrol_release_information.value #>
                                                                                '{actual_biological_agents}'::text[])) actual_biological_agents(value)
                                           ON (true))
                                        LEFT JOIN invasivesbc.code_header biological_agent_stage_code_header ON ((
                                            ((biological_agent_stage_code_header.code_header_title)::text =
                                             'biological_agent_stage_code'::text) AND
                                            (biological_agent_stage_code_header.valid_to IS NULL))))
                                        LEFT JOIN invasivesbc.code biological_agent_stage_codes ON ((
                                            (biological_agent_stage_codes.code_header_id =
                                             biological_agent_stage_code_header.code_header_id) AND
                                            ((actual_biological_agents.value ->> 'biological_agent_stage_code'::text) =
                                             (biological_agent_stage_codes.code_name)::text))))
                                        LEFT JOIN invasivesbc.code_header actual_plant_position_code_header ON ((
                                            ((actual_plant_position_code_header.code_header_title)::text =
                                             'plant_position_code'::text) AND
                                            (actual_plant_position_code_header.valid_to IS NULL))))
                                        LEFT JOIN invasivesbc.code actual_plant_position_codes ON ((
                                            (actual_plant_position_codes.code_header_id =
                                             actual_plant_position_code_header.code_header_id) AND
                                            ((actual_biological_agents.value ->> 'plant_position'::text) =
                                             (actual_plant_position_codes.code_name)::text))))
                                        LEFT JOIN invasivesbc.code_header actual_agent_location_code_header ON ((
                                            ((actual_agent_location_code_header.code_header_title)::text =
                                             'agent_location_code'::text) AND
                                            (actual_agent_location_code_header.valid_to IS NULL))))
                                        LEFT JOIN invasivesbc.code actual_agent_location_codes ON ((
                                            (actual_agent_location_codes.code_header_id =
                                             actual_agent_location_code_header.code_header_id) AND
                                            ((actual_biological_agents.value ->> 'agent_location'::text) =
                                             (actual_agent_location_codes.code_name)::text))))
                               WHERE ((activity_incoming_data.activity_incoming_data_id IN
                                       (SELECT activity_current.incoming_data_id
                                        FROM invasivesbc.activity_current)) AND
                                      ((activity_incoming_data.form_status)::text = 'Submitted'::text) AND
                                      (activity_incoming_data.deleted_timestamp IS NULL) AND
                                      ((activity_incoming_data.activity_subtype)::text =
                                       'Activity_Monitoring_BiocontrolRelease_TerrestrialPlant'::text))
                               GROUP BY activity_incoming_data.activity_incoming_data_id,
                                        (concat(activity_incoming_data.activity_incoming_data_id, '-',
                                                (biocontrol_release_information.value ->> 'invasive_plant_code'::text),
                                                '-',
                                                (biocontrol_release_information.value ->> 'biological_agent_code'::text)))),
             estimated_agents AS (SELECT concat(activity_incoming_data.activity_incoming_data_id, '-',
                                                (biocontrol_release_information.value ->> 'invasive_plant_code'::text),
                                                '-',
                                                (biocontrol_release_information.value ->> 'biological_agent_code'::text)) AS agent_id,
                                         activity_incoming_data.activity_incoming_data_id,
                                         string_agg((biological_agent_stage_codes.code_description)::text, ', '::text
                                                    ORDER BY (biological_agent_stage_codes.code_description)::text)       AS estimated_biological_agent_stage,
                                         string_agg((estimated_biological_agents.value ->> 'release_quantity'::text),
                                                    ', '::text
                                                    ORDER BY biological_agent_stage_codes.code_description)               AS estimated_release_quantity,
                                         string_agg((estimated_plant_position_codes.code_description)::text, ', '::text
                                                    ORDER BY biological_agent_stage_codes.code_description)               AS estimated_agent_location,
                                         string_agg((estimated_agent_location_codes.code_description)::text, ', '::text
                                                    ORDER BY biological_agent_stage_codes.code_description)               AS estimated_plant_position
                                  FROM invasivesbc.activity_incoming_data,
                                       (((((((LATERAL jsonb_array_elements((activity_incoming_data.activity_payload #>
                                                                            '{form_data,activity_subtype_data,Monitoring_BiocontrolRelease_TerrestrialPlant_Information}'::text[])) biocontrol_release_information(value)
                                           LEFT JOIN LATERAL jsonb_array_elements((
                                                   biocontrol_release_information.value #>
                                                   '{estimated_biological_agents}'::text[])) estimated_biological_agents(value)
                                              ON (true))
                                           LEFT JOIN invasivesbc.code_header biological_agent_stage_code_header ON ((
                                               ((biological_agent_stage_code_header.code_header_title)::text =
                                                'biological_agent_stage_code'::text) AND
                                               (biological_agent_stage_code_header.valid_to IS NULL))))
                                           LEFT JOIN invasivesbc.code biological_agent_stage_codes ON ((
                                               (biological_agent_stage_codes.code_header_id =
                                                biological_agent_stage_code_header.code_header_id) AND
                                               ((estimated_biological_agents.value ->>
                                                 'biological_agent_stage_code'::text) =
                                                (biological_agent_stage_codes.code_name)::text))))
                                           LEFT JOIN invasivesbc.code_header estimated_plant_position_code_header ON ((
                                               ((estimated_plant_position_code_header.code_header_title)::text =
                                                'plant_position_code'::text) AND
                                               (estimated_plant_position_code_header.valid_to IS NULL))))
                                           LEFT JOIN invasivesbc.code estimated_plant_position_codes ON ((
                                               (estimated_plant_position_codes.code_header_id =
                                                estimated_plant_position_code_header.code_header_id) AND
                                               ((estimated_biological_agents.value ->> 'plant_position'::text) =
                                                (estimated_plant_position_codes.code_name)::text))))
                                           LEFT JOIN invasivesbc.code_header estimated_agent_location_code_header ON ((
                                               ((estimated_agent_location_code_header.code_header_title)::text =
                                                'agent_location_code'::text) AND
                                               (estimated_agent_location_code_header.valid_to IS NULL))))
                                           LEFT JOIN invasivesbc.code estimated_agent_location_codes ON ((
                                               (estimated_agent_location_codes.code_header_id =
                                                estimated_agent_location_code_header.code_header_id) AND
                                               ((estimated_biological_agents.value ->> 'agent_location'::text) =
                                                (estimated_agent_location_codes.code_name)::text))))
                                  WHERE ((activity_incoming_data.activity_incoming_data_id IN
                                          (SELECT activity_current.incoming_data_id
                                           FROM invasivesbc.activity_current)) AND
                                         ((activity_incoming_data.form_status)::text = 'Submitted'::text) AND
                                         (activity_incoming_data.deleted_timestamp IS NULL) AND
                                         ((activity_incoming_data.activity_subtype)::text =
                                          'Activity_Monitoring_BiocontrolRelease_TerrestrialPlant'::text))
                                  GROUP BY activity_incoming_data.activity_incoming_data_id,
                                           (concat(activity_incoming_data.activity_incoming_data_id, '-',
                                                   (biocontrol_release_information.value ->> 'invasive_plant_code'::text),
                                                   '-',
                                                   (biocontrol_release_information.value ->> 'biological_agent_code'::text)))),
             monitoring_array_select AS (SELECT r.activity_incoming_data_id,
                                                invasive_plant_codes.code_description                AS invasive_plant,
                                                biological_agent_codes.code_description              AS biological_agent,
                                                r.biocontrol_present,
                                                p.biological_agent_presence,
                                                l.location_agent_found,
                                                r.monitoring_type,
                                                r.plant_count,
                                                biocontrol_monitoring_methods_codes.code_description AS monitoring_method,
                                                r.start_time,
                                                r.stop_time,
                                                a.actual_biological_agent_stage,
                                                a.actual_release_quantity,
                                                a.actual_plant_position,
                                                a.actual_agent_location,
                                                e.estimated_biological_agent_stage,
                                                e.estimated_release_quantity,
                                                e.estimated_plant_position,
                                                e.estimated_agent_location,
                                                r.total_bio_agent_quantity_actual,
                                                r.total_bio_agent_quantity_estimated
                                         FROM ((((((((((biocontrol_release_monitoring_array r
                                             LEFT JOIN actual_agents a ON ((a.agent_id = r.agent_id)))
                                             LEFT JOIN estimated_agents e ON ((e.agent_id = r.agent_id)))
                                             LEFT JOIN agent_location_code_agg l ON ((l.agent_id = r.agent_id)))
                                             LEFT JOIN agent_presence_code_agg p ON ((p.agent_id = r.agent_id)))
                                             LEFT JOIN invasivesbc.code_header invasive_plant_code_header ON ((
                                                 ((invasive_plant_code_header.code_header_title)::text =
                                                  'invasive_plant_code'::text) AND
                                                 (invasive_plant_code_header.valid_to IS NULL))))
                                             LEFT JOIN invasivesbc.code invasive_plant_codes ON ((
                                                 (invasive_plant_codes.code_header_id =
                                                  invasive_plant_code_header.code_header_id) AND
                                                 (r.invasive_plant_code = (invasive_plant_codes.code_name)::text))))
                                             LEFT JOIN invasivesbc.code_header biological_agent_code_header ON ((
                                                 ((biological_agent_code_header.code_header_title)::text =
                                                  'biological_agent_code'::text) AND
                                                 (biological_agent_code_header.valid_to IS NULL))))
                                             LEFT JOIN invasivesbc.code biological_agent_codes ON ((
                                                 (biological_agent_codes.code_header_id =
                                                  biological_agent_code_header.code_header_id) AND
                                                 (r.biological_agent_code = (biological_agent_codes.code_name)::text))))
                                             LEFT JOIN invasivesbc.code_header biocontrol_monitoring_methods_code_header
                                                ON ((
                                                        ((biocontrol_monitoring_methods_code_header.code_header_title)::text =
                                                         'biocontrol_monitoring_methods_code'::text) AND
                                                        (biocontrol_monitoring_methods_code_header.valid_to IS NULL))))
                                             LEFT JOIN invasivesbc.code biocontrol_monitoring_methods_codes ON ((
                                                 (biocontrol_monitoring_methods_codes.code_header_id =
                                                  biocontrol_monitoring_methods_code_header.code_header_id) AND
                                                 (r.biocontrol_monitoring_methods_code =
                                                  (biocontrol_monitoring_methods_codes.code_name)::text))))),
             biocontrol_release_monitoring_select AS (SELECT b_1.activity_incoming_data_id,
                                                             b_1.linked_treatment_id,
                                                             (b_1.json_data #>> '{Weather_Conditions,temperature}'::text[])         AS temperature,
                                                             (b_1.json_data #>> '{Weather_Conditions,cloud_cover_code}'::text[])    AS cloud_cover_code,
                                                             cloud_cover_codes.code_description                                     AS cloud_cover,
                                                             (b_1.json_data #>> '{Weather_Conditions,precipitation_code}'::text[])  AS precipitation_code,
                                                             precipitation_codes.code_description                                   AS precipitation,
                                                             (b_1.json_data #>> '{Weather_Conditions,wind_speed}'::text[])          AS wind_speed,
                                                             (b_1.json_data #>> '{Weather_Conditions,wind_direction_code}'::text[]) AS wind_aspect,
                                                             (b_1.json_data #>> '{Weather_Conditions,weather_comments}'::text[])    AS weather_comments,
                                                             (b_1.json_data #>>
                                                              '{Microsite_Conditions,mesoslope_position_code}'::text[])             AS mesoslope_position_code,
                                                             mesoslope_position_codes.code_description                              AS mesoslope_position,
                                                             (b_1.json_data #>>
                                                              '{Microsite_Conditions,site_surface_shape_code}'::text[])             AS site_surface_shape_code,
                                                             site_surface_shape_codes.code_description                              AS site_surface_shape,
                                                             a.invasive_plant,
                                                             a.biological_agent,
                                                             a.biocontrol_present,
                                                             a.biological_agent_presence,
                                                             a.monitoring_type,
                                                             a.plant_count,
                                                             a.monitoring_method,
                                                             a.start_time,
                                                             a.stop_time,
                                                             a.actual_biological_agent_stage,
                                                             a.actual_release_quantity,
                                                             a.estimated_biological_agent_stage,
                                                             a.estimated_release_quantity,
                                                             a.total_bio_agent_quantity_actual,
                                                             a.total_bio_agent_quantity_estimated,
                                                             (b_1.json_data #>>
                                                              '{Target_Plant_Phenology,phenology_details_recorded}'::text[])        AS phenology_details_recorded,
                                                             translate((b_1.json_data #>>
                                                                        '{Target_Plant_Phenology,target_plant_heights}'::text[]),
                                                                       '[{}]'::text,
                                                                       ''::text)                                                    AS target_plant_heights_cm,
                                                             (b_1.json_data #>> '{Target_Plant_Phenology,winter_dormant}'::text[])  AS winter_dormant,
                                                             (b_1.json_data #>> '{Target_Plant_Phenology,seedlings}'::text[])       AS seedlings,
                                                             (b_1.json_data #>> '{Target_Plant_Phenology,rosettes}'::text[])        AS rosettes,
                                                             (b_1.json_data #>> '{Target_Plant_Phenology,bolts}'::text[])           AS bolts,
                                                             (b_1.json_data #>> '{Target_Plant_Phenology,flowering}'::text[])       AS flowering,
                                                             (b_1.json_data #>> '{Target_Plant_Phenology,seeds_forming}'::text[])   AS seeds_forming,
                                                             (b_1.json_data #>> '{Target_Plant_Phenology,senescent}'::text[])       AS senescent,
                                                             (b_1.json_data #>> '{Spread_Results,spread_details_recorded}'::text[]) AS spread_details_recorded,
                                                             (b_1.json_data #>> '{Spread_Results,agent_density}'::text[])           AS agent_density,
                                                             (b_1.json_data #>> '{Spread_Results,plant_attack}'::text[])            AS plant_attack,
                                                             (b_1.json_data #>> '{Spread_Results,max_spread_distance}'::text[])     AS max_spread_distance,
                                                             (b_1.json_data #>> '{Spread_Results,max_spread_aspect}'::text[])       AS max_spread_aspect
                                                      FROM (((((((((biocontrol_release_monitoring_json b_1
                                                          JOIN monitoring_array_select a
                                                                    ON ((a.activity_incoming_data_id = b_1.activity_incoming_data_id)))
                                                          LEFT JOIN invasivesbc.code_header cloud_cover_code_header
                                                                   ON ((
                                                                           ((cloud_cover_code_header.code_header_title)::text =
                                                                            'cloud_cover_code'::text) AND
                                                                           (cloud_cover_code_header.valid_to IS NULL))))
                                                          LEFT JOIN invasivesbc.code cloud_cover_codes ON ((
                                                              (cloud_cover_codes.code_header_id =
                                                               cloud_cover_code_header.code_header_id) AND
                                                              ((b_1.json_data #>> '{Weather_Conditions,cloud_cover_code}'::text[]) =
                                                               (cloud_cover_codes.code_name)::text))))
                                                          LEFT JOIN invasivesbc.code_header precipitation_code_header
                                                                 ON ((
                                                                         ((precipitation_code_header.code_header_title)::text =
                                                                          'precipitation_code'::text) AND
                                                                         (precipitation_code_header.valid_to IS NULL))))
                                                          LEFT JOIN invasivesbc.code precipitation_codes ON ((
                                                              (precipitation_codes.code_header_id =
                                                               precipitation_code_header.code_header_id) AND
                                                              ((b_1.json_data #>> '{Weather_Conditions,precipitation_code}'::text[]) =
                                                               (precipitation_codes.code_name)::text))))
                                                          LEFT JOIN invasivesbc.code_header mesoslope_position_code_header
                                                               ON ((
                                                                       ((mesoslope_position_code_header.code_header_title)::text =
                                                                        'mesoslope_position_code'::text) AND
                                                                       (mesoslope_position_code_header.valid_to IS NULL))))
                                                          LEFT JOIN invasivesbc.code mesoslope_position_codes ON ((
                                                              (mesoslope_position_codes.code_header_id =
                                                               mesoslope_position_code_header.code_header_id) AND
                                                              ((b_1.json_data #>>
                                                                '{Microsite_Conditions,mesoslope_position_code}'::text[]) =
                                                               (mesoslope_position_codes.code_name)::text))))
                                                          LEFT JOIN invasivesbc.code_header site_surface_shape_code_header
                                                             ON ((
                                                                     ((site_surface_shape_code_header.code_header_title)::text =
                                                                      'site_surface_shape_code'::text) AND
                                                                     (site_surface_shape_code_header.valid_to IS NULL))))
                                                          LEFT JOIN invasivesbc.code site_surface_shape_codes ON ((
                                                              (site_surface_shape_codes.code_header_id =
                                                               site_surface_shape_code_header.code_header_id) AND
                                                              ((b_1.json_data #>>
                                                                '{Microsite_Conditions,site_surface_shape_code}'::text[]) =
                                                               (site_surface_shape_codes.code_name)::text)))))
        SELECT c.activity_incoming_data_id,
               c.activity_id,
               c.short_id,
               c.project_code,
               c.activity_date_time,
               c.reported_area_sqm,
               c.latitude,
               c.longitude,
               c.utm_zone,
               c.utm_easting,
               c.utm_northing,
               c.employer_description                 AS employer,
               c.funding_agency,
               c.jurisdiction,
               c.access_description,
               c.location_description,
               c.comment,
               c.observation_person,
               b.linked_treatment_id,
               b.temperature,
               b.cloud_cover,
               b.precipitation,
               b.wind_speed,
               b.wind_aspect                          AS wind_direction,
               b.weather_comments,
               b.mesoslope_position,
               b.site_surface_shape,
               b.invasive_plant,
               b.biological_agent,
               CASE
                   WHEN (b.biocontrol_present = 'true'::text) THEN 'Yes'::text
                   ELSE 'No'::text
                   END                                AS biocontrol_present,
               b.biological_agent_presence,
               b.monitoring_type,
               b.plant_count,
               b.monitoring_method,
               to_char(to_timestamp(b.start_time, 'YYYY-MM-DD"T"HH24:MI:SS'::text),
                       'YYYY-MM-DD HH24:MI:SS'::text) AS start_time,
               to_char(to_timestamp(b.stop_time, 'YYYY-MM-DD"T"HH24:MI:SS'::text),
                       'YYYY-MM-DD HH24:MI:SS'::text) AS stop_time,
               b.actual_biological_agent_stage,
               b.actual_release_quantity              AS actual_agent_count,
               b.estimated_biological_agent_stage,
               b.estimated_release_quantity           AS estimated_agent_count,
               b.total_bio_agent_quantity_actual      AS total_agent_quantity_actual,
               b.total_bio_agent_quantity_estimated   AS total_agent_quantity_estimated,
               b.phenology_details_recorded,
               b.target_plant_heights_cm,
               b.winter_dormant,
               b.seedlings,
               b.rosettes,
               b.bolts,
               b.flowering,
               b.seeds_forming,
               b.senescent,
               b.spread_details_recorded,
               b.agent_density,
               b.plant_attack,
               b.max_spread_distance,
               b.max_spread_aspect,
               c.elevation,
               c.well_proximity,
               c.biogeoclimatic_zones,
               c.regional_invasive_species_organization_areas,
               c.invasive_plant_management_areas,
               c.ownership,
               c.regional_districts,
               c.flnro_districts,
               c.moti_districts,
               c.photo,
               c.created_timestamp,
               c.received_timestamp,
               public.st_astext(c.geog)               AS geography
        FROM (common_fields c
            JOIN biocontrol_release_monitoring_select b
              ON ((b.activity_incoming_data_id = c.activity_incoming_data_id)));
        CREATE VIEW invasivesbc.biocontrol_release_summary AS
        WITH array_elements AS (SELECT activity_incoming_data.activity_incoming_data_id,
                                       activity_incoming_data.activity_subtype,
                                       jurisdictions_array.value AS jurisdictions_array,
                                       project_code_array.value  AS project_code_array,
                                       person_array.value        AS person_array,
                                       funding_list.f1           AS funding_list
                                FROM ((((invasivesbc.activity_incoming_data
                                    LEFT JOIN LATERAL jsonb_array_elements((activity_incoming_data.activity_payload #>
                                                                            '{form_data,activity_data,jurisdictions}'::text[])) jurisdictions_array(value)
                                         ON (true))
                                    LEFT JOIN LATERAL jsonb_array_elements((activity_incoming_data.activity_payload #>
                                                                            '{form_data,activity_data,project_code}'::text[])) project_code_array(value)
                                        ON (true))
                                    LEFT JOIN LATERAL jsonb_array_elements((activity_incoming_data.activity_payload #>
                                                                            '{form_data,activity_type_data,activity_persons}'::text[])) person_array(value)
                                       ON (true))
                                    LEFT JOIN LATERAL public.convert_string_list_to_array_elements((
                                            activity_incoming_data.activity_payload #>>
                                            '{form_data,activity_data,invasive_species_agency_code}'::text[])) funding_list(f1)
                                      ON (true))
                                WHERE ((activity_incoming_data.activity_incoming_data_id IN
                                        (SELECT activity_current.incoming_data_id
                                         FROM invasivesbc.activity_current)) AND
                                       ((activity_incoming_data.form_status)::text = 'Submitted'::text) AND
                                       (activity_incoming_data.deleted_timestamp IS NULL) AND
                                       ((activity_incoming_data.activity_subtype)::text =
                                        'Activity_Biocontrol_Release'::text))),
             array_aggregate AS (SELECT a.activity_incoming_data_id,
                                        string_agg(DISTINCT (a.project_code_array #>> '{description}'::text[]),
                                                   ', '::text) AS project,
                                        string_agg(DISTINCT (a.person_array #>> '{person_name}'::text[]),
                                                   ', '::text) AS person_name,
                                        string_agg(DISTINCT
                                                   CASE
                                                       WHEN ((a.person_array #>> '{applicator_license}'::text[]) IS NOT NULL)
                                                           THEN concat((a.person_array #>> '{person_name}'::text[]),
                                                                       ', ',
                                                                       (a.person_array #>> '{applicator_license}'::text[]))
                                                       ELSE (a.person_array #>> '{person_name}'::text[])
                                                       END,
                                                   ', '::text) AS treatment_person_name,
                                        string_agg(DISTINCT concat(jurisdiction_codes.code_description, ' ',
                                                                   ((a.jurisdictions_array #>> '{percent_covered}'::text[]) || '%'::text)),
                                                   ', '::text) AS jurisdiction,
                                        string_agg(DISTINCT (invasive_species_agency_codes.code_description)::text,
                                                   ', '::text) AS funding_agency
                                 FROM ((((array_elements a
                                     LEFT JOIN invasivesbc.code_header jurisdiction_code_header ON ((
                                         ((jurisdiction_code_header.code_header_title)::text =
                                          'jurisdiction_code'::text) AND
                                         (jurisdiction_code_header.valid_to IS NULL))))
                                     LEFT JOIN invasivesbc.code jurisdiction_codes
                                         ON (((jurisdiction_codes.code_header_id =
                                               jurisdiction_code_header.code_header_id) AND
                                              ((a.jurisdictions_array #>> '{jurisdiction_code}'::text[]) =
                                               (jurisdiction_codes.code_name)::text))))
                                     LEFT JOIN invasivesbc.code_header invasive_species_agency_code_header ON ((
                                         ((invasive_species_agency_code_header.code_header_title)::text =
                                          'invasive_species_agency_code'::text) AND
                                         (invasive_species_agency_code_header.valid_to IS NULL))))
                                     LEFT JOIN invasivesbc.code invasive_species_agency_codes ON ((
                                         (invasive_species_agency_codes.code_header_id =
                                          invasive_species_agency_code_header.code_header_id) AND
                                         (a.funding_list = (invasive_species_agency_codes.code_name)::text))))
                                 GROUP BY a.activity_incoming_data_id),
             common_fields AS (SELECT p.jurisdiction,
                                      a.activity_incoming_data_id,
                                      a.activity_id,
                                      (a.activity_payload #>> '{short_id}'::text[])                            AS short_id,
                                      p.project                                                                AS project_code,
                                      (a.activity_payload #>> '{activity_type}'::text[])                       AS activity_type,
                                      (a.activity_payload #>> '{activity_subtype}'::text[])                    AS activity_subtype,
                                      a.form_status,
                                      to_char(to_timestamp(
                                                      (a.activity_payload #>>
                                                       '{form_data,activity_data,activity_date_time}'::text[]),
                                                      'YYYY-MM-DD"T"HH24:MI:SS'::text),
                                              'YYYY-MM-DD HH24:MI:SS'::text)                                   AS activity_date_time,
                                      (a.activity_payload #>> '{form_data,activity_data,utm_zone}'::text[])    AS utm_zone,
                                      (a.activity_payload #>> '{form_data,activity_data,utm_easting}'::text[]) AS utm_easting,
                                      (a.activity_payload #>>
                                       '{form_data,activity_data,utm_northing}'::text[])                       AS utm_northing,
                                      (a.activity_payload #>> '{form_data,activity_data,latitude}'::text[])    AS latitude,
                                      (a.activity_payload #>> '{form_data,activity_data,longitude}'::text[])   AS longitude,
                                      translate((a.activity_payload #>> '{species_positive}'::text[]), '[]"'::text,
                                                ''::text)                                                      AS species_positive,
                                      jsonb_array_length((a.activity_payload #> '{species_positive}'::text[])) AS positive_species_count,
                                      translate((a.activity_payload #>> '{species_negative}'::text[]), '[]"'::text,
                                                ''::text)                                                      AS species_negative,
                                      jsonb_array_length((a.activity_payload #> '{species_negative}'::text[])) AS negative_species_count,
                                      (a.activity_payload #>>
                                       '{form_data,activity_data,reported_area}'::text[])                      AS reported_area_sqm,
                                      (a.activity_payload #>>
                                       '{form_data,activity_type_data,pre_treatment_observation}'::text[])     AS pre_treatment_observation,
                                      p.person_name                                                            AS observation_person,
                                      p.treatment_person_name                                                  AS treatment_person,
                                      (a.activity_payload #>>
                                       '{form_data,activity_data,employer_code}'::text[])                      AS employer_code,
                                      employer_codes.code_description                                          AS employer_description,
                                      p.funding_agency,
                                      (a.activity_payload #>>
                                       '{form_data,activity_data,access_description}'::text[])                 AS access_description,
                                      (a.activity_payload #>>
                                       '{form_data,activity_data,location_description}'::text[])               AS location_description,
                                      (a.activity_payload #>>
                                       '{form_data,activity_data,general_comment}'::text[])                    AS comment,
                                      a.elevation,
                                      a.well_proximity,
                                      a.geog,
                                      a.biogeoclimatic_zones,
                                      a.regional_invasive_species_organization_areas,
                                      a.invasive_plant_management_areas,
                                      a.ownership,
                                      a.regional_districts,
                                      a.flnro_districts,
                                      a.moti_districts,
                                      CASE
                                          WHEN (a.media_keys IS NULL) THEN 'No'::text
                                          ELSE 'Yes'::text
                                          END                                                                  AS photo,
                                      a.created_timestamp,
                                      a.received_timestamp
                               FROM (((invasivesbc.activity_incoming_data a
                                   LEFT JOIN array_aggregate p
                                       ON ((p.activity_incoming_data_id = a.activity_incoming_data_id)))
                                   LEFT JOIN invasivesbc.code_header employer_code_header
                                      ON ((((employer_code_header.code_header_title)::text = 'employer_code'::text) AND
                                           (employer_code_header.valid_to IS NULL))))
                                   LEFT JOIN invasivesbc.code employer_codes
                                     ON (((employer_codes.code_header_id = employer_code_header.code_header_id) AND
                                          ((a.activity_payload #>> '{form_data,activity_data,employer_code}'::text[]) =
                                           (employer_codes.code_name)::text))))
                               WHERE ((a.activity_incoming_data_id IN (SELECT activity_current.incoming_data_id
                                                                       FROM invasivesbc.activity_current)) AND
                                      ((a.form_status)::text = 'Submitted'::text) AND (a.deleted_timestamp IS NULL) AND
                                      ((a.activity_subtype)::text = 'Activity_Biocontrol_Release'::text))),
             biocontrol_release_json AS (SELECT activity_incoming_data.activity_incoming_data_id,
                                                activity_incoming_data.activity_subtype,
                                                activity_incoming_data.form_status,
                                                (activity_incoming_data.activity_payload #>>
                                                 '{form_data,activity_type_data,linked_id}'::text[]) AS linked_treatment_id,
                                                (activity_incoming_data.activity_payload #>
                                                 '{form_data,activity_subtype_data}'::text[])        AS json_data
                                         FROM invasivesbc.activity_incoming_data
                                         WHERE ((activity_incoming_data.activity_incoming_data_id IN
                                                 (SELECT activity_current.incoming_data_id
                                                  FROM invasivesbc.activity_current)) AND
                                                ((activity_incoming_data.form_status)::text = 'Submitted'::text) AND
                                                (activity_incoming_data.deleted_timestamp IS NULL) AND
                                                ((activity_incoming_data.activity_subtype)::text =
                                                 'Activity_Biocontrol_Release'::text))),
             biocontrol_release_json_array AS (SELECT concat(activity_incoming_data.activity_incoming_data_id, '-',
                                                             (biocontrol_release_information.value ->> 'invasive_plant_code'::text),
                                                             '-',
                                                             (biocontrol_release_information.value ->> 'biological_agent_code'::text)) AS agent_id,
                                                      activity_incoming_data.activity_incoming_data_id,
                                                      (biocontrol_release_information.value ->> 'invasive_plant_code'::text)           AS invasive_plant_code,
                                                      (biocontrol_release_information.value ->> 'biological_agent_code'::text)         AS biological_agent_code,
                                                      (biocontrol_release_information.value ->> 'mortality'::text)                     AS mortality,
                                                      (biocontrol_release_information.value ->> 'agent_source'::text)                  AS agent_source,
                                                      (biocontrol_release_information.value ->> 'linear_segment'::text)                AS linear_segment,
                                                      (biocontrol_release_information.value ->> 'collection_date'::text)               AS collection_date,
                                                      (biocontrol_release_information.value ->> 'plant_collected_from'::text)          AS plant_collected_from,
                                                      (biocontrol_release_information.value ->>
                                                       'plant_collected_from_unlisted'::text)                                          AS plant_collected_from_unlisted,
                                                      (biocontrol_release_information.value ->>
                                                       'total_bio_agent_quantity_actual'::text)                                        AS total_bio_agent_quantity_actual,
                                                      (biocontrol_release_information.value ->>
                                                       'total_bio_agent_quantity_estimated'::text)                                     AS total_bio_agent_quantity_estimated
                                               FROM invasivesbc.activity_incoming_data,
                                                    LATERAL jsonb_array_elements((
                                                            activity_incoming_data.activity_payload #>
                                                            '{form_data,activity_subtype_data,Biocontrol_Release_Information}'::text[])) biocontrol_release_information(value)
                                               WHERE ((activity_incoming_data.activity_incoming_data_id IN
                                                       (SELECT activity_current.incoming_data_id
                                                        FROM invasivesbc.activity_current)) AND
                                                      ((activity_incoming_data.form_status)::text = 'Submitted'::text) AND
                                                      (activity_incoming_data.deleted_timestamp IS NULL) AND
                                                      ((activity_incoming_data.activity_subtype)::text =
                                                       'Activity_Biocontrol_Release'::text))),
             actual_agents AS (SELECT concat(activity_incoming_data.activity_incoming_data_id, '-',
                                             (biocontrol_release_information.value ->> 'invasive_plant_code'::text),
                                             '-',
                                             (biocontrol_release_information.value ->> 'biological_agent_code'::text)) AS agent_id,
                                      activity_incoming_data.activity_incoming_data_id,
                                      string_agg((biological_agent_stage_codes.code_description)::text, ', '::text
                                                 ORDER BY (biological_agent_stage_codes.code_description)::text)       AS actual_biological_agent_stage,
                                      string_agg((actual_biological_agents.value ->> 'release_quantity'::text), ', '::text
                                                 ORDER BY biological_agent_stage_codes.code_description)               AS actual_release_quantity
                               FROM invasivesbc.activity_incoming_data,
                                    (((LATERAL jsonb_array_elements((activity_incoming_data.activity_payload #>
                                                                     '{form_data,activity_subtype_data,Biocontrol_Release_Information}'::text[])) biocontrol_release_information(value)
                                        LEFT JOIN LATERAL jsonb_array_elements((biocontrol_release_information.value #>
                                                                                '{actual_biological_agents}'::text[])) actual_biological_agents(value)
                                       ON (true))
                                        LEFT JOIN invasivesbc.code_header biological_agent_stage_code_header ON ((
                                            ((biological_agent_stage_code_header.code_header_title)::text =
                                             'biological_agent_stage_code'::text) AND
                                            (biological_agent_stage_code_header.valid_to IS NULL))))
                                        LEFT JOIN invasivesbc.code biological_agent_stage_codes ON ((
                                            (biological_agent_stage_codes.code_header_id =
                                             biological_agent_stage_code_header.code_header_id) AND
                                            ((actual_biological_agents.value ->> 'biological_agent_stage_code'::text) =
                                             (biological_agent_stage_codes.code_name)::text))))
                               WHERE ((activity_incoming_data.activity_incoming_data_id IN
                                       (SELECT activity_current.incoming_data_id
                                        FROM invasivesbc.activity_current)) AND
                                      ((activity_incoming_data.form_status)::text = 'Submitted'::text) AND
                                      (activity_incoming_data.deleted_timestamp IS NULL) AND
                                      ((activity_incoming_data.activity_subtype)::text =
                                       'Activity_Biocontrol_Release'::text))
                               GROUP BY activity_incoming_data.activity_incoming_data_id,
                                        (concat(activity_incoming_data.activity_incoming_data_id, '-',
                                                (biocontrol_release_information.value ->> 'invasive_plant_code'::text),
                                                '-',
                                                (biocontrol_release_information.value ->> 'biological_agent_code'::text)))),
             estimated_agents AS (SELECT concat(activity_incoming_data.activity_incoming_data_id, '-',
                                                (biocontrol_release_information.value ->> 'invasive_plant_code'::text),
                                                '-',
                                                (biocontrol_release_information.value ->> 'biological_agent_code'::text)) AS agent_id,
                                         activity_incoming_data.activity_incoming_data_id,
                                         string_agg((biological_agent_stage_codes.code_description)::text, ', '::text
                                                    ORDER BY (biological_agent_stage_codes.code_description)::text)       AS estimated_biological_agent_stage,
                                         string_agg((estimated_biological_agents.value ->> 'release_quantity'::text),
                                                    ', '::text
                                                    ORDER BY biological_agent_stage_codes.code_description)               AS estimated_release_quantity
                                  FROM invasivesbc.activity_incoming_data,
                                       (((LATERAL jsonb_array_elements((activity_incoming_data.activity_payload #>
                                                                        '{form_data,activity_subtype_data,Biocontrol_Release_Information}'::text[])) biocontrol_release_information(value)
                                           LEFT JOIN LATERAL jsonb_array_elements((
                                                   biocontrol_release_information.value #>
                                                   '{estimated_biological_agents}'::text[])) estimated_biological_agents(value)
                                          ON (true))
                                           LEFT JOIN invasivesbc.code_header biological_agent_stage_code_header ON ((
                                               ((biological_agent_stage_code_header.code_header_title)::text =
                                                'biological_agent_stage_code'::text) AND
                                               (biological_agent_stage_code_header.valid_to IS NULL))))
                                           LEFT JOIN invasivesbc.code biological_agent_stage_codes ON ((
                                               (biological_agent_stage_codes.code_header_id =
                                                biological_agent_stage_code_header.code_header_id) AND
                                               ((estimated_biological_agents.value ->>
                                                 'biological_agent_stage_code'::text) =
                                                (biological_agent_stage_codes.code_name)::text))))
                                  WHERE ((activity_incoming_data.activity_incoming_data_id IN
                                          (SELECT activity_current.incoming_data_id
                                           FROM invasivesbc.activity_current)) AND
                                         ((activity_incoming_data.form_status)::text = 'Submitted'::text) AND
                                         (activity_incoming_data.deleted_timestamp IS NULL) AND
                                         ((activity_incoming_data.activity_subtype)::text =
                                          'Activity_Biocontrol_Release'::text))
                                  GROUP BY activity_incoming_data.activity_incoming_data_id,
                                           (concat(activity_incoming_data.activity_incoming_data_id, '-',
                                                   (biocontrol_release_information.value ->> 'invasive_plant_code'::text),
                                                   '-',
                                                   (biocontrol_release_information.value ->> 'biological_agent_code'::text)))),
             release_array_select AS (SELECT r.activity_incoming_data_id,
                                             invasive_plant_codes.code_description   AS invasive_plant,
                                             biological_agent_codes.code_description AS biological_agent,
                                             r.linear_segment,
                                             r.mortality,
                                             r.agent_source,
                                             r.collection_date,
                                             r.plant_collected_from,
                                             r.plant_collected_from_unlisted,
                                             a.actual_biological_agent_stage,
                                             a.actual_release_quantity,
                                             e.estimated_biological_agent_stage,
                                             e.estimated_release_quantity,
                                             r.total_bio_agent_quantity_actual,
                                             r.total_bio_agent_quantity_estimated
                                      FROM ((((((biocontrol_release_json_array r
                                          LEFT JOIN actual_agents a ON ((a.agent_id = r.agent_id)))
                                          LEFT JOIN estimated_agents e ON ((e.agent_id = r.agent_id)))
                                          LEFT JOIN invasivesbc.code_header invasive_plant_code_header ON ((
                                              ((invasive_plant_code_header.code_header_title)::text =
                                               'invasive_plant_code'::text) AND
                                              (invasive_plant_code_header.valid_to IS NULL))))
                                          LEFT JOIN invasivesbc.code invasive_plant_codes ON ((
                                              (invasive_plant_codes.code_header_id =
                                               invasive_plant_code_header.code_header_id) AND
                                              (r.invasive_plant_code = (invasive_plant_codes.code_name)::text))))
                                          LEFT JOIN invasivesbc.code_header biological_agent_code_header ON ((
                                              ((biological_agent_code_header.code_header_title)::text =
                                               'biological_agent_code'::text) AND
                                              (biological_agent_code_header.valid_to IS NULL))))
                                          LEFT JOIN invasivesbc.code biological_agent_codes ON ((
                                              (biological_agent_codes.code_header_id =
                                               biological_agent_code_header.code_header_id) AND
                                              (r.biological_agent_code = (biological_agent_codes.code_name)::text))))),
             biocontrol_release_json_select AS (SELECT b_1.activity_incoming_data_id,
                                                       b_1.linked_treatment_id,
                                                       (b_1.json_data #>> '{Weather_Conditions,temperature}'::text[])         AS temperature,
                                                       (b_1.json_data #>> '{Weather_Conditions,cloud_cover_code}'::text[])    AS cloud_cover_code,
                                                       cloud_cover_codes.code_description                                     AS cloud_cover,
                                                       (b_1.json_data #>> '{Weather_Conditions,precipitation_code}'::text[])  AS precipitation_code,
                                                       precipitation_codes.code_description                                   AS precipitation,
                                                       (b_1.json_data #>> '{Weather_Conditions,wind_speed}'::text[])          AS wind_speed,
                                                       (b_1.json_data #>> '{Weather_Conditions,wind_direction_code}'::text[]) AS wind_aspect,
                                                       (b_1.json_data #>> '{Weather_Conditions,weather_comments}'::text[])    AS weather_comments,
                                                       (b_1.json_data #>>
                                                        '{Microsite_Conditions,mesoslope_position_code}'::text[])             AS mesoslope_position_code,
                                                       mesoslope_position_codes.code_description                              AS mesoslope_position,
                                                       (b_1.json_data #>>
                                                        '{Microsite_Conditions,site_surface_shape_code}'::text[])             AS site_surface_shape_code,
                                                       site_surface_shape_codes.code_description                              AS site_surface_shape,
                                                       a.invasive_plant,
                                                       a.biological_agent,
                                                       a.linear_segment,
                                                       a.mortality,
                                                       a.agent_source,
                                                       a.collection_date,
                                                       a.plant_collected_from,
                                                       a.plant_collected_from_unlisted,
                                                       a.actual_biological_agent_stage,
                                                       a.actual_release_quantity,
                                                       a.estimated_biological_agent_stage,
                                                       a.estimated_release_quantity,
                                                       a.total_bio_agent_quantity_actual                                      AS total_release_quantity_actual,
                                                       a.total_bio_agent_quantity_estimated                                   AS total_release_quantity_estimated
                                                FROM (((((((((biocontrol_release_json b_1
                                                    JOIN release_array_select a
                                                              ON ((a.activity_incoming_data_id = b_1.activity_incoming_data_id)))
                                                    LEFT JOIN invasivesbc.code_header cloud_cover_code_header ON ((
                                                        ((cloud_cover_code_header.code_header_title)::text =
                                                         'cloud_cover_code'::text) AND
                                                        (cloud_cover_code_header.valid_to IS NULL))))
                                                    LEFT JOIN invasivesbc.code cloud_cover_codes ON ((
                                                        (cloud_cover_codes.code_header_id =
                                                         cloud_cover_code_header.code_header_id) AND
                                                        ((b_1.json_data #>> '{Weather_Conditions,cloud_cover_code}'::text[]) =
                                                         (cloud_cover_codes.code_name)::text))))
                                                    LEFT JOIN invasivesbc.code_header precipitation_code_header ON ((
                                                        ((precipitation_code_header.code_header_title)::text =
                                                         'precipitation_code'::text) AND
                                                        (precipitation_code_header.valid_to IS NULL))))
                                                    LEFT JOIN invasivesbc.code precipitation_codes ON ((
                                                        (precipitation_codes.code_header_id =
                                                         precipitation_code_header.code_header_id) AND
                                                        ((b_1.json_data #>> '{Weather_Conditions,precipitation_code}'::text[]) =
                                                         (precipitation_codes.code_name)::text))))
                                                    LEFT JOIN invasivesbc.code_header mesoslope_position_code_header
                                                         ON ((
                                                                 ((mesoslope_position_code_header.code_header_title)::text =
                                                                  'mesoslope_position_code'::text) AND
                                                                 (mesoslope_position_code_header.valid_to IS NULL))))
                                                    LEFT JOIN invasivesbc.code mesoslope_position_codes ON ((
                                                        (mesoslope_position_codes.code_header_id =
                                                         mesoslope_position_code_header.code_header_id) AND
                                                        ((b_1.json_data #>>
                                                          '{Microsite_Conditions,mesoslope_position_code}'::text[]) =
                                                         (mesoslope_position_codes.code_name)::text))))
                                                    LEFT JOIN invasivesbc.code_header site_surface_shape_code_header
                                                       ON ((
                                                               ((site_surface_shape_code_header.code_header_title)::text =
                                                                'site_surface_shape_code'::text) AND
                                                               (site_surface_shape_code_header.valid_to IS NULL))))
                                                    LEFT JOIN invasivesbc.code site_surface_shape_codes ON ((
                                                        (site_surface_shape_codes.code_header_id =
                                                         site_surface_shape_code_header.code_header_id) AND
                                                        ((b_1.json_data #>>
                                                          '{Microsite_Conditions,site_surface_shape_code}'::text[]) =
                                                         (site_surface_shape_codes.code_name)::text)))))
        SELECT c.activity_incoming_data_id,
               c.activity_id,
               c.short_id,
               c.project_code,
               c.activity_date_time,
               c.reported_area_sqm,
               c.latitude,
               c.longitude,
               c.utm_zone,
               c.utm_easting,
               c.utm_northing,
               c.employer_description   AS employer,
               c.funding_agency,
               c.jurisdiction,
               c.access_description,
               c.location_description,
               c.comment,
               c.observation_person,
               b.temperature,
               b.cloud_cover,
               b.precipitation,
               b.wind_speed,
               b.wind_aspect            AS wind_direction,
               b.weather_comments,
               b.mesoslope_position,
               b.site_surface_shape,
               b.invasive_plant,
               b.biological_agent,
               b.linear_segment,
               b.mortality,
               b.agent_source,
               b.collection_date,
               b.plant_collected_from,
               b.plant_collected_from_unlisted,
               b.actual_biological_agent_stage,
               b.actual_release_quantity,
               b.estimated_biological_agent_stage,
               b.estimated_release_quantity,
               b.total_release_quantity_actual,
               b.total_release_quantity_estimated,
               c.elevation,
               c.well_proximity,
               c.biogeoclimatic_zones,
               c.regional_invasive_species_organization_areas,
               c.invasive_plant_management_areas,
               c.ownership,
               c.regional_districts,
               c.flnro_districts,
               c.moti_districts,
               c.photo,
               c.created_timestamp,
               c.received_timestamp,
               public.st_astext(c.geog) AS geography
        FROM (common_fields c
            JOIN biocontrol_release_json_select b ON ((b.activity_incoming_data_id = c.activity_incoming_data_id)));
        CREATE TABLE invasivesbc.biological_dispersal_extract
        (
            biologicaldispersalid                  integer                 NOT NULL,
            site_id                                integer                 NOT NULL,
            site_paper_file_id                     character varying(120),
            district_lot_number                    character varying(6),
            jurisdictions                          character varying(1000) NOT NULL,
            site_created_date                      date                    NOT NULL,
            mapsheet                               character varying(10)   NOT NULL,
            utm_zone                               integer                 NOT NULL,
            utm_easting                            integer                 NOT NULL,
            utm_northing                           integer                 NOT NULL,
            decimal_latitude                       numeric(7, 5),
            decimal_longitude                      numeric(8, 5),
            biogeoclimatic_zone                    character varying(5)    NOT NULL,
            sub_zone                               character varying(5)    NOT NULL,
            variant                                integer,
            phase                                  character varying(5),
            site_series                            character varying(5),
            soil_texture                           character varying(120),
            site_specific_use                      character varying(120)  NOT NULL,
            invasive_plant                         character varying(100)  NOT NULL,
            biological_agent                       character varying(20)   NOT NULL,
            dispersal_paper_file_id                character varying(120),
            dispersal_agency                       character varying(1000),
            inspection_date                        date,
            agent_count                            integer,
            plant_count                            integer,
            count_duration                         integer,
            foliar_feeding_damage                  character varying(1)    NOT NULL,
            rootfeeding_damage                     character varying(1)    NOT NULL,
            seedfeeding_damage                     character varying(1)    NOT NULL,
            oviposition_marks                      character varying(1)    NOT NULL,
            eggs_present                           character varying(1)    NOT NULL,
            larvae_present                         character varying(1)    NOT NULL,
            pupae_present                          character varying(1)    NOT NULL,
            adults_present                         character varying(1)    NOT NULL,
            tunnels_present                        character varying(1)    NOT NULL,
            primary_surveyor                       character varying(120),
            other_surveyors                        character varying(1000),
            dispersal_utm_zone                     integer,
            dispersal_utm_easting                  integer,
            dispersal_utm_northing                 integer,
            estimated_area_hectares                numeric(10, 4),
            distribution                           character varying(120),
            density                                character varying(120),
            monitoring_comments                    character varying(2000),
            site_location                          character varying(2000),
            site_comments                          character varying(2000),
            entered_by                             character varying(100)  NOT NULL,
            date_entered                           date                    NOT NULL,
            updated_by                             character varying(100)  NOT NULL,
            date_updated                           date                    NOT NULL,
            regional_district                      character varying(200),
            regional_invasive_species_organization character varying(200),
            invasive_plant_management_area         character varying(200)
        );
        CREATE TABLE invasivesbc.biological_monitoring_extract
        (
            biologicalmonitoringid                 integer                 NOT NULL,
            site_id                                integer                 NOT NULL,
            site_paper_file_id                     character varying(120),
            district_lot_number                    character varying(6),
            jurisdictions                          character varying(1000) NOT NULL,
            site_created_date                      date                    NOT NULL,
            mapsheet                               character varying(10)   NOT NULL,
            utm_zone                               integer                 NOT NULL,
            utm_easting                            integer                 NOT NULL,
            utm_northing                           integer                 NOT NULL,
            decimal_latitude                       numeric(7, 5),
            decimal_longitude                      numeric(8, 5),
            biogeoclimatic_zone                    character varying(5)    NOT NULL,
            sub_zone                               character varying(5)    NOT NULL,
            variant                                integer,
            phase                                  character varying(5),
            site_series                            character varying(5),
            soil_texture                           character varying(120),
            site_specific_use                      character varying(120)  NOT NULL,
            biological_agent                       character varying(20)   NOT NULL,
            treatment_date                         date,
            treatment_paper_file_id                character varying(22),
            treatment_comments                     character varying(2000),
            monitoring_paper_file_id               character varying(22),
            monitoring_agency                      character varying(120)  NOT NULL,
            inspection_date                        date,
            primary_surveyor                       character varying(120),
            other_surveyors                        character varying(1000),
            agent_count                            integer,
            plant_count                            integer,
            count_duration                         integer,
            legacy_presence                        character varying(1)    NOT NULL,
            foliar_feeding_damage                  character varying(1)    NOT NULL,
            rootfeeding_damage                     character varying(1)    NOT NULL,
            seedfeeding_damage                     character varying(1)    NOT NULL,
            oviposition_marks                      character varying(1)    NOT NULL,
            eggs_present                           character varying(1)    NOT NULL,
            larvae_present                         character varying(1)    NOT NULL,
            pupae_present                          character varying(1)    NOT NULL,
            adults_present                         character varying(1)    NOT NULL,
            tunnels_present                        character varying(1)    NOT NULL,
            invasive_plant                         character varying(100)  NOT NULL,
            estimated_area_hectares                numeric(10, 4),
            distribution                           character varying(120),
            density                                character varying(120),
            monitoring_comments                    character varying(2000),
            site_location                          character varying(2000),
            site_comments                          character varying(2000),
            entered_by                             character varying(100)  NOT NULL,
            date_entered                           date                    NOT NULL,
            updated_by                             character varying(100)  NOT NULL,
            date_updated                           date                    NOT NULL,
            regional_district                      character varying(200),
            regional_invasive_species_organization character varying(200),
            invasive_plant_management_area         character varying(200)
        );
        CREATE TABLE invasivesbc.biological_treatment_extract
        (
            biotreatmentid                         integer                 NOT NULL,
            site_id                                integer                 NOT NULL,
            site_paper_file_id                     character varying(20),
            district_lot_number                    character varying(6),
            jurisdictions                          character varying(1000) NOT NULL,
            site_created_date                      date                    NOT NULL,
            mapsheet                               character varying(10)   NOT NULL,
            utm_zone                               integer                 NOT NULL,
            utm_easting                            integer                 NOT NULL,
            utm_northing                           integer                 NOT NULL,
            decimal_latitude                       numeric(7, 5),
            decimal_longitude                      numeric(8, 5),
            biogeoclimatic_zone                    character varying(5)    NOT NULL,
            sub_zone                               character varying(5)    NOT NULL,
            variant                                integer,
            phase                                  character varying(5),
            site_series                            character varying(5),
            soil_texture                           character varying(120),
            site_specific_use                      character varying(120)  NOT NULL,
            invasive_plant                         character varying(100)  NOT NULL,
            estimated_area_hectares                numeric(10, 4)          NOT NULL,
            distribution                           character varying(120),
            density                                character varying(120),
            treatment_date                         date,
            treatment_paper_file_id                character varying(22),
            treatment_agency                       character varying(120)  NOT NULL,
            treatment_comments                     character varying(2000),
            release_quantity                       integer                 NOT NULL,
            bioagent_source                        character varying(120),
            biological_agent                       character varying(120)  NOT NULL,
            employer                               character varying(120),
            collection_date                        date,
            agent_life_stage                       character varying(10),
            release_time                           time without time zone,
            primary_applicator                     character varying(120)  NOT NULL,
            other_applicators                      character varying(1000),
            release_utm_zone                       integer,
            release_utm_easting                    integer,
            release_utm_northing                   integer,
            site_location                          character varying(2000),
            site_comments                          character varying(2000),
            entered_by                             character varying(100)  NOT NULL,
            date_entered                           date                    NOT NULL,
            updated_by                             character varying(100)  NOT NULL,
            date_updated                           date                    NOT NULL,
            regional_district                      character varying(200),
            regional_invasive_species_organization character varying(200),
            invasive_plant_management_area         character varying(200)
        );
        CREATE TABLE invasivesbc.cache_versions
        (
            id         integer                                   NOT NULL,
            cache_name character varying(255)                    NOT NULL,
            updated_at timestamp without time zone DEFAULT now() NOT NULL
        );
        COMMENT ON TABLE invasivesbc.cache_versions IS 'updated by triggers or external actions to track the last modification time of
     various tables, for use in validating both client-side and server-side caches';
        CREATE SEQUENCE invasivesbc.cache_versions_id_seq
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;
        ALTER SEQUENCE invasivesbc.cache_versions_id_seq OWNED BY invasivesbc.cache_versions.id;
        CREATE TABLE invasivesbc.chemical_monitoring_extract
        (
            chemicalmonitoringid                   integer                 NOT NULL,
            site_id                                integer                 NOT NULL,
            site_paper_file_id                     character varying(120),
            district_lot_number                    character varying(6),
            jurisdictions                          character varying(1000) NOT NULL,
            site_created_date                      date                    NOT NULL,
            mapsheet                               character varying(10)   NOT NULL,
            utm_zone                               integer                 NOT NULL,
            utm_easting                            integer                 NOT NULL,
            utm_northing                           integer                 NOT NULL,
            decimal_latitude                       numeric(7, 5),
            decimal_longitude                      numeric(8, 5),
            biogeoclimatic_zone                    character varying(5)    NOT NULL,
            sub_zone                               character varying(5)    NOT NULL,
            variant                                integer,
            phase                                  character varying(5),
            site_series                            character varying(5),
            soil_texture                           character varying(120),
            site_specific_use                      character varying(120)  NOT NULL,
            service_licence_number                 character varying(25),
            pmp_number                             character varying(120)  NOT NULL,
            pup_number                             character varying(25),
            invasive_plant                         character varying(100)  NOT NULL,
            herbicide                              character varying(120)  NOT NULL,
            treatment_method                       character varying(120)  NOT NULL,
            treatment_date                         date,
            treatment_paper_file_id                character varying(22),
            treatment_comments                     character varying(2000),
            monitoring_paper_file_id               character varying(120),
            monitoring_agency                      character varying(120)  NOT NULL,
            inspection_date                        date                    NOT NULL,
            primary_surveyor                       character varying(120),
            other_surveyors                        character varying(1000),
            efficacy_rating                        character varying(120)  NOT NULL,
            estimated_area_hectares                numeric(10, 4)          NOT NULL,
            distribution                           character varying(120),
            density                                character varying(120),
            monitoring_comments                    character varying(2000),
            site_location                          character varying(2000),
            site_comments                          character varying(2000),
            entered_by                             character varying(100)  NOT NULL,
            date_entered                           date                    NOT NULL,
            updated_by                             character varying(100)  NOT NULL,
            date_updated                           date                    NOT NULL,
            regional_district                      character varying(200),
            regional_invasive_species_organization character varying(200),
            invasive_plant_management_area         character varying(200)
        );
        CREATE TABLE invasivesbc.chemical_treatment_extract
        (
            chemicaltreatmentid                       integer                 NOT NULL,
            site_id                                   integer                 NOT NULL,
            site_paper_file_id                        character varying(20),
            district_lot_number                       character varying(6),
            jurisdictions                             character varying(1000) NOT NULL,
            site_created_date                         date                    NOT NULL,
            mapsheet                                  character varying(10)   NOT NULL,
            utm_zone                                  integer                 NOT NULL,
            utm_easting                               integer                 NOT NULL,
            utm_northing                              integer                 NOT NULL,
            decimal_latitude                          numeric(7, 5),
            decimal_longitude                         numeric(8, 5),
            biogeoclimatic_zone                       character varying(5)    NOT NULL,
            sub_zone                                  character varying(5)    NOT NULL,
            variant                                   integer,
            phase                                     character varying(5),
            site_series                               character varying(5),
            soil_texture                              character varying(120),
            site_specific_use                         character varying(120)  NOT NULL,
            service_licence_number                    character varying(25),
            pmp_number                                character varying(120)  NOT NULL,
            pup_number                                character varying(25),
            invasive_plant                            character varying(100)  NOT NULL,
            treatment_date                            date,
            treatment_paper_file_id                   character varying(22),
            treatment_agency                          character varying(120)  NOT NULL,
            treatment_comments                        character varying(2000),
            herbicide                                 character varying(120)  NOT NULL,
            method                                    character varying(120)  NOT NULL,
            area_treated_hectares                     numeric(10, 4),
            amount_of_mix_used_litres                 numeric(10, 5),
            application_rate_litres_per_hectare       numeric(6, 2),
            delivery_rate_litres_per_hectare          integer,
            dilution_percent                          numeric(8, 4),
            amount_of_undiluted_herbicide_used_litres numeric(8, 4),
            tank_mix                                  character varying(3),
            application_time                          time without time zone,
            temperature                               integer,
            wind_speed                                integer,
            wind_direction                            integer,
            humidity                                  integer,
            employer                                  character varying(120),
            primary_applicator                        character varying(120)  NOT NULL,
            other_applicators                         character varying(1000) NOT NULL,
            site_location                             character varying(2000),
            site_comments                             character varying(2000),
            entered_by                                character varying(100)  NOT NULL,
            date_entered                              date                    NOT NULL,
            updated_by                                character varying(100)  NOT NULL,
            date_updated                              date                    NOT NULL,
            regional_district                         character varying(200),
            regional_invasive_species_organization    character varying(200),
            invasive_plant_management_area            character varying(200)
        );
        CREATE VIEW invasivesbc.chemical_treatment_monitoring_summary AS
        WITH array_elements AS (SELECT activity_incoming_data.activity_incoming_data_id,
                                       activity_incoming_data.activity_subtype,
                                       jurisdictions_array.value AS jurisdictions_array,
                                       project_code_array.value  AS project_code_array,
                                       person_array.value        AS person_array,
                                       funding_list.f1           AS funding_list
                                FROM ((((invasivesbc.activity_incoming_data
                                    LEFT JOIN LATERAL jsonb_array_elements((activity_incoming_data.activity_payload #>
                                                                            '{form_data,activity_data,jurisdictions}'::text[])) jurisdictions_array(value)
                                         ON (true))
                                    LEFT JOIN LATERAL jsonb_array_elements((activity_incoming_data.activity_payload #>
                                                                            '{form_data,activity_data,project_code}'::text[])) project_code_array(value)
                                        ON (true))
                                    LEFT JOIN LATERAL jsonb_array_elements((activity_incoming_data.activity_payload #>
                                                                            '{form_data,activity_type_data,activity_persons}'::text[])) person_array(value)
                                       ON (true))
                                    LEFT JOIN LATERAL public.convert_string_list_to_array_elements((
                                            activity_incoming_data.activity_payload #>>
                                            '{form_data,activity_data,invasive_species_agency_code}'::text[])) funding_list(f1)
                                      ON (true))
                                WHERE ((activity_incoming_data.activity_incoming_data_id IN
                                        (SELECT activity_current.incoming_data_id
                                         FROM invasivesbc.activity_current)) AND
                                       ((activity_incoming_data.form_status)::text = 'Submitted'::text) AND
                                       (activity_incoming_data.deleted_timestamp IS NULL) AND
                                       ((activity_incoming_data.activity_subtype)::text =
                                        'Activity_Monitoring_ChemicalTerrestrialAquaticPlant'::text))),
             array_aggregate AS (SELECT a.activity_incoming_data_id,
                                        string_agg(DISTINCT (a.project_code_array #>> '{description}'::text[]),
                                                   ', '::text) AS project,
                                        string_agg(DISTINCT (a.person_array #>> '{person_name}'::text[]),
                                                   ', '::text) AS person_name,
                                        string_agg(DISTINCT
                                                   CASE
                                                       WHEN ((a.person_array #>> '{applicator_license}'::text[]) IS NOT NULL)
                                                           THEN concat((a.person_array #>> '{person_name}'::text[]),
                                                                       ', ',
                                                                       (a.person_array #>> '{applicator_license}'::text[]))
                                                       ELSE (a.person_array #>> '{person_name}'::text[])
                                                       END,
                                                   ', '::text) AS treatment_person_name,
                                        string_agg(DISTINCT concat(jurisdiction_codes.code_description, ' ',
                                                                   ((a.jurisdictions_array #>> '{percent_covered}'::text[]) || '%'::text)),
                                                   ', '::text) AS jurisdiction,
                                        string_agg(DISTINCT (invasive_species_agency_codes.code_description)::text,
                                                   ', '::text) AS funding_agency
                                 FROM ((((array_elements a
                                     LEFT JOIN invasivesbc.code_header jurisdiction_code_header ON ((
                                         ((jurisdiction_code_header.code_header_title)::text =
                                          'jurisdiction_code'::text) AND
                                         (jurisdiction_code_header.valid_to IS NULL))))
                                     LEFT JOIN invasivesbc.code jurisdiction_codes
                                         ON (((jurisdiction_codes.code_header_id =
                                               jurisdiction_code_header.code_header_id) AND
                                              ((a.jurisdictions_array #>> '{jurisdiction_code}'::text[]) =
                                               (jurisdiction_codes.code_name)::text))))
                                     LEFT JOIN invasivesbc.code_header invasive_species_agency_code_header ON ((
                                         ((invasive_species_agency_code_header.code_header_title)::text =
                                          'invasive_species_agency_code'::text) AND
                                         (invasive_species_agency_code_header.valid_to IS NULL))))
                                     LEFT JOIN invasivesbc.code invasive_species_agency_codes ON ((
                                         (invasive_species_agency_codes.code_header_id =
                                          invasive_species_agency_code_header.code_header_id) AND
                                         (a.funding_list = (invasive_species_agency_codes.code_name)::text))))
                                 GROUP BY a.activity_incoming_data_id),
             common_fields AS (SELECT p.jurisdiction,
                                      a.activity_incoming_data_id,
                                      a.activity_id,
                                      (a.activity_payload #>> '{short_id}'::text[])                            AS short_id,
                                      p.project                                                                AS project_code,
                                      (a.activity_payload #>> '{activity_type}'::text[])                       AS activity_type,
                                      (a.activity_payload #>> '{activity_subtype}'::text[])                    AS activity_subtype,
                                      a.form_status,
                                      to_char(to_timestamp(
                                                      (a.activity_payload #>>
                                                       '{form_data,activity_data,activity_date_time}'::text[]),
                                                      'YYYY-MM-DD"T"HH24:MI:SS'::text),
                                              'YYYY-MM-DD HH24:MI:SS'::text)                                   AS activity_date_time,
                                      (a.activity_payload #>> '{form_data,activity_data,utm_zone}'::text[])    AS utm_zone,
                                      (a.activity_payload #>> '{form_data,activity_data,utm_easting}'::text[]) AS utm_easting,
                                      (a.activity_payload #>>
                                       '{form_data,activity_data,utm_northing}'::text[])                       AS utm_northing,
                                      (a.activity_payload #>> '{form_data,activity_data,latitude}'::text[])    AS latitude,
                                      (a.activity_payload #>> '{form_data,activity_data,longitude}'::text[])   AS longitude,
                                      translate((a.activity_payload #>> '{species_positive}'::text[]), '[]"'::text,
                                                ''::text)                                                      AS species_positive,
                                      jsonb_array_length((a.activity_payload #> '{species_positive}'::text[])) AS positive_species_count,
                                      translate((a.activity_payload #>> '{species_negative}'::text[]), '[]"'::text,
                                                ''::text)                                                      AS species_negative,
                                      jsonb_array_length((a.activity_payload #> '{species_negative}'::text[])) AS negative_species_count,
                                      (a.activity_payload #>>
                                       '{form_data,activity_data,reported_area}'::text[])                      AS reported_area_sqm,
                                      (a.activity_payload #>>
                                       '{form_data,activity_type_data,pre_treatment_observation}'::text[])     AS pre_treatment_observation,
                                      p.person_name                                                            AS observation_person,
                                      p.treatment_person_name                                                  AS treatment_person,
                                      (a.activity_payload #>>
                                       '{form_data,activity_data,employer_code}'::text[])                      AS employer_code,
                                      employer_codes.code_description                                          AS employer_description,
                                      p.funding_agency,
                                      (a.activity_payload #>>
                                       '{form_data,activity_data,access_description}'::text[])                 AS access_description,
                                      (a.activity_payload #>>
                                       '{form_data,activity_data,location_description}'::text[])               AS location_description,
                                      (a.activity_payload #>>
                                       '{form_data,activity_data,general_comment}'::text[])                    AS comment,
                                      a.elevation,
                                      a.well_proximity,
                                      a.geog,
                                      a.biogeoclimatic_zones,
                                      a.regional_invasive_species_organization_areas,
                                      a.invasive_plant_management_areas,
                                      a.ownership,
                                      a.regional_districts,
                                      a.flnro_districts,
                                      a.moti_districts,
                                      CASE
                                          WHEN (a.media_keys IS NULL) THEN 'No'::text
                                          ELSE 'Yes'::text
                                          END                                                                  AS photo,
                                      a.created_timestamp,
                                      a.received_timestamp
                               FROM (((invasivesbc.activity_incoming_data a
                                   LEFT JOIN array_aggregate p
                                       ON ((p.activity_incoming_data_id = a.activity_incoming_data_id)))
                                   LEFT JOIN invasivesbc.code_header employer_code_header
                                      ON ((((employer_code_header.code_header_title)::text = 'employer_code'::text) AND
                                           (employer_code_header.valid_to IS NULL))))
                                   LEFT JOIN invasivesbc.code employer_codes
                                     ON (((employer_codes.code_header_id = employer_code_header.code_header_id) AND
                                          ((a.activity_payload #>> '{form_data,activity_data,employer_code}'::text[]) =
                                           (employer_codes.code_name)::text))))
                               WHERE ((a.activity_incoming_data_id IN (SELECT activity_current.incoming_data_id
                                                                       FROM invasivesbc.activity_current)) AND
                                      ((a.form_status)::text = 'Submitted'::text) AND (a.deleted_timestamp IS NULL) AND
                                      ((a.activity_subtype)::text =
                                       'Activity_Monitoring_ChemicalTerrestrialAquaticPlant'::text))),
             chemical_monitoring_array AS (SELECT activity_incoming_data.activity_incoming_data_id,
                                                  jsonb_array_elements((activity_incoming_data.activity_payload #>
                                                                        '{form_data,activity_subtype_data,Monitoring_ChemicalTerrestrialAquaticPlant_Information}'::text[])) AS monitoring_array
                                           FROM invasivesbc.activity_incoming_data
                                           WHERE ((activity_incoming_data.activity_incoming_data_id IN
                                                   (SELECT activity_current.incoming_data_id
                                                    FROM invasivesbc.activity_current)) AND
                                                  ((activity_incoming_data.form_status)::text = 'Submitted'::text) AND
                                                  (activity_incoming_data.deleted_timestamp IS NULL) AND
                                                  ((activity_incoming_data.activity_subtype)::text =
                                                   'Activity_Monitoring_ChemicalTerrestrialAquaticPlant'::text))),
             invasive_plants_on_site AS (SELECT concat(chemical_monitoring_array.activity_incoming_data_id, '-',
                                                       (chemical_monitoring_array.monitoring_array #>>
                                                        '{invasive_plant_code}'::text[]))     AS plant_id,
                                                public.convert_string_list_to_array_elements((
                                                        chemical_monitoring_array.monitoring_array #>>
                                                        '{invasive_plants_on_site}'::text[])) AS invasive_plants_on_site_code
                                         FROM chemical_monitoring_array),
             invasive_plants_on_site_select AS (SELECT i.plant_id,
                                                       i.invasive_plants_on_site_code,
                                                       monitoring_evidence_codes.code_description AS invasive_plants_on_site
                                                FROM ((invasive_plants_on_site i
                                                    LEFT JOIN invasivesbc.code_header monitoring_evidence_code_header
                                                       ON ((
                                                               ((monitoring_evidence_code_header.code_header_title)::text =
                                                                'monitoring_evidence_code'::text) AND
                                                               (monitoring_evidence_code_header.valid_to IS NULL))))
                                                    LEFT JOIN invasivesbc.code monitoring_evidence_codes ON ((
                                                        (monitoring_evidence_codes.code_header_id =
                                                         monitoring_evidence_code_header.code_header_id) AND
                                                        (i.invasive_plants_on_site_code =
                                                         (monitoring_evidence_codes.code_name)::text))))),
             invasive_plants_on_site_agg AS (SELECT i.plant_id,
                                                    string_agg((i.invasive_plants_on_site)::text, ', '::text
                                                               ORDER BY (i.invasive_plants_on_site)::text) AS invasive_plants_on_site
                                             FROM invasive_plants_on_site_select i
                                             GROUP BY i.plant_id),
             chemical_monitoring_json AS (SELECT a.activity_incoming_data_id,
                                                 (a.monitoring_array #>> '{invasive_plant_code}'::text[])         AS terrestrial_invasive_plant_code,
                                                 invasive_plant_codes.code_description                            AS terrestrial_invasive_plant,
                                                 (a.monitoring_array #>> '{invasive_plant_aquatic_code}'::text[]) AS aquatic_invasive_plant_code,
                                                 invasive_plant_aquatic_codes.code_description                    AS aquatic_invasive_plant,
                                                 (a.monitoring_array #>> '{efficacy_code}'::text[])               AS treatment_efficacy_rating_code,
                                                 efficacy_codes.code_description                                  AS treatment_efficacy_rating,
                                                 (a.monitoring_array #>> '{management_efficacy_rating}'::text[])  AS management_efficacy_rating_code,
                                                 management_efficacy_codes.code_description                       AS management_efficacy_rating,
                                                 (a.monitoring_array #>> '{evidence_of_treatment}'::text[])       AS evidence_of_treatment,
                                                 s.invasive_plants_on_site,
                                                 (a.monitoring_array #>> '{treatment_pass}'::text[])              AS treatment_pass,
                                                 (a.monitoring_array #>> '{comment}'::text[])                     AS comment
                                          FROM (((((((((chemical_monitoring_array a
                                              JOIN invasive_plants_on_site_agg s ON ((s.plant_id =
                                                                                      concat(
                                                                                              a.activity_incoming_data_id,
                                                                                              '-',
                                                                                              (a.monitoring_array #>> '{invasive_plant_code}'::text[])))))
                                              LEFT JOIN invasivesbc.code_header invasive_plant_code_header ON ((
                                                  ((invasive_plant_code_header.code_header_title)::text =
                                                   'invasive_plant_code'::text) AND
                                                  (invasive_plant_code_header.valid_to IS NULL))))
                                              LEFT JOIN invasivesbc.code invasive_plant_codes ON ((
                                                  (invasive_plant_codes.code_header_id =
                                                   invasive_plant_code_header.code_header_id) AND
                                                  ((a.monitoring_array #>> '{invasive_plant_code}'::text[]) =
                                                   (invasive_plant_codes.code_name)::text))))
                                              LEFT JOIN invasivesbc.code_header invasive_plant_aquatic_code_header ON ((
                                                  ((invasive_plant_aquatic_code_header.code_header_title)::text =
                                                   'invasive_plant_aquatic_code'::text) AND
                                                  (invasive_plant_aquatic_code_header.valid_to IS NULL))))
                                              LEFT JOIN invasivesbc.code invasive_plant_aquatic_codes ON ((
                                                  (invasive_plant_aquatic_codes.code_header_id =
                                                   invasive_plant_aquatic_code_header.code_header_id) AND
                                                  ((a.monitoring_array #>> '{invasive_plant_aquatic_code}'::text[]) =
                                                   (invasive_plant_aquatic_codes.code_name)::text))))
                                              LEFT JOIN invasivesbc.code_header efficacy_code_header ON ((
                                                  ((efficacy_code_header.code_header_title)::text =
                                                   'efficacy_code'::text) AND
                                                  (efficacy_code_header.valid_to IS NULL))))
                                              LEFT JOIN invasivesbc.code efficacy_codes
                                                  ON (((efficacy_codes.code_header_id = efficacy_code_header.code_header_id) AND
                                                       ((a.monitoring_array #>> '{efficacy_code}'::text[]) =
                                                        (efficacy_codes.code_name)::text))))
                                              LEFT JOIN invasivesbc.code_header management_efficacy_code_header ON ((
                                                  ((management_efficacy_code_header.code_header_title)::text =
                                                   'management_efficacy_code'::text) AND
                                                  (management_efficacy_code_header.valid_to IS NULL))))
                                              LEFT JOIN invasivesbc.code management_efficacy_codes ON ((
                                                  (management_efficacy_codes.code_header_id =
                                                   management_efficacy_code_header.code_header_id) AND
                                                  ((a.monitoring_array #>> '{management_efficacy_rating}'::text[]) =
                                                   (management_efficacy_codes.code_name)::text)))))
        SELECT c.activity_incoming_data_id,
               c.activity_id,
               c.short_id,
               c.project_code,
               c.activity_date_time,
               c.reported_area_sqm,
               c.latitude,
               c.longitude,
               c.utm_zone,
               c.utm_easting,
               c.utm_northing,
               c.employer_description                                           AS employer,
               c.funding_agency,
               c.jurisdiction,
               c.access_description,
               c.location_description,
               c.comment,
               c.observation_person,
               COALESCE(j.terrestrial_invasive_plant, j.aquatic_invasive_plant) AS invasive_plant,
               j.treatment_efficacy_rating,
               j.management_efficacy_rating,
               j.evidence_of_treatment,
               j.invasive_plants_on_site,
               j.treatment_pass,
               j.comment                                                        AS monitor_comment,
               c.elevation,
               c.well_proximity,
               c.biogeoclimatic_zones,
               c.regional_invasive_species_organization_areas,
               c.invasive_plant_management_areas,
               c.ownership,
               c.regional_districts,
               c.flnro_districts,
               c.moti_districts,
               c.photo,
               c.created_timestamp,
               c.received_timestamp,
               public.st_astext(c.geog)                                         AS geography
        FROM (common_fields c
            LEFT JOIN chemical_monitoring_json j ON ((j.activity_incoming_data_id = c.activity_incoming_data_id)));
        CREATE TABLE invasivesbc.code_category
        (
            code_category_id          integer                                NOT NULL,
            code_category_name        character varying(100)                 NOT NULL,
            code_category_title       character varying(40),
            code_category_description character varying(4096),
            valid_from                timestamp with time zone DEFAULT now() NOT NULL,
            valid_to                  timestamp with time zone,
            created_at                timestamp with time zone DEFAULT now() NOT NULL,
            updated_at                timestamp with time zone DEFAULT now(),
            created_by_user_id        integer                                NOT NULL,
            updated_by_user_id        integer                                NOT NULL
        );
        CREATE SEQUENCE invasivesbc.code_category_code_category_id_seq
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;
        ALTER SEQUENCE invasivesbc.code_category_code_category_id_seq OWNED BY invasivesbc.code_category.code_category_id;
        CREATE SEQUENCE invasivesbc.code_code_id_seq
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;
        ALTER SEQUENCE invasivesbc.code_code_id_seq OWNED BY invasivesbc.code.code_id;
        CREATE SEQUENCE invasivesbc.code_header_code_header_id_seq
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;
        ALTER SEQUENCE invasivesbc.code_header_code_header_id_seq OWNED BY invasivesbc.code_header.code_header_id;
        CREATE VIEW invasivesbc.common_summary AS
        WITH array_elements AS (SELECT activity_incoming_data.activity_incoming_data_id,
                                       activity_incoming_data.activity_subtype,
                                       jurisdictions_array.value AS jurisdictions_array,
                                       project_code_array.value  AS project_code_array,
                                       person_array.value        AS person_array,
                                       funding_list.f1           AS funding_list
                                FROM ((((invasivesbc.activity_incoming_data
                                    LEFT JOIN LATERAL jsonb_array_elements((activity_incoming_data.activity_payload #>
                                                                            '{form_data,activity_data,jurisdictions}'::text[])) jurisdictions_array(value)
                                         ON (true))
                                    LEFT JOIN LATERAL jsonb_array_elements((activity_incoming_data.activity_payload #>
                                                                            '{form_data,activity_data,project_code}'::text[])) project_code_array(value)
                                        ON (true))
                                    LEFT JOIN LATERAL jsonb_array_elements((activity_incoming_data.activity_payload #>
                                                                            '{form_data,activity_type_data,activity_persons}'::text[])) person_array(value)
                                       ON (true))
                                    LEFT JOIN LATERAL public.convert_string_list_to_array_elements((
                                            activity_incoming_data.activity_payload #>>
                                            '{form_data,activity_data,invasive_species_agency_code}'::text[])) funding_list(f1)
                                      ON (true))
                                WHERE ((activity_incoming_data.activity_incoming_data_id IN
                                        (SELECT activity_current.incoming_data_id
                                         FROM invasivesbc.activity_current)) AND
                                       ((activity_incoming_data.form_status)::text = 'Submitted'::text))),
             array_aggregate AS (SELECT a_1.activity_incoming_data_id,
                                        string_agg(DISTINCT (a_1.project_code_array #>> '{description}'::text[]),
                                                   ', '::text) AS project,
                                        string_agg(DISTINCT (a_1.person_array #>> '{person_name}'::text[]),
                                                   ', '::text) AS person_name,
                                        string_agg(DISTINCT
                                                   CASE
                                                       WHEN ((a_1.person_array #>> '{applicator_license}'::text[]) IS NOT NULL)
                                                           THEN concat((a_1.person_array #>> '{person_name}'::text[]),
                                                                       ', ',
                                                                       (a_1.person_array #>> '{applicator_license}'::text[]))
                                                       ELSE (a_1.person_array #>> '{person_name}'::text[])
                                                       END,
                                                   ', '::text) AS treatment_person_name,
                                        string_agg(DISTINCT concat(jurisdiction_codes.code_description, ' ',
                                                                   ((a_1.jurisdictions_array #>> '{percent_covered}'::text[]) ||
                                                                    '%'::text)),
                                                   ', '::text) AS jurisdiction,
                                        string_agg(DISTINCT (invasive_species_agency_codes.code_description)::text,
                                                   ', '::text) AS funding_agency
                                 FROM ((((array_elements a_1
                                     LEFT JOIN invasivesbc.code_header jurisdiction_code_header ON ((
                                         ((jurisdiction_code_header.code_header_title)::text =
                                          'jurisdiction_code'::text) AND
                                         (jurisdiction_code_header.valid_to IS NULL))))
                                     LEFT JOIN invasivesbc.code jurisdiction_codes
                                         ON (((jurisdiction_codes.code_header_id =
                                               jurisdiction_code_header.code_header_id) AND
                                              ((a_1.jurisdictions_array #>> '{jurisdiction_code}'::text[]) =
                                               (jurisdiction_codes.code_name)::text))))
                                     LEFT JOIN invasivesbc.code_header invasive_species_agency_code_header ON ((
                                         ((invasive_species_agency_code_header.code_header_title)::text =
                                          'invasive_species_agency_code'::text) AND
                                         (invasive_species_agency_code_header.valid_to IS NULL))))
                                     LEFT JOIN invasivesbc.code invasive_species_agency_codes ON ((
                                         (invasive_species_agency_codes.code_header_id =
                                          invasive_species_agency_code_header.code_header_id) AND
                                         (a_1.funding_list = (invasive_species_agency_codes.code_name)::text))))
                                 GROUP BY a_1.activity_incoming_data_id)
        SELECT p.jurisdiction,
               a.activity_incoming_data_id,
               a.activity_id,
               (a.activity_payload #>> '{short_id}'::text[])                                AS short_id,
               p.project                                                                    AS project_code,
               (a.activity_payload #>> '{activity_type}'::text[])                           AS activity_type,
               (a.activity_payload #>> '{activity_subtype}'::text[])                        AS activity_subtype,
               a.form_status,
               to_char(to_timestamp((a.activity_payload #>> '{form_data,activity_data,activity_date_time}'::text[]),
                                    'YYYY-MM-DD"T"HH24:MI:SS'::text),
                       'YYYY-MM-DD HH24:MI:SS'::text)                                       AS activity_date_time,
               (a.activity_payload #>> '{form_data,activity_data,utm_zone}'::text[])        AS utm_zone,
               (a.activity_payload #>> '{form_data,activity_data,utm_easting}'::text[])     AS utm_easting,
               (a.activity_payload #>> '{form_data,activity_data,utm_northing}'::text[])    AS utm_northing,
               (a.activity_payload #>> '{form_data,activity_data,latitude}'::text[])        AS latitude,
               (a.activity_payload #>> '{form_data,activity_data,longitude}'::text[])       AS longitude,
               translate((a.activity_payload #>> '{species_positive}'::text[]), '[]"'::text,
                         ''::text)                                                          AS species_positive,
               jsonb_array_length((a.activity_payload #> '{species_positive}'::text[]))     AS positive_species_count,
               translate((a.activity_payload #>> '{species_negative}'::text[]), '[]"'::text,
                         ''::text)                                                          AS species_negative,
               jsonb_array_length((a.activity_payload #> '{species_negative}'::text[]))     AS negative_species_count,
               (a.activity_payload #>>
                '{form_data,activity_data,reported_area}'::text[])                          AS reported_area_sqm,
               (a.activity_payload #>>
                '{form_data,activity_type_data,pre_treatment_observation}'::text[])         AS pre_treatment_observation,
               p.person_name                                                                AS observation_person,
               p.treatment_person_name                                                      AS treatment_person,
               (a.activity_payload #>> '{form_data,activity_data,employer_code}'::text[])   AS employer_code,
               employer_codes.code_description                                              AS employer_description,
               p.funding_agency,
               (a.activity_payload #>>
                '{form_data,activity_data,access_description}'::text[])                     AS access_description,
               (a.activity_payload #>>
                '{form_data,activity_data,location_description}'::text[])                   AS location_description,
               (a.activity_payload #>> '{form_data,activity_data,general_comment}'::text[]) AS comment,
               a.elevation,
               a.well_proximity,
               a.geom,
               a.geog,
               a.biogeoclimatic_zones,
               a.regional_invasive_species_organization_areas,
               a.invasive_plant_management_areas,
               a.ownership,
               a.regional_districts,
               a.flnro_districts,
               a.moti_districts,
               CASE
                   WHEN (a.media_keys IS NULL) THEN 'No'::text
                   ELSE 'Yes'::text
                   END                                                                      AS photo,
               a.created_timestamp,
               a.received_timestamp
        FROM (((invasivesbc.activity_incoming_data a
            LEFT JOIN array_aggregate p ON ((p.activity_incoming_data_id = a.activity_incoming_data_id)))
            LEFT JOIN invasivesbc.code_header employer_code_header
               ON ((((employer_code_header.code_header_title)::text = 'employer_code'::text) AND
                    (employer_code_header.valid_to IS NULL))))
            LEFT JOIN invasivesbc.code employer_codes
              ON (((employer_codes.code_header_id = employer_code_header.code_header_id) AND
                   ((a.activity_payload #>> '{form_data,activity_data,employer_code}'::text[]) =
                    (employer_codes.code_name)::text))))
        WHERE ((a.activity_incoming_data_id IN (SELECT activity_current.incoming_data_id
                                                FROM invasivesbc.activity_current)) AND
               ((a.form_status)::text = 'Submitted'::text));
        CREATE MATERIALIZED VIEW invasivesbc.common_summary_materialized AS
        WITH jurisdiction_array AS (SELECT activity_incoming_data.activity_incoming_data_id,
                                           activity_incoming_data.activity_subtype,
                                           jsonb_array_elements((activity_incoming_data.activity_payload #>
                                                                 '{form_data,activity_data,jurisdictions}'::text[])) AS jurisdictions_array
                                    FROM invasivesbc.activity_incoming_data
                                    WHERE (activity_incoming_data.activity_incoming_data_id IN
                                           (SELECT activity_current.incoming_data_id
                                            FROM invasivesbc.activity_current))),
             project_array AS (SELECT activity_incoming_data.activity_incoming_data_id,
                                      activity_incoming_data.activity_subtype,
                                      jsonb_array_elements((activity_incoming_data.activity_payload #>
                                                            '{form_data,activity_data,project_code}'::text[])) AS json_array
                               FROM invasivesbc.activity_incoming_data
                               WHERE (activity_incoming_data.activity_incoming_data_id IN
                                      (SELECT activity_current.incoming_data_id
                                       FROM invasivesbc.activity_current))),
             project_list AS (SELECT p_1.activity_incoming_data_id,
                                     string_agg((p_1.json_array #>> '{description}'::text[]), ', '::text
                                                ORDER BY (p_1.json_array #>> '{description}'::text[])) AS project
                              FROM project_array p_1
                              GROUP BY p_1.activity_incoming_data_id),
             person_array AS (SELECT activity_incoming_data.activity_incoming_data_id,
                                     activity_incoming_data.activity_subtype,
                                     jsonb_array_elements((activity_incoming_data.activity_payload #>
                                                           '{form_data,activity_type_data,activity_persons}'::text[])) AS json_array
                              FROM invasivesbc.activity_incoming_data
                              WHERE (activity_incoming_data.activity_incoming_data_id IN
                                     (SELECT activity_current.incoming_data_id
                                      FROM invasivesbc.activity_current))),
             person_select AS (SELECT p_1.activity_incoming_data_id,
                                      (p_1.json_array #>> '{person_name}'::text[])        AS person_name,
                                      (p_1.json_array #>> '{applicator_license}'::text[]) AS applicator_license
                               FROM person_array p_1),
             person_list AS (SELECT p_1.activity_incoming_data_id,
                                    string_agg(p_1.person_name, ', '::text ORDER BY p_1.person_name) AS person_name
                             FROM person_select p_1
                             GROUP BY p_1.activity_incoming_data_id),
             treatment_person_list AS (SELECT p_1.activity_incoming_data_id,
                                              string_agg(((p_1.person_name || ', '::text) || p_1.applicator_license),
                                                         ', '::text
                                                         ORDER BY p_1.person_name) AS treatment_person_name
                                       FROM person_select p_1
                                       GROUP BY p_1.activity_incoming_data_id),
             jurisdictions_list AS (SELECT j_1.activity_incoming_data_id,
                                           (j_1.jurisdictions_array #>> '{jurisdiction_code}'::text[]) AS jurisdiction_code,
                                           jurisdiction_codes.code_description                         AS jurisdiction,
                                           (j_1.jurisdictions_array #>> '{percent_covered}'::text[])   AS percent_covered
                                    FROM ((jurisdiction_array j_1
                                        LEFT JOIN invasivesbc.code_header jurisdiction_code_header ON ((
                                            ((jurisdiction_code_header.code_header_title)::text =
                                             'jurisdiction_code'::text) AND
                                            (jurisdiction_code_header.valid_to IS NULL))))
                                        LEFT JOIN invasivesbc.code jurisdiction_codes
                                          ON (((jurisdiction_codes.code_header_id =
                                                jurisdiction_code_header.code_header_id) AND
                                               ((j_1.jurisdictions_array #>> '{jurisdiction_code}'::text[]) =
                                                (jurisdiction_codes.code_name)::text))))),
             jurisdiction_agg AS (SELECT j_1.activity_incoming_data_id,
                                         string_agg(
                                                 ((((j_1.jurisdiction)::text || ' '::text) || j_1.percent_covered) ||
                                                  '%'::text), ', '::text
                                                 ORDER BY j_1.jurisdiction) AS jurisdiction
                                  FROM jurisdictions_list j_1
                                  GROUP BY j_1.activity_incoming_data_id),
             funding_agency_array AS (SELECT activity_incoming_data.activity_incoming_data_id,
                                             public.convert_string_list_to_array_elements((
                                                     activity_incoming_data.activity_payload #>>
                                                     '{form_data,activity_data,invasive_species_agency_code}'::text[])) AS funding_list
                                      FROM invasivesbc.activity_incoming_data
                                      WHERE (activity_incoming_data.activity_incoming_data_id IN
                                             (SELECT activity_current.incoming_data_id
                                              FROM invasivesbc.activity_current))),
             funding_agency_select AS (SELECT f_1.activity_incoming_data_id,
                                              f_1.funding_list,
                                              invasive_species_agency_codes.code_description AS funding_agency
                                       FROM ((funding_agency_array f_1
                                           LEFT JOIN invasivesbc.code_header invasive_species_agency_code_header ON ((
                                               ((invasive_species_agency_code_header.code_header_title)::text =
                                                'invasive_species_agency_code'::text) AND
                                               (invasive_species_agency_code_header.valid_to IS NULL))))
                                           LEFT JOIN invasivesbc.code invasive_species_agency_codes ON ((
                                               (invasive_species_agency_codes.code_header_id =
                                                invasive_species_agency_code_header.code_header_id) AND
                                               (f_1.funding_list = (invasive_species_agency_codes.code_name)::text))))),
             funding_agency_agg AS (SELECT f_1.activity_incoming_data_id,
                                           string_agg((f_1.funding_agency)::text, ', '::text
                                                      ORDER BY (f_1.funding_agency)::text) AS funding_agency
                                    FROM funding_agency_select f_1
                                    GROUP BY f_1.activity_incoming_data_id)
        SELECT j.jurisdiction,
               a.activity_incoming_data_id,
               a.activity_id,
               (a.activity_payload #>> '{short_id}'::text[])                                AS short_id,
               l.project                                                                    AS project_code,
               (a.activity_payload #>> '{activity_type}'::text[])                           AS activity_type,
               (a.activity_payload #>> '{activity_subtype}'::text[])                        AS activity_subtype,
               a.form_status,
               to_char(to_timestamp((a.activity_payload #>> '{form_data,activity_data,activity_date_time}'::text[]),
                                    'YYYY-MM-DD HH24:MI:SS'::text),
                       'YYYY-MM-DD HH24:MI:SS'::text)                                       AS activity_date_time,
               (a.activity_payload #>> '{form_data,activity_data,utm_zone}'::text[])        AS utm_zone,
               (a.activity_payload #>> '{form_data,activity_data,utm_easting}'::text[])     AS utm_easting,
               (a.activity_payload #>> '{form_data,activity_data,utm_northing}'::text[])    AS utm_northing,
               (a.activity_payload #>> '{form_data,activity_data,latitude}'::text[])        AS latitude,
               (a.activity_payload #>> '{form_data,activity_data,longitude}'::text[])       AS longitude,
               translate((a.activity_payload #>> '{species_positive}'::text[]), '[]"'::text,
                         ''::text)                                                          AS species_positive,
               jsonb_array_length((a.activity_payload #> '{species_positive}'::text[]))     AS positive_species_count,
               translate((a.activity_payload #>> '{species_negative}'::text[]), '[]"'::text,
                         ''::text)                                                          AS species_negative,
               jsonb_array_length((a.activity_payload #> '{species_negative}'::text[]))     AS negative_species_count,
               (a.activity_payload #>>
                '{form_data,activity_data,reported_area}'::text[])                          AS reported_area_sqm,
               (a.activity_payload #>>
                '{form_data,activity_type_data,pre_treatment_observation}'::text[])         AS pre_treatment_observation,
               p.person_name                                                                AS observation_person,
               t.treatment_person_name                                                      AS treatment_person,
               (a.activity_payload #>> '{form_data,activity_data,employer_code}'::text[])   AS employer_code,
               employer_codes.code_description                                              AS employer_description,
               f.funding_agency,
               (a.activity_payload #>>
                '{form_data,activity_data,access_description}'::text[])                     AS access_description,
               (a.activity_payload #>>
                '{form_data,activity_data,location_description}'::text[])                   AS location_description,
               (a.activity_payload #>> '{form_data,activity_data,general_comment}'::text[]) AS comment,
               a.elevation,
               a.well_proximity,
               a.geom,
               a.geog,
               a.biogeoclimatic_zones,
               a.regional_invasive_species_organization_areas,
               a.invasive_plant_management_areas,
               a.ownership,
               a.regional_districts,
               a.flnro_districts,
               a.moti_districts,
               CASE
                   WHEN (a.media_keys IS NULL) THEN 'No'::text
                   ELSE 'Yes'::text
                   END                                                                      AS photo,
               a.created_timestamp,
               a.received_timestamp
        FROM (((((((invasivesbc.activity_incoming_data a
            LEFT JOIN project_list l ON ((l.activity_incoming_data_id = a.activity_incoming_data_id)))
            JOIN treatment_person_list t ON ((t.activity_incoming_data_id = a.activity_incoming_data_id)))
            JOIN person_list p ON ((p.activity_incoming_data_id = a.activity_incoming_data_id)))
            JOIN jurisdiction_agg j ON ((j.activity_incoming_data_id = a.activity_incoming_data_id)))
            JOIN funding_agency_agg f ON ((f.activity_incoming_data_id = a.activity_incoming_data_id)))
            LEFT JOIN invasivesbc.code_header employer_code_header
               ON ((((employer_code_header.code_header_title)::text = 'employer_code'::text) AND
                    (employer_code_header.valid_to IS NULL))))
            LEFT JOIN invasivesbc.code employer_codes
              ON (((employer_codes.code_header_id = employer_code_header.code_header_id) AND
                   ((a.activity_payload #>> '{form_data,activity_data,employer_code}'::text[]) =
                    (employer_codes.code_name)::text))))
        WHERE ((a.activity_incoming_data_id IN (SELECT activity_current.incoming_data_id
                                                FROM invasivesbc.activity_current)) AND
               ((a.form_status)::text = 'Submitted'::text))
        WITH NO DATA;
        CREATE MATERIALIZED VIEW invasivesbc.current_negative_observations_materialized AS
        SELECT current_negative_observations.activity_incoming_data_id,
               current_negative_observations.species_code,
               current_negative_observations.id_species,
               current_negative_observations.invasive_plant,
               current_negative_observations.geom,
               current_negative_observations.created_timestamp
        FROM invasivesbc.current_negative_observations
        WITH NO DATA;
        CREATE VIEW invasivesbc.current_negative_species AS
        WITH spatial_explode_negative AS (SELECT activity_incoming_data.activity_type,
                                                 activity_incoming_data.activity_subtype,
                                                 activity_incoming_data.created_timestamp,
                                                 activity_incoming_data.activity_incoming_data_id,
                                                 jsonb_array_elements(activity_incoming_data.species_negative) AS species,
                                                 public.geometry(activity_incoming_data.geog)                  AS geom
                                          FROM invasivesbc.activity_incoming_data
                                          WHERE (((activity_incoming_data.activity_type)::text = 'Observation'::text) AND
                                                 ((activity_incoming_data.form_status)::text = 'Submitted'::text) AND
                                                 (activity_incoming_data.activity_incoming_data_id IN
                                                  (SELECT activity_current.incoming_data_id
                                                   FROM invasivesbc.activity_current)) AND
                                                 (activity_incoming_data.species_negative IS NOT NULL) AND
                                                 ((activity_incoming_data.species_negative)::text !~~ '[null]'::text) AND
                                                 ((activity_incoming_data.species_negative)::text !~~ 'null'::text))),
             spatial_negative AS (SELECT spatial_explode_negative.activity_type,
                                         spatial_explode_negative.activity_subtype,
                                         spatial_explode_negative.created_timestamp,
                                         spatial_explode_negative.activity_incoming_data_id,
                                         spatial_explode_negative.species,
                                         CASE
                                             WHEN (public.st_geometrytype(spatial_explode_negative.geom) =
                                                   'ST_Point'::text)
                                                 THEN (public.st_buffer(
                                                     (spatial_explode_negative.geom)::public.geography,
                                                     (0.56425)::double precision,
                                                     'quad_segs=30'::text))::public.geometry
                                             ELSE spatial_explode_negative.geom
                                             END AS geom
                                  FROM spatial_explode_negative),
             spatial_explode_positive AS (SELECT activity_incoming_data.activity_subtype,
                                                 activity_incoming_data.created_timestamp,
                                                 activity_incoming_data.activity_incoming_data_id,
                                                 jsonb_array_elements(activity_incoming_data.species_positive) AS species,
                                                 public.geometry(activity_incoming_data.geog)                  AS geom
                                          FROM invasivesbc.activity_incoming_data
                                          WHERE (((activity_incoming_data.activity_type)::text = 'Observation'::text) AND
                                                 ((activity_incoming_data.form_status)::text = 'Submitted'::text) AND
                                                 (activity_incoming_data.activity_incoming_data_id IN
                                                  (SELECT activity_current.incoming_data_id
                                                   FROM invasivesbc.activity_current)) AND
                                                 (activity_incoming_data.species_positive IS NOT NULL) AND
                                                 ((activity_incoming_data.species_positive)::text !~~ '[null]'::text) AND
                                                 ((activity_incoming_data.species_positive)::text !~~ 'null'::text))),
             spatial_positive AS (SELECT spatial_explode_positive.activity_subtype,
                                         spatial_explode_positive.created_timestamp,
                                         spatial_explode_positive.activity_incoming_data_id,
                                         spatial_explode_positive.species,
                                         CASE
                                             WHEN (public.st_geometrytype(spatial_explode_positive.geom) =
                                                   'ST_Point'::text)
                                                 THEN (public.st_buffer(
                                                     (spatial_explode_positive.geom)::public.geography,
                                                     (0.56425)::double precision,
                                                     'quad_segs=30'::text))::public.geometry
                                             ELSE spatial_explode_positive.geom
                                             END AS geom
                                  FROM spatial_explode_positive),
             spatial_positive_negative AS (SELECT row_number() OVER ()           AS ctid,
                                                  (neg.species #>> '{}'::text[]) AS species,
                                                  neg.activity_type,
                                                  neg.created_timestamp,
                                                  neg.activity_incoming_data_id,
                                                  CASE
                                                      WHEN public.st_intersects(neg.geom, pos.geom)
                                                          THEN public.st_difference(neg.geom, pos.geom)
                                                      ELSE neg.geom
                                                      END                        AS geom
                                           FROM (spatial_negative neg
                                               LEFT JOIN spatial_positive pos
                                                 ON ((public.st_intersects(neg.geom, pos.geom) AND
                                                      (neg.species = pos.species) AND
                                                      (neg.created_timestamp < pos.created_timestamp))))),
             spatial_full_overlap AS (SELECT t.activity_incoming_data_id,
                                             t.species,
                                             public.st_area((t.geom)::public.geography, true) AS area,
                                             t.geom,
                                             t.created_timestamp,
                                             t.activity_type
                                      FROM (spatial_positive_negative t
                                          JOIN (SELECT a.activity_incoming_data_id,
                                                       min(public.st_area((a.geom)::public.geography, true)) AS area
                                                FROM spatial_positive_negative a,
                                                     spatial_positive_negative b
                                                WHERE ((a.species = b.species) AND
                                                       public.st_contains(a.geom, b.geom) AND
                                                       (a.ctid <> b.ctid) AND
                                                       (a.activity_incoming_data_id = b.activity_incoming_data_id))
                                                GROUP BY a.activity_incoming_data_id) m
                                            ON ((t.activity_incoming_data_id = m.activity_incoming_data_id)))
                                      WHERE (public.st_area((t.geom)::public.geography, true) = m.area)),
             spatial_partial_overlap AS (SELECT a.activity_incoming_data_id,
                                                a.species,
                                                public.st_intersection(a.geom, b.geom) AS geom,
                                                a.created_timestamp,
                                                a.activity_type
                                         FROM spatial_positive_negative a,
                                              spatial_positive_negative b
                                         WHERE ((a.species = b.species) AND public.st_intersects(a.geom, b.geom) AND
                                                (a.ctid <> b.ctid) AND
                                                (a.activity_incoming_data_id = b.activity_incoming_data_id) AND
                                                (NOT (a.activity_incoming_data_id IN
                                                      (SELECT a_1.activity_incoming_data_id
                                                       FROM spatial_positive_negative a_1,
                                                            spatial_positive_negative b_1
                                                       WHERE ((a_1.species = b_1.species) AND
                                                              public.st_contains(a_1.geom, b_1.geom) AND
                                                              (a_1.ctid <> b_1.ctid) AND
                                                              (a_1.activity_incoming_data_id = b_1.activity_incoming_data_id))
                                                       GROUP BY a_1.activity_incoming_data_id))))
                                         GROUP BY a.activity_incoming_data_id, a.species, a.geom, b.geom,
                                                  a.created_timestamp,
                                                  a.activity_type),
             spatial_others AS (SELECT spatial_positive_negative.activity_incoming_data_id,
                                       spatial_positive_negative.species,
                                       spatial_positive_negative.geom,
                                       spatial_positive_negative.created_timestamp,
                                       spatial_positive_negative.activity_type
                                FROM spatial_positive_negative
                                WHERE (NOT (spatial_positive_negative.activity_incoming_data_id IN
                                            (SELECT a.activity_incoming_data_id
                                             FROM spatial_positive_negative a,
                                                  spatial_positive_negative b
                                             WHERE ((a.species = b.species) AND public.st_intersects(a.geom, b.geom) AND
                                                    (a.ctid <> b.ctid) AND
                                                    (a.activity_incoming_data_id = b.activity_incoming_data_id))
                                             GROUP BY a.activity_incoming_data_id)))
                                UNION
                                SELECT spatial_full_overlap.activity_incoming_data_id,
                                       spatial_full_overlap.species,
                                       spatial_full_overlap.geom,
                                       spatial_full_overlap.created_timestamp,
                                       spatial_full_overlap.activity_type
                                FROM spatial_full_overlap
                                UNION
                                SELECT spatial_partial_overlap.activity_incoming_data_id,
                                       spatial_partial_overlap.species,
                                       spatial_partial_overlap.geom,
                                       spatial_partial_overlap.created_timestamp,
                                       spatial_partial_overlap.activity_type
                                FROM spatial_partial_overlap),
             spatial_union AS (SELECT spatial_others.species,
                                      invasive_plant_codes.code_description                       AS terrestrial_invasive_plant,
                                      invasive_plant_aquatic_codes.code_description               AS aquatic_invasive_plant,
                                      spatial_others.activity_type,
                                      max(spatial_others.created_timestamp)                       AS max_created_timestamp,
                                      array_agg(spatial_others.activity_incoming_data_id)         AS activity_ids,
                                      public.st_union(public.st_collectionextract(
                                              public.st_transform(spatial_others.geom, 3005), 3)) AS geom
                               FROM ((((spatial_others
                                   LEFT JOIN invasivesbc.code_header invasive_plant_code_header ON ((
                                       ((invasive_plant_code_header.code_header_title)::text =
                                        'invasive_plant_code'::text) AND
                                       (invasive_plant_code_header.valid_to IS NULL))))
                                   LEFT JOIN invasivesbc.code invasive_plant_codes ON ((
                                       (invasive_plant_codes.code_header_id =
                                        invasive_plant_code_header.code_header_id) AND
                                       (spatial_others.species = (invasive_plant_codes.code_name)::text))))
                                   LEFT JOIN invasivesbc.code_header invasive_plant_aquatic_code_header ON ((
                                       ((invasive_plant_aquatic_code_header.code_header_title)::text =
                                        'invasive_plant_aquatic_code'::text) AND
                                       (invasive_plant_aquatic_code_header.valid_to IS NULL))))
                                   LEFT JOIN invasivesbc.code invasive_plant_aquatic_codes ON ((
                                       (invasive_plant_aquatic_codes.code_header_id =
                                        invasive_plant_aquatic_code_header.code_header_id) AND
                                       (spatial_others.species = (invasive_plant_aquatic_codes.code_name)::text))))
                               GROUP BY spatial_others.species, invasive_plant_codes.code_description,
                                        invasive_plant_aquatic_codes.code_description, spatial_others.activity_type)
        SELECT spatial_union.species,
               COALESCE(spatial_union.terrestrial_invasive_plant,
                        spatial_union.aquatic_invasive_plant) AS invasive_plant,
               public.st_area(spatial_union.geom)             AS area_sqm,
               spatial_union.max_created_timestamp,
               spatial_union.geom
        FROM spatial_union
        WHERE (public.st_area(spatial_union.geom) > (0)::double precision);
        CREATE VIEW invasivesbc.observation_aquatic_plant_summary AS
        WITH array_elements AS (SELECT activity_incoming_data.activity_incoming_data_id,
                                       activity_incoming_data.activity_subtype,
                                       jurisdictions_array.value AS jurisdictions_array,
                                       project_code_array.value  AS project_code_array,
                                       person_array.value        AS person_array,
                                       funding_list.f1           AS funding_list
                                FROM ((((invasivesbc.activity_incoming_data
                                    LEFT JOIN LATERAL jsonb_array_elements((activity_incoming_data.activity_payload #>
                                                                            '{form_data,activity_data,jurisdictions}'::text[])) jurisdictions_array(value)
                                         ON (true))
                                    LEFT JOIN LATERAL jsonb_array_elements((activity_incoming_data.activity_payload #>
                                                                            '{form_data,activity_data,project_code}'::text[])) project_code_array(value)
                                        ON (true))
                                    LEFT JOIN LATERAL jsonb_array_elements((activity_incoming_data.activity_payload #>
                                                                            '{form_data,activity_type_data,activity_persons}'::text[])) person_array(value)
                                       ON (true))
                                    LEFT JOIN LATERAL public.convert_string_list_to_array_elements((
                                            activity_incoming_data.activity_payload #>>
                                            '{form_data,activity_data,invasive_species_agency_code}'::text[])) funding_list(f1)
                                      ON (true))
                                WHERE ((activity_incoming_data.activity_incoming_data_id IN
                                        (SELECT activity_current.incoming_data_id
                                         FROM invasivesbc.activity_current)) AND
                                       ((activity_incoming_data.form_status)::text = 'Submitted'::text) AND
                                       (activity_incoming_data.deleted_timestamp IS NULL) AND
                                       ((activity_incoming_data.activity_subtype)::text =
                                        'Activity_Observation_PlantAquatic'::text))),
             array_aggregate AS (SELECT a_1.activity_incoming_data_id,
                                        string_agg(DISTINCT (a_1.project_code_array #>> '{description}'::text[]),
                                                   ', '::text) AS project,
                                        string_agg(DISTINCT (a_1.person_array #>> '{person_name}'::text[]),
                                                   ', '::text) AS person_name,
                                        string_agg(DISTINCT
                                                   CASE
                                                       WHEN ((a_1.person_array #>> '{applicator_license}'::text[]) IS NOT NULL)
                                                           THEN concat((a_1.person_array #>> '{person_name}'::text[]),
                                                                       ', ',
                                                                       (a_1.person_array #>> '{applicator_license}'::text[]))
                                                       ELSE (a_1.person_array #>> '{person_name}'::text[])
                                                       END,
                                                   ', '::text) AS treatment_person_name,
                                        string_agg(DISTINCT concat(jurisdiction_codes.code_description, ' ',
                                                                   ((a_1.jurisdictions_array #>> '{percent_covered}'::text[]) ||
                                                                    '%'::text)),
                                                   ', '::text) AS jurisdiction,
                                        string_agg(DISTINCT (invasive_species_agency_codes.code_description)::text,
                                                   ', '::text) AS funding_agency
                                 FROM ((((array_elements a_1
                                     LEFT JOIN invasivesbc.code_header jurisdiction_code_header ON ((
                                         ((jurisdiction_code_header.code_header_title)::text =
                                          'jurisdiction_code'::text) AND
                                         (jurisdiction_code_header.valid_to IS NULL))))
                                     LEFT JOIN invasivesbc.code jurisdiction_codes
                                         ON (((jurisdiction_codes.code_header_id =
                                               jurisdiction_code_header.code_header_id) AND
                                              ((a_1.jurisdictions_array #>> '{jurisdiction_code}'::text[]) =
                                               (jurisdiction_codes.code_name)::text))))
                                     LEFT JOIN invasivesbc.code_header invasive_species_agency_code_header ON ((
                                         ((invasive_species_agency_code_header.code_header_title)::text =
                                          'invasive_species_agency_code'::text) AND
                                         (invasive_species_agency_code_header.valid_to IS NULL))))
                                     LEFT JOIN invasivesbc.code invasive_species_agency_codes ON ((
                                         (invasive_species_agency_codes.code_header_id =
                                          invasive_species_agency_code_header.code_header_id) AND
                                         (a_1.funding_list = (invasive_species_agency_codes.code_name)::text))))
                                 GROUP BY a_1.activity_incoming_data_id),
             common_fields AS (SELECT p.jurisdiction,
                                      a_1.activity_incoming_data_id,
                                      a_1.activity_id,
                                      (a_1.activity_payload #>> '{short_id}'::text[])                            AS short_id,
                                      p.project                                                                  AS project_code,
                                      (a_1.activity_payload #>> '{activity_type}'::text[])                       AS activity_type,
                                      (a_1.activity_payload #>> '{activity_subtype}'::text[])                    AS activity_subtype,
                                      a_1.form_status,
                                      to_char(to_timestamp((a_1.activity_payload #>>
                                                            '{form_data,activity_data,activity_date_time}'::text[]),
                                                           'YYYY-MM-DD"T"HH24:MI:SS'::text),
                                              'YYYY-MM-DD HH24:MI:SS'::text)                                     AS activity_date_time,
                                      (a_1.activity_payload #>> '{form_data,activity_data,utm_zone}'::text[])    AS utm_zone,
                                      (a_1.activity_payload #>>
                                       '{form_data,activity_data,utm_easting}'::text[])                          AS utm_easting,
                                      (a_1.activity_payload #>>
                                       '{form_data,activity_data,utm_northing}'::text[])                         AS utm_northing,
                                      (a_1.activity_payload #>> '{form_data,activity_data,latitude}'::text[])    AS latitude,
                                      (a_1.activity_payload #>> '{form_data,activity_data,longitude}'::text[])   AS longitude,
                                      translate((a_1.activity_payload #>> '{species_positive}'::text[]), '[]"'::text,
                                                ''::text)                                                        AS species_positive,
                                      jsonb_array_length((a_1.activity_payload #> '{species_positive}'::text[])) AS positive_species_count,
                                      translate((a_1.activity_payload #>> '{species_negative}'::text[]), '[]"'::text,
                                                ''::text)                                                        AS species_negative,
                                      jsonb_array_length((a_1.activity_payload #> '{species_negative}'::text[])) AS negative_species_count,
                                      (a_1.activity_payload #>>
                                       '{form_data,activity_data,reported_area}'::text[])                        AS reported_area_sqm,
                                      (a_1.activity_payload #>>
                                       '{form_data,activity_type_data,pre_treatment_observation}'::text[])       AS pre_treatment_observation,
                                      p.person_name                                                              AS observation_person,
                                      p.treatment_person_name                                                    AS treatment_person,
                                      (a_1.activity_payload #>>
                                       '{form_data,activity_data,employer_code}'::text[])                        AS employer_code,
                                      employer_codes.code_description                                            AS employer_description,
                                      p.funding_agency,
                                      (a_1.activity_payload #>>
                                       '{form_data,activity_data,access_description}'::text[])                   AS access_description,
                                      (a_1.activity_payload #>>
                                       '{form_data,activity_data,location_description}'::text[])                 AS location_description,
                                      (a_1.activity_payload #>>
                                       '{form_data,activity_data,general_comment}'::text[])                      AS comment,
                                      a_1.elevation,
                                      a_1.well_proximity,
                                      a_1.geog,
                                      a_1.biogeoclimatic_zones,
                                      a_1.regional_invasive_species_organization_areas,
                                      a_1.invasive_plant_management_areas,
                                      a_1.ownership,
                                      a_1.regional_districts,
                                      a_1.flnro_districts,
                                      a_1.moti_districts,
                                      CASE
                                          WHEN (a_1.media_keys IS NULL) THEN 'No'::text
                                          ELSE 'Yes'::text
                                          END                                                                    AS photo,
                                      a_1.created_timestamp,
                                      a_1.received_timestamp
                               FROM (((invasivesbc.activity_incoming_data a_1
                                   LEFT JOIN array_aggregate p
                                       ON ((p.activity_incoming_data_id = a_1.activity_incoming_data_id)))
                                   LEFT JOIN invasivesbc.code_header employer_code_header
                                      ON ((((employer_code_header.code_header_title)::text = 'employer_code'::text) AND
                                           (employer_code_header.valid_to IS NULL))))
                                   LEFT JOIN invasivesbc.code employer_codes
                                     ON (((employer_codes.code_header_id = employer_code_header.code_header_id) AND
                                          ((a_1.activity_payload #>>
                                            '{form_data,activity_data,employer_code}'::text[]) =
                                           (employer_codes.code_name)::text))))
                               WHERE ((a_1.activity_incoming_data_id IN (SELECT activity_current.incoming_data_id
                                                                         FROM invasivesbc.activity_current)) AND
                                      ((a_1.form_status)::text = 'Submitted'::text) AND
                                      (a_1.deleted_timestamp IS NULL) AND
                                      ((a_1.activity_subtype)::text = 'Activity_Observation_PlantAquatic'::text))),
             waterbody_outflow AS (SELECT activity_incoming_data.activity_incoming_data_id,
                                          activity_incoming_data.form_status,
                                          public.convert_string_list_to_array_elements((
                                                  activity_incoming_data.activity_payload #>>
                                                  '{form_data,activity_subtype_data,WaterbodyData,outflow}'::text[])) AS outflow_code
                                   FROM invasivesbc.activity_incoming_data
                                   WHERE ((activity_incoming_data.activity_incoming_data_id IN
                                           (SELECT activity_current.incoming_data_id
                                            FROM invasivesbc.activity_current)) AND
                                          ((activity_incoming_data.form_status)::text = 'Submitted'::text) AND
                                          (activity_incoming_data.deleted_timestamp IS NULL) AND
                                          ((activity_incoming_data.activity_subtype)::text =
                                           'Activity_Observation_PlantAquatic'::text))),
             waterbody_outflow_code AS (SELECT w.activity_incoming_data_id,
                                               w.outflow_code,
                                               outflow_codes.code_description AS outflow
                                        FROM ((waterbody_outflow w
                                            LEFT JOIN invasivesbc.code_header outflow_code_header
                                               ON ((((outflow_code_header.code_header_title)::text = 'outflow_code'::text) AND
                                                    (outflow_code_header.valid_to IS NULL))))
                                            LEFT JOIN invasivesbc.code outflow_codes
                                              ON (((outflow_codes.code_header_id = outflow_code_header.code_header_id) AND
                                                   (w.outflow_code = (outflow_codes.code_name)::text))))),
             waterbody_outflow_agg AS (SELECT w.activity_incoming_data_id,
                                              string_agg((w.outflow)::text, ', '::text
                                                         ORDER BY (w.outflow)::text) AS outflow
                                       FROM waterbody_outflow_code w
                                       GROUP BY w.activity_incoming_data_id),
             waterbody_outflow_other AS (SELECT activity_incoming_data.activity_incoming_data_id,
                                                activity_incoming_data.form_status,
                                                public.convert_string_list_to_array_elements((
                                                        activity_incoming_data.activity_payload #>>
                                                        '{form_data,activity_subtype_data,WaterbodyData,outflow_other}'::text[])) AS outflow_other_code,
                                                outflow_codes.code_description                                                    AS outflow_other
                                         FROM ((invasivesbc.activity_incoming_data
                                             LEFT JOIN invasivesbc.code_header outflow_code_header
                                                ON ((((outflow_code_header.code_header_title)::text = 'outflow_code'::text) AND
                                                     (outflow_code_header.valid_to IS NULL))))
                                             LEFT JOIN invasivesbc.code outflow_codes
                                               ON (((outflow_codes.code_header_id = outflow_code_header.code_header_id) AND
                                                    ((activity_incoming_data.activity_payload #>>
                                                      '{form_data,activity_subtype_data,WaterbodyData,outflow_other}'::text[]) =
                                                     (outflow_codes.code_name)::text))))
                                         WHERE ((activity_incoming_data.activity_incoming_data_id IN
                                                 (SELECT activity_current.incoming_data_id
                                                  FROM invasivesbc.activity_current)) AND
                                                ((activity_incoming_data.form_status)::text = 'Submitted'::text) AND
                                                (activity_incoming_data.deleted_timestamp IS NULL) AND
                                                ((activity_incoming_data.activity_subtype)::text =
                                                 'Activity_Observation_PlantAquatic'::text))),
             waterbody_outflow_other_code AS (SELECT w.activity_incoming_data_id,
                                                     w.outflow_other_code,
                                                     outflow_codes.code_description AS outflow_other
                                              FROM ((waterbody_outflow_other w
                                                  LEFT JOIN invasivesbc.code_header outflow_code_header ON ((
                                                      ((outflow_code_header.code_header_title)::text = 'outflow_code'::text) AND
                                                      (outflow_code_header.valid_to IS NULL))))
                                                  LEFT JOIN invasivesbc.code outflow_codes
                                                    ON (((outflow_codes.code_header_id = outflow_code_header.code_header_id) AND
                                                         (w.outflow_other_code = (outflow_codes.code_name)::text))))),
             waterbody_outflow_other_agg AS (SELECT w.activity_incoming_data_id,
                                                    string_agg((w.outflow_other)::text, ', '::text
                                                               ORDER BY (w.outflow_other)::text) AS outflow_other
                                             FROM waterbody_outflow_other_code w
                                             GROUP BY w.activity_incoming_data_id),
             waterbody_inflow AS (SELECT activity_incoming_data.activity_incoming_data_id,
                                         activity_incoming_data.form_status,
                                         public.convert_string_list_to_array_elements((
                                                 activity_incoming_data.activity_payload #>>
                                                 '{form_data,activity_subtype_data,WaterbodyData,inflow_permanent}'::text[])) AS inflow_code
                                  FROM invasivesbc.activity_incoming_data
                                  WHERE ((activity_incoming_data.activity_incoming_data_id IN
                                          (SELECT activity_current.incoming_data_id
                                           FROM invasivesbc.activity_current)) AND
                                         ((activity_incoming_data.form_status)::text = 'Submitted'::text) AND
                                         (activity_incoming_data.deleted_timestamp IS NULL) AND
                                         ((activity_incoming_data.activity_subtype)::text =
                                          'Activity_Observation_PlantAquatic'::text))),
             waterbody_inflow_code AS (SELECT w.activity_incoming_data_id,
                                              w.inflow_code,
                                              inflow_permanent_codes.code_description AS inflow
                                       FROM ((waterbody_inflow w
                                           LEFT JOIN invasivesbc.code_header inflow_permanent_code_header ON ((
                                               ((inflow_permanent_code_header.code_header_title)::text =
                                                'inflow_permanent_code'::text) AND
                                               (inflow_permanent_code_header.valid_to IS NULL))))
                                           LEFT JOIN invasivesbc.code inflow_permanent_codes ON ((
                                               (inflow_permanent_codes.code_header_id =
                                                inflow_permanent_code_header.code_header_id) AND
                                               (w.inflow_code = (inflow_permanent_codes.code_name)::text))))),
             waterbody_inflow_agg AS (SELECT w.activity_incoming_data_id,
                                             string_agg((w.inflow)::text, ', '::text
                                                        ORDER BY (w.inflow)::text) AS inflow
                                      FROM waterbody_inflow_code w
                                      GROUP BY w.activity_incoming_data_id),
             waterbody_inflow_other AS (SELECT activity_incoming_data.activity_incoming_data_id,
                                               activity_incoming_data.form_status,
                                               public.convert_string_list_to_array_elements((
                                                       activity_incoming_data.activity_payload #>>
                                                       '{form_data,activity_subtype_data,WaterbodyData,inflow_other}'::text[])) AS inflow_other_code,
                                               inflow_temporary_codes.code_description                                          AS inflow_other
                                        FROM ((invasivesbc.activity_incoming_data
                                            LEFT JOIN invasivesbc.code_header inflow_temporary_code_header ON ((
                                                ((inflow_temporary_code_header.code_header_title)::text =
                                                 'inflow_temporary_code'::text) AND
                                                (inflow_temporary_code_header.valid_to IS NULL))))
                                            LEFT JOIN invasivesbc.code inflow_temporary_codes ON ((
                                                (inflow_temporary_codes.code_header_id =
                                                 inflow_temporary_code_header.code_header_id) AND
                                                ((activity_incoming_data.activity_payload #>>
                                                  '{form_data,activity_subtype_data,WaterbodyData,inflow_other}'::text[]) =
                                                 (inflow_temporary_codes.code_name)::text))))
                                        WHERE ((activity_incoming_data.activity_incoming_data_id IN
                                                (SELECT activity_current.incoming_data_id
                                                 FROM invasivesbc.activity_current)) AND
                                               ((activity_incoming_data.form_status)::text = 'Submitted'::text) AND
                                               (activity_incoming_data.deleted_timestamp IS NULL) AND
                                               ((activity_incoming_data.activity_subtype)::text =
                                                'Activity_Observation_PlantAquatic'::text))),
             waterbody_inflow_other_code AS (SELECT w.activity_incoming_data_id,
                                                    w.inflow_other_code,
                                                    inflow_temporary_codes.code_description AS inflow_other
                                             FROM ((waterbody_inflow_other w
                                                 LEFT JOIN invasivesbc.code_header inflow_temporary_code_header ON ((
                                                     ((inflow_temporary_code_header.code_header_title)::text =
                                                      'inflow_temporary_code'::text) AND
                                                     (inflow_temporary_code_header.valid_to IS NULL))))
                                                 LEFT JOIN invasivesbc.code inflow_temporary_codes ON ((
                                                     (inflow_temporary_codes.code_header_id =
                                                      inflow_temporary_code_header.code_header_id) AND
                                                     (w.inflow_other_code = (inflow_temporary_codes.code_name)::text))))),
             waterbody_inflow_other_agg AS (SELECT w.activity_incoming_data_id,
                                                   string_agg((w.inflow_other)::text, ', '::text
                                                              ORDER BY (w.inflow_other)::text) AS inflow_other
                                            FROM waterbody_inflow_other_code w
                                            GROUP BY w.activity_incoming_data_id),
             waterbody_use AS (SELECT activity_incoming_data.activity_incoming_data_id,
                                      activity_incoming_data.form_status,
                                      public.convert_string_list_to_array_elements((
                                              activity_incoming_data.activity_payload #>>
                                              '{form_data,activity_subtype_data,WaterbodyData,waterbody_use}'::text[])) AS waterbody_use_code
                               FROM invasivesbc.activity_incoming_data
                               WHERE ((activity_incoming_data.activity_incoming_data_id IN
                                       (SELECT activity_current.incoming_data_id
                                        FROM invasivesbc.activity_current)) AND
                                      ((activity_incoming_data.form_status)::text = 'Submitted'::text) AND
                                      (activity_incoming_data.deleted_timestamp IS NULL) AND
                                      ((activity_incoming_data.activity_subtype)::text =
                                       'Activity_Observation_PlantAquatic'::text))),
             waterbody_use_code AS (SELECT w.activity_incoming_data_id,
                                           w.waterbody_use_code,
                                           waterbody_use_codes.code_description AS waterbody_use
                                    FROM ((waterbody_use w
                                        LEFT JOIN invasivesbc.code_header waterbody_use_code_header ON ((
                                            ((waterbody_use_code_header.code_header_title)::text =
                                             'waterbody_use_code'::text) AND
                                            (waterbody_use_code_header.valid_to IS NULL))))
                                        LEFT JOIN invasivesbc.code waterbody_use_codes ON ((
                                            (waterbody_use_codes.code_header_id =
                                             waterbody_use_code_header.code_header_id) AND
                                            (w.waterbody_use_code = (waterbody_use_codes.code_name)::text))))),
             waterbody_use_agg AS (SELECT w.activity_incoming_data_id,
                                          string_agg((w.waterbody_use)::text, ', '::text
                                                     ORDER BY (w.waterbody_use)::text) AS waterbody_use
                                   FROM waterbody_use_code w
                                   GROUP BY w.activity_incoming_data_id),
             adjacent_land_use AS (SELECT activity_incoming_data.activity_incoming_data_id,
                                          activity_incoming_data.form_status,
                                          public.convert_string_list_to_array_elements((
                                                  activity_incoming_data.activity_payload #>>
                                                  '{form_data,activity_subtype_data,WaterbodyData,adjacent_land_use}'::text[])) AS adjacent_land_use_code
                                   FROM invasivesbc.activity_incoming_data
                                   WHERE ((activity_incoming_data.activity_incoming_data_id IN
                                           (SELECT activity_current.incoming_data_id
                                            FROM invasivesbc.activity_current)) AND
                                          ((activity_incoming_data.form_status)::text = 'Submitted'::text) AND
                                          (activity_incoming_data.deleted_timestamp IS NULL) AND
                                          ((activity_incoming_data.activity_subtype)::text =
                                           'Activity_Observation_PlantAquatic'::text))),
             adjacent_land_use_code AS (SELECT w.activity_incoming_data_id,
                                               w.adjacent_land_use_code,
                                               adjacent_land_use_codes.code_description AS adjacent_land_use
                                        FROM ((adjacent_land_use w
                                            LEFT JOIN invasivesbc.code_header adjacent_land_use_code_header ON ((
                                                ((adjacent_land_use_code_header.code_header_title)::text =
                                                 'adjacent_land_use_code'::text) AND
                                                (adjacent_land_use_code_header.valid_to IS NULL))))
                                            LEFT JOIN invasivesbc.code adjacent_land_use_codes ON ((
                                                (adjacent_land_use_codes.code_header_id =
                                                 adjacent_land_use_code_header.code_header_id) AND
                                                (w.adjacent_land_use_code = (adjacent_land_use_codes.code_name)::text))))),
             adjacent_land_use_agg AS (SELECT w.activity_incoming_data_id,
                                              string_agg((w.adjacent_land_use)::text, ', '::text
                                                         ORDER BY (w.adjacent_land_use)::text) AS adjacent_land_use
                                       FROM adjacent_land_use_code w
                                       GROUP BY w.activity_incoming_data_id),
             shoreline_array AS (SELECT activity_incoming_data.activity_incoming_data_id,
                                        activity_incoming_data.form_status,
                                        jsonb_array_elements((activity_incoming_data.activity_payload #>
                                                              '{form_data,activity_subtype_data,ShorelineTypes}'::text[])) AS shorelines
                                 FROM invasivesbc.activity_incoming_data
                                 WHERE ((activity_incoming_data.activity_incoming_data_id IN
                                         (SELECT activity_current.incoming_data_id
                                          FROM invasivesbc.activity_current)) AND
                                        ((activity_incoming_data.form_status)::text = 'Submitted'::text) AND
                                        (activity_incoming_data.deleted_timestamp IS NULL) AND
                                        ((activity_incoming_data.activity_subtype)::text =
                                         'Activity_Observation_PlantAquatic'::text))),
             shoreline_array_select AS (SELECT a_1.activity_incoming_data_id,
                                               (a_1.shorelines #>> '{shoreline_type}'::text[])  AS shoreline_type,
                                               shoreline_type_codes.code_description            AS shoreline_description,
                                               (a_1.shorelines #>> '{percent_covered}'::text[]) AS percent_covered
                                        FROM ((shoreline_array a_1
                                            LEFT JOIN invasivesbc.code_header shoreline_type_code_header ON ((
                                                ((shoreline_type_code_header.code_header_title)::text =
                                                 'shoreline_type_code'::text) AND
                                                (shoreline_type_code_header.valid_to IS NULL))))
                                            LEFT JOIN invasivesbc.code shoreline_type_codes ON ((
                                                (shoreline_type_codes.code_header_id =
                                                 shoreline_type_code_header.code_header_id) AND
                                                ((a_1.shorelines #>> '{shoreline_type}'::text[]) =
                                                 (shoreline_type_codes.code_name)::text))))),
             shoreline_agg AS (SELECT string_agg(((((a_1.shoreline_description)::text || ' '::text) ||
                                                   a_1.percent_covered) ||
                                                  '%'::text), ', '::text
                                                 ORDER BY a_1.shoreline_description) AS shorelines,
                                      a_1.activity_incoming_data_id
                               FROM shoreline_array_select a_1
                               GROUP BY a_1.activity_incoming_data_id),
             aquatic_plant_json AS (SELECT a_1.activity_incoming_data_id,
                                           activity_incoming_data.activity_subtype,
                                           activity_incoming_data.activity_incoming_data_id                                  AS id,
                                           a_1.shorelines,
                                           jsonb_array_elements((activity_incoming_data.activity_payload #>
                                                                 '{form_data,activity_subtype_data,AquaticPlants}'::text[])) AS json_array,
                                           (activity_incoming_data.activity_payload #>
                                            '{form_data,activity_subtype_data}'::text[])                                     AS json_data
                                    FROM (shoreline_agg a_1
                                        JOIN invasivesbc.activity_incoming_data
                                          ON ((activity_incoming_data.activity_incoming_data_id =
                                               a_1.activity_incoming_data_id)))),
             water_level_management AS (SELECT activity_incoming_data.activity_incoming_data_id,
                                               public.convert_string_list_to_array_elements((
                                                       activity_incoming_data.activity_payload #>>
                                                       '{form_data,activity_subtype_data,WaterbodyData,water_level_management}'::text[])) AS water_level_management
                                        FROM invasivesbc.activity_incoming_data
                                        WHERE ((activity_incoming_data.activity_incoming_data_id IN
                                                (SELECT activity_current.incoming_data_id
                                                 FROM invasivesbc.activity_current)) AND
                                               ((activity_incoming_data.form_status)::text = 'Submitted'::text) AND
                                               (activity_incoming_data.deleted_timestamp IS NULL) AND
                                               ((activity_incoming_data.activity_subtype)::text =
                                                'Activity_Observation_PlantAquatic'::text))),
             water_level_management_agg AS (SELECT w.activity_incoming_data_id,
                                                   string_agg(w.water_level_management, ', '::text
                                                              ORDER BY w.water_level_management) AS water_level_management
                                            FROM water_level_management w
                                            GROUP BY w.activity_incoming_data_id),
             substrate_type AS (SELECT activity_incoming_data.activity_incoming_data_id,
                                       public.convert_string_list_to_array_elements((
                                               activity_incoming_data.activity_payload #>>
                                               '{form_data,activity_subtype_data,WaterbodyData,substrate_type}'::text[])) AS substrate_type
                                FROM invasivesbc.activity_incoming_data
                                WHERE ((activity_incoming_data.activity_incoming_data_id IN
                                        (SELECT activity_current.incoming_data_id
                                         FROM invasivesbc.activity_current)) AND
                                       ((activity_incoming_data.form_status)::text = 'Submitted'::text) AND
                                       (activity_incoming_data.deleted_timestamp IS NULL) AND
                                       ((activity_incoming_data.activity_subtype)::text =
                                        'Activity_Observation_PlantAquatic'::text))),
             substrate_type_agg AS (SELECT s.activity_incoming_data_id,
                                           string_agg(s.substrate_type, ', '::text ORDER BY s.substrate_type) AS substrate_type
                                    FROM substrate_type s
                                    GROUP BY s.activity_incoming_data_id),
             aquatic_plant_json_select AS (SELECT a_1.shorelines,
                                                  a_1.activity_incoming_data_id,
                                                  (a_1.json_data #>> '{WaterbodyData,waterbody_type}'::text[])                                         AS waterbody_type,
                                                  (a_1.json_data #>> '{WaterbodyData,waterbody_name_gazetted}'::text[])                                AS waterbody_name_gazetted,
                                                  (a_1.json_data #>> '{WaterbodyData,waterbody_name_local}'::text[])                                   AS waterbody_name_local,
                                                  (a_1.json_data #>> '{WaterbodyData,waterbody_access}'::text[])                                       AS waterbody_access,
                                                  waterbody_use_agg.waterbody_use,
                                                  water_level_management_agg.water_level_management,
                                                  substrate_type_agg.substrate_type,
                                                  (a_1.json_data #>> '{WaterbodyData,tidal_influence}'::text[])                                        AS tidal_influence,
                                                  adjacent_land_use_agg.adjacent_land_use,
                                                  waterbody_inflow_agg.inflow                                                                          AS inflow_permanent,
                                                  waterbody_inflow_other_agg.inflow_other,
                                                  waterbody_outflow_agg.outflow,
                                                  waterbody_outflow_other_agg.outflow_other,
                                                  (a_1.json_data #>> '{WaterbodyData,comment}'::text[])                                                AS waterbody_comment,
                                                  (a_1.json_data #>> '{WaterQuality,water_sample_depth}'::text[])                                      AS water_sample_depth_meters,
                                                  (a_1.json_data #>> '{WaterQuality,secchi_depth}'::text[])                                            AS secchi_depth_meters,
                                                  (a_1.json_data #>> '{WaterQuality,water_colour}'::text[])                                            AS water_colour,
                                                  (a_1.json_data #>>
                                                   '{Observation_PlantAquatic_Information,suitable_for_biocontrol_agent}'::text[])                     AS suitable_for_biocontrol_agent,
                                                  (a_1.json_array #>> '{sample_point_id}'::text[])                                                     AS sample_point_id,
                                                  (a_1.json_array #>> '{observation_type}'::text[])                                                    AS observation_type,
                                                  (a_1.json_array #>> '{invasive_plant_code}'::text[])                                                 AS invasive_plant_code,
                                                  invasive_plant_aquatic_codes.code_description                                                        AS invasive_plant,
                                                  (a_1.json_array #>> '{plant_life_stage_code}'::text[])                                               AS plant_life_stage_code,
                                                  plant_life_stage_codes.code_description                                                              AS plant_life_stage,
                                                  (a_1.json_array #>> '{invasive_plant_density_code}'::text[])                                         AS invasive_plant_density_code,
                                                  invasive_plant_density_codes.code_description                                                        AS invasive_plant_density,
                                                  (a_1.json_array #>> '{invasive_plant_distribution_code}'::text[])                                    AS invasive_plant_distribution_code,
                                                  invasive_plant_distribution_codes.code_description                                                   AS invasive_plant_distribution,
                                                  (a_1.json_array #>> '{voucher_specimen_collected}'::text[])                                          AS voucher_specimen_collected,
                                                  (a_1.json_array #>>
                                                   '{voucher_specimen_collection_information,accession_number}'::text[])                               AS accession_number,
                                                  (a_1.json_array #>>
                                                   '{voucher_specimen_collection_information,exact_utm_coords,utm_zone}'::text[])                      AS voucher_utm_zone,
                                                  (a_1.json_array #>>
                                                   '{voucher_specimen_collection_information,exact_utm_coords,utm_easting}'::text[])                   AS voucher_utm_easting,
                                                  (a_1.json_array #>>
                                                   '{voucher_specimen_collection_information,exact_utm_coords,utm_northing}'::text[])                  AS voucher_utm_northing,
                                                  (a_1.json_array #>>
                                                   '{voucher_specimen_collection_information,name_of_herbarium}'::text[])                              AS name_of_herbarium,
                                                  (a_1.json_array #>>
                                                   '{voucher_specimen_collection_information,voucher_sample_id}'::text[])                              AS voucher_sample_id,
                                                  (a_1.json_array #>>
                                                   '{voucher_specimen_collection_information,date_voucher_verified}'::text[])                          AS date_voucher_verified,
                                                  (a_1.json_array #>>
                                                   '{voucher_specimen_collection_information,date_voucher_collected}'::text[])                         AS date_voucher_collected,
                                                  (a_1.json_array #>>
                                                   '{voucher_specimen_collection_information,voucher_verification_completed_by,person_name}'::text[])  AS voucher_person_name,
                                                  (a_1.json_array #>>
                                                   '{voucher_specimen_collection_information,voucher_verification_completed_by,organization}'::text[]) AS voucher_organization
                                           FROM ((((((((((((((((aquatic_plant_json a_1
                                               LEFT JOIN adjacent_land_use_agg
                                                                ON ((adjacent_land_use_agg.activity_incoming_data_id =
                                                                     a_1.activity_incoming_data_id)))
                                               LEFT JOIN waterbody_use_agg
                                                               ON ((waterbody_use_agg.activity_incoming_data_id =
                                                                    a_1.activity_incoming_data_id)))
                                               LEFT JOIN waterbody_inflow_agg
                                                              ON ((waterbody_inflow_agg.activity_incoming_data_id =
                                                                   a_1.activity_incoming_data_id)))
                                               LEFT JOIN waterbody_inflow_other_agg
                                                             ON ((waterbody_inflow_other_agg.activity_incoming_data_id =
                                                                  a_1.activity_incoming_data_id)))
                                               LEFT JOIN waterbody_outflow_agg
                                                            ON ((waterbody_outflow_agg.activity_incoming_data_id =
                                                                 a_1.activity_incoming_data_id)))
                                               LEFT JOIN waterbody_outflow_other_agg
                                                           ON ((waterbody_outflow_other_agg.activity_incoming_data_id =
                                                                a_1.activity_incoming_data_id)))
                                               LEFT JOIN water_level_management_agg
                                                          ON ((water_level_management_agg.activity_incoming_data_id =
                                                               a_1.activity_incoming_data_id)))
                                               LEFT JOIN substrate_type_agg
                                                         ON ((substrate_type_agg.activity_incoming_data_id =
                                                              a_1.activity_incoming_data_id)))
                                               LEFT JOIN invasivesbc.code_header invasive_plant_aquatic_code_header
                                                        ON ((
                                                                ((invasive_plant_aquatic_code_header.code_header_title)::text =
                                                                 'invasive_plant_aquatic_code'::text) AND
                                                                (invasive_plant_aquatic_code_header.valid_to IS NULL))))
                                               LEFT JOIN invasivesbc.code invasive_plant_aquatic_codes ON ((
                                                   (invasive_plant_aquatic_codes.code_header_id =
                                                    invasive_plant_aquatic_code_header.code_header_id) AND
                                                   ((a_1.json_array #>> '{invasive_plant_code}'::text[]) =
                                                    (invasive_plant_aquatic_codes.code_name)::text))))
                                               LEFT JOIN invasivesbc.code_header plant_life_stage_code_header ON ((
                                                   ((plant_life_stage_code_header.code_header_title)::text =
                                                    'plant_life_stage_code'::text) AND
                                                   (plant_life_stage_code_header.valid_to IS NULL))))
                                               LEFT JOIN invasivesbc.code plant_life_stage_codes ON ((
                                                   (plant_life_stage_codes.code_header_id =
                                                    plant_life_stage_code_header.code_header_id) AND
                                                   ((a_1.json_array #>> '{plant_life_stage_code}'::text[]) =
                                                    (plant_life_stage_codes.code_name)::text))))
                                               LEFT JOIN invasivesbc.code_header invasive_plant_density_code_header
                                                    ON ((
                                                            ((invasive_plant_density_code_header.code_header_title)::text =
                                                             'invasive_plant_density_code'::text) AND
                                                            (invasive_plant_density_code_header.valid_to IS NULL))))
                                               LEFT JOIN invasivesbc.code invasive_plant_density_codes ON ((
                                                   (invasive_plant_density_codes.code_header_id =
                                                    invasive_plant_density_code_header.code_header_id) AND
                                                   ((a_1.json_array #>> '{invasive_plant_density_code}'::text[]) =
                                                    (invasive_plant_density_codes.code_name)::text))))
                                               LEFT JOIN invasivesbc.code_header invasive_plant_distribution_code_header
                                                  ON ((
                                                          ((invasive_plant_distribution_code_header.code_header_title)::text =
                                                           'invasive_plant_distribution_code'::text) AND
                                                          (invasive_plant_distribution_code_header.valid_to IS NULL))))
                                               LEFT JOIN invasivesbc.code invasive_plant_distribution_codes ON ((
                                                   (invasive_plant_distribution_codes.code_header_id =
                                                    invasive_plant_distribution_code_header.code_header_id) AND
                                                   ((a_1.json_array #>> '{invasive_plant_distribution_code}'::text[]) =
                                                    (invasive_plant_distribution_codes.code_name)::text)))))
        SELECT c.activity_incoming_data_id,
               c.activity_id,
               c.short_id,
               c.project_code,
               c.activity_date_time,
               c.reported_area_sqm,
               c.latitude,
               c.longitude,
               c.utm_zone,
               c.utm_easting,
               c.utm_northing,
               c.employer_description AS employer,
               c.funding_agency,
               c.jurisdiction,
               c.access_description,
               c.location_description,
               c.comment,
               c.pre_treatment_observation,
               c.observation_person,
               a.shorelines,
               a.waterbody_type,
               a.waterbody_name_gazetted,
               a.waterbody_name_local,
               a.waterbody_access,
               a.waterbody_use,
               a.water_level_management,
               a.substrate_type,
               a.tidal_influence,
               a.adjacent_land_use,
               a.inflow_permanent,
               a.inflow_other,
               a.outflow,
               a.outflow_other,
               a.waterbody_comment,
               a.water_sample_depth_meters,
               a.secchi_depth_meters,
               a.water_colour,
               a.suitable_for_biocontrol_agent,
               a.sample_point_id,
               a.observation_type,
               a.invasive_plant,
               a.plant_life_stage,
               a.invasive_plant_density,
               a.invasive_plant_distribution,
               a.accession_number,
               a.voucher_utm_zone,
               a.voucher_utm_easting,
               a.voucher_utm_northing,
               a.name_of_herbarium,
               a.voucher_sample_id,
               a.date_voucher_verified,
               a.date_voucher_collected,
               a.voucher_person_name,
               a.voucher_organization,
               c.elevation,
               c.well_proximity,
               c.biogeoclimatic_zones,
               c.regional_invasive_species_organization_areas,
               c.invasive_plant_management_areas,
               c.ownership,
               c.regional_districts,
               c.flnro_districts,
               c.moti_districts,
               c.photo,
               c.created_timestamp,
               c.received_timestamp,
               c.geog
        FROM (common_fields c
            JOIN aquatic_plant_json_select a ON ((a.activity_incoming_data_id = c.activity_incoming_data_id)));
        CREATE VIEW invasivesbc.treatment_chemical_aquatic_plant_summary AS
        WITH array_elements AS (SELECT activity_incoming_data.activity_incoming_data_id,
                                       activity_incoming_data.activity_subtype,
                                       jurisdictions_array.value AS jurisdictions_array,
                                       project_code_array.value  AS project_code_array,
                                       person_array.value        AS person_array,
                                       funding_list.f1           AS funding_list
                                FROM ((((invasivesbc.activity_incoming_data
                                    LEFT JOIN LATERAL jsonb_array_elements((activity_incoming_data.activity_payload #>
                                                                            '{form_data,activity_data,jurisdictions}'::text[])) jurisdictions_array(value)
                                         ON (true))
                                    LEFT JOIN LATERAL jsonb_array_elements((activity_incoming_data.activity_payload #>
                                                                            '{form_data,activity_data,project_code}'::text[])) project_code_array(value)
                                        ON (true))
                                    LEFT JOIN LATERAL jsonb_array_elements((activity_incoming_data.activity_payload #>
                                                                            '{form_data,activity_type_data,activity_persons}'::text[])) person_array(value)
                                       ON (true))
                                    LEFT JOIN LATERAL public.convert_string_list_to_array_elements((
                                            activity_incoming_data.activity_payload #>>
                                            '{form_data,activity_data,invasive_species_agency_code}'::text[])) funding_list(f1)
                                      ON (true))
                                WHERE ((activity_incoming_data.activity_incoming_data_id IN
                                        (SELECT activity_current.incoming_data_id
                                         FROM invasivesbc.activity_current)) AND
                                       ((activity_incoming_data.form_status)::text = 'Submitted'::text) AND
                                       (activity_incoming_data.deleted_timestamp IS NULL) AND
                                       ((activity_incoming_data.activity_subtype)::text =
                                        'Activity_Treatment_ChemicalPlantAquatic'::text))),
             array_aggregate AS (SELECT a.activity_incoming_data_id,
                                        string_agg(DISTINCT (a.project_code_array #>> '{description}'::text[]),
                                                   ', '::text) AS project,
                                        string_agg(DISTINCT (a.person_array #>> '{person_name}'::text[]),
                                                   ', '::text) AS person_name,
                                        string_agg(DISTINCT
                                                   CASE
                                                       WHEN ((a.person_array #>> '{applicator_license}'::text[]) IS NOT NULL)
                                                           THEN concat((a.person_array #>> '{person_name}'::text[]),
                                                                       ', ',
                                                                       (a.person_array #>> '{applicator_license}'::text[]))
                                                       ELSE (a.person_array #>> '{person_name}'::text[])
                                                       END,
                                                   ', '::text) AS treatment_person_name,
                                        string_agg(DISTINCT concat(jurisdiction_codes.code_description, ' ',
                                                                   ((a.jurisdictions_array #>> '{percent_covered}'::text[]) || '%'::text)),
                                                   ', '::text) AS jurisdiction,
                                        string_agg(DISTINCT (invasive_species_agency_codes.code_description)::text,
                                                   ', '::text) AS funding_agency
                                 FROM ((((array_elements a
                                     LEFT JOIN invasivesbc.code_header jurisdiction_code_header ON ((
                                         ((jurisdiction_code_header.code_header_title)::text =
                                          'jurisdiction_code'::text) AND
                                         (jurisdiction_code_header.valid_to IS NULL))))
                                     LEFT JOIN invasivesbc.code jurisdiction_codes
                                         ON (((jurisdiction_codes.code_header_id =
                                               jurisdiction_code_header.code_header_id) AND
                                              ((a.jurisdictions_array #>> '{jurisdiction_code}'::text[]) =
                                               (jurisdiction_codes.code_name)::text))))
                                     LEFT JOIN invasivesbc.code_header invasive_species_agency_code_header ON ((
                                         ((invasive_species_agency_code_header.code_header_title)::text =
                                          'invasive_species_agency_code'::text) AND
                                         (invasive_species_agency_code_header.valid_to IS NULL))))
                                     LEFT JOIN invasivesbc.code invasive_species_agency_codes ON ((
                                         (invasive_species_agency_codes.code_header_id =
                                          invasive_species_agency_code_header.code_header_id) AND
                                         (a.funding_list = (invasive_species_agency_codes.code_name)::text))))
                                 GROUP BY a.activity_incoming_data_id),
             common_fields AS (SELECT p.jurisdiction,
                                      a.activity_incoming_data_id,
                                      a.activity_id,
                                      (a.activity_payload #>> '{short_id}'::text[])                            AS short_id,
                                      p.project                                                                AS project_code,
                                      (a.activity_payload #>> '{activity_type}'::text[])                       AS activity_type,
                                      (a.activity_payload #>> '{activity_subtype}'::text[])                    AS activity_subtype,
                                      a.form_status,
                                      to_char(to_timestamp(
                                                      (a.activity_payload #>>
                                                       '{form_data,activity_data,activity_date_time}'::text[]),
                                                      'YYYY-MM-DD"T"HH24:MI:SS'::text),
                                              'YYYY-MM-DD HH24:MI:SS'::text)                                   AS activity_date_time,
                                      (a.activity_payload #>> '{form_data,activity_data,utm_zone}'::text[])    AS utm_zone,
                                      (a.activity_payload #>> '{form_data,activity_data,utm_easting}'::text[]) AS utm_easting,
                                      (a.activity_payload #>>
                                       '{form_data,activity_data,utm_northing}'::text[])                       AS utm_northing,
                                      (a.activity_payload #>> '{form_data,activity_data,latitude}'::text[])    AS latitude,
                                      (a.activity_payload #>> '{form_data,activity_data,longitude}'::text[])   AS longitude,
                                      translate((a.activity_payload #>> '{species_positive}'::text[]), '[]"'::text,
                                                ''::text)                                                      AS species_positive,
                                      jsonb_array_length((a.activity_payload #> '{species_positive}'::text[])) AS positive_species_count,
                                      translate((a.activity_payload #>> '{species_negative}'::text[]), '[]"'::text,
                                                ''::text)                                                      AS species_negative,
                                      jsonb_array_length((a.activity_payload #> '{species_negative}'::text[])) AS negative_species_count,
                                      (a.activity_payload #>>
                                       '{form_data,activity_data,reported_area}'::text[])                      AS reported_area_sqm,
                                      (a.activity_payload #>>
                                       '{form_data,activity_type_data,pre_treatment_observation}'::text[])     AS pre_treatment_observation,
                                      p.person_name                                                            AS observation_person,
                                      p.treatment_person_name                                                  AS treatment_person,
                                      (a.activity_payload #>>
                                       '{form_data,activity_data,employer_code}'::text[])                      AS employer_code,
                                      employer_codes.code_description                                          AS employer_description,
                                      p.funding_agency,
                                      (a.activity_payload #>>
                                       '{form_data,activity_data,access_description}'::text[])                 AS access_description,
                                      (a.activity_payload #>>
                                       '{form_data,activity_data,location_description}'::text[])               AS location_description,
                                      (a.activity_payload #>>
                                       '{form_data,activity_data,general_comment}'::text[])                    AS comment,
                                      a.elevation,
                                      a.well_proximity,
                                      a.geog,
                                      a.biogeoclimatic_zones,
                                      a.regional_invasive_species_organization_areas,
                                      a.invasive_plant_management_areas,
                                      a.ownership,
                                      a.regional_districts,
                                      a.flnro_districts,
                                      a.moti_districts,
                                      CASE
                                          WHEN (a.media_keys IS NULL) THEN 'No'::text
                                          ELSE 'Yes'::text
                                          END                                                                  AS photo,
                                      a.created_timestamp,
                                      a.received_timestamp
                               FROM (((invasivesbc.activity_incoming_data a
                                   LEFT JOIN array_aggregate p
                                       ON ((p.activity_incoming_data_id = a.activity_incoming_data_id)))
                                   LEFT JOIN invasivesbc.code_header employer_code_header
                                      ON ((((employer_code_header.code_header_title)::text = 'employer_code'::text) AND
                                           (employer_code_header.valid_to IS NULL))))
                                   LEFT JOIN invasivesbc.code employer_codes
                                     ON (((employer_codes.code_header_id = employer_code_header.code_header_id) AND
                                          ((a.activity_payload #>> '{form_data,activity_data,employer_code}'::text[]) =
                                           (employer_codes.code_name)::text))))
                               WHERE ((a.activity_incoming_data_id IN (SELECT activity_current.incoming_data_id
                                                                       FROM invasivesbc.activity_current)) AND
                                      ((a.form_status)::text = 'Submitted'::text) AND (a.deleted_timestamp IS NULL) AND
                                      ((a.activity_subtype)::text = 'Activity_Treatment_ChemicalPlantAquatic'::text))),
             herbicide_array AS (SELECT activity_incoming_data.activity_incoming_data_id,
                                        (activity_incoming_data.activity_payload #>>
                                         '{form_data,activity_subtype_data,chemical_treatment_details,tank_mix}'::text[])                         AS tank_mix,
                                        (activity_incoming_data.activity_payload #>
                                         '{form_data,activity_subtype_data,chemical_treatment_details,tank_mix_object}'::text[])                  AS json_data,
                                        jsonb_array_elements((activity_incoming_data.activity_payload #>
                                                              '{form_data,activity_subtype_data,chemical_treatment_details,herbicides}'::text[])) AS json_array
                                 FROM invasivesbc.activity_incoming_data
                                 WHERE ((activity_incoming_data.activity_incoming_data_id IN
                                         (SELECT activity_current.incoming_data_id
                                          FROM invasivesbc.activity_current)) AND
                                        ((activity_incoming_data.activity_payload #>>
                                          '{form_data,activity_subtype_data,chemical_treatment_details,tank_mix}'::text[]) =
                                         'false'::text) AND
                                        ((activity_incoming_data.activity_subtype)::text =
                                         'Activity_Treatment_ChemicalPlantAquatic'::text) AND
                                        ((activity_incoming_data.form_status)::text = 'Submitted'::text) AND
                                        (activity_incoming_data.deleted_timestamp IS NULL) AND
                                        ((activity_incoming_data.activity_subtype)::text =
                                         'Activity_Treatment_ChemicalPlantAquatic'::text))),
             tank_mix_herbicide_array AS (SELECT activity_incoming_data.activity_incoming_data_id,
                                                 (activity_incoming_data.activity_payload #>>
                                                  '{form_data,activity_subtype_data,chemical_treatment_details,tank_mix}'::text[])                                         AS tank_mix,
                                                 (activity_incoming_data.activity_payload #>
                                                  '{form_data,activity_subtype_data,chemical_treatment_details,tank_mix_object}'::text[])                                  AS json_data,
                                                 jsonb_array_elements((activity_incoming_data.activity_payload #>
                                                                       '{form_data,activity_subtype_data,chemical_treatment_details,tank_mix_object,herbicides}'::text[])) AS json_array
                                          FROM invasivesbc.activity_incoming_data
                                          WHERE ((activity_incoming_data.activity_incoming_data_id IN
                                                  (SELECT activity_current.incoming_data_id
                                                   FROM invasivesbc.activity_current)) AND
                                                 ((activity_incoming_data.activity_payload #>>
                                                   '{form_data,activity_subtype_data,chemical_treatment_details,tank_mix}'::text[]) =
                                                  'true'::text) AND ((activity_incoming_data.activity_subtype)::text =
                                                                     'Activity_Treatment_ChemicalPlantAquatic'::text) AND
                                                 ((activity_incoming_data.form_status)::text = 'Submitted'::text) AND
                                                 (activity_incoming_data.deleted_timestamp IS NULL) AND
                                                 ((activity_incoming_data.activity_subtype)::text =
                                                  'Activity_Treatment_ChemicalPlantAquatic'::text))),
             invasive_plant_array AS (SELECT activity_incoming_data.activity_incoming_data_id,
                                             (activity_incoming_data.activity_payload #>>
                                              '{form_data,activity_subtype_data,chemical_treatment_details,tank_mix}'::text[])                              AS tank_mix,
                                             jsonb_array_elements((activity_incoming_data.activity_payload #>
                                                                   '{form_data,activity_subtype_data,chemical_treatment_details,invasive_plants}'::text[])) AS json_array
                                      FROM invasivesbc.activity_incoming_data
                                      WHERE ((activity_incoming_data.activity_incoming_data_id IN
                                              (SELECT activity_current.incoming_data_id
                                               FROM invasivesbc.activity_current)) AND
                                             ((activity_incoming_data.activity_subtype)::text =
                                              'Activity_Treatment_ChemicalPlantAquatic'::text) AND
                                             ((activity_incoming_data.form_status)::text = 'Submitted'::text) AND
                                             (activity_incoming_data.deleted_timestamp IS NULL))),
             calculation_json AS (SELECT activity_incoming_data.activity_incoming_data_id,
                                         activity_incoming_data.activity_subtype,
                                         (activity_incoming_data.activity_payload #>
                                          '{form_data,activity_subtype_data,chemical_treatment_details,calculation_results}'::text[]) AS json_data
                                  FROM invasivesbc.activity_incoming_data
                                  WHERE ((activity_incoming_data.activity_incoming_data_id IN
                                          (SELECT activity_current.incoming_data_id
                                           FROM invasivesbc.activity_current)) AND
                                         ((activity_incoming_data.activity_subtype)::text =
                                          'Activity_Treatment_ChemicalPlantAquatic'::text) AND
                                         ((activity_incoming_data.form_status)::text = 'Submitted'::text) AND
                                         (activity_incoming_data.deleted_timestamp IS NULL) AND
                                         (jsonb_array_length((activity_incoming_data.activity_payload #>
                                                              '{form_data,activity_subtype_data,chemical_treatment_details,invasive_plants}'::text[])) =
                                          1) AND (jsonb_array_length((activity_incoming_data.activity_payload #>
                                                                      '{form_data,activity_subtype_data,chemical_treatment_details,herbicides}'::text[])) =
                                                  1))),
             calculation_array AS (SELECT activity_incoming_data.activity_incoming_data_id,
                                          activity_incoming_data.activity_subtype,
                                          (activity_incoming_data.activity_payload #>>
                                           '{form_data,activity_subtype_data,chemical_treatment_details,tank_mix}'::text[])                                                  AS tank_mix,
                                          (activity_incoming_data.activity_payload #>
                                           '{form_data,activity_subtype_data,chemical_treatment_details,calculation_results}'::text[])                                       AS json_data,
                                          jsonb_array_elements((activity_incoming_data.activity_payload #>
                                                                '{form_data,activity_subtype_data,chemical_treatment_details,calculation_results,invasive_plants}'::text[])) AS json_array
                                   FROM invasivesbc.activity_incoming_data
                                   WHERE ((activity_incoming_data.activity_incoming_data_id IN
                                           (SELECT activity_current.incoming_data_id
                                            FROM invasivesbc.activity_current)) AND
                                          ((activity_incoming_data.activity_subtype)::text =
                                           'Activity_Treatment_ChemicalPlantAquatic'::text) AND
                                          ((activity_incoming_data.form_status)::text = 'Submitted'::text) AND
                                          (activity_incoming_data.deleted_timestamp IS NULL))),
             calculation_herbicide_array AS (SELECT c_1.activity_incoming_data_id,
                                                    c_1.activity_subtype,
                                                    c_1.tank_mix,
                                                    jsonb_array_elements((c_1.json_array #> '{herbicides}'::text[])) AS json_array
                                             FROM calculation_array c_1),
             tank_mix_herbicide_select AS (SELECT t.activity_incoming_data_id,
                                                  (t.json_array #>> '{herbicide_code}'::text[])           AS herbicide_code,
                                                  liquid_herbicide_codes.code_description                 AS liquid_herbicide,
                                                  granular_herbicide_codes.code_description               AS granular_herbicide,
                                                  (t.json_array #>> '{herbicide_type_code}'::text[])      AS herbicide_type_code,
                                                  herbicide_type_codes.code_description                   AS herbicide_type,
                                                  (t.json_array #>> '{product_application_rate}'::text[]) AS product_application_rate,
                                                  (t.json_data #>> '{amount_of_mix}'::text[])             AS amount_of_mix,
                                                  (t.json_data #>> '{calculation_type}'::text[])          AS calculation_type_code,
                                                  calculation_type_codes.code_description                 AS calculation_type,
                                                  (t.json_data #>> '{delivery_rate_of_mix}'::text[])      AS delivery_rate_of_mix,
                                                  (t.json_array #>> '{index}'::text[])                    AS tank_mix_herbicide_index,
                                                  concat(t.activity_incoming_data_id, '-index-',
                                                         (t.json_array #>> '{index}'::text[]))            AS tank_mix_herbicide_id
                                           FROM ((((((((tank_mix_herbicide_array t
                                               LEFT JOIN invasivesbc.code_header liquid_herbicide_code_header ON ((
                                                   ((liquid_herbicide_code_header.code_header_title)::text =
                                                    'liquid_herbicide_code'::text) AND
                                                   (liquid_herbicide_code_header.valid_to IS NULL))))
                                               LEFT JOIN invasivesbc.code liquid_herbicide_codes ON ((
                                                   (liquid_herbicide_codes.code_header_id =
                                                    liquid_herbicide_code_header.code_header_id) AND
                                                   ((t.json_array #>> '{herbicide_code}'::text[]) =
                                                    (liquid_herbicide_codes.code_name)::text))))
                                               LEFT JOIN invasivesbc.code_header granular_herbicide_code_header ON ((
                                                   ((granular_herbicide_code_header.code_header_title)::text =
                                                    'granular_herbicide_code'::text) AND
                                                   (granular_herbicide_code_header.valid_to IS NULL))))
                                               LEFT JOIN invasivesbc.code granular_herbicide_codes ON ((
                                                   (granular_herbicide_codes.code_header_id =
                                                    granular_herbicide_code_header.code_header_id) AND
                                                   ((t.json_array #>> '{herbicide_code}'::text[]) =
                                                    (granular_herbicide_codes.code_name)::text))))
                                               LEFT JOIN invasivesbc.code_header calculation_type_code_header ON ((
                                                   ((calculation_type_code_header.code_header_title)::text =
                                                    'calculation_type_code'::text) AND
                                                   (calculation_type_code_header.valid_to IS NULL))))
                                               LEFT JOIN invasivesbc.code calculation_type_codes ON ((
                                                   (calculation_type_codes.code_header_id =
                                                    calculation_type_code_header.code_header_id) AND
                                                   ((t.json_data #>> '{calculation_type}'::text[]) =
                                                    (calculation_type_codes.code_name)::text))))
                                               LEFT JOIN invasivesbc.code_header herbicide_type_code_header ON ((
                                                   ((herbicide_type_code_header.code_header_title)::text =
                                                    'herbicide_type_code'::text) AND
                                                   (herbicide_type_code_header.valid_to IS NULL))))
                                               LEFT JOIN invasivesbc.code herbicide_type_codes ON ((
                                                   (herbicide_type_codes.code_header_id =
                                                    herbicide_type_code_header.code_header_id) AND
                                                   ((t.json_array #>> '{herbicide_type_code}'::text[]) =
                                                    (herbicide_type_codes.code_name)::text))))),
             herbicide_select AS (SELECT t.activity_incoming_data_id,
                                         (t.json_array #>> '{herbicide_code}'::text[])           AS herbicide_code,
                                         liquid_herbicide_codes.code_description                 AS liquid_herbicide,
                                         granular_herbicide_codes.code_description               AS granular_herbicide,
                                         (t.json_array #>> '{herbicide_type_code}'::text[])      AS herbicide_type_code,
                                         herbicide_type_codes.code_description                   AS herbicide_type,
                                         (t.json_array #>> '{product_application_rate}'::text[]) AS product_application_rate,
                                         (t.json_array #>> '{amount_of_mix}'::text[])            AS amount_of_mix,
                                         (t.json_array #>> '{dilution}'::text[])                 AS dilution,
                                         (t.json_array #>> '{area_treated_sqm}'::text[])         AS area_treated_sqm,
                                         (c_1.json_data #>> '{dilution}'::text[])                AS dilution2,
                                         (c_1.json_data #>> '{area_treated_sqm}'::text[])        AS area_treated_sqm2,
                                         (c_1.json_data #>> '{percent_area_covered}'::text[])    AS percent_area_covered2,
                                         (c_1.json_data #>> '{area_treated_hectares}'::text[])   AS area_treated_hectares2,
                                         (c_1.json_data #>>
                                          '{amount_of_undiluted_herbicide_used_liters}'::text[]) AS amount_of_undiluted_herbicide_used_liters2,
                                         (t.json_array #>> '{calculation_type}'::text[])         AS calculation_type_code,
                                         calculation_type_codes.code_description                 AS calculation_type,
                                         (t.json_array #>> '{delivery_rate_of_mix}'::text[])     AS delivery_rate_of_mix,
                                         concat(t.activity_incoming_data_id, '-index-',
                                                (t.json_array #>> '{index}'::text[]))            AS herbicide_id
                                  FROM (((((((((herbicide_array t
                                      LEFT JOIN calculation_json c_1
                                                ON ((c_1.activity_incoming_data_id = t.activity_incoming_data_id)))
                                      LEFT JOIN invasivesbc.code_header liquid_herbicide_code_header ON ((
                                          ((liquid_herbicide_code_header.code_header_title)::text =
                                           'liquid_herbicide_code'::text) AND
                                          (liquid_herbicide_code_header.valid_to IS NULL))))
                                      LEFT JOIN invasivesbc.code liquid_herbicide_codes ON ((
                                          (liquid_herbicide_codes.code_header_id =
                                           liquid_herbicide_code_header.code_header_id) AND
                                          ((t.json_array #>> '{herbicide_code}'::text[]) =
                                           (liquid_herbicide_codes.code_name)::text))))
                                      LEFT JOIN invasivesbc.code_header granular_herbicide_code_header ON ((
                                          ((granular_herbicide_code_header.code_header_title)::text =
                                           'granular_herbicide_code'::text) AND
                                          (granular_herbicide_code_header.valid_to IS NULL))))
                                      LEFT JOIN invasivesbc.code granular_herbicide_codes ON ((
                                          (granular_herbicide_codes.code_header_id =
                                           granular_herbicide_code_header.code_header_id) AND
                                          ((t.json_array #>> '{herbicide_code}'::text[]) =
                                           (granular_herbicide_codes.code_name)::text))))
                                      LEFT JOIN invasivesbc.code_header calculation_type_code_header ON ((
                                          ((calculation_type_code_header.code_header_title)::text =
                                           'calculation_type_code'::text) AND
                                          (calculation_type_code_header.valid_to IS NULL))))
                                      LEFT JOIN invasivesbc.code calculation_type_codes ON ((
                                          (calculation_type_codes.code_header_id =
                                           calculation_type_code_header.code_header_id) AND
                                          ((t.json_array #>> '{calculation_type}'::text[]) =
                                           (calculation_type_codes.code_name)::text))))
                                      LEFT JOIN invasivesbc.code_header herbicide_type_code_header ON ((
                                          ((herbicide_type_code_header.code_header_title)::text =
                                           'herbicide_type_code'::text) AND
                                          (herbicide_type_code_header.valid_to IS NULL))))
                                      LEFT JOIN invasivesbc.code herbicide_type_codes ON ((
                                          (herbicide_type_codes.code_header_id =
                                           herbicide_type_code_header.code_header_id) AND
                                          ((t.json_array #>> '{herbicide_type_code}'::text[]) =
                                           (herbicide_type_codes.code_name)::text))))),
             calculation_array_select AS (SELECT i.activity_incoming_data_id,
                                                 (i.json_data #>> '{dilution}'::text[])                                   AS dilution,
                                                 (i.json_array #>> '{area_treated_hectares}'::text[])                     AS area_treated_hectares,
                                                 (i.json_array #>> '{area_treated_ha}'::text[])                           AS area_treated_ha,
                                                 (i.json_array #>> '{area_treated_sqm}'::text[])                          AS area_treated_sqm,
                                                 (i.json_array #>> '{amount_of_mix_used}'::text[])                        AS amount_of_mix_used,
                                                 (i.json_array #>> '{percent_area_covered}'::text[])                      AS percent_area_covered,
                                                 (i.json_array #>> '{percentage_area_covered}'::text[])                   AS percentage_area_covered,
                                                 (i.json_array #>> '{amount_of_undiluted_herbicide_used_liters}'::text[]) AS amount_of_undiluted_herbicide_used_liters,
                                                 concat(i.activity_incoming_data_id, '-index-',
                                                        (i.json_array #>> '{index}'::text[]))                             AS calculation_invasive_plant_id
                                          FROM calculation_array i),
             calculation_herbicide_array_select AS (SELECT h.activity_incoming_data_id,
                                                           (h.json_array #>> '{herbIndex}'::text[])                                 AS herbindex,
                                                           (h.json_array #>> '{plantIndex}'::text[])                                AS plantindex,
                                                           (h.json_array #>> '{dilution}'::text[])                                  AS dilution,
                                                           (h.json_array #>> '{amount_of_undiluted_herbicide_used_liters}'::text[]) AS amount_of_undiluted_herbicide_used_liters,
                                                           concat(h.activity_incoming_data_id, '-index-',
                                                                  (h.json_array #>> '{plantIndex}'::text[]))                        AS calculation_herbicide_id
                                                    FROM calculation_herbicide_array h),
             invasive_plant_array_select AS (SELECT i.activity_incoming_data_id,
                                                    (i.json_array #>> '{invasive_plant_code}'::text[])  AS invasive_plant_code,
                                                    invasive_plant_codes.code_description               AS invasive_plant,
                                                    (i.json_array #>> '{percent_area_covered}'::text[]) AS percent_area_covered,
                                                    (i.json_array #>> '{index}'::text[])                AS invasive_plant_index,
                                                    concat(i.activity_incoming_data_id, '-index-',
                                                           (i.json_array #>> '{index}'::text[]))        AS invasive_plant_id
                                             FROM ((invasive_plant_array i
                                                 LEFT JOIN invasivesbc.code_header invasive_plant_code_header ON ((
                                                     ((invasive_plant_code_header.code_header_title)::text =
                                                      'invasive_plant_aquatic_code'::text) AND
                                                     (invasive_plant_code_header.valid_to IS NULL))))
                                                 LEFT JOIN invasivesbc.code invasive_plant_codes ON ((
                                                     (invasive_plant_codes.code_header_id =
                                                      invasive_plant_code_header.code_header_id) AND
                                                     ((i.json_array #>> '{invasive_plant_code}'::text[]) =
                                                      (invasive_plant_codes.code_name)::text))))),
             not_tank_mix_plant_herbicide_join AS (SELECT i.activity_incoming_data_id,
                                                          i.invasive_plant,
                                                          i.percent_area_covered                                      AS ip_percent_area_covered,
                                                          i.invasive_plant_id,
                                                          concat(h.liquid_herbicide, h.granular_herbicide)            AS herbicide,
                                                          h.herbicide_type,
                                                          h.product_application_rate,
                                                          h.amount_of_mix,
                                                          h.calculation_type,
                                                          h.delivery_rate_of_mix,
                                                          h.herbicide_id,
                                                          concat(h.area_treated_sqm, c_1.area_treated_sqm,
                                                                 h.area_treated_sqm2)                                 AS area_treated_sqm,
                                                          c_1.amount_of_mix_used,
                                                          concat(c_1.area_treated_hectares, h.area_treated_hectares2) AS area_treated_hectares,
                                                          concat(c_1.percentage_area_covered, c_1.percent_area_covered,
                                                                 h.percent_area_covered2)                             AS percentage_area_covered,
                                                          concat(c_1.amount_of_undiluted_herbicide_used_liters,
                                                                 h.amount_of_undiluted_herbicide_used_liters2)        AS amount_of_undiluted_herbicide_used_liters,
                                                          concat(h.dilution, h.dilution2)                             AS dilution
                                                   FROM ((invasive_plant_array_select i
                                                       JOIN herbicide_select h
                                                          ON ((h.activity_incoming_data_id = i.activity_incoming_data_id)))
                                                       LEFT JOIN calculation_array_select c_1
                                                         ON ((c_1.calculation_invasive_plant_id = i.invasive_plant_id)))),
             tank_mix_plant_results_select AS (SELECT h.activity_incoming_data_id,
                                                      h.calculation_herbicide_id,
                                                      concat(h.activity_incoming_data_id, '-index-', h.herbindex,
                                                             h.plantindex) AS results_herbicide_plant_index,
                                                      h.dilution,
                                                      h.amount_of_undiluted_herbicide_used_liters,
                                                      c_1.calculation_invasive_plant_id,
                                                      c_1.area_treated_ha,
                                                      c_1.area_treated_sqm,
                                                      c_1.amount_of_mix_used,
                                                      c_1.percent_area_covered
                                               FROM (calculation_herbicide_array_select h
                                                   JOIN calculation_array_select c_1
                                                     ON ((c_1.calculation_invasive_plant_id = h.calculation_herbicide_id)))),
             invasive_plant_herbicide AS (SELECT i.activity_incoming_data_id,
                                                 concat(i.activity_incoming_data_id, '-index-',
                                                        h.tank_mix_herbicide_index,
                                                        i.invasive_plant_index)                   AS herbicide_plant_index,
                                                 i.invasive_plant,
                                                 i.percent_area_covered,
                                                 i.invasive_plant_id,
                                                 h.tank_mix_herbicide_index,
                                                 concat(h.liquid_herbicide, h.granular_herbicide) AS herbicide,
                                                 h.herbicide_type,
                                                 h.product_application_rate,
                                                 h.amount_of_mix,
                                                 h.calculation_type,
                                                 h.delivery_rate_of_mix,
                                                 h.tank_mix_herbicide_id
                                          FROM (invasive_plant_array_select i
                                              JOIN tank_mix_herbicide_select h
                                                ON ((h.activity_incoming_data_id = i.activity_incoming_data_id)))),
             tank_mix_results_select AS (SELECT i.activity_incoming_data_id,
                                                i.invasive_plant,
                                                i.percent_area_covered AS ip_percent_area_covered,
                                                i.invasive_plant_id,
                                                i.herbicide,
                                                i.herbicide_type,
                                                i.product_application_rate,
                                                i.amount_of_mix,
                                                i.calculation_type,
                                                i.delivery_rate_of_mix,
                                                i.tank_mix_herbicide_id,
                                                c_1.calculation_herbicide_id,
                                                c_1.dilution,
                                                c_1.amount_of_undiluted_herbicide_used_liters,
                                                c_1.calculation_invasive_plant_id,
                                                c_1.area_treated_ha,
                                                c_1.area_treated_sqm,
                                                c_1.amount_of_mix_used,
                                                c_1.percent_area_covered
                                         FROM (invasive_plant_herbicide i
                                             LEFT JOIN tank_mix_plant_results_select c_1
                                               ON ((c_1.results_herbicide_plant_index = i.herbicide_plant_index)))),
             jurisdiction_array AS (SELECT activity_incoming_data.activity_incoming_data_id,
                                           activity_incoming_data.activity_subtype,
                                           jsonb_array_elements((activity_incoming_data.activity_payload #>
                                                                 '{form_data,activity_data,jurisdictions}'::text[])) AS jurisdictions_array
                                    FROM invasivesbc.activity_incoming_data
                                    WHERE ((activity_incoming_data.activity_incoming_data_id IN
                                            (SELECT activity_current.incoming_data_id
                                             FROM invasivesbc.activity_current)) AND
                                           ((activity_incoming_data.form_status)::text = 'Submitted'::text) AND
                                           (activity_incoming_data.deleted_timestamp IS NULL) AND
                                           ((activity_incoming_data.activity_subtype)::text =
                                            'Activity_Treatment_ChemicalPlantAquatic'::text))),
             jurisdiction_array_select AS (SELECT j_1.activity_incoming_data_id,
                                                  (j_1.jurisdictions_array #>> '{jurisdiction_code}'::text[]) AS jurisdiction_code,
                                                  jurisdiction_codes.code_description                         AS jurisdiction,
                                                  (j_1.jurisdictions_array #>> '{percent_covered}'::text[])   AS percent_covered
                                           FROM ((jurisdiction_array j_1
                                               LEFT JOIN invasivesbc.code_header jurisdiction_code_header ON ((
                                                   ((jurisdiction_code_header.code_header_title)::text =
                                                    'jurisdiction_code'::text) AND
                                                   (jurisdiction_code_header.valid_to IS NULL))))
                                               LEFT JOIN invasivesbc.code jurisdiction_codes ON ((
                                                   (jurisdiction_codes.code_header_id =
                                                    jurisdiction_code_header.code_header_id) AND
                                                   ((j_1.jurisdictions_array #>> '{jurisdiction_code}'::text[]) =
                                                    (jurisdiction_codes.code_name)::text))))),
             form_data AS (SELECT activity_incoming_data.activity_incoming_data_id,
                                  activity_incoming_data.activity_subtype,
                                  activity_incoming_data.form_status,
                                  (activity_incoming_data.activity_payload #>
                                   '{form_data,activity_subtype_data}'::text[]) AS form_data
                           FROM invasivesbc.activity_incoming_data
                           WHERE ((activity_incoming_data.activity_incoming_data_id IN
                                   (SELECT activity_current.incoming_data_id
                                    FROM invasivesbc.activity_current)) AND
                                  ((activity_incoming_data.activity_subtype)::text =
                                   'Activity_Treatment_ChemicalPlantAquatic'::text) AND
                                  ((activity_incoming_data.form_status)::text = 'Submitted'::text) AND
                                  (activity_incoming_data.deleted_timestamp IS NULL))),
             json_select AS (SELECT f.activity_incoming_data_id,
                                    (f.form_data #>>
                                     '{Treatment_ChemicalPlant_Information,pesticide_employer_code}'::text[])  AS service_license_company,
                                    service_license_codes.code_description                                     AS service_license,
                                    (f.form_data #>>
                                     '{Treatment_ChemicalPlant_Information,pesticide_use_permit_PUP}'::text[]) AS pesticide_use_permit,
                                    (f.form_data #>>
                                     '{Treatment_ChemicalPlant_Information,pest_management_plan}'::text[])     AS pest_management_plan,
                                    (f.form_data #>>
                                     '{Treatment_ChemicalPlant_Information,pmp_not_in_dropdown}'::text[])      AS pmp_not_in_dropdown,
                                    (f.form_data #>>
                                     '{Treatment_ChemicalPlant_Information,temperature}'::text[])              AS temperature,
                                    (f.form_data #>>
                                     '{Treatment_ChemicalPlant_Information,wind_speed}'::text[])               AS wind_speed,
                                    (f.form_data #>>
                                     '{Treatment_ChemicalPlant_Information,wind_direction_code}'::text[])      AS wind_direction,
                                    (f.form_data #>>
                                     '{Treatment_ChemicalPlant_Information,humidity}'::text[])                 AS humidity,
                                    (f.form_data #>>
                                     '{Treatment_ChemicalPlant_Information,signage_on_site}'::text[])          AS treatment_notice_signs,
                                    (f.form_data #>>
                                     '{Treatment_ChemicalPlant_Information,application_start_time}'::text[])   AS application_start_time,
                                    h.invasive_plant,
                                    COALESCE(h.ip_percent_area_covered, '100'::text)                           AS ip_percent_area_covered,
                                    j_1.jurisdiction,
                                    j_1.percent_covered,
                                    (f.form_data #>> '{chemical_treatment_details,tank_mix}'::text[])          AS tank_mix,
                                    (f.form_data #>>
                                     '{chemical_treatment_details,chemical_application_method}'::text[])       AS chemical_application_method_code,
                                    chemical_method_codes.code_description                                     AS chemical_application_method,
                                    h.herbicide_type,
                                    h.herbicide,
                                    h.calculation_type,
                                    h.amount_of_mix,
                                    h.delivery_rate_of_mix,
                                    h.product_application_rate,
                                    h.dilution,
                                    h.amount_of_undiluted_herbicide_used_liters,
                                    h.area_treated_hectares,
                                    h.area_treated_sqm,
                                    h.amount_of_mix_used,
                                    h.percentage_area_covered
                             FROM ((((((form_data f
                                 JOIN not_tank_mix_plant_herbicide_join h
                                        ON ((h.activity_incoming_data_id = f.activity_incoming_data_id)))
                                 LEFT JOIN jurisdiction_array_select j_1
                                       ON ((j_1.activity_incoming_data_id = f.activity_incoming_data_id)))
                                 LEFT JOIN invasivesbc.code_header chemical_method_code_header ON ((
                                     ((chemical_method_code_header.code_header_title)::text =
                                      'chemical_method_code'::text) AND
                                     (chemical_method_code_header.valid_to IS NULL))))
                                 LEFT JOIN invasivesbc.code chemical_method_codes ON ((
                                     (chemical_method_codes.code_header_id =
                                      chemical_method_code_header.code_header_id) AND
                                     ((f.form_data #>>
                                       '{chemical_treatment_details,chemical_application_method}'::text[]) =
                                      (chemical_method_codes.code_name)::text))))
                                 LEFT JOIN invasivesbc.code_header service_license_code_header ON ((
                                     ((service_license_code_header.code_header_title)::text =
                                      'service_license_code'::text) AND
                                     (service_license_code_header.valid_to IS NULL))))
                                 LEFT JOIN invasivesbc.code service_license_codes
                                   ON (((service_license_codes.code_header_id =
                                         service_license_code_header.code_header_id) AND
                                        ((f.form_data #>>
                                          '{Treatment_ChemicalPlant_Information,pesticide_employer_code}'::text[]) =
                                         (service_license_codes.code_name)::text))))
                             WHERE ((f.form_data #>> '{chemical_treatment_details,tank_mix}'::text[]) = 'false'::text)),
             tank_mix_json_select AS (SELECT f.activity_incoming_data_id,
                                             (f.form_data #>>
                                              '{Treatment_ChemicalPlant_Information,pesticide_employer_code}'::text[])  AS service_license_company,
                                             service_license_codes.code_description                                     AS service_license,
                                             (f.form_data #>>
                                              '{Treatment_ChemicalPlant_Information,pesticide_use_permit_PUP}'::text[]) AS pesticide_use_permit,
                                             (f.form_data #>>
                                              '{Treatment_ChemicalPlant_Information,pest_management_plan}'::text[])     AS pest_management_plan,
                                             (f.form_data #>>
                                              '{Treatment_ChemicalPlant_Information,temperature}'::text[])              AS temperature,
                                             (f.form_data #>>
                                              '{Treatment_ChemicalPlant_Information,wind_speed}'::text[])               AS wind_speed,
                                             (f.form_data #>>
                                              '{Treatment_ChemicalPlant_Information,wind_direction_code}'::text[])      AS wind_direction,
                                             (f.form_data #>>
                                              '{Treatment_ChemicalPlant_Information,humidity}'::text[])                 AS humidity,
                                             (f.form_data #>>
                                              '{Treatment_ChemicalPlant_Information,signage_on_site}'::text[])          AS treatment_notice_signs,
                                             (f.form_data #>>
                                              '{Treatment_ChemicalPlant_Information,application_start_time}'::text[])   AS application_start_time,
                                             tm_1.invasive_plant,
                                             COALESCE(tm_1.ip_percent_area_covered, '100'::text)                        AS ip_percent_area_covered,
                                             j_1.jurisdiction,
                                             j_1.percent_covered,
                                             (f.form_data #>> '{chemical_treatment_details,tank_mix}'::text[])          AS tank_mix,
                                             (f.form_data #>>
                                              '{chemical_treatment_details,chemical_application_method}'::text[])       AS chemical_application_method_code,
                                             chemical_method_codes.code_description                                     AS chemical_application_method,
                                             tm_1.herbicide_type,
                                             tm_1.herbicide,
                                             tm_1.calculation_type,
                                             tm_1.amount_of_mix,
                                             tm_1.delivery_rate_of_mix,
                                             tm_1.product_application_rate,
                                             tm_1.dilution,
                                             tm_1.amount_of_undiluted_herbicide_used_liters,
                                             tm_1.area_treated_ha                                                       AS area_treated_hectares,
                                             tm_1.area_treated_sqm,
                                             tm_1.amount_of_mix_used,
                                             tm_1.percent_area_covered                                                  AS percentage_area_covered
                                      FROM ((((((form_data f
                                          LEFT JOIN tank_mix_results_select tm_1
                                                 ON ((tm_1.activity_incoming_data_id = f.activity_incoming_data_id)))
                                          LEFT JOIN jurisdiction_array_select j_1
                                                ON ((j_1.activity_incoming_data_id = f.activity_incoming_data_id)))
                                          LEFT JOIN invasivesbc.code_header chemical_method_code_header ON ((
                                              ((chemical_method_code_header.code_header_title)::text =
                                               'chemical_method_code'::text) AND
                                              (chemical_method_code_header.valid_to IS NULL))))
                                          LEFT JOIN invasivesbc.code chemical_method_codes ON ((
                                              (chemical_method_codes.code_header_id =
                                               chemical_method_code_header.code_header_id) AND ((f.form_data #>>
                                                                                                 '{chemical_treatment_details,chemical_application_method}'::text[]) =
                                                                                                (chemical_method_codes.code_name)::text))))
                                          LEFT JOIN invasivesbc.code_header service_license_code_header ON ((
                                              ((service_license_code_header.code_header_title)::text =
                                               'service_license_code'::text) AND
                                              (service_license_code_header.valid_to IS NULL))))
                                          LEFT JOIN invasivesbc.code service_license_codes ON ((
                                              (service_license_codes.code_header_id =
                                               service_license_code_header.code_header_id) AND ((f.form_data #>>
                                                                                                 '{Treatment_ChemicalPlant_Information,pesticide_employer_code}'::text[]) =
                                                                                                (service_license_codes.code_name)::text))))
                                      WHERE ((f.form_data #>> '{chemical_treatment_details,tank_mix}'::text[]) =
                                             'true'::text))
        SELECT c.activity_incoming_data_id,
               c.activity_id,
               c.short_id,
               c.project_code,
               c.activity_date_time,
               c.reported_area_sqm,
               c.latitude,
               c.longitude,
               c.utm_zone,
               c.utm_easting,
               c.utm_northing,
               c.employer_description                                                                   AS employer,
               c.funding_agency,
               concat(j.jurisdiction, tm.jurisdiction, ' ', j.percent_covered, tm.percent_covered, '%') AS jurisdiction,
               c.access_description,
               c.location_description,
               c.comment,
               c.treatment_person,
               c.well_proximity,
               j.service_license,
               concat(tm.pesticide_use_permit, j.pesticide_use_permit)                                  AS pesticide_use_permit,
               concat(tm.pest_management_plan, j.pest_management_plan)                                  AS pest_management_plan,
               j.pmp_not_in_dropdown,
               concat(tm.temperature, j.temperature)                                                    AS temperature_celsius,
               concat(tm.wind_speed, j.wind_speed)                                                      AS wind_speed_km,
               concat(tm.wind_direction, j.wind_direction)                                              AS wind_direction,
               concat(tm.humidity, j.humidity)                                                          AS humidity_percent,
               concat(tm.treatment_notice_signs, j.treatment_notice_signs)                              AS treatment_notice_signs,
               to_char(
                       to_timestamp(concat(tm.application_start_time, j.application_start_time),
                                    'YYYY-MM-DD"T"HH24:MI:SS'::text),
                       'YYYY-MM-DD HH24:MI:SS'::text)                                                   AS application_start_time,
               concat(tm.invasive_plant, j.invasive_plant)                                              AS invasive_plant,
               concat(tm.ip_percent_area_covered, j.ip_percent_area_covered, '%')                       AS invasive_plant_percent,
               CASE
                   WHEN (concat(tm.tank_mix, j.tank_mix) = 'false'::text) THEN 'No'::text
                   ELSE 'Yes'::text
                   END                                                                                  AS tank_mix,
               concat(tm.chemical_application_method,
                      j.chemical_application_method)                                                    AS chemical_application_method,
               concat(tm.herbicide_type, j.herbicide_type)                                              AS herbicide_type,
               concat(tm.herbicide, j.herbicide)                                                        AS herbicide,
               concat(tm.calculation_type, j.calculation_type)                                          AS calculation_type,
               concat(tm.delivery_rate_of_mix, j.delivery_rate_of_mix)                                  AS delivery_rate_of_mix,
               concat(tm.product_application_rate, j.product_application_rate)                          AS product_application_rate,
               concat(tm.dilution, j.dilution)                                                          AS dilution,
               (((concat(tm.percent_covered, j.percent_covered))::double precision / (100)::double precision) *
                (concat(tm.amount_of_undiluted_herbicide_used_liters,
                        j.amount_of_undiluted_herbicide_used_liters))::double precision)                AS amount_of_undiluted_herbicide_used_liters,
               (((concat(tm.percent_covered, j.percent_covered))::double precision / (100)::double precision) *
                (concat(tm.area_treated_hectares, j.area_treated_hectares))::double precision)          AS area_treated_hectares,
               (((concat(tm.percent_covered, j.percent_covered))::double precision / (100)::double precision) *
                (concat(tm.area_treated_sqm, j.area_treated_sqm))::double precision)                    AS area_treated_sqm,
               (((concat(tm.percent_covered, j.percent_covered))::double precision / (100)::double precision) *
                (concat(tm.amount_of_mix_used, j.amount_of_mix))::double precision)                     AS amount_of_mix_used,
               c.elevation,
               c.biogeoclimatic_zones,
               c.regional_invasive_species_organization_areas,
               c.invasive_plant_management_areas,
               c.ownership,
               c.regional_districts,
               c.flnro_districts,
               c.moti_districts,
               c.photo,
               c.created_timestamp,
               c.received_timestamp,
               c.geog
        FROM ((common_fields c
            LEFT JOIN json_select j ON ((j.activity_incoming_data_id = c.activity_incoming_data_id)))
            LEFT JOIN tank_mix_json_select tm ON ((tm.activity_incoming_data_id = c.activity_incoming_data_id)));
        CREATE VIEW invasivesbc.treatment_mechanical_aquatic_plant_summary AS
        WITH array_elements AS (SELECT activity_incoming_data.activity_incoming_data_id,
                                       activity_incoming_data.activity_subtype,
                                       jurisdictions_array.value AS jurisdictions_array,
                                       project_code_array.value  AS project_code_array,
                                       person_array.value        AS person_array,
                                       funding_list.f1           AS funding_list
                                FROM ((((invasivesbc.activity_incoming_data
                                    LEFT JOIN LATERAL jsonb_array_elements((activity_incoming_data.activity_payload #>
                                                                            '{form_data,activity_data,jurisdictions}'::text[])) jurisdictions_array(value)
                                         ON (true))
                                    LEFT JOIN LATERAL jsonb_array_elements((activity_incoming_data.activity_payload #>
                                                                            '{form_data,activity_data,project_code}'::text[])) project_code_array(value)
                                        ON (true))
                                    LEFT JOIN LATERAL jsonb_array_elements((activity_incoming_data.activity_payload #>
                                                                            '{form_data,activity_type_data,activity_persons}'::text[])) person_array(value)
                                       ON (true))
                                    LEFT JOIN LATERAL public.convert_string_list_to_array_elements((
                                            activity_incoming_data.activity_payload #>>
                                            '{form_data,activity_data,invasive_species_agency_code}'::text[])) funding_list(f1)
                                      ON (true))
                                WHERE ((activity_incoming_data.activity_incoming_data_id IN
                                        (SELECT activity_current.incoming_data_id
                                         FROM invasivesbc.activity_current)) AND
                                       ((activity_incoming_data.form_status)::text = 'Submitted'::text) AND
                                       (activity_incoming_data.deleted_timestamp IS NULL) AND
                                       ((activity_incoming_data.activity_subtype)::text =
                                        'Activity_Treatment_MechanicalPlantAquatic'::text))),
             array_aggregate AS (SELECT a_1.activity_incoming_data_id,
                                        string_agg(DISTINCT (a_1.project_code_array #>> '{description}'::text[]),
                                                   ', '::text) AS project,
                                        string_agg(DISTINCT (a_1.person_array #>> '{person_name}'::text[]),
                                                   ', '::text) AS person_name,
                                        string_agg(DISTINCT
                                                   CASE
                                                       WHEN ((a_1.person_array #>> '{applicator_license}'::text[]) IS NOT NULL)
                                                           THEN concat((a_1.person_array #>> '{person_name}'::text[]),
                                                                       ', ',
                                                                       (a_1.person_array #>> '{applicator_license}'::text[]))
                                                       ELSE (a_1.person_array #>> '{person_name}'::text[])
                                                       END,
                                                   ', '::text) AS treatment_person_name,
                                        string_agg(DISTINCT concat(jurisdiction_codes.code_description, ' ',
                                                                   ((a_1.jurisdictions_array #>> '{percent_covered}'::text[]) ||
                                                                    '%'::text)),
                                                   ', '::text) AS jurisdiction,
                                        string_agg(DISTINCT (invasive_species_agency_codes.code_description)::text,
                                                   ', '::text) AS funding_agency
                                 FROM ((((array_elements a_1
                                     LEFT JOIN invasivesbc.code_header jurisdiction_code_header ON ((
                                         ((jurisdiction_code_header.code_header_title)::text =
                                          'jurisdiction_code'::text) AND
                                         (jurisdiction_code_header.valid_to IS NULL))))
                                     LEFT JOIN invasivesbc.code jurisdiction_codes
                                         ON (((jurisdiction_codes.code_header_id =
                                               jurisdiction_code_header.code_header_id) AND
                                              ((a_1.jurisdictions_array #>> '{jurisdiction_code}'::text[]) =
                                               (jurisdiction_codes.code_name)::text))))
                                     LEFT JOIN invasivesbc.code_header invasive_species_agency_code_header ON ((
                                         ((invasive_species_agency_code_header.code_header_title)::text =
                                          'invasive_species_agency_code'::text) AND
                                         (invasive_species_agency_code_header.valid_to IS NULL))))
                                     LEFT JOIN invasivesbc.code invasive_species_agency_codes ON ((
                                         (invasive_species_agency_codes.code_header_id =
                                          invasive_species_agency_code_header.code_header_id) AND
                                         (a_1.funding_list = (invasive_species_agency_codes.code_name)::text))))
                                 GROUP BY a_1.activity_incoming_data_id),
             common_fields AS (SELECT p.jurisdiction,
                                      a_1.activity_incoming_data_id,
                                      a_1.activity_id,
                                      (a_1.activity_payload #>> '{short_id}'::text[])                            AS short_id,
                                      p.project                                                                  AS project_code,
                                      (a_1.activity_payload #>> '{activity_type}'::text[])                       AS activity_type,
                                      (a_1.activity_payload #>> '{activity_subtype}'::text[])                    AS activity_subtype,
                                      a_1.form_status,
                                      to_char(to_timestamp((a_1.activity_payload #>>
                                                            '{form_data,activity_data,activity_date_time}'::text[]),
                                                           'YYYY-MM-DD"T"HH24:MI:SS'::text),
                                              'YYYY-MM-DD HH24:MI:SS'::text)                                     AS activity_date_time,
                                      (a_1.activity_payload #>> '{form_data,activity_data,utm_zone}'::text[])    AS utm_zone,
                                      (a_1.activity_payload #>>
                                       '{form_data,activity_data,utm_easting}'::text[])                          AS utm_easting,
                                      (a_1.activity_payload #>>
                                       '{form_data,activity_data,utm_northing}'::text[])                         AS utm_northing,
                                      (a_1.activity_payload #>> '{form_data,activity_data,latitude}'::text[])    AS latitude,
                                      (a_1.activity_payload #>> '{form_data,activity_data,longitude}'::text[])   AS longitude,
                                      translate((a_1.activity_payload #>> '{species_positive}'::text[]), '[]"'::text,
                                                ''::text)                                                        AS species_positive,
                                      jsonb_array_length((a_1.activity_payload #> '{species_positive}'::text[])) AS positive_species_count,
                                      translate((a_1.activity_payload #>> '{species_negative}'::text[]), '[]"'::text,
                                                ''::text)                                                        AS species_negative,
                                      jsonb_array_length((a_1.activity_payload #> '{species_negative}'::text[])) AS negative_species_count,
                                      (a_1.activity_payload #>>
                                       '{form_data,activity_data,reported_area}'::text[])                        AS reported_area_sqm,
                                      (a_1.activity_payload #>>
                                       '{form_data,activity_type_data,pre_treatment_observation}'::text[])       AS pre_treatment_observation,
                                      p.person_name                                                              AS observation_person,
                                      p.treatment_person_name                                                    AS treatment_person,
                                      (a_1.activity_payload #>>
                                       '{form_data,activity_data,employer_code}'::text[])                        AS employer_code,
                                      employer_codes.code_description                                            AS employer_description,
                                      p.funding_agency,
                                      (a_1.activity_payload #>>
                                       '{form_data,activity_data,access_description}'::text[])                   AS access_description,
                                      (a_1.activity_payload #>>
                                       '{form_data,activity_data,location_description}'::text[])                 AS location_description,
                                      (a_1.activity_payload #>>
                                       '{form_data,activity_data,general_comment}'::text[])                      AS comment,
                                      a_1.elevation,
                                      a_1.well_proximity,
                                      a_1.geog,
                                      a_1.biogeoclimatic_zones,
                                      a_1.regional_invasive_species_organization_areas,
                                      a_1.invasive_plant_management_areas,
                                      a_1.ownership,
                                      a_1.regional_districts,
                                      a_1.flnro_districts,
                                      a_1.moti_districts,
                                      CASE
                                          WHEN (a_1.media_keys IS NULL) THEN 'No'::text
                                          ELSE 'Yes'::text
                                          END                                                                    AS photo,
                                      a_1.created_timestamp,
                                      a_1.received_timestamp
                               FROM (((invasivesbc.activity_incoming_data a_1
                                   LEFT JOIN array_aggregate p
                                       ON ((p.activity_incoming_data_id = a_1.activity_incoming_data_id)))
                                   LEFT JOIN invasivesbc.code_header employer_code_header
                                      ON ((((employer_code_header.code_header_title)::text = 'employer_code'::text) AND
                                           (employer_code_header.valid_to IS NULL))))
                                   LEFT JOIN invasivesbc.code employer_codes
                                     ON (((employer_codes.code_header_id = employer_code_header.code_header_id) AND
                                          ((a_1.activity_payload #>>
                                            '{form_data,activity_data,employer_code}'::text[]) =
                                           (employer_codes.code_name)::text))))
                               WHERE ((a_1.activity_incoming_data_id IN (SELECT activity_current.incoming_data_id
                                                                         FROM invasivesbc.activity_current)) AND
                                      ((a_1.form_status)::text = 'Submitted'::text) AND
                                      (a_1.deleted_timestamp IS NULL) AND
                                      ((a_1.activity_subtype)::text =
                                       'Activity_Treatment_MechanicalPlantAquatic'::text))),
             mechanical_treatment_array AS (SELECT activity_incoming_data.activity_incoming_data_id,
                                                   activity_incoming_data.activity_subtype,
                                                   activity_incoming_data.form_status,
                                                   jsonb_array_elements((activity_incoming_data.activity_payload #>
                                                                         '{form_data,activity_subtype_data,Treatment_MechanicalPlant_Information}'::text[])) AS json_array
                                            FROM invasivesbc.activity_incoming_data
                                            WHERE ((activity_incoming_data.activity_incoming_data_id IN
                                                    (SELECT activity_current.incoming_data_id
                                                     FROM invasivesbc.activity_current)) AND
                                                   ((activity_incoming_data.form_status)::text = 'Submitted'::text) AND
                                                   (activity_incoming_data.deleted_timestamp IS NULL) AND
                                                   ((activity_incoming_data.activity_subtype)::text =
                                                    'Activity_Treatment_MechanicalPlantAquatic'::text))),
             shoreline_array AS (SELECT activity_incoming_data.activity_incoming_data_id,
                                        activity_incoming_data.activity_subtype,
                                        activity_incoming_data.form_status,
                                        jsonb_array_elements((activity_incoming_data.activity_payload #>
                                                              '{form_data,activity_subtype_data,ShorelineTypes}'::text[])) AS shorelines
                                 FROM invasivesbc.activity_incoming_data
                                 WHERE ((activity_incoming_data.activity_incoming_data_id IN
                                         (SELECT activity_current.incoming_data_id
                                          FROM invasivesbc.activity_current)) AND
                                        ((activity_incoming_data.form_status)::text = 'Submitted'::text) AND
                                        (activity_incoming_data.deleted_timestamp IS NULL) AND
                                        ((activity_incoming_data.activity_subtype)::text =
                                         'Activity_Treatment_MechanicalPlantAquatic'::text))),
             mechanical_treatment_select AS (SELECT m_1.activity_incoming_data_id,
                                                    (a_1.activity_payload #>>
                                                     '{form_data,activity_subtype_data,Authorization_Infotmation,additional_auth_information}'::text[]) AS authorization_information,
                                                    (m_1.json_array #>> '{treated_area}'::text[])                                                       AS treated_area_sqm,
                                                    (m_1.json_array #>>
                                                     '{disposed_material,disposed_material_input_format}'::text[])                                      AS disposed_material_format,
                                                    (m_1.json_array #>>
                                                     '{disposed_material,disposed_material_input_number}'::text[])                                      AS disposed_material_amount,
                                                    (m_1.json_array #>> '{invasive_plant_code}'::text[])                                                AS invasive_plant_code,
                                                    invasive_plant_aquatic_codes.code_description                                                       AS invasive_plant,
                                                    (m_1.json_array #>> '{mechanical_method_code}'::text[])                                             AS mechanical_method_code,
                                                    mechanical_method_codes.code_description                                                            AS mechanical_method,
                                                    (m_1.json_array #>> '{mechanical_disposal_code}'::text[])                                           AS mechanical_disposal_code,
                                                    mechanical_disposal_codes.code_description                                                          AS disposal_method
                                             FROM (((((((mechanical_treatment_array m_1
                                                 JOIN invasivesbc.activity_incoming_data a_1
                                                         ON ((a_1.activity_incoming_data_id = m_1.activity_incoming_data_id)))
                                                 LEFT JOIN invasivesbc.code_header invasive_plant_aquatic_code_header
                                                        ON ((
                                                                ((invasive_plant_aquatic_code_header.code_header_title)::text =
                                                                 'invasive_plant_aquatic_code'::text) AND
                                                                (invasive_plant_aquatic_code_header.valid_to IS NULL))))
                                                 LEFT JOIN invasivesbc.code invasive_plant_aquatic_codes ON ((
                                                     (invasive_plant_aquatic_codes.code_header_id =
                                                      invasive_plant_aquatic_code_header.code_header_id) AND
                                                     ((m_1.json_array #>> '{invasive_plant_code}'::text[]) =
                                                      (invasive_plant_aquatic_codes.code_name)::text))))
                                                 LEFT JOIN invasivesbc.code_header mechanical_method_code_header ON ((
                                                     ((mechanical_method_code_header.code_header_title)::text =
                                                      'mechanical_method_code'::text) AND
                                                     (mechanical_method_code_header.valid_to IS NULL))))
                                                 LEFT JOIN invasivesbc.code mechanical_method_codes ON ((
                                                     (mechanical_method_codes.code_header_id =
                                                      mechanical_method_code_header.code_header_id) AND
                                                     ((m_1.json_array #>> '{mechanical_method_code}'::text[]) =
                                                      (mechanical_method_codes.code_name)::text))))
                                                 LEFT JOIN invasivesbc.code_header mechanical_disposal_code_header ON ((
                                                     ((mechanical_disposal_code_header.code_header_title)::text =
                                                      'mechanical_disposal_code'::text) AND
                                                     (mechanical_disposal_code_header.valid_to IS NULL))))
                                                 LEFT JOIN invasivesbc.code mechanical_disposal_codes ON ((
                                                     (mechanical_disposal_codes.code_header_id =
                                                      mechanical_disposal_code_header.code_header_id) AND
                                                     ((m_1.json_array #>> '{mechanical_disposal_code}'::text[]) =
                                                      (mechanical_disposal_codes.code_name)::text))))),
             shoreline_array_select AS (SELECT a_1.activity_incoming_data_id,
                                               (a_1.shorelines #>> '{shoreline_type}'::text[])  AS shoreline_type,
                                               shoreline_type_codes.code_description            AS shoreline_description,
                                               (a_1.shorelines #>> '{percent_covered}'::text[]) AS percent_covered
                                        FROM ((shoreline_array a_1
                                            LEFT JOIN invasivesbc.code_header shoreline_type_code_header ON ((
                                                ((shoreline_type_code_header.code_header_title)::text =
                                                 'shoreline_type_code'::text) AND
                                                (shoreline_type_code_header.valid_to IS NULL))))
                                            LEFT JOIN invasivesbc.code shoreline_type_codes ON ((
                                                (shoreline_type_codes.code_header_id =
                                                 shoreline_type_code_header.code_header_id) AND
                                                ((a_1.shorelines #>> '{shoreline_type}'::text[]) =
                                                 (shoreline_type_codes.code_name)::text))))),
             shoreline_agg AS (SELECT string_agg(((((a_1.shoreline_description)::text || ' '::text) ||
                                                   a_1.percent_covered) ||
                                                  '%'::text), ', '::text
                                                 ORDER BY a_1.shoreline_description) AS shorelines,
                                      a_1.activity_incoming_data_id
                               FROM shoreline_array_select a_1
                               GROUP BY a_1.activity_incoming_data_id)
        SELECT c.activity_incoming_data_id,
               c.activity_id,
               c.short_id,
               c.project_code,
               c.activity_date_time,
               c.reported_area_sqm,
               c.latitude,
               c.longitude,
               c.utm_zone,
               c.utm_easting,
               c.utm_northing,
               c.employer_description AS employer,
               c.funding_agency,
               c.jurisdiction,
               c.access_description,
               c.location_description,
               c.comment,
               c.observation_person,
               m.authorization_information,
               a.shorelines,
               m.invasive_plant,
               m.treated_area_sqm,
               m.mechanical_method,
               m.disposal_method,
               m.disposed_material_format,
               m.disposed_material_amount,
               c.elevation,
               c.well_proximity,
               c.biogeoclimatic_zones,
               c.regional_invasive_species_organization_areas,
               c.invasive_plant_management_areas,
               c.ownership,
               c.regional_districts,
               c.flnro_districts,
               c.moti_districts,
               c.photo,
               c.created_timestamp,
               c.received_timestamp,
               c.geog
        FROM ((common_fields c
            JOIN mechanical_treatment_select m ON ((m.activity_incoming_data_id = c.activity_incoming_data_id)))
            JOIN shoreline_agg a ON ((a.activity_incoming_data_id = c.activity_incoming_data_id)));
        CREATE VIEW invasivesbc.current_observation_aquatic_summary AS
        WITH select_summary AS (SELECT o.activity_incoming_data_id,
                                       o.activity_id,
                                       o.short_id,
                                       o.project_code,
                                       o.activity_date_time,
                                       o.reported_area_sqm,
                                       o.latitude,
                                       o.longitude,
                                       o.utm_zone,
                                       o.utm_easting,
                                       o.utm_northing,
                                       o.employer,
                                       o.funding_agency,
                                       o.jurisdiction,
                                       o.access_description,
                                       o.location_description,
                                       o.comment,
                                       o.pre_treatment_observation,
                                       o.observation_person,
                                       o.shorelines,
                                       o.waterbody_type,
                                       o.waterbody_name_gazetted,
                                       o.waterbody_name_local,
                                       o.waterbody_access,
                                       o.waterbody_use,
                                       o.water_level_management,
                                       o.substrate_type,
                                       o.tidal_influence,
                                       o.adjacent_land_use,
                                       o.inflow_permanent,
                                       o.inflow_other,
                                       o.outflow,
                                       o.outflow_other,
                                       o.waterbody_comment,
                                       o.water_sample_depth_meters,
                                       o.secchi_depth_meters,
                                       o.water_colour,
                                       o.suitable_for_biocontrol_agent,
                                       o.sample_point_id,
                                       o.observation_type,
                                       o.invasive_plant,
                                       o.plant_life_stage,
                                       o.invasive_plant_density,
                                       o.invasive_plant_distribution,
                                       o.accession_number,
                                       o.voucher_utm_zone,
                                       o.voucher_utm_easting,
                                       o.voucher_utm_northing,
                                       o.name_of_herbarium,
                                       o.voucher_sample_id,
                                       o.date_voucher_verified,
                                       o.date_voucher_collected,
                                       o.voucher_person_name,
                                       o.voucher_organization,
                                       o.elevation,
                                       o.well_proximity,
                                       o.biogeoclimatic_zones,
                                       o.regional_invasive_species_organization_areas,
                                       o.invasive_plant_management_areas,
                                       o.ownership,
                                       o.regional_districts,
                                       o.flnro_districts,
                                       o.moti_districts,
                                       o.photo,
                                       o.created_timestamp,
                                       o.received_timestamp,
                                       o.geog,
                                       invasive_plant_codes.code_name         AS species_code,
                                       concat(o.activity_incoming_data_id, '-',
                                              invasive_plant_codes.code_name) AS id_species
                                FROM ((invasivesbc.observation_aquatic_plant_summary o
                                    LEFT JOIN invasivesbc.code_header invasive_plant_code_header ON ((
                                        ((invasive_plant_code_header.code_header_title)::text =
                                         'invasive_plant_aquatic_code'::text) AND
                                        (invasive_plant_code_header.valid_to IS NULL))))
                                    LEFT JOIN invasivesbc.code invasive_plant_codes
                                      ON (((invasive_plant_codes.code_header_id =
                                            invasive_plant_code_header.code_header_id) AND
                                           ((o.invasive_plant)::text =
                                            (invasive_plant_codes.code_description)::text))))),
             chemical_treatment AS (SELECT treatment_chemical_aquatic_plant_summary.short_id,
                                           treatment_chemical_aquatic_plant_summary.invasive_plant,
                                           invasive_plant_codes.code_name                                          AS species_code,
                                           to_timestamp(treatment_chemical_aquatic_plant_summary.activity_date_time,
                                                        'YYYY-MM-DD HH24:MI:SS'::text)                             AS activity_date_time,
                                           treatment_chemical_aquatic_plant_summary.chemical_application_method,
                                           string_agg(DISTINCT treatment_chemical_aquatic_plant_summary.herbicide, ', '::text
                                                      ORDER BY treatment_chemical_aquatic_plant_summary.herbicide) AS herbicide,
                                           public.st_transform(
                                                   public.st_makevalid((treatment_chemical_aquatic_plant_summary.geog)::public.geometry),
                                                   4326)                                                           AS geom
                                    FROM ((invasivesbc.treatment_chemical_aquatic_plant_summary
                                        LEFT JOIN invasivesbc.code_header invasive_plant_code_header ON ((
                                            ((invasive_plant_code_header.code_header_title)::text =
                                             'invasive_plant_aquatic_code'::text) AND
                                            (invasive_plant_code_header.valid_to IS NULL))))
                                        LEFT JOIN invasivesbc.code invasive_plant_codes ON ((
                                            (invasive_plant_codes.code_header_id =
                                             invasive_plant_code_header.code_header_id) AND
                                            (treatment_chemical_aquatic_plant_summary.invasive_plant =
                                             (invasive_plant_codes.code_description)::text))))
                                    GROUP BY treatment_chemical_aquatic_plant_summary.short_id,
                                             treatment_chemical_aquatic_plant_summary.invasive_plant,
                                             invasive_plant_codes.code_name,
                                             treatment_chemical_aquatic_plant_summary.activity_date_time,
                                             treatment_chemical_aquatic_plant_summary.geog,
                                             treatment_chemical_aquatic_plant_summary.chemical_application_method),
             mechanical_treatment AS (SELECT treatment_mechanical_aquatic_plant_summary.short_id,
                                             treatment_mechanical_aquatic_plant_summary.invasive_plant,
                                             invasive_plant_codes.code_name AS species_code,
                                             treatment_mechanical_aquatic_plant_summary.created_timestamp,
                                             treatment_mechanical_aquatic_plant_summary.treated_area_sqm,
                                             treatment_mechanical_aquatic_plant_summary.mechanical_method,
                                             treatment_mechanical_aquatic_plant_summary.disposal_method,
                                             public.st_transform(
                                                     public.st_makevalid((treatment_mechanical_aquatic_plant_summary.geog)::public.geometry),
                                                     4326)                  AS geom
                                      FROM ((invasivesbc.treatment_mechanical_aquatic_plant_summary
                                          LEFT JOIN invasivesbc.code_header invasive_plant_code_header ON ((
                                              ((invasive_plant_code_header.code_header_title)::text =
                                               'invasive_plant_aquatic_code'::text) AND
                                              (invasive_plant_code_header.valid_to IS NULL))))
                                          LEFT JOIN invasivesbc.code invasive_plant_codes ON ((
                                              (invasive_plant_codes.code_header_id =
                                               invasive_plant_code_header.code_header_id) AND
                                              ((treatment_mechanical_aquatic_plant_summary.invasive_plant)::text =
                                               (invasive_plant_codes.code_description)::text)))))
        SELECT s.activity_incoming_data_id,
               s.activity_id,
               s.short_id,
               s.project_code,
               s.activity_date_time,
               round((public.st_area(public.st_transform(p.geom, 3005)))::numeric, 2) AS reported_area_sqm,
               s.latitude,
               s.longitude,
               s.utm_zone,
               s.utm_easting,
               s.utm_northing,
               s.employer,
               s.funding_agency,
               s.jurisdiction,
               s.access_description,
               s.location_description,
               s.comment,
               s.pre_treatment_observation,
               s.observation_person,
               s.shorelines,
               s.waterbody_type,
               s.waterbody_name_gazetted,
               s.waterbody_name_local,
               s.waterbody_access,
               s.waterbody_use,
               s.water_level_management,
               s.substrate_type,
               s.tidal_influence,
               s.adjacent_land_use,
               s.inflow_permanent,
               s.inflow_other,
               s.outflow,
               s.outflow_other,
               s.waterbody_comment,
               s.water_sample_depth_meters,
               s.secchi_depth_meters,
               s.water_colour,
               s.suitable_for_biocontrol_agent,
               s.sample_point_id,
               s.observation_type,
               s.invasive_plant,
               s.invasive_plant_density,
               s.invasive_plant_distribution,
               s.plant_life_stage,
               c.short_id                                                             AS chemical_short_id,
               to_char(c.activity_date_time, 'YYYY-MM-DD HH24:MI:SS'::text)           AS chemical_treatment_date,
               c.chemical_application_method,
               c.herbicide,
               round((public.st_area(public.st_transform(c.geom, 3005)))::numeric, 2) AS chemical_treatment_area_sqm,
               m.short_id                                                             AS mechanical_short_id,
               to_char(m.created_timestamp, 'YYYY-MM-DD HH24:MI:SS'::text)            AS mechanical_treatment_date,
               m.mechanical_method,
               m.disposal_method,
               round((public.st_area(public.st_transform(m.geom, 3005)))::numeric, 2) AS mechanical_treatment_area_sqm,
               s.voucher_sample_id,
               s.date_voucher_collected,
               s.date_voucher_verified,
               s.name_of_herbarium,
               s.accession_number,
               s.voucher_person_name,
               s.voucher_organization,
               s.voucher_utm_zone,
               s.voucher_utm_easting,
               s.voucher_utm_northing,
               s.elevation,
               s.well_proximity,
               s.biogeoclimatic_zones,
               s.regional_invasive_species_organization_areas,
               s.invasive_plant_management_areas,
               s.ownership,
               s.regional_districts,
               s.flnro_districts,
               s.moti_districts,
               s.photo,
               s.created_timestamp,
               s.received_timestamp,
               p.geom
        FROM (((select_summary s
            JOIN invasivesbc.current_positive_observations p ON ((p.id_species = s.id_species)))
            LEFT JOIN chemical_treatment c
               ON ((public.st_intersects2(p.geom, c.geom) AND (p.species_code = (c.species_code)::text) AND
                    (p.created_timestamp < c.activity_date_time))))
            LEFT JOIN mechanical_treatment m
              ON ((public.st_intersects2(p.geom, m.geom) AND (p.species_code = (m.species_code)::text) AND
                   (p.created_timestamp < m.created_timestamp))));
        CREATE VIEW invasivesbc.observation_terrestrial_plant_summary AS
        WITH array_elements AS (SELECT activity_incoming_data.activity_incoming_data_id,
                                       activity_incoming_data.activity_subtype,
                                       jurisdictions_array.value AS jurisdictions_array,
                                       project_code_array.value  AS project_code_array,
                                       person_array.value        AS person_array,
                                       funding_list.f1           AS funding_list
                                FROM ((((invasivesbc.activity_incoming_data
                                    LEFT JOIN LATERAL jsonb_array_elements((activity_incoming_data.activity_payload #>
                                                                            '{form_data,activity_data,jurisdictions}'::text[])) jurisdictions_array(value)
                                         ON (true))
                                    LEFT JOIN LATERAL jsonb_array_elements((activity_incoming_data.activity_payload #>
                                                                            '{form_data,activity_data,project_code}'::text[])) project_code_array(value)
                                        ON (true))
                                    LEFT JOIN LATERAL jsonb_array_elements((activity_incoming_data.activity_payload #>
                                                                            '{form_data,activity_type_data,activity_persons}'::text[])) person_array(value)
                                       ON (true))
                                    LEFT JOIN LATERAL public.convert_string_list_to_array_elements((
                                            activity_incoming_data.activity_payload #>>
                                            '{form_data,activity_data,invasive_species_agency_code}'::text[])) funding_list(f1)
                                      ON (true))
                                WHERE ((activity_incoming_data.activity_incoming_data_id IN
                                        (SELECT activity_current.incoming_data_id
                                         FROM invasivesbc.activity_current)) AND
                                       ((activity_incoming_data.form_status)::text = 'Submitted'::text) AND
                                       (activity_incoming_data.deleted_timestamp IS NULL) AND
                                       ((activity_incoming_data.activity_subtype)::text =
                                        'Activity_Observation_PlantTerrestrial'::text))),
             array_aggregate AS (SELECT a.activity_incoming_data_id,
                                        string_agg(DISTINCT (a.project_code_array #>> '{description}'::text[]),
                                                   ', '::text) AS project,
                                        string_agg(DISTINCT (a.person_array #>> '{person_name}'::text[]),
                                                   ', '::text) AS person_name,
                                        string_agg(DISTINCT
                                                   CASE
                                                       WHEN ((a.person_array #>> '{applicator_license}'::text[]) IS NOT NULL)
                                                           THEN concat((a.person_array #>> '{person_name}'::text[]),
                                                                       ', ',
                                                                       (a.person_array #>> '{applicator_license}'::text[]))
                                                       ELSE (a.person_array #>> '{person_name}'::text[])
                                                       END,
                                                   ', '::text) AS treatment_person_name,
                                        string_agg(DISTINCT concat(jurisdiction_codes.code_description, ' ',
                                                                   ((a.jurisdictions_array #>> '{percent_covered}'::text[]) || '%'::text)),
                                                   ', '::text) AS jurisdiction,
                                        string_agg(DISTINCT (invasive_species_agency_codes.code_description)::text,
                                                   ', '::text) AS funding_agency
                                 FROM ((((array_elements a
                                     LEFT JOIN invasivesbc.code_header jurisdiction_code_header ON ((
                                         ((jurisdiction_code_header.code_header_title)::text =
                                          'jurisdiction_code'::text) AND
                                         (jurisdiction_code_header.valid_to IS NULL))))
                                     LEFT JOIN invasivesbc.code jurisdiction_codes
                                         ON (((jurisdiction_codes.code_header_id =
                                               jurisdiction_code_header.code_header_id) AND
                                              ((a.jurisdictions_array #>> '{jurisdiction_code}'::text[]) =
                                               (jurisdiction_codes.code_name)::text))))
                                     LEFT JOIN invasivesbc.code_header invasive_species_agency_code_header ON ((
                                         ((invasive_species_agency_code_header.code_header_title)::text =
                                          'invasive_species_agency_code'::text) AND
                                         (invasive_species_agency_code_header.valid_to IS NULL))))
                                     LEFT JOIN invasivesbc.code invasive_species_agency_codes ON ((
                                         (invasive_species_agency_codes.code_header_id =
                                          invasive_species_agency_code_header.code_header_id) AND
                                         (a.funding_list = (invasive_species_agency_codes.code_name)::text))))
                                 GROUP BY a.activity_incoming_data_id),
             common_fields AS (SELECT p.jurisdiction,
                                      a.activity_incoming_data_id,
                                      a.activity_id,
                                      (a.activity_payload #>> '{short_id}'::text[])                            AS short_id,
                                      p.project                                                                AS project_code,
                                      (a.activity_payload #>> '{activity_type}'::text[])                       AS activity_type,
                                      (a.activity_payload #>> '{activity_subtype}'::text[])                    AS activity_subtype,
                                      a.form_status,
                                      to_char(to_timestamp(
                                                      (a.activity_payload #>>
                                                       '{form_data,activity_data,activity_date_time}'::text[]),
                                                      'YYYY-MM-DD"T"HH24:MI:SS'::text),
                                              'YYYY-MM-DD HH24:MI:SS'::text)                                   AS activity_date_time,
                                      (a.activity_payload #>> '{form_data,activity_data,utm_zone}'::text[])    AS utm_zone,
                                      (a.activity_payload #>> '{form_data,activity_data,utm_easting}'::text[]) AS utm_easting,
                                      (a.activity_payload #>>
                                       '{form_data,activity_data,utm_northing}'::text[])                       AS utm_northing,
                                      (a.activity_payload #>> '{form_data,activity_data,latitude}'::text[])    AS latitude,
                                      (a.activity_payload #>> '{form_data,activity_data,longitude}'::text[])   AS longitude,
                                      translate((a.activity_payload #>> '{species_positive}'::text[]), '[]"'::text,
                                                ''::text)                                                      AS species_positive,
                                      jsonb_array_length((a.activity_payload #> '{species_positive}'::text[])) AS positive_species_count,
                                      translate((a.activity_payload #>> '{species_negative}'::text[]), '[]"'::text,
                                                ''::text)                                                      AS species_negative,
                                      jsonb_array_length((a.activity_payload #> '{species_negative}'::text[])) AS negative_species_count,
                                      (a.activity_payload #>>
                                       '{form_data,activity_data,reported_area}'::text[])                      AS reported_area_sqm,
                                      (a.activity_payload #>>
                                       '{form_data,activity_type_data,pre_treatment_observation}'::text[])     AS pre_treatment_observation,
                                      p.person_name                                                            AS observation_person,
                                      p.treatment_person_name                                                  AS treatment_person,
                                      (a.activity_payload #>>
                                       '{form_data,activity_data,employer_code}'::text[])                      AS employer_code,
                                      employer_codes.code_description                                          AS employer_description,
                                      p.funding_agency,
                                      (a.activity_payload #>>
                                       '{form_data,activity_data,access_description}'::text[])                 AS access_description,
                                      (a.activity_payload #>>
                                       '{form_data,activity_data,location_description}'::text[])               AS location_description,
                                      (a.activity_payload #>>
                                       '{form_data,activity_data,general_comment}'::text[])                    AS comment,
                                      a.elevation,
                                      a.well_proximity,
                                      a.geog,
                                      a.biogeoclimatic_zones,
                                      a.regional_invasive_species_organization_areas,
                                      a.invasive_plant_management_areas,
                                      a.ownership,
                                      a.regional_districts,
                                      a.flnro_districts,
                                      a.moti_districts,
                                      CASE
                                          WHEN (a.media_keys IS NULL) THEN 'No'::text
                                          ELSE 'Yes'::text
                                          END                                                                  AS photo,
                                      a.created_timestamp,
                                      a.received_timestamp
                               FROM (((invasivesbc.activity_incoming_data a
                                   LEFT JOIN array_aggregate p
                                       ON ((p.activity_incoming_data_id = a.activity_incoming_data_id)))
                                   LEFT JOIN invasivesbc.code_header employer_code_header
                                      ON ((((employer_code_header.code_header_title)::text = 'employer_code'::text) AND
                                           (employer_code_header.valid_to IS NULL))))
                                   LEFT JOIN invasivesbc.code employer_codes
                                     ON (((employer_codes.code_header_id = employer_code_header.code_header_id) AND
                                          ((a.activity_payload #>> '{form_data,activity_data,employer_code}'::text[]) =
                                           (employer_codes.code_name)::text))))
                               WHERE ((a.activity_incoming_data_id IN (SELECT activity_current.incoming_data_id
                                                                       FROM invasivesbc.activity_current)) AND
                                      ((a.form_status)::text = 'Submitted'::text) AND (a.deleted_timestamp IS NULL) AND
                                      ((a.activity_subtype)::text = 'Activity_Observation_PlantTerrestrial'::text))),
             terrestrial_plant_array AS (SELECT activity_incoming_data.activity_incoming_data_id,
                                                activity_incoming_data.activity_subtype,
                                                jsonb_array_elements((activity_incoming_data.activity_payload #>
                                                                      '{form_data,activity_subtype_data,TerrestrialPlants}'::text[]))  AS json_array,
                                                (activity_incoming_data.activity_payload #>
                                                 '{form_data,activity_subtype_data,Observation_PlantTerrestrial_Information}'::text[]) AS json_data
                                         FROM invasivesbc.activity_incoming_data
                                         WHERE ((activity_incoming_data.activity_incoming_data_id IN
                                                 (SELECT activity_current.incoming_data_id
                                                  FROM invasivesbc.activity_current)) AND
                                                ((activity_incoming_data.form_status)::text = 'Submitted'::text) AND
                                                (activity_incoming_data.deleted_timestamp IS NULL) AND
                                                ((activity_incoming_data.activity_subtype)::text =
                                                 'Activity_Observation_PlantTerrestrial'::text))),
             terrestrial_plant_select AS (SELECT t_1.activity_incoming_data_id,
                                                 (t_1.json_data #>> '{soil_texture_code}'::text[])                                                    AS soil_texture_code,
                                                 soil_texture_codes.code_description                                                                  AS soil_texture,
                                                 (t_1.json_data #>> '{specific_use_code}'::text[])                                                    AS specific_use_code,
                                                 specific_use_codes.code_description                                                                  AS specific_use,
                                                 (t_1.json_data #>> '{slope_code}'::text[])                                                           AS slope_code,
                                                 slope_codes.code_description                                                                         AS slope,
                                                 (t_1.json_data #>> '{aspect_code}'::text[])                                                          AS aspect_code,
                                                 aspect_codes.code_description                                                                        AS aspect,
                                                 (t_1.json_data #>> '{research_detection_ind}'::text[])                                               AS research_observation,
                                                 (t_1.json_data #>> '{well_ind}'::text[])                                                             AS visible_well_nearby,
                                                 (t_1.json_data #>> '{suitable_for_biocontrol_agent}'::text[])                                        AS suitable_for_biocontrol_agent,
                                                 (t_1.json_array #>> '{observation_type}'::text[])                                                    AS observation_type,
                                                 (t_1.json_array #>> '{edna_sample}'::text[])                                                         AS edna_sample,
                                                 (t_1.json_array #>> '{invasive_plant_code}'::text[])                                                 AS invasive_plant_code,
                                                 invasive_plant_codes.code_description                                                                AS invasive_plant,
                                                 (t_1.json_array #>> '{plant_life_stage_code}'::text[])                                               AS plant_life_stage_code,
                                                 plant_life_stage_codes.code_description                                                              AS plant_life_stage,
                                                 (t_1.json_array #>> '{voucher_specimen_collected}'::text[])                                          AS voucher_specimen_collected,
                                                 (t_1.json_array #>> '{invasive_plant_density_code}'::text[])                                         AS invasive_plant_density_code,
                                                 invasive_plant_density_codes.code_description                                                        AS invasive_plant_density,
                                                 (t_1.json_array #>> '{invasive_plant_distribution_code}'::text[])                                    AS invasive_plant_distribution_code,
                                                 invasive_plant_distribution_codes.code_description                                                   AS invasive_plant_distribution,
                                                 (t_1.json_array #>>
                                                  '{voucher_specimen_collection_information,accession_number}'::text[])                               AS accession_number,
                                                 (t_1.json_array #>>
                                                  '{voucher_specimen_collection_information,exact_utm_coords,utm_zone}'::text[])                      AS voucher_utm_zone,
                                                 (t_1.json_array #>>
                                                  '{voucher_specimen_collection_information,exact_utm_coords,utm_easting}'::text[])                   AS voucher_utm_easting,
                                                 (t_1.json_array #>>
                                                  '{voucher_specimen_collection_information,exact_utm_coords,utm_northing}'::text[])                  AS voucher_utm_northing,
                                                 (t_1.json_array #>>
                                                  '{voucher_specimen_collection_information,name_of_herbarium}'::text[])                              AS name_of_herbarium,
                                                 (t_1.json_array #>>
                                                  '{voucher_specimen_collection_information,voucher_sample_id}'::text[])                              AS voucher_sample_id,
                                                 (t_1.json_array #>>
                                                  '{voucher_specimen_collection_information,date_voucher_verified}'::text[])                          AS date_voucher_verified,
                                                 (t_1.json_array #>>
                                                  '{voucher_specimen_collection_information,date_voucher_collected}'::text[])                         AS date_voucher_collected,
                                                 (t_1.json_array #>>
                                                  '{voucher_specimen_collection_information,voucher_verification_completed_by,person_name}'::text[])  AS voucher_person_name,
                                                 (t_1.json_array #>>
                                                  '{voucher_specimen_collection_information,voucher_verification_completed_by,organization}'::text[]) AS voucher_organization
                                          FROM ((((((((((((((((terrestrial_plant_array t_1
                                              LEFT JOIN invasivesbc.code_header soil_texture_code_header ON ((
                                                  ((soil_texture_code_header.code_header_title)::text =
                                                   'soil_texture_code'::text) AND
                                                  (soil_texture_code_header.valid_to IS NULL))))
                                              LEFT JOIN invasivesbc.code soil_texture_codes ON ((
                                                  (soil_texture_codes.code_header_id =
                                                   soil_texture_code_header.code_header_id) AND
                                                  ((t_1.json_data #>> '{soil_texture_code}'::text[]) =
                                                   (soil_texture_codes.code_name)::text))))
                                              LEFT JOIN invasivesbc.code_header specific_use_code_header ON ((
                                                  ((specific_use_code_header.code_header_title)::text =
                                                   'specific_use_code'::text) AND
                                                  (specific_use_code_header.valid_to IS NULL))))
                                              LEFT JOIN invasivesbc.code specific_use_codes ON ((
                                                  (specific_use_codes.code_header_id =
                                                   specific_use_code_header.code_header_id) AND
                                                  ((t_1.json_data #>> '{specific_use_code}'::text[]) =
                                                   (specific_use_codes.code_name)::text))))
                                              LEFT JOIN invasivesbc.code_header slope_code_header ON ((
                                                  ((slope_code_header.code_header_title)::text = 'slope_code'::text) AND
                                                  (slope_code_header.valid_to IS NULL))))
                                              LEFT JOIN invasivesbc.code slope_codes ON ((
                                                  (slope_codes.code_header_id = slope_code_header.code_header_id) AND
                                                  ((t_1.json_data #>> '{slope_code}'::text[]) =
                                                   (slope_codes.code_name)::text))))
                                              LEFT JOIN invasivesbc.code_header aspect_code_header ON ((
                                                  ((aspect_code_header.code_header_title)::text = 'aspect_code'::text) AND
                                                  (aspect_code_header.valid_to IS NULL))))
                                              LEFT JOIN invasivesbc.code aspect_codes ON ((
                                                  (aspect_codes.code_header_id = aspect_code_header.code_header_id) AND
                                                  ((t_1.json_data #>> '{aspect_code}'::text[]) =
                                                   (aspect_codes.code_name)::text))))
                                              LEFT JOIN invasivesbc.code_header plant_life_stage_code_header ON ((
                                                  ((plant_life_stage_code_header.code_header_title)::text =
                                                   'plant_life_stage_code'::text) AND
                                                  (plant_life_stage_code_header.valid_to IS NULL))))
                                              LEFT JOIN invasivesbc.code plant_life_stage_codes ON ((
                                                  (plant_life_stage_codes.code_header_id =
                                                   plant_life_stage_code_header.code_header_id) AND
                                                  ((t_1.json_array #>> '{plant_life_stage_code}'::text[]) =
                                                   (plant_life_stage_codes.code_name)::text))))
                                              LEFT JOIN invasivesbc.code_header invasive_plant_density_code_header ON ((
                                                  ((invasive_plant_density_code_header.code_header_title)::text =
                                                   'invasive_plant_density_code'::text) AND
                                                  (invasive_plant_density_code_header.valid_to IS NULL))))
                                              LEFT JOIN invasivesbc.code invasive_plant_density_codes ON ((
                                                  (invasive_plant_density_codes.code_header_id =
                                                   invasive_plant_density_code_header.code_header_id) AND
                                                  ((t_1.json_array #>> '{invasive_plant_density_code}'::text[]) =
                                                   (invasive_plant_density_codes.code_name)::text))))
                                              LEFT JOIN invasivesbc.code_header invasive_plant_distribution_code_header
                                                   ON ((
                                                           ((invasive_plant_distribution_code_header.code_header_title)::text =
                                                            'invasive_plant_distribution_code'::text) AND
                                                           (invasive_plant_distribution_code_header.valid_to IS NULL))))
                                              LEFT JOIN invasivesbc.code invasive_plant_distribution_codes ON ((
                                                  (invasive_plant_distribution_codes.code_header_id =
                                                   invasive_plant_distribution_code_header.code_header_id) AND
                                                  ((t_1.json_array #>> '{invasive_plant_distribution_code}'::text[]) =
                                                   (invasive_plant_distribution_codes.code_name)::text))))
                                              LEFT JOIN invasivesbc.code_header invasive_plant_code_header ON ((
                                                  ((invasive_plant_code_header.code_header_title)::text =
                                                   'invasive_plant_code'::text) AND
                                                  (invasive_plant_code_header.valid_to IS NULL))))
                                              LEFT JOIN invasivesbc.code invasive_plant_codes ON ((
                                                  (invasive_plant_codes.code_header_id =
                                                   invasive_plant_code_header.code_header_id) AND
                                                  ((t_1.json_array #>> '{invasive_plant_code}'::text[]) =
                                                   (invasive_plant_codes.code_name)::text)))))
        SELECT c.activity_incoming_data_id,
               c.activity_id,
               c.short_id,
               c.project_code,
               c.activity_date_time,
               c.reported_area_sqm,
               c.latitude,
               c.longitude,
               c.utm_zone,
               c.utm_easting,
               c.utm_northing,
               c.employer_description        AS employer,
               c.funding_agency,
               c.jurisdiction,
               c.access_description,
               c.location_description,
               c.comment,
               c.pre_treatment_observation,
               c.observation_person,
               t.soil_texture,
               t.specific_use,
               t.slope,
               t.aspect,
               t.research_observation,
               t.visible_well_nearby,
               t.suitable_for_biocontrol_agent,
               t.invasive_plant,
               t.observation_type,
               t.invasive_plant_density      AS density,
               t.invasive_plant_distribution AS distribution,
               t.plant_life_stage            AS life_stage,
               t.voucher_sample_id,
               t.date_voucher_collected,
               t.date_voucher_verified,
               t.name_of_herbarium,
               t.accession_number,
               t.voucher_person_name,
               t.voucher_organization,
               t.voucher_utm_zone,
               t.voucher_utm_easting,
               t.voucher_utm_northing,
               c.elevation,
               c.well_proximity,
               c.biogeoclimatic_zones,
               c.regional_invasive_species_organization_areas,
               c.invasive_plant_management_areas,
               c.ownership,
               c.regional_districts,
               c.flnro_districts,
               c.moti_districts,
               c.photo,
               c.created_timestamp,
               c.received_timestamp,
               c.geog
        FROM (common_fields c
            JOIN terrestrial_plant_select t ON ((t.activity_incoming_data_id = c.activity_incoming_data_id)));
        CREATE VIEW invasivesbc.treatment_chemical_terrestrial_plant_summary AS
        WITH array_elements AS (SELECT activity_incoming_data.activity_incoming_data_id,
                                       activity_incoming_data.activity_subtype,
                                       jurisdictions_array.value AS jurisdictions_array,
                                       project_code_array.value  AS project_code_array,
                                       person_array.value        AS person_array,
                                       funding_list.f1           AS funding_list
                                FROM ((((invasivesbc.activity_incoming_data
                                    LEFT JOIN LATERAL jsonb_array_elements((activity_incoming_data.activity_payload #>
                                                                            '{form_data,activity_data,jurisdictions}'::text[])) jurisdictions_array(value)
                                         ON (true))
                                    LEFT JOIN LATERAL jsonb_array_elements((activity_incoming_data.activity_payload #>
                                                                            '{form_data,activity_data,project_code}'::text[])) project_code_array(value)
                                        ON (true))
                                    LEFT JOIN LATERAL jsonb_array_elements((activity_incoming_data.activity_payload #>
                                                                            '{form_data,activity_type_data,activity_persons}'::text[])) person_array(value)
                                       ON (true))
                                    LEFT JOIN LATERAL public.convert_string_list_to_array_elements((
                                            activity_incoming_data.activity_payload #>>
                                            '{form_data,activity_data,invasive_species_agency_code}'::text[])) funding_list(f1)
                                      ON (true))
                                WHERE ((activity_incoming_data.activity_incoming_data_id IN
                                        (SELECT activity_current.incoming_data_id
                                         FROM invasivesbc.activity_current)) AND
                                       ((activity_incoming_data.form_status)::text = 'Submitted'::text) AND
                                       (activity_incoming_data.deleted_timestamp IS NULL) AND
                                       ((activity_incoming_data.activity_subtype)::text =
                                        'Activity_Treatment_ChemicalPlantTerrestrial'::text))),
             array_aggregate AS (SELECT a.activity_incoming_data_id,
                                        string_agg(DISTINCT (a.project_code_array #>> '{description}'::text[]),
                                                   ', '::text) AS project,
                                        string_agg(DISTINCT (a.person_array #>> '{person_name}'::text[]),
                                                   ', '::text) AS person_name,
                                        string_agg(DISTINCT
                                                   CASE
                                                       WHEN ((a.person_array #>> '{applicator_license}'::text[]) IS NOT NULL)
                                                           THEN concat((a.person_array #>> '{person_name}'::text[]),
                                                                       ', ',
                                                                       (a.person_array #>> '{applicator_license}'::text[]))
                                                       ELSE (a.person_array #>> '{person_name}'::text[])
                                                       END,
                                                   ', '::text) AS treatment_person_name,
                                        string_agg(DISTINCT concat(jurisdiction_codes.code_description, ' ',
                                                                   ((a.jurisdictions_array #>> '{percent_covered}'::text[]) || '%'::text)),
                                                   ', '::text) AS jurisdiction,
                                        string_agg(DISTINCT (invasive_species_agency_codes.code_description)::text,
                                                   ', '::text) AS funding_agency
                                 FROM ((((array_elements a
                                     LEFT JOIN invasivesbc.code_header jurisdiction_code_header ON ((
                                         ((jurisdiction_code_header.code_header_title)::text =
                                          'jurisdiction_code'::text) AND
                                         (jurisdiction_code_header.valid_to IS NULL))))
                                     LEFT JOIN invasivesbc.code jurisdiction_codes
                                         ON (((jurisdiction_codes.code_header_id =
                                               jurisdiction_code_header.code_header_id) AND
                                              ((a.jurisdictions_array #>> '{jurisdiction_code}'::text[]) =
                                               (jurisdiction_codes.code_name)::text))))
                                     LEFT JOIN invasivesbc.code_header invasive_species_agency_code_header ON ((
                                         ((invasive_species_agency_code_header.code_header_title)::text =
                                          'invasive_species_agency_code'::text) AND
                                         (invasive_species_agency_code_header.valid_to IS NULL))))
                                     LEFT JOIN invasivesbc.code invasive_species_agency_codes ON ((
                                         (invasive_species_agency_codes.code_header_id =
                                          invasive_species_agency_code_header.code_header_id) AND
                                         (a.funding_list = (invasive_species_agency_codes.code_name)::text))))
                                 GROUP BY a.activity_incoming_data_id),
             common_fields AS (SELECT p.jurisdiction,
                                      a.activity_incoming_data_id,
                                      a.activity_id,
                                      (a.activity_payload #>> '{short_id}'::text[])                            AS short_id,
                                      p.project                                                                AS project_code,
                                      (a.activity_payload #>> '{activity_type}'::text[])                       AS activity_type,
                                      (a.activity_payload #>> '{activity_subtype}'::text[])                    AS activity_subtype,
                                      a.form_status,
                                      to_char(to_timestamp(
                                                      (a.activity_payload #>>
                                                       '{form_data,activity_data,activity_date_time}'::text[]),
                                                      'YYYY-MM-DD"T"HH24:MI:SS'::text),
                                              'YYYY-MM-DD HH24:MI:SS'::text)                                   AS activity_date_time,
                                      (a.activity_payload #>> '{form_data,activity_data,utm_zone}'::text[])    AS utm_zone,
                                      (a.activity_payload #>> '{form_data,activity_data,utm_easting}'::text[]) AS utm_easting,
                                      (a.activity_payload #>>
                                       '{form_data,activity_data,utm_northing}'::text[])                       AS utm_northing,
                                      (a.activity_payload #>> '{form_data,activity_data,latitude}'::text[])    AS latitude,
                                      (a.activity_payload #>> '{form_data,activity_data,longitude}'::text[])   AS longitude,
                                      translate((a.activity_payload #>> '{species_positive}'::text[]), '[]"'::text,
                                                ''::text)                                                      AS species_positive,
                                      jsonb_array_length((a.activity_payload #> '{species_positive}'::text[])) AS positive_species_count,
                                      translate((a.activity_payload #>> '{species_negative}'::text[]), '[]"'::text,
                                                ''::text)                                                      AS species_negative,
                                      jsonb_array_length((a.activity_payload #> '{species_negative}'::text[])) AS negative_species_count,
                                      (a.activity_payload #>>
                                       '{form_data,activity_data,reported_area}'::text[])                      AS reported_area_sqm,
                                      (a.activity_payload #>>
                                       '{form_data,activity_type_data,pre_treatment_observation}'::text[])     AS pre_treatment_observation,
                                      p.person_name                                                            AS observation_person,
                                      p.treatment_person_name                                                  AS treatment_person,
                                      (a.activity_payload #>>
                                       '{form_data,activity_data,employer_code}'::text[])                      AS employer_code,
                                      employer_codes.code_description                                          AS employer_description,
                                      p.funding_agency,
                                      (a.activity_payload #>>
                                       '{form_data,activity_data,access_description}'::text[])                 AS access_description,
                                      (a.activity_payload #>>
                                       '{form_data,activity_data,location_description}'::text[])               AS location_description,
                                      (a.activity_payload #>>
                                       '{form_data,activity_data,general_comment}'::text[])                    AS comment,
                                      a.elevation,
                                      a.well_proximity,
                                      a.geom,
                                      a.geog,
                                      a.biogeoclimatic_zones,
                                      a.regional_invasive_species_organization_areas,
                                      a.invasive_plant_management_areas,
                                      a.ownership,
                                      a.regional_districts,
                                      a.flnro_districts,
                                      a.moti_districts,
                                      CASE
                                          WHEN (a.media_keys IS NULL) THEN 'No'::text
                                          ELSE 'Yes'::text
                                          END                                                                  AS photo,
                                      a.created_timestamp,
                                      a.received_timestamp
                               FROM (((invasivesbc.activity_incoming_data a
                                   LEFT JOIN array_aggregate p
                                       ON ((p.activity_incoming_data_id = a.activity_incoming_data_id)))
                                   LEFT JOIN invasivesbc.code_header employer_code_header
                                      ON ((((employer_code_header.code_header_title)::text = 'employer_code'::text) AND
                                           (employer_code_header.valid_to IS NULL))))
                                   LEFT JOIN invasivesbc.code employer_codes
                                     ON (((employer_codes.code_header_id = employer_code_header.code_header_id) AND
                                          ((a.activity_payload #>> '{form_data,activity_data,employer_code}'::text[]) =
                                           (employer_codes.code_name)::text))))
                               WHERE ((a.activity_incoming_data_id IN (SELECT activity_current.incoming_data_id
                                                                       FROM invasivesbc.activity_current)) AND
                                      ((a.form_status)::text = 'Submitted'::text) AND (a.deleted_timestamp IS NULL) AND
                                      ((a.activity_subtype)::text =
                                       'Activity_Treatment_ChemicalPlantTerrestrial'::text))),
             herbicide_array AS (SELECT activity_incoming_data.activity_incoming_data_id,
                                        (activity_incoming_data.activity_payload #>>
                                         '{form_data,activity_subtype_data,chemical_treatment_details,tank_mix}'::text[])                         AS tank_mix,
                                        (activity_incoming_data.activity_payload #>
                                         '{form_data,activity_subtype_data,chemical_treatment_details,tank_mix_object}'::text[])                  AS json_data,
                                        jsonb_array_elements((activity_incoming_data.activity_payload #>
                                                              '{form_data,activity_subtype_data,chemical_treatment_details,herbicides}'::text[])) AS json_array
                                 FROM invasivesbc.activity_incoming_data
                                 WHERE ((activity_incoming_data.activity_incoming_data_id IN
                                         (SELECT activity_current.incoming_data_id
                                          FROM invasivesbc.activity_current)) AND
                                        ((activity_incoming_data.activity_payload #>>
                                          '{form_data,activity_subtype_data,chemical_treatment_details,tank_mix}'::text[]) =
                                         'false'::text) AND
                                        ((activity_incoming_data.activity_subtype)::text =
                                         'Activity_Treatment_ChemicalPlantTerrestrial'::text) AND
                                        ((activity_incoming_data.form_status)::text = 'Submitted'::text) AND
                                        (activity_incoming_data.deleted_timestamp IS NULL) AND
                                        ((activity_incoming_data.activity_subtype)::text =
                                         'Activity_Treatment_ChemicalPlantTerrestrial'::text))),
             tank_mix_herbicide_array AS (SELECT activity_incoming_data.activity_incoming_data_id,
                                                 (activity_incoming_data.activity_payload #>>
                                                  '{form_data,activity_subtype_data,chemical_treatment_details,tank_mix}'::text[])                                                          AS tank_mix,
                                                 (activity_incoming_data.activity_payload #>
                                                  '{form_data,activity_subtype_data,chemical_treatment_details,tank_mix_object}'::text[])                                                   AS json_data,
                                                 (1.0 / (jsonb_array_length((activity_incoming_data.activity_payload #>
                                                                             '{form_data,activity_subtype_data,chemical_treatment_details,tank_mix_object,herbicides}'::text[])))::numeric) AS herbicide_percent,
                                                 jsonb_array_elements((activity_incoming_data.activity_payload #>
                                                                       '{form_data,activity_subtype_data,chemical_treatment_details,tank_mix_object,herbicides}'::text[]))                  AS json_array
                                          FROM invasivesbc.activity_incoming_data
                                          WHERE ((activity_incoming_data.activity_incoming_data_id IN
                                                  (SELECT activity_current.incoming_data_id
                                                   FROM invasivesbc.activity_current)) AND
                                                 ((activity_incoming_data.activity_payload #>>
                                                   '{form_data,activity_subtype_data,chemical_treatment_details,tank_mix}'::text[]) =
                                                  'true'::text) AND ((activity_incoming_data.activity_subtype)::text =
                                                                     'Activity_Treatment_ChemicalPlantTerrestrial'::text) AND
                                                 ((activity_incoming_data.form_status)::text = 'Submitted'::text) AND
                                                 (activity_incoming_data.deleted_timestamp IS NULL) AND
                                                 ((activity_incoming_data.activity_subtype)::text =
                                                  'Activity_Treatment_ChemicalPlantTerrestrial'::text))),
             invasive_plant_array AS (SELECT activity_incoming_data.activity_incoming_data_id,
                                             (activity_incoming_data.activity_payload #>>
                                              '{form_data,activity_subtype_data,chemical_treatment_details,tank_mix}'::text[])                              AS tank_mix,
                                             jsonb_array_elements((activity_incoming_data.activity_payload #>
                                                                   '{form_data,activity_subtype_data,chemical_treatment_details,invasive_plants}'::text[])) AS json_array
                                      FROM invasivesbc.activity_incoming_data
                                      WHERE ((activity_incoming_data.activity_incoming_data_id IN
                                              (SELECT activity_current.incoming_data_id
                                               FROM invasivesbc.activity_current)) AND
                                             ((activity_incoming_data.activity_subtype)::text =
                                              'Activity_Treatment_ChemicalPlantTerrestrial'::text) AND
                                             ((activity_incoming_data.form_status)::text = 'Submitted'::text) AND
                                             (activity_incoming_data.deleted_timestamp IS NULL))),
             calculation_json AS (SELECT activity_incoming_data.activity_incoming_data_id,
                                         activity_incoming_data.activity_subtype,
                                         (activity_incoming_data.activity_payload #>
                                          '{form_data,activity_subtype_data,chemical_treatment_details,calculation_results}'::text[]) AS json_data
                                  FROM invasivesbc.activity_incoming_data
                                  WHERE ((activity_incoming_data.activity_incoming_data_id IN
                                          (SELECT activity_current.incoming_data_id
                                           FROM invasivesbc.activity_current)) AND
                                         ((activity_incoming_data.activity_subtype)::text =
                                          'Activity_Treatment_ChemicalPlantTerrestrial'::text) AND
                                         ((activity_incoming_data.form_status)::text = 'Submitted'::text) AND
                                         (activity_incoming_data.deleted_timestamp IS NULL) AND
                                         (jsonb_array_length((activity_incoming_data.activity_payload #>
                                                              '{form_data,activity_subtype_data,chemical_treatment_details,invasive_plants}'::text[])) =
                                          1) AND (jsonb_array_length((activity_incoming_data.activity_payload #>
                                                                      '{form_data,activity_subtype_data,chemical_treatment_details,herbicides}'::text[])) =
                                                  1))),
             calculation_array AS (SELECT activity_incoming_data.activity_incoming_data_id,
                                          activity_incoming_data.activity_subtype,
                                          (activity_incoming_data.activity_payload #>>
                                           '{form_data,activity_subtype_data,chemical_treatment_details,tank_mix}'::text[])                                                  AS tank_mix,
                                          (activity_incoming_data.activity_payload #>
                                           '{form_data,activity_subtype_data,chemical_treatment_details,calculation_results}'::text[])                                       AS json_data,
                                          jsonb_array_elements((activity_incoming_data.activity_payload #>
                                                                '{form_data,activity_subtype_data,chemical_treatment_details,calculation_results,invasive_plants}'::text[])) AS json_array
                                   FROM invasivesbc.activity_incoming_data
                                   WHERE ((activity_incoming_data.activity_incoming_data_id IN
                                           (SELECT activity_current.incoming_data_id
                                            FROM invasivesbc.activity_current)) AND
                                          ((activity_incoming_data.activity_subtype)::text =
                                           'Activity_Treatment_ChemicalPlantTerrestrial'::text) AND
                                          ((activity_incoming_data.form_status)::text = 'Submitted'::text) AND
                                          (activity_incoming_data.deleted_timestamp IS NULL))),
             calculation_herbicide_array AS (SELECT c_1.activity_incoming_data_id,
                                                    c_1.activity_subtype,
                                                    c_1.tank_mix,
                                                    jsonb_array_elements((c_1.json_array #> '{herbicides}'::text[])) AS json_array
                                             FROM calculation_array c_1),
             tank_mix_herbicide_select AS (SELECT t.activity_incoming_data_id,
                                                  (t.json_array #>> '{herbicide_code}'::text[])           AS herbicide_code,
                                                  liquid_herbicide_codes.code_description                 AS liquid_herbicide,
                                                  granular_herbicide_codes.code_description               AS granular_herbicide,
                                                  (t.json_array #>> '{herbicide_type_code}'::text[])      AS herbicide_type_code,
                                                  herbicide_type_codes.code_description                   AS herbicide_type,
                                                  (t.json_array #>> '{product_application_rate}'::text[]) AS product_application_rate,
                                                  (t.json_data #>> '{amount_of_mix}'::text[])             AS amount_of_mix,
                                                  (t.json_data #>> '{calculation_type}'::text[])          AS calculation_type_code,
                                                  calculation_type_codes.code_description                 AS calculation_type,
                                                  (t.json_data #>> '{delivery_rate_of_mix}'::text[])      AS delivery_rate_of_mix,
                                                  t.herbicide_percent,
                                                  (t.json_array #>> '{index}'::text[])                    AS tank_mix_herbicide_index,
                                                  concat(t.activity_incoming_data_id, '-index-',
                                                         (t.json_array #>> '{index}'::text[]))            AS tank_mix_herbicide_id
                                           FROM ((((((((tank_mix_herbicide_array t
                                               LEFT JOIN invasivesbc.code_header liquid_herbicide_code_header ON ((
                                                   ((liquid_herbicide_code_header.code_header_title)::text =
                                                    'liquid_herbicide_code'::text) AND
                                                   (liquid_herbicide_code_header.valid_to IS NULL))))
                                               LEFT JOIN invasivesbc.code liquid_herbicide_codes ON ((
                                                   (liquid_herbicide_codes.code_header_id =
                                                    liquid_herbicide_code_header.code_header_id) AND
                                                   ((t.json_array #>> '{herbicide_code}'::text[]) =
                                                    (liquid_herbicide_codes.code_name)::text))))
                                               LEFT JOIN invasivesbc.code_header granular_herbicide_code_header ON ((
                                                   ((granular_herbicide_code_header.code_header_title)::text =
                                                    'granular_herbicide_code'::text) AND
                                                   (granular_herbicide_code_header.valid_to IS NULL))))
                                               LEFT JOIN invasivesbc.code granular_herbicide_codes ON ((
                                                   (granular_herbicide_codes.code_header_id =
                                                    granular_herbicide_code_header.code_header_id) AND
                                                   ((t.json_array #>> '{herbicide_code}'::text[]) =
                                                    (granular_herbicide_codes.code_name)::text))))
                                               LEFT JOIN invasivesbc.code_header calculation_type_code_header ON ((
                                                   ((calculation_type_code_header.code_header_title)::text =
                                                    'calculation_type_code'::text) AND
                                                   (calculation_type_code_header.valid_to IS NULL))))
                                               LEFT JOIN invasivesbc.code calculation_type_codes ON ((
                                                   (calculation_type_codes.code_header_id =
                                                    calculation_type_code_header.code_header_id) AND
                                                   ((t.json_data #>> '{calculation_type}'::text[]) =
                                                    (calculation_type_codes.code_name)::text))))
                                               LEFT JOIN invasivesbc.code_header herbicide_type_code_header ON ((
                                                   ((herbicide_type_code_header.code_header_title)::text =
                                                    'herbicide_type_code'::text) AND
                                                   (herbicide_type_code_header.valid_to IS NULL))))
                                               LEFT JOIN invasivesbc.code herbicide_type_codes ON ((
                                                   (herbicide_type_codes.code_header_id =
                                                    herbicide_type_code_header.code_header_id) AND
                                                   ((t.json_array #>> '{herbicide_type_code}'::text[]) =
                                                    (herbicide_type_codes.code_name)::text))))),
             herbicide_select AS (SELECT t.activity_incoming_data_id,
                                         (t.json_array #>> '{herbicide_code}'::text[])           AS herbicide_code,
                                         liquid_herbicide_codes.code_description                 AS liquid_herbicide,
                                         granular_herbicide_codes.code_description               AS granular_herbicide,
                                         (t.json_array #>> '{herbicide_type_code}'::text[])      AS herbicide_type_code,
                                         herbicide_type_codes.code_description                   AS herbicide_type,
                                         (t.json_array #>> '{product_application_rate}'::text[]) AS product_application_rate,
                                         (t.json_array #>> '{amount_of_mix}'::text[])            AS amount_of_mix,
                                         (t.json_array #>> '{dilution}'::text[])                 AS dilution,
                                         (t.json_array #>> '{area_treated_sqm}'::text[])         AS area_treated_sqm,
                                         (c_1.json_data #>> '{dilution}'::text[])                AS dilution2,
                                         (c_1.json_data #>> '{area_treated_sqm}'::text[])        AS area_treated_sqm2,
                                         (c_1.json_data #>> '{percent_area_covered}'::text[])    AS percent_area_covered2,
                                         (c_1.json_data #>> '{area_treated_hectares}'::text[])   AS area_treated_hectares2,
                                         (c_1.json_data #>>
                                          '{amount_of_undiluted_herbicide_used_liters}'::text[]) AS amount_of_undiluted_herbicide_used_liters2,
                                         (t.json_array #>> '{calculation_type}'::text[])         AS calculation_type_code,
                                         calculation_type_codes.code_description                 AS calculation_type,
                                         (t.json_array #>> '{delivery_rate_of_mix}'::text[])     AS delivery_rate_of_mix,
                                         concat(t.activity_incoming_data_id, '-index-',
                                                (t.json_array #>> '{index}'::text[]))            AS herbicide_id
                                  FROM (((((((((herbicide_array t
                                      LEFT JOIN calculation_json c_1
                                                ON ((c_1.activity_incoming_data_id = t.activity_incoming_data_id)))
                                      LEFT JOIN invasivesbc.code_header liquid_herbicide_code_header ON ((
                                          ((liquid_herbicide_code_header.code_header_title)::text =
                                           'liquid_herbicide_code'::text) AND
                                          (liquid_herbicide_code_header.valid_to IS NULL))))
                                      LEFT JOIN invasivesbc.code liquid_herbicide_codes ON ((
                                          (liquid_herbicide_codes.code_header_id =
                                           liquid_herbicide_code_header.code_header_id) AND
                                          ((t.json_array #>> '{herbicide_code}'::text[]) =
                                           (liquid_herbicide_codes.code_name)::text))))
                                      LEFT JOIN invasivesbc.code_header granular_herbicide_code_header ON ((
                                          ((granular_herbicide_code_header.code_header_title)::text =
                                           'granular_herbicide_code'::text) AND
                                          (granular_herbicide_code_header.valid_to IS NULL))))
                                      LEFT JOIN invasivesbc.code granular_herbicide_codes ON ((
                                          (granular_herbicide_codes.code_header_id =
                                           granular_herbicide_code_header.code_header_id) AND
                                          ((t.json_array #>> '{herbicide_code}'::text[]) =
                                           (granular_herbicide_codes.code_name)::text))))
                                      LEFT JOIN invasivesbc.code_header calculation_type_code_header ON ((
                                          ((calculation_type_code_header.code_header_title)::text =
                                           'calculation_type_code'::text) AND
                                          (calculation_type_code_header.valid_to IS NULL))))
                                      LEFT JOIN invasivesbc.code calculation_type_codes ON ((
                                          (calculation_type_codes.code_header_id =
                                           calculation_type_code_header.code_header_id) AND
                                          ((t.json_array #>> '{calculation_type}'::text[]) =
                                           (calculation_type_codes.code_name)::text))))
                                      LEFT JOIN invasivesbc.code_header herbicide_type_code_header ON ((
                                          ((herbicide_type_code_header.code_header_title)::text =
                                           'herbicide_type_code'::text) AND
                                          (herbicide_type_code_header.valid_to IS NULL))))
                                      LEFT JOIN invasivesbc.code herbicide_type_codes ON ((
                                          (herbicide_type_codes.code_header_id =
                                           herbicide_type_code_header.code_header_id) AND
                                          ((t.json_array #>> '{herbicide_type_code}'::text[]) =
                                           (herbicide_type_codes.code_name)::text))))),
             calculation_array_select AS (SELECT i.activity_incoming_data_id,
                                                 (i.json_data #>> '{dilution}'::text[])                                   AS dilution,
                                                 (i.json_data #>> '{area_treated_hectares}'::text[])                      AS area_treated_hectares,
                                                 (i.json_array #>> '{area_treated_hectares}'::text[])                     AS area_treated_hectares2,
                                                 (i.json_array #>> '{area_treated_ha}'::text[])                           AS area_treated_ha,
                                                 (i.json_array #>> '{area_treated_sqm}'::text[])                          AS area_treated_sqm,
                                                 (i.json_array #>> '{amount_of_mix_used}'::text[])                        AS amount_of_mix_used,
                                                 (i.json_array #>> '{percent_area_covered}'::text[])                      AS percent_area_covered,
                                                 (i.json_array #>> '{percentage_area_covered}'::text[])                   AS percentage_area_covered,
                                                 (i.json_array #>> '{amount_of_undiluted_herbicide_used_liters}'::text[]) AS amount_of_undiluted_herbicide_used_liters,
                                                 concat(i.activity_incoming_data_id, '-index-',
                                                        (i.json_array #>> '{index}'::text[]))                             AS calculation_invasive_plant_id
                                          FROM calculation_array i),
             calculation_herbicide_array_select AS (SELECT h.activity_incoming_data_id,
                                                           (h.json_array #>> '{herbIndex}'::text[])                                 AS herbindex,
                                                           (h.json_array #>> '{plantIndex}'::text[])                                AS plantindex,
                                                           (h.json_array #>> '{dilution}'::text[])                                  AS dilution,
                                                           (h.json_array #>> '{amount_of_undiluted_herbicide_used_liters}'::text[]) AS amount_of_undiluted_herbicide_used_liters,
                                                           concat(h.activity_incoming_data_id, '-index-',
                                                                  (h.json_array #>> '{plantIndex}'::text[]))                        AS calculation_herbicide_id
                                                    FROM calculation_herbicide_array h),
             invasive_plant_array_select AS (SELECT i.activity_incoming_data_id,
                                                    (i.json_array #>> '{invasive_plant_code}'::text[])  AS invasive_plant_code,
                                                    invasive_plant_codes.code_description               AS invasive_plant,
                                                    (i.json_array #>> '{percent_area_covered}'::text[]) AS percent_area_covered,
                                                    (i.json_array #>> '{index}'::text[])                AS invasive_plant_index,
                                                    concat(i.activity_incoming_data_id, '-index-',
                                                           (i.json_array #>> '{index}'::text[]))        AS invasive_plant_id
                                             FROM ((invasive_plant_array i
                                                 LEFT JOIN invasivesbc.code_header invasive_plant_code_header ON ((
                                                     ((invasive_plant_code_header.code_header_title)::text =
                                                      'invasive_plant_code'::text) AND
                                                     (invasive_plant_code_header.valid_to IS NULL))))
                                                 LEFT JOIN invasivesbc.code invasive_plant_codes ON ((
                                                     (invasive_plant_codes.code_header_id =
                                                      invasive_plant_code_header.code_header_id) AND
                                                     ((i.json_array #>> '{invasive_plant_code}'::text[]) =
                                                      (invasive_plant_codes.code_name)::text))))),
             not_tank_mix_plant_herbicide_join AS (SELECT i.activity_incoming_data_id,
                                                          i.invasive_plant,
                                                          i.percent_area_covered                                 AS ip_percent_area_covered,
                                                          i.invasive_plant_id,
                                                          concat(h.liquid_herbicide, h.granular_herbicide)       AS herbicide,
                                                          h.herbicide_type,
                                                          h.product_application_rate,
                                                          h.amount_of_mix,
                                                          h.calculation_type,
                                                          h.delivery_rate_of_mix,
                                                          h.herbicide_id,
                                                          COALESCE(c_1.area_treated_sqm, h.area_treated_sqm,
                                                                   h.area_treated_sqm2)                          AS area_treated_sqm_calculated,
                                                          COALESCE(h.area_treated_sqm, h.area_treated_sqm2)      AS area_treated_sqm_user,
                                                          c_1.amount_of_mix_used,
                                                          COALESCE(c_1.area_treated_hectares,
                                                                   c_1.area_treated_hectares2,
                                                                   h.area_treated_hectares2)                     AS area_treated_hectares,
                                                          COALESCE(c_1.percentage_area_covered,
                                                                   c_1.percent_area_covered,
                                                                   h.percent_area_covered2)                      AS percentage_area_covered,
                                                          COALESCE(c_1.amount_of_undiluted_herbicide_used_liters,
                                                                   h.amount_of_undiluted_herbicide_used_liters2) AS amount_of_undiluted_herbicide_used_liters,
                                                          COALESCE(h.dilution, h.dilution2, c_1.dilution)        AS dilution
                                                   FROM ((invasive_plant_array_select i
                                                       JOIN herbicide_select h
                                                          ON ((h.activity_incoming_data_id = i.activity_incoming_data_id)))
                                                       LEFT JOIN calculation_array_select c_1
                                                         ON ((c_1.calculation_invasive_plant_id = i.invasive_plant_id)))),
             tank_mix_plant_results_select AS (SELECT h.activity_incoming_data_id,
                                                      h.calculation_herbicide_id,
                                                      concat(h.activity_incoming_data_id, '-index-', h.herbindex,
                                                             h.plantindex) AS results_herbicide_plant_index,
                                                      h.dilution,
                                                      h.amount_of_undiluted_herbicide_used_liters,
                                                      c_1.calculation_invasive_plant_id,
                                                      c_1.area_treated_ha,
                                                      c_1.area_treated_sqm,
                                                      c_1.amount_of_mix_used,
                                                      c_1.percent_area_covered
                                               FROM (calculation_herbicide_array_select h
                                                   JOIN calculation_array_select c_1
                                                     ON ((c_1.calculation_invasive_plant_id = h.calculation_herbicide_id)))),
             invasive_plant_herbicide AS (SELECT i.activity_incoming_data_id,
                                                 concat(i.activity_incoming_data_id, '-index-',
                                                        h.tank_mix_herbicide_index,
                                                        i.invasive_plant_index)                   AS herbicide_plant_index,
                                                 i.invasive_plant,
                                                 i.percent_area_covered,
                                                 i.invasive_plant_id,
                                                 h.tank_mix_herbicide_index,
                                                 concat(h.liquid_herbicide, h.granular_herbicide) AS herbicide,
                                                 h.herbicide_type,
                                                 h.product_application_rate,
                                                 h.amount_of_mix,
                                                 h.calculation_type,
                                                 h.delivery_rate_of_mix,
                                                 h.herbicide_percent,
                                                 h.tank_mix_herbicide_id
                                          FROM (invasive_plant_array_select i
                                              JOIN tank_mix_herbicide_select h
                                                ON ((h.activity_incoming_data_id = i.activity_incoming_data_id)))),
             tank_mix_results_select AS (SELECT i.activity_incoming_data_id,
                                                i.invasive_plant,
                                                i.percent_area_covered AS ip_percent_area_covered,
                                                i.invasive_plant_id,
                                                i.herbicide,
                                                i.herbicide_type,
                                                i.product_application_rate,
                                                i.amount_of_mix,
                                                i.calculation_type,
                                                i.delivery_rate_of_mix,
                                                i.herbicide_percent,
                                                i.tank_mix_herbicide_id,
                                                c_1.calculation_herbicide_id,
                                                c_1.dilution,
                                                c_1.amount_of_undiluted_herbicide_used_liters,
                                                c_1.calculation_invasive_plant_id,
                                                c_1.area_treated_ha,
                                                c_1.area_treated_sqm,
                                                c_1.amount_of_mix_used,
                                                c_1.percent_area_covered
                                         FROM (invasive_plant_herbicide i
                                             LEFT JOIN tank_mix_plant_results_select c_1
                                               ON ((c_1.results_herbicide_plant_index = i.herbicide_plant_index)))),
             jurisdiction_array AS (SELECT activity_incoming_data.activity_incoming_data_id,
                                           activity_incoming_data.activity_subtype,
                                           jsonb_array_elements((activity_incoming_data.activity_payload #>
                                                                 '{form_data,activity_data,jurisdictions}'::text[])) AS jurisdictions_array
                                    FROM invasivesbc.activity_incoming_data
                                    WHERE ((activity_incoming_data.activity_incoming_data_id IN
                                            (SELECT activity_current.incoming_data_id
                                             FROM invasivesbc.activity_current)) AND
                                           ((activity_incoming_data.activity_subtype)::text =
                                            'Activity_Treatment_ChemicalPlantTerrestrial'::text) AND
                                           ((activity_incoming_data.form_status)::text = 'Submitted'::text) AND
                                           (activity_incoming_data.deleted_timestamp IS NULL))),
             jurisdiction_array_select AS (SELECT j_1.activity_incoming_data_id,
                                                  (j_1.jurisdictions_array #>> '{jurisdiction_code}'::text[]) AS jurisdiction_code,
                                                  jurisdiction_codes.code_description                         AS jurisdiction,
                                                  (j_1.jurisdictions_array #>> '{percent_covered}'::text[])   AS percent_covered
                                           FROM ((jurisdiction_array j_1
                                               LEFT JOIN invasivesbc.code_header jurisdiction_code_header ON ((
                                                   ((jurisdiction_code_header.code_header_title)::text =
                                                    'jurisdiction_code'::text) AND
                                                   (jurisdiction_code_header.valid_to IS NULL))))
                                               LEFT JOIN invasivesbc.code jurisdiction_codes ON ((
                                                   (jurisdiction_codes.code_header_id =
                                                    jurisdiction_code_header.code_header_id) AND
                                                   ((j_1.jurisdictions_array #>> '{jurisdiction_code}'::text[]) =
                                                    (jurisdiction_codes.code_name)::text))))),
             form_data AS (SELECT activity_incoming_data.activity_incoming_data_id,
                                  activity_incoming_data.activity_subtype,
                                  activity_incoming_data.form_status,
                                  (activity_incoming_data.activity_payload #>
                                   '{form_data,activity_subtype_data}'::text[]) AS form_data
                           FROM invasivesbc.activity_incoming_data
                           WHERE ((activity_incoming_data.activity_incoming_data_id IN
                                   (SELECT activity_current.incoming_data_id
                                    FROM invasivesbc.activity_current)) AND
                                  ((activity_incoming_data.activity_subtype)::text =
                                   'Activity_Treatment_ChemicalPlantTerrestrial'::text) AND
                                  ((activity_incoming_data.form_status)::text = 'Submitted'::text) AND
                                  (activity_incoming_data.deleted_timestamp IS NULL))),
             json_select AS (SELECT f.activity_incoming_data_id,
                                    (f.form_data #>>
                                     '{Treatment_ChemicalPlant_Information,pesticide_employer_code}'::text[])  AS service_license_company,
                                    service_license_codes.code_description                                     AS service_license,
                                    (f.form_data #>>
                                     '{Treatment_ChemicalPlant_Information,pesticide_use_permit_PUP}'::text[]) AS pesticide_use_permit,
                                    (f.form_data #>>
                                     '{Treatment_ChemicalPlant_Information,pest_management_plan}'::text[])     AS pest_management_plan,
                                    (f.form_data #>>
                                     '{Treatment_ChemicalPlant_Information,pmp_not_in_dropdown}'::text[])      AS pmp_not_in_dropdown,
                                    (f.form_data #>>
                                     '{Treatment_ChemicalPlant_Information,temperature}'::text[])              AS temperature,
                                    (f.form_data #>>
                                     '{Treatment_ChemicalPlant_Information,wind_speed}'::text[])               AS wind_speed,
                                    (f.form_data #>>
                                     '{Treatment_ChemicalPlant_Information,wind_direction_code}'::text[])      AS wind_direction,
                                    (f.form_data #>>
                                     '{Treatment_ChemicalPlant_Information,humidity}'::text[])                 AS humidity,
                                    (f.form_data #>>
                                     '{Treatment_ChemicalPlant_Information,signage_on_site}'::text[])          AS treatment_notice_signs,
                                    (f.form_data #>>
                                     '{Treatment_ChemicalPlant_Information,application_start_time}'::text[])   AS application_start_time,
                                    h.invasive_plant,
                                    COALESCE(h.ip_percent_area_covered, '100'::text)                           AS ip_percent_area_covered,
                                    j_1.jurisdiction,
                                    j_1.percent_covered,
                                    (f.form_data #>> '{chemical_treatment_details,tank_mix}'::text[])          AS tank_mix,
                                    (f.form_data #>>
                                     '{chemical_treatment_details,chemical_application_method}'::text[])       AS chemical_application_method_code,
                                    chemical_method_codes.code_description                                     AS chemical_application_method,
                                    h.herbicide_type,
                                    h.herbicide,
                                    h.calculation_type,
                                    COALESCE(h.amount_of_mix_used, h.amount_of_mix)                            AS amount_of_mix,
                                    h.delivery_rate_of_mix,
                                    h.product_application_rate,
                                    h.dilution,
                                    h.amount_of_undiluted_herbicide_used_liters,
                                    h.area_treated_hectares,
                                    COALESCE(h.area_treated_sqm_calculated, h.area_treated_sqm_user)           AS area_treated_sqm_user,
                                    h.percentage_area_covered
                             FROM ((((((form_data f
                                 JOIN not_tank_mix_plant_herbicide_join h
                                        ON ((h.activity_incoming_data_id = f.activity_incoming_data_id)))
                                 LEFT JOIN jurisdiction_array_select j_1
                                       ON ((j_1.activity_incoming_data_id = f.activity_incoming_data_id)))
                                 LEFT JOIN invasivesbc.code_header chemical_method_code_header ON ((
                                     ((chemical_method_code_header.code_header_title)::text =
                                      'chemical_method_code'::text) AND
                                     (chemical_method_code_header.valid_to IS NULL))))
                                 LEFT JOIN invasivesbc.code chemical_method_codes ON ((
                                     (chemical_method_codes.code_header_id =
                                      chemical_method_code_header.code_header_id) AND
                                     ((f.form_data #>>
                                       '{chemical_treatment_details,chemical_application_method}'::text[]) =
                                      (chemical_method_codes.code_name)::text))))
                                 LEFT JOIN invasivesbc.code_header service_license_code_header ON ((
                                     ((service_license_code_header.code_header_title)::text =
                                      'service_license_code'::text) AND
                                     (service_license_code_header.valid_to IS NULL))))
                                 LEFT JOIN invasivesbc.code service_license_codes
                                   ON (((service_license_codes.code_header_id =
                                         service_license_code_header.code_header_id) AND
                                        ((f.form_data #>>
                                          '{Treatment_ChemicalPlant_Information,pesticide_employer_code}'::text[]) =
                                         (service_license_codes.code_name)::text))))
                             WHERE ((f.form_data #>> '{chemical_treatment_details,tank_mix}'::text[]) = 'false'::text)),
             tank_mix_json_select AS (SELECT f.activity_incoming_data_id,
                                             (f.form_data #>>
                                              '{Treatment_ChemicalPlant_Information,pesticide_employer_code}'::text[])  AS service_license_company,
                                             service_license_codes.code_description                                     AS service_license,
                                             (f.form_data #>>
                                              '{Treatment_ChemicalPlant_Information,pesticide_use_permit_PUP}'::text[]) AS pesticide_use_permit,
                                             (f.form_data #>>
                                              '{Treatment_ChemicalPlant_Information,pest_management_plan}'::text[])     AS pest_management_plan,
                                             (f.form_data #>>
                                              '{Treatment_ChemicalPlant_Information,temperature}'::text[])              AS temperature,
                                             (f.form_data #>>
                                              '{Treatment_ChemicalPlant_Information,wind_speed}'::text[])               AS wind_speed,
                                             (f.form_data #>>
                                              '{Treatment_ChemicalPlant_Information,wind_direction_code}'::text[])      AS wind_direction,
                                             (f.form_data #>>
                                              '{Treatment_ChemicalPlant_Information,humidity}'::text[])                 AS humidity,
                                             (f.form_data #>>
                                              '{Treatment_ChemicalPlant_Information,signage_on_site}'::text[])          AS treatment_notice_signs,
                                             (f.form_data #>>
                                              '{Treatment_ChemicalPlant_Information,application_start_time}'::text[])   AS application_start_time,
                                             tm_1.invasive_plant,
                                             COALESCE(tm_1.ip_percent_area_covered, '100'::text)                        AS ip_percent_area_covered,
                                             j_1.jurisdiction,
                                             j_1.percent_covered,
                                             (f.form_data #>> '{chemical_treatment_details,tank_mix}'::text[])          AS tank_mix,
                                             (f.form_data #>>
                                              '{chemical_treatment_details,chemical_application_method}'::text[])       AS chemical_application_method_code,
                                             chemical_method_codes.code_description                                     AS chemical_application_method,
                                             tm_1.herbicide_type,
                                             tm_1.herbicide,
                                             tm_1.calculation_type,
                                             tm_1.amount_of_mix,
                                             tm_1.delivery_rate_of_mix,
                                             tm_1.product_application_rate,
                                             tm_1.dilution,
                                             tm_1.amount_of_undiluted_herbicide_used_liters,
                                             (((tm_1.area_treated_ha)::numeric * tm_1.herbicide_percent))::text         AS area_treated_hectares,
                                             (((tm_1.area_treated_sqm)::numeric * tm_1.herbicide_percent))::text        AS area_treated_sqm,
                                             (((tm_1.amount_of_mix_used)::numeric * tm_1.herbicide_percent))::text      AS amount_of_mix_used,
                                             (((tm_1.percent_area_covered)::numeric * tm_1.herbicide_percent))::text    AS percentage_area_covered
                                      FROM ((((((form_data f
                                          LEFT JOIN tank_mix_results_select tm_1
                                                 ON ((tm_1.activity_incoming_data_id = f.activity_incoming_data_id)))
                                          LEFT JOIN jurisdiction_array_select j_1
                                                ON ((j_1.activity_incoming_data_id = f.activity_incoming_data_id)))
                                          LEFT JOIN invasivesbc.code_header chemical_method_code_header ON ((
                                              ((chemical_method_code_header.code_header_title)::text =
                                               'chemical_method_code'::text) AND
                                              (chemical_method_code_header.valid_to IS NULL))))
                                          LEFT JOIN invasivesbc.code chemical_method_codes ON ((
                                              (chemical_method_codes.code_header_id =
                                               chemical_method_code_header.code_header_id) AND ((f.form_data #>>
                                                                                                 '{chemical_treatment_details,chemical_application_method}'::text[]) =
                                                                                                (chemical_method_codes.code_name)::text))))
                                          LEFT JOIN invasivesbc.code_header service_license_code_header ON ((
                                              ((service_license_code_header.code_header_title)::text =
                                               'service_license_code'::text) AND
                                              (service_license_code_header.valid_to IS NULL))))
                                          LEFT JOIN invasivesbc.code service_license_codes ON ((
                                              (service_license_codes.code_header_id =
                                               service_license_code_header.code_header_id) AND ((f.form_data #>>
                                                                                                 '{Treatment_ChemicalPlant_Information,pesticide_employer_code}'::text[]) =
                                                                                                (service_license_codes.code_name)::text))))
                                      WHERE ((f.form_data #>> '{chemical_treatment_details,tank_mix}'::text[]) =
                                             'true'::text))
        SELECT c.activity_incoming_data_id,
               c.activity_id,
               c.short_id,
               c.project_code,
               c.activity_date_time,
               c.reported_area_sqm,
               c.latitude,
               c.longitude,
               c.utm_zone,
               c.utm_easting,
               c.utm_northing,
               c.employer_description                                             AS employer,
               c.funding_agency,
               concat(j.jurisdiction, tm.jurisdiction, ' ', j.percent_covered, tm.percent_covered,
                      '%')                                                        AS jurisdiction,
               c.access_description,
               c.location_description,
               c.comment,
               c.treatment_person,
               c.well_proximity,
               j.service_license,
               concat(tm.pesticide_use_permit, j.pesticide_use_permit)            AS pesticide_use_permit,
               concat(tm.pest_management_plan, j.pest_management_plan)            AS pest_management_plan,
               j.pmp_not_in_dropdown,
               concat(tm.temperature, j.temperature)                              AS temperature_celsius,
               concat(tm.wind_speed, j.wind_speed)                                AS wind_speed_km,
               concat(tm.wind_direction, j.wind_direction)                        AS wind_direction,
               concat(tm.humidity, j.humidity)                                    AS humidity_percent,
               concat(tm.treatment_notice_signs, j.treatment_notice_signs)        AS treatment_notice_signs,
               to_char(
                       to_timestamp(concat(tm.application_start_time, j.application_start_time),
                                    'YYYY-MM-DD"T"HH24:MI:SS'::text),
                       'YYYY-MM-DD HH24:MI:SS'::text)                             AS application_start_time,
               concat(tm.invasive_plant, j.invasive_plant)                        AS invasive_plant,
               concat(tm.ip_percent_area_covered, j.ip_percent_area_covered, '%') AS invasive_plant_percent,
               CASE
                   WHEN (concat(tm.tank_mix, j.tank_mix) = 'false'::text) THEN 'No'::text
                   ELSE 'Yes'::text
                   END                                                            AS tank_mix,
               concat(tm.chemical_application_method,
                      j.chemical_application_method)                              AS chemical_application_method,
               concat(tm.herbicide_type, j.herbicide_type)                        AS herbicide_type,
               concat(tm.herbicide, j.herbicide)                                  AS herbicide,
               concat(tm.calculation_type, j.calculation_type)                    AS calculation_type,
               concat(tm.delivery_rate_of_mix, j.delivery_rate_of_mix)            AS delivery_rate_of_mix,
               concat(tm.product_application_rate, j.product_application_rate)    AS product_application_rate,
               concat(tm.dilution, j.dilution)                                    AS dilution,
               round(((((concat(tm.percent_covered, j.percent_covered))::double precision / (100)::double precision) *
                       (concat(tm.amount_of_undiluted_herbicide_used_liters,
                               j.amount_of_undiluted_herbicide_used_liters))::double precision))::numeric,
                     4)                                                           AS amount_of_undiluted_herbicide_used_liters,
               round(((((concat(tm.percent_covered, j.percent_covered))::double precision / (100)::double precision) *
                       (concat(tm.area_treated_hectares, j.area_treated_hectares))::double precision))::numeric,
                     4)                                                           AS area_treated_hectares,
               round(((((concat(tm.percent_covered, j.percent_covered))::double precision / (100)::double precision) *
                       (COALESCE(tm.area_treated_sqm, j.area_treated_sqm_user))::double precision))::numeric,
                     4)                                                           AS area_treated_sqm,
               round(((((concat(tm.percent_covered, j.percent_covered))::double precision / (100)::double precision) *
                       (concat(tm.amount_of_mix_used, j.amount_of_mix))::double precision))::numeric,
                     4)                                                           AS amount_of_mix_used,
               round(((((concat(tm.percent_covered, j.percent_covered))::double precision / (100)::double precision) *
                       (concat(tm.percentage_area_covered, j.percentage_area_covered))::double precision))::numeric,
                     4)                                                           AS percent_area_covered,
               c.elevation,
               c.biogeoclimatic_zones,
               c.regional_invasive_species_organization_areas,
               c.invasive_plant_management_areas,
               c.ownership,
               c.regional_districts,
               c.flnro_districts,
               c.moti_districts,
               c.photo,
               c.created_timestamp,
               c.received_timestamp,
               c.geom,
               c.geog
        FROM ((common_fields c
            LEFT JOIN json_select j ON ((j.activity_incoming_data_id = c.activity_incoming_data_id)))
            LEFT JOIN tank_mix_json_select tm ON ((tm.activity_incoming_data_id = c.activity_incoming_data_id)));
        CREATE VIEW invasivesbc.treatment_mechanical_terrestrial_plant_summary AS
        WITH array_elements AS (SELECT activity_incoming_data.activity_incoming_data_id,
                                       activity_incoming_data.activity_subtype,
                                       jurisdictions_array.value AS jurisdictions_array,
                                       project_code_array.value  AS project_code_array,
                                       person_array.value        AS person_array,
                                       funding_list.f1           AS funding_list
                                FROM ((((invasivesbc.activity_incoming_data
                                    LEFT JOIN LATERAL jsonb_array_elements((activity_incoming_data.activity_payload #>
                                                                            '{form_data,activity_data,jurisdictions}'::text[])) jurisdictions_array(value)
                                         ON (true))
                                    LEFT JOIN LATERAL jsonb_array_elements((activity_incoming_data.activity_payload #>
                                                                            '{form_data,activity_data,project_code}'::text[])) project_code_array(value)
                                        ON (true))
                                    LEFT JOIN LATERAL jsonb_array_elements((activity_incoming_data.activity_payload #>
                                                                            '{form_data,activity_type_data,activity_persons}'::text[])) person_array(value)
                                       ON (true))
                                    LEFT JOIN LATERAL public.convert_string_list_to_array_elements((
                                            activity_incoming_data.activity_payload #>>
                                            '{form_data,activity_data,invasive_species_agency_code}'::text[])) funding_list(f1)
                                      ON (true))
                                WHERE ((activity_incoming_data.activity_incoming_data_id IN
                                        (SELECT activity_current.incoming_data_id
                                         FROM invasivesbc.activity_current)) AND
                                       ((activity_incoming_data.form_status)::text = 'Submitted'::text) AND
                                       (activity_incoming_data.deleted_timestamp IS NULL) AND
                                       ((activity_incoming_data.activity_subtype)::text =
                                        'Activity_Treatment_MechanicalPlantTerrestrial'::text))),
             array_aggregate AS (SELECT a.activity_incoming_data_id,
                                        string_agg(DISTINCT (a.project_code_array #>> '{description}'::text[]),
                                                   ', '::text) AS project,
                                        string_agg(DISTINCT (a.person_array #>> '{person_name}'::text[]),
                                                   ', '::text) AS person_name,
                                        string_agg(DISTINCT
                                                   CASE
                                                       WHEN ((a.person_array #>> '{applicator_license}'::text[]) IS NOT NULL)
                                                           THEN concat((a.person_array #>> '{person_name}'::text[]),
                                                                       ', ',
                                                                       (a.person_array #>> '{applicator_license}'::text[]))
                                                       ELSE (a.person_array #>> '{person_name}'::text[])
                                                       END,
                                                   ', '::text) AS treatment_person_name,
                                        string_agg(DISTINCT concat(jurisdiction_codes.code_description, ' ',
                                                                   ((a.jurisdictions_array #>> '{percent_covered}'::text[]) || '%'::text)),
                                                   ', '::text) AS jurisdiction,
                                        string_agg(DISTINCT (invasive_species_agency_codes.code_description)::text,
                                                   ', '::text) AS funding_agency
                                 FROM ((((array_elements a
                                     LEFT JOIN invasivesbc.code_header jurisdiction_code_header ON ((
                                         ((jurisdiction_code_header.code_header_title)::text =
                                          'jurisdiction_code'::text) AND
                                         (jurisdiction_code_header.valid_to IS NULL))))
                                     LEFT JOIN invasivesbc.code jurisdiction_codes
                                         ON (((jurisdiction_codes.code_header_id =
                                               jurisdiction_code_header.code_header_id) AND
                                              ((a.jurisdictions_array #>> '{jurisdiction_code}'::text[]) =
                                               (jurisdiction_codes.code_name)::text))))
                                     LEFT JOIN invasivesbc.code_header invasive_species_agency_code_header ON ((
                                         ((invasive_species_agency_code_header.code_header_title)::text =
                                          'invasive_species_agency_code'::text) AND
                                         (invasive_species_agency_code_header.valid_to IS NULL))))
                                     LEFT JOIN invasivesbc.code invasive_species_agency_codes ON ((
                                         (invasive_species_agency_codes.code_header_id =
                                          invasive_species_agency_code_header.code_header_id) AND
                                         (a.funding_list = (invasive_species_agency_codes.code_name)::text))))
                                 GROUP BY a.activity_incoming_data_id),
             common_fields AS (SELECT p.jurisdiction,
                                      a.activity_incoming_data_id,
                                      a.activity_id,
                                      (a.activity_payload #>> '{short_id}'::text[])                            AS short_id,
                                      p.project                                                                AS project_code,
                                      (a.activity_payload #>> '{activity_type}'::text[])                       AS activity_type,
                                      (a.activity_payload #>> '{activity_subtype}'::text[])                    AS activity_subtype,
                                      a.form_status,
                                      to_char(to_timestamp(
                                                      (a.activity_payload #>>
                                                       '{form_data,activity_data,activity_date_time}'::text[]),
                                                      'YYYY-MM-DD"T"HH24:MI:SS'::text),
                                              'YYYY-MM-DD HH24:MI:SS'::text)                                   AS activity_date_time,
                                      (a.activity_payload #>> '{form_data,activity_data,utm_zone}'::text[])    AS utm_zone,
                                      (a.activity_payload #>> '{form_data,activity_data,utm_easting}'::text[]) AS utm_easting,
                                      (a.activity_payload #>>
                                       '{form_data,activity_data,utm_northing}'::text[])                       AS utm_northing,
                                      (a.activity_payload #>> '{form_data,activity_data,latitude}'::text[])    AS latitude,
                                      (a.activity_payload #>> '{form_data,activity_data,longitude}'::text[])   AS longitude,
                                      translate((a.activity_payload #>> '{species_positive}'::text[]), '[]"'::text,
                                                ''::text)                                                      AS species_positive,
                                      jsonb_array_length((a.activity_payload #> '{species_positive}'::text[])) AS positive_species_count,
                                      translate((a.activity_payload #>> '{species_negative}'::text[]), '[]"'::text,
                                                ''::text)                                                      AS species_negative,
                                      jsonb_array_length((a.activity_payload #> '{species_negative}'::text[])) AS negative_species_count,
                                      (a.activity_payload #>>
                                       '{form_data,activity_data,reported_area}'::text[])                      AS reported_area_sqm,
                                      (a.activity_payload #>>
                                       '{form_data,activity_type_data,pre_treatment_observation}'::text[])     AS pre_treatment_observation,
                                      p.person_name                                                            AS observation_person,
                                      p.treatment_person_name                                                  AS treatment_person,
                                      (a.activity_payload #>>
                                       '{form_data,activity_data,employer_code}'::text[])                      AS employer_code,
                                      employer_codes.code_description                                          AS employer_description,
                                      p.funding_agency,
                                      (a.activity_payload #>>
                                       '{form_data,activity_data,access_description}'::text[])                 AS access_description,
                                      (a.activity_payload #>>
                                       '{form_data,activity_data,location_description}'::text[])               AS location_description,
                                      (a.activity_payload #>>
                                       '{form_data,activity_data,general_comment}'::text[])                    AS comment,
                                      a.elevation,
                                      a.well_proximity,
                                      a.geog,
                                      a.biogeoclimatic_zones,
                                      a.regional_invasive_species_organization_areas,
                                      a.invasive_plant_management_areas,
                                      a.ownership,
                                      a.regional_districts,
                                      a.flnro_districts,
                                      a.moti_districts,
                                      CASE
                                          WHEN (a.media_keys IS NULL) THEN 'No'::text
                                          ELSE 'Yes'::text
                                          END                                                                  AS photo,
                                      a.created_timestamp,
                                      a.received_timestamp
                               FROM (((invasivesbc.activity_incoming_data a
                                   LEFT JOIN array_aggregate p
                                       ON ((p.activity_incoming_data_id = a.activity_incoming_data_id)))
                                   LEFT JOIN invasivesbc.code_header employer_code_header
                                      ON ((((employer_code_header.code_header_title)::text = 'employer_code'::text) AND
                                           (employer_code_header.valid_to IS NULL))))
                                   LEFT JOIN invasivesbc.code employer_codes
                                     ON (((employer_codes.code_header_id = employer_code_header.code_header_id) AND
                                          ((a.activity_payload #>> '{form_data,activity_data,employer_code}'::text[]) =
                                           (employer_codes.code_name)::text))))
                               WHERE ((a.activity_incoming_data_id IN (SELECT activity_current.incoming_data_id
                                                                       FROM invasivesbc.activity_current)) AND
                                      ((a.form_status)::text = 'Submitted'::text) AND (a.deleted_timestamp IS NULL) AND
                                      ((a.activity_subtype)::text =
                                       'Activity_Treatment_MechanicalPlantTerrestrial'::text))),
             mechanical_treatment_array AS (SELECT activity_incoming_data.activity_incoming_data_id,
                                                   activity_incoming_data.activity_subtype,
                                                   jsonb_array_elements((activity_incoming_data.activity_payload #>
                                                                         '{form_data,activity_subtype_data,Treatment_MechanicalPlant_Information}'::text[])) AS json_array
                                            FROM invasivesbc.activity_incoming_data
                                            WHERE ((activity_incoming_data.activity_incoming_data_id IN
                                                    (SELECT activity_current.incoming_data_id
                                                     FROM invasivesbc.activity_current)) AND
                                                   ((activity_incoming_data.form_status)::text = 'Submitted'::text) AND
                                                   (activity_incoming_data.deleted_timestamp IS NULL) AND
                                                   ((activity_incoming_data.activity_subtype)::text =
                                                    'Activity_Treatment_MechanicalPlantTerrestrial'::text))),
             mechanical_treatment_select AS (SELECT m_1.activity_incoming_data_id,
                                                    (m_1.json_array #>> '{treated_area}'::text[])                  AS treated_area,
                                                    (m_1.json_array #>>
                                                     '{disposed_material,disposed_material_input_format}'::text[]) AS disposed_material_format,
                                                    (m_1.json_array #>>
                                                     '{disposed_material,disposed_material_input_number}'::text[]) AS disposed_material_amount,
                                                    (m_1.json_array #>> '{invasive_plant_code}'::text[])           AS invasive_plant_code,
                                                    invasive_plant_codes.code_description                          AS invasive_plant,
                                                    (m_1.json_array #>> '{mechanical_method_code}'::text[])        AS mechanical_method_code,
                                                    mechanical_method_codes.code_description                       AS mechanical_method,
                                                    (m_1.json_array #>> '{mechanical_disposal_code}'::text[])      AS mechanical_disposal_code,
                                                    mechanical_disposal_codes.code_description                     AS disposal_method
                                             FROM ((((((mechanical_treatment_array m_1
                                                 LEFT JOIN invasivesbc.code_header invasive_plant_code_header ON ((
                                                     ((invasive_plant_code_header.code_header_title)::text =
                                                      'invasive_plant_code'::text) AND
                                                     (invasive_plant_code_header.valid_to IS NULL))))
                                                 LEFT JOIN invasivesbc.code invasive_plant_codes ON ((
                                                     (invasive_plant_codes.code_header_id =
                                                      invasive_plant_code_header.code_header_id) AND
                                                     ((m_1.json_array #>> '{invasive_plant_code}'::text[]) =
                                                      (invasive_plant_codes.code_name)::text))))
                                                 LEFT JOIN invasivesbc.code_header mechanical_method_code_header ON ((
                                                     ((mechanical_method_code_header.code_header_title)::text =
                                                      'mechanical_method_code'::text) AND
                                                     (mechanical_method_code_header.valid_to IS NULL))))
                                                 LEFT JOIN invasivesbc.code mechanical_method_codes ON ((
                                                     (mechanical_method_codes.code_header_id =
                                                      mechanical_method_code_header.code_header_id) AND
                                                     ((m_1.json_array #>> '{mechanical_method_code}'::text[]) =
                                                      (mechanical_method_codes.code_name)::text))))
                                                 LEFT JOIN invasivesbc.code_header mechanical_disposal_code_header ON ((
                                                     ((mechanical_disposal_code_header.code_header_title)::text =
                                                      'mechanical_disposal_code'::text) AND
                                                     (mechanical_disposal_code_header.valid_to IS NULL))))
                                                 LEFT JOIN invasivesbc.code mechanical_disposal_codes ON ((
                                                     (mechanical_disposal_codes.code_header_id =
                                                      mechanical_disposal_code_header.code_header_id) AND
                                                     ((m_1.json_array #>> '{mechanical_disposal_code}'::text[]) =
                                                      (mechanical_disposal_codes.code_name)::text)))))
        SELECT c.activity_incoming_data_id,
               c.activity_id,
               c.short_id,
               c.project_code,
               c.activity_date_time,
               c.reported_area_sqm,
               c.latitude,
               c.longitude,
               c.utm_zone,
               c.utm_easting,
               c.utm_northing,
               c.employer_description AS employer,
               c.funding_agency,
               c.jurisdiction,
               c.access_description,
               c.location_description,
               c.comment,
               c.observation_person,
               m.invasive_plant,
               m.treated_area         AS treated_area_sqm,
               m.mechanical_method,
               m.disposal_method,
               CASE
                   WHEN (m.disposed_material_format = 'weight'::text) THEN 'weight (kg)'::text
                   ELSE m.disposed_material_format
                   END                AS disposed_material_format,
               m.disposed_material_amount,
               c.elevation,
               c.well_proximity,
               c.biogeoclimatic_zones,
               c.regional_invasive_species_organization_areas,
               c.invasive_plant_management_areas,
               c.ownership,
               c.regional_districts,
               c.flnro_districts,
               c.moti_districts,
               c.photo,
               c.created_timestamp,
               c.received_timestamp,
               c.geog
        FROM (common_fields c
            JOIN mechanical_treatment_select m ON ((m.activity_incoming_data_id = c.activity_incoming_data_id)));
        CREATE VIEW invasivesbc.current_observation_terrestrial_summary AS
        WITH select_summary AS (SELECT o.activity_incoming_data_id,
                                       o.activity_id,
                                       o.short_id,
                                       o.project_code,
                                       o.activity_date_time,
                                       o.reported_area_sqm,
                                       o.latitude,
                                       o.longitude,
                                       o.utm_zone,
                                       o.utm_easting,
                                       o.utm_northing,
                                       o.employer,
                                       o.funding_agency,
                                       o.jurisdiction,
                                       o.access_description,
                                       o.location_description,
                                       o.comment,
                                       o.pre_treatment_observation,
                                       o.observation_person,
                                       o.soil_texture,
                                       o.specific_use,
                                       o.slope,
                                       o.aspect,
                                       o.research_observation,
                                       o.visible_well_nearby,
                                       o.suitable_for_biocontrol_agent,
                                       o.invasive_plant,
                                       o.observation_type,
                                       o.density,
                                       o.distribution,
                                       o.life_stage,
                                       o.voucher_sample_id,
                                       o.date_voucher_collected,
                                       o.date_voucher_verified,
                                       o.name_of_herbarium,
                                       o.accession_number,
                                       o.voucher_person_name,
                                       o.voucher_organization,
                                       o.voucher_utm_zone,
                                       o.voucher_utm_easting,
                                       o.voucher_utm_northing,
                                       o.elevation,
                                       o.well_proximity,
                                       o.biogeoclimatic_zones,
                                       o.regional_invasive_species_organization_areas,
                                       o.invasive_plant_management_areas,
                                       o.ownership,
                                       o.regional_districts,
                                       o.flnro_districts,
                                       o.moti_districts,
                                       o.photo,
                                       o.created_timestamp,
                                       o.received_timestamp,
                                       o.geog,
                                       invasive_plant_codes.code_name         AS species_code,
                                       concat(o.activity_incoming_data_id, '-',
                                              invasive_plant_codes.code_name) AS id_species
                                FROM ((invasivesbc.observation_terrestrial_plant_summary o
                                    LEFT JOIN invasivesbc.code_header invasive_plant_code_header ON ((
                                        ((invasive_plant_code_header.code_header_title)::text =
                                         'invasive_plant_code'::text) AND
                                        (invasive_plant_code_header.valid_to IS NULL))))
                                    LEFT JOIN invasivesbc.code invasive_plant_codes
                                      ON (((invasive_plant_codes.code_header_id =
                                            invasive_plant_code_header.code_header_id) AND
                                           ((o.invasive_plant)::text =
                                            (invasive_plant_codes.code_description)::text))))),
             chemical_treatment AS (SELECT treatment_chemical_terrestrial_plant_summary.short_id,
                                           treatment_chemical_terrestrial_plant_summary.invasive_plant,
                                           invasive_plant_codes.code_name                                              AS species_code,
                                           to_timestamp(treatment_chemical_terrestrial_plant_summary.activity_date_time,
                                                        'YYYY-MM-DD HH24:MI:SS'::text)                                 AS activity_date_time,
                                           treatment_chemical_terrestrial_plant_summary.chemical_application_method,
                                           string_agg(DISTINCT treatment_chemical_terrestrial_plant_summary.herbicide,
                                                      ', '::text
                                                      ORDER BY treatment_chemical_terrestrial_plant_summary.herbicide) AS herbicide,
                                           public.st_transform(
                                                   public.st_makevalid((treatment_chemical_terrestrial_plant_summary.geog)::public.geometry),
                                                   4326)                                                               AS geom
                                    FROM ((invasivesbc.treatment_chemical_terrestrial_plant_summary
                                        LEFT JOIN invasivesbc.code_header invasive_plant_code_header ON ((
                                            ((invasive_plant_code_header.code_header_title)::text =
                                             'invasive_plant_code'::text) AND
                                            (invasive_plant_code_header.valid_to IS NULL))))
                                        LEFT JOIN invasivesbc.code invasive_plant_codes ON ((
                                            (invasive_plant_codes.code_header_id =
                                             invasive_plant_code_header.code_header_id) AND
                                            (treatment_chemical_terrestrial_plant_summary.invasive_plant =
                                             (invasive_plant_codes.code_description)::text))))
                                    GROUP BY treatment_chemical_terrestrial_plant_summary.short_id,
                                             treatment_chemical_terrestrial_plant_summary.invasive_plant,
                                             invasive_plant_codes.code_name,
                                             treatment_chemical_terrestrial_plant_summary.activity_date_time,
                                             treatment_chemical_terrestrial_plant_summary.geog,
                                             treatment_chemical_terrestrial_plant_summary.chemical_application_method),
             mechanical_treatment AS (SELECT treatment_mechanical_terrestrial_plant_summary.short_id,
                                             treatment_mechanical_terrestrial_plant_summary.invasive_plant,
                                             invasive_plant_codes.code_name AS species_code,
                                             treatment_mechanical_terrestrial_plant_summary.created_timestamp,
                                             treatment_mechanical_terrestrial_plant_summary.treated_area_sqm,
                                             treatment_mechanical_terrestrial_plant_summary.mechanical_method,
                                             treatment_mechanical_terrestrial_plant_summary.disposal_method,
                                             public.st_transform(
                                                     public.st_makevalid((treatment_mechanical_terrestrial_plant_summary.geog)::public.geometry),
                                                     4326)                  AS geom
                                      FROM ((invasivesbc.treatment_mechanical_terrestrial_plant_summary
                                          LEFT JOIN invasivesbc.code_header invasive_plant_code_header ON ((
                                              ((invasive_plant_code_header.code_header_title)::text =
                                               'invasive_plant_code'::text) AND
                                              (invasive_plant_code_header.valid_to IS NULL))))
                                          LEFT JOIN invasivesbc.code invasive_plant_codes ON ((
                                              (invasive_plant_codes.code_header_id =
                                               invasive_plant_code_header.code_header_id) AND
                                              ((treatment_mechanical_terrestrial_plant_summary.invasive_plant)::text =
                                               (invasive_plant_codes.code_description)::text)))))
        SELECT s.activity_incoming_data_id,
               s.activity_id,
               s.short_id,
               s.project_code,
               s.activity_date_time,
               round((public.st_area(public.st_transform(p.geom, 3005)))::numeric, 2) AS reported_area_sqm,
               s.latitude,
               s.longitude,
               s.utm_zone,
               s.utm_easting,
               s.utm_northing,
               s.employer,
               s.funding_agency,
               s.jurisdiction,
               s.access_description,
               s.location_description,
               s.comment,
               s.pre_treatment_observation,
               s.observation_person,
               s.soil_texture,
               s.specific_use,
               s.slope,
               s.aspect,
               s.research_observation,
               s.visible_well_nearby,
               s.suitable_for_biocontrol_agent,
               s.invasive_plant,
               s.density,
               s.distribution,
               s.life_stage,
               c.short_id                                                             AS chemical_short_id,
               to_char(c.activity_date_time, 'YYYY-MM-DD HH24:MI:SS'::text)           AS chemical_treatment_date,
               c.chemical_application_method,
               c.herbicide,
               round((public.st_area(public.st_transform(c.geom, 3005)))::numeric,
                     2)                                                               AS chemical_treatment_area_sqm,
               round((public.st_area(public.st_intersection(public.st_transform(p.geom, 3005),
                                                            public.st_transform(c.geom, 3005))))::numeric,
                     2)                                                               AS observation_area_treated,
               round((((public.st_area(public.st_intersection(public.st_transform(p.geom, 3005),
                                                              public.st_transform(c.geom, 3005))) /
                        public.st_area(public.st_transform(p.geom, 3005))) * (100)::double precision))::numeric,
                     2)                                                               AS percent_area_treated,
               m.short_id                                                             AS mechanical_short_id,
               to_char(m.created_timestamp, 'YYYY-MM-DD HH24:MI:SS'::text)            AS mechanical_treatment_date,
               m.mechanical_method,
               m.disposal_method,
               round((public.st_area(public.st_transform(m.geom, 3005)))::numeric,
                     2)                                                               AS mechanical_treatment_area_sqm,
               s.voucher_sample_id,
               s.date_voucher_collected,
               s.date_voucher_verified,
               s.name_of_herbarium,
               s.accession_number,
               s.voucher_person_name,
               s.voucher_organization,
               s.voucher_utm_zone,
               s.voucher_utm_easting,
               s.voucher_utm_northing,
               s.elevation,
               s.well_proximity,
               s.biogeoclimatic_zones,
               s.regional_invasive_species_organization_areas,
               s.invasive_plant_management_areas,
               s.ownership,
               s.regional_districts,
               s.flnro_districts,
               s.moti_districts,
               s.photo,
               s.created_timestamp,
               s.received_timestamp,
               p.geom
        FROM (((select_summary s
            JOIN invasivesbc.current_positive_observations p ON ((p.id_species = s.id_species)))
            LEFT JOIN chemical_treatment c
               ON ((public.st_intersects2(p.geom, c.geom) AND (p.species_code = (c.species_code)::text) AND
                    (p.created_timestamp < c.activity_date_time))))
            LEFT JOIN mechanical_treatment m
              ON ((public.st_intersects2(p.geom, m.geom) AND (p.species_code = (m.species_code)::text) AND
                   (p.created_timestamp < m.created_timestamp))));
        CREATE MATERIALIZED VIEW invasivesbc.current_positive_observations_materialized AS
        SELECT current_positive_observations.activity_incoming_data_id,
               current_positive_observations.species_code,
               current_positive_observations.id_species,
               current_positive_observations.invasive_plant,
               current_positive_observations.geom,
               current_positive_observations.created_timestamp
        FROM invasivesbc.current_positive_observations
        WITH NO DATA;
        CREATE VIEW invasivesbc.current_positive_treated_aquatic AS
        WITH spatial_explode_treatments AS (SELECT activity_incoming_data.activity_type,
                                                   activity_incoming_data.activity_subtype,
                                                   activity_incoming_data.created_timestamp,
                                                   activity_incoming_data.activity_incoming_data_id,
                                                   (activity_incoming_data.activity_payload #>> '{short_id}'::text[]) AS short_id,
                                                   jsonb_array_elements(activity_incoming_data.species_treated)       AS species,
                                                   public.geometry(activity_incoming_data.geog)                       AS geom
                                            FROM invasivesbc.activity_incoming_data
                                            WHERE (((activity_incoming_data.activity_subtype)::text =
                                                    'Activity_Treatment_ChemicalPlantAquatic'::text) AND
                                                   ((activity_incoming_data.form_status)::text = 'Submitted'::text) AND
                                                   (activity_incoming_data.activity_incoming_data_id IN
                                                    (SELECT activity_current.incoming_data_id
                                                     FROM invasivesbc.activity_current)) AND
                                                   (activity_incoming_data.species_treated IS NOT NULL) AND
                                                   ((activity_incoming_data.species_treated)::text !~~ '[null]'::text) AND
                                                   ((activity_incoming_data.species_treated)::text !~~ 'null'::text))),
             spatial_treatments AS (SELECT spatial_explode_treatments.activity_type,
                                           spatial_explode_treatments.activity_subtype,
                                           spatial_explode_treatments.created_timestamp,
                                           spatial_explode_treatments.activity_incoming_data_id,
                                           spatial_explode_treatments.short_id,
                                           (spatial_explode_treatments.species #>> '{}'::text[]) AS species_code,
                                           CASE
                                               WHEN (public.st_geometrytype(spatial_explode_treatments.geom) =
                                                     'ST_Point'::text)
                                                   THEN (public.st_buffer(
                                                       (spatial_explode_treatments.geom)::public.geography,
                                                       (0.56425)::double precision,
                                                       'quad_segs=30'::text))::public.geometry
                                               ELSE spatial_explode_treatments.geom
                                               END                                               AS geom
                                    FROM spatial_explode_treatments)
        SELECT p.activity_incoming_data_id,
               t.short_id                                               AS treatment_short_id,
               public.st_area(public.st_transform(t.geom, 3005))        AS area_treated_sqm,
               p.invasive_plant,
               concat(p.activity_incoming_data_id, '-', p.species_code) AS id_species,
               p.geom                                                   AS observation_geom,
               t.geom                                                   AS treatment_geom
        FROM (invasivesbc.current_positive_observations p
            JOIN spatial_treatments t
              ON ((public.st_intersects(p.geom, t.geom) AND (p.species_code = t.species_code) AND
                   (p.created_timestamp < t.created_timestamp))));
        CREATE VIEW invasivesbc.current_positive_treated_terrestrial AS
        WITH spatial_explode_treatments AS (SELECT activity_incoming_data.activity_type,
                                                   activity_incoming_data.activity_subtype,
                                                   activity_incoming_data.created_timestamp,
                                                   activity_incoming_data.activity_incoming_data_id,
                                                   (activity_incoming_data.activity_payload #>> '{short_id}'::text[]) AS short_id,
                                                   jsonb_array_elements(activity_incoming_data.species_treated)       AS species,
                                                   public.geometry(activity_incoming_data.geog)                       AS geom
                                            FROM invasivesbc.activity_incoming_data
                                            WHERE (((activity_incoming_data.activity_subtype)::text =
                                                    'Activity_Treatment_ChemicalPlantTerrestrial'::text) AND
                                                   ((activity_incoming_data.form_status)::text = 'Submitted'::text) AND
                                                   (activity_incoming_data.activity_incoming_data_id IN
                                                    (SELECT activity_current.incoming_data_id
                                                     FROM invasivesbc.activity_current)) AND
                                                   (activity_incoming_data.species_treated IS NOT NULL) AND
                                                   ((activity_incoming_data.species_treated)::text !~~ '[null]'::text) AND
                                                   ((activity_incoming_data.species_treated)::text !~~ 'null'::text))),
             spatial_treatments AS (SELECT spatial_explode_treatments.activity_type,
                                           spatial_explode_treatments.activity_subtype,
                                           spatial_explode_treatments.created_timestamp,
                                           spatial_explode_treatments.activity_incoming_data_id,
                                           spatial_explode_treatments.short_id,
                                           (spatial_explode_treatments.species #>> '{}'::text[]) AS species_code,
                                           CASE
                                               WHEN (public.st_geometrytype(spatial_explode_treatments.geom) =
                                                     'ST_Point'::text)
                                                   THEN (public.st_buffer(
                                                       (spatial_explode_treatments.geom)::public.geography,
                                                       (0.56425)::double precision,
                                                       'quad_segs=30'::text))::public.geometry
                                               ELSE spatial_explode_treatments.geom
                                               END                                               AS geom
                                    FROM spatial_explode_treatments)
        SELECT p.activity_incoming_data_id,
               t.short_id                                               AS treatment_short_id,
               public.st_area(public.st_transform(t.geom, 3005))        AS area_treated_sqm,
               p.invasive_plant,
               concat(p.activity_incoming_data_id, '-', p.species_code) AS id_species,
               p.geom                                                   AS observation_geom,
               t.geom                                                   AS treatment_geom
        FROM (invasivesbc.current_positive_observations p
            JOIN spatial_treatments t
              ON ((public.st_intersects(p.geom, t.geom) AND (p.species_code = t.species_code) AND
                   (p.created_timestamp < t.created_timestamp))));
        CREATE VIEW invasivesbc.edrr_species AS
        WITH species_select AS (SELECT activity_incoming_data.activity_incoming_data_id,
                                       activity_incoming_data.short_id,
                                       activity_incoming_data.species_positive,
                                       activity_incoming_data.regional_districts,
                                       activity_incoming_data.created_by,
                                       a.email,
                                       activity_incoming_data.created_timestamp,
                                       activity_incoming_data.received_timestamp,
                                       now() AS times
                                FROM (invasivesbc.activity_incoming_data
                                    LEFT JOIN invasivesbc.application_user a
                                      ON (((a.preferred_username)::text = (activity_incoming_data.created_by)::text)))
                                WHERE ((activity_incoming_data.species_positive <> 'null'::jsonb) AND
                                       (activity_incoming_data.species_positive IS NOT NULL) AND
                                       (activity_incoming_data.activity_incoming_data_id IN
                                        (SELECT activity_current.incoming_data_id
                                         FROM invasivesbc.activity_current)) AND
                                       ((activity_incoming_data.form_status)::text = 'Submitted'::text) AND
                                       (activity_incoming_data.received_timestamp >= (now() + '06:00:00'::interval)))),
             species_array AS (SELECT species_select.activity_incoming_data_id,
                                      species_select.short_id,
                                      jsonb_array_elements_text(species_select.species_positive) AS species_positive,
                                      species_select.regional_districts,
                                      species_select.created_by,
                                      species_select.email,
                                      species_select.created_timestamp,
                                      species_select.received_timestamp
                               FROM species_select),
             species_names AS (SELECT species_array.activity_incoming_data_id,
                                      species_array.short_id,
                                      species_array.species_positive,
                                      invasive_plant_codes.code_description         AS terrestrial_invasive_plant,
                                      invasive_plant_aquatic_codes.code_description AS aquatic_invasive_plant,
                                      species_array.regional_districts,
                                      species_array.created_by,
                                      species_array.email,
                                      species_array.created_timestamp,
                                      species_array.received_timestamp
                               FROM ((((species_array
                                   LEFT JOIN invasivesbc.code_header invasive_plant_aquatic_code_header ON ((
                                       ((invasive_plant_aquatic_code_header.code_header_title)::text =
                                        'invasive_plant_aquatic_code'::text) AND
                                       (invasive_plant_aquatic_code_header.valid_to IS NULL))))
                                   LEFT JOIN invasivesbc.code invasive_plant_aquatic_codes ON ((
                                       (invasive_plant_aquatic_codes.code_header_id =
                                        invasive_plant_aquatic_code_header.code_header_id) AND
                                       (species_array.species_positive =
                                        (invasive_plant_aquatic_codes.code_name)::text))))
                                   LEFT JOIN invasivesbc.code_header invasive_plant_code_header ON ((
                                       ((invasive_plant_code_header.code_header_title)::text =
                                        'invasive_plant_code'::text) AND
                                       (invasive_plant_code_header.valid_to IS NULL))))
                                   LEFT JOIN invasivesbc.code invasive_plant_codes
                                     ON (((invasive_plant_codes.code_header_id =
                                           invasive_plant_code_header.code_header_id) AND
                                          (species_array.species_positive = (invasive_plant_codes.code_name)::text)))))
        SELECT species_names.activity_incoming_data_id,
               species_names.short_id,
               species_names.species_positive,
               COALESCE(species_names.terrestrial_invasive_plant,
                        species_names.aquatic_invasive_plant) AS invasive_plant,
               species_names.regional_districts,
               species_names.created_by,
               species_names.email,
               species_names.created_timestamp,
               species_names.received_timestamp
        FROM species_names
        WHERE (species_names.species_positive = ANY
               (ARRAY ['AR'::text, 'BH'::text, 'ED'::text, 'AM'::text, 'CC'::text, 'RC'::text, 'DC'::text, 'SN'::text, 'SA'::text, 'EC'::text, 'DW'::text, 'ES'::text, 'BF'::text, 'FR'::text, 'FT'::text, 'RG'::text, 'AH'::text, 'ME'::text, 'WH'::text, 'HY'::text, 'GJ'::text, 'JG'::text, 'CV'::text, 'KU'::text, 'MC'::text, 'TM'::text, 'NS'::text, 'PN'::text, 'PP'::text, 'BR'::text, 'CE'::text, 'MS'::text, 'MV'::text, 'TP'::text, 'IS'::text, 'MX'::text, 'PU'::text, 'YS'::text, 'SY'::text, 'TX'::text, 'IT'::text, 'WT'::text, 'LW'::text, 'AQ'::text, 'YF'::text]));
        CREATE TABLE invasivesbc.email_settings
        (
            email_setting_id   smallint          NOT NULL,
            enabled            boolean DEFAULT false,
            authentication_url character varying NOT NULL,
            email_service_url  character varying NOT NULL,
            client_id          character varying NOT NULL,
            client_secret      character varying NOT NULL
        );
        CREATE SEQUENCE invasivesbc.email_settings_email_setting_id_seq
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;
        ALTER SEQUENCE invasivesbc.email_settings_email_setting_id_seq OWNED BY invasivesbc.email_settings.email_setting_id;
        CREATE TABLE invasivesbc.email_templates
        (
            email_template_id smallint          NOT NULL,
            from_email        character varying NOT NULL,
            email_subject     character varying NOT NULL,
            email_body        character varying,
            template_name     character varying NOT NULL
        );
        CREATE SEQUENCE invasivesbc.email_templates_email_template_id_seq
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;
        ALTER SEQUENCE invasivesbc.email_templates_email_template_id_seq OWNED BY invasivesbc.email_templates.email_template_id;
        CREATE TABLE invasivesbc.embedded_report_categories
        (
            id         integer                NOT NULL,
            name       character varying(128) NOT NULL,
            sort_order integer DEFAULT 1000   NOT NULL,
            CONSTRAINT embedded_report_categories_sort_order_check CHECK ((sort_order > 0))
        );
        CREATE SEQUENCE invasivesbc.embedded_report_categories_id_seq
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;
        ALTER SEQUENCE invasivesbc.embedded_report_categories_id_seq OWNED BY invasivesbc.embedded_report_categories.id;
        CREATE TABLE invasivesbc.embedded_reports
        (
            metabase_id       integer                                                                                           NOT NULL,
            category_id       integer                                                                                           NOT NULL,
            display_name      character varying(100)                                                                            NOT NULL,
            enabled           boolean                                DEFAULT true                                               NOT NULL,
            sort_order        integer                                DEFAULT 1000                                               NOT NULL,
            id                integer                                                                                           NOT NULL,
            metabase_resource public.embedded_metabase_resource_type DEFAULT 'question'::public.embedded_metabase_resource_type NOT NULL,
            CONSTRAINT embedded_reports_id_check CHECK ((metabase_id > 0)),
            CONSTRAINT embedded_reports_sort_order_check CHECK ((sort_order > 0))
        );
        COMMENT ON COLUMN invasivesbc.embedded_reports.metabase_id IS 'must match ID of metabase report';
        CREATE SEQUENCE invasivesbc.embedded_reports_id_seq
            START WITH 10000
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;
        ALTER SEQUENCE invasivesbc.embedded_reports_id_seq OWNED BY invasivesbc.embedded_reports.id;
        CREATE VIEW invasivesbc.embedded_reports_view AS
        SELECT r.id,
               r.metabase_resource,
               r.metabase_id,
               r.display_name AS name,
               c.name         AS category
        FROM (invasivesbc.embedded_reports r
            JOIN invasivesbc.embedded_report_categories c ON ((r.category_id = c.id)))
        WHERE (r.enabled IS TRUE)
        ORDER BY c.sort_order, c.name, r.sort_order, r.display_name;
        CREATE TABLE invasivesbc.error_log
        (
            id                   integer NOT NULL,
            error                jsonb   NOT NULL,
            client_state         jsonb   NOT NULL,
            created_at           timestamp without time zone DEFAULT now(),
            created_by           character varying,
            created_by_with_guid character varying
        );
        CREATE SEQUENCE invasivesbc.error_log_id_seq
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;
        ALTER SEQUENCE invasivesbc.error_log_id_seq OWNED BY invasivesbc.error_log.id;
        CREATE TABLE invasivesbc.export_records
        (
            id             integer                                               NOT NULL,
            export_time    timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
            export_type    character varying(32)                                 NOT NULL,
            last_record    integer,
            file_reference character varying(512)                                NOT NULL,
            CONSTRAINT export_records_export_type_check CHECK ((length((export_type)::text) >= 4)),
            CONSTRAINT export_records_file_reference_check CHECK ((length((file_reference)::text) >= 4))
        );
        CREATE SEQUENCE invasivesbc.export_records_id_seq
            AS integer
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;
        ALTER SEQUENCE invasivesbc.export_records_id_seq OWNED BY invasivesbc.export_records.id;
        CREATE TABLE invasivesbc.iapp_imported_images
        (
            id                            integer                                   NOT NULL,
            original_iapp_id              bigint                                    NOT NULL,
            perspective_code              character varying(1),
            sample_point_id               bigint,
            site_id                       bigint,
            treatment_id                  bigint,
            image_date                    date                                      NOT NULL,
            reference_no                  character varying(20)                     NOT NULL,
            comments                      text,
            detected_mime_type            character varying(255),
            imported_at                   timestamp without time zone DEFAULT now() NOT NULL,
            revision_count_at_import_time bigint                                    NOT NULL,
            media_key                     character varying(255)
        );
        CREATE SEQUENCE invasivesbc.iapp_imported_images_id_seq
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;
        ALTER SEQUENCE invasivesbc.iapp_imported_images_id_seq OWNED BY invasivesbc.iapp_imported_images.id;
        CREATE TABLE invasivesbc.mechanical_treatment_extract
        (
            mechanicaltreatmentid                  integer                 NOT NULL,
            site_id                                integer                 NOT NULL,
            site_paper_file_id                     character varying(20),
            district_lot_number                    character varying(6),
            jurisdictions                          character varying(1000) NOT NULL,
            site_created_date                      date                    NOT NULL,
            mapsheet                               character varying(10)   NOT NULL,
            utm_zone                               integer                 NOT NULL,
            utm_easting                            integer                 NOT NULL,
            utm_northing                           integer                 NOT NULL,
            decimal_latitude                       numeric(7, 5),
            decimal_longitude                      numeric(8, 5),
            biogeoclimatic_zone                    character varying(5)    NOT NULL,
            sub_zone                               character varying(5)    NOT NULL,
            variant                                integer,
            phase                                  character varying(5),
            site_series                            character varying(5),
            soil_texture                           character varying(120),
            site_specific_use                      character varying(120)  NOT NULL,
            invasive_plant                         character varying(100)  NOT NULL,
            treatment_date                         date,
            treatment_paper_file_id                character varying(22),
            treatment_agency                       character varying(120)  NOT NULL,
            treatment_comments                     character varying(2000),
            treatment_method                       character varying(120)  NOT NULL,
            estimated_area_hectares                numeric(10, 4)          NOT NULL,
            employer                               character varying(120),
            primary_applicator                     character varying(120)  NOT NULL,
            other_applicators                      character varying(1000),
            site_location                          character varying(2000),
            site_comments                          character varying(2000),
            entered_by                             character varying(100)  NOT NULL,
            date_entered                           date                    NOT NULL,
            updated_by                             character varying(100)  NOT NULL,
            date_updated                           date                    NOT NULL,
            regional_district                      character varying(200),
            regional_invasive_species_organization character varying(200),
            invasive_plant_management_area         character varying(200)
        );
        CREATE MATERIALIZED VIEW invasivesbc.iapp_imported_images_map AS
        SELECT i.id                            AS imported_image_id,
               COALESCE(NULLIF(i.site_id, 0), (mte.site_id)::bigint, (bte.site_id)::bigint,
                        (cte.site_id)::bigint) AS mapped_site_id
        FROM (((invasivesbc.iapp_imported_images i
            LEFT JOIN invasivesbc.mechanical_treatment_extract mte ON ((i.treatment_id = mte.mechanicaltreatmentid)))
            LEFT JOIN invasivesbc.biological_treatment_extract bte ON ((i.treatment_id = bte.biotreatmentid)))
            LEFT JOIN invasivesbc.chemical_treatment_extract cte ON ((i.treatment_id = cte.chemicaltreatmentid)))
        WITH NO DATA;
        CREATE TABLE invasivesbc.iapp_invbc_mapping
        (
            mapping_id  integer NOT NULL,
            char_code   character varying(2),
            invbc_name  character varying(100),
            iapp_name   character varying(100),
            environment character varying(1),
            comments    character varying(300)
        );
        CREATE SEQUENCE invasivesbc.iapp_invbc_mapping_mapping_id_seq
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;
        ALTER SEQUENCE invasivesbc.iapp_invbc_mapping_mapping_id_seq OWNED BY invasivesbc.iapp_invbc_mapping.mapping_id;
        CREATE TABLE invasivesbc.iapp_jurisdictions
        (
            id           integer               NOT NULL,
            jurisdiction character varying(70) NOT NULL,
            code         character varying(10)
        );
        CREATE SEQUENCE invasivesbc.iapp_jurisdictions_id_seq
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;
        ALTER SEQUENCE invasivesbc.iapp_jurisdictions_id_seq OWNED BY invasivesbc.iapp_jurisdictions.id;
        CREATE TABLE invasivesbc.mechanical_monitoring_extract
        (
            mechmonitoringid                       integer                 NOT NULL,
            site_id                                integer                 NOT NULL,
            site_paper_file_id                     character varying(120),
            district_lot_number                    character varying(6),
            jurisdictions                          character varying(1000) NOT NULL,
            site_created_date                      date                    NOT NULL,
            mapsheet                               character varying(10)   NOT NULL,
            utm_zone                               integer                 NOT NULL,
            utm_easting                            integer                 NOT NULL,
            utm_northing                           integer                 NOT NULL,
            decimal_latitude                       numeric(7, 5),
            decimal_longitude                      numeric(8, 5),
            biogeoclimatic_zone                    character varying(5)    NOT NULL,
            sub_zone                               character varying(5)    NOT NULL,
            variant                                integer,
            phase                                  character varying(5),
            site_series                            character varying(5),
            soil_texture                           character varying(120),
            site_specific_use                      character varying(120)  NOT NULL,
            invasive_plant                         character varying(100)  NOT NULL,
            treatment_method                       character varying(120)  NOT NULL,
            treatment_date                         date,
            treatment_paper_file_id                character varying(22),
            treatment_comments                     character varying(2000),
            monitoring_paper_file_id               character varying(22),
            monitoring_agency                      character varying(120)  NOT NULL,
            inspection_date                        date                    NOT NULL,
            primary_surveyor                       character varying(120),
            other_surveyors                        character varying(1000),
            efficacy_rating                        character varying(120)  NOT NULL,
            estimated_area_hectares                numeric(10, 4),
            distribution                           character varying(120),
            density                                character varying(120),
            monitoring_comments                    character varying(2000),
            site_location                          character varying(2000),
            site_comments                          character varying(2000),
            entered_by                             character varying(100)  NOT NULL,
            date_entered                           date                    NOT NULL,
            updated_by                             character varying(100)  NOT NULL,
            date_updated                           date                    NOT NULL,
            regional_district                      character varying(200),
            regional_invasive_species_organization character varying(200),
            invasive_plant_management_area         character varying(200)
        );
        CREATE TABLE invasivesbc.site_selection_extract
        (
            siteselectionid                        integer                 NOT NULL,
            site_id                                integer                 NOT NULL,
            site_paper_file_id                     character varying(20),
            district_lot_number                    character varying(6),
            jurisdictions                          character varying(1000) NOT NULL,
            site_created_date                      date                    NOT NULL,
            mapsheet                               character varying(10)   NOT NULL,
            utm_zone                               integer                 NOT NULL,
            utm_easting                            integer                 NOT NULL,
            utm_northing                           integer                 NOT NULL,
            decimal_latitude                       numeric(7, 5),
            decimal_longitude                      numeric(8, 5),
            biogeoclimatic_zone                    character varying(5)    NOT NULL,
            sub_zone                               character varying(5)    NOT NULL,
            variant                                integer,
            phase                                  character varying(5),
            site_series                            character varying(5),
            soil_texture                           character varying(120),
            site_specific_use                      character varying(120)  NOT NULL,
            survey_paper_file_id                   character varying(22),
            invasive_plant                         character varying(100)  NOT NULL,
            last_surveyed_date                     date                    NOT NULL,
            primary_surveyor                       character varying(120),
            other_surveyors                        character varying(1000),
            estimated_area_hectares                numeric(10, 4),
            distribution                           character varying(120),
            density                                character varying(120),
            slope_percent                          integer,
            aspect                                 integer,
            elevation                              integer,
            treatment_date                         date,
            treatment_type                         character varying(120),
            all_species_on_site                    character varying(2000) NOT NULL,
            site_location                          character varying(2000),
            site_comments                          character varying(2000),
            entered_by                             character varying(100)  NOT NULL,
            date_entered                           date                    NOT NULL,
            updated_by                             character varying(100)  NOT NULL,
            date_updated                           date                    NOT NULL,
            regional_district                      character varying(200),
            regional_invasive_species_organization character varying(200),
            invasive_plant_management_area         character varying(200)
        );
        CREATE TABLE invasivesbc.survey_extract
        (
            surveyid                               integer                 NOT NULL,
            site_id                                integer                 NOT NULL,
            site_paper_file_id                     character varying(20),
            district_lot_number                    character varying(6),
            jurisdictions                          character varying(1000) NOT NULL,
            site_created_date                      date,
            mapsheet                               character varying(10)   NOT NULL,
            utm_zone                               integer                 NOT NULL,
            utm_easting                            integer                 NOT NULL,
            utm_northing                           integer                 NOT NULL,
            decimal_latitude                       numeric(7, 5),
            decimal_longitude                      numeric(8, 5),
            biogeoclimatic_zone                    character varying(5)    NOT NULL,
            sub_zone                               character varying(5)    NOT NULL,
            variant                                integer,
            phase                                  character varying(5),
            site_series                            character varying(5),
            soil_texture                           character varying(120),
            site_specific_use                      character varying(120)  NOT NULL,
            invasive_plant                         character varying(100)  NOT NULL,
            survey_paper_file_id                   character varying(22),
            survey_date                            date                    NOT NULL,
            survey_type                            character varying(20),
            estimated_area_hectares                numeric(10, 4),
            distribution                           character varying(120),
            density                                character varying(120),
            survey_agency                          character varying(120)  NOT NULL,
            employer                               character varying(120),
            primary_surveyor                       character varying(120),
            other_surveyors                        character varying(1000),
            survey_comments                        character varying(2000),
            site_location                          character varying(2000),
            site_comments                          character varying(2000),
            entered_by                             character varying(100)  NOT NULL,
            date_entered                           date                    NOT NULL,
            updated_by                             character varying(100)  NOT NULL,
            date_updated                           date                    NOT NULL,
            regional_district                      character varying(200),
            regional_invasive_species_organization character varying(200),
            invasive_plant_management_area         character varying(200)
        );
        CREATE VIEW invasivesbc.iapp_site_summary_slow AS
        WITH sites_grouped AS (SELECT site_selection_extract.site_id,
                                      site_selection_extract.all_species_on_site,
                                      site_selection_extract.decimal_longitude,
                                      site_selection_extract.decimal_latitude
                               FROM invasivesbc.site_selection_extract
                               GROUP BY site_selection_extract.site_id, site_selection_extract.all_species_on_site,
                                        site_selection_extract.decimal_longitude,
                                        site_selection_extract.decimal_latitude),
             date_summary AS (SELECT sse_1.site_id,
                                     (SELECT string_agg(DISTINCT (bio_agents.biological_agent)::text,
                                                        ', '::text) AS string_agg
                                      FROM (SELECT biological_dispersal_extract.biological_agent
                                            FROM invasivesbc.biological_dispersal_extract
                                            WHERE (biological_dispersal_extract.site_id = sse_1.site_id)
                                            UNION
                                            SELECT biological_treatment_extract.biological_agent
                                            FROM invasivesbc.biological_treatment_extract
                                            WHERE (biological_treatment_extract.site_id = sse_1.site_id)
                                            UNION
                                            SELECT biological_monitoring_extract.biological_agent
                                            FROM invasivesbc.biological_monitoring_extract
                                            WHERE (biological_monitoring_extract.site_id = sse_1.site_id)) bio_agents) AS biological_agent,
                                     min(se.survey_date)                                                               AS min_survey,
                                     max(se.survey_date)                                                               AS max_survey,
                                     min(cte.treatment_date)                                                           AS min_chemical_treatment_dates,
                                     max(cte.treatment_date)                                                           AS max_chemical_treatment_dates,
                                     min(cme.inspection_date)                                                          AS min_chemical_treatment_monitoring_dates,
                                     max(cme.inspection_date)                                                          AS max_chemical_treatment_monitoring_dates,
                                     min(bde.inspection_date)                                                          AS min_bio_dispersal_dates,
                                     max(bde.inspection_date)                                                          AS max_bio_dispersal_dates,
                                     min(bte.treatment_date)                                                           AS min_bio_treatment_dates,
                                     max(bte.treatment_date)                                                           AS max_bio_treatment_dates,
                                     min(bme.inspection_date)                                                          AS min_bio_treatment_monitoring_dates,
                                     max(bme.inspection_date)                                                          AS max_bio_treatment_monitoring_dates,
                                     min(mte.treatment_date)                                                           AS min_mechanical_treatment_dates,
                                     max(mte.treatment_date)                                                           AS max_mechanical_treatment_dates,
                                     min(mme.inspection_date)                                                          AS min_mechanical_treatment_monitoring_dates,
                                     max(mme.inspection_date)                                                          AS max_mechanical_treatment_monitoring_dates
                              FROM ((((((((sites_grouped sse_1
                                  LEFT JOIN invasivesbc.survey_extract se ON ((sse_1.site_id = se.site_id)))
                                  LEFT JOIN invasivesbc.chemical_treatment_extract cte
                                          ON ((sse_1.site_id = cte.site_id)))
                                  LEFT JOIN invasivesbc.chemical_monitoring_extract cme
                                         ON ((sse_1.site_id = cme.site_id)))
                                  LEFT JOIN invasivesbc.biological_dispersal_extract bde
                                        ON ((sse_1.site_id = bde.site_id)))
                                  LEFT JOIN invasivesbc.biological_treatment_extract bte
                                       ON ((sse_1.site_id = bte.site_id)))
                                  LEFT JOIN invasivesbc.biological_monitoring_extract bme
                                      ON ((sse_1.site_id = bme.site_id)))
                                  LEFT JOIN invasivesbc.mechanical_treatment_extract mte
                                     ON ((sse_1.site_id = mte.site_id)))
                                  LEFT JOIN invasivesbc.mechanical_monitoring_extract mme
                                    ON ((sse_1.site_id = mme.site_id)))
                              GROUP BY sse_1.site_id)
        SELECT sse.site_id,
               sse.all_species_on_site,
               ds.biological_agent,
               sse.decimal_longitude,
               sse.decimal_latitude,
               ds.min_survey,
               ds.max_survey,
               ds.min_chemical_treatment_dates,
               ds.max_chemical_treatment_dates,
               ds.min_chemical_treatment_monitoring_dates,
               ds.max_chemical_treatment_monitoring_dates,
               ds.min_bio_dispersal_dates,
               ds.max_bio_dispersal_dates,
               ds.min_bio_treatment_dates,
               ds.max_bio_treatment_dates,
               ds.min_bio_treatment_monitoring_dates,
               ds.max_bio_treatment_monitoring_dates,
               ds.min_mechanical_treatment_dates,
               ds.max_mechanical_treatment_dates,
               ds.min_mechanical_treatment_monitoring_dates,
               ds.max_mechanical_treatment_monitoring_dates,
               CASE
                   WHEN (ds.min_survey IS NULL) THEN false
                   ELSE true
                   END AS has_surveys,
               CASE
                   WHEN (ds.max_bio_treatment_monitoring_dates IS NULL) THEN false
                   ELSE true
                   END AS has_biological_treatment_monitorings,
               CASE
                   WHEN (ds.max_bio_treatment_dates IS NULL) THEN false
                   ELSE true
                   END AS has_biological_treatments,
               CASE
                   WHEN (ds.min_bio_dispersal_dates IS NULL) THEN false
                   ELSE true
                   END AS has_biological_dispersals,
               CASE
                   WHEN (ds.max_chemical_treatment_monitoring_dates IS NULL) THEN false
                   ELSE true
                   END AS has_chemical_treatment_monitorings,
               CASE
                   WHEN (ds.min_chemical_treatment_dates IS NULL) THEN false
                   ELSE true
                   END AS has_chemical_treatments,
               CASE
                   WHEN (ds.max_mechanical_treatment_dates IS NULL) THEN false
                   ELSE true
                   END AS has_mechanical_treatments,
               CASE
                   WHEN (ds.max_mechanical_treatment_monitoring_dates IS NULL) THEN false
                   ELSE true
                   END AS has_mechanical_treatment_monitorings
        FROM (sites_grouped sse
            JOIN date_summary ds ON ((ds.site_id = sse.site_id)));
        CREATE MATERIALIZED VIEW invasivesbc.iapp_site_summary AS
        WITH jurisdiction_data AS (SELECT DISTINCT regexp_split_to_array((survey_extract.jurisdictions)::text,
                                                                         '($1<=)(, )'::text) AS jurisdictions,
                                                   survey_extract.site_id
                                   FROM invasivesbc.survey_extract),
             paper_file_list AS (SELECT DISTINCT se.site_paper_file_id,
                                                 se.site_id
                                 FROM invasivesbc.survey_extract se
                                 GROUP BY se.site_id, se.site_paper_file_id),
             agencies AS (SELECT sea.site_id,
                                 string_agg(DISTINCT (sea.survey_agency)::text, ', '::text) AS agency_agg
                          FROM invasivesbc.survey_extract sea
                          GROUP BY sea.site_id),
             areas AS (SELECT DISTINCT ON (z_1.site_id) z_1.site_id,
                                                        z_1.estimated_area_hectares,
                                                        z_1.survey_date
                       FROM invasivesbc.survey_extract z_1
                       ORDER BY z_1.site_id, z_1.survey_date DESC),
             rd_riso AS (SELECT DISTINCT s.site_id,
                                         s.regional_district,
                                         s.regional_invasive_species_organization,
                                         s.invasive_plant_management_area
                         FROM invasivesbc.site_selection_extract s
                         GROUP BY s.site_id, s.regional_district, s.regional_invasive_species_organization,
                                  s.invasive_plant_management_area)
        SELECT i.site_id,
               i.all_species_on_site,
               i.biological_agent,
               i.decimal_longitude,
               i.decimal_latitude,
               i.min_survey,
               i.max_survey,
               i.min_chemical_treatment_dates,
               i.max_chemical_treatment_dates,
               i.min_chemical_treatment_monitoring_dates,
               i.max_chemical_treatment_monitoring_dates,
               i.min_bio_dispersal_dates,
               i.max_bio_dispersal_dates,
               i.min_bio_treatment_dates,
               i.max_bio_treatment_dates,
               i.min_bio_treatment_monitoring_dates,
               i.max_bio_treatment_monitoring_dates,
               i.min_mechanical_treatment_dates,
               i.max_mechanical_treatment_dates,
               i.min_mechanical_treatment_monitoring_dates,
               i.max_mechanical_treatment_monitoring_dates,
               i.has_surveys,
               i.has_biological_treatment_monitorings,
               i.has_biological_treatments,
               i.has_biological_dispersals,
               i.has_chemical_treatment_monitorings,
               i.has_chemical_treatments,
               i.has_mechanical_treatments,
               i.has_mechanical_treatment_monitorings,
               jd.jurisdictions,
               z.estimated_area_hectares                                  AS reported_area,
               string_to_array((i.all_species_on_site)::text, ', '::text) AS all_species_on_site_as_array,
               p.site_paper_file_id,
               a.agency_agg                                               AS agencies,
               r.regional_district,
               r.regional_invasive_species_organization,
               r.invasive_plant_management_area
        FROM (((((invasivesbc.iapp_site_summary_slow i
            JOIN jurisdiction_data jd ON ((i.site_id = jd.site_id)))
            JOIN paper_file_list p ON ((jd.site_id = p.site_id)))
            JOIN agencies a ON ((p.site_id = a.site_id)))
            JOIN areas z ON ((a.site_id = z.site_id)))
            JOIN rd_riso r ON ((a.site_id = r.site_id)))
        WHERE (1 = 1)
        WITH NO DATA;
        CREATE TABLE invasivesbc.iapp_spatial
        (
            site_id integer NOT NULL,
            geog    public.geography(Geometry, 4326)
        );
        CREATE MATERIALIZED VIEW invasivesbc.iapp_site_summary_and_geojson AS
        SELECT i.site_id,
               i.all_species_on_site,
               i.biological_agent,
               i.decimal_longitude,
               i.decimal_latitude,
               i.min_survey,
               i.max_survey,
               i.min_chemical_treatment_dates,
               i.max_chemical_treatment_dates,
               i.min_chemical_treatment_monitoring_dates,
               i.max_chemical_treatment_monitoring_dates,
               i.min_bio_dispersal_dates,
               i.max_bio_dispersal_dates,
               i.min_bio_treatment_dates,
               i.max_bio_treatment_dates,
               i.min_bio_treatment_monitoring_dates,
               i.max_bio_treatment_monitoring_dates,
               i.min_mechanical_treatment_dates,
               i.max_mechanical_treatment_dates,
               i.min_mechanical_treatment_monitoring_dates,
               i.max_mechanical_treatment_monitoring_dates,
               i.has_surveys,
               i.has_biological_treatment_monitorings,
               i.has_biological_treatments,
               i.has_biological_dispersals,
               i.has_chemical_treatment_monitorings,
               i.has_chemical_treatments,
               i.has_mechanical_treatments,
               i.has_mechanical_treatment_monitorings,
               i.jurisdictions,
               i.reported_area,
               i.all_species_on_site_as_array,
               i.site_paper_file_id,
               i.agencies,
               i.regional_district,
               i.regional_invasive_species_organization,
               i.invasive_plant_management_area,
               s.geog,
               CASE
                   WHEN (i.has_biological_treatment_monitorings OR i.has_chemical_treatment_monitorings OR
                         i.has_mechanical_treatment_monitorings) THEN 'Yes'::text
                   ELSE 'No'::text
                   END                                                 AS monitored,
               json_build_object('type', 'Feature', 'properties',
                                 json_build_object('site_id', i.site_id, 'species', i.all_species_on_site,
                                                   'has_surveys',
                                                   i.has_surveys, 'has_biological_treatments',
                                                   i.has_biological_treatments,
                                                   'has_biological_monitorings', i.has_biological_treatment_monitorings,
                                                   'has_biological_dispersals', i.has_biological_dispersals,
                                                   'has_chemical_treatments', i.has_chemical_treatments,
                                                   'has_chemical_monitorings', i.has_chemical_treatment_monitorings,
                                                   'has_mechanical_treatments', i.has_mechanical_treatments,
                                                   'has_mechanical_monitorings', i.has_mechanical_treatment_monitorings,
                                                   'earliest_survey', i.min_survey, 'latest_survey', i.max_survey,
                                                   'earliest_chemical_treatment', i.min_chemical_treatment_dates,
                                                   'latest_chemical_treatment', i.max_chemical_treatment_dates,
                                                   'earliest_chemical_monitoring',
                                                   i.min_chemical_treatment_monitoring_dates,
                                                   'latest_chemical_monitoring',
                                                   i.max_chemical_treatment_monitoring_dates,
                                                   'earliest_bio_dispersal', i.min_bio_dispersal_dates,
                                                   'latest_bio_dispersal',
                                                   i.max_bio_dispersal_dates, 'earliest_bio_treatment',
                                                   i.min_bio_treatment_dates, 'latest_bio_treatment',
                                                   i.max_bio_treatment_dates,
                                                   'earliest_bio_monitoring', i.min_bio_treatment_monitoring_dates,
                                                   'latest_bio_monitoring', i.max_bio_treatment_monitoring_dates,
                                                   'earliest_mechanical_treatment', i.min_mechanical_treatment_dates,
                                                   'latest_mechanical_treatment', i.max_mechanical_treatment_dates,
                                                   'earliest_mechanical_monitoring',
                                                   i.min_mechanical_treatment_monitoring_dates,
                                                   'latest_mechanical_monitoring',
                                                   i.max_mechanical_treatment_monitoring_dates, 'reported_area',
                                                   i.reported_area, 'jurisdictions', i.jurisdictions,
                                                   'regional_district',
                                                   i.regional_district, 'regional_invasive_species_organization',
                                                   i.regional_invasive_species_organization), 'geometry',
                                 (public.st_asgeojson(s.geog))::jsonb) AS geojson
        FROM (invasivesbc.iapp_site_summary i
            JOIN invasivesbc.iapp_spatial s ON ((i.site_id = s.site_id)))
        WHERE (1 = 1)
        WITH NO DATA;
        CREATE TABLE invasivesbc.species_ref_raw
        (
            species_id  integer               NOT NULL,
            common_name character varying(50) NOT NULL,
            latin_name  character varying(50) NOT NULL,
            genus       character varying(4)  NOT NULL,
            species     character varying(3)  NOT NULL,
            map_symbol  character varying(2)  NOT NULL
        );
        CREATE VIEW invasivesbc.iapp_species_ref_raw AS
        WITH all_plant_codes AS (SELECT c_1.code_id,
                                        c_1.code_description,
                                        c_1.code_name,
                                        ch.code_header_name,
                                        c_1.code_header_id
                                 FROM (invasivesbc.code c_1
                                     JOIN invasivesbc.code_header ch ON ((c_1.code_header_id = ch.code_header_id)))
                                 WHERE ((ch.code_header_name)::text = ANY
                                        (ARRAY [('invasive_plant_code'::character varying)::text, ('invasive_plant_code_withbiocontrol'::character varying)::text, ('invasive_plant_aquatic_code'::character varying)::text])))
        SELECT c.code_id,
               c.code_header_id,
               n.common_name,
               n.latin_name,
               n.genus,
               n.species,
               n.map_symbol
        FROM (invasivesbc.species_ref_raw n
            JOIN all_plant_codes c ON (((c.code_name)::text = (n.map_symbol)::text)));
        CREATE VIEW invasivesbc.iapp_species_status AS
        WITH most_recent_positive_occurences AS (SELECT se.site_id,
                                                        max(se.survey_date) AS positive_occurrence_date,
                                                        se.invasive_plant
                                                 FROM invasivesbc.survey_extract se
                                                 WHERE (se.estimated_area_hectares > (0)::numeric)
                                                 GROUP BY se.site_id, se.invasive_plant),
             most_recent_negative_occurrences AS (SELECT se.site_id,
                                                         max(se.survey_date) AS negative_occurrence_date,
                                                         se.invasive_plant
                                                  FROM invasivesbc.survey_extract se
                                                  WHERE (se.estimated_area_hectares = (0)::numeric)
                                                  GROUP BY se.site_id, se.invasive_plant),
             most_recent_both AS (SELECT a.site_id,
                                         a.invasive_plant,
                                         a.positive_occurrence_date,
                                         b.negative_occurrence_date
                                  FROM (most_recent_positive_occurences a
                                      LEFT JOIN most_recent_negative_occurrences b ON (((a.site_id = b.site_id) AND
                                                                                        ((a.invasive_plant)::text = (b.invasive_plant)::text))))),
             site_species_status AS (SELECT most_recent_both.site_id,
                                            most_recent_both.invasive_plant,
                                            CASE
                                                WHEN ((most_recent_both.positive_occurrence_date >
                                                       most_recent_both.negative_occurrence_date) OR
                                                      ((most_recent_both.positive_occurrence_date IS NOT NULL) AND
                                                       (most_recent_both.negative_occurrence_date IS NULL))) THEN true
                                                ELSE false
                                                END AS is_species_positive,
                                            CASE
                                                WHEN ((most_recent_both.negative_occurrence_date >
                                                       most_recent_both.positive_occurrence_date) OR
                                                      ((most_recent_both.negative_occurrence_date IS NOT NULL) AND
                                                       (most_recent_both.positive_occurrence_date IS NULL))) THEN true
                                                ELSE false
                                                END AS is_species_negative
                                     FROM most_recent_both)
        SELECT site_species_status.site_id,
               site_species_status.invasive_plant,
               site_species_status.is_species_positive,
               site_species_status.is_species_negative
        FROM site_species_status
        ORDER BY site_species_status.is_species_negative DESC;
        CREATE TABLE invasivesbc.invasive_plant_no_treatment_extract
        (
            invasiveplantnotreatmentid             integer                 NOT NULL,
            site_id                                integer                 NOT NULL,
            site_paper_file_id                     character varying(20),
            district_lot_number                    character varying(6),
            jurisdictions                          character varying(1000) NOT NULL,
            site_created_date                      date                    NOT NULL,
            mapsheet                               character varying(10)   NOT NULL,
            utm_zone                               integer                 NOT NULL,
            utm_easting                            integer                 NOT NULL,
            utm_northing                           integer                 NOT NULL,
            decimal_latitude                       numeric(7, 5),
            decimal_longitude                      numeric(8, 5),
            biogeoclimatic_zone                    character varying(5)    NOT NULL,
            sub_zone                               character varying(5)    NOT NULL,
            variant                                integer,
            phase                                  character varying(5),
            site_series                            character varying(5),
            soil_texture                           character varying(120),
            site_specific_use                      character varying(120)  NOT NULL,
            invasive_plant                         character varying(100)  NOT NULL,
            survey_paper_file_id                   character varying(22),
            estimated_area_hectares                numeric(10, 4),
            distribution                           character varying(120),
            density                                character varying(120),
            last_surveyed_date                     date,
            survey_agency                          character varying(120)  NOT NULL,
            primary_surveyor                       character varying(120),
            other_surveyors                        character varying(1000),
            site_location                          character varying(2000),
            site_comments                          character varying(2000),
            entered_by                             character varying(100)  NOT NULL,
            date_entered                           date                    NOT NULL,
            updated_by                             character varying(100)  NOT NULL,
            date_updated                           date                    NOT NULL,
            regional_district                      character varying(200),
            regional_invasive_species_organization character varying(200),
            invasive_plant_management_area         character varying(200)
        );
        CREATE VIEW invasivesbc.jurisdiction_species AS
        WITH spatial_expload_positive AS (SELECT activity_incoming_data.activity_type,
                                                 activity_incoming_data.activity_subtype,
                                                 activity_incoming_data.created_timestamp,
                                                 activity_incoming_data.activity_incoming_data_id,
                                                 activity_incoming_data.regional_districts,
                                                 activity_incoming_data.regional_invasive_species_organization_areas,
                                                 jsonb_array_elements(activity_incoming_data.species_positive)             AS species,
                                                 jsonb_array_elements((activity_incoming_data.activity_payload #>
                                                                       '{form_data,activity_data,jurisdictions}'::text[])) AS jurisdictions_array,
                                                 public.st_makevalid(public.geometry(activity_incoming_data.geog))         AS geom
                                          FROM invasivesbc.activity_incoming_data
                                          WHERE (((activity_incoming_data.activity_type)::text = 'Observation'::text) AND
                                                 ((activity_incoming_data.form_status)::text = 'Submitted'::text) AND
                                                 (activity_incoming_data.activity_incoming_data_id IN
                                                  (SELECT activity_current.incoming_data_id
                                                   FROM invasivesbc.activity_current)) AND
                                                 (activity_incoming_data.species_positive IS NOT NULL) AND
                                                 ((activity_incoming_data.species_positive)::text !~~ '[null]'::text) AND
                                                 ((activity_incoming_data.species_positive)::text !~~ 'null'::text))),
             spatial_positive AS (SELECT spatial_expload_positive.activity_type,
                                         spatial_expload_positive.activity_subtype,
                                         spatial_expload_positive.created_timestamp,
                                         spatial_expload_positive.activity_incoming_data_id,
                                         spatial_expload_positive.regional_districts,
                                         spatial_expload_positive.regional_invasive_species_organization_areas,
                                         spatial_expload_positive.species,
                                         (spatial_expload_positive.jurisdictions_array #>>
                                          '{jurisdiction_code}'::text[]) AS jurisdiction_code,
                                         (spatial_expload_positive.jurisdictions_array #>>
                                          '{percent_covered}'::text[])   AS percent_covered,
                                         CASE
                                             WHEN (public.st_geometrytype(spatial_expload_positive.geom) =
                                                   'ST_Point'::text)
                                                 THEN (public.st_buffer(
                                                     (spatial_expload_positive.geom)::public.geography,
                                                     (0.56425)::double precision,
                                                     'quad_segs=30'::text))::public.geometry
                                             ELSE spatial_expload_positive.geom
                                             END                         AS geom
                                  FROM spatial_expload_positive),
             spatial_expload_negative AS (SELECT activity_incoming_data.activity_subtype,
                                                 activity_incoming_data.created_timestamp,
                                                 activity_incoming_data.activity_incoming_data_id,
                                                 jsonb_array_elements(activity_incoming_data.species_negative)     AS species,
                                                 public.st_makevalid(public.geometry(activity_incoming_data.geog)) AS geom
                                          FROM invasivesbc.activity_incoming_data
                                          WHERE (((activity_incoming_data.activity_type)::text = 'Observation'::text) AND
                                                 ((activity_incoming_data.form_status)::text = 'Submitted'::text) AND
                                                 (activity_incoming_data.activity_incoming_data_id IN
                                                  (SELECT activity_current.incoming_data_id
                                                   FROM invasivesbc.activity_current)) AND
                                                 (activity_incoming_data.species_negative IS NOT NULL) AND
                                                 ((activity_incoming_data.species_negative)::text !~~ '[null]'::text) AND
                                                 ((activity_incoming_data.species_negative)::text !~~ 'null'::text))),
             spatial_negative AS (SELECT spatial_expload_negative.activity_subtype,
                                         spatial_expload_negative.created_timestamp,
                                         spatial_expload_negative.activity_incoming_data_id,
                                         spatial_expload_negative.species,
                                         CASE
                                             WHEN (public.st_geometrytype(spatial_expload_negative.geom) =
                                                   'ST_Point'::text)
                                                 THEN (public.st_buffer(
                                                     (spatial_expload_negative.geom)::public.geography,
                                                     (0.56425)::double precision,
                                                     'quad_segs=30'::text))::public.geometry
                                             ELSE spatial_expload_negative.geom
                                             END AS geom
                                  FROM spatial_expload_negative),
             spatial_positive_negative AS (SELECT row_number() OVER ()           AS ctid,
                                                  (pos.species #>> '{}'::text[]) AS species,
                                                  pos.jurisdiction_code,
                                                  pos.percent_covered,
                                                  pos.activity_type,
                                                  pos.created_timestamp,
                                                  pos.activity_incoming_data_id,
                                                  pos.regional_districts,
                                                  pos.regional_invasive_species_organization_areas,
                                                  CASE
                                                      WHEN public.st_intersects(pos.geom, neg.geom)
                                                          THEN public.st_difference(pos.geom, neg.geom)
                                                      ELSE pos.geom
                                                      END                        AS geom
                                           FROM (spatial_positive pos
                                               LEFT JOIN spatial_negative neg
                                                 ON ((public.st_intersects(pos.geom, neg.geom) AND
                                                      (pos.species = neg.species) AND
                                                      (pos.created_timestamp < neg.created_timestamp))))),
             spatial_full_overlap AS (SELECT t.activity_incoming_data_id,
                                             t.species,
                                             t.regional_districts,
                                             t.regional_invasive_species_organization_areas,
                                             t.jurisdiction_code,
                                             t.percent_covered,
                                             public.st_area((t.geom)::public.geography, true) AS area,
                                             t.geom,
                                             t.created_timestamp,
                                             t.activity_type
                                      FROM (spatial_positive_negative t
                                          JOIN (SELECT a.activity_incoming_data_id,
                                                       min(public.st_area((a.geom)::public.geography, true)) AS area
                                                FROM spatial_positive_negative a,
                                                     spatial_positive_negative b
                                                WHERE ((a.species = b.species) AND
                                                       public.st_contains(a.geom, b.geom) AND
                                                       (a.ctid <> b.ctid) AND
                                                       (a.activity_incoming_data_id = b.activity_incoming_data_id))
                                                GROUP BY a.activity_incoming_data_id) m
                                            ON ((t.activity_incoming_data_id = m.activity_incoming_data_id)))
                                      WHERE (public.st_area((t.geom)::public.geography, true) = m.area)),
             spatial_partial_overlap AS (SELECT a.activity_incoming_data_id,
                                                a.species,
                                                a.regional_districts,
                                                a.regional_invasive_species_organization_areas,
                                                a.jurisdiction_code,
                                                a.percent_covered,
                                                public.st_intersection(a.geom, b.geom) AS geom,
                                                a.created_timestamp,
                                                a.activity_type
                                         FROM spatial_positive_negative a,
                                              spatial_positive_negative b
                                         WHERE ((a.species = b.species) AND public.st_intersects(a.geom, b.geom) AND
                                                (a.ctid <> b.ctid) AND
                                                (a.activity_incoming_data_id = b.activity_incoming_data_id) AND
                                                (NOT (a.activity_incoming_data_id IN
                                                      (SELECT a_1.activity_incoming_data_id
                                                       FROM spatial_positive_negative a_1,
                                                            spatial_positive_negative b_1
                                                       WHERE ((a_1.species = b_1.species) AND
                                                              public.st_contains(a_1.geom, b_1.geom) AND
                                                              (a_1.ctid <> b_1.ctid) AND
                                                              (a_1.activity_incoming_data_id = b_1.activity_incoming_data_id))
                                                       GROUP BY a_1.activity_incoming_data_id))))
                                         GROUP BY a.activity_incoming_data_id, a.species, a.regional_districts,
                                                  a.regional_invasive_species_organization_areas, a.jurisdiction_code,
                                                  a.percent_covered, a.geom, b.geom, a.created_timestamp,
                                                  a.activity_type),
             spatial_others AS (SELECT spatial_positive_negative.activity_incoming_data_id,
                                       spatial_positive_negative.species,
                                       spatial_positive_negative.regional_districts,
                                       spatial_positive_negative.regional_invasive_species_organization_areas,
                                       spatial_positive_negative.jurisdiction_code,
                                       spatial_positive_negative.percent_covered,
                                       spatial_positive_negative.geom,
                                       spatial_positive_negative.created_timestamp,
                                       spatial_positive_negative.activity_type
                                FROM spatial_positive_negative
                                WHERE (NOT (spatial_positive_negative.activity_incoming_data_id IN
                                            (SELECT a.activity_incoming_data_id
                                             FROM spatial_positive_negative a,
                                                  spatial_positive_negative b
                                             WHERE ((a.species = b.species) AND public.st_intersects(a.geom, b.geom) AND
                                                    (a.ctid <> b.ctid) AND
                                                    (a.activity_incoming_data_id = b.activity_incoming_data_id))
                                             GROUP BY a.activity_incoming_data_id)))
                                UNION
                                SELECT spatial_full_overlap.activity_incoming_data_id,
                                       spatial_full_overlap.species,
                                       spatial_full_overlap.regional_districts,
                                       spatial_full_overlap.regional_invasive_species_organization_areas,
                                       spatial_full_overlap.jurisdiction_code,
                                       spatial_full_overlap.percent_covered,
                                       spatial_full_overlap.geom,
                                       spatial_full_overlap.created_timestamp,
                                       spatial_full_overlap.activity_type
                                FROM spatial_full_overlap
                                UNION
                                SELECT spatial_partial_overlap.activity_incoming_data_id,
                                       spatial_partial_overlap.species,
                                       spatial_partial_overlap.regional_districts,
                                       spatial_partial_overlap.regional_invasive_species_organization_areas,
                                       spatial_partial_overlap.jurisdiction_code,
                                       spatial_partial_overlap.percent_covered,
                                       spatial_partial_overlap.geom,
                                       spatial_partial_overlap.created_timestamp,
                                       spatial_partial_overlap.activity_type
                                FROM spatial_partial_overlap),
             spatial_union AS (SELECT spatial_others.species,
                                      invasive_plant_codes.code_description                       AS terrestrial_invasive_plant,
                                      invasive_plant_aquatic_codes.code_description               AS aquatic_invasive_plant,
                                      spatial_others.regional_districts,
                                      spatial_others.regional_invasive_species_organization_areas,
                                      spatial_others.jurisdiction_code,
                                      jurisdiction_codes.code_description                         AS jurisdiction,
                                      spatial_others.percent_covered,
                                      spatial_others.activity_type,
                                      max(spatial_others.created_timestamp)                       AS max_created_timestamp,
                                      array_agg(spatial_others.activity_incoming_data_id)         AS activity_ids,
                                      public.st_union(public.st_collectionextract(
                                              public.st_transform(spatial_others.geom, 3005), 3)) AS geom
                               FROM ((((((spatial_others
                                   LEFT JOIN invasivesbc.code_header invasive_plant_code_header ON ((
                                       ((invasive_plant_code_header.code_header_title)::text =
                                        'invasive_plant_code'::text) AND
                                       (invasive_plant_code_header.valid_to IS NULL))))
                                   LEFT JOIN invasivesbc.code invasive_plant_codes ON ((
                                       (invasive_plant_codes.code_header_id =
                                        invasive_plant_code_header.code_header_id) AND
                                       (spatial_others.species = (invasive_plant_codes.code_name)::text))))
                                   LEFT JOIN invasivesbc.code_header invasive_plant_aquatic_code_header ON ((
                                       ((invasive_plant_aquatic_code_header.code_header_title)::text =
                                        'invasive_plant_aquatic_code'::text) AND
                                       (invasive_plant_aquatic_code_header.valid_to IS NULL))))
                                   LEFT JOIN invasivesbc.code invasive_plant_aquatic_codes ON ((
                                       (invasive_plant_aquatic_codes.code_header_id =
                                        invasive_plant_aquatic_code_header.code_header_id) AND
                                       (spatial_others.species = (invasive_plant_aquatic_codes.code_name)::text))))
                                   LEFT JOIN invasivesbc.code_header jurisdiction_code_header
                                      ON ((((jurisdiction_code_header.code_header_title)::text =
                                            'jurisdiction_code'::text) AND
                                           (jurisdiction_code_header.valid_to IS NULL))))
                                   LEFT JOIN invasivesbc.code jurisdiction_codes
                                     ON (((jurisdiction_codes.code_header_id =
                                           jurisdiction_code_header.code_header_id) AND
                                          (spatial_others.jurisdiction_code = (jurisdiction_codes.code_name)::text))))
                               GROUP BY spatial_others.species, invasive_plant_codes.code_description,
                                        invasive_plant_aquatic_codes.code_description,
                                        spatial_others.regional_districts,
                                        spatial_others.regional_invasive_species_organization_areas,
                                        spatial_others.jurisdiction_code, jurisdiction_codes.code_description,
                                        spatial_others.percent_covered, spatial_others.activity_type),
             spatial_coalesce AS (SELECT spatial_union.species,
                                         spatial_union.regional_districts,
                                         spatial_union.regional_invasive_species_organization_areas,
                                         spatial_union.jurisdiction,
                                         (spatial_union.percent_covered)::double precision AS percent_covered,
                                         COALESCE(spatial_union.terrestrial_invasive_plant,
                                                  spatial_union.aquatic_invasive_plant)    AS invasive_plant,
                                         spatial_union.max_created_timestamp,
                                         public.st_area(spatial_union.geom)                AS area_sqm,
                                         spatial_union.geom
                                  FROM spatial_union
                                  WHERE (public.st_area(spatial_union.geom) > (0)::double precision))
        SELECT spatial_coalesce.invasive_plant,
               spatial_coalesce.regional_districts,
               spatial_coalesce.regional_invasive_species_organization_areas,
               spatial_coalesce.jurisdiction,
               ((spatial_coalesce.percent_covered / (100)::double precision) * spatial_coalesce.area_sqm) AS area_sqm,
               spatial_coalesce.geom
        FROM spatial_coalesce;
        CREATE VIEW invasivesbc.jurisdiction_species_area AS
        WITH jurisdiction_species_dump AS (SELECT j.invasive_plant,
                                                  j.jurisdiction,
                                                  ((public.st_dump(j.geom)).geom)::public.geometry(Polygon, 3005) AS geom
                                           FROM invasivesbc.jurisdiction_species j)
        SELECT i.invasive_plant,
               i.jurisdiction,
               public.st_area(public.st_multi(public.st_union(i.geom))) AS area_sqm
        FROM jurisdiction_species_dump i
        GROUP BY i.invasive_plant, i.jurisdiction;
        CREATE VIEW invasivesbc.mechanical_treatment_monitoring_summary AS
        WITH array_elements AS (SELECT activity_incoming_data.activity_incoming_data_id,
                                       activity_incoming_data.activity_subtype,
                                       jurisdictions_array.value AS jurisdictions_array,
                                       project_code_array.value  AS project_code_array,
                                       person_array.value        AS person_array,
                                       funding_list.f1           AS funding_list
                                FROM ((((invasivesbc.activity_incoming_data
                                    LEFT JOIN LATERAL jsonb_array_elements((activity_incoming_data.activity_payload #>
                                                                            '{form_data,activity_data,jurisdictions}'::text[])) jurisdictions_array(value)
                                         ON (true))
                                    LEFT JOIN LATERAL jsonb_array_elements((activity_incoming_data.activity_payload #>
                                                                            '{form_data,activity_data,project_code}'::text[])) project_code_array(value)
                                        ON (true))
                                    LEFT JOIN LATERAL jsonb_array_elements((activity_incoming_data.activity_payload #>
                                                                            '{form_data,activity_type_data,activity_persons}'::text[])) person_array(value)
                                       ON (true))
                                    LEFT JOIN LATERAL public.convert_string_list_to_array_elements((
                                            activity_incoming_data.activity_payload #>>
                                            '{form_data,activity_data,invasive_species_agency_code}'::text[])) funding_list(f1)
                                      ON (true))
                                WHERE ((activity_incoming_data.activity_incoming_data_id IN
                                        (SELECT activity_current.incoming_data_id
                                         FROM invasivesbc.activity_current)) AND
                                       ((activity_incoming_data.form_status)::text = 'Submitted'::text) AND
                                       (activity_incoming_data.deleted_timestamp IS NULL) AND
                                       ((activity_incoming_data.activity_subtype)::text =
                                        'Activity_Monitoring_MechanicalTerrestrialAquaticPlant'::text))),
             array_aggregate AS (SELECT a.activity_incoming_data_id,
                                        string_agg(DISTINCT (a.project_code_array #>> '{description}'::text[]),
                                                   ', '::text) AS project,
                                        string_agg(DISTINCT (a.person_array #>> '{person_name}'::text[]),
                                                   ', '::text) AS person_name,
                                        string_agg(DISTINCT
                                                   CASE
                                                       WHEN ((a.person_array #>> '{applicator_license}'::text[]) IS NOT NULL)
                                                           THEN concat((a.person_array #>> '{person_name}'::text[]),
                                                                       ', ',
                                                                       (a.person_array #>> '{applicator_license}'::text[]))
                                                       ELSE (a.person_array #>> '{person_name}'::text[])
                                                       END,
                                                   ', '::text) AS treatment_person_name,
                                        string_agg(DISTINCT concat(jurisdiction_codes.code_description, ' ',
                                                                   ((a.jurisdictions_array #>> '{percent_covered}'::text[]) || '%'::text)),
                                                   ', '::text) AS jurisdiction,
                                        string_agg(DISTINCT (invasive_species_agency_codes.code_description)::text,
                                                   ', '::text) AS funding_agency
                                 FROM ((((array_elements a
                                     LEFT JOIN invasivesbc.code_header jurisdiction_code_header ON ((
                                         ((jurisdiction_code_header.code_header_title)::text =
                                          'jurisdiction_code'::text) AND
                                         (jurisdiction_code_header.valid_to IS NULL))))
                                     LEFT JOIN invasivesbc.code jurisdiction_codes
                                         ON (((jurisdiction_codes.code_header_id =
                                               jurisdiction_code_header.code_header_id) AND
                                              ((a.jurisdictions_array #>> '{jurisdiction_code}'::text[]) =
                                               (jurisdiction_codes.code_name)::text))))
                                     LEFT JOIN invasivesbc.code_header invasive_species_agency_code_header ON ((
                                         ((invasive_species_agency_code_header.code_header_title)::text =
                                          'invasive_species_agency_code'::text) AND
                                         (invasive_species_agency_code_header.valid_to IS NULL))))
                                     LEFT JOIN invasivesbc.code invasive_species_agency_codes ON ((
                                         (invasive_species_agency_codes.code_header_id =
                                          invasive_species_agency_code_header.code_header_id) AND
                                         (a.funding_list = (invasive_species_agency_codes.code_name)::text))))
                                 GROUP BY a.activity_incoming_data_id),
             common_fields AS (SELECT p.jurisdiction,
                                      a.activity_incoming_data_id,
                                      a.activity_id,
                                      (a.activity_payload #>> '{short_id}'::text[])                            AS short_id,
                                      p.project                                                                AS project_code,
                                      (a.activity_payload #>> '{activity_type}'::text[])                       AS activity_type,
                                      (a.activity_payload #>> '{activity_subtype}'::text[])                    AS activity_subtype,
                                      a.form_status,
                                      to_char(to_timestamp(
                                                      (a.activity_payload #>>
                                                       '{form_data,activity_data,activity_date_time}'::text[]),
                                                      'YYYY-MM-DD"T"HH24:MI:SS'::text),
                                              'YYYY-MM-DD HH24:MI:SS'::text)                                   AS activity_date_time,
                                      (a.activity_payload #>> '{form_data,activity_data,utm_zone}'::text[])    AS utm_zone,
                                      (a.activity_payload #>> '{form_data,activity_data,utm_easting}'::text[]) AS utm_easting,
                                      (a.activity_payload #>>
                                       '{form_data,activity_data,utm_northing}'::text[])                       AS utm_northing,
                                      (a.activity_payload #>> '{form_data,activity_data,latitude}'::text[])    AS latitude,
                                      (a.activity_payload #>> '{form_data,activity_data,longitude}'::text[])   AS longitude,
                                      translate((a.activity_payload #>> '{species_positive}'::text[]), '[]"'::text,
                                                ''::text)                                                      AS species_positive,
                                      jsonb_array_length((a.activity_payload #> '{species_positive}'::text[])) AS positive_species_count,
                                      translate((a.activity_payload #>> '{species_negative}'::text[]), '[]"'::text,
                                                ''::text)                                                      AS species_negative,
                                      jsonb_array_length((a.activity_payload #> '{species_negative}'::text[])) AS negative_species_count,
                                      (a.activity_payload #>>
                                       '{form_data,activity_data,reported_area}'::text[])                      AS reported_area_sqm,
                                      (a.activity_payload #>>
                                       '{form_data,activity_type_data,pre_treatment_observation}'::text[])     AS pre_treatment_observation,
                                      p.person_name                                                            AS observation_person,
                                      p.treatment_person_name                                                  AS treatment_person,
                                      (a.activity_payload #>>
                                       '{form_data,activity_data,employer_code}'::text[])                      AS employer_code,
                                      employer_codes.code_description                                          AS employer_description,
                                      p.funding_agency,
                                      (a.activity_payload #>>
                                       '{form_data,activity_data,access_description}'::text[])                 AS access_description,
                                      (a.activity_payload #>>
                                       '{form_data,activity_data,location_description}'::text[])               AS location_description,
                                      (a.activity_payload #>>
                                       '{form_data,activity_data,general_comment}'::text[])                    AS comment,
                                      a.elevation,
                                      a.well_proximity,
                                      a.geog,
                                      a.biogeoclimatic_zones,
                                      a.regional_invasive_species_organization_areas,
                                      a.invasive_plant_management_areas,
                                      a.ownership,
                                      a.regional_districts,
                                      a.flnro_districts,
                                      a.moti_districts,
                                      CASE
                                          WHEN (a.media_keys IS NULL) THEN 'No'::text
                                          ELSE 'Yes'::text
                                          END                                                                  AS photo,
                                      a.created_timestamp,
                                      a.received_timestamp
                               FROM (((invasivesbc.activity_incoming_data a
                                   LEFT JOIN array_aggregate p
                                       ON ((p.activity_incoming_data_id = a.activity_incoming_data_id)))
                                   LEFT JOIN invasivesbc.code_header employer_code_header
                                      ON ((((employer_code_header.code_header_title)::text = 'employer_code'::text) AND
                                           (employer_code_header.valid_to IS NULL))))
                                   LEFT JOIN invasivesbc.code employer_codes
                                     ON (((employer_codes.code_header_id = employer_code_header.code_header_id) AND
                                          ((a.activity_payload #>> '{form_data,activity_data,employer_code}'::text[]) =
                                           (employer_codes.code_name)::text))))
                               WHERE ((a.activity_incoming_data_id IN (SELECT activity_current.incoming_data_id
                                                                       FROM invasivesbc.activity_current)) AND
                                      ((a.form_status)::text = 'Submitted'::text) AND (a.deleted_timestamp IS NULL) AND
                                      ((a.activity_subtype)::text =
                                       'Activity_Monitoring_MechanicalTerrestrialAquaticPlant'::text))),
             mechanical_monitoring_array AS (SELECT activity_incoming_data.activity_incoming_data_id,
                                                    jsonb_array_elements((activity_incoming_data.activity_payload #>
                                                                          '{form_data,activity_subtype_data,Monitoring_MechanicalTerrestrialAquaticPlant_Information}'::text[])) AS monitoring_array
                                             FROM invasivesbc.activity_incoming_data
                                             WHERE ((activity_incoming_data.activity_incoming_data_id IN
                                                     (SELECT activity_current.incoming_data_id
                                                      FROM invasivesbc.activity_current)) AND
                                                    ((activity_incoming_data.form_status)::text = 'Submitted'::text) AND
                                                    (activity_incoming_data.deleted_timestamp IS NULL) AND
                                                    ((activity_incoming_data.activity_subtype)::text =
                                                     'Activity_Monitoring_MechanicalTerrestrialAquaticPlant'::text))),
             invasive_plants_on_site AS (SELECT concat(mechanical_monitoring_array.activity_incoming_data_id, '-',
                                                       (mechanical_monitoring_array.monitoring_array #>>
                                                        '{invasive_plant_code}'::text[]))     AS plant_id,
                                                public.convert_string_list_to_array_elements((
                                                        mechanical_monitoring_array.monitoring_array #>>
                                                        '{invasive_plants_on_site}'::text[])) AS invasive_plants_on_site_code
                                         FROM mechanical_monitoring_array),
             invasive_plants_on_site_select AS (SELECT i.plant_id,
                                                       i.invasive_plants_on_site_code,
                                                       monitoring_evidence_codes.code_description AS invasive_plants_on_site
                                                FROM ((invasive_plants_on_site i
                                                    LEFT JOIN invasivesbc.code_header monitoring_evidence_code_header
                                                       ON ((
                                                               ((monitoring_evidence_code_header.code_header_title)::text =
                                                                'monitoring_evidence_code'::text) AND
                                                               (monitoring_evidence_code_header.valid_to IS NULL))))
                                                    LEFT JOIN invasivesbc.code monitoring_evidence_codes ON ((
                                                        (monitoring_evidence_codes.code_header_id =
                                                         monitoring_evidence_code_header.code_header_id) AND
                                                        (i.invasive_plants_on_site_code =
                                                         (monitoring_evidence_codes.code_name)::text))))),
             invasive_plants_on_site_agg AS (SELECT i.plant_id,
                                                    string_agg((i.invasive_plants_on_site)::text, ', '::text
                                                               ORDER BY (i.invasive_plants_on_site)::text) AS invasive_plants_on_site
                                             FROM invasive_plants_on_site_select i
                                             GROUP BY i.plant_id),
             mechanical_monitoring_json AS (SELECT a.activity_incoming_data_id,
                                                   (a.monitoring_array #>> '{invasive_plant_code}'::text[])         AS terrestrial_invasive_plant_code,
                                                   invasive_plant_codes.code_description                            AS terrestrial_invasive_plant,
                                                   (a.monitoring_array #>> '{invasive_plant_aquatic_code}'::text[]) AS aquatic_invasive_plant_code,
                                                   invasive_plant_aquatic_codes.code_description                    AS aquatic_invasive_plant,
                                                   (a.monitoring_array #>> '{efficacy_code}'::text[])               AS treatment_efficacy_rating_code,
                                                   efficacy_codes.code_description                                  AS treatment_efficacy_rating,
                                                   (a.monitoring_array #>> '{management_efficacy_rating}'::text[])  AS management_efficacy_rating_code,
                                                   management_efficacy_codes.code_description                       AS management_efficacy_rating,
                                                   (a.monitoring_array #>> '{evidence_of_treatment}'::text[])       AS evidence_of_treatment,
                                                   i.invasive_plants_on_site,
                                                   (a.monitoring_array #>> '{treatment_pass}'::text[])              AS treatment_pass,
                                                   (a.monitoring_array #>> '{comment}'::text[])                     AS comment
                                            FROM (((((((((mechanical_monitoring_array a
                                                JOIN invasive_plants_on_site_agg i ON ((i.plant_id =
                                                                                        concat(
                                                                                                a.activity_incoming_data_id,
                                                                                                '-',
                                                                                                (a.monitoring_array #>> '{invasive_plant_code}'::text[])))))
                                                LEFT JOIN invasivesbc.code_header invasive_plant_code_header ON ((
                                                    ((invasive_plant_code_header.code_header_title)::text =
                                                     'invasive_plant_code'::text) AND
                                                    (invasive_plant_code_header.valid_to IS NULL))))
                                                LEFT JOIN invasivesbc.code invasive_plant_codes ON ((
                                                    (invasive_plant_codes.code_header_id =
                                                     invasive_plant_code_header.code_header_id) AND
                                                    ((a.monitoring_array #>> '{invasive_plant_code}'::text[]) =
                                                     (invasive_plant_codes.code_name)::text))))
                                                LEFT JOIN invasivesbc.code_header invasive_plant_aquatic_code_header
                                                       ON ((
                                                               ((invasive_plant_aquatic_code_header.code_header_title)::text =
                                                                'invasive_plant_aquatic_code'::text) AND
                                                               (invasive_plant_aquatic_code_header.valid_to IS NULL))))
                                                LEFT JOIN invasivesbc.code invasive_plant_aquatic_codes ON ((
                                                    (invasive_plant_aquatic_codes.code_header_id =
                                                     invasive_plant_aquatic_code_header.code_header_id) AND
                                                    ((a.monitoring_array #>> '{invasive_plant_aquatic_code}'::text[]) =
                                                     (invasive_plant_aquatic_codes.code_name)::text))))
                                                LEFT JOIN invasivesbc.code_header efficacy_code_header ON ((
                                                    ((efficacy_code_header.code_header_title)::text =
                                                     'efficacy_code'::text) AND
                                                    (efficacy_code_header.valid_to IS NULL))))
                                                LEFT JOIN invasivesbc.code efficacy_codes ON ((
                                                    (efficacy_codes.code_header_id = efficacy_code_header.code_header_id) AND
                                                    ((a.monitoring_array #>> '{efficacy_code}'::text[]) =
                                                     (efficacy_codes.code_name)::text))))
                                                LEFT JOIN invasivesbc.code_header management_efficacy_code_header ON ((
                                                    ((management_efficacy_code_header.code_header_title)::text =
                                                     'management_efficacy_code'::text) AND
                                                    (management_efficacy_code_header.valid_to IS NULL))))
                                                LEFT JOIN invasivesbc.code management_efficacy_codes ON ((
                                                    (management_efficacy_codes.code_header_id =
                                                     management_efficacy_code_header.code_header_id) AND
                                                    ((a.monitoring_array #>> '{management_efficacy_rating}'::text[]) =
                                                     (management_efficacy_codes.code_name)::text)))))
        SELECT c.activity_incoming_data_id,
               c.activity_id,
               c.short_id,
               c.project_code,
               c.activity_date_time,
               c.reported_area_sqm,
               c.latitude,
               c.longitude,
               c.utm_zone,
               c.utm_easting,
               c.utm_northing,
               c.employer_description                                           AS employer,
               c.funding_agency,
               c.jurisdiction,
               c.access_description,
               c.location_description,
               c.comment,
               c.observation_person,
               COALESCE(j.terrestrial_invasive_plant, j.aquatic_invasive_plant) AS invasive_plant,
               j.treatment_efficacy_rating,
               j.management_efficacy_rating,
               j.evidence_of_treatment,
               j.invasive_plants_on_site,
               j.treatment_pass,
               j.comment                                                        AS monitor_comment,
               c.elevation,
               c.well_proximity,
               c.biogeoclimatic_zones,
               c.regional_invasive_species_organization_areas,
               c.invasive_plant_management_areas,
               c.ownership,
               c.regional_districts,
               c.flnro_districts,
               c.moti_districts,
               c.photo,
               c.created_timestamp,
               c.received_timestamp,
               public.st_astext(c.geog)                                         AS geography
        FROM (common_fields c
            LEFT JOIN mechanical_monitoring_json j ON ((j.activity_incoming_data_id = c.activity_incoming_data_id)));
        CREATE VIEW invasivesbc.monitoring_summary AS
        SELECT activity_incoming_data.activity_id,
               activity_incoming_data.activity_subtype  AS monitoring_type,
               ((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) ->
                 'acitivity_subtype_data'::text) ->
                'efficacy_code'::text)                  AS efficacy_code,
               activity_incoming_data.version,
               ((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) -> 'activity_data'::text) ->
                'activity_date_time'::text)             AS activity_date_time,
               activity_incoming_data.created_timestamp AS submitted_time,
               activity_incoming_data.received_timestamp,
               activity_incoming_data.deleted_timestamp,
               activity_incoming_data.biogeoclimatic_zones,
               activity_incoming_data.regional_invasive_species_organization_areas,
               activity_incoming_data.invasive_plant_management_areas,
               activity_incoming_data.ownership,
               activity_incoming_data.regional_districts,
               activity_incoming_data.flnro_districts,
               activity_incoming_data.moti_districts,
               activity_incoming_data.elevation,
               activity_incoming_data.well_proximity,
               activity_incoming_data.utm_zone,
               activity_incoming_data.utm_northing,
               activity_incoming_data.utm_easting,
               activity_incoming_data.albers_northing,
               activity_incoming_data.albers_easting,
               ((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) -> 'activity_data'::text) ->
                'latitude'::text)                       AS latitude,
               ((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) -> 'activity_data'::text) ->
                'longitude'::text)                      AS longitude,
               ((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) -> 'activity_data'::text) ->
                'reported_area'::text)                  AS reported_area,
               ((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) -> 'activity_data'::text) ->
                'invasive_species_agency_code'::text)   AS invasive_species_agency_code,
               ((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) -> 'activity_data'::text) ->
                'general_comment'::text)                AS general_comment,
               ((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) -> 'activity_data'::text) ->
                'access_description'::text)             AS access_description,
               ((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) -> 'activity_data'::text) ->
                'jurisdictions'::text)                  AS jurisdictions,
               ((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) -> 'activity_data'::text) ->
                'project_code'::text)                   AS project_code,
               activity_incoming_data.geom,
               activity_incoming_data.geog,
               activity_incoming_data.media_keys,
               ((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) ->
                 'activity_type_data'::text) ->
                'observer_last_name'::text)             AS primary_user_last_name,
               ((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) ->
                 'activity_type_data'::text) ->
                'observer_first_name'::text)            AS primary_user_first_name,
               ((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) ->
                 'acitivity_subtype_data'::text) ->
                'invasive_plant_code'::text)            AS invasive_plant_code,
               ((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) -> 'activity_data'::text) ->
                'general_comment'::text)                AS general_observation_comment__needs_verify
        FROM invasivesbc.activity_incoming_data
        WHERE (((activity_incoming_data.activity_type)::text = 'Monitoring'::text) AND
               (activity_incoming_data.deleted_timestamp IS NULL));
        COMMENT ON VIEW invasivesbc.monitoring_summary IS 'View on fields common to all types of observations, with table activity_incoming_data as source.';
        CREATE VIEW invasivesbc.observation_summary AS
        SELECT activity_incoming_data.activity_id,
               activity_incoming_data.activity_subtype  AS observation_type,
               activity_incoming_data.version,
               ((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) -> 'activity_data'::text) ->
                'activity_date_time'::text)             AS activity_date_time,
               activity_incoming_data.created_timestamp AS submitted_time,
               activity_incoming_data.received_timestamp,
               activity_incoming_data.deleted_timestamp,
               activity_incoming_data.biogeoclimatic_zones,
               activity_incoming_data.regional_invasive_species_organization_areas,
               activity_incoming_data.invasive_plant_management_areas,
               activity_incoming_data.ownership,
               activity_incoming_data.regional_districts,
               activity_incoming_data.flnro_districts,
               activity_incoming_data.moti_districts,
               activity_incoming_data.elevation,
               activity_incoming_data.well_proximity,
               activity_incoming_data.utm_zone,
               activity_incoming_data.utm_northing,
               activity_incoming_data.utm_easting,
               activity_incoming_data.albers_northing,
               activity_incoming_data.albers_easting,
               ((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) -> 'activity_data'::text) ->
                'latitude'::text)                       AS latitude,
               ((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) -> 'activity_data'::text) ->
                'longitude'::text)                      AS longitude,
               ((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) -> 'activity_data'::text) ->
                'reported_area'::text)                  AS reported_area,
               ((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) -> 'activity_data'::text) ->
                'invasive_species_agency_code'::text)   AS invasive_species_agency_code,
               ((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) -> 'activity_data'::text) ->
                'general_comment'::text)                AS general_comment,
               ((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) -> 'activity_data'::text) ->
                'access_description'::text)             AS access_description,
               ((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) -> 'activity_data'::text) ->
                'jurisdictions'::text)                  AS jurisdictions,
               ((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) -> 'activity_data'::text) ->
                'project_code'::text)                   AS project_code,
               activity_incoming_data.geom,
               activity_incoming_data.geog,
               activity_incoming_data.media_keys,
               ((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) ->
                 'activity_type_data'::text) ->
                'negative_obs_ind'::text)               AS negative_observation_ind,
               ((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) ->
                 'activity_type_data'::text) ->
                'observer_last_name'::text)             AS primary_user_last_name,
               ((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) ->
                 'activity_type_data'::text) ->
                'observer_first_name'::text)            AS primary_user_first_name,
               ((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) ->
                 'acitivity_subtype_data'::text) ->
                'invasive_plant_code'::text)            AS invasive_plant_code,
               ((activity_incoming_data.activity_payload)::json ->
                'location_comment'::text)               AS location_comment__needs_verify,
               ((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) -> 'activity_data'::text) ->
                'general_comment'::text)                AS general_observation_comment__needs_verify
        FROM invasivesbc.activity_incoming_data
        WHERE (((activity_incoming_data.activity_type)::text = 'Observation'::text) AND
               (activity_incoming_data.deleted_timestamp IS NULL));
        COMMENT ON VIEW invasivesbc.observation_summary IS 'View on fields common to all types of observations, with table activity_incoming_data as source.';
        CREATE VIEW invasivesbc.observation_aquaticplant_summary AS
        SELECT record.activity_id,
               aid.version,
               aid.biogeoclimatic_zones,
               aid.regional_invasive_species_organization_areas,
               aid.invasive_plant_management_areas,
               aid.ownership,
               aid.regional_districts,
               aid.flnro_districts,
               aid.moti_districts,
               aid.elevation,
               aid.well_proximity,
               aid.utm_zone,
               aid.utm_northing,
               aid.utm_easting,
               aid.albers_northing,
               aid.albers_easting,
               aid.latitude,
               aid.longitude,
               aid.reported_area,
               aid.invasive_species_agency_code,
               aid.general_comment,
               aid.access_description,
               aid.jurisdictions,
               aid.project_code,
               aid.geom,
               aid.geog,
               aid.media_keys,
               invasive_plant_codes.code_description     AS invasive_plant,
               record.invasive_plant_code,
               specific_use_codes.code_description       AS specific_use,
               record.specific_use_code,
               proposed_treatment_codes.code_description AS proposed_treatment,
               record.proposed_treatment_code,
               record.flowering,
               plant_life_stage_codes.code_description   AS plant_life_stage,
               record.plant_life_stage_code,
               plant_health_codes.code_description       AS plant_health,
               record.plant_health_code,
               plant_seed_stage_codes.code_description   AS plant_seed_stage,
               record.plant_seed_stage_code,
               record.range_unit_number,
               record.legacy_site_ind,
               record.early_detection_rapid_resp_ind,
               record.research_detection_ind,
               record.sample_point_number,
               record.special_care_ind,
               record.biological_ind,
               record.secchi_depth,
               record.water_depth,
               record.voucher_submitted_ind,
               record.voucher_submission_detail
        FROM (((((((((((((invasivesbc.activity_observation_aquaticplant_with_codes record
            JOIN invasivesbc.observation_summary aid ON ((aid.activity_id = record.activity_id)))
            LEFT JOIN invasivesbc.code_header invasive_plant_code_header
                         ON ((((invasive_plant_code_header.code_header_title)::text = 'invasive_plant_code'::text) AND
                              (invasive_plant_code_header.valid_to IS NULL))))
            LEFT JOIN invasivesbc.code invasive_plant_codes
                        ON (((invasive_plant_codes.code_header_id = invasive_plant_code_header.code_header_id) AND
                             (record.invasive_plant_code = (invasive_plant_codes.code_name)::text))))
            LEFT JOIN invasivesbc.code_header proposed_treatment_code_header
                       ON ((((proposed_treatment_code_header.code_header_title)::text =
                             'proposed_treatment_code'::text) AND
                            (proposed_treatment_code_header.valid_to IS NULL))))
            LEFT JOIN invasivesbc.code proposed_treatment_codes
                      ON (((proposed_treatment_codes.code_header_id = proposed_treatment_code_header.code_header_id) AND
                           (record.proposed_treatment_code = (proposed_treatment_codes.code_name)::text))))
            LEFT JOIN invasivesbc.code_header specific_use_code_header
                     ON ((((specific_use_code_header.code_header_title)::text = 'specific_use_code'::text) AND
                          (specific_use_code_header.valid_to IS NULL))))
            LEFT JOIN invasivesbc.code specific_use_codes
                    ON (((specific_use_codes.code_header_id = specific_use_code_header.code_header_id) AND
                         (record.specific_use_code = (specific_use_codes.code_name)::text))))
            LEFT JOIN invasivesbc.code_header plant_life_stage_code_header
                   ON ((((plant_life_stage_code_header.code_header_title)::text = 'plant_life_stage_code'::text) AND
                        (plant_life_stage_code_header.valid_to IS NULL))))
            LEFT JOIN invasivesbc.code plant_life_stage_codes
                  ON (((plant_life_stage_codes.code_header_id = plant_life_stage_code_header.code_header_id) AND
                       (record.plant_life_stage_code = (plant_life_stage_codes.code_name)::text))))
            LEFT JOIN invasivesbc.code_header plant_health_code_header
                 ON ((((plant_health_code_header.code_header_title)::text = 'plant_health_code'::text) AND
                      (plant_health_code_header.valid_to IS NULL))))
            LEFT JOIN invasivesbc.code plant_health_codes
                ON (((plant_health_codes.code_header_id = plant_health_code_header.code_header_id) AND
                     (record.plant_health_code = (plant_health_codes.code_name)::text))))
            LEFT JOIN invasivesbc.code_header plant_seed_stage_code_header
               ON ((((plant_seed_stage_code_header.code_header_title)::text = 'plant_seed_stage_code'::text) AND
                    (plant_seed_stage_code_header.valid_to IS NULL))))
            LEFT JOIN invasivesbc.code plant_seed_stage_codes
              ON (((plant_seed_stage_codes.code_header_id = plant_seed_stage_code_header.code_header_id) AND
                   (record.plant_seed_stage_code = (plant_seed_stage_codes.code_name)::text))));
        CREATE VIEW invasivesbc.observation_terrestrialplant AS
        SELECT record.activity_id,
               summary.version,
               summary.activity_date_time,
               summary.submitted_time,
               summary.received_timestamp,
               summary.deleted_timestamp,
               summary.biogeoclimatic_zones,
               summary.regional_invasive_species_organization_areas,
               summary.invasive_plant_management_areas,
               summary.ownership,
               summary.regional_districts,
               summary.flnro_districts,
               summary.moti_districts,
               summary.elevation,
               summary.well_proximity,
               summary.utm_zone,
               summary.utm_northing,
               summary.utm_easting,
               summary.albers_northing,
               summary.albers_easting,
               summary.latitude,
               summary.longitude,
               summary.reported_area,
               summary.invasive_species_agency_code,
               summary.general_comment,
               summary.access_description,
               summary.jurisdictions,
               summary.project_code,
               summary.geom,
               summary.geog,
               summary.media_keys,
               invasive_plant_codes.code_description              AS invasive_plant,
               record.invasive_plant_code,
               invasive_plant_density_codes.code_description      AS invasive_plant_density,
               record.invasive_plant_density_code,
               invasive_plant_distribution_codes.code_description AS invasive_plant_distribution,
               record.invasive_plant_distribution_code,
               soil_texture_codes.code_description                AS soil_texture,
               record.soil_texture_code,
               specific_use_codes.code_description                AS specific_use,
               record.specific_use_code,
               slope_codes.code_description                       AS slope,
               record.slope_code,
               aspect_codes.code_description                      AS aspect,
               record.aspect_code,
               proposed_treatment_codes.code_description          AS proposed_treatment,
               record.proposed_treatment_code,
               record.range_unit_number,
               plant_life_stage_codes.code_description            AS plant_life_stage,
               record.plant_life_stage_code,
               plant_health_codes.code_description                AS plant_health,
               record.plant_health_code,
               plant_seed_stage_codes.code_description            AS plant_seed_stage,
               record.plant_seed_stage_code,
               record.flowering,
               record.legacy_site_ind,
               record.early_detection_rapid_resp_ind,
               record.research_detection_ind,
               record.well_ind,
               record.special_care_ind,
               record.biological_ind
        FROM (((((((((((((((((((((((invasivesbc.activity_observation_terrestrialplant_with_codes record
            JOIN invasivesbc.observation_summary summary ON ((summary.activity_id = record.activity_id)))
            LEFT JOIN invasivesbc.code_header invasive_plant_code_header
                                   ON ((((invasive_plant_code_header.code_header_title)::text =
                                         'invasive_plant_code'::text) AND
                                        (invasive_plant_code_header.valid_to IS NULL))))
            LEFT JOIN invasivesbc.code invasive_plant_codes
                                  ON (((invasive_plant_codes.code_header_id =
                                        invasive_plant_code_header.code_header_id) AND
                                       (record.invasive_plant_code = (invasive_plant_codes.code_name)::text))))
            LEFT JOIN invasivesbc.code_header invasive_plant_density_code_header ON ((
                ((invasive_plant_density_code_header.code_header_title)::text = 'invasive_plant_density_code'::text) AND
                (invasive_plant_density_code_header.valid_to IS NULL))))
            LEFT JOIN invasivesbc.code invasive_plant_density_codes ON ((
                (invasive_plant_density_codes.code_header_id = invasive_plant_density_code_header.code_header_id) AND
                (record.invasive_plant_density_code = (invasive_plant_density_codes.code_name)::text))))
            LEFT JOIN invasivesbc.code_header invasive_plant_distribution_code_header ON ((
                ((invasive_plant_distribution_code_header.code_header_title)::text =
                 'invasive_plant_distribution_code'::text) AND
                (invasive_plant_distribution_code_header.valid_to IS NULL))))
            LEFT JOIN invasivesbc.code invasive_plant_distribution_codes ON ((
                (invasive_plant_distribution_codes.code_header_id =
                 invasive_plant_distribution_code_header.code_header_id) AND
                (record.invasive_plant_distribution_code = (invasive_plant_distribution_codes.code_name)::text))))
            LEFT JOIN invasivesbc.code_header soil_texture_code_header
                             ON ((((soil_texture_code_header.code_header_title)::text = 'soil_texture_code'::text) AND
                                  (soil_texture_code_header.valid_to IS NULL))))
            LEFT JOIN invasivesbc.code soil_texture_codes
                            ON (((soil_texture_codes.code_header_id = soil_texture_code_header.code_header_id) AND
                                 (record.soil_texture_code = (soil_texture_codes.code_name)::text))))
            LEFT JOIN invasivesbc.code_header specific_use_code_header
                           ON ((((specific_use_code_header.code_header_title)::text = 'specific_use_code'::text) AND
                                (specific_use_code_header.valid_to IS NULL))))
            LEFT JOIN invasivesbc.code specific_use_codes
                          ON (((specific_use_codes.code_header_id = specific_use_code_header.code_header_id) AND
                               (record.specific_use_code = (specific_use_codes.code_name)::text))))
            LEFT JOIN invasivesbc.code_header slope_code_header
                         ON ((((slope_code_header.code_header_title)::text = 'slope_code'::text) AND
                              (slope_code_header.valid_to IS NULL))))
            LEFT JOIN invasivesbc.code slope_codes
                        ON (((slope_codes.code_header_id = slope_code_header.code_header_id) AND
                             (record.slope_code = (slope_codes.code_name)::text))))
            LEFT JOIN invasivesbc.code_header aspect_code_header
                       ON ((((aspect_code_header.code_header_title)::text = 'aspect_code'::text) AND
                            (aspect_code_header.valid_to IS NULL))))
            LEFT JOIN invasivesbc.code aspect_codes
                      ON (((aspect_codes.code_header_id = aspect_code_header.code_header_id) AND
                           (record.aspect_code = (aspect_codes.code_name)::text))))
            LEFT JOIN invasivesbc.code_header proposed_treatment_code_header
                     ON ((((proposed_treatment_code_header.code_header_title)::text =
                           'proposed_treatment_code'::text) AND
                          (proposed_treatment_code_header.valid_to IS NULL))))
            LEFT JOIN invasivesbc.code proposed_treatment_codes
                    ON (((proposed_treatment_codes.code_header_id = proposed_treatment_code_header.code_header_id) AND
                         (record.proposed_treatment_code = (proposed_treatment_codes.code_name)::text))))
            LEFT JOIN invasivesbc.code_header plant_life_stage_code_header
                   ON ((((plant_life_stage_code_header.code_header_title)::text = 'plant_life_stage_code'::text) AND
                        (plant_life_stage_code_header.valid_to IS NULL))))
            LEFT JOIN invasivesbc.code plant_life_stage_codes
                  ON (((plant_life_stage_codes.code_header_id = plant_life_stage_code_header.code_header_id) AND
                       (record.plant_life_stage_code = (plant_life_stage_codes.code_name)::text))))
            LEFT JOIN invasivesbc.code_header plant_health_code_header
                 ON ((((plant_health_code_header.code_header_title)::text = 'plant_health_code'::text) AND
                      (plant_health_code_header.valid_to IS NULL))))
            LEFT JOIN invasivesbc.code plant_health_codes
                ON (((plant_health_codes.code_header_id = plant_health_code_header.code_header_id) AND
                     (record.plant_health_code = (plant_health_codes.code_name)::text))))
            LEFT JOIN invasivesbc.code_header plant_seed_stage_code_header
               ON ((((plant_seed_stage_code_header.code_header_title)::text = 'plant_seed_stage_code'::text) AND
                    (plant_seed_stage_code_header.valid_to IS NULL))))
            LEFT JOIN invasivesbc.code plant_seed_stage_codes
              ON (((plant_seed_stage_codes.code_header_id = plant_seed_stage_code_header.code_header_id) AND
                   (record.plant_seed_stage_code = (aspect_codes.code_name)::text))));
        COMMENT ON VIEW invasivesbc.observation_terrestrialplant IS 'View on terrestrial plant observation specific fields, with code table values resolved';
        CREATE VIEW invasivesbc.observations_by_species AS
        WITH spatial_expload_positive AS (SELECT activity_incoming_data.activity_type,
                                                 activity_incoming_data.activity_subtype,
                                                 activity_incoming_data.created_timestamp,
                                                 activity_incoming_data.activity_incoming_data_id,
                                                 jsonb_array_elements(activity_incoming_data.species_positive)     AS species,
                                                 public.st_makevalid(public.geometry(activity_incoming_data.geog)) AS geom
                                          FROM invasivesbc.activity_incoming_data
                                          WHERE (((activity_incoming_data.activity_type)::text = 'Observation'::text) AND
                                                 ((activity_incoming_data.form_status)::text = 'Submitted'::text) AND
                                                 (activity_incoming_data.activity_incoming_data_id IN
                                                  (SELECT activity_current.incoming_data_id
                                                   FROM invasivesbc.activity_current)) AND
                                                 (activity_incoming_data.species_positive IS NOT NULL) AND
                                                 ((activity_incoming_data.species_positive)::text !~~ '[null]'::text) AND
                                                 ((activity_incoming_data.species_positive)::text !~~ 'null'::text))),
             spatial_positive AS (SELECT spatial_expload_positive.activity_type,
                                         spatial_expload_positive.activity_subtype,
                                         spatial_expload_positive.created_timestamp,
                                         spatial_expload_positive.activity_incoming_data_id,
                                         spatial_expload_positive.species,
                                         CASE
                                             WHEN (public.st_geometrytype(spatial_expload_positive.geom) =
                                                   'ST_Point'::text)
                                                 THEN (public.st_buffer(
                                                     (spatial_expload_positive.geom)::public.geography,
                                                     (0.56425)::double precision,
                                                     'quad_segs=30'::text))::public.geometry
                                             ELSE spatial_expload_positive.geom
                                             END AS geom
                                  FROM spatial_expload_positive),
             spatial_expload_negative AS (SELECT activity_incoming_data.activity_subtype,
                                                 activity_incoming_data.created_timestamp,
                                                 activity_incoming_data.activity_incoming_data_id,
                                                 jsonb_array_elements(activity_incoming_data.species_negative)     AS species,
                                                 public.st_makevalid(public.geometry(activity_incoming_data.geog)) AS geom
                                          FROM invasivesbc.activity_incoming_data
                                          WHERE (((activity_incoming_data.activity_type)::text = 'Observation'::text) AND
                                                 ((activity_incoming_data.form_status)::text = 'Submitted'::text) AND
                                                 (activity_incoming_data.activity_incoming_data_id IN
                                                  (SELECT activity_current.incoming_data_id
                                                   FROM invasivesbc.activity_current)) AND
                                                 (activity_incoming_data.species_negative IS NOT NULL) AND
                                                 ((activity_incoming_data.species_negative)::text !~~ '[null]'::text) AND
                                                 ((activity_incoming_data.species_negative)::text !~~ 'null'::text))),
             spatial_negative AS (SELECT spatial_expload_negative.activity_subtype,
                                         spatial_expload_negative.created_timestamp,
                                         spatial_expload_negative.activity_incoming_data_id,
                                         spatial_expload_negative.species,
                                         CASE
                                             WHEN (public.st_geometrytype(spatial_expload_negative.geom) =
                                                   'ST_Point'::text)
                                                 THEN (public.st_buffer(
                                                     (spatial_expload_negative.geom)::public.geography,
                                                     (0.56425)::double precision,
                                                     'quad_segs=30'::text))::public.geometry
                                             ELSE spatial_expload_negative.geom
                                             END AS geom
                                  FROM spatial_expload_negative),
             spatial_positive_negative AS (SELECT row_number() OVER ()           AS ctid,
                                                  (pos.species #>> '{}'::text[]) AS species,
                                                  pos.activity_type,
                                                  pos.created_timestamp,
                                                  pos.activity_incoming_data_id,
                                                  CASE
                                                      WHEN public.st_intersects(pos.geom, neg.geom)
                                                          THEN public.st_difference(pos.geom, neg.geom)
                                                      ELSE pos.geom
                                                      END                        AS geom
                                           FROM (spatial_positive pos
                                               LEFT JOIN spatial_negative neg
                                                 ON ((public.st_intersects(pos.geom, neg.geom) AND
                                                      (pos.species = neg.species) AND
                                                      (pos.created_timestamp < neg.created_timestamp))))),
             spatial_full_overlap AS (SELECT t.activity_incoming_data_id,
                                             t.species,
                                             public.st_area((t.geom)::public.geography, true) AS area,
                                             t.geom,
                                             t.created_timestamp,
                                             t.activity_type
                                      FROM (spatial_positive_negative t
                                          JOIN (SELECT a.activity_incoming_data_id,
                                                       min(public.st_area((a.geom)::public.geography, true)) AS area
                                                FROM spatial_positive_negative a,
                                                     spatial_positive_negative b
                                                WHERE ((a.species = b.species) AND
                                                       public.st_contains(a.geom, b.geom) AND
                                                       (a.ctid <> b.ctid) AND
                                                       (a.activity_incoming_data_id = b.activity_incoming_data_id))
                                                GROUP BY a.activity_incoming_data_id) m
                                            ON ((t.activity_incoming_data_id = m.activity_incoming_data_id)))
                                      WHERE (public.st_area((t.geom)::public.geography, true) = m.area)),
             spatial_partial_overlap AS (SELECT a.activity_incoming_data_id,
                                                a.species,
                                                public.st_intersection(a.geom, b.geom) AS geom,
                                                a.created_timestamp,
                                                a.activity_type
                                         FROM spatial_positive_negative a,
                                              spatial_positive_negative b
                                         WHERE ((a.species = b.species) AND public.st_intersects(a.geom, b.geom) AND
                                                (a.ctid <> b.ctid) AND
                                                (a.activity_incoming_data_id = b.activity_incoming_data_id) AND
                                                (NOT (a.activity_incoming_data_id IN
                                                      (SELECT a_1.activity_incoming_data_id
                                                       FROM spatial_positive_negative a_1,
                                                            spatial_positive_negative b_1
                                                       WHERE ((a_1.species = b_1.species) AND
                                                              public.st_contains(a_1.geom, b_1.geom) AND
                                                              (a_1.ctid <> b_1.ctid) AND
                                                              (a_1.activity_incoming_data_id = b_1.activity_incoming_data_id))
                                                       GROUP BY a_1.activity_incoming_data_id))))
                                         GROUP BY a.activity_incoming_data_id, a.species, a.geom, b.geom,
                                                  a.created_timestamp,
                                                  a.activity_type),
             spatial_others AS (SELECT spatial_positive_negative.activity_incoming_data_id,
                                       spatial_positive_negative.species,
                                       spatial_positive_negative.geom,
                                       spatial_positive_negative.created_timestamp,
                                       spatial_positive_negative.activity_type
                                FROM spatial_positive_negative
                                WHERE (NOT (spatial_positive_negative.activity_incoming_data_id IN
                                            (SELECT a.activity_incoming_data_id
                                             FROM spatial_positive_negative a,
                                                  spatial_positive_negative b
                                             WHERE ((a.species = b.species) AND public.st_intersects(a.geom, b.geom) AND
                                                    (a.ctid <> b.ctid) AND
                                                    (a.activity_incoming_data_id = b.activity_incoming_data_id))
                                             GROUP BY a.activity_incoming_data_id)))
                                UNION
                                SELECT spatial_full_overlap.activity_incoming_data_id,
                                       spatial_full_overlap.species,
                                       spatial_full_overlap.geom,
                                       spatial_full_overlap.created_timestamp,
                                       spatial_full_overlap.activity_type
                                FROM spatial_full_overlap
                                UNION
                                SELECT spatial_partial_overlap.activity_incoming_data_id,
                                       spatial_partial_overlap.species,
                                       spatial_partial_overlap.geom,
                                       spatial_partial_overlap.created_timestamp,
                                       spatial_partial_overlap.activity_type
                                FROM spatial_partial_overlap),
             spatial_union AS (SELECT spatial_others.species,
                                      invasive_plant_codes.code_description                       AS terrestrial_invasive_plant,
                                      invasive_plant_aquatic_codes.code_description               AS aquatic_invasive_plant,
                                      spatial_others.activity_type,
                                      max(spatial_others.created_timestamp)                       AS max_created_timestamp,
                                      array_agg(spatial_others.activity_incoming_data_id)         AS activity_ids,
                                      public.st_union(public.st_collectionextract(
                                              public.st_transform(spatial_others.geom, 3005), 3)) AS geom
                               FROM ((((spatial_others
                                   LEFT JOIN invasivesbc.code_header invasive_plant_code_header ON ((
                                       ((invasive_plant_code_header.code_header_title)::text =
                                        'invasive_plant_code'::text) AND
                                       (invasive_plant_code_header.valid_to IS NULL))))
                                   LEFT JOIN invasivesbc.code invasive_plant_codes ON ((
                                       (invasive_plant_codes.code_header_id =
                                        invasive_plant_code_header.code_header_id) AND
                                       (spatial_others.species = (invasive_plant_codes.code_name)::text))))
                                   LEFT JOIN invasivesbc.code_header invasive_plant_aquatic_code_header ON ((
                                       ((invasive_plant_aquatic_code_header.code_header_title)::text =
                                        'invasive_plant_aquatic_code'::text) AND
                                       (invasive_plant_aquatic_code_header.valid_to IS NULL))))
                                   LEFT JOIN invasivesbc.code invasive_plant_aquatic_codes ON ((
                                       (invasive_plant_aquatic_codes.code_header_id =
                                        invasive_plant_aquatic_code_header.code_header_id) AND
                                       (spatial_others.species = (invasive_plant_aquatic_codes.code_name)::text))))
                               GROUP BY spatial_others.species, invasive_plant_codes.code_description,
                                        invasive_plant_aquatic_codes.code_description, spatial_others.activity_type)
        SELECT spatial_union.species,
               COALESCE(spatial_union.terrestrial_invasive_plant,
                        spatial_union.aquatic_invasive_plant) AS invasive_plant,
               public.st_area(spatial_union.geom)             AS area_sqm,
               spatial_union.max_created_timestamp,
               spatial_union.geom
        FROM spatial_union
        WHERE (public.st_area(spatial_union.geom) > (0)::double precision);
        CREATE TABLE invasivesbc.planning_extract
        (
            planningid                             integer                 NOT NULL,
            site_id                                integer                 NOT NULL,
            site_paper_file_id                     character varying(20),
            district_lot_number                    character varying(6),
            jurisdictions                          character varying(1000) NOT NULL,
            site_created_date                      date                    NOT NULL,
            mapsheet                               character varying(10)   NOT NULL,
            utm_zone                               integer                 NOT NULL,
            utm_easting                            integer                 NOT NULL,
            utm_northing                           integer                 NOT NULL,
            decimal_latitude                       numeric(7, 5),
            decimal_longitude                      numeric(8, 5),
            biogeoclimatic_zone                    character varying(5)    NOT NULL,
            sub_zone                               character varying(5)    NOT NULL,
            variant                                integer,
            phase                                  character varying(5),
            site_series                            character varying(5),
            soil_texture                           character varying(120),
            site_specific_use                      character varying(120)  NOT NULL,
            invasive_plant                         character varying(100)  NOT NULL,
            activity                               character varying(120),
            agent_or_herbicide                     character varying(120),
            slope_percent                          integer,
            elevation                              integer,
            estimated_area_hectares                numeric(10, 4),
            distribution                           character varying(120),
            density                                character varying(120),
            survey_type                            character varying(120)  NOT NULL,
            plan_date                              date                    NOT NULL,
            agency                                 character varying(120)  NOT NULL,
            planned_activity_month                 character varying(120)  NOT NULL,
            site_location                          character varying(2000),
            site_comments                          character varying(2000),
            entered_by                             character varying(100)  NOT NULL,
            date_entered                           date                    NOT NULL,
            updated_by                             character varying(100)  NOT NULL,
            date_updated                           date                    NOT NULL,
            regional_district                      character varying(200),
            regional_invasive_species_organization character varying(200),
            invasive_plant_management_area         character varying(200)
        );
        CREATE TABLE invasivesbc.point_of_interest_incoming_data
        (
            point_of_interest_incoming_data_id           integer                                                       NOT NULL,
            point_of_interest_id                         integer                                                       NOT NULL,
            version                                      integer,
            point_of_interest_type                       character varying(200),
            point_of_interest_subtype                    character varying(200),
            received_timestamp                           timestamp without time zone DEFAULT now()                     NOT NULL,
            geom                                         public.geometry(Geometry, 3005),
            geog                                         public.geography(Geometry, 4326),
            point_of_interest_payload                    jsonb,
            biogeoclimatic_zones                         character varying(30),
            regional_invasive_species_organization_areas character varying(10),
            invasive_plant_management_areas              character varying(50),
            forest_cover_ownership                       character varying(100),
            regional_districts                           character varying(100),
            flnro_districts                              character varying(100),
            moti_districts                               character varying(100),
            media_keys                                   text[],
            species_positive                             character varying[]         DEFAULT '{}'::character varying[] NOT NULL,
            species_negative                             character varying[]         DEFAULT '{}'::character varying[] NOT NULL,
            CONSTRAINT point_of_interest_incoming_data_geom_check CHECK (public.st_isvalid(geom))
        );
        COMMENT ON TABLE invasivesbc.point_of_interest_incoming_data IS 'Store all incoming data if valid. All mandatory columns must be preset (type & geometry). This is a staging area for further propagation and acts as a source of truth for all field data.';
        COMMENT ON COLUMN invasivesbc.point_of_interest_incoming_data.point_of_interest_incoming_data_id IS 'Auto generated primary key';
        COMMENT ON COLUMN invasivesbc.point_of_interest_incoming_data.point_of_interest_id IS 'Unique record number. Can occur multiple times with record updates.';
        COMMENT ON COLUMN invasivesbc.point_of_interest_incoming_data.version IS 'Indicative of the version for each unique record. Calculated server side.';
        COMMENT ON COLUMN invasivesbc.point_of_interest_incoming_data.point_of_interest_type IS 'Type of record';
        COMMENT ON COLUMN invasivesbc.point_of_interest_incoming_data.point_of_interest_subtype IS 'Sub Type of record';
        COMMENT ON COLUMN invasivesbc.point_of_interest_incoming_data.received_timestamp IS 'The date and time data was received and inserted into the database.';
        COMMENT ON COLUMN invasivesbc.point_of_interest_incoming_data.geom IS 'Geometry in Albers projection.';
        COMMENT ON COLUMN invasivesbc.point_of_interest_incoming_data.geog IS 'Geography type containing a geometry.';
        COMMENT ON COLUMN invasivesbc.point_of_interest_incoming_data.point_of_interest_payload IS 'Raw data upload in compressed JSON format.';
        COMMENT ON COLUMN invasivesbc.point_of_interest_incoming_data.biogeoclimatic_zones IS 'Biogeoclimatic Ecosystem Classification (BEC) Zone/Subzone/Variant/Phase';
        COMMENT ON COLUMN invasivesbc.point_of_interest_incoming_data.regional_invasive_species_organization_areas IS 'Regional Invasive Species Organizations (RISO) are non-profit societies in BC that provide invasive species education and management under the collective Invasive Species Council of BC.';
        COMMENT ON COLUMN invasivesbc.point_of_interest_incoming_data.invasive_plant_management_areas IS 'Regional Invasive Species Organizations (RISO) are non-profit societies in BC that provide invasive species education and management under the collective Invasive Species Council of BC. Within several RISO areas, they subdivide the land area in smaller management areas (Invasive Plant Management Areas).';
        COMMENT ON COLUMN invasivesbc.point_of_interest_incoming_data.forest_cover_ownership IS 'This data product is a generalized description of the primary ownership of forest lands for use in strategic decision making such as Timber Supply Analysis. It is based upon the structure used in the Forest Inventory Planning (FIP/FC1) format. It is created and revised using information from Min of Agriculture and Lands Registries Branch.';
        COMMENT ON COLUMN invasivesbc.point_of_interest_incoming_data.regional_districts IS 'Regional districts of British Columbia: https://catalogue.data.gov.bc.ca/dataset/d1aff64e-dbfe-45a6-af97-582b7f6418b9';
        COMMENT ON COLUMN invasivesbc.point_of_interest_incoming_data.flnro_districts IS 'Ministry of Forest Lands and Natural Resources districts';
        COMMENT ON COLUMN invasivesbc.point_of_interest_incoming_data.moti_districts IS 'Ministry of Transportation and Infrastructure districts';
        COMMENT ON COLUMN invasivesbc.point_of_interest_incoming_data.media_keys IS 'Array of keys used to fetch original files from external storage';
        COMMENT ON COLUMN invasivesbc.point_of_interest_incoming_data.species_positive IS 'List of species associated with the record';
        COMMENT ON COLUMN invasivesbc.point_of_interest_incoming_data.species_negative IS 'List of species negatively associated with the record. (Designated negative occurrences)';
        CREATE SEQUENCE invasivesbc.point_of_interest_incoming_da_point_of_interest_incoming_da_seq
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;
        ALTER SEQUENCE invasivesbc.point_of_interest_incoming_da_point_of_interest_incoming_da_seq OWNED BY invasivesbc.point_of_interest_incoming_data.point_of_interest_incoming_data_id;
        CREATE SEQUENCE invasivesbc.point_of_interest_incoming_data_point_of_interest_id_seq
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;
        ALTER SEQUENCE invasivesbc.point_of_interest_incoming_data_point_of_interest_id_seq OWNED BY invasivesbc.point_of_interest_incoming_data.point_of_interest_id;
        CREATE TABLE invasivesbc.provincial_boundary
        (
            id   integer DEFAULT 1,
            geog public.geography(Polygon, 4326) NOT NULL,
            CONSTRAINT single_row_constraint CHECK ((id = 1))
        );
        CREATE VIEW invasivesbc.regional_districts_species_area AS
        WITH jurisdiction_species_dump AS (SELECT j.invasive_plant,
                                                  j.regional_districts,
                                                  j.jurisdiction,
                                                  ((public.st_dump(j.geom)).geom)::public.geometry(Polygon, 3005) AS geom
                                           FROM invasivesbc.jurisdiction_species j)
        SELECT i.invasive_plant,
               i.regional_districts,
               i.jurisdiction,
               public.st_area(public.st_multi(public.st_union(i.geom))) AS area_sqm
        FROM jurisdiction_species_dump i
        GROUP BY i.invasive_plant, i.regional_districts, i.jurisdiction;
        CREATE VIEW invasivesbc.riso_species_area AS
        WITH jurisdiction_species_dump AS (SELECT j.invasive_plant,
                                                  j.regional_invasive_species_organization_areas,
                                                  j.jurisdiction,
                                                  ((public.st_dump(j.geom)).geom)::public.geometry(Polygon, 3005) AS geom
                                           FROM invasivesbc.jurisdiction_species j)
        SELECT i.invasive_plant,
               i.regional_invasive_species_organization_areas,
               i.jurisdiction,
               public.st_area(public.st_multi(public.st_union(i.geom))) AS area_sqm
        FROM jurisdiction_species_dump i
        GROUP BY i.invasive_plant, i.regional_invasive_species_organization_areas, i.jurisdiction;
        CREATE SEQUENCE invasivesbc.species_ref_raw_species_id_seq
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;
        ALTER SEQUENCE invasivesbc.species_ref_raw_species_id_seq OWNED BY invasivesbc.species_ref_raw.species_id;
        CREATE VIEW invasivesbc.treatment_summary AS
        SELECT activity_incoming_data.activity_id,
               activity_incoming_data.activity_subtype  AS observation_type,
               activity_incoming_data.version,
               ((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) -> 'activity_data'::text) ->
                'activity_date_time'::text)             AS activity_date_time,
               activity_incoming_data.created_timestamp AS submitted_time,
               activity_incoming_data.received_timestamp,
               activity_incoming_data.deleted_timestamp,
               activity_incoming_data.biogeoclimatic_zones,
               activity_incoming_data.regional_invasive_species_organization_areas,
               activity_incoming_data.invasive_plant_management_areas,
               activity_incoming_data.ownership,
               activity_incoming_data.regional_districts,
               activity_incoming_data.flnro_districts,
               activity_incoming_data.moti_districts,
               activity_incoming_data.elevation,
               activity_incoming_data.well_proximity,
               activity_incoming_data.utm_zone,
               activity_incoming_data.utm_northing,
               activity_incoming_data.utm_easting,
               activity_incoming_data.albers_northing,
               activity_incoming_data.albers_easting,
               ((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) -> 'activity_data'::text) ->
                'latitude'::text)                       AS latitude,
               ((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) -> 'activity_data'::text) ->
                'longitude'::text)                      AS longitude,
               ((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) -> 'activity_data'::text) ->
                'reported_area'::text)                  AS reported_area,
               ((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) -> 'activity_data'::text) ->
                'invasive_species_agency_code'::text)   AS invasive_species_agency_code,
               ((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) -> 'activity_data'::text) ->
                'general_comment'::text)                AS general_comment,
               ((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) -> 'activity_data'::text) ->
                'access_description'::text)             AS access_description,
               ((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) -> 'activity_data'::text) ->
                'jurisdictions'::text)                  AS jurisdictions,
               ((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) -> 'activity_data'::text) ->
                'project_code'::text)                   AS project_code,
               activity_incoming_data.geom,
               activity_incoming_data.geog,
               activity_incoming_data.media_keys,
               ((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) ->
                 'activity_type_data'::text) ->
                'observer_last_name'::text)             AS primary_user_last_name,
               ((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) ->
                 'activity_type_data'::text) ->
                'observer_first_name'::text)            AS primary_user_first_name,
               ((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) ->
                 'acitivity_subtype_data'::text) ->
                'invasive_plant_code'::text)            AS invasive_plant_code,
               ((((activity_incoming_data.activity_payload)::json -> 'form_data'::text) -> 'activity_data'::text) ->
                'general_comment'::text)                AS general_observation_comment__needs_verify
        FROM invasivesbc.activity_incoming_data
        WHERE (((activity_incoming_data.activity_type)::text = 'Treatment'::text) AND
               (activity_incoming_data.deleted_timestamp IS NULL));
        COMMENT ON VIEW invasivesbc.treatment_summary IS 'View on fields common to all types of observations, with table activity_incoming_data as source.';
        CREATE VIEW invasivesbc.treatment_biological_terrestrialplant AS
        SELECT record.activity_id,
               summary.version,
               summary.activity_date_time,
               summary.submitted_time,
               summary.received_timestamp,
               summary.deleted_timestamp,
               summary.biogeoclimatic_zones,
               summary.regional_invasive_species_organization_areas,
               summary.invasive_plant_management_areas,
               summary.ownership,
               summary.regional_districts,
               summary.flnro_districts,
               summary.moti_districts,
               summary.elevation,
               summary.well_proximity,
               summary.utm_zone,
               summary.utm_northing,
               summary.utm_easting,
               summary.albers_northing,
               summary.albers_easting,
               summary.latitude,
               summary.longitude,
               summary.reported_area,
               summary.invasive_species_agency_code,
               summary.general_comment,
               summary.access_description,
               summary.jurisdictions,
               summary.project_code,
               summary.geom,
               summary.geog,
               summary.media_keys,
               record.invasive_plant_code,
               invasive_plant_codes.code_description           AS invasive_plant,
               record.classified_area_code,
               classified_area_codes.code_description          AS classified_area,
               record.applicator1_licence_number,
               record.agent_source,
               biological_agent_codes.code_description         AS biological_agent,
               record.biological_agent_stage_code,
               record.bioagent_maturity_status_code,
               bioagent_maturity_status_codes.code_description AS bioagent_maturity_status
        FROM (((((((((((invasivesbc.activity_treatment_biological_terrestrialplant_with_codes record
            JOIN invasivesbc.treatment_summary summary ON ((summary.activity_id = record.activity_id)))
            LEFT JOIN invasivesbc.code_header invasive_plant_code_header
                       ON ((((invasive_plant_code_header.code_header_title)::text = 'invasive_plant_code'::text) AND
                            (invasive_plant_code_header.valid_to IS NULL))))
            LEFT JOIN invasivesbc.code invasive_plant_codes
                      ON (((invasive_plant_codes.code_header_id = invasive_plant_code_header.code_header_id) AND
                           (record.invasive_plant_code = (invasive_plant_codes.code_name)::text))))
            LEFT JOIN invasivesbc.code_header classified_area_code_header
                     ON ((((classified_area_code_header.code_header_title)::text = 'classified_area_code'::text) AND
                          (classified_area_code_header.valid_to IS NULL))))
            LEFT JOIN invasivesbc.code classified_area_codes
                    ON (((classified_area_codes.code_header_id = classified_area_code_header.code_header_id) AND
                         (record.classified_area_code = (classified_area_codes.code_name)::text))))
            LEFT JOIN invasivesbc.code_header biological_agent_code_header
                   ON ((((biological_agent_code_header.code_header_title)::text = 'biological_agent_code'::text) AND
                        (biological_agent_code_header.valid_to IS NULL))))
            LEFT JOIN invasivesbc.code biological_agent_codes
                  ON (((biological_agent_codes.code_header_id = biological_agent_code_header.code_header_id) AND
                       (record.biological_agent_code = (biological_agent_codes.code_name)::text))))
            LEFT JOIN invasivesbc.code_header biological_agent_stage_code_header
                 ON ((((biological_agent_stage_code_header.code_header_title)::text =
                       'biological_agent_stage_code'::text) AND
                      (biological_agent_stage_code_header.valid_to IS NULL))))
            LEFT JOIN invasivesbc.code biological_agent_stage_codes
                ON (((biological_agent_stage_codes.code_header_id =
                      biological_agent_stage_code_header.code_header_id) AND
                     (record.biological_agent_stage_code = (biological_agent_stage_codes.code_name)::text))))
            LEFT JOIN invasivesbc.code_header bioagent_maturity_status_code_header
               ON ((((bioagent_maturity_status_code_header.code_header_title)::text =
                     'bioagent_maturity_status_code'::text) AND
                    (bioagent_maturity_status_code_header.valid_to IS NULL))))
            LEFT JOIN invasivesbc.code bioagent_maturity_status_codes
              ON (((bioagent_maturity_status_codes.code_header_id =
                    bioagent_maturity_status_code_header.code_header_id) AND
                   (record.bioagent_maturity_status_code = (bioagent_maturity_status_codes.code_name)::text))));
        COMMENT ON VIEW invasivesbc.treatment_biological_terrestrialplant IS 'View on biological treatments for terrestrial plant specific fields, with code table values resolved';
        CREATE VIEW invasivesbc.treatment_chemical_terrestrialplant AS
        SELECT record.activity_id,
               summary.version,
               summary.activity_date_time,
               summary.submitted_time,
               summary.received_timestamp,
               summary.deleted_timestamp,
               summary.biogeoclimatic_zones,
               summary.regional_invasive_species_organization_areas,
               summary.invasive_plant_management_areas,
               summary.ownership,
               summary.regional_districts,
               summary.flnro_districts,
               summary.moti_districts,
               summary.elevation,
               summary.well_proximity,
               summary.utm_zone,
               summary.utm_northing,
               summary.utm_easting,
               summary.albers_northing,
               summary.albers_easting,
               summary.latitude,
               summary.longitude,
               summary.reported_area,
               summary.invasive_species_agency_code,
               summary.general_comment,
               summary.access_description,
               summary.jurisdictions,
               summary.project_code,
               summary.geom,
               summary.geog,
               summary.media_keys,
               record.applicator1_first_name,
               record.applicator1_last_name,
               record.applicator1_licence_number,
               record.applicator2_first_name,
               record.applicator2_last_name,
               record.applicator2_licence_number,
               record.pesticide_employer_code,
               pesticide_employer_codes.code_description AS pesticide_employer,
               record.pesticide_use_permit_pup,
               record.pest_management_plan,
               record.treatment_issues_code,
               treatment_issues_codes.code_description   AS treatment_issues,
               record.chemical_method_code,
               chemical_method_codes.code_description    AS chemical_method,
               record.temperature,
               record.wind_speed,
               record.wind_direction_code,
               wind_direction_codes.code_description     AS wind_direction,
               record.humidity
        FROM (((((((((invasivesbc.activity_treatment_chemical_terrestrialplant_with_codes record
            JOIN invasivesbc.treatment_summary summary ON ((summary.activity_id = record.activity_id)))
            LEFT JOIN invasivesbc.code_header treatment_issues_code_header
                     ON ((((treatment_issues_code_header.code_header_title)::text = 'treatment_issues_code'::text) AND
                          (treatment_issues_code_header.valid_to IS NULL))))
            LEFT JOIN invasivesbc.code treatment_issues_codes
                    ON (((treatment_issues_codes.code_header_id = treatment_issues_code_header.code_header_id) AND
                         (record.treatment_issues_code = (treatment_issues_codes.code_name)::text))))
            LEFT JOIN invasivesbc.code_header pesticide_employer_code_header
                   ON ((((pesticide_employer_code_header.code_header_title)::text = 'pesticide_employer_code'::text) AND
                        (pesticide_employer_code_header.valid_to IS NULL))))
            LEFT JOIN invasivesbc.code pesticide_employer_codes
                  ON (((pesticide_employer_codes.code_header_id = pesticide_employer_code_header.code_header_id) AND
                       (record.pesticide_employer_code = (pesticide_employer_codes.code_name)::text))))
            LEFT JOIN invasivesbc.code_header chemical_method_code_header
                 ON ((((chemical_method_code_header.code_header_title)::text = 'chemical_method_code'::text) AND
                      (chemical_method_code_header.valid_to IS NULL))))
            LEFT JOIN invasivesbc.code chemical_method_codes
                ON (((chemical_method_codes.code_header_id = chemical_method_code_header.code_header_id) AND
                     (record.chemical_method_code = (chemical_method_codes.code_name)::text))))
            LEFT JOIN invasivesbc.code_header wind_direction_code_header
               ON ((((wind_direction_code_header.code_header_title)::text = 'wind_direction_code'::text) AND
                    (wind_direction_code_header.valid_to IS NULL))))
            LEFT JOIN invasivesbc.code wind_direction_codes
              ON (((wind_direction_codes.code_header_id = wind_direction_code_header.code_header_id) AND
                   (record.wind_direction_code = (wind_direction_codes.code_name)::text))));
        COMMENT ON VIEW invasivesbc.treatment_chemical_terrestrialplant IS 'View on chemical treatments for terrestrial plant specific fields, with code table values resolved';
        CREATE VIEW invasivesbc.treatment_mechanical_terrestrialplant AS
        SELECT record.activity_id,
               summary.version,
               summary.activity_date_time,
               summary.submitted_time,
               summary.received_timestamp,
               summary.deleted_timestamp,
               summary.biogeoclimatic_zones,
               summary.regional_invasive_species_organization_areas,
               summary.invasive_plant_management_areas,
               summary.ownership,
               summary.regional_districts,
               summary.flnro_districts,
               summary.moti_districts,
               summary.elevation,
               summary.well_proximity,
               summary.utm_zone,
               summary.utm_northing,
               summary.utm_easting,
               summary.albers_northing,
               summary.albers_easting,
               summary.latitude,
               summary.longitude,
               summary.reported_area,
               summary.invasive_species_agency_code,
               summary.general_comment,
               summary.access_description,
               summary.jurisdictions,
               summary.project_code,
               summary.geom,
               summary.geog,
               summary.media_keys,
               record.invasive_plant_code,
               invasive_plant_codes.code_description      AS invasive_plant,
               record.mechanical_method_code,
               mechanical_method_codes.code_description   AS mechanical_method,
               record.mechanical_disposal_code,
               mechanical_disposal_codes.code_description AS mechanical_disposal,
               record.root_removal_code,
               root_removal_codes.code_description        AS root_removal,
               record.soil_disturbance_code,
               soil_disturbance_codes.code_description    AS soil_disturbance,
               record.signage_on_site
        FROM (((((((((((invasivesbc.activity_treatment_mechanical_terrestrialplant_with_codes record
            JOIN invasivesbc.treatment_summary summary ON ((summary.activity_id = record.activity_id)))
            LEFT JOIN invasivesbc.code_header invasive_plant_code_header
                       ON ((((invasive_plant_code_header.code_header_title)::text = 'invasive_plant_code'::text) AND
                            (invasive_plant_code_header.valid_to IS NULL))))
            LEFT JOIN invasivesbc.code invasive_plant_codes
                      ON (((invasive_plant_codes.code_header_id = invasive_plant_code_header.code_header_id) AND
                           (record.invasive_plant_code = (invasive_plant_codes.code_name)::text))))
            LEFT JOIN invasivesbc.code_header mechanical_method_code_header
                     ON ((((mechanical_method_code_header.code_header_title)::text = 'mechanical_method_code'::text) AND
                          (mechanical_method_code_header.valid_to IS NULL))))
            LEFT JOIN invasivesbc.code mechanical_method_codes
                    ON (((mechanical_method_codes.code_header_id = mechanical_method_code_header.code_header_id) AND
                         (record.mechanical_method_code = (mechanical_method_codes.code_name)::text))))
            LEFT JOIN invasivesbc.code_header mechanical_disposal_code_header
                   ON ((((mechanical_disposal_code_header.code_header_title)::text =
                         'mechanical_disposal_code'::text) AND
                        (mechanical_disposal_code_header.valid_to IS NULL))))
            LEFT JOIN invasivesbc.code mechanical_disposal_codes
                  ON (((mechanical_disposal_codes.code_header_id = mechanical_disposal_code_header.code_header_id) AND
                       (record.mechanical_disposal_code = (mechanical_disposal_codes.code_name)::text))))
            LEFT JOIN invasivesbc.code_header root_removal_code_header
                 ON ((((root_removal_code_header.code_header_title)::text = 'root_removal_code'::text) AND
                      (root_removal_code_header.valid_to IS NULL))))
            LEFT JOIN invasivesbc.code root_removal_codes
                ON (((root_removal_codes.code_header_id = root_removal_code_header.code_header_id) AND
                     (record.root_removal_code = (root_removal_codes.code_name)::text))))
            LEFT JOIN invasivesbc.code_header soil_disturbance_code_header
               ON ((((soil_disturbance_code_header.code_header_title)::text = 'soil_disturbance_code'::text) AND
                    (soil_disturbance_code_header.valid_to IS NULL))))
            LEFT JOIN invasivesbc.code soil_disturbance_codes
              ON (((soil_disturbance_codes.code_header_id = soil_disturbance_code_header.code_header_id) AND
                   (record.soil_disturbance_code = (soil_disturbance_codes.code_name)::text))));
        COMMENT ON VIEW invasivesbc.treatment_mechanical_terrestrialplant IS 'View on biological treatments for terrestrial plant specific fields, with code table values resolved';
        CREATE TABLE invasivesbc.user_access
        (
            access_id  integer NOT NULL,
            user_id    integer,
            role_id    integer,
            created_at timestamp without time zone DEFAULT now(),
            updated_at timestamp without time zone DEFAULT now()
        );
        CREATE SEQUENCE invasivesbc.user_access_access_id_seq
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;
        ALTER SEQUENCE invasivesbc.user_access_access_id_seq OWNED BY invasivesbc.user_access.access_id;
        CREATE TABLE invasivesbc.user_role
        (
            role_id          integer                NOT NULL,
            role_description character varying(250) NOT NULL,
            role_name        character varying(250) NOT NULL,
            created_at       timestamp without time zone DEFAULT now(),
            updated_at       timestamp without time zone DEFAULT now(),
            metabase_group   character varying(100)
        );
        CREATE SEQUENCE invasivesbc.user_role_role_id_seq
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;
        ALTER SEQUENCE invasivesbc.user_role_role_id_seq OWNED BY invasivesbc.user_role.role_id;
        CREATE TABLE public.aggregate
        (
            gid        integer NOT NULL,
            pit_number character varying(254),
            pit_name   character varying(254),
            layer      character varying(100),
            path       character varying(200),
            geog       public.geography(MultiPolygon, 4326)
        );
        CREATE SEQUENCE public.aggregate_gid_seq
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;
        ALTER SEQUENCE public.aggregate_gid_seq OWNED BY public.aggregate.gid;
        CREATE TABLE public.invasive_plant_management_areas
        (
            gid        integer NOT NULL,
            ogc_fid    integer,
            objectid   integer,
            ipma       character varying(50),
            agency_cd  character varying(8),
            dropdown_n character varying(60),
            agency     character varying(60),
            geog       public.geography(MultiPolygon, 4326)
        );
        CREATE SEQUENCE public.invasive_plant_management_areas_gid_seq
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;
        ALTER SEQUENCE public.invasive_plant_management_areas_gid_seq OWNED BY public.invasive_plant_management_areas.gid;
        CREATE TABLE public.jurisdiction
        (
            gid        integer NOT NULL,
            type       character varying(30),
            name       character varying(74),
            jurisdictn character varying(75),
            draworder  integer,
            code_name  character varying(10),
            geog       public.geography(MultiPolygon, 4326)
        );
        CREATE SEQUENCE public.jurisdiction_gid_seq
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;
        ALTER SEQUENCE public.jurisdiction_gid_seq OWNED BY public.jurisdiction.gid;

        CREATE TABLE public.pest_management_plan_areas
        (
            ogc_fid  integer NOT NULL,
            geog     public.geography(Polygon, 4326),
            pmp_name character varying(254)
        );
        CREATE SEQUENCE public.pest_management_plan_areas_ogc_fid_seq
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;
        ALTER SEQUENCE public.pest_management_plan_areas_ogc_fid_seq OWNED BY public.pest_management_plan_areas.ogc_fid;
        CREATE TABLE public.regional_districts
        (
            gid        integer NOT NULL,
            agency     character varying(200),
            agency_cd  character varying(40),
            dropdown_n character varying(240),
            geog       public.geography(MultiPolygon, 4326)
        );
        CREATE SEQUENCE public.regional_districts_gid_seq
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;
        ALTER SEQUENCE public.regional_districts_gid_seq OWNED BY public.regional_districts.gid;
        CREATE TABLE public.regional_invasive_species_organization_areas
        (
            gid        integer NOT NULL,
            ogc_fid    integer,
            objectid   integer,
            agency_cd  character varying(8),
            dropdown_n character varying(60),
            layer      character varying(100),
            agency     character varying(52),
            geog       public.geography(MultiPolygon, 4326)
        );
        CREATE SEQUENCE public.regional_invasive_species_organization_areas_gid_seq
            START WITH 1
            INCREMENT BY 1
            NO MINVALUE
            NO MAXVALUE
            CACHE 1;
        ALTER SEQUENCE public.regional_invasive_species_organization_areas_gid_seq OWNED BY public.regional_invasive_species_organization_areas.gid;
        ALTER TABLE ONLY invasivesbc.access_request
            ALTER COLUMN access_request_id SET DEFAULT nextval('invasivesbc.access_request_access_request_id_seq'::regclass);
        ALTER TABLE ONLY invasivesbc.activity_incoming_data
            ALTER COLUMN activity_incoming_data_id SET DEFAULT nextval('invasivesbc.activity_incoming_data_activity_incoming_data_id_seq'::regclass);
        ALTER TABLE ONLY invasivesbc.activity_subtype_mapping
            ALTER COLUMN mapping_id SET DEFAULT nextval('invasivesbc.activity_subtype_mapping_mapping_id_seq'::regclass);
        ALTER TABLE ONLY invasivesbc.admin_defined_shapes
            ALTER COLUMN id SET DEFAULT nextval('invasivesbc.admin_defined_shapes_id_seq'::regclass);
        ALTER TABLE ONLY invasivesbc.application_user
            ALTER COLUMN user_id SET DEFAULT nextval('invasivesbc.application_user_user_id_seq'::regclass);
        ALTER TABLE ONLY invasivesbc.batch_uploads
            ALTER COLUMN id SET DEFAULT nextval('invasivesbc.batch_uploads_id_seq'::regclass);
        ALTER TABLE ONLY invasivesbc.bc_small_grid
            ALTER COLUMN id SET DEFAULT nextval('invasivesbc.bc_small_grid_id_seq'::regclass);
        ALTER TABLE ONLY invasivesbc.cache_versions
            ALTER COLUMN id SET DEFAULT nextval('invasivesbc.cache_versions_id_seq'::regclass);
        ALTER TABLE ONLY invasivesbc.code
            ALTER COLUMN code_id SET DEFAULT nextval('invasivesbc.code_code_id_seq'::regclass);
        ALTER TABLE ONLY invasivesbc.code_category
            ALTER COLUMN code_category_id SET DEFAULT nextval('invasivesbc.code_category_code_category_id_seq'::regclass);
        ALTER TABLE ONLY invasivesbc.code_header
            ALTER COLUMN code_header_id SET DEFAULT nextval('invasivesbc.code_header_code_header_id_seq'::regclass);
        ALTER TABLE ONLY invasivesbc.email_settings
            ALTER COLUMN email_setting_id SET DEFAULT nextval('invasivesbc.email_settings_email_setting_id_seq'::regclass);
        ALTER TABLE ONLY invasivesbc.email_templates
            ALTER COLUMN email_template_id SET DEFAULT nextval('invasivesbc.email_templates_email_template_id_seq'::regclass);
        ALTER TABLE ONLY invasivesbc.embedded_report_categories
            ALTER COLUMN id SET DEFAULT nextval('invasivesbc.embedded_report_categories_id_seq'::regclass);
        ALTER TABLE ONLY invasivesbc.embedded_reports
            ALTER COLUMN id SET DEFAULT nextval('invasivesbc.embedded_reports_id_seq'::regclass);
        ALTER TABLE ONLY invasivesbc.error_log
            ALTER COLUMN id SET DEFAULT nextval('invasivesbc.error_log_id_seq'::regclass);
        ALTER TABLE ONLY invasivesbc.export_records
            ALTER COLUMN id SET DEFAULT nextval('invasivesbc.export_records_id_seq'::regclass);
        ALTER TABLE ONLY invasivesbc.iapp_imported_images
            ALTER COLUMN id SET DEFAULT nextval('invasivesbc.iapp_imported_images_id_seq'::regclass);
        ALTER TABLE ONLY invasivesbc.iapp_invbc_mapping
            ALTER COLUMN mapping_id SET DEFAULT nextval('invasivesbc.iapp_invbc_mapping_mapping_id_seq'::regclass);
        ALTER TABLE ONLY invasivesbc.iapp_jurisdictions
            ALTER COLUMN id SET DEFAULT nextval('invasivesbc.iapp_jurisdictions_id_seq'::regclass);
        ALTER TABLE ONLY invasivesbc.point_of_interest_incoming_data
            ALTER COLUMN point_of_interest_incoming_data_id SET DEFAULT nextval('invasivesbc.point_of_interest_incoming_da_point_of_interest_incoming_da_seq'::regclass);
        ALTER TABLE ONLY invasivesbc.point_of_interest_incoming_data
            ALTER COLUMN point_of_interest_id SET DEFAULT nextval('invasivesbc.point_of_interest_incoming_data_point_of_interest_id_seq'::regclass);
        ALTER TABLE ONLY invasivesbc.species_ref_raw
            ALTER COLUMN species_id SET DEFAULT nextval('invasivesbc.species_ref_raw_species_id_seq'::regclass);
        ALTER TABLE ONLY invasivesbc.user_access
            ALTER COLUMN access_id SET DEFAULT nextval('invasivesbc.user_access_access_id_seq'::regclass);
        ALTER TABLE ONLY invasivesbc.user_role
            ALTER COLUMN role_id SET DEFAULT nextval('invasivesbc.user_role_role_id_seq'::regclass);
        ALTER TABLE ONLY public.aggregate
            ALTER COLUMN gid SET DEFAULT nextval('public.aggregate_gid_seq'::regclass);
        ALTER TABLE ONLY public.invasive_plant_management_areas
            ALTER COLUMN gid SET DEFAULT nextval('public.invasive_plant_management_areas_gid_seq'::regclass);
        ALTER TABLE ONLY public.jurisdiction
            ALTER COLUMN gid SET DEFAULT nextval('public.jurisdiction_gid_seq'::regclass);
        ALTER TABLE ONLY public.pest_management_plan_areas
            ALTER COLUMN ogc_fid SET DEFAULT nextval('public.pest_management_plan_areas_ogc_fid_seq'::regclass);
        ALTER TABLE ONLY public.regional_districts
            ALTER COLUMN gid SET DEFAULT nextval('public.regional_districts_gid_seq'::regclass);
        ALTER TABLE ONLY public.regional_invasive_species_organization_areas
            ALTER COLUMN gid SET DEFAULT nextval('public.regional_invasive_species_organization_areas_gid_seq'::regclass);
        ALTER TABLE ONLY invasivesbc.access_request
            ADD CONSTRAINT access_request_idir_userid_bceid_userid_key UNIQUE (idir_userid, bceid_userid);
        ALTER TABLE ONLY invasivesbc.access_request
            ADD CONSTRAINT access_request_pkey PRIMARY KEY (access_request_id);
        ALTER TABLE ONLY invasivesbc.activity_incoming_data
            ADD CONSTRAINT activity_incoming_data_pkey PRIMARY KEY (activity_incoming_data_id);
        ALTER TABLE ONLY invasivesbc.activity_subtype_mapping
            ADD CONSTRAINT activity_subtype_mapping_pkey PRIMARY KEY (mapping_id);
        ALTER TABLE ONLY invasivesbc.admin_defined_shapes
            ADD CONSTRAINT admin_defined_shapes_pkey PRIMARY KEY (id);
        ALTER TABLE ONLY invasivesbc.application_user
            ADD CONSTRAINT application_user_email_key UNIQUE (email);
        ALTER TABLE ONLY invasivesbc.application_user
            ADD CONSTRAINT application_user_pkey PRIMARY KEY (user_id);
        ALTER TABLE ONLY invasivesbc.application_user
            ADD CONSTRAINT application_user_preferred_username_key UNIQUE (preferred_username);
        ALTER TABLE ONLY invasivesbc.batch_uploads
            ADD CONSTRAINT batch_uploads_pkey PRIMARY KEY (id);
        ALTER TABLE ONLY invasivesbc.bc_large_grid
            ADD CONSTRAINT bc_large_grid_pkey PRIMARY KEY (id);
        ALTER TABLE ONLY invasivesbc.cache_versions
            ADD CONSTRAINT cache_versions_cache_name_key UNIQUE (cache_name);
        ALTER TABLE ONLY invasivesbc.cache_versions
            ADD CONSTRAINT cache_versions_pkey PRIMARY KEY (id);
        ALTER TABLE ONLY invasivesbc.code_category
            ADD CONSTRAINT code_category_code_category_name_valid_from_unique UNIQUE (code_category_name, valid_from);
        ALTER TABLE ONLY invasivesbc.code_category
            ADD CONSTRAINT code_category_pkey PRIMARY KEY (code_category_id);
        ALTER TABLE ONLY invasivesbc.code
            ADD CONSTRAINT code_code_header_id_code_name_valid_from_unique UNIQUE (code_header_id, code_name, valid_from);
        ALTER TABLE ONLY invasivesbc.code_header
            ADD CONSTRAINT code_header_code_category_id_code_header_name_valid_from_unique UNIQUE (code_category_id, code_header_name, valid_from);
        ALTER TABLE ONLY invasivesbc.code_header
            ADD CONSTRAINT code_header_pkey PRIMARY KEY (code_header_id);
        ALTER TABLE ONLY invasivesbc.code
            ADD CONSTRAINT code_pkey PRIMARY KEY (code_id);
        ALTER TABLE ONLY invasivesbc.email_settings
            ADD CONSTRAINT email_settings_pk PRIMARY KEY (email_setting_id);
        ALTER TABLE ONLY invasivesbc.email_templates
            ADD CONSTRAINT email_templates_pk PRIMARY KEY (email_template_id);
        ALTER TABLE ONLY invasivesbc.embedded_report_categories
            ADD CONSTRAINT embedded_report_categories_name_key UNIQUE (name);
        ALTER TABLE ONLY invasivesbc.embedded_report_categories
            ADD CONSTRAINT embedded_report_categories_pkey PRIMARY KEY (id);
        ALTER TABLE ONLY invasivesbc.embedded_reports
            ADD CONSTRAINT embedded_reports_display_name_key UNIQUE (display_name);
        ALTER TABLE ONLY invasivesbc.embedded_reports
            ADD CONSTRAINT embedded_reports_pkey PRIMARY KEY (id);
        ALTER TABLE ONLY invasivesbc.error_log
            ADD CONSTRAINT error_log_pkey PRIMARY KEY (id);
        ALTER TABLE ONLY invasivesbc.export_records
            ADD CONSTRAINT export_records_pkey PRIMARY KEY (id);
        ALTER TABLE ONLY invasivesbc.iapp_imported_images
            ADD CONSTRAINT iapp_imported_images_media_key_key UNIQUE (media_key);
        ALTER TABLE ONLY invasivesbc.iapp_imported_images
            ADD CONSTRAINT iapp_imported_images_original_iapp_id_key UNIQUE (original_iapp_id);
        ALTER TABLE ONLY invasivesbc.iapp_imported_images
            ADD CONSTRAINT iapp_imported_images_pkey PRIMARY KEY (id);
        ALTER TABLE ONLY invasivesbc.iapp_invbc_mapping
            ADD CONSTRAINT iapp_invbc_mapping_pkey PRIMARY KEY (mapping_id);
        ALTER TABLE ONLY invasivesbc.iapp_jurisdictions
            ADD CONSTRAINT iapp_jurisdictions_pkey PRIMARY KEY (id);
        ALTER TABLE ONLY invasivesbc.point_of_interest_incoming_data
            ADD CONSTRAINT point_of_interest_incoming_data_pkey PRIMARY KEY (point_of_interest_incoming_data_id);
        ALTER TABLE ONLY invasivesbc.provincial_boundary
            ADD CONSTRAINT provincial_boundary_id_key UNIQUE (id);
        ALTER TABLE ONLY invasivesbc.user_access
            ADD CONSTRAINT user_access_pkey PRIMARY KEY (access_id);
        ALTER TABLE ONLY invasivesbc.user_access
            ADD CONSTRAINT user_access_user_id_role_id_key UNIQUE (user_id, role_id);
        ALTER TABLE ONLY invasivesbc.user_role
            ADD CONSTRAINT user_role_pkey PRIMARY KEY (role_id);
        ALTER TABLE ONLY public.aggregate
            ADD CONSTRAINT aggregate_pkey PRIMARY KEY (gid);
        ALTER TABLE ONLY public.invasive_plant_management_areas
            ADD CONSTRAINT invasive_plant_management_areas_pkey PRIMARY KEY (gid);
        ALTER TABLE ONLY public.jurisdiction
            ADD CONSTRAINT jurisdiction_pkey PRIMARY KEY (gid);
        ALTER TABLE ONLY public.pest_management_plan_areas
            ADD CONSTRAINT pest_management_plan_areas_pk PRIMARY KEY (ogc_fid);
        ALTER TABLE ONLY public.regional_districts
            ADD CONSTRAINT regional_districts_pkey PRIMARY KEY (gid);
        ALTER TABLE ONLY public.regional_invasive_species_organization_areas
            ADD CONSTRAINT regional_invasive_species_organization_areas_pkey PRIMARY KEY (gid);
        CREATE INDEX activity_incoming_data_activity_id_and_current_idx ON invasivesbc.activity_incoming_data USING btree (activity_id, iscurrent);
        CREATE INDEX activity_incoming_data_activity_id_idx ON invasivesbc.activity_incoming_data USING btree (activity_id);
        CREATE INDEX activity_incoming_data_activity_incoming_data_id_idx ON invasivesbc.activity_incoming_data USING btree (activity_incoming_data_id);
        CREATE INDEX activity_incoming_data_activity_subtype_full_idx ON invasivesbc.activity_incoming_data USING btree (activity_subtype_full);
        CREATE INDEX activity_incoming_data_activity_subtype_idx ON invasivesbc.activity_incoming_data USING btree (activity_subtype);
        CREATE INDEX activity_incoming_data_activity_type_idx ON invasivesbc.activity_incoming_data USING btree (activity_type);
        CREATE INDEX activity_incoming_data_agency_idx ON invasivesbc.activity_incoming_data USING btree (agency);
        CREATE INDEX activity_incoming_data_created_by_idx ON invasivesbc.activity_incoming_data USING btree (created_by);
        CREATE INDEX activity_incoming_data_form_status_idx ON invasivesbc.activity_incoming_data USING btree (form_status);
        CREATE INDEX activity_incoming_data_geog_idx ON invasivesbc.activity_incoming_data USING gist (geog);
        CREATE INDEX activity_incoming_data_geom_idx ON invasivesbc.activity_incoming_data USING gist (geom);
        CREATE INDEX activity_incoming_data_ipma_idx ON invasivesbc.activity_incoming_data USING btree (invasive_plant_management_areas);
        CREATE INDEX activity_incoming_data_iscurrent_idx ON invasivesbc.activity_incoming_data USING btree (iscurrent);
        CREATE INDEX activity_incoming_data_jurisdiction_idx ON invasivesbc.activity_incoming_data USING btree (jurisdiction_display);
        CREATE INDEX activity_incoming_data_payload_idx ON invasivesbc.activity_incoming_data USING gin (activity_payload);
        CREATE INDEX activity_incoming_data_regional_district_idx ON invasivesbc.activity_incoming_data USING btree (regional_districts);
        CREATE INDEX activity_incoming_data_riso_idx ON invasivesbc.activity_incoming_data USING btree (regional_invasive_species_organization_areas);
        CREATE INDEX activity_incoming_data_short_id_idx ON invasivesbc.activity_incoming_data USING btree (short_id);
        CREATE INDEX activity_incoming_data_species_negative_idx ON invasivesbc.activity_incoming_data USING btree (species_negative_full);
        CREATE INDEX activity_incoming_data_species_positive_idx ON invasivesbc.activity_incoming_data USING btree (species_positive_full);
        CREATE INDEX activity_incoming_data_species_treated_idx ON invasivesbc.activity_incoming_data USING btree (species_treated_full);
        CREATE INDEX activity_incoming_data_updated_by_idx ON invasivesbc.activity_incoming_data USING btree (updated_by);
        CREATE INDEX admin_defined_shapes_geog_idx ON invasivesbc.admin_defined_shapes USING gist (geog);
        CREATE INDEX admin_defined_shapes_id_idx ON invasivesbc.admin_defined_shapes USING btree (id);
        CREATE INDEX biological_dispersal_extract_site_id_idx ON invasivesbc.biological_dispersal_extract USING btree (site_id);
        CREATE INDEX biological_monitoring_extract_site_id_idx ON invasivesbc.biological_monitoring_extract USING btree (site_id);
        CREATE INDEX biological_treatment_extract_site_id_idx ON invasivesbc.biological_treatment_extract USING btree (site_id);
        CREATE INDEX chemical_treatment_extract_site_id_idx ON invasivesbc.chemical_treatment_extract USING btree (site_id);
        CREATE INDEX code_category_code_category_id_idx ON invasivesbc.code_category USING btree (code_category_id, code_category_name);
        CREATE INDEX code_code_description_idx ON invasivesbc.code USING btree (code_description);
        CREATE INDEX code_code_id_idx ON invasivesbc.code USING btree (code_id, code_name, code_sort_order, code_description, code_header_id);
        CREATE INDEX code_code_name_idx ON invasivesbc.code USING btree (code_name);
        CREATE INDEX code_header_code_header_id_idx ON invasivesbc.code_header USING btree (code_header_id,
                                                                                            code_category_id,
                                                                                            code_header_name,
                                                                                            code_header_title,
                                                                                            code_header_description);
        CREATE INDEX code_header_code_header_name_idx ON invasivesbc.code_header USING btree (code_header_name);
        CREATE INDEX current_negative_observations_materialized_activity_incoming_da ON invasivesbc.current_negative_observations_materialized USING btree (activity_incoming_data_id);
        CREATE INDEX current_negative_observations_materialized_invasive_plant_idx ON invasivesbc.current_negative_observations_materialized USING btree (invasive_plant);
        CREATE INDEX current_positive_observations_materialized_activity_incoming_da ON invasivesbc.current_positive_observations_materialized USING btree (activity_incoming_data_id);
        CREATE INDEX current_positive_observations_materialized_invasive_plant_idx ON invasivesbc.current_positive_observations_materialized USING btree (invasive_plant);
        CREATE INDEX iapp_site_summary_and_geojson_geom_idx ON invasivesbc.iapp_site_summary_and_geojson USING gist (geog);
        CREATE INDEX iapp_site_summary_and_geojson_site_id_idx ON invasivesbc.iapp_site_summary_and_geojson USING btree (site_id,
                                                                                                                         site_paper_file_id,
                                                                                                                         jurisdictions,
                                                                                                                         all_species_on_site,
                                                                                                                         max_survey,
                                                                                                                         agencies,
                                                                                                                         has_biological_treatments,
                                                                                                                         biological_agent,
                                                                                                                         has_chemical_treatments,
                                                                                                                         has_mechanical_treatments,
                                                                                                                         has_biological_dispersals,
                                                                                                                         monitored,
                                                                                                                         all_species_on_site_as_array,
                                                                                                                         regional_district,
                                                                                                                         regional_invasive_species_organization,
                                                                                                                         invasive_plant_management_area);
        CREATE INDEX idx_jsonb_jurisdiction ON invasivesbc.activity_incoming_data USING gin (((
                ((activity_payload -> 'form_data'::text) -> 'activity_data'::text) -> 'jurisdictions'::text)));
        CREATE INDEX mechanical_monitoring_extract_site_id_idx ON invasivesbc.mechanical_monitoring_extract USING btree (site_id);
        CREATE INDEX mechanical_treatment_extract_site_id_idx ON invasivesbc.mechanical_treatment_extract USING btree (site_id);
        CREATE INDEX poi_sub_type_idx ON invasivesbc.point_of_interest_incoming_data USING btree (point_of_interest_subtype);
        CREATE INDEX poi_type_idx ON invasivesbc.point_of_interest_incoming_data USING btree (point_of_interest_type);
        CREATE INDEX point_of_interest_biological_dispersal_date_idx ON invasivesbc.point_of_interest_incoming_data USING btree (invasivesbc.immutable_to_date(((
                ((point_of_interest_payload -> 'form_data'::text) -> 'biological_dispersals'::text) ->
                'monitoring_date'::text))::text));
        CREATE INDEX point_of_interest_biological_treatment_date_idx ON invasivesbc.point_of_interest_incoming_data USING btree (invasivesbc.immutable_to_date(((
                ((point_of_interest_payload -> 'form_data'::text) -> 'biological_treatments'::text) ->
                'treatment_date'::text))::text));
        CREATE INDEX point_of_interest_biological_treatment_monitoring_date_idx ON invasivesbc.point_of_interest_incoming_data USING btree (invasivesbc.immutable_to_date(((
                (((point_of_interest_payload -> 'form_data'::text) -> 'biological_treatments'::text) ->
                 'monitoring'::text) ->
                'monitoring_date'::text))::text));
        CREATE INDEX point_of_interest_chemical_monitoring_date_idx ON invasivesbc.point_of_interest_incoming_data USING btree (invasivesbc.immutable_to_date(((
                (((point_of_interest_payload -> 'form_data'::text) -> 'chemical_treatments'::text) ->
                 'monitoring'::text) ->
                'monitoring_date'::text))::text));
        CREATE INDEX point_of_interest_chemical_treatment_date_idx ON invasivesbc.point_of_interest_incoming_data USING btree (invasivesbc.immutable_to_date(((
                ((point_of_interest_payload -> 'form_data'::text) -> 'chemical_treatments'::text) ->
                'treatment_date'::text))::text));
        CREATE INDEX point_of_interest_id_idx ON invasivesbc.point_of_interest_incoming_data USING btree (point_of_interest_id);
        CREATE INDEX point_of_interest_incoming_data_gist ON invasivesbc.point_of_interest_incoming_data USING gist (geom);
        CREATE INDEX point_of_interest_incoming_data_gist2 ON invasivesbc.point_of_interest_incoming_data USING gist (geog);
        CREATE INDEX point_of_interest_mechanical_treatment_date_idx ON invasivesbc.point_of_interest_incoming_data USING btree (invasivesbc.immutable_to_date(((
                ((point_of_interest_payload -> 'form_data'::text) -> 'mechanical_treatments'::text) ->
                'treatment_date'::text))::text));
        CREATE INDEX point_of_interest_mechanical_treatment_monitoring_date_idx ON invasivesbc.point_of_interest_incoming_data USING btree (invasivesbc.immutable_to_date(((
                (((point_of_interest_payload -> 'form_data'::text) -> 'mechanical_treatments'::text) ->
                 'monitoring'::text) ->
                'monitoring_date'::text))::text));
        CREATE INDEX point_of_interest_survey_date_idx ON invasivesbc.point_of_interest_incoming_data USING btree (invasivesbc.immutable_to_date(((
                ((point_of_interest_payload -> 'form_data'::text) -> 'surveys'::text) -> 'survey_date'::text))::text));
        CREATE INDEX site_selection_extract_site_id_idx ON invasivesbc.site_selection_extract USING btree (site_id);
        CREATE INDEX spatial_iapp_geog_idx ON invasivesbc.iapp_spatial USING gist (geog);
        CREATE INDEX spatial_iapp_site_id_idx ON invasivesbc.iapp_spatial USING btree (site_id);
        CREATE INDEX survey_extract_site_id_idx ON invasivesbc.survey_extract USING btree (site_id);
        CREATE UNIQUE INDEX unique_bceid_userid_if_not_null ON invasivesbc.application_user USING btree (bceid_userid) WHERE (bceid_userid IS NOT NULL);
        CREATE UNIQUE INDEX unique_idir_userid_if_not_null ON invasivesbc.application_user USING btree (idir_userid) WHERE (idir_userid IS NOT NULL);
        CREATE INDEX user_role_metabase_group_idx ON invasivesbc.user_role USING btree (metabase_group);
        CREATE INDEX aggregate_geog_geom_idx ON public.aggregate USING gist (geog);
        CREATE INDEX invasive_plant_management_areas_geog_geom_idx ON public.invasive_plant_management_areas USING gist (geog);
        CREATE INDEX jurisdiction_geog_geom_idx ON public.jurisdiction USING gist (geog);
        CREATE INDEX pest_management_plan_areas_geog_geom_idx ON public.pest_management_plan_areas USING gist (geog);
        CREATE INDEX regional_districts_geog_geom_idx ON public.regional_districts USING gist (geog);
        CREATE INDEX regional_invasive_species_organization_areas_geog_geom_idx ON public.regional_invasive_species_organization_areas USING gist (geog);
        CREATE TRIGGER activity_short_id
            AFTER INSERT
            ON invasivesbc.activity_incoming_data
            FOR EACH ROW
        EXECUTE FUNCTION invasivesbc.short_id_update();
        CREATE TRIGGER activity_subtype_display
            AFTER INSERT
            ON invasivesbc.activity_incoming_data
            FOR EACH ROW
        EXECUTE FUNCTION invasivesbc.activity_subtype_update();
        CREATE TRIGGER agency_full_name
            AFTER INSERT
            ON invasivesbc.activity_incoming_data
            FOR EACH ROW
        EXECUTE FUNCTION invasivesbc.agency_mapping();
        CREATE TRIGGER jurisdiction_full_name
            AFTER INSERT
            ON invasivesbc.activity_incoming_data
            FOR EACH ROW
        EXECUTE FUNCTION invasivesbc.jurisdiction_mapping();
        CREATE TRIGGER maintain_batch_and_row_id
            BEFORE INSERT OR UPDATE
            ON invasivesbc.activity_incoming_data
            FOR EACH ROW
        EXECUTE FUNCTION invasivesbc.batch_and_row_id_autofill();
        CREATE TRIGGER species_full_name
            AFTER INSERT
            ON invasivesbc.activity_incoming_data
            FOR EACH ROW
        EXECUTE FUNCTION invasivesbc.code_to_name();
        CREATE TRIGGER update_activity_cache_version
            AFTER INSERT OR DELETE OR UPDATE
            ON invasivesbc.activity_current
            FOR EACH STATEMENT
        EXECUTE FUNCTION invasivesbc.update_cache_version('activity');
        CREATE TRIGGER update_activity_cache_version
            AFTER INSERT OR DELETE OR UPDATE
            ON invasivesbc.activity_incoming_data
            FOR EACH STATEMENT
        EXECUTE FUNCTION invasivesbc.update_cache_version('activity');
        CREATE TRIGGER update_activity_context
            AFTER INSERT
            ON invasivesbc.activity_incoming_data
            FOR EACH ROW
        EXECUTE FUNCTION invasivesbc.context_autofill();
        CREATE TRIGGER update_activity_current
            AFTER INSERT
            ON invasivesbc.activity_incoming_data
            FOR EACH ROW
        EXECUTE FUNCTION invasivesbc.current_activity_function();
        CREATE TRIGGER update_created_by_on_activity_updates
            AFTER INSERT
            ON invasivesbc.activity_incoming_data
            FOR EACH ROW
        EXECUTE FUNCTION invasivesbc.update_created_by_on_activity_updates_function();
        CREATE TRIGGER update_iscurrent_trigger
            BEFORE UPDATE
            ON invasivesbc.activity_incoming_data
            FOR EACH ROW
        EXECUTE FUNCTION invasivesbc.update_iscurrent();
        ALTER TABLE ONLY invasivesbc.batch_uploads
            ADD CONSTRAINT batch_uploads_created_by_fkey FOREIGN KEY (created_by) REFERENCES invasivesbc.application_user (user_id) ON UPDATE CASCADE ON DELETE CASCADE;
        ALTER TABLE ONLY invasivesbc.code
            ADD CONSTRAINT code_code_header_id_foreign FOREIGN KEY (code_header_id) REFERENCES invasivesbc.code_header (code_header_id);
        ALTER TABLE ONLY invasivesbc.code_header
            ADD CONSTRAINT code_header_code_category_id_foreign FOREIGN KEY (code_category_id) REFERENCES invasivesbc.code_category (code_category_id);
        ALTER TABLE ONLY invasivesbc.embedded_reports
            ADD CONSTRAINT embedded_reports_category_id_fkey FOREIGN KEY (category_id) REFERENCES invasivesbc.embedded_report_categories (id) ON DELETE RESTRICT;
        ALTER TABLE ONLY invasivesbc.user_access
            ADD CONSTRAINT fk_role FOREIGN KEY (role_id) REFERENCES invasivesbc.user_role (role_id) ON DELETE CASCADE;
        ALTER TABLE ONLY invasivesbc.user_access
            ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES invasivesbc.application_user (user_id) ON DELETE CASCADE;
    `
  );
}

export async function down(knex: Knex) {
  await knex.raw(`
  `);
}

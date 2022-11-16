import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {

  await knex.raw(`
  	set search_path=invasivesbc,public;

      create 
      or replace view jurisdiction_species as (
        with spatial_expload_positive as (
          select 
            activity_type, 
            activity_subtype, 
            created_timestamp, 
            activity_incoming_data_id, 
            jsonb_array_elements(species_positive) "species", 
            -- Explode species
            jsonb_array_elements(
              activity_payload #> '{form_data, activity_data, jurisdictions}') as jurisdictions_array,
              geometry(geog) "geom" -- Convert to Geometry (EPSG:4326)
              from 
                activity_incoming_data 
              where 
                activity_type = 'Observation' 
                and -- Observations for now
                form_status = 'Submitted' 
                and activity_incoming_data_id in (
                  select 
                    incoming_data_id 
                  from 
                    activity_current
                ) 
                and species_positive is not null 
                and species_positive :: text not like '[null]' :: text
            ), 
            spatial_positive as (
              select 
                activity_type, 
                activity_subtype, 
                created_timestamp, 
                activity_incoming_data_id, 
                species, 
                jurisdictions_array #>> '{jurisdiction_code}' as jurisdiction_code,
                jurisdictions_array #>> '{percent_covered}' as percent_covered,
                case when st_geometrytype(geom) = 'ST_Point' then st_buffer(
                  geom :: geography, 0.56425, 'quad_segs=30'
                ):: geometry else geom end 
              from 
                spatial_expload_positive
            ), 
            spatial_expload_negative as (
              select 
                activity_subtype, 
                created_timestamp, 
                activity_incoming_data_id, 
                jsonb_array_elements(species_negative) "species", 
                jsonb_array_elements(
                  activity_payload #> '{form_data, activity_data, jurisdictions}') as jurisdictions_array,
                  geometry(geog) "geom" 
                  from 
                    activity_incoming_data 
                  where 
                    activity_type = 'Observation' 
                    and form_status = 'Submitted' 
                    and activity_incoming_data_id in (
                      select 
                        incoming_data_id 
                      from 
                        activity_current
                    ) 
                    and species_negative is not null 
                    and species_negative :: text not like '[null]' :: text
                ), 
                spatial_negative as (
                  select 
                    activity_subtype, 
                    created_timestamp, 
                    activity_incoming_data_id, 
                    species, 
                    jurisdictions_array #>> '{jurisdiction_code}' as jurisdiction_code,
                    jurisdictions_array #>> '{percent_covered}' as percent_covered,
                    case when st_geometrytype(geom) = 'ST_Point' -- when geometry is a point turn it into a circle with area 1m2
                    then st_buffer(
                      geom :: geography, 0.56425, 'quad_segs=30'
                    ):: geometry else geom end 
                  from 
                    spatial_expload_negative
                ), 
                spatial_positive_negative as (
                  -- this CTE creates a new polygon everytime a negative overlaps an older positive, the next two CTEs remove the unwanted extra polygons 
                  select 
                    row_number() over() as ctid, 
                    pos.species #>> '{}' "species",
                    pos.jurisdiction_code, 
                    pos.percent_covered, 
                    pos.activity_type, 
                    pos.created_timestamp, 
                    pos.activity_incoming_data_id, 
                    case -- If there is overlap, delete, otherwise pass through
                    when st_intersects(pos.geom, neg.geom) then st_difference(pos.geom, neg.geom) else pos.geom end 
                  from 
                    spatial_positive pos 
                    left outer join -- This allows the pass through
                    spatial_negative neg on st_intersects(pos.geom, neg.geom) 
                    and pos.species = neg.species 
                    and pos.created_timestamp < neg.created_timestamp -- Only delete new negatives
                    ), 
                spatial_full_overlap as (
                  -- where one or more polygons are within a polygon with the same id/species: select the smallest polygon
                  select 
                    t.activity_incoming_data_id, 
                    t.species, 
                    t.jurisdiction_code, 
                    t.percent_covered, 
                    st_area(t.geom, true) as area, 
                    t.geom, 
                    t.created_timestamp, 
                    t.activity_type 
                  from 
                    spatial_positive_negative t 
                    inner join (
                      SELECT 
                        a.activity_incoming_data_id, 
                        min(
                          st_area(a.geom, true)
                        ) as area 
                      FROM 
                        spatial_positive_negative a, 
                        spatial_positive_negative b 
                      where 
                        a.species = b.species 
                        and ST_contains(a.geom, b.geom) 
                        and a.ctid != b.ctid 
                        and a.activity_incoming_data_id = b.activity_incoming_data_id 
                      group by 
                        a.activity_incoming_data_id
                    ) m on t.activity_incoming_data_id = m.activity_incoming_data_id 
                  where 
                    st_area(t.geom, true) = m.area
                ), 
                spatial_partial_overlap as (
                  -- where one or more polygons with the same id/species intersect but none are fully within another: select the intersecting area of those polygons
                  SELECT 
                    a.activity_incoming_data_id, 
                    a.species, 
                    a.jurisdiction_code, 
                    a.percent_covered, 
                    st_intersection(a.geom, b.geom) as geom, 
                    a.created_timestamp, 
                    a.activity_type 
                  FROM 
                    spatial_positive_negative a, 
                    spatial_positive_negative b 
                  where 
                    a.species = b.species 
                    and ST_intersects(a.geom, b.geom) 
                    and a.ctid != b.ctid 
                    and a.activity_incoming_data_id = b.activity_incoming_data_id 
                    and a.activity_incoming_data_id not in (
                      SELECT 
                        a.activity_incoming_data_id 
                      FROM 
                        spatial_positive_negative a, 
                        spatial_positive_negative b 
                      where 
                        a.species = b.species 
                        and ST_contains(a.geom, b.geom) 
                        and a.ctid != b.ctid 
                        and a.activity_incoming_data_id = b.activity_incoming_data_id 
                      group by 
                        a.activity_incoming_data_id
                    ) 
                  group by 
                    a.activity_incoming_data_id, 
                    a.species, 
                    a.jurisdiction_code, 
                    a.percent_covered, 
                    a.geom, 
                    b.geom, 
                    a.created_timestamp, 
                    a.activity_type
                ), 
                spatial_others as (
                  -- select all polygons that don't meet the criteria of the last two CTEs and union with those CTEs
                  SELECT 
                    activity_incoming_data_id, 
                    species, 
                    jurisdiction_code, 
                    percent_covered, 
                    geom, 
                    created_timestamp, 
                    activity_type 
                  FROM 
                    spatial_positive_negative 
                  where 
                    activity_incoming_data_id not in (
                      SELECT 
                        a.activity_incoming_data_id 
                      FROM 
                        spatial_positive_negative a, 
                        spatial_positive_negative b 
                      where 
                        a.species = b.species 
                        and ST_intersects(a.geom, b.geom) 
                        and a.ctid != b.ctid 
                        and a.activity_incoming_data_id = b.activity_incoming_data_id 
                      group by 
                        a.activity_incoming_data_id
                    ) 
                  union 
                  select 
                    activity_incoming_data_id, 
                    species, 
                    jurisdiction_code, 
                    percent_covered, 
                    geom, 
                    created_timestamp, 
                    activity_type 
                  from 
                    spatial_full_overlap 
                  union 
                  select 
                    * 
                  from 
                    spatial_partial_overlap
                ), 
                spatial_union as (
                  -- union positive polygons by id/species to not double count area of overlap
                  select 
                    species, 
                    invasive_plant_codes.code_description as terrestrial_invasive_plant, 
                    invasive_plant_aquatic_codes.code_description as aquatic_invasive_plant, 
                    jurisdiction_code, 
                    jurisdiction_codes.code_description as jurisdiction, 
                    percent_covered, 
                    activity_type, 
                    max(created_timestamp) "max_created_timestamp", 
                    array_agg(activity_incoming_data_id) "activity_ids", 
                    -- Collect original IDs 
                    st_Union(
                      -- Remove embedded linework
                      st_collectionExtract(
                        -- Convert from GeometryCollection to MultiPolygons
                        st_transform(geom, 3005) -- Convert to Albers to get meters
                        , 
                        3
                      )
                    ) "geom" 
                  from 
                    spatial_others 
                    left join code_header invasive_plant_code_header on invasive_plant_code_header.code_header_title = 'invasive_plant_code' 
                    and invasive_plant_code_header.valid_to is null 
                    left join code invasive_plant_codes on invasive_plant_codes.code_header_id = invasive_plant_code_header.code_header_id 
                    and species = invasive_plant_codes.code_name 
                    left join code_header invasive_plant_aquatic_code_header on invasive_plant_aquatic_code_header.code_header_title = 'invasive_plant_aquatic_code' 
                    and invasive_plant_aquatic_code_header.valid_to is null 
                    left join code invasive_plant_aquatic_codes on invasive_plant_aquatic_codes.code_header_id = invasive_plant_aquatic_code_header.code_header_id 
                    and species = invasive_plant_aquatic_codes.code_name 
                    left join code_header jurisdiction_code_header on jurisdiction_code_header.code_header_title = 'jurisdiction_code' 
                    and jurisdiction_code_header.valid_to is null 
                    left join code jurisdiction_codes on jurisdiction_codes.code_header_id = jurisdiction_code_header.code_header_id 
                    and jurisdiction_code = jurisdiction_codes.code_name 
                  group by 
                    species, 
                    invasive_plant_codes.code_description, 
                    invasive_plant_aquatic_codes.code_description, 
                    jurisdiction_code, 
                    jurisdiction_codes.code_description, 
                    percent_covered, 
                    activity_type
                ), 
                spatial_coalesce as (
                  select 
                    species, 
                    jurisdiction, 
                    percent_covered :: float8, 
                    coalesce(
                      terrestrial_invasive_plant, aquatic_invasive_plant
                    ) as invasive_plant, 
                    max_created_timestamp, 
                    st_area(geom):: float8 as area_sqm, 
                    geom 
                  from 
                    spatial_union 
                  where 
                    st_area(geom) > 0 -- don't select empty polygons
                    ) 
              select 
                invasive_plant, 
                jurisdiction, 
                (percent_covered / 100) * area_sqm as area_sqm, 
                geom 
              from 
                spatial_coalesce
            );

create 
or replace view regional_districts_species_area as (
  with observations_by_species_dump as (
    select 
      o.invasive_plant, 
      (
        st_dump(o.geom)
      ).geom :: geometry(Polygon, 3005) "geom" 
    from 
      observations_by_species o
  ), 
  intersects as (
    select 
      o.invasive_plant, 
      r.agency, 
      o.geom 
    from 
      observations_by_species_dump o, 
      regional_districts r 
    where 
      st_intersects2(
        o.geom, 
        st_transform(r.geog :: geometry, 3005)
      ) 
    group by 
      o.invasive_plant, 
      r.agency, 
      o.geom
  ) 
  select 
    i.invasive_plant, 
    i.agency, 
    st_area(
      st_multi(
        st_union(i.geom)
      )
    ) as Area_sqm 
  from 
    intersects i 
  group by 
    i.invasive_plant, 
    i.agency
);

create 
or replace view riso_species_area as (
  with observations_by_species_dump as (
    select 
      o.invasive_plant, 
      (
        st_dump(o.geom)
      ).geom :: geometry(Polygon, 3005) "geom" 
    from 
      observations_by_species o
  ), 
  intersects as (
    select 
      o.invasive_plant, 
      r.agency, 
      o.geom 
    from 
      observations_by_species_dump o, 
      regional_invasive_species_organization_areas r 
    where 
      st_intersects2(
        o.geom, 
        st_transform(r.geog :: geometry, 3005)
      ) 
    group by 
      o.invasive_plant, 
      r.agency, 
      o.geom
  ) 
  select 
    i.invasive_plant, 
    i.agency, 
    st_area(
      st_multi(
        st_union(i.geom)
      )
    ) as Area_sqm 
  from 
    intersects i 
  group by 
    i.invasive_plant, 
    i.agency
);
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    set search_path=invasivesbc,public;

    DROP view if exists invasivesbc.jurisdiction_species;
    DROP view if exists invasivesbc.regional_districts_species_area;
    DROP view if exists invasivesbc.riso_species_area;

    `);
}

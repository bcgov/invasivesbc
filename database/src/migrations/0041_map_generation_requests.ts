import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  //language=PostgreSQL
  await knex.raw(
    `
      set search_path = invasivesbc,public;

      create type invasivesbc.map_tile_type as enum ('VECTOR', 'RASTER');
      comment on type invasivesbc.map_tile_type is 'distinguish between raster and vector map generation requests. raster currently unimplemented';

      create type invasivesbc.map_archive_type as enum ('PMTILES');
      comment on type invasivesbc.map_archive_type is 'package format of generated map';

      create type invasivesbc.generation_request_status as enum ('NEW', 'INCOMPLETE', 'READY', 'PROCESSING', 'SUCCEEDED', 'FAILED');
      comment on type invasivesbc.generation_request_status is 'workflow status of map generation request';

      create type invasivesbc.generation_request_audience as enum ('PUBLIC', 'PRIVATE');
      comment on type invasivesbc.generation_request_audience is 'is the map public or intended for a single user?';


      create table invasivesbc.map_generation_request
      (
        id           uuid primary key                   default gen_random_uuid(),
        minimum_zoom int8                      not null default 0 check (minimum_zoom >= 0 and minimum_zoom <= 24),
        maximum_zoom int8                      not null default 10 check (maximum_zoom >= 0 and maximum_zoom <= 24),
        bbox         geography(polygon, 4326)  not null default ST_MakeEnvelope(-139.06, 48.30, -114.03, 60.00, 4326), -- rough extent of BC
        format       map_tile_type             not null default 'VECTOR',
        archive_type map_archive_type          not null default 'PMTILES',
        created      timestamp                 not null default current_timestamp,
        updated      timestamp                 not null default current_timestamp,
        expires      date                      null,
        status       generation_request_status not null default 'NEW',
        audience     generation_request_audience        default 'PRIVATE',
        created_by   integer                   null references invasivesbc.application_user (user_id) on update cascade on delete restrict,
        check ( maximum_zoom >= minimum_zoom )
      );
      comment on table invasivesbc.map_generation_request is 'each row represents the metadata required to generate a map archive and the status of the generation request. rows will be expired and deleted after a period of time.';


      create table invasivesbc.generated_map
      (
        id                 int8 primary key generated always as identity,
        generation_request uuid         not null references invasivesbc.map_generation_request (id) on update cascade on delete cascade,
        filename           varchar(255) not null unique
      );
      comment on table invasivesbc.generated_map is 'after a map generation request has completed, this will be used to track the location (on disk or in an object store) of the generated archive file.';

      create type invasivesbc.vector_data_source_mode as enum ('ALL', 'ALL_ACTIVITIES', 'ALL_IAPP', 'MY_ACTIVITIES', 'PUBLIC', 'PUBLIC_ACTIVITIES', 'PUBLIC_IAPP', 'IDLIST', 'JSON_FILTEROBJECT');
      comment on type invasivesbc.vector_data_source_mode is 'how the activities in a vector map generation request are sourced. filterobject is unimplemented.';

      create table invasivesbc.vector_data_source
      (
        id                 int8 primary key generated always as identity,
        generation_request uuid                    not null references invasivesbc.map_generation_request (id) on update cascade on delete cascade,
        mode               vector_data_source_mode not null default 'ALL_ACTIVITIES'
      );
      comment on table invasivesbc.vector_data_source is 'track the source data used in the generation of a vector map';


      create table invasivesbc.vector_data_source_activity_id
      (
        vector_data_source        int8    not null references invasivesbc.vector_data_source (id) on update cascade on delete cascade,
        activity_incoming_data_id integer not null references invasivesbc.activity_incoming_data (activity_incoming_data_id) on update cascade on delete cascade
      );
      comment on table invasivesbc.vector_data_source_activity_id is 'supplement vector data source by mapping an activity into a dataset (when mode is idlist)';


      create function invasivesbc.activity_geojson(integer) returns json as
      $$
      declare
        result json;
      begin
        with activity_details
               as (select st_transform(a.geog::geometry, 4326),
                          a.short_id                                     as id,
                          a.activity_type                                as activityType,
                          a.species_positive                             as speciesPositive,
                          a.species_negative                             as speciesNegative,
                          a.species_positive_full                        as speciesPositiveFull,
                          a.species_negative_full                        as speciesNegativeFull,
                          a.jurisdiction_display                         as jurisdiction,
                          a.regional_invasive_species_organization_areas as RISO,
                          a.agency                                       as agency,
                          a.regional_districts                           as regionalDistricts,
                          a.map_symbol                                   as map_symbol,
                          a.moti_districts                               as MOTIDistricts,
                          a.flnro_districts                              as FLNRODistricts
                   from activity_incoming_data as a
                   where a.activity_incoming_data_id = $1
                   limit 1)
        select st_asgeojson(activity_details.*) as feature
        from activity_details
        into result;

        return result;

      end;
      $$
        language plpgsql;

      comment on function invasivesbc.activity_geojson is 'convenience function to generate valid geojson for an activity (by activity_incoming_data_id)';
    `
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(
    //language=PostgreSQL
    `
      drop function if exists invasivesbc.activity_geojson(integer);

      drop table if exists invasivesbc.vector_data_source_activity_id;
      drop table if exists invasivesbc.vector_data_source;
      drop table if exists invasivesbc.generated_map;
      drop table if exists invasivesbc.map_generation_request;

      drop type if exists invasivesbc.vector_data_source_mode;
      drop type if exists invasivesbc.generation_request_audience;
      drop type if exists invasivesbc.generation_request_status;
      drop type if exists invasivesbc.map_archive_type;
      drop type if exists invasivesbc.map_tile_type;
    `
  );
}

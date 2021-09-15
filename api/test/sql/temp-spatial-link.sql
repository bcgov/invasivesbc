/* spatial-link.sql
  Logic for spatially linking records of the same species
  within a certain distance from eachother.
 */

/*
  Deletes
  1. Create an exploaded layer of positives
  2. Create an exploaded layer of negatives
*/
-- Positive Layer
drop table if exists test_spatial_expload_positive;
create table test_spatial_expload_positive as
  select 
    activity_subtype,
    created_timestamp,
    jsonb_array_elements(to_jsonb(species_positive)) "species", -- Explode species
    geometry(geog) "geom" -- Convert to Geometry (EPSG:4326)
  from
    activity_incoming_data
  where
    activity_type = 'Observation' and -- Observations for now
    deleted_timestamp is null and -- Not deleted
    array_length( -- At least one species registered
      species_positive, 1
    ) > 0
  ;

-- Add indexes and IDs
drop index if exists test_spatial_explode_positive_geom_gist;
create index test_spatial_explode_positive_geom_gist on test_spatial_expload_positive using gist ("geom");

alter table test_spatial_expload_positive add column gid serial;
alter table test_spatial_expload_positive add primary key (gid);


-- Negative Layer
drop table if exists test_spatial_expload_negative;
create table test_spatial_expload_negative as
  select 
    activity_subtype,
    created_timestamp,
    jsonb_array_elements(to_jsonb(species_negative)) "species",
    geometry(geog) "geom"
  from
    activity_incoming_data
  where
    activity_type = 'Observation' and
    deleted_timestamp is null and
    array_length(
      species_negative, 1
    ) > 0
  ;

drop index if exists test_spatial_explode_negative_geom_gist;
create index test_spatial_explode_negative_geom_gist on test_spatial_expload_negative using gist ("geom");

alter table test_spatial_expload_negative add column gid serial;
alter table test_spatial_expload_negative add primary key (gid);



/*********** Run the deletion **************/
drop table if exists test_spatial_positive_negative;
create table test_spatial_positive_negative as
select
  pos.species #>> '{}' "species",
  case  -- If there is over, delete, otherwise pass through
    when st_intersects(pos.geom,neg.geom)
    then st_difference(pos.geom,neg.geom)
    else pos.geom
    end
from
  test_spatial_expload_positive pos left outer join -- This allows the pass through
  test_spatial_expload_negative neg
  on
    st_intersects(pos.geom,neg.geom) and
    pos.species = neg.species and
    pos.created_timestamp > neg.created_timestamp -- Only delete new negatives
;

drop index if exists test_spatial_explode_positive_negative_geom_gist;
create index test_spatial_explode_positive_negative_geom_gist on test_spatial_expload_positive_negative using gist ("geom");

alter table test_spatial_expload_positive_negative add column gid serial;
alter table test_spatial_expload_positive_negative add primary key (gid);



/*********** Merge everything together **************/
drop table if exists test_spatial_merge;
create table test_spatial_merge as
select
  species,
  st_collectionExtract( -- Convert from GeometryCollection to MultiPolygon
    unnest( -- Convert from an array to GeometryCollection
      st_clusterWithin( -- Cluster within 50 meters
        st_transform(geom,3005) -- Convert to Albers to get meters
      ,50)
    )
  ,3) "geom"
from
  test_spatial_positive_negative
group by
  species
;




/*********** Not using the json lookup anymore **************/
-- select 
--   activity_subtype,
--   jsonb_array_elements(activity_payload -> 'species_positive') "species"
-- from
--   activity_incoming_data
-- where
--   activity_type = 'Observation' and
--   deleted_timestamp is null and
--   json_array_length(
--     to_json(activity_payload -> 'species_positive')
--   ) > 0
-- ;

-- Testing the array length insert logic
-- select 
--   activity_subtype,
--   species_positive "species",
--   array_length(species_positive, 1) "length"
-- from
--   activity_incoming_data
-- where
--   activity_type = 'Observation' and
--   deleted_timestamp is null and
--   array_length(
--     species_positive, 1
--   ) > 0
-- ;

-- Select all positive species observations
-- select 
--   activity_subtype,
--   activity_payload -> 'species_positive' "species"
-- from
--   activity_incoming_data
-- where
--   activity_type = 'Observation' and
--   deleted_timestamp is null and
--   json_array_length(
--     to_json(activity_payload -> 'species_positive')
--   ) > 0
-- ;

-- Select all negative species observations
-- select 
--   activity_subtype,
--   activity_payload -> 'species_negative' "no species"
-- from
--   activity_incoming_data
-- where
--   activity_type = 'Observation' and
--   deleted_timestamp is null and
--   json_array_length(
--     to_json(activity_payload -> 'species_negative')
--   ) > 0
-- ;

-- select * from activity_incoming_data where activity_incoming_data_id = 3470;

-- Dump table with test code
-- pg_dump --dbname=InvasivesBC --username=invasivebc --table=invasivesbc.activity_incoming_data --column-inserts --data-only > /tmp/activity_dump.sql

/* spatial-link-treatments.sql
  Logic for spatially linking records of the same species
  within a certain distance from eachother.
 */

/**
  Took me a while to find where this data was.
  Will need to create a separate spatial link query
  to split up the following
  form_data->activity_subtype_data->mechanical_plant_information->[
    - invasive_plant_code
    - mechanical_disposal_code
    - mechanical_method_code
    - treated_area
  ]
**/

-- Spread the species into separate records
drop table if exists spatial_explode;
create table spatial_explode as
select
  activity_incoming_data_id,
  created_timestamp,
  jsonb_array_elements(
    activity_payload->
      'form_data'->
      'activity_subtype_data'->
      'mechanical_plant_information'
  ) "treatment",
  geometry(geog) "geom" -- Convert to Geometry (EPSG:4326)
from
  activity_incoming_data
where
  deleted_timestamp is null and -- Not deleted
  activity_type = 'Treatment' and -- Treatments
  activity_subtype = 'Activity_Treatment_MechanicalPlant' and
  jsonb_array_length(
    activity_payload->
      'form_data'->
      'activity_subtype_data'->
      'mechanical_plant_information'
  ) > 0
;

-- Add indexes and IDs
drop index if exists spatial_explode_geom_gist;
create index spatial_explode_geom_gist on spatial_explode using gist ("geom");

alter table spatial_explode add column gid serial;
alter table spatial_explode add primary key (gid);

/*********** Merge everything together **************/
drop table if exists treatments_by_species;
create table treatments_by_species as
select
  treatment->>'invasive_plant_code' "species",
  max(created_timestamp) "max_created_timestamp",
  array_agg(activity_incoming_data_id) "activity_ids", -- Collect original IDs 
  st_unaryUnion( -- Remove embedded linework
    st_collectionExtract( -- Convert from GeometryCollection to MultiPolygons
      unnest( -- Convert from an array to GeometryCollection
        st_clusterWithin( -- Cluster within 50 meters
          st_transform(geom,3005) -- Convert to Albers to get meters
        ,50)
      )
    ,3)
  ) "geom"
from
  spatial_explode
group by
  treatment->>'invasive_plant_code'
;

drop index if exists treatments_by_species_geom_gist;
create index treatments_by_species_geom_gist on treatments_by_species using gist ("geom");

alter table treatments_by_species add column gid serial;
alter table treatments_by_species add primary key (gid);


-- Temp query
-- select
--   count(created_timestamp)
-- from
--   activity_incoming_data
-- where
--   ''
-- order by
--   created_timestamp desc
-- ;
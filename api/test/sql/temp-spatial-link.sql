/*
  Unnest all species out of the species arrays.
  This creates new rows for every instance in the species array.
*/
drop table if exists invasivesbc.test_spatial_overlay;
create table invasivesbc.test_spatial_overlay as
with unwrapped as (
  select 
    activity_subtype,
    jsonb_array_elements(to_jsonb(species_positive)) "species",
    geometry(geog) "geom"
  from
    activity_incoming_data
  where
    activity_type = 'Observation' and
    deleted_timestamp is null and
    array_length(
      species_positive, 1
    ) > 0
)
select
  species #>> '{}' "species", -- Convert from jsonb to text
  public.st_union(geom) "geom"
from
  unwrapped
group by
  species
;

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
    jsonb_array_elements(to_jsonb(species_positive)) "species",
    geometry(geog) "geom"
  from
    activity_incoming_data
  where
    activity_type = 'Observation' and
    deleted_timestamp is null and
    array_length(
      species_positive, 1
    ) > 0
  ;

drop index if exists test_spatial_explode_positive_geom_gist;
create index test_spatial_explode_positive_geom_gist on test_spatial_expload_positive using gist ("geom");

alter table test_spatial_expload_positive add column gid serial;
alter table test_spatial_expload_positive add primary key (gid);


-- Negative Layer
drop table if exists test_spatial_expload_negative;
create table test_spatial_expload_negative as
  select 
    activity_subtype,
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


drop table if exists test_spatial_positive_negative;
create table test_spatial_positive_negative as
select
  pos.species,
  case 
    when st_intersects(pos.geom,neg.geom) -- and -- TODO: Date difference here
    then st_difference(pos.geom,neg.geom)
    else pos.geom
    end
from
  test_spatial_expload_positive pos join
  test_spatial_expload_negative neg
  on st_intersects(pos.geom,neg.geom)
;
/* NEXT STEPS
  1. Simplify (remove) case statement
  2. Replace st_intersect with st_within
  3. Add date
  4. Where statement to compare species
*/

/*********** End of Delete section **************/


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
select 
  activity_subtype,
  activity_payload -> 'species_positive' "species"
from
  activity_incoming_data
where
  activity_type = 'Observation' and
  deleted_timestamp is null and
  json_array_length(
    to_json(activity_payload -> 'species_positive')
  ) > 0
;

-- Select all negative species observations
select 
  activity_subtype,
  activity_payload -> 'species_negative' "no species"
from
  activity_incoming_data
where
  activity_type = 'Observation' and
  deleted_timestamp is null and
  json_array_length(
    to_json(activity_payload -> 'species_negative')
  ) > 0
;

select * from activity_incoming_data where activity_incoming_data_id = 3470;

-- Dump table with test code
-- pg_dump --dbname=InvasivesBC --username=invasivebc --table=invasivesbc.activity_incoming_data --column-inserts --data-only > /tmp/activity_dump.sql


-- activity_observation_aquaticplant_with_codes
SELECT
  activity_incoming_data.activity_id
  activity_incoming_data.version
  btrim((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'invasive_plant_code'::text)::text
  btrim((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'specific_use_code'::text)::text
  btrim((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'proposed_treatment_code'::text)::text
  ((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'flowering'::text)::text)::boolean AS flowering
  btrim((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'plant_life_stage_code'::text)::text
  btrim((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'plant_health_code'::text)::text
  btrim((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'plant_seed_stage_code'::text)::text
  btrim((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'range_unit_number'::text)::text
  ((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'legacy_site_ind'::text)::text)::boolean AS legacy_site_ind
  ((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'early_detection_rapid_resp_ind'::text)::text)::boolean AS early_detection_rapid_resp_ind
  ((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'research_detection_ind'::text)::text)::boolean AS research_detection_ind
  btrim((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'sample_point_number'::text)::text
  ((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'special_care_ind'::text)::text)::boolean AS special_care_ind
  ((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'biological_ind'::text)::text)::boolean AS biological_ind
  ((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'secchi_depth'::text)::text)::numeric AS secchi_depth
  ((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'water_depth'::text)::text)::numeric AS water_depth
  ((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'voucher_submitted_ind'::text)::text)::boolean AS voucher_submitted_ind
  btrim((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'voucher_submission_detail'::text)::text, '"'::text) AS voucher_submission_detail
FROM
  activity_incoming_data
WHERE
  activity_incoming_data.activity_type::text = 'Observation'::text AND
  activity_incoming_data.activity_subtype::text = 'Activity_Observation_PlantAquatic'::text AND
  activity_incoming_data.deleted_timestamp IS NULL;

-- activity_observation_terrestrialplant_with_codes
SELECT
  activity_incoming_data.activity_id
  activity_incoming_data.version
  btrim((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'invasive_plant_code'::text)::text
  btrim((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'invasive_plant_density_code'::text)::text
  btrim((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'invasive_plant_distribution_code'::text)::text
  btrim((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'soil_texture_code'::text)::text
  btrim((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'specific_use_code'::text)::text
  btrim((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'slope_code'::text)::text
  btrim((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'aspect_code'::text)::text
  btrim((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'proposed_treatment_code'::text)::text
  btrim((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'range_unit_number'::text)::text
  btrim((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'plant_life_stage_code'::text)::text
  btrim((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'plant_health_code'::text)::text
  btrim((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'plant_seed_stage_code'::text)::text
  ((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'flowering'::text)::text)::boolean AS flowering
  ((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'legacy_site_ind'::text)::text)::boolean AS legacy_site_ind
  ((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'early_detection_rapid_resp_ind'::text)::text)::boolean AS early_detection_rapid_resp_ind
  ((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'research_detection_ind'::text)::text)::boolean AS research_detection_ind
  ((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'well_ind'::text)::text)::boolean AS well_ind
  ((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'special_care_ind'::text)::text)::boolean AS special_care_ind
  ((((activity_incoming_data.activity_payload::json -> 'form_data'::text) -> 'activity_subtype_data'::text) -> 'biological_ind'::text)::text)::boolean AS biological_ind
FROM
  activity_incoming_data
WHERE
  activity_incoming_data.activity_type::text = 'Observation'::text AND
  activity_incoming_data.activity_subtype::text = 'Activity_Observation_PlantTerrestrial'::text AND
  activity_incoming_data.deleted_timestamp IS NULL;

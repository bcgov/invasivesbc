CREATE OR REPLACE VIEW invasive_terrestrial_plant_observation_specific_fields_view as (
select 
'banana' as activity_id,
'banana' as species,
'banana' as distribution,
'banana' as density,
'banana' as soil_texture,
'banana' as slope,
'banana' as aspect,
'banana' as flowering,
'banana' as specific_use,
'banana' as proposed_action,
'banana' as seed_stage,
'banana' as plant_health,
'banana' as plant_life_stage,
'banana' as early_detection,
'banana' as research,
'banana' as well_on_site_ind,
'banana' as special_care_ind,
'banana' as biological_care_ind,
'banana' as legacy_site_ind,
'banana' as range_unit

from activity_incoming_data
where activity_incoming_data.activity_type = 'Observation' and activity_incoming_data.activity_sub_type = 'Terrestrial Plant Observation'
)
COMMENT ON VIEW invasive_terrestrial_plant_observation_specific_fields_view IS 'View on fields specific to invasive terrestrial plant of observations, with table activity_incoming_data as source.';

-- activity_basic (1)
SELECT
  activity_id,
  short_id,
  activity_type,
  activity_subtype,
  created_by,
CASE
 WHEN deleted_timestamp IS NOT NULL THEN 'Deleted'
 ELSE form_status
END AS form_status,
(activity_payload->'form_data'->'activity_data'->>'activity_date_time')::timestamptz AS activity_date,
(activity_payload->'form_data'->'activity_data'->>'access_description')::text AS access_description,
(activity_payload->'form_data'->'activity_data'->>'general_comment')::text AS comment,
created_timestamp::timestamptz,
received_timestamp::timestamptz,
deleted_timestamp::timestamptz,
FROM invasivesbc.activity_incoming_data
WHERE 
  iscurrent

-- linked_record 1:1
SELECT
activity_id,
(activity_payload->'form_data'->'activity_type_data'->>'linked_id') AS linked_id
FROM invasivesbc.activity_incoming_data
WHERE 
  iscurrent
  AND (activity_payload->'form_data'->'activity_type_data'->>'linked_id') IS NOT NULL
  AND (activity_payload->'form_data'->'activity_type_data'->>'linked_id') <> ''

-- jurisdictions 1:m
SELECT
  aid.activity_id,
  gen_random_uuid() AS surrogate,
  j.value->>'jurisdiction_code' AS jurisdiction,
  j.value->>'percent_covered' AS percent_covered
FROM invasivesbc.activity_incoming_data aid
CROSS JOIN LATERAL jsonb_array_elements(aid.activity_payload->'form_data'->'activity_data'->'jurisdictions') j(value)
WHERE
  aid.iscurrent
  AND jsonb_typeof(aid.activity_payload->'form_data'->'activity_data'->'jurisdictions') = 'array'
  AND (
    j.value->>'jurisdiction_code' IS NOT NULL
    OR j.value->>'percent_covered' IS NOT NULL
  )

-- funding agency 1:m
SELECT
  aid.activity_id,
  a.code AS funding_agency
FROM invasivesbc.activity_incoming_data aid
CROSS JOIN LATERAL string_to_table(aid.activity_payload->'form_data'->'activity_data'->>'invasive_species_agency_code', ',') AS a(code)
WHERE 
  iscurrent AND
  aid.activity_payload->'form_data'->'activity_data'->>'invasive_species_agency_code' IS NOT NULL

-- employer 1:1
SELECT 
  aid.activity_id,
  aid.activity_payload->'form_data'->'activity_data'->>'employer_code' AS employer
FROM invasivesbc.activity_incoming_data aid
WHERE 
  aid.iscurrent
  AND aid.activity_payload->'form_data'->'activity_data'->>'employer_code' IS NOT NULL

-- project_code
SELECT
  aid.activity_id,
  gen_random_uuid() AS surrogate,
  j.value->>'description' AS description
FROM invasivesbc.activity_incoming_data aid
CROSS JOIN LATERAL jsonb_array_elements(aid.activity_payload->'form_data'->'activity_data'->'project_code') j(value)
WHERE aid.iscurrent
  AND jsonb_typeof(aid.activity_payload->'form_data'->'activity_data'->'project_code') = 'array'
  AND j.value->>'description' IS NOT NULL


-- participant
  -- will require most work

-- activity_geometry
SELECT 
  aid.activity_id,
  aid.centroid,
  aid.geom as geom_3005,
  aid.geog as geom_4326,
  (aid.activity_payload->'form_data'->'activity_data'->>'reported_area')::integer AS area_m,
  (aid.activity_payload->'form_data'->'activity_data'->>'utm_zone')::smallint AS utm_zone,
  (aid.activity_payload->'form_data'->'activity_data'->>'utm_easting')::integer AS utm_easting,
  (aid.activity_payload->'form_data'->'activity_data'->>'utm_northing')::integer AS utm_northing,
  (aid.activity_payload->'form_data'->'activity_data'->>'latitude')::double precision AS latitude,
  (aid.activity_payload->'form_data'->'activity_data'->>'longitude')::double precision AS longitude,
  (aid.activity_payload->'form_data'->'activity_data'->>'location_description')::text AS location_description
FROM invasivesbc.activity_incoming_data aid
WHERE
  iscurrent
  AND (
    aid.geom IS NOT NULL OR
    aid.geog IS NOT NULL OR
    aid.centroid IS NOT NULL OR
    (aid.activity_payload->'form_data'->'activity_data'->>'location_description')::text IS NOT NULL
  )

-- Project code

SELECT
  aid.activity_id,
  gen_random_uuid() AS surrogate,
  j.value->>'description' AS description
FROM invasivesbc.activity_incoming_data aid
CROSS JOIN LATERAL jsonb_array_elements(aid.activity_payload->'form_data'->'activity_data'->'project_code') j(value)
WHERE
  aid.iscurrent
  AND jsonb_typeof(aid.activity_payload->'form_data'->'activity_data'->'project_code') = 'array'
  AND (
    j.value->>'description' IS NOT NULL
    OR j.value->>'description' <> ''
  )

-- platform
  SELECT 
    activity_id,
    platform_src as src
  FROM invasivesbc.activity_incoming_data
  WHERE iscurrent

-- regional_details

SELECT 
	activity_id,
	biogeoclimatic_zones,
	invasive_plant_management_areas,
	ownership,
	regional_districts,
	flnro_districts,
	moti_districts,
	elevation::integer
FROM invasivesbc.activity_incoming_data
WHERE 
	iscurrent and (
    biogeoclimatic_zones IS NOT NULL OR
    invasive_plant_management_areas IS NOT NULL OR
    ownership IS NOT NULL OR
    regional_districts IS NOT NULL OR
    flnro_districts IS NOT NULL OR
    moti_districts IS NOT NULL OR
    elevation IS NOT NULL
	)

-- riso_areas
SELECT
  aid.activity_id,
  a.code as riso_area
FROM invasivesbc.activity_incoming_data aid
CROSS JOIN LATERAL string_to_table(aid.regional_invasive_species_organization_areas, ', ') AS a(code)
WHERE 
  iscurrent AND
  aid.activity_payload->'form_data'->'activity_data'->>'invasive_species_agency_code' IS NOT NULL

-- batch
SELECT
  activity_id,
  batch_id,
  row_number AS row_id
FROM  invasivesbc.activity_incoming_data
WHERE
  iscurrent AND
  batch_id IS NOT NULL

-- terrestrial observation type
SELECT
  aid.activity_id,
  gen_random_uuid() AS surrogate,
  j.value->>'observation_type' AS observation_type,
  j.value->>'invasive_plant_code' AS plant_code
FROM invasivesbc.activity_incoming_data aid
CROSS JOIN LATERAL jsonb_array_elements(aid.activity_payload->'form_data'->'activity_subtype_data'->'TerrestrialPlants') j(value)
WHERE
  aid.iscurrent
  AND jsonb_typeof(aid.activity_payload->'form_data'->'activity_subtype_data'->'TerrestrialPlants') = 'array'
  AND j.value->>'observation_type' IS NOT NULL AND
  activity_subtype = 'Activity_Observation_PlantTerrestrial'

-- aquatic observation type 
SELECT
  aid.activity_id,
  gen_random_uuid() AS surrogate,
  j.value->>'observation_type' AS observation_type,
  j.value->>'invasive_plant_code' AS plant_code
FROM invasivesbc.activity_incoming_data aid
CROSS JOIN LATERAL jsonb_array_elements(aid.activity_payload->'form_data'->'activity_subtype_data'->'AquaticPlants') j(value)
WHERE
  aid.iscurrent
  AND jsonb_typeof(aid.activity_payload->'form_data'->'activity_subtype_data'->'AquaticPlants') = 'array'
  AND j.value->>'observation_type' IS NOT NULL AND
  activity_subtype = 'Activity_Observation_PlantAquatic'

-- AQUATIC OBSERVATION WATERBODY DATA 
-- waterbody_outflow_code_permanent
SELECT
  aid.activity_id,
  gen_random_uuid() as surrogate,
  a.code AS outflow_code
FROM invasivesbc.activity_incoming_data aid
CROSS JOIN LATERAL string_to_table(aid.activity_payload->'form_data'->'activity_subtype_data'->'WaterbodyData'->>'outflow', ',') AS a(code)
WHERE 
  iscurrent AND
  aid.activity_payload->'form_data'->'activity_subtype_data'->'WaterbodyData'->>'outflow' IS NOT NULL AND
  activity_subtype = 'Activity_Observation_PlantAquatic'

-- waterbody_outflow_seasonal
SELECT
  aid.activity_id,
  gen_random_uuid() as surrogate,
  a.code AS outflow
FROM invasivesbc.activity_incoming_data aid
CROSS JOIN LATERAL string_to_table(aid.activity_payload->'form_data'->'activity_subtype_data'->'WaterbodyData'->>'outflow_other', ',') AS a(code)
WHERE 
  iscurrent AND
  aid.activity_payload->'form_data'->'activity_subtype_data'->'WaterbodyData'->>'outflow_other' IS NOT NULL AND
  activity_subtype = 'Activity_Observation_PlantAquatic'


-- waterbody_inflow_permanent
SELECT
  aid.activity_id,
  gen_random_uuid() as surrogate,
  a.code AS inflow_code
FROM invasivesbc.activity_incoming_data aid
CROSS JOIN LATERAL string_to_table(aid.activity_payload->'form_data'->'activity_subtype_data'->'WaterbodyData'->>'inflow_permanent', ',') AS a(code)
WHERE 
  iscurrent AND
  aid.activity_payload->'form_data'->'activity_subtype_data'->'WaterbodyData'->>'inflow_permanent' IS NOT NULL AND
  activity_subtype = 'Activity_Observation_PlantAquatic'

  -- waterbody_inflow_code_seasonal
SELECT
  aid.activity_id,
  gen_random_uuid() as surrogate,
  a.code AS inflow_code
FROM invasivesbc.activity_incoming_data aid
CROSS JOIN LATERAL string_to_table(aid.activity_payload->'form_data'->'activity_subtype_data'->'WaterbodyData'->>'inflow_other', ',') AS a(code)
WHERE 
  iscurrent AND
  aid.activity_payload->'form_data'->'activity_subtype_data'->'WaterbodyData'->>'inflow_other' IS NOT NULL AND
  activity_subtype = 'Activity_Observation_PlantAquatic'

-- waterbody_substrate_level
SELECT
  aid.activity_id,
  gen_random_uuid() as surrogate,
  a.code AS substrate_code
FROM invasivesbc.activity_incoming_data aid
CROSS JOIN LATERAL string_to_table(aid.activity_payload->'form_data'->'activity_subtype_data'->'WaterbodyData'->>'substrate_type', ',') AS a(code)
WHERE 
  iscurrent AND
  aid.activity_payload->'form_data'->'activity_subtype_data'->'WaterbodyData'->>'substrate_type' IS NOT NULL AND
  activity_subtype = 'Activity_Observation_PlantAquatic'

-- waterbody_adjacent_land_use
SELECT
  aid.activity_id,
  gen_random_uuid() as surrogate,
  a.code AS adjacent_land_use_code
FROM invasivesbc.activity_incoming_data aid
CROSS JOIN LATERAL string_to_table(aid.activity_payload->'form_data'->'activity_subtype_data'->'WaterbodyData'->>'adjacent_land_use', ',') AS a(code)
WHERE 
  iscurrent AND
  aid.activity_payload->'form_data'->'activity_subtype_data'->'WaterbodyData'->>'adjacent_land_use' IS NOT NULL AND
  activity_subtype = 'Activity_Observation_PlantAquatic'

-- waterbody_water_level_management
SELECT
  aid.activity_id,
  gen_random_uuid() as surrogate,
  a.code AS water_level_management_code
FROM invasivesbc.activity_incoming_data aid
CROSS JOIN LATERAL string_to_table(aid.activity_payload->'form_data'->'activity_subtype_data'->'WaterbodyData'->>'water_level_management', ',') AS a(code)
WHERE 
  iscurrent AND
  aid.activity_payload->'form_data'->'activity_subtype_data'->'WaterbodyData'->>'water_level_management' IS NOT NULL AND
  activity_subtype = 'Activity_Observation_PlantAquatic'


-- Suitable for Biocontrol
-- PlantAquatic Forms, correct 'NO' all caps value in transform
SELECT
  aid.activity_id,
  CASE
    WHEN aid.activity_payload->'form_data'->'activity_subtype_data'->'Observation_PlantAquatic_Information'->>'suitable_for_biocontrol_agent' ILIKE 'NO' Then 'No'
    ELSE aid.activity_payload->'form_data'->'activity_subtype_data'->'Observation_PlantAquatic_Information'->>'suitable_for_biocontrol_agent'
  END as suitable_for_biocontrol_agent
FROM invasivesbc.activity_incoming_data aid
WHERE iscurrent
AND aid.activity_payload->'form_data'->'activity_subtype_data'->'Observation_PlantAquatic_Information'->>'suitable_for_biocontrol_agent' IS NOT NULL
-- Terrestrial Entries
SELECT
  aid.activity_id,
  aid.activity_payload->'form_data'->'activity_subtype_data'->'Observation_PlantTerrestrial_Information'->>'suitable_for_biocontrol_agent' as suitable_for_biocontrol_agent
FROM invasivesbc.activity_incoming_data aid
WHERE iscurrent
AND aid.activity_payload->'form_data'->'activity_subtype_data'->'Observation_PlantTerrestrial_Information'->>'suitable_for_biocontrol_agent' IS NOT NULL


-- waterbody_data

SELECT 
  activity_id,
  aid.activity_payload->'form_data'->'activity_subtype_data'->'WaterbodyData'->>'waterbody_type'  AS type,
  aid.activity_payload->'form_data'->'activity_subtype_data'->'WaterbodyData'->>'waterbody_name_gazetted'  AS name_gazetted,
  aid.activity_payload->'form_data'->'activity_subtype_data'->'WaterbodyData'->>'waterbody_name_local'  AS name_local,
  aid.activity_payload->'form_data'->'activity_subtype_data'->'WaterbodyData'->>'waterbody_access'  AS access,
  aid.activity_payload->'form_data'->'activity_subtype_data'->'WaterQuality'->>'water_sample_depth'  AS max_depth_m,
  aid.activity_payload->'form_data'->'activity_subtype_data'->'WaterQuality'->>'secchi_depth'  AS secchi_depth,
  aid.activity_payload->'form_data'->'activity_subtype_data'->'WaterQuality'->>'water_colour'  AS colour,
  aid.activity_payload->'form_data'->'activity_subtype_data'->'WaterbodyData'->>'tidal_influence'  AS tidal_influence,
  aid.activity_payload->'form_data'->'activity_subtype_data'->'WaterbodyData'->>'comment'  AS comment
FROM invasivesbc.activity_incoming_data aid
WHERE iscurrent
AND activity_subtype = 'Activity_Observation_PlantAquatic'
AND (
  aid.activity_payload->'form_data'->'activity_subtype_data'->'WaterbodyData'->>'waterbody_type' IS NOT NULL OR
  aid.activity_payload->'form_data'->'activity_subtype_data'->'WaterbodyData'->>'waterbody_name_gazetted' IS NOT NULL OR
  aid.activity_payload->'form_data'->'activity_subtype_data'->'WaterbodyData'->>'waterbody_name_local' IS NOT NULL OR
  aid.activity_payload->'form_data'->'activity_subtype_data'->'WaterbodyData'->>'waterbody_access' IS NOT NULL OR
  aid.activity_payload->'form_data'->'activity_subtype_data'->'WaterQuality'->>'water_sample_depth' IS NOT NULL OR
  aid.activity_payload->'form_data'->'activity_subtype_data'->'WaterQuality'->>'secchi_depth' IS NOT NULL OR
  aid.activity_payload->'form_data'->'activity_subtype_data'->'WaterQuality'->>'water_colour' IS NOT NULL OR
  aid.activity_payload->'form_data'->'activity_subtype_data'->'WaterbodyData'->>'tidal_influence' IS NOT NULL OR
  aid.activity_payload->'form_data'->'activity_subtype_data'->'WaterbodyData'->>'comment' IS NOT NULL
)

-- ter_plant_observation_detail

SELECT 
  activity_id,
  gen_random_uuid() as surrogate,
  j.value->>'invasive_plant_code' AS invasive_plant,
  j.value->>'invasive_plant_density_code' AS density,
  j.value->>'invasive_plant_distribution_code' AS distribution,
  j.value->>'plant_life_stage_code' AS life_stage
FROM
  invasivesbc.activity_incoming_data aid
  CROSS JOIN LATERAL jsonb_array_elements(aid.activity_payload->'form_data'->'activity_subtype_data'->'TerrestrialPlants') j(value)
WHERE
  iscurrent AND 
  activity_subtype = 'Activity_Observation_PlantTerrestrial' AND (
    j.value->>'invasive_plant_code' IS NOT NULL OR
    j.value->>'invasive_plant_density_code' IS NOT NULL OR
    j.value->>'invasive_plant_distribution_code' IS NOT NULL OR
    j.value->>'plant_life_stage_code' IS NOT NULL
  )

-- aq_plant_observation_detail

SELECT 
  activity_id,
  gen_random_uuid() as surrogate,
  j.value->>'invasive_plant_code' AS invasive_plant,
  j.value->>'invasive_plant_density_code' AS density,
  j.value->>'invasive_plant_distribution_code' AS distribution,
  j.value->>'plant_life_stage_code' AS life_stage,
  j.value->>'sample_point_id' AS sample_point_collection_id
FROM
  invasivesbc.activity_incoming_data aid
  CROSS JOIN LATERAL jsonb_array_elements(aid.activity_payload->'form_data'->'activity_subtype_data'->'AquaticPlants') j(value)
WHERE
  iscurrent AND 
  activity_subtype = 'Activity_Observation_PlantAquatic' AND (
    j.value->>'invasive_plant_code' IS NOT NULL OR
    j.value->>'invasive_plant_density_code' IS NOT NULL OR
    j.value->>'invasive_plant_distribution_code' IS NOT NULL OR
    j.value->>'plant_life_stage_code' IS NOT NULL OR
    j.value->>'sample_point_id' IS NOT NULL
  )


-- ter_plant_mech_treatment
SELECT 
  activity_id,
  gen_random_uuid() as surrogate,
  j.value->>'invasive_plant_code' AS invasive_plant,
  j.value->>'treated_area' AS treated_area_msq,
  j.value->>'mechanical_method_code' AS mechanical_method,
  j.value->>'mechanical_disposal_code' AS disposal_method,
  j.value->'disposed_material'->'disposed_material_input_format' AS disposed_material_format,
  j.value->'disposed_material'->'disposed_material_input_number' AS disposed_material_amount
FROM
  invasivesbc.activity_incoming_data aid
CROSS JOIN LATERAL
  jsonb_array_elements(aid.activity_payload->'form_data'->'activity_subtype_data'->'Treatment_MechanicalPlant_Information') j(value)
WHERE iscurrent AND 
activity_subtype = 'Activity_Treatment_MechanicalPlantTerrestrial' AND (
  j.value->>'invasive_plant_code' IS NOT NULL OR
  j.value->>'treated_area' IS NOT NULL OR
  j.value->>'mechanical_method_code' IS NOT NULL OR
  j.value->>'mechanical_disposal_code' IS NOT NULL OR
  j.value->'disposed_material'->>'disposed_material_input_format' IS NOT NULL OR
  j.value->'disposed_material'->>'disposed_material_input_number' IS NOT NULL
) 

-- aq_plant_mech_treatment
SELECT 
  activity_id,
  gen_random_uuid() as surrogate,
  j.value->>'invasive_plant_code' AS invasive_plant,
  j.value->>'treated_area' AS treated_area_msq,
  j.value->>'mechanical_method_code' AS mechanical_method,
  j.value->>'mechanical_disposal_code' AS disposal_method,
  j.value->'disposed_material'->>'disposed_material_input_format' AS disposed_material_format,
  j.value->'disposed_material'->>'disposed_material_input_number' AS disposed_material_amount
FROM
  invasivesbc.activity_incoming_data aid
CROSS JOIN LATERAL
  jsonb_array_elements(aid.activity_payload->'form_data'->'activity_subtype_data'->'Treatment_MechanicalPlant_Information') j(value)
WHERE iscurrent AND 
activity_subtype = 'Activity_Treatment_MechanicalPlantAquatic' AND (
  j.value->>'invasive_plant_code' IS NOT NULL OR
  j.value->>'treated_area' IS NOT NULL OR
  j.value->>'mechanical_method_code' IS NOT NULL OR
  j.value->>'mechanical_disposal_code' IS NOT NULL OR
  j.value->'disposed_material'->>'disposed_material_input_format' IS NOT NULL OR
  j.value->'disposed_material'->>'disposed_material_input_number' IS NOT NULL
)

-- aq_plant_mech_treatment_auth
SELECT
  activity_id,
  activity_payload->'form_data'->'activity_subtype_data'->'Authorization_Infotmation'->>'additional_auth_information' -- sic typo
FROM
  invasivesbc.activity_incoming_data
WHERE 
  iscurrent AND
  activity_subtype = 'Activity_Treatment_MechanicalPlantAquatic' AND
  activity_payload->'form_data'->'activity_subtype_data'->'Authorization_Infotmation'->>'additional_auth_information' IS NOT NULL

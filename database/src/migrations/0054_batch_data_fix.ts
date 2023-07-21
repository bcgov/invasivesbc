import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(
    `
    set 
  search_path = invasivesbc, 
  public;
-- date fix
WITH batch_json AS (
  SELECT 
    id, 
    jsonb_array_elements(
      json_representation #> '{rows}') AS batch_rows
      FROM 
        batch_uploads
    ), 
    batch_select AS (
      SELECT 
        batch_rows #>> '{data,Basic - Date}' AS batch_date,
        batch_rows #>> '{rowIndex}' AS batch_index,
        id 
      FROM 
        batch_json
    ), 
    payload_select AS (
      SELECT 
        activity_payload #>> '{form_data,activity_data,activity_date_time}' AS blob_date,
        batch_id, 
        row_number 
      FROM 
        activity_incoming_data 
      WHERE 
        batch_id IS NOT NULL
    ) 
  UPDATE 
    activity_incoming_data AS a 
  SET 
    activity_payload = jsonb_set(
      a.activity_payload, 
      '{form_data,activity_data,activity_date_time}', 
      to_jsonb(
        concat(b.batch_date, 'T10:00:00-07:00')
      ), 
      false
    ) 
  FROM 
    batch_select AS b 
  WHERE 
    b.id = a.batch_id 
    and a.row_number = b.batch_index :: int - 1 
    AND a.batch_id is not null 
    and a.row_number is not null 
    and a.activity_incoming_data_id in (
      select 
        incoming_data_id 
      from 
        activity_current
    );
-- wind direction fix
UPDATE 
  activity_incoming_data AS a 
SET 
  activity_payload = jsonb_set(
    a.activity_payload, '{form_data,activity_subtype_data,Treatment_ChemicalPlant_Information,wind_direction_code}', 
    ' "No Wind" ', false
  ) 
WHERE 
  a.batch_id is not null 
  and a.row_number is not null 
  and a.activity_payload #>> '{form_data,activity_subtype_data,Treatment_ChemicalPlant_Information,wind_direction_code}' = 'NA'
  and a.activity_subtype = 'Activity_Treatment_ChemicalPlantTerrestrial' 
  and a.activity_incoming_data_id in (
    select 
      incoming_data_id 
    from 
      activity_current
  );
-- tristate fix
UPDATE 
  activity_incoming_data AS a 
SET 
  activity_payload = jsonb_set(
    jsonb_set(
      jsonb_set(
        a.activity_payload, 
        '{form_data,activity_subtype_data,Observation_PlantTerrestrial_Information,suitable_for_biocontrol_agent}', 
        CASE WHEN a.activity_payload #>> '{form_data,activity_subtype_data,Observation_PlantTerrestrial_Information,suitable_for_biocontrol_agent}' = 'No' THEN ' "Yes" '
        WHEN a.activity_payload #>> '{form_data,activity_subtype_data,Observation_PlantTerrestrial_Information,suitable_for_biocontrol_agent}' = 'Yes' THEN ' "No" '
        ELSE a.activity_payload #>'{form_data,activity_subtype_data,Observation_PlantTerrestrial_Information,suitable_for_biocontrol_agent}'
        END :: jsonb, 
        false
      ), 
      '{form_data,activity_subtype_data,Observation_PlantTerrestrial_Information,well_ind}', 
      CASE WHEN a.activity_payload #>> '{form_data,activity_subtype_data,Observation_PlantTerrestrial_Information,well_ind}' = 'No' THEN ' "Yes" '
      WHEN a.activity_payload #>> '{form_data,activity_subtype_data,Observation_PlantTerrestrial_Information,well_ind}' = 'Yes' THEN ' "No" '
      ELSE a.activity_payload #>'{form_data,activity_subtype_data,Observation_PlantTerrestrial_Information,well_ind}'
      END :: jsonb, 
      false
    ), 
    '{form_data,activity_subtype_data,Observation_PlantTerrestrial_Information,research_detection_ind}', 
    CASE WHEN a.activity_payload #>> '{form_data,activity_subtype_data,Observation_PlantTerrestrial_Information,research_detection_ind}' = 'No' THEN ' "Yes" '
    WHEN a.activity_payload #>> '{form_data,activity_subtype_data,Observation_PlantTerrestrial_Information,research_detection_ind}' = 'Yes' THEN ' "No" '
    ELSE a.activity_payload #>'{form_data,activity_subtype_data,Observation_PlantTerrestrial_Information,research_detection_ind}'
    END :: jsonb, 
    false
  ) 
WHERE 
  a.batch_id is not null 
  and a.row_number is not null 
  AND a.activity_subtype = 'Activity_Observation_PlantTerrestrial' 
  and a.activity_incoming_data_id in (
    select 
      incoming_data_id 
    from 
      activity_current
  );
UPDATE 
  activity_incoming_data AS a 
SET 
  activity_payload = jsonb_set(
    a.activity_payload, 
    '{form_data,activity_subtype_data,Treatment_ChemicalPlant_Information,signage_on_site}', 
    CASE WHEN a.activity_payload #>> '{form_data,activity_subtype_data,Treatment_ChemicalPlant_Information,signage_on_site}' = 'No' THEN ' "Yes" '
    WHEN a.activity_payload #>> '{form_data,activity_subtype_data,Treatment_ChemicalPlant_Information,signage_on_site}' = 'Yes' THEN ' "No" '
    ELSE a.activity_payload #> '{form_data,activity_subtype_data,Treatment_ChemicalPlant_Information,signage_on_site}'
    END :: jsonb, 
    false
  ) 
WHERE 
  a.batch_id is not null 
  and a.row_number is not null 
  and a.activity_subtype = 'Activity_Treatment_ChemicalPlantTerrestrial' 
  and a.activity_incoming_data_id in (
    select 
      incoming_data_id 
    from 
      activity_current
  );

`
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
  set search_path = invasivesbc,public;

  `);
}

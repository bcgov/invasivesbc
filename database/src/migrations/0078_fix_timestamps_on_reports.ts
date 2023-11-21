import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(
    `
    set search_path=invasivesbc,public;
   
drop view if exists chemical_treatment_monitoring_summary;
drop view if exists mechanical_treatment_monitoring_summary;
drop view if exists biocontrol_collection_summary;
drop view if exists biocontrol_dispersal_monitoring_summary;
drop view if exists biocontrol_release_monitoring_summary;
drop view if exists biocontrol_release_summary;

-- common summary view

CREATE 
OR REPLACE VIEW invasivesbc.common_summary as (
  with array_elements as (
    select 
      activity_incoming_data_id, 
      activity_subtype, 
      jurisdictions_array, 
      project_code_array, 
      person_array, 
      funding_list 
    from 
      activity_incoming_data 
      left join jsonb_array_elements(
        activity_payload #> '{form_data, activity_data, jurisdictions}') jurisdictions_array on true
        left join jsonb_array_elements(
          activity_payload #> '{form_data, activity_data, project_code}') project_code_array on true
          left join jsonb_array_elements(
            activity_payload #> '{form_data, activity_type_data, activity_persons}') person_array on true
            left join convert_string_list_to_array_elements(
              activity_payload #>> '{form_data, activity_data, invasive_species_agency_code}') funding_list on true
              where 
                activity_incoming_data_id in (
                  select 
                    incoming_data_id 
                  from 
                    activity_current
                ) 
                and form_status = 'Submitted'
            ), 
            array_aggregate as (
              select 
                a.activity_incoming_data_id, 
                string_agg (
                  distinct a.project_code_array #>> '{description}',
                  ', '
                ) project, 
                string_agg (
                  distinct a.person_array #>> '{person_name}',
                  ', '
                ) person_name, 
                string_agg(
                  distinct CASE WHEN a.person_array #>> '{applicator_license}' IS NOT NULL
                  THEN concat(
                    a.person_array #>> '{person_name}', ', ', a.person_array #>> '{applicator_license}'
                    ) ELSE a.person_array #>> '{person_name}'
                  END, 
                  ', '
                ) treatment_person_name, 
                string_agg (
                  distinct concat(
                    jurisdiction_codes.code_description, ' ',
                    (
                      a.jurisdictions_array #>> '{percent_covered}' || '%')
                      ), 
                    ', '
                  ) jurisdiction, 
                  string_agg(
                    distinct invasive_species_agency_codes.code_description, 
                    ', '
                  ) funding_agency 
                  from 
                    array_elements a 
                    left join code_header jurisdiction_code_header on jurisdiction_code_header.code_header_title = 'jurisdiction_code' 
                    and jurisdiction_code_header.valid_to is null 
                    left join code jurisdiction_codes on jurisdiction_codes.code_header_id = jurisdiction_code_header.code_header_id 
                    and a.jurisdictions_array #>> '{jurisdiction_code}' = jurisdiction_codes.code_name
                    left join code_header invasive_species_agency_code_header on invasive_species_agency_code_header.code_header_title = 'invasive_species_agency_code' 
                    and invasive_species_agency_code_header.valid_to is null 
                    left join code invasive_species_agency_codes on invasive_species_agency_codes.code_header_id = invasive_species_agency_code_header.code_header_id 
                    and a.funding_list = invasive_species_agency_codes.code_name 
                  group by 
                    a.activity_incoming_data_id
                ) 
              select 
                p.jurisdiction, 
                a.activity_incoming_data_id, 
                a.activity_id, 
                a.activity_payload #>> '{short_id}' as short_id,
                p.project as project_code, 
                a.activity_payload #>> '{activity_type}' as activity_type,
                a.activity_payload #>> '{activity_subtype}' as activity_subtype,
                a.form_status, 
                to_char(
                  to_timestamp(
                      activity_payload #>> '{form_data, activity_data, activity_date_time}', 'YYYY-MM-DD"T"HH24:MI:SS'), 'YYYY-MM-DD HH24:MI:SS') AS activity_date_time,
                      a.activity_payload #>> '{form_data, activity_data, utm_zone}' AS utm_zone,
                      a.activity_payload #>> '{form_data, activity_data, utm_easting}' AS utm_easting,
                      a.activity_payload #>> '{form_data, activity_data, utm_northing}' AS utm_northing,
                      a.activity_payload #>> '{form_data, activity_data, latitude}' AS latitude,
                      a.activity_payload #>> '{form_data, activity_data, longitude}' AS longitude,
                      translate(
                        a.activity_payload #>> '{species_positive}', '[]"', '') as species_positive,
                        jsonb_array_length(
                          a.activity_payload #> '{species_positive}') as positive_species_count,
                          translate(
                            a.activity_payload #>> '{species_negative}', '[]"', '') as species_negative,
                            jsonb_array_length(
                              a.activity_payload #> '{species_negative}') as negative_species_count,
                              a.activity_payload #>> '{form_data, activity_data, reported_area}' AS reported_area_sqm,
                              a.activity_payload #>> '{form_data, activity_type_data, pre_treatment_observation}' AS pre_treatment_observation,
                              p.person_name as observation_person, 
                              p.treatment_person_name as treatment_person, 
                              a.activity_payload #>> '{form_data, activity_data, employer_code}' AS employer_code,
                              employer_codes.code_description as employer_description, 
                              p.funding_agency, 
                              a.activity_payload #>> '{form_data, activity_data, access_description}' AS access_description,
                              a.activity_payload #>> '{form_data, activity_data, location_description}' AS location_description,
                              a.activity_payload #>> '{form_data, activity_data, general_comment}' AS comment,
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
                              (
                                case when a.media_keys is null then 'No' else 'Yes' end
                              ) as photo, 
                              a.created_timestamp, 
                              a.received_timestamp 
                              FROM 
                                activity_incoming_data a 
                                left join array_aggregate p on p.activity_incoming_data_id = a.activity_incoming_data_id 
                                left join code_header employer_code_header on employer_code_header.code_header_title = 'employer_code' 
                                and employer_code_header.valid_to is null 
                                left join code employer_codes on employer_codes.code_header_id = employer_code_header.code_header_id 
                                and a.activity_payload #>> '{form_data, activity_data, employer_code}' = employer_codes.code_name
                              where 
                                a.activity_incoming_data_id in (
                                  select 
                                    incoming_data_id 
                                  from 
                                    activity_current
                                ) 
                                and a.form_status = 'Submitted'
                            );
   
   
-- terrestrial observation
   
create 
  or replace view invasivesbc.observation_terrestrial_plant_summary as (
    with array_elements as (
      select 
        activity_incoming_data_id, 
        activity_subtype, 
        jurisdictions_array, 
        project_code_array, 
        person_array, 
        funding_list 
      from 
        activity_incoming_data 
        left join jsonb_array_elements(
          activity_payload #> '{form_data, activity_data, jurisdictions}') jurisdictions_array on true
          left join jsonb_array_elements(
            activity_payload #> '{form_data, activity_data, project_code}') project_code_array on true
            left join jsonb_array_elements(
              activity_payload #> '{form_data, activity_type_data, activity_persons}') person_array on true
              left join convert_string_list_to_array_elements(
                activity_payload #>> '{form_data, activity_data, invasive_species_agency_code}') funding_list on true
                where 
                  activity_incoming_data_id in (
                    select 
                      incoming_data_id 
                    from 
                      activity_current
                  ) 
                  and form_status = 'Submitted' 
                  and deleted_timestamp is null 
                  and activity_subtype = 'Activity_Observation_PlantTerrestrial'
              ), 
              array_aggregate as (
                select 
                  a.activity_incoming_data_id, 
                  string_agg (
                    distinct a.project_code_array #>> '{description}',
                    ', '
                  ) project, 
                  string_agg (
                    distinct a.person_array #>> '{person_name}',
                    ', '
                  ) person_name, 
                  string_agg(
                    distinct CASE WHEN a.person_array #>> '{applicator_license}' IS NOT NULL
                    THEN concat(
                      a.person_array #>> '{person_name}', ', ', a.person_array #>> '{applicator_license}'
                      ) ELSE a.person_array #>> '{person_name}'
                    END, 
                    ', '
                  ) treatment_person_name, 
                  string_agg (
                    distinct concat(
                      jurisdiction_codes.code_description, 
                      ' ', 
                      (
                        a.jurisdictions_array #>> '{percent_covered}' || '%')
                        ), 
                      ', '
                    ) jurisdiction, 
                    string_agg(
                      distinct invasive_species_agency_codes.code_description, 
                      ', '
                    ) funding_agency 
                    from 
                      array_elements a 
                      left join code_header jurisdiction_code_header on jurisdiction_code_header.code_header_title = 'jurisdiction_code' 
                      and jurisdiction_code_header.valid_to is null 
                      left join code jurisdiction_codes on jurisdiction_codes.code_header_id = jurisdiction_code_header.code_header_id 
                      and a.jurisdictions_array #>> '{jurisdiction_code}' = jurisdiction_codes.code_name
                      left join code_header invasive_species_agency_code_header on invasive_species_agency_code_header.code_header_title = 'invasive_species_agency_code' 
                      and invasive_species_agency_code_header.valid_to is null 
                      left join code invasive_species_agency_codes on invasive_species_agency_codes.code_header_id = invasive_species_agency_code_header.code_header_id 
                      and a.funding_list = invasive_species_agency_codes.code_name 
                    group by 
                      a.activity_incoming_data_id
                  ), 
                  common_fields as (
                    select 
                      p.jurisdiction, 
                      a.activity_incoming_data_id, 
                      a.activity_id, 
                      a.activity_payload #>> '{short_id}' as short_id,
                      p.project as project_code, 
                      a.activity_payload #>> '{activity_type}' as activity_type,
                      a.activity_payload #>> '{activity_subtype}' as activity_subtype,
                      a.form_status, 
                      to_char(
                       to_timestamp(
                          activity_payload #>> '{form_data, activity_data, activity_date_time}', 'YYYY-MM-DD"T"HH24:MI:SS'), 'YYYY-MM-DD HH24:MI:SS') AS activity_date_time,
                          a.activity_payload #>> '{form_data, activity_data, utm_zone}' AS utm_zone,
                          a.activity_payload #>> '{form_data, activity_data, utm_easting}' AS utm_easting,
                          a.activity_payload #>> '{form_data, activity_data, utm_northing}' AS utm_northing,
                          a.activity_payload #>> '{form_data, activity_data, latitude}' AS latitude,
                          a.activity_payload #>> '{form_data, activity_data, longitude}' AS longitude,
                          translate(
                            a.activity_payload #>> '{species_positive}', '[]"', '') as species_positive,
                            jsonb_array_length(
                              a.activity_payload #> '{species_positive}') as positive_species_count,
                              translate(
                                a.activity_payload #>> '{species_negative}', '[]"', '') as species_negative,
                                jsonb_array_length(
                                  a.activity_payload #> '{species_negative}') as negative_species_count,
                                  a.activity_payload #>> '{form_data, activity_data, reported_area}' AS reported_area_sqm,
                                  a.activity_payload #>> '{form_data, activity_type_data, pre_treatment_observation}' AS pre_treatment_observation,
                                  p.person_name as observation_person, 
                                  p.treatment_person_name as treatment_person, 
                                  a.activity_payload #>> '{form_data, activity_data, employer_code}' AS employer_code,
                                  employer_codes.code_description as employer_description, 
                                  p.funding_agency, 
                                  a.activity_payload #>> '{form_data, activity_data, access_description}' AS access_description,
                                  a.activity_payload #>> '{form_data, activity_data, location_description}' AS location_description,
                                  a.activity_payload #>> '{form_data, activity_data, general_comment}' AS comment,
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
                                  (
                                    case when a.media_keys is null then 'No' else 'Yes' end
                                  ) as photo, 
                                  a.created_timestamp, 
                                  a.received_timestamp 
                                  FROM 
                                    activity_incoming_data a 
                                    left join array_aggregate p on p.activity_incoming_data_id = a.activity_incoming_data_id 
                                    left join code_header employer_code_header on employer_code_header.code_header_title = 'employer_code' 
                                    and employer_code_header.valid_to is null 
                                    left join code employer_codes on employer_codes.code_header_id = employer_code_header.code_header_id 
                                    and a.activity_payload #>> '{form_data, activity_data, employer_code}' = employer_codes.code_name
                                  where 
                                    a.activity_incoming_data_id in (
                                      select 
                                        incoming_data_id 
                                      from 
                                        activity_current
                                    ) 
                                    and a.form_status = 'Submitted' 
                                    and a.deleted_timestamp is null 
                                    and a.activity_subtype = 'Activity_Observation_PlantTerrestrial'
                                ), 
                                terrestrial_plant_array as (
                                  select 
                                    activity_incoming_data_id, 
                                    activity_subtype, 
                                    jsonb_array_elements(
                                      activity_incoming_data.activity_payload #> '{form_data, activity_subtype_data, TerrestrialPlants}') as json_array,
                                      (
                                        activity_incoming_data.activity_payload #> '{form_data, activity_subtype_data, Observation_PlantTerrestrial_Information}') as json_data
                                        from 
                                          activity_incoming_data 
                                        where 
                                          activity_incoming_data_id in (
                                            select 
                                              incoming_data_id 
                                            from 
                                              activity_current
                                          ) 
                                          and form_status = 'Submitted' 
                                          and deleted_timestamp is null 
                                          and activity_subtype = 'Activity_Observation_PlantTerrestrial'
                                      ), 
                                      terrestrial_plant_select as (
                                        select 
                                          t.activity_incoming_data_id, 
                                          t.json_data #>> '{soil_texture_code}' as soil_texture_code,
                                          soil_texture_codes.code_description as soil_texture, 
                                          t.json_data #>> '{specific_use_code}' as specific_use_code,
                                          specific_use_codes.code_description as specific_use, 
                                          t.json_data #>> '{slope_code}' as slope_code,
                                          slope_codes.code_description as slope, 
                                          t.json_data #>> '{aspect_code}' as aspect_code,
                                          aspect_codes.code_description as aspect, 
                                          t.json_data #>> '{research_detection_ind}' as research_observation,
                                          t.json_data #>> '{well_ind}' as visible_well_nearby,
                                          t.json_data #>> '{suitable_for_biocontrol_agent}' as suitable_for_biocontrol_agent,
                                          t.json_array #>> '{occurrence}' as occurrence,
                                          t.json_array #>> '{edna_sample}' as edna_sample,
                                          t.json_array #>> '{invasive_plant_code}' as invasive_plant_code,
                                          invasive_plant_codes.code_description as invasive_plant, 
                                          t.json_array #>> '{plant_life_stage_code}' as plant_life_stage_code,
                                          plant_life_stage_codes.code_description as plant_life_stage, 
                                          t.json_array #>> '{voucher_specimen_collected}' as voucher_specimen_collected,
                                          t.json_array #>> '{invasive_plant_density_code}' as invasive_plant_density_code,
                                          invasive_plant_density_codes.code_description as invasive_plant_density, 
                                          t.json_array #>> '{invasive_plant_distribution_code}' as invasive_plant_distribution_code,
                                          invasive_plant_distribution_codes.code_description as invasive_plant_distribution, 
                                          t.json_array #>> '{voucher_specimen_collection_information, accession_number}' as accession_number,
                                          t.json_array #>> '{voucher_specimen_collection_information, exact_utm_coords, utm_zone}' as voucher_utm_zone,
                                          t.json_array #>> '{voucher_specimen_collection_information, exact_utm_coords, utm_easting}' as voucher_utm_easting,
                                          t.json_array #>> '{voucher_specimen_collection_information, exact_utm_coords, utm_northing}' as voucher_utm_northing,
                                          t.json_array #>> '{voucher_specimen_collection_information, name_of_herbarium}' as name_of_herbarium,
                                          t.json_array #>> '{voucher_specimen_collection_information, voucher_sample_id}' as voucher_sample_id,
                                          t.json_array #>> '{voucher_specimen_collection_information, date_voucher_verified}' as date_voucher_verified,
                                          t.json_array #>> '{voucher_specimen_collection_information, date_voucher_collected}' as date_voucher_collected,
                                          t.json_array #>> '{voucher_specimen_collection_information, voucher_verification_completed_by, person_name}' as voucher_person_name,
                                          t.json_array #>> '{voucher_specimen_collection_information, voucher_verification_completed_by, organization}' as voucher_organization
                                        from 
                                          terrestrial_plant_array t 
                                          left join code_header soil_texture_code_header on soil_texture_code_header.code_header_title = 'soil_texture_code' 
                                          and soil_texture_code_header.valid_to is null 
                                          left join code soil_texture_codes on soil_texture_codes.code_header_id = soil_texture_code_header.code_header_id 
                                          and t.json_data #>> '{soil_texture_code}' = soil_texture_codes.code_name
                                          left join code_header specific_use_code_header on specific_use_code_header.code_header_title = 'specific_use_code' 
                                          and specific_use_code_header.valid_to is null 
                                          left join code specific_use_codes on specific_use_codes.code_header_id = specific_use_code_header.code_header_id 
                                          and t.json_data #>> '{specific_use_code}' = specific_use_codes.code_name
                                          left join code_header slope_code_header on slope_code_header.code_header_title = 'slope_code' 
                                          and slope_code_header.valid_to is null 
                                          left join code slope_codes on slope_codes.code_header_id = slope_code_header.code_header_id 
                                          and t.json_data #>> '{slope_code}' = slope_codes.code_name
                                          left join code_header aspect_code_header on aspect_code_header.code_header_title = 'aspect_code' 
                                          and aspect_code_header.valid_to is null 
                                          left join code aspect_codes on aspect_codes.code_header_id = aspect_code_header.code_header_id 
                                          and t.json_data #>> '{aspect_code}' = aspect_codes.code_name
                                          left join code_header plant_life_stage_code_header on plant_life_stage_code_header.code_header_title = 'plant_life_stage_code' 
                                          and plant_life_stage_code_header.valid_to is null 
                                          left join code plant_life_stage_codes on plant_life_stage_codes.code_header_id = plant_life_stage_code_header.code_header_id 
                                          and t.json_array #>> '{plant_life_stage_code}' = plant_life_stage_codes.code_name
                                          left join code_header invasive_plant_density_code_header on invasive_plant_density_code_header.code_header_title = 'invasive_plant_density_code' 
                                          and invasive_plant_density_code_header.valid_to is null 
                                          left join code invasive_plant_density_codes on invasive_plant_density_codes.code_header_id = invasive_plant_density_code_header.code_header_id 
                                          and t.json_array #>> '{invasive_plant_density_code}' = invasive_plant_density_codes.code_name
                                          left join code_header invasive_plant_distribution_code_header on invasive_plant_distribution_code_header.code_header_title = 'invasive_plant_distribution_code' 
                                          and invasive_plant_distribution_code_header.valid_to is null 
                                          left join code invasive_plant_distribution_codes on invasive_plant_distribution_codes.code_header_id = invasive_plant_distribution_code_header.code_header_id 
                                          and t.json_array #>> '{invasive_plant_distribution_code}' = invasive_plant_distribution_codes.code_name
                                          left join code_header invasive_plant_code_header on invasive_plant_code_header.code_header_title = 'invasive_plant_code' 
                                          and invasive_plant_code_header.valid_to is null 
                                          left join code invasive_plant_codes on invasive_plant_codes.code_header_id = invasive_plant_code_header.code_header_id 
                                          and t.json_array #>> '{invasive_plant_code}' = invasive_plant_codes.code_name
                                          ) 
                                      SELECT 
                                        c.activity_incoming_data_id, 
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
                                        c.employer_description as employer, 
                                        c.funding_agency, 
                                        c.jurisdiction, 
                                        c.access_description, 
                                        c.location_description, 
                                        c.comment, 
                                        c.pre_treatment_observation, 
                                        c.observation_person, 
                                        t.soil_texture as soil_texture, 
                                        t.specific_use as specific_use, 
                                        t.slope as slope, 
                                        t.aspect as aspect, 
                                        t.research_observation as research_observation, 
                                        t.visible_well_nearby as visible_well_nearby, 
                                        t.suitable_for_biocontrol_agent as suitable_for_biocontrol_agent, 
                                        t.invasive_plant as invasive_plant, 
                                        t.occurrence as occurrence, 
                                        t.invasive_plant_density as density, 
                                        t.invasive_plant_distribution as distribution, 
                                        t.plant_life_stage as life_stage, 
                                        t.voucher_sample_id as voucher_sample_id, 
                                        t.date_voucher_collected as date_voucher_collected, 
                                        t.date_voucher_verified as date_voucher_verified, 
                                        t.name_of_herbarium as name_of_herbarium, 
                                        t.accession_number as accession_number, 
                                        t.voucher_person_name as voucher_person_name, 
                                        t.voucher_organization as voucher_organization, 
                                        t.voucher_utm_zone as voucher_utm_zone, 
                                        t.voucher_utm_easting as voucher_utm_easting, 
                                        t.voucher_utm_northing as voucher_utm_northing, 
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
                                      FROM 
                                        common_fields c 
                                        join terrestrial_plant_select t on t.activity_incoming_data_id = c.activity_incoming_data_id
                                    );

                                   
-- aquatic observation                                   
                                   
create 
or replace view invasivesbc.observation_aquatic_plant_summary as (
  with array_elements as (
    select 
      activity_incoming_data_id, 
      activity_subtype, 
      jurisdictions_array, 
      project_code_array, 
      person_array, 
      funding_list 
    from 
      activity_incoming_data 
      left join jsonb_array_elements(
        activity_payload #> '{form_data, activity_data, jurisdictions}') jurisdictions_array on true
        left join jsonb_array_elements(
          activity_payload #> '{form_data, activity_data, project_code}') project_code_array on true
          left join jsonb_array_elements(
            activity_payload #> '{form_data, activity_type_data, activity_persons}') person_array on true
            left join convert_string_list_to_array_elements(
              activity_payload #>> '{form_data, activity_data, invasive_species_agency_code}') funding_list on true
              where 
                activity_incoming_data_id in (
                  select 
                    incoming_data_id 
                  from 
                    activity_current
                ) 
                and form_status = 'Submitted' 
                and deleted_timestamp is null 
                and activity_subtype = 'Activity_Observation_PlantAquatic'
            ), 
            array_aggregate as (
              select 
                a.activity_incoming_data_id, 
                string_agg (
                  distinct a.project_code_array #>> '{description}',
                  ', '
                ) project, 
                string_agg (
                  distinct a.person_array #>> '{person_name}',
                  ', '
                ) person_name, 
                string_agg(
                  distinct CASE WHEN a.person_array #>> '{applicator_license}' IS NOT NULL
                  THEN concat(
                    a.person_array #>> '{person_name}', ', ', a.person_array #>> '{applicator_license}'
                    ) ELSE a.person_array #>> '{person_name}'
                  END, 
                  ', '
                ) treatment_person_name, 
                string_agg (
                  distinct concat(
                    jurisdiction_codes.code_description, 
                    ' ', 
                    (
                      a.jurisdictions_array #>> '{percent_covered}' || '%')
                      ), 
                    ', '
                  ) jurisdiction, 
                  string_agg(
                    distinct invasive_species_agency_codes.code_description, 
                    ', '
                  ) funding_agency 
                  from 
                    array_elements a 
                    left join code_header jurisdiction_code_header on jurisdiction_code_header.code_header_title = 'jurisdiction_code' 
                    and jurisdiction_code_header.valid_to is null 
                    left join code jurisdiction_codes on jurisdiction_codes.code_header_id = jurisdiction_code_header.code_header_id 
                    and a.jurisdictions_array #>> '{jurisdiction_code}' = jurisdiction_codes.code_name
                    left join code_header invasive_species_agency_code_header on invasive_species_agency_code_header.code_header_title = 'invasive_species_agency_code' 
                    and invasive_species_agency_code_header.valid_to is null 
                    left join code invasive_species_agency_codes on invasive_species_agency_codes.code_header_id = invasive_species_agency_code_header.code_header_id 
                    and a.funding_list = invasive_species_agency_codes.code_name 
                  group by 
                    a.activity_incoming_data_id
                ), 
                common_fields as (
                  select 
                    p.jurisdiction, 
                    a.activity_incoming_data_id, 
                    a.activity_id, 
                    a.activity_payload #>> '{short_id}' as short_id,
                    p.project as project_code, 
                    a.activity_payload #>> '{activity_type}' as activity_type,
                    a.activity_payload #>> '{activity_subtype}' as activity_subtype,
                    a.form_status, 
                    to_char(
                      to_timestamp(
                          activity_payload #>> '{form_data, activity_data, activity_date_time}', 'YYYY-MM-DD"T"HH24:MI:SS'), 'YYYY-MM-DD HH24:MI:SS') AS activity_date_time,
                          a.activity_payload #>> '{form_data, activity_data, utm_zone}' AS utm_zone,
                          a.activity_payload #>> '{form_data, activity_data, utm_easting}' AS utm_easting,
                          a.activity_payload #>> '{form_data, activity_data, utm_northing}' AS utm_northing,
                          a.activity_payload #>> '{form_data, activity_data, latitude}' AS latitude,
                          a.activity_payload #>> '{form_data, activity_data, longitude}' AS longitude,
                          translate(
                            a.activity_payload #>> '{species_positive}', '[]"', '') as species_positive,
                            jsonb_array_length(
                              a.activity_payload #> '{species_positive}') as positive_species_count,
                              translate(
                                a.activity_payload #>> '{species_negative}', '[]"', '') as species_negative,
                                jsonb_array_length(
                                  a.activity_payload #> '{species_negative}') as negative_species_count,
                                  a.activity_payload #>> '{form_data, activity_data, reported_area}' AS reported_area_sqm,
                                  a.activity_payload #>> '{form_data, activity_type_data, pre_treatment_observation}' AS pre_treatment_observation,
                                  p.person_name as observation_person, 
                                  p.treatment_person_name as treatment_person, 
                                  a.activity_payload #>> '{form_data, activity_data, employer_code}' AS employer_code,
                                  employer_codes.code_description as employer_description, 
                                  p.funding_agency, 
                                  a.activity_payload #>> '{form_data, activity_data, access_description}' AS access_description,
                                  a.activity_payload #>> '{form_data, activity_data, location_description}' AS location_description,
                                  a.activity_payload #>> '{form_data, activity_data, general_comment}' AS comment,
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
                                  (
                                    case when a.media_keys is null then 'No' else 'Yes' end
                                  ) as photo, 
                                  a.created_timestamp, 
                                  a.received_timestamp 
                                  FROM 
                                    activity_incoming_data a 
                                    left join array_aggregate p on p.activity_incoming_data_id = a.activity_incoming_data_id 
                                    left join code_header employer_code_header on employer_code_header.code_header_title = 'employer_code' 
                                    and employer_code_header.valid_to is null 
                                    left join code employer_codes on employer_codes.code_header_id = employer_code_header.code_header_id 
                                    and a.activity_payload #>> '{form_data, activity_data, employer_code}' = employer_codes.code_name
                                  where 
                                    a.activity_incoming_data_id in (
                                      select 
                                        incoming_data_id 
                                      from 
                                        activity_current
                                    ) 
                                    and a.form_status = 'Submitted' 
                                    and a.deleted_timestamp is null 
                                    and a.activity_subtype = 'Activity_Observation_PlantAquatic'
                                ), 
                                waterbody_outflow as (
                                  select 
                                    activity_incoming_data_id, 
                                    form_status, 
                                    convert_string_list_to_array_elements(
                                      activity_incoming_data.activity_payload #>> '{form_data, activity_subtype_data, WaterbodyData, outflow}') as outflow_code
                                      from 
                                        activity_incoming_data 
                                      where 
                                        activity_incoming_data_id in (
                                          select 
                                            incoming_data_id 
                                          from 
                                            activity_current
                                        ) 
                                        and form_status = 'Submitted' 
                                        and deleted_timestamp is null 
                                        and activity_subtype = 'Activity_Observation_PlantAquatic'
                                    ), 
                                    waterbody_outflow_code as (
                                      select 
                                        w.activity_incoming_data_id, 
                                        w.outflow_code, 
                                        outflow_codes.code_description as outflow 
                                      from 
                                        waterbody_outflow w 
                                        left join code_header outflow_code_header on outflow_code_header.code_header_title = 'outflow_code' 
                                        and outflow_code_header.valid_to is null 
                                        left join code outflow_codes on outflow_codes.code_header_id = outflow_code_header.code_header_id 
                                        and w.outflow_code = outflow_codes.code_name
                                    ), 
                                    waterbody_outflow_agg as (
                                      select 
                                        w.activity_incoming_data_id, 
                                        string_agg (
                                          w.outflow, 
                                          ', ' 
                                          order by 
                                            w.outflow
                                        ) outflow 
                                      from 
                                        waterbody_outflow_code w 
                                      group by 
                                        w.activity_incoming_data_id
                                    ), 
                                    waterbody_outflow_other as (
                                      select 
                                        activity_incoming_data_id, 
                                        form_status, 
                                        convert_string_list_to_array_elements(
                                          activity_incoming_data.activity_payload #>> '{form_data, activity_subtype_data, WaterbodyData, outflow_other}') as outflow_other_code,
                                          outflow_codes.code_description as outflow_other 
                                          from 
                                            activity_incoming_data 
                                            left join code_header outflow_code_header on outflow_code_header.code_header_title = 'outflow_code' 
                                            and outflow_code_header.valid_to is null 
                                            left join code outflow_codes on outflow_codes.code_header_id = outflow_code_header.code_header_id 
                                            and activity_incoming_data.activity_payload #>> '{form_data, activity_subtype_data, WaterbodyData, outflow_other}' = outflow_codes.code_name
                                          where 
                                            activity_incoming_data_id in (
                                              select 
                                                incoming_data_id 
                                              from 
                                                activity_current
                                            ) 
                                            and form_status = 'Submitted' 
                                            and deleted_timestamp is null 
                                            and activity_subtype = 'Activity_Observation_PlantAquatic'
                                        ), 
                                        waterbody_outflow_other_code as (
                                          select 
                                            w.activity_incoming_data_id, 
                                            w.outflow_other_code, 
                                            outflow_codes.code_description as outflow_other 
                                          from 
                                            waterbody_outflow_other w 
                                            left join code_header outflow_code_header on outflow_code_header.code_header_title = 'outflow_code' 
                                            and outflow_code_header.valid_to is null 
                                            left join code outflow_codes on outflow_codes.code_header_id = outflow_code_header.code_header_id 
                                            and w.outflow_other_code = outflow_codes.code_name
                                        ), 
                                        waterbody_outflow_other_agg as (
                                          select 
                                            w.activity_incoming_data_id, 
                                            string_agg (
                                              w.outflow_other, 
                                              ', ' 
                                              order by 
                                                w.outflow_other
                                            ) outflow_other 
                                          from 
                                            waterbody_outflow_other_code w 
                                          group by 
                                            w.activity_incoming_data_id
                                        ), 
                                        waterbody_inflow as (
                                          select 
                                            activity_incoming_data_id, 
                                            form_status, 
                                            convert_string_list_to_array_elements(
                                              activity_incoming_data.activity_payload #>> '{form_data, activity_subtype_data, WaterbodyData, inflow_permanent}') as inflow_code
                                              from 
                                                activity_incoming_data 
                                              where 
                                                activity_incoming_data_id in (
                                                  select 
                                                    incoming_data_id 
                                                  from 
                                                    activity_current
                                                ) 
                                                and form_status = 'Submitted' 
                                                and deleted_timestamp is null 
                                                and activity_subtype = 'Activity_Observation_PlantAquatic'
                                            ), 
                                            waterbody_inflow_code as (
                                              select 
                                                w.activity_incoming_data_id, 
                                                w.inflow_code, 
                                                inflow_permanent_codes.code_description as inflow 
                                              from 
                                                waterbody_inflow w 
                                                left join code_header inflow_permanent_code_header on inflow_permanent_code_header.code_header_title = 'inflow_permanent_code' 
                                                and inflow_permanent_code_header.valid_to is null 
                                                left join code inflow_permanent_codes on inflow_permanent_codes.code_header_id = inflow_permanent_code_header.code_header_id 
                                                and w.inflow_code = inflow_permanent_codes.code_name
                                            ), 
                                            waterbody_inflow_agg as (
                                              select 
                                                w.activity_incoming_data_id, 
                                                string_agg (
                                                  w.inflow, 
                                                  ', ' 
                                                  order by 
                                                    w.inflow
                                                ) inflow 
                                              from 
                                                waterbody_inflow_code w 
                                              group by 
                                                w.activity_incoming_data_id
                                            ), 
                                            waterbody_inflow_other as (
                                              select 
                                                activity_incoming_data_id, 
                                                form_status, 
                                                convert_string_list_to_array_elements(
                                                  activity_incoming_data.activity_payload #>> '{form_data, activity_subtype_data, WaterbodyData, inflow_other}') as inflow_other_code,
                                                  inflow_temporary_codes.code_description as inflow_other 
                                                  from 
                                                    activity_incoming_data 
                                                    left join code_header inflow_temporary_code_header on inflow_temporary_code_header.code_header_title = 'inflow_temporary_code' 
                                                    and inflow_temporary_code_header.valid_to is null 
                                                    left join code inflow_temporary_codes on inflow_temporary_codes.code_header_id = inflow_temporary_code_header.code_header_id 
                                                    and activity_incoming_data.activity_payload #>> '{form_data, activity_subtype_data, WaterbodyData, inflow_other}' = inflow_temporary_codes.code_name
                                                  where 
                                                    activity_incoming_data_id in (
                                                      select 
                                                        incoming_data_id 
                                                      from 
                                                        activity_current
                                                    ) 
                                                    and form_status = 'Submitted' 
                                                    and deleted_timestamp is null 
                                                    and activity_subtype = 'Activity_Observation_PlantAquatic'
                                                ), 
                                                waterbody_inflow_other_code as (
                                                  select 
                                                    w.activity_incoming_data_id, 
                                                    w.inflow_other_code, 
                                                    inflow_temporary_codes.code_description as inflow_other 
                                                  from 
                                                    waterbody_inflow_other w 
                                                    left join code_header inflow_temporary_code_header on inflow_temporary_code_header.code_header_title = 'inflow_temporary_code' 
                                                    and inflow_temporary_code_header.valid_to is null 
                                                    left join code inflow_temporary_codes on inflow_temporary_codes.code_header_id = inflow_temporary_code_header.code_header_id 
                                                    and w.inflow_other_code = inflow_temporary_codes.code_name
                                                ), 
                                                waterbody_inflow_other_agg as (
                                                  select 
                                                    w.activity_incoming_data_id, 
                                                    string_agg (
                                                      w.inflow_other, 
                                                      ', ' 
                                                      order by 
                                                        w.inflow_other
                                                    ) inflow_other 
                                                  from 
                                                    waterbody_inflow_other_code w 
                                                  group by 
                                                    w.activity_incoming_data_id
                                                ), 
                                                waterbody_use as (
                                                  select 
                                                    activity_incoming_data_id, 
                                                    form_status, 
                                                    convert_string_list_to_array_elements(
                                                      activity_incoming_data.activity_payload #>> '{form_data, activity_subtype_data, WaterbodyData, waterbody_use}') as waterbody_use_code
                                                      from 
                                                        activity_incoming_data 
                                                      where 
                                                        activity_incoming_data_id in (
                                                          select 
                                                            incoming_data_id 
                                                          from 
                                                            activity_current
                                                        ) 
                                                        and form_status = 'Submitted' 
                                                        and deleted_timestamp is null 
                                                        and activity_subtype = 'Activity_Observation_PlantAquatic'
                                                    ), 
                                                    waterbody_use_code as (
                                                      select 
                                                        w.activity_incoming_data_id, 
                                                        w.waterbody_use_code, 
                                                        waterbody_use_codes.code_description as waterbody_use 
                                                      from 
                                                        waterbody_use w 
                                                        left join code_header waterbody_use_code_header on waterbody_use_code_header.code_header_title = 'waterbody_use_code' 
                                                        and waterbody_use_code_header.valid_to is null 
                                                        left join code waterbody_use_codes on waterbody_use_codes.code_header_id = waterbody_use_code_header.code_header_id 
                                                        and w.waterbody_use_code = waterbody_use_codes.code_name
                                                    ), 
                                                    waterbody_use_agg as (
                                                      select 
                                                        w.activity_incoming_data_id, 
                                                        string_agg (
                                                          w.waterbody_use, 
                                                          ', ' 
                                                          order by 
                                                            w.waterbody_use
                                                        ) waterbody_use 
                                                      from 
                                                        waterbody_use_code w 
                                                      group by 
                                                        w.activity_incoming_data_id
                                                    ), 
                                                    adjacent_land_use as (
                                                      select 
                                                        activity_incoming_data_id, 
                                                        form_status, 
                                                        convert_string_list_to_array_elements(
                                                          activity_incoming_data.activity_payload #>> '{form_data, activity_subtype_data, WaterbodyData, adjacent_land_use}') as adjacent_land_use_code
                                                          from 
                                                            activity_incoming_data 
                                                          where 
                                                            activity_incoming_data_id in (
                                                              select 
                                                                incoming_data_id 
                                                              from 
                                                                activity_current
                                                            ) 
                                                            and form_status = 'Submitted' 
                                                            and deleted_timestamp is null 
                                                            and activity_subtype = 'Activity_Observation_PlantAquatic'
                                                        ), 
                                                        adjacent_land_use_code as (
                                                          select 
                                                            w.activity_incoming_data_id, 
                                                            w.adjacent_land_use_code, 
                                                            adjacent_land_use_codes.code_description as adjacent_land_use 
                                                          from 
                                                            adjacent_land_use w 
                                                            left join code_header adjacent_land_use_code_header on adjacent_land_use_code_header.code_header_title = 'adjacent_land_use_code' 
                                                            and adjacent_land_use_code_header.valid_to is null 
                                                            left join code adjacent_land_use_codes on adjacent_land_use_codes.code_header_id = adjacent_land_use_code_header.code_header_id 
                                                            and w.adjacent_land_use_code = adjacent_land_use_codes.code_name
                                                        ), 
                                                        adjacent_land_use_agg as (
                                                          select 
                                                            w.activity_incoming_data_id, 
                                                            string_agg (
                                                              w.adjacent_land_use, 
                                                              ', ' 
                                                              order by 
                                                                w.adjacent_land_use
                                                            ) adjacent_land_use 
                                                          from 
                                                            adjacent_land_use_code w 
                                                          group by 
                                                            w.activity_incoming_data_id
                                                        ), 
                                                        shoreline_array as (
                                                          select 
                                                            activity_incoming_data.activity_incoming_data_id, 
                                                            form_status, 
                                                            jsonb_array_elements(
                                                              activity_incoming_data.activity_payload #> '{form_data, activity_subtype_data, ShorelineTypes}') as shorelines
                                                              from 
                                                                activity_incoming_data 
                                                              where 
                                                                activity_incoming_data_id in (
                                                                  select 
                                                                    incoming_data_id 
                                                                  from 
                                                                    activity_current
                                                                ) 
                                                                and form_status = 'Submitted' 
                                                                and deleted_timestamp is null 
                                                                and activity_subtype = 'Activity_Observation_PlantAquatic'
                                                            ), 
                                                            shoreline_array_select as (
                                                              select 
                                                                a.activity_incoming_data_id, 
                                                                a.shorelines #>> '{shoreline_type}' as shoreline_type,
                                                                shoreline_type_codes.code_description as shoreline_description, 
                                                                a.shorelines #>> '{percent_covered}' as percent_covered
                                                              from 
                                                                shoreline_array a 
                                                                left join code_header shoreline_type_code_header on shoreline_type_code_header.code_header_title = 'shoreline_type_code' 
                                                                and shoreline_type_code_header.valid_to is null 
                                                                left join code shoreline_type_codes on shoreline_type_codes.code_header_id = shoreline_type_code_header.code_header_id 
                                                                and a.shorelines #>> '{shoreline_type}' = shoreline_type_codes.code_name
                                                                ), 
                                                            shoreline_agg as (
                                                              select 
                                                                string_agg (
                                                                  a.shoreline_description || ' ' || a.percent_covered || '%', 
                                                                  ', ' 
                                                                  order by 
                                                                    a.shoreline_description
                                                                ) shorelines, 
                                                                a.activity_incoming_data_id 
                                                              from 
                                                                shoreline_array_select a 
                                                              group by 
                                                                a.activity_incoming_data_id
                                                            ), 
                                                            aquatic_plant_json as (
                                                              select 
                                                                a.activity_incoming_data_id, 
                                                                activity_incoming_data.activity_subtype, 
                                                                activity_incoming_data.activity_incoming_data_id as id, 
                                                                a.shorelines, 
                                                                jsonb_array_elements(
                                                                  activity_incoming_data.activity_payload #> '{form_data, activity_subtype_data, AquaticPlants}') as json_array,
                                                                  (
                                                                    activity_incoming_data.activity_payload #> '{form_data, activity_subtype_data}') as json_data
                                                                    from 
                                                                      shoreline_agg a 
                                                                      join activity_incoming_data on activity_incoming_data.activity_incoming_data_id = a.activity_incoming_data_id
                                                                  ), 
                                                                  water_level_management as (
                                                                    select 
                                                                      activity_incoming_data_id, 
                                                                      convert_string_list_to_array_elements(
                                                                        activity_payload #>> '{form_data, activity_subtype_data, WaterbodyData, water_level_management}') as water_level_management
                                                                        from 
                                                                          activity_incoming_data 
                                                                        where 
                                                                          activity_incoming_data_id in (
                                                                            select 
                                                                              incoming_data_id 
                                                                            from 
                                                                              activity_current
                                                                          ) 
                                                                          and form_status = 'Submitted' 
                                                                          and deleted_timestamp is null 
                                                                          and activity_subtype = 'Activity_Observation_PlantAquatic'
                                                                      ), 
                                                                      water_level_management_agg as (
                                                                        select 
                                                                          w.activity_incoming_data_id, 
                                                                          string_agg (
                                                                            w.water_level_management, 
                                                                            ', ' 
                                                                            order by 
                                                                              w.water_level_management
                                                                          ) water_level_management 
                                                                        from 
                                                                          water_level_management w 
                                                                        group by 
                                                                          w.activity_incoming_data_id
                                                                      ), 
                                                                      substrate_type as (
                                                                        select 
                                                                          activity_incoming_data_id, 
                                                                          convert_string_list_to_array_elements(
                                                                            activity_payload #>> '{form_data, activity_subtype_data, WaterbodyData, substrate_type}') as substrate_type
                                                                            from 
                                                                              activity_incoming_data 
                                                                            where 
                                                                              activity_incoming_data_id in (
                                                                                select 
                                                                                  incoming_data_id 
                                                                                from 
                                                                                  activity_current
                                                                              ) 
                                                                              and form_status = 'Submitted' 
                                                                              and deleted_timestamp is null 
                                                                              and activity_subtype = 'Activity_Observation_PlantAquatic'
                                                                          ), 
                                                                          substrate_type_agg as (
                                                                            select 
                                                                              s.activity_incoming_data_id, 
                                                                              string_agg (
                                                                                s.substrate_type, 
                                                                                ', ' 
                                                                                order by 
                                                                                  s.substrate_type
                                                                              ) substrate_type 
                                                                            from 
                                                                              substrate_type s 
                                                                            group by 
                                                                              s.activity_incoming_data_id
                                                                          ), 
                                                                          aquatic_plant_json_select as (
                                                                            select 
                                                                              a.shorelines, 
                                                                              a.activity_incoming_data_id, 
                                                                              a.json_data #>> '{WaterbodyData, waterbody_type}' as waterbody_type,
                                                                              a.json_data #>> '{WaterbodyData, waterbody_name_gazetted}' as waterbody_name_gazetted,
                                                                              a.json_data #>> '{WaterbodyData, waterbody_name_local}' as waterbody_name_local,
                                                                              a.json_data #>> '{WaterbodyData, waterbody_access}' as waterbody_access,
                                                                              waterbody_use_agg.waterbody_use, 
                                                                              water_level_management_agg.water_level_management as water_level_management, 
                                                                              substrate_type_agg.substrate_type as substrate_type, 
                                                                              a.json_data #>> '{WaterbodyData, tidal_influence}' as tidal_influence,
                                                                              adjacent_land_use_agg.adjacent_land_use, 
                                                                              waterbody_inflow_agg.inflow as inflow_permanent, 
                                                                              waterbody_inflow_other_agg.inflow_other, 
                                                                              waterbody_outflow_agg.outflow, 
                                                                              waterbody_outflow_other_agg.outflow_other, 
                                                                              a.json_data #>> '{WaterbodyData, comment}' as waterbody_comment,
                                                                              a.json_data #>> '{WaterQuality, water_sample_depth}' as water_sample_depth_meters,
                                                                              a.json_data #>> '{WaterQuality, secchi_depth}' as secchi_depth_meters,
                                                                              a.json_data #>> '{WaterQuality, water_colour}' as water_colour,
                                                                              a.json_data #>> '{Observation_PlantAquatic_Information, suitable_for_biocontrol_agent}' as suitable_for_biocontrol_agent,
                                                                              a.json_array #>> '{sample_point_id}' as sample_point_id,
                                                                              a.json_array #>> '{observation_type}' as observation_type,
                                                                              a.json_array #>> '{invasive_plant_code}' as invasive_plant_code,
                                                                              invasive_plant_aquatic_codes.code_description as invasive_plant, 
                                                                              a.json_array #>> '{plant_life_stage_code}' as plant_life_stage_code,
                                                                              plant_life_stage_codes.code_description as plant_life_stage, 
                                                                              a.json_array #>> '{invasive_plant_density_code}' as invasive_plant_density_code,
                                                                              invasive_plant_density_codes.code_description as invasive_plant_density, 
                                                                              a.json_array #>> '{invasive_plant_distribution_code}' as invasive_plant_distribution_code,
                                                                              invasive_plant_distribution_codes.code_description as invasive_plant_distribution, 
                                                                              a.json_array #>> '{voucher_specimen_collected}' as voucher_specimen_collected,
                                                                              a.json_array #>> '{voucher_specimen_collection_information, accession_number}' as accession_number,
                                                                              a.json_array #>> '{voucher_specimen_collection_information, exact_utm_coords, utm_zone}' as voucher_utm_zone,
                                                                              a.json_array #>> '{voucher_specimen_collection_information, exact_utm_coords, utm_easting}' as voucher_utm_easting,
                                                                              a.json_array #>> '{voucher_specimen_collection_information, exact_utm_coords, utm_northing}' as voucher_utm_northing,
                                                                              a.json_array #>> '{voucher_specimen_collection_information, name_of_herbarium}' as name_of_herbarium,
                                                                              a.json_array #>> '{voucher_specimen_collection_information, voucher_sample_id}' as voucher_sample_id,
                                                                              a.json_array #>> '{voucher_specimen_collection_information, date_voucher_verified}' as date_voucher_verified,
                                                                              a.json_array #>> '{voucher_specimen_collection_information, date_voucher_collected}' as date_voucher_collected,
                                                                              a.json_array #>> '{voucher_specimen_collection_information, voucher_verification_completed_by, person_name}' as voucher_person_name,
                                                                              a.json_array #>> '{voucher_specimen_collection_information, voucher_verification_completed_by, organization}' as voucher_organization
                                                                            from 
                                                                              aquatic_plant_json a 
                                                                              left join adjacent_land_use_agg on adjacent_land_use_agg.activity_incoming_data_id = a.activity_incoming_data_id 
                                                                              left join waterbody_use_agg on waterbody_use_agg.activity_incoming_data_id = a.activity_incoming_data_id 
                                                                              left join waterbody_inflow_agg on waterbody_inflow_agg.activity_incoming_data_id = a.activity_incoming_data_id 
                                                                              left join waterbody_inflow_other_agg on waterbody_inflow_other_agg.activity_incoming_data_id = a.activity_incoming_data_id 
                                                                              left join waterbody_outflow_agg on waterbody_outflow_agg.activity_incoming_data_id = a.activity_incoming_data_id 
                                                                              left join waterbody_outflow_other_agg on waterbody_outflow_other_agg.activity_incoming_data_id = a.activity_incoming_data_id 
                                                                              left join water_level_management_agg on water_level_management_agg.activity_incoming_data_id = a.activity_incoming_data_id 
                                                                              left join substrate_type_agg on substrate_type_agg.activity_incoming_data_id = a.activity_incoming_data_id 
                                                                              left join code_header invasive_plant_aquatic_code_header on invasive_plant_aquatic_code_header.code_header_title = 'invasive_plant_aquatic_code' 
                                                                              and invasive_plant_aquatic_code_header.valid_to is null 
                                                                              left join code invasive_plant_aquatic_codes on invasive_plant_aquatic_codes.code_header_id = invasive_plant_aquatic_code_header.code_header_id 
                                                                              and a.json_array #>> '{invasive_plant_code}' = invasive_plant_aquatic_codes.code_name
                                                                              left join code_header plant_life_stage_code_header on plant_life_stage_code_header.code_header_title = 'plant_life_stage_code' 
                                                                              and plant_life_stage_code_header.valid_to is null 
                                                                              left join code plant_life_stage_codes on plant_life_stage_codes.code_header_id = plant_life_stage_code_header.code_header_id 
                                                                              and a.json_array #>> '{plant_life_stage_code}' = plant_life_stage_codes.code_name
                                                                              left join code_header invasive_plant_density_code_header on invasive_plant_density_code_header.code_header_title = 'invasive_plant_density_code' 
                                                                              and invasive_plant_density_code_header.valid_to is null 
                                                                              left join code invasive_plant_density_codes on invasive_plant_density_codes.code_header_id = invasive_plant_density_code_header.code_header_id 
                                                                              and a.json_array #>> '{invasive_plant_density_code}' = invasive_plant_density_codes.code_name
                                                                              left join code_header invasive_plant_distribution_code_header on invasive_plant_distribution_code_header.code_header_title = 'invasive_plant_distribution_code' 
                                                                              and invasive_plant_distribution_code_header.valid_to is null 
                                                                              left join code invasive_plant_distribution_codes on invasive_plant_distribution_codes.code_header_id = invasive_plant_distribution_code_header.code_header_id 
                                                                              and a.json_array #>> '{invasive_plant_distribution_code}' = invasive_plant_distribution_codes.code_name
                                                                              ) 
                                                                        SELECT 
                                                                          c.activity_incoming_data_id, 
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
                                                                          c.employer_description as employer, 
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
                                                                        FROM 
                                                                          common_fields c 
                                                                          join aquatic_plant_json_select a on a.activity_incoming_data_id = c.activity_incoming_data_id
                                                                      );
 
-- terrestrial chemical treatment  
                                                                   
                                                                     
create 
or replace view treatment_chemical_terrestrial_plant_summary as (
  with array_elements as (
    select 
      activity_incoming_data_id, 
      activity_subtype, 
      jurisdictions_array, 
      project_code_array, 
      person_array, 
      funding_list 
    from 
      activity_incoming_data 
      left join jsonb_array_elements(
        activity_payload #> '{form_data, activity_data, jurisdictions}') jurisdictions_array on true
        left join jsonb_array_elements(
          activity_payload #> '{form_data, activity_data, project_code}') project_code_array on true
          left join jsonb_array_elements(
            activity_payload #> '{form_data, activity_type_data, activity_persons}') person_array on true
            left join convert_string_list_to_array_elements(
              activity_payload #>> '{form_data, activity_data, invasive_species_agency_code}') funding_list on true
              where 
                activity_incoming_data_id in (
                  select 
                    incoming_data_id 
                  from 
                    activity_current
                ) 
                and form_status = 'Submitted' 
                and deleted_timestamp is null 
                and activity_subtype = 'Activity_Treatment_ChemicalPlantTerrestrial'
            ), 
            array_aggregate as (
              select 
                a.activity_incoming_data_id, 
                string_agg (
                  distinct a.project_code_array #>> '{description}',
                  ', '
                ) project, 
                string_agg (
                  distinct a.person_array #>> '{person_name}',
                  ', '
                ) person_name, 
                string_agg(
                  distinct CASE WHEN a.person_array #>> '{applicator_license}' IS NOT NULL
                  THEN concat(
                    a.person_array #>> '{person_name}', ', ', a.person_array #>> '{applicator_license}'
                    ) ELSE a.person_array #>> '{person_name}'
                  END,
                  ', '
                ) treatment_person_name, 
                string_agg (
                  distinct concat(
                    jurisdiction_codes.code_description, 
                    ' ', 
                    (
                      a.jurisdictions_array #>> '{percent_covered}' || '%')
                      ), 
                    ', '
                  ) jurisdiction, 
                  string_agg(
                    distinct invasive_species_agency_codes.code_description, 
                    ', '
                  ) funding_agency 
                  from 
                    array_elements a 
                    left join code_header jurisdiction_code_header on jurisdiction_code_header.code_header_title = 'jurisdiction_code' 
                    and jurisdiction_code_header.valid_to is null 
                    left join code jurisdiction_codes on jurisdiction_codes.code_header_id = jurisdiction_code_header.code_header_id 
                    and a.jurisdictions_array #>> '{jurisdiction_code}' = jurisdiction_codes.code_name
                    left join code_header invasive_species_agency_code_header on invasive_species_agency_code_header.code_header_title = 'invasive_species_agency_code' 
                    and invasive_species_agency_code_header.valid_to is null 
                    left join code invasive_species_agency_codes on invasive_species_agency_codes.code_header_id = invasive_species_agency_code_header.code_header_id 
                    and a.funding_list = invasive_species_agency_codes.code_name 
                  group by 
                    a.activity_incoming_data_id
                ), 
                common_fields as (
                  select 
                    p.jurisdiction, 
                    a.activity_incoming_data_id, 
                    a.activity_id, 
                    a.activity_payload #>> '{short_id}' as short_id,
                    p.project as project_code, 
                    a.activity_payload #>> '{activity_type}' as activity_type,
                    a.activity_payload #>> '{activity_subtype}' as activity_subtype,
                    a.form_status, 
                    to_char(
                      to_timestamp(
                        a.activity_payload #>> '{form_data, activity_data, activity_date_time}', 'YYYY-MM-DD"T"HH24:MI:SS'), 'YYYY-MM-DD HH24:MI:SS') AS activity_date_time,
                        a.activity_payload #>> '{form_data, activity_data, utm_zone}' AS utm_zone,
                        a.activity_payload #>> '{form_data, activity_data, utm_easting}' AS utm_easting,
                        a.activity_payload #>> '{form_data, activity_data, utm_northing}' AS utm_northing,
                        a.activity_payload #>> '{form_data, activity_data, latitude}' AS latitude,
                        a.activity_payload #>> '{form_data, activity_data, longitude}' AS longitude,
                        translate(
                          a.activity_payload #>> '{species_positive}', '[]"', '') as species_positive,
                          jsonb_array_length(
                            a.activity_payload #> '{species_positive}') as positive_species_count,
                            translate(
                              a.activity_payload #>> '{species_negative}', '[]"', '') as species_negative,
                              jsonb_array_length(
                                a.activity_payload #> '{species_negative}') as negative_species_count,
                                a.activity_payload #>> '{form_data, activity_data, reported_area}' AS reported_area_sqm,
                                a.activity_payload #>> '{form_data, activity_type_data, pre_treatment_observation}' AS pre_treatment_observation,
                                p.person_name as observation_person, 
                                p.treatment_person_name as treatment_person, 
                                a.activity_payload #>> '{form_data, activity_data, employer_code}' AS employer_code,
                                employer_codes.code_description as employer_description, 
                                p.funding_agency, 
                                a.activity_payload #>> '{form_data, activity_data, access_description}' AS access_description,
                                a.activity_payload #>> '{form_data, activity_data, location_description}' AS location_description,
                                a.activity_payload #>> '{form_data, activity_data, general_comment}' AS comment,
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
                                (
                                  case when a.media_keys is null then 'No' else 'Yes' end
                                ) as photo, 
                                a.created_timestamp, 
                                a.received_timestamp 
                                FROM 
                                  activity_incoming_data a 
                                  left join array_aggregate p on p.activity_incoming_data_id = a.activity_incoming_data_id 
                                  left join code_header employer_code_header on employer_code_header.code_header_title = 'employer_code' 
                                  and employer_code_header.valid_to is null 
                                  left join code employer_codes on employer_codes.code_header_id = employer_code_header.code_header_id 
                                  and a.activity_payload #>> '{form_data, activity_data, employer_code}' = employer_codes.code_name
                                where 
                                  a.activity_incoming_data_id in (
                                    select 
                                      incoming_data_id 
                                    from 
                                      activity_current
                                  ) 
                                  and a.form_status = 'Submitted' 
                                  and a.deleted_timestamp is null 
                                  and a.activity_subtype = 'Activity_Treatment_ChemicalPlantTerrestrial'
                              ), 
                              herbicide_array as (
                                select 
                                  activity_incoming_data_id, 
                                  activity_payload #>> '{form_data, activity_subtype_data, chemical_treatment_details, tank_mix}' as tank_mix,
                                  activity_payload #> '{form_data, activity_subtype_data, chemical_treatment_details, tank_mix_object}' as json_data,
                                  jsonb_array_elements(
                                    activity_payload #> '{form_data, activity_subtype_data, chemical_treatment_details, herbicides}') as json_array
                                    from 
                                      activity_incoming_data 
                                    where 
                                      activity_incoming_data_id in (
                                        select 
                                          incoming_data_id 
                                        from 
                                          activity_current
                                      ) 
                                      and activity_payload #>> '{form_data, activity_subtype_data, chemical_treatment_details, tank_mix}' = 'false' and activity_subtype = 'Activity_Treatment_ChemicalPlantTerrestrial'
                                      and form_status = 'Submitted'
                                      and deleted_timestamp is null
                                      and activity_subtype = 'Activity_Treatment_ChemicalPlantTerrestrial' 
                                  ), 
                                  tank_mix_herbicide_array as (
                                    select 
                                      activity_incoming_data_id, 
                                      activity_payload #>> '{form_data, activity_subtype_data, chemical_treatment_details, tank_mix}' as tank_mix,
                                      activity_payload #> '{form_data, activity_subtype_data, chemical_treatment_details, tank_mix_object}' as json_data,
                                      jsonb_array_elements(
                                        activity_payload #> '{form_data, activity_subtype_data, chemical_treatment_details, tank_mix_object, herbicides}') as json_array
                                        from 
                                          activity_incoming_data 
                                        where 
                                          activity_incoming_data_id in (
                                            select 
                                              incoming_data_id 
                                            from 
                                              activity_current
                                          ) 
                                          and activity_payload #>> '{form_data, activity_subtype_data, chemical_treatment_details, tank_mix}' = 'true' and activity_subtype = 'Activity_Treatment_ChemicalPlantTerrestrial'
                                          and form_status = 'Submitted'
                                          and deleted_timestamp is null
                                          and activity_subtype = 'Activity_Treatment_ChemicalPlantTerrestrial' 
                                      ), 
                                      invasive_plant_array as (
                                        select 
                                          activity_incoming_data_id, 
                                          activity_payload #>> '{form_data, activity_subtype_data, chemical_treatment_details, tank_mix}' as tank_mix,
                                          jsonb_array_elements(
                                            activity_payload #> '{form_data, activity_subtype_data, chemical_treatment_details, invasive_plants}') as json_array
                                            from 
                                              activity_incoming_data 
                                            where 
                                              activity_incoming_data_id in (
                                                select 
                                                  incoming_data_id 
                                                from 
                                                  activity_current
                                              ) 
                                              and activity_subtype = 'Activity_Treatment_ChemicalPlantTerrestrial' 
                                              and form_status = 'Submitted'
                                              and deleted_timestamp is null
                                          ), 
                                          calculation_json as (
                                            select 
                                              activity_incoming_data_id, 
                                              activity_subtype, 
                                              activity_payload #> '{form_data, activity_subtype_data, chemical_treatment_details, calculation_results}' as json_data
                                            from 
                                              activity_incoming_data 
                                            where 
                                              activity_incoming_data_id in (
                                                select 
                                                  incoming_data_id 
                                                from 
                                                  activity_current
                                              ) 
                                              and activity_subtype = 'Activity_Treatment_ChemicalPlantTerrestrial' 
                                              and form_status = 'Submitted' 
                                              and deleted_timestamp is null
                                              and jsonb_array_length(
                                                activity_payload #> '{form_data, activity_subtype_data, chemical_treatment_details, invasive_plants}') = 1
                                                and jsonb_array_length(
                                                  activity_payload #> '{form_data, activity_subtype_data, chemical_treatment_details, herbicides}') = 1
                                                  ), 
                                                calculation_array as (
                                                  select 
                                                    activity_incoming_data_id, 
                                                    activity_subtype, 
                                                    activity_payload #>> '{form_data, activity_subtype_data, chemical_treatment_details, tank_mix}' as tank_mix,
                                                    activity_payload #> '{form_data, activity_subtype_data, chemical_treatment_details, calculation_results}' as json_data,
                                                    jsonb_array_elements(
                                                      activity_payload #> '{form_data, activity_subtype_data, chemical_treatment_details, calculation_results, invasive_plants}') as json_array
                                                      from 
                                                        activity_incoming_data 
                                                      where 
                                                        activity_incoming_data_id in (
                                                          select 
                                                            incoming_data_id 
                                                          from 
                                                            activity_current
                                                        ) 
                                                        and activity_subtype = 'Activity_Treatment_ChemicalPlantTerrestrial' 
                                                        and form_status = 'Submitted'
                                                        and deleted_timestamp is null
                                                    ), 
                                                    calculation_herbicide_array as (
                                                      select 
                                                        c.activity_incoming_data_id, 
                                                        c.activity_subtype, 
                                                        c.tank_mix, 
                                                        jsonb_array_elements(
                                                          c.json_array #> '{herbicides}') as json_array
                                                          from 
                                                            calculation_array c 

                                                        ), 
                                                        tank_mix_herbicide_select as (
                                                          select 
                                                            t.activity_incoming_data_id, 
                                                            t.json_array #>> '{herbicide_code}' as herbicide_code,
                                                            liquid_herbicide_codes.code_description as liquid_herbicide, 
                                                            granular_herbicide_codes.code_description as granular_herbicide, 
                                                            t.json_array #>> '{herbicide_type_code}' as herbicide_type_code,
                                                            herbicide_type_codes.code_description as herbicide_type, 
                                                            t.json_array #>> '{product_application_rate}' as product_application_rate,
                                                            t.json_data #>> '{amount_of_mix}' as amount_of_mix,
                                                            t.json_data #>> '{calculation_type}' as calculation_type_code,
                                                            calculation_type_codes.code_description as calculation_type, 
                                                            t.json_data #>> '{delivery_rate_of_mix}' as delivery_rate_of_mix,
                                                            t.json_array #>> '{index}' as tank_mix_herbicide_index,
                                                            concat(
                                                              activity_incoming_data_id, 
                                                              '-index-', 
                                                              t.json_array #>> '{index}') as tank_mix_herbicide_id
                                                              from 
                                                                tank_mix_herbicide_array t 
                                                                left join code_header liquid_herbicide_code_header on liquid_herbicide_code_header.code_header_title = 'liquid_herbicide_code' 
                                                                and liquid_herbicide_code_header.valid_to is null 
                                                                left join code liquid_herbicide_codes on liquid_herbicide_codes.code_header_id = liquid_herbicide_code_header.code_header_id 
                                                                and t.json_array #>> '{herbicide_code}' = liquid_herbicide_codes.code_name
                                                                left join code_header granular_herbicide_code_header on granular_herbicide_code_header.code_header_title = 'granular_herbicide_code' 
                                                                and granular_herbicide_code_header.valid_to is null 
                                                                left join code granular_herbicide_codes on granular_herbicide_codes.code_header_id = granular_herbicide_code_header.code_header_id 
                                                                and t.json_array #>> '{herbicide_code}' = granular_herbicide_codes.code_name
                                                                left join code_header calculation_type_code_header on calculation_type_code_header.code_header_title = 'calculation_type_code' 
                                                                and calculation_type_code_header.valid_to is null 
                                                                left join code calculation_type_codes on calculation_type_codes.code_header_id = calculation_type_code_header.code_header_id 
                                                                and t.json_data #>> '{calculation_type}' = calculation_type_codes.code_name
                                                                left join code_header herbicide_type_code_header on herbicide_type_code_header.code_header_title = 'herbicide_type_code' 
                                                                and herbicide_type_code_header.valid_to is null 
                                                                left join code herbicide_type_codes on herbicide_type_codes.code_header_id = herbicide_type_code_header.code_header_id 
                                                                and t.json_array #>> '{herbicide_type_code}' = herbicide_type_codes.code_name
                                                            ), 
                                                            herbicide_select as (
                                                              select 
                                                                t.activity_incoming_data_id, 
                                                                t.json_array #>> '{herbicide_code}' as herbicide_code,
                                                                liquid_herbicide_codes.code_description as liquid_herbicide, 
                                                                granular_herbicide_codes.code_description as granular_herbicide, 
                                                                t.json_array #>> '{herbicide_type_code}' as herbicide_type_code,
                                                                herbicide_type_codes.code_description as herbicide_type, 
                                                                t.json_array #>> '{product_application_rate}' as product_application_rate,
                                                                t.json_array #>> '{amount_of_mix}' as amount_of_mix,
                                                                t.json_array #>> '{dilution}' as dilution,
                                                                t.json_array #>> '{area_treated_sqm}' as area_treated_sqm,
                                                                c.json_data #>> '{dilution}' as dilution2,
                                                                c.json_data #>> '{area_treated_sqm}' as area_treated_sqm2,
                                                                c.json_data #>> '{percent_area_covered}' as percent_area_covered2,
                                                                c.json_data #>> '{area_treated_hectares}' as area_treated_hectares2,
                                                                c.json_data #>> '{amount_of_undiluted_herbicide_used_liters}' as amount_of_undiluted_herbicide_used_liters2,
                                                                t.json_array #>> '{calculation_type}' as calculation_type_code,
                                                                calculation_type_codes.code_description as calculation_type, 
                                                                t.json_array #>> '{delivery_rate_of_mix}' as delivery_rate_of_mix,
                                                                concat(
                                                                  t.activity_incoming_data_id, 
                                                                  '-index-', 
                                                                  t.json_array #>> '{index}') as herbicide_id
                                                                  from 
                                                                    herbicide_array t 
                                                                    left join calculation_json c on c.activity_incoming_data_id = t.activity_incoming_data_id 
                                                                    left join code_header liquid_herbicide_code_header on liquid_herbicide_code_header.code_header_title = 'liquid_herbicide_code' 
                                                                    and liquid_herbicide_code_header.valid_to is null 
                                                                    left join code liquid_herbicide_codes on liquid_herbicide_codes.code_header_id = liquid_herbicide_code_header.code_header_id 
                                                                    and t.json_array #>> '{herbicide_code}' = liquid_herbicide_codes.code_name
                                                                    left join code_header granular_herbicide_code_header on granular_herbicide_code_header.code_header_title = 'granular_herbicide_code' 
                                                                    and granular_herbicide_code_header.valid_to is null 
                                                                    left join code granular_herbicide_codes on granular_herbicide_codes.code_header_id = granular_herbicide_code_header.code_header_id 
                                                                    and t.json_array #>> '{herbicide_code}' = granular_herbicide_codes.code_name
                                                                    left join code_header calculation_type_code_header on calculation_type_code_header.code_header_title = 'calculation_type_code' 
                                                                    and calculation_type_code_header.valid_to is null 
                                                                    left join code calculation_type_codes on calculation_type_codes.code_header_id = calculation_type_code_header.code_header_id 
                                                                    and t.json_array #>> '{calculation_type}' = calculation_type_codes.code_name
                                                                    left join code_header herbicide_type_code_header on herbicide_type_code_header.code_header_title = 'herbicide_type_code' 
                                                                    and herbicide_type_code_header.valid_to is null 
                                                                    left join code herbicide_type_codes on herbicide_type_codes.code_header_id = herbicide_type_code_header.code_header_id 
                                                                    and t.json_array #>> '{herbicide_type_code}' = herbicide_type_codes.code_name
                                                                ), 
                                                                calculation_array_select as (
                                                                  select 
                                                                    i.activity_incoming_data_id, 
                                                                    i.json_data #>> '{dilution}' as dilution,
                                                                    i.json_data #>> '{area_treated_hectares}' as area_treated_hectares,
                                                                    i.json_array #>> '{area_treated_hectares}' as area_treated_hectares2,
                                                                    i.json_array #>> '{area_treated_ha}' as area_treated_ha,
                                                                    i.json_array #>> '{area_treated_sqm}' as area_treated_sqm,
                                                                    i.json_array #>> '{amount_of_mix_used}' as amount_of_mix_used,
                                                                    i.json_array #>> '{percent_area_covered}' as percent_area_covered,
                                                                    i.json_array #>> '{percentage_area_covered}' as percentage_area_covered,
                                                                    i.json_array #>> '{amount_of_undiluted_herbicide_used_liters}' as amount_of_undiluted_herbicide_used_liters,
                                                                    concat(
                                                                      activity_incoming_data_id, 
                                                                      '-index-', 
                                                                      i.json_array #>> '{index}') as calculation_invasive_plant_id
                                                                      from 
                                                                        calculation_array i 
                                                                    ), 
                                                                    calculation_herbicide_array_select as (
                                                                      select 
                                                                        h.activity_incoming_data_id, 
                                                                        h.json_array #>> '{herbIndex}' as herbIndex,
                                                                        h.json_array #>> '{plantIndex}' as plantIndex,
                                                                        h.json_array #>> '{dilution}' as dilution,
                                                                        h.json_array #>> '{amount_of_undiluted_herbicide_used_liters}' as amount_of_undiluted_herbicide_used_liters,
                                                                        concat(
                                                                          activity_incoming_data_id, 
                                                                          '-index-', 
                                                                          h.json_array #>> '{plantIndex}') as calculation_herbicide_id
                                                                          from 
                                                                            calculation_herbicide_array h
                                                                        ), 
                                                                        invasive_plant_array_select as (
                                                                          select 
                                                                            i.activity_incoming_data_id, 
                                                                            i.json_array #>> '{invasive_plant_code}' as invasive_plant_code,
                                                                            invasive_plant_codes.code_description as invasive_plant, 
                                                                            i.json_array #>> '{percent_area_covered}' as percent_area_covered,
                                                                            i.json_array #>> '{index}' as invasive_plant_index,
                                                                            concat(
                                                                              activity_incoming_data_id, 
                                                                              '-index-', 
                                                                              i.json_array #>> '{index}') as invasive_plant_id
                                                                              from 
                                                                                invasive_plant_array i 
                                                                                left join code_header invasive_plant_code_header on invasive_plant_code_header.code_header_title = 'invasive_plant_code' 
                                                                                and invasive_plant_code_header.valid_to is null 
                                                                                left join code invasive_plant_codes on invasive_plant_codes.code_header_id = invasive_plant_code_header.code_header_id 
                                                                                and i.json_array #>> '{invasive_plant_code}' = invasive_plant_codes.code_name
                                                                                ), 
                                                                            not_tank_mix_plant_herbicide_join as (
                                                                              select 
                                                                                i.activity_incoming_data_id, 
                                                                                i.invasive_plant, 
                                                                                i.percent_area_covered as ip_percent_area_covered, 
                                                                                i.invasive_plant_id, 
                                                                                concat(
                                                                                  h.liquid_herbicide, h.granular_herbicide
                                                                                ) as herbicide, 
                                                                                h.herbicide_type, 
                                                                                h.product_application_rate, 
                                                                                h.amount_of_mix, 
                                                                                h.calculation_type, 
                                                                                h.delivery_rate_of_mix, 
                                                                                h.herbicide_id, 
                                                                                coalesce(
                                                                                  c.area_treated_sqm, h.area_treated_sqm, 
                                                                                  h.area_treated_sqm2
                                                                                ) as area_treated_sqm_calculated, 
                                                                                coalesce(
                                                                                  h.area_treated_sqm, h.area_treated_sqm2
                                                                                ) as area_treated_sqm_user, 
                                                                                c.amount_of_mix_used, 
                                                                                coalesce(
                                                                                  c.area_treated_hectares, c.area_treated_hectares2, 
                                                                                  h.area_treated_hectares2
                                                                                ) as area_treated_hectares, 
                                                                                coalesce(
                                                                                  c.percentage_area_covered, c.percent_area_covered, 
                                                                                  h.percent_area_covered2
                                                                                ) as percentage_area_covered, 
                                                                                coalesce(
                                                                                  c.amount_of_undiluted_herbicide_used_liters, 
                                                                                  h.amount_of_undiluted_herbicide_used_liters2
                                                                                ) as amount_of_undiluted_herbicide_used_liters, 
                                                                                coalesce(
                                                                                  h.dilution, h.dilution2, c.dilution
                                                                                ) as dilution 
                                                                              from 
                                                                                invasive_plant_array_select i 
                                                                                inner join herbicide_select h on h.activity_incoming_data_id = i.activity_incoming_data_id 
                                                                                left join calculation_array_select c on c.calculation_invasive_plant_id = i.invasive_plant_id
                                                                            ), 
                                                                            tank_mix_plant_results_select as (
                                                                              select 
                                                                                h.activity_incoming_data_id, 
                                                                                h.calculation_herbicide_id, 
                                                                                concat(
                                                                                  h.activity_incoming_data_id, '-index-', 
                                                                                  h.herbIndex, h.plantIndex
                                                                                ) as results_herbicide_plant_index, 
                                                                                h.dilution, 
                                                                                h.amount_of_undiluted_herbicide_used_liters, 
                                                                                c.calculation_invasive_plant_id, 
                                                                                c.area_treated_ha, 
                                                                                c.area_treated_sqm, 
                                                                                c.amount_of_mix_used, 
                                                                                c.percent_area_covered 
                                                                              from 
                                                                                calculation_herbicide_array_select h 
                                                                                inner join calculation_array_select c on c.calculation_invasive_plant_id = h.calculation_herbicide_id
                                                                            ), 
                                                                            invasive_plant_herbicide as (
                                                                              select 
                                                                                i.activity_incoming_data_id, 
                                                                                concat(
                                                                                  i.activity_incoming_data_id, '-index-', 
                                                                                  h.tank_mix_herbicide_index, i.invasive_plant_index
                                                                                ) as herbicide_plant_index, 
                                                                                i.invasive_plant, 
                                                                                i.percent_area_covered, 
                                                                                i.invasive_plant_id, 
                                                                                h.tank_mix_herbicide_index, 
                                                                                concat(
                                                                                  h.liquid_herbicide, h.granular_herbicide
                                                                                ) as herbicide, 
                                                                                h.herbicide_type, 
                                                                                h.product_application_rate, 
                                                                                h.amount_of_mix, 
                                                                                h.calculation_type, 
                                                                                h.delivery_rate_of_mix, 
                                                                                h.tank_mix_herbicide_id 
                                                                              from 
                                                                                invasive_plant_array_select i 
                                                                                inner join tank_mix_herbicide_select h on h.activity_incoming_data_id = i.activity_incoming_data_id
                                                                            ), 
                                                                            tank_mix_results_select as (
                                                                              select 
                                                                                i.activity_incoming_data_id, 
                                                                                i.invasive_plant, 
                                                                                i.percent_area_covered as ip_percent_area_covered, 
                                                                                i.invasive_plant_id, 
                                                                                i.herbicide, 
                                                                                i.herbicide_type, 
                                                                                i.product_application_rate, 
                                                                                i.amount_of_mix, 
                                                                                i.calculation_type, 
                                                                                i.delivery_rate_of_mix, 
                                                                                i.tank_mix_herbicide_id, 
                                                                                c.calculation_herbicide_id, 
                                                                                c.dilution, 
                                                                                c.amount_of_undiluted_herbicide_used_liters, 
                                                                                c.calculation_invasive_plant_id, 
                                                                                c.area_treated_ha, 
                                                                                c.area_treated_sqm, 
                                                                                c.amount_of_mix_used, 
                                                                                c.percent_area_covered 
                                                                              from 
                                                                                invasive_plant_herbicide i 
                                                                                left join tank_mix_plant_results_select c on c.results_herbicide_plant_index = i.herbicide_plant_index
                                                                            ), 
                                                                            jurisdiction_array as (
                                                                              select 
                                                                                activity_incoming_data_id, 
                                                                                activity_subtype, 
                                                                                jsonb_array_elements(
                                                                                  activity_payload #> '{form_data, activity_data, jurisdictions}') as jurisdictions_array
                                                                                  from 
                                                                                    activity_incoming_data 
                                                                                  where 
                                                                                    activity_incoming_data_id in (
                                                                                      select 
                                                                                        incoming_data_id 
                                                                                      from 
                                                                                        activity_current
                                                                                    ) 
                                                                                    and activity_subtype = 'Activity_Treatment_ChemicalPlantTerrestrial'
                                                                                    and form_status = 'Submitted'
                                                                                    and deleted_timestamp is null
                                                                                ), 
                                                                                jurisdiction_array_select as (
                                                                                  select 
                                                                                    j.activity_incoming_data_id, 
                                                                                    j.jurisdictions_array #>> '{jurisdiction_code}' as jurisdiction_code,
                                                                                    jurisdiction_codes.code_description as jurisdiction, 
                                                                                    j.jurisdictions_array #>> '{percent_covered}' as percent_covered
                                                                                  from 
                                                                                    jurisdiction_array j 
                                                                                    left join code_header jurisdiction_code_header on jurisdiction_code_header.code_header_title = 'jurisdiction_code' 
                                                                                    and jurisdiction_code_header.valid_to is null 
                                                                                    left join code jurisdiction_codes on jurisdiction_codes.code_header_id = jurisdiction_code_header.code_header_id 
                                                                                    and j.jurisdictions_array #>> '{jurisdiction_code}' = jurisdiction_codes.code_name
                                                                                    ), 
                                                                                form_data as (
                                                                                  select 
                                                                                    activity_incoming_data_id, 
                                                                                    activity_subtype, 
                                                                                    form_status, 
                                                                                    activity_incoming_data.activity_payload #> '{form_data, activity_subtype_data}' as form_data
                                                                                  from 
                                                                                    activity_incoming_data 
                                                                                  where 
                                                                                    activity_incoming_data_id in (
                                                                                      select 
                                                                                        incoming_data_id 
                                                                                      from 
                                                                                        activity_current
                                                                                    ) 
                                                                                    and activity_subtype = 'Activity_Treatment_ChemicalPlantTerrestrial' 
                                                                                    and form_status = 'Submitted'
                                                                                    and deleted_timestamp is null
                                                                                ), 
                                                                                json_select as (
                                                                                  select 
                                                                                    f.activity_incoming_data_id, 
                                                                                    f.form_data #>> '{Treatment_ChemicalPlant_Information, pesticide_employer_code}' as service_license_company,
                                                                                    service_license_codes.code_description as service_license, 
                                                                                    f.form_data #>> '{Treatment_ChemicalPlant_Information, pesticide_use_permit_PUP}' as pesticide_use_permit,
                                                                                    f.form_data #>> '{Treatment_ChemicalPlant_Information, pest_management_plan}' as pest_management_plan,
                                                                                    f.form_data #>> '{Treatment_ChemicalPlant_Information, pmp_not_in_dropdown}' as pmp_not_in_dropdown,
                                                                                    f.form_data #>> '{Treatment_ChemicalPlant_Information, temperature}' as temperature,
                                                                                    f.form_data #>> '{Treatment_ChemicalPlant_Information, wind_speed}' as wind_speed,
                                                                                    f.form_data #>> '{Treatment_ChemicalPlant_Information, wind_direction_code}' as wind_direction,
                                                                                    f.form_data #>> '{Treatment_ChemicalPlant_Information, humidity}' as humidity,
                                                                                    f.form_data #>> '{Treatment_ChemicalPlant_Information, signage_on_site}' as treatment_notice_signs,
                                                                                    f.form_data #>> '{Treatment_ChemicalPlant_Information, application_start_time}' as application_start_time,
                                                                                    h.invasive_plant, 
                                                                                    coalesce(
                                                                                      h.ip_percent_area_covered, '100'
                                                                                    ) as ip_percent_area_covered, 
                                                                                    j.jurisdiction, 
                                                                                    j.percent_covered, 
                                                                                    f.form_data #>> '{chemical_treatment_details, tank_mix}' as tank_mix,
                                                                                    f.form_data #>> '{chemical_treatment_details, chemical_application_method}' as chemical_application_method_code,
                                                                                    chemical_method_codes.code_description as chemical_application_method, 
                                                                                    h.herbicide_type, 
                                                                                    h.herbicide, 
                                                                                    h.calculation_type, 
                                                                                    coalesce(
                                                                                      h.amount_of_mix_used, h.amount_of_mix
                                                                                    ) as amount_of_mix, 
                                                                                    h.delivery_rate_of_mix, 
                                                                                    h.product_application_rate, 
                                                                                    h.dilution, 
                                                                                    h.amount_of_undiluted_herbicide_used_liters, 
                                                                                    h.area_treated_hectares, 
                                                                                    coalesce(
                                                                                      h.area_treated_sqm_calculated, h.area_treated_sqm_user
                                                                                    ) as area_treated_sqm_user, 
                                                                                    h.percentage_area_covered 
                                                                                  from 
                                                                                    form_data f 
                                                                                    inner join not_tank_mix_plant_herbicide_join h on h.activity_incoming_data_id = f.activity_incoming_data_id 
                                                                                    left join jurisdiction_array_select j on j.activity_incoming_data_id = f.activity_incoming_data_id 
                                                                                    left join code_header chemical_method_code_header on chemical_method_code_header.code_header_title = 'chemical_method_code' 
                                                                                    and chemical_method_code_header.valid_to is null 
                                                                                    left join code chemical_method_codes on chemical_method_codes.code_header_id = chemical_method_code_header.code_header_id 
                                                                                    and f.form_data #>> '{chemical_treatment_details, chemical_application_method}' = chemical_method_codes.code_name
                                                                                    left join code_header service_license_code_header on service_license_code_header.code_header_title = 'service_license_code' 
                                                                                    and service_license_code_header.valid_to is null 
                                                                                    left join code service_license_codes on service_license_codes.code_header_id = service_license_code_header.code_header_id 
                                                                                    and f.form_data #>> '{Treatment_ChemicalPlant_Information, pesticide_employer_code}' = service_license_codes.code_name
                                                                                  where 
                                                                                    f.form_data #>> '{chemical_treatment_details, tank_mix}' = 'false'

                                                                                ), 
                                                                                tank_mix_json_select as (
                                                                                  select 
                                                                                    f.activity_incoming_data_id, 
                                                                                    f.form_data #>> '{Treatment_ChemicalPlant_Information, pesticide_employer_code}' as service_license_company,
                                                                                    service_license_codes.code_description as service_license, 
                                                                                    f.form_data #>> '{Treatment_ChemicalPlant_Information, pesticide_use_permit_PUP}' as pesticide_use_permit,
                                                                                    f.form_data #>> '{Treatment_ChemicalPlant_Information, pest_management_plan}' as pest_management_plan,
                                                                                    f.form_data #>> '{Treatment_ChemicalPlant_Information, temperature}' as temperature,
                                                                                    f.form_data #>> '{Treatment_ChemicalPlant_Information, wind_speed}' as wind_speed,
                                                                                    f.form_data #>> '{Treatment_ChemicalPlant_Information, wind_direction_code}' as wind_direction,
                                                                                    f.form_data #>> '{Treatment_ChemicalPlant_Information, humidity}' as humidity,
                                                                                    f.form_data #>> '{Treatment_ChemicalPlant_Information, signage_on_site}' as treatment_notice_signs,
                                                                                    f.form_data #>> '{Treatment_ChemicalPlant_Information, application_start_time}' as application_start_time,
                                                                                    tm.invasive_plant, 
                                                                                    coalesce(
                                                                                      tm.ip_percent_area_covered, '100'
                                                                                    ) as ip_percent_area_covered, 
                                                                                    j.jurisdiction, 
                                                                                    j.percent_covered, 
                                                                                    f.form_data #>> '{chemical_treatment_details, tank_mix}' as tank_mix,
                                                                                    f.form_data #>> '{chemical_treatment_details, chemical_application_method}' as chemical_application_method_code,
                                                                                    chemical_method_codes.code_description as chemical_application_method, 
                                                                                    tm.herbicide_type, 
                                                                                    tm.herbicide, 
                                                                                    tm.calculation_type, 
                                                                                    tm.amount_of_mix, 
                                                                                    tm.delivery_rate_of_mix, 
                                                                                    tm.product_application_rate, 
                                                                                    tm.dilution, 
                                                                                    tm.amount_of_undiluted_herbicide_used_liters, 
                                                                                    tm.area_treated_ha as area_treated_hectares, 
                                                                                    tm.area_treated_sqm, 
                                                                                    tm.amount_of_mix_used, 
                                                                                    tm.percent_area_covered as percentage_area_covered 
                                                                                  from 
                                                                                    form_data f 
                                                                                    left join tank_mix_results_select tm on tm.activity_incoming_data_id = f.activity_incoming_data_id 
                                                                                    left join jurisdiction_array_select j on j.activity_incoming_data_id = f.activity_incoming_data_id 
                                                                                    left join code_header chemical_method_code_header on chemical_method_code_header.code_header_title = 'chemical_method_code' 
                                                                                    and chemical_method_code_header.valid_to is null 
                                                                                    left join code chemical_method_codes on chemical_method_codes.code_header_id = chemical_method_code_header.code_header_id 
                                                                                    and f.form_data #>> '{chemical_treatment_details, chemical_application_method}' = chemical_method_codes.code_name
                                                                                    left join code_header service_license_code_header on service_license_code_header.code_header_title = 'service_license_code' 
                                                                                    and service_license_code_header.valid_to is null 
                                                                                    left join code service_license_codes on service_license_codes.code_header_id = service_license_code_header.code_header_id 
                                                                                    and f.form_data #>> '{Treatment_ChemicalPlant_Information, pesticide_employer_code}' = service_license_codes.code_name
                                                                                  where 
                                                                                    f.form_data #>> '{chemical_treatment_details, tank_mix}' = 'true'
                                                                                   
                                                                                ) 
                                                                              SELECT 
                                                                                c.activity_incoming_data_id, 
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
                                                                                c.employer_description as employer, 
                                                                                c.funding_agency, 
                                                                                concat(
                                                                                  j.jurisdiction, tm.jurisdiction, 
                                                                                  ' ', j.percent_covered, tm.percent_covered, 
                                                                                  '%'
                                                                                ) as jurisdiction, 
                                                                                c.access_description, 
                                                                                c.location_description, 
                                                                                c.comment, 
                                                                                c.treatment_person, 
                                                                                c.well_proximity, 
                                                                                j.service_license, 
                                                                                concat(
                                                                                  tm.pesticide_use_permit, j.pesticide_use_permit
                                                                                ) as pesticide_use_permit, 
                                                                                concat(
                                                                                  tm.pest_management_plan, j.pest_management_plan
                                                                                ) as pest_management_plan, 
                                                                                j.pmp_not_in_dropdown as pmp_not_in_dropdown, 
                                                                                concat(tm.temperature, j.temperature) as temperature_celsius, 
                                                                                concat(tm.wind_speed, j.wind_speed) as wind_speed_km, 
                                                                                concat(
                                                                                  tm.wind_direction, j.wind_direction
                                                                                ) as wind_direction, 
                                                                                concat(tm.humidity, j.humidity) as humidity_percent, 
                                                                                concat(
                                                                                  tm.treatment_notice_signs, j.treatment_notice_signs
                                                                                ) as treatment_notice_signs, 
                                                                                to_char(
                                                                                  to_timestamp(
                                                                                    concat(
                                                                                      tm.application_start_time, j.application_start_time
                                                                                    ), 
                                                                                    'YYYY-MM-DD"T"HH24:MI:SS'
                                                                                  ), 
                                                                                  'YYYY-MM-DD HH24:MI:SS'
                                                                                ) as application_start_time, 
                                                                                concat(
                                                                                  tm.invasive_plant, j.invasive_plant
                                                                                ) as invasive_plant, 
                                                                                concat(
                                                                                  tm.ip_percent_area_covered, j.ip_percent_area_covered, 
                                                                                  '%'
                                                                                ) as invasive_plant_percent, 
                                                                                (
                                                                                  case when concat(tm.tank_mix, j.tank_mix) = 'false' then 'No' else 'Yes' end
                                                                                ) as tank_mix, 
                                                                                concat(
                                                                                  tm.chemical_application_method, 
                                                                                  j.chemical_application_method
                                                                                ) as chemical_application_method, 
                                                                                concat(
                                                                                  tm.herbicide_type, j.herbicide_type
                                                                                ) as herbicide_type, 
                                                                                concat(tm.herbicide, j.herbicide) as herbicide, 
                                                                                concat(
                                                                                  tm.calculation_type, j.calculation_type
                                                                                ) as calculation_type, 
                                                                                concat(
                                                                                  tm.delivery_rate_of_mix, j.delivery_rate_of_mix
                                                                                ) as delivery_rate_of_mix, 
                                                                                concat(
                                                                                  tm.product_application_rate, j.product_application_rate
                                                                                ) as product_application_rate, 
                                                                                concat(tm.dilution, j.dilution) as dilution, 
                                                                                concat(
                                                                                  tm.percent_covered, j.percent_covered
                                                                                ):: float8 / 100 * concat(
                                                                                  tm.amount_of_undiluted_herbicide_used_liters, 
                                                                                  j.amount_of_undiluted_herbicide_used_liters
                                                                                ):: float8 as amount_of_undiluted_herbicide_used_liters, 
                                                                                concat(
                                                                                  tm.percent_covered, j.percent_covered
                                                                                ):: float8 / 100 * concat(
                                                                                  tm.area_treated_hectares, j.area_treated_hectares
                                                                                ):: float8 as area_treated_hectares, 
                                                                                concat(
                                                                                  tm.percent_covered, j.percent_covered
                                                                                ):: float8 / 100 * coalesce(
                                                                                  tm.area_treated_sqm, j.area_treated_sqm_user
                                                                                ):: float8 as area_treated_sqm, 
                                                                                concat(
                                                                                  tm.percent_covered, j.percent_covered
                                                                                ):: float8 / 100 * concat(
                                                                                  tm.amount_of_mix_used, j.amount_of_mix
                                                                                ):: float8 as amount_of_mix_used, 
                                                                                concat(
                                                                                  tm.percent_covered, j.percent_covered
                                                                                ):: float8 / 100 * concat(
                                                                                  tm.percentage_area_covered, j.percentage_area_covered
                                                                                ):: float8 as percent_area_covered, 
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
                                                                              from 
                                                                                common_fields c 
                                                                                left join json_select j on j.activity_incoming_data_id = c.activity_incoming_data_id 
                                                                                left join tank_mix_json_select tm on tm.activity_incoming_data_id = c.activity_incoming_data_id
                                                                            );
                                                                           
-- aquatic chemical treatment

create 
or replace view treatment_chemical_aquatic_plant_summary as (
  with array_elements as (
    select 
      activity_incoming_data_id, 
      activity_subtype, 
      jurisdictions_array, 
      project_code_array, 
      person_array, 
      funding_list 
    from 
      activity_incoming_data 
      left join jsonb_array_elements(
        activity_payload #> '{form_data, activity_data, jurisdictions}') jurisdictions_array on true
        left join jsonb_array_elements(
          activity_payload #> '{form_data, activity_data, project_code}') project_code_array on true
          left join jsonb_array_elements(
            activity_payload #> '{form_data, activity_type_data, activity_persons}') person_array on true
            left join convert_string_list_to_array_elements(
              activity_payload #>> '{form_data, activity_data, invasive_species_agency_code}') funding_list on true
              where 
                activity_incoming_data_id in (
                  select 
                    incoming_data_id 
                  from 
                    activity_current
                ) 
                and form_status = 'Submitted' 
                and deleted_timestamp is null 
                and activity_subtype = 'Activity_Treatment_ChemicalPlantAquatic'
            ), 
            array_aggregate as (
              select 
                a.activity_incoming_data_id, 
                string_agg (
                  distinct a.project_code_array #>> '{description}',
                  ', '
                ) project, 
                string_agg (
                  distinct a.person_array #>> '{person_name}',
                  ', '
                ) person_name, 
                string_agg(
                  distinct CASE WHEN a.person_array #>> '{applicator_license}' IS NOT NULL
                  THEN concat(
                    a.person_array #>> '{person_name}', ', ', a.person_array #>> '{applicator_license}'
                    ) ELSE a.person_array #>> '{person_name}'
                  END, 
                  ', '
                ) treatment_person_name, 
                string_agg (
                  distinct concat(
                    jurisdiction_codes.code_description, 
                    ' ', 
                    (
                      a.jurisdictions_array #>> '{percent_covered}' || '%')
                      ), 
                    ', '
                  ) jurisdiction, 
                  string_agg(
                    distinct invasive_species_agency_codes.code_description, 
                    ', '
                  ) funding_agency 
                  from 
                    array_elements a 
                    left join code_header jurisdiction_code_header on jurisdiction_code_header.code_header_title = 'jurisdiction_code' 
                    and jurisdiction_code_header.valid_to is null 
                    left join code jurisdiction_codes on jurisdiction_codes.code_header_id = jurisdiction_code_header.code_header_id 
                    and a.jurisdictions_array #>> '{jurisdiction_code}' = jurisdiction_codes.code_name
                    left join code_header invasive_species_agency_code_header on invasive_species_agency_code_header.code_header_title = 'invasive_species_agency_code' 
                    and invasive_species_agency_code_header.valid_to is null 
                    left join code invasive_species_agency_codes on invasive_species_agency_codes.code_header_id = invasive_species_agency_code_header.code_header_id 
                    and a.funding_list = invasive_species_agency_codes.code_name 
                  group by 
                    a.activity_incoming_data_id
                ), 
                common_fields as (
                  select 
                    p.jurisdiction, 
                    a.activity_incoming_data_id, 
                    a.activity_id, 
                    a.activity_payload #>> '{short_id}' as short_id,
                    p.project as project_code, 
                    a.activity_payload #>> '{activity_type}' as activity_type,
                    a.activity_payload #>> '{activity_subtype}' as activity_subtype,
                    a.form_status, 
                    to_char(
                      to_timestamp(
                        a.activity_payload #>> '{form_data, activity_data, activity_date_time}', 'YYYY-MM-DD"T"HH24:MI:SS'), 'YYYY-MM-DD HH24:MI:SS') AS activity_date_time,
                        a.activity_payload #>> '{form_data, activity_data, utm_zone}' AS utm_zone,
                        a.activity_payload #>> '{form_data, activity_data, utm_easting}' AS utm_easting,
                        a.activity_payload #>> '{form_data, activity_data, utm_northing}' AS utm_northing,
                        a.activity_payload #>> '{form_data, activity_data, latitude}' AS latitude,
                        a.activity_payload #>> '{form_data, activity_data, longitude}' AS longitude,
                        translate(
                          a.activity_payload #>> '{species_positive}', '[]"', '') as species_positive,
                          jsonb_array_length(
                            a.activity_payload #> '{species_positive}') as positive_species_count,
                            translate(
                              a.activity_payload #>> '{species_negative}', '[]"', '') as species_negative,
                              jsonb_array_length(
                                a.activity_payload #> '{species_negative}') as negative_species_count,
                                a.activity_payload #>> '{form_data, activity_data, reported_area}' AS reported_area_sqm,
                                a.activity_payload #>> '{form_data, activity_type_data, pre_treatment_observation}' AS pre_treatment_observation,
                                p.person_name as observation_person, 
                                p.treatment_person_name as treatment_person, 
                                a.activity_payload #>> '{form_data, activity_data, employer_code}' AS employer_code,
                                employer_codes.code_description as employer_description, 
                                p.funding_agency, 
                                a.activity_payload #>> '{form_data, activity_data, access_description}' AS access_description,
                                a.activity_payload #>> '{form_data, activity_data, location_description}' AS location_description,
                                a.activity_payload #>> '{form_data, activity_data, general_comment}' AS comment,
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
                                (
                                  case when a.media_keys is null then 'No' else 'Yes' end
                                ) as photo, 
                                a.created_timestamp, 
                                a.received_timestamp 
                                FROM 
                                  activity_incoming_data a 
                                  left join array_aggregate p on p.activity_incoming_data_id = a.activity_incoming_data_id 
                                  left join code_header employer_code_header on employer_code_header.code_header_title = 'employer_code' 
                                  and employer_code_header.valid_to is null 
                                  left join code employer_codes on employer_codes.code_header_id = employer_code_header.code_header_id 
                                  and a.activity_payload #>> '{form_data, activity_data, employer_code}' = employer_codes.code_name
                                where 
                                  a.activity_incoming_data_id in (
                                    select 
                                      incoming_data_id 
                                    from 
                                      activity_current
                                  ) 
                                  and a.form_status = 'Submitted' 
                                  and a.deleted_timestamp is null 
                                  and a.activity_subtype = 'Activity_Treatment_ChemicalPlantAquatic'
                              ), 
                              herbicide_array as (
                                select 
                                  activity_incoming_data_id, 
                                  activity_payload #>> '{form_data, activity_subtype_data, chemical_treatment_details, tank_mix}' as tank_mix,
                                  activity_payload #> '{form_data, activity_subtype_data, chemical_treatment_details, tank_mix_object}' as json_data,
                                  jsonb_array_elements(
                                    activity_payload #> '{form_data, activity_subtype_data, chemical_treatment_details, herbicides}') as json_array
                                    from 
                                      activity_incoming_data 
                                    where 
                                      activity_incoming_data_id in (
                                        select 
                                          incoming_data_id 
                                        from 
                                          activity_current
                                      ) 
                                      and activity_payload #>> '{form_data, activity_subtype_data, chemical_treatment_details, tank_mix}' = 'false' and activity_subtype = 'Activity_Treatment_ChemicalPlantAquatic'
                                      and form_status = 'Submitted' 
                                      and deleted_timestamp is null 
                                      and activity_subtype = 'Activity_Treatment_ChemicalPlantAquatic'
                                  ), 
                                  tank_mix_herbicide_array as (
                                    select 
                                      activity_incoming_data_id, 
                                      activity_payload #>> '{form_data, activity_subtype_data, chemical_treatment_details, tank_mix}' as tank_mix,
                                      activity_payload #> '{form_data, activity_subtype_data, chemical_treatment_details, tank_mix_object}' as json_data,
                                      jsonb_array_elements(
                                        activity_payload #> '{form_data, activity_subtype_data, chemical_treatment_details, tank_mix_object, herbicides}') as json_array
                                        from 
                                          activity_incoming_data 
                                        where 
                                          activity_incoming_data_id in (
                                            select 
                                              incoming_data_id 
                                            from 
                                              activity_current
                                          ) 
                                          and activity_payload #>> '{form_data, activity_subtype_data, chemical_treatment_details, tank_mix}' = 'true' and activity_subtype = 'Activity_Treatment_ChemicalPlantAquatic'
                                          and form_status = 'Submitted' 
                                          and deleted_timestamp is null 
                                          and activity_subtype = 'Activity_Treatment_ChemicalPlantAquatic'
                                      ), 
                                      invasive_plant_array as (
                                        select 
                                          activity_incoming_data_id, 
                                          activity_payload #>> '{form_data, activity_subtype_data, chemical_treatment_details, tank_mix}' as tank_mix,
                                          jsonb_array_elements(
                                            activity_payload #> '{form_data, activity_subtype_data, chemical_treatment_details, invasive_plants}') as json_array
                                            from 
                                              activity_incoming_data 
                                            where 
                                              activity_incoming_data_id in (
                                                select 
                                                  incoming_data_id 
                                                from 
                                                  activity_current
                                              ) 
                                              and activity_subtype = 'Activity_Treatment_ChemicalPlantAquatic' 
                                              and form_status = 'Submitted' 
                                              and deleted_timestamp is null
                                          ), 
                                          calculation_json as (
                                            select 
                                              activity_incoming_data_id, 
                                              activity_subtype, 
                                              activity_payload #> '{form_data, activity_subtype_data, chemical_treatment_details, calculation_results}' as json_data
                                            from 
                                              activity_incoming_data 
                                            where 
                                              activity_incoming_data_id in (
                                                select 
                                                  incoming_data_id 
                                                from 
                                                  activity_current
                                              ) 
                                              and activity_subtype = 'Activity_Treatment_ChemicalPlantAquatic' 
                                              and form_status = 'Submitted' 
                                              and deleted_timestamp is null 
                                              and jsonb_array_length(
                                                activity_payload #> '{form_data, activity_subtype_data, chemical_treatment_details, invasive_plants}') = 1
                                                and jsonb_array_length(
                                                  activity_payload #> '{form_data, activity_subtype_data, chemical_treatment_details, herbicides}') = 1
                                                  ), 
                                                calculation_array as (
                                                  select 
                                                    activity_incoming_data_id, 
                                                    activity_subtype, 
                                                    activity_payload #>> '{form_data, activity_subtype_data, chemical_treatment_details, tank_mix}' as tank_mix,
                                                    activity_payload #> '{form_data, activity_subtype_data, chemical_treatment_details, calculation_results}' as json_data,
                                                    jsonb_array_elements(
                                                      activity_payload #> '{form_data, activity_subtype_data, chemical_treatment_details, calculation_results, invasive_plants}') as json_array
                                                      from 
                                                        activity_incoming_data 
                                                      where 
                                                        activity_incoming_data_id in (
                                                          select 
                                                            incoming_data_id 
                                                          from 
                                                            activity_current
                                                        ) 
                                                        and activity_subtype = 'Activity_Treatment_ChemicalPlantAquatic' 
                                                        and form_status = 'Submitted' 
                                                        and deleted_timestamp is null
                                                    ), 
                                                    calculation_herbicide_array as (
                                                      select 
                                                        c.activity_incoming_data_id, 
                                                        c.activity_subtype, 
                                                        c.tank_mix, 
                                                        jsonb_array_elements(
                                                          c.json_array #> '{herbicides}') as json_array
                                                          from 
                                                            calculation_array c
                                                        ), 
                                                        tank_mix_herbicide_select as (
                                                          select 
                                                            t.activity_incoming_data_id, 
                                                            t.json_array #>> '{herbicide_code}' as herbicide_code,
                                                            liquid_herbicide_codes.code_description as liquid_herbicide, 
                                                            granular_herbicide_codes.code_description as granular_herbicide, 
                                                            t.json_array #>> '{herbicide_type_code}' as herbicide_type_code,
                                                            herbicide_type_codes.code_description as herbicide_type, 
                                                            t.json_array #>> '{product_application_rate}' as product_application_rate,
                                                            t.json_data #>> '{amount_of_mix}' as amount_of_mix,
                                                            t.json_data #>> '{calculation_type}' as calculation_type_code,
                                                            calculation_type_codes.code_description as calculation_type, 
                                                            t.json_data #>> '{delivery_rate_of_mix}' as delivery_rate_of_mix,
                                                            t.json_array #>> '{index}' as tank_mix_herbicide_index,
                                                            concat(
                                                              activity_incoming_data_id, 
                                                              '-index-', 
                                                              t.json_array #>> '{index}') as tank_mix_herbicide_id
                                                              from 
                                                                tank_mix_herbicide_array t 
                                                                left join code_header liquid_herbicide_code_header on liquid_herbicide_code_header.code_header_title = 'liquid_herbicide_code' 
                                                                and liquid_herbicide_code_header.valid_to is null 
                                                                left join code liquid_herbicide_codes on liquid_herbicide_codes.code_header_id = liquid_herbicide_code_header.code_header_id 
                                                                and t.json_array #>> '{herbicide_code}' = liquid_herbicide_codes.code_name
                                                                left join code_header granular_herbicide_code_header on granular_herbicide_code_header.code_header_title = 'granular_herbicide_code' 
                                                                and granular_herbicide_code_header.valid_to is null 
                                                                left join code granular_herbicide_codes on granular_herbicide_codes.code_header_id = granular_herbicide_code_header.code_header_id 
                                                                and t.json_array #>> '{herbicide_code}' = granular_herbicide_codes.code_name
                                                                left join code_header calculation_type_code_header on calculation_type_code_header.code_header_title = 'calculation_type_code' 
                                                                and calculation_type_code_header.valid_to is null 
                                                                left join code calculation_type_codes on calculation_type_codes.code_header_id = calculation_type_code_header.code_header_id 
                                                                and t.json_data #>> '{calculation_type}' = calculation_type_codes.code_name
                                                                left join code_header herbicide_type_code_header on herbicide_type_code_header.code_header_title = 'herbicide_type_code' 
                                                                and herbicide_type_code_header.valid_to is null 
                                                                left join code herbicide_type_codes on herbicide_type_codes.code_header_id = herbicide_type_code_header.code_header_id 
                                                                and t.json_array #>> '{herbicide_type_code}' = herbicide_type_codes.code_name
                                                                ), 
                                                            herbicide_select as (
                                                              select 
                                                                t.activity_incoming_data_id, 
                                                                t.json_array #>> '{herbicide_code}' as herbicide_code,
                                                                liquid_herbicide_codes.code_description as liquid_herbicide, 
                                                                granular_herbicide_codes.code_description as granular_herbicide, 
                                                                t.json_array #>> '{herbicide_type_code}' as herbicide_type_code,
                                                                herbicide_type_codes.code_description as herbicide_type, 
                                                                t.json_array #>> '{product_application_rate}' as product_application_rate,
                                                                t.json_array #>> '{amount_of_mix}' as amount_of_mix,
                                                                t.json_array #>> '{dilution}' as dilution,
                                                                t.json_array #>> '{area_treated_sqm}' as area_treated_sqm,
                                                                c.json_data #>> '{dilution}' as dilution2,
                                                                c.json_data #>> '{area_treated_sqm}' as area_treated_sqm2,
                                                                c.json_data #>> '{percent_area_covered}' as percent_area_covered2,
                                                                c.json_data #>> '{area_treated_hectares}' as area_treated_hectares2,
                                                                c.json_data #>> '{amount_of_undiluted_herbicide_used_liters}' as amount_of_undiluted_herbicide_used_liters2,
                                                                t.json_array #>> '{calculation_type}' as calculation_type_code,
                                                                calculation_type_codes.code_description as calculation_type, 
                                                                t.json_array #>> '{delivery_rate_of_mix}' as delivery_rate_of_mix,
                                                                concat(
                                                                  t.activity_incoming_data_id, 
                                                                  '-index-', 
                                                                  t.json_array #>> '{index}') as herbicide_id
                                                                  from 
                                                                    herbicide_array t 
                                                                    left join calculation_json c on c.activity_incoming_data_id = t.activity_incoming_data_id 
                                                                    left join code_header liquid_herbicide_code_header on liquid_herbicide_code_header.code_header_title = 'liquid_herbicide_code' 
                                                                    and liquid_herbicide_code_header.valid_to is null 
                                                                    left join code liquid_herbicide_codes on liquid_herbicide_codes.code_header_id = liquid_herbicide_code_header.code_header_id 
                                                                    and t.json_array #>> '{herbicide_code}' = liquid_herbicide_codes.code_name
                                                                    left join code_header granular_herbicide_code_header on granular_herbicide_code_header.code_header_title = 'granular_herbicide_code' 
                                                                    and granular_herbicide_code_header.valid_to is null 
                                                                    left join code granular_herbicide_codes on granular_herbicide_codes.code_header_id = granular_herbicide_code_header.code_header_id 
                                                                    and t.json_array #>> '{herbicide_code}' = granular_herbicide_codes.code_name
                                                                    left join code_header calculation_type_code_header on calculation_type_code_header.code_header_title = 'calculation_type_code' 
                                                                    and calculation_type_code_header.valid_to is null 
                                                                    left join code calculation_type_codes on calculation_type_codes.code_header_id = calculation_type_code_header.code_header_id 
                                                                    and t.json_array #>> '{calculation_type}' = calculation_type_codes.code_name
                                                                    left join code_header herbicide_type_code_header on herbicide_type_code_header.code_header_title = 'herbicide_type_code' 
                                                                    and herbicide_type_code_header.valid_to is null 
                                                                    left join code herbicide_type_codes on herbicide_type_codes.code_header_id = herbicide_type_code_header.code_header_id 
                                                                    and t.json_array #>> '{herbicide_type_code}' = herbicide_type_codes.code_name
                                                                    ), 
                                                                calculation_array_select as (
                                                                  select 
                                                                    i.activity_incoming_data_id, 
                                                                    i.json_data #>> '{dilution}' as dilution,
                                                                    i.json_array #>> '{area_treated_hectares}' as area_treated_hectares,
                                                                    i.json_array #>> '{area_treated_ha}' as area_treated_ha,
                                                                    i.json_array #>> '{area_treated_sqm}' as area_treated_sqm,
                                                                    i.json_array #>> '{amount_of_mix_used}' as amount_of_mix_used,
                                                                    i.json_array #>> '{percent_area_covered}' as percent_area_covered,
                                                                    i.json_array #>> '{percentage_area_covered}' as percentage_area_covered,
                                                                    i.json_array #>> '{amount_of_undiluted_herbicide_used_liters}' as amount_of_undiluted_herbicide_used_liters,
                                                                    concat(
                                                                      activity_incoming_data_id, 
                                                                      '-index-', 
                                                                      i.json_array #>> '{index}') as calculation_invasive_plant_id
                                                                      from 
                                                                        calculation_array i
                                                                    ), 
                                                                    calculation_herbicide_array_select as (
                                                                      select 
                                                                        h.activity_incoming_data_id, 
                                                                        h.json_array #>> '{herbIndex}' as herbIndex,
                                                                        h.json_array #>> '{plantIndex}' as plantIndex,
                                                                        h.json_array #>> '{dilution}' as dilution,
                                                                        h.json_array #>> '{amount_of_undiluted_herbicide_used_liters}' as amount_of_undiluted_herbicide_used_liters,
                                                                        concat(
                                                                          activity_incoming_data_id, 
                                                                          '-index-', 
                                                                          h.json_array #>> '{plantIndex}') as calculation_herbicide_id
                                                                          from 
                                                                            calculation_herbicide_array h
                                                                        ), 
                                                                        invasive_plant_array_select as (
                                                                          select 
                                                                            i.activity_incoming_data_id, 
                                                                            i.json_array #>> '{invasive_plant_code}' as invasive_plant_code,
                                                                            invasive_plant_codes.code_description as invasive_plant, 
                                                                            i.json_array #>> '{percent_area_covered}' as percent_area_covered,
                                                                            i.json_array #>> '{index}' as invasive_plant_index,
                                                                            concat(
                                                                              activity_incoming_data_id, 
                                                                              '-index-', 
                                                                              i.json_array #>> '{index}') as invasive_plant_id
                                                                              from 
                                                                                invasive_plant_array i 
                                                                                left join code_header invasive_plant_code_header on invasive_plant_code_header.code_header_title = 'invasive_plant_aquatic_code' 
                                                                                and invasive_plant_code_header.valid_to is null 
                                                                                left join code invasive_plant_codes on invasive_plant_codes.code_header_id = invasive_plant_code_header.code_header_id 
                                                                                and i.json_array #>> '{invasive_plant_code}' = invasive_plant_codes.code_name
                                                                                ), 
                                                                            not_tank_mix_plant_herbicide_join as (
                                                                              select 
                                                                                i.activity_incoming_data_id, 
                                                                                i.invasive_plant, 
                                                                                i.percent_area_covered as ip_percent_area_covered, 
                                                                                i.invasive_plant_id, 
                                                                                concat(
                                                                                  h.liquid_herbicide, h.granular_herbicide
                                                                                ) as herbicide, 
                                                                                h.herbicide_type, 
                                                                                h.product_application_rate, 
                                                                                h.amount_of_mix, 
                                                                                h.calculation_type, 
                                                                                h.delivery_rate_of_mix, 
                                                                                h.herbicide_id, 
                                                                                concat(
                                                                                  h.area_treated_sqm, c.area_treated_sqm, 
                                                                                  h.area_treated_sqm2
                                                                                ) as area_treated_sqm, 
                                                                                c.amount_of_mix_used, 
                                                                                concat(
                                                                                  c.area_treated_hectares, h.area_treated_hectares2
                                                                                ) as area_treated_hectares, 
                                                                                concat(
                                                                                  c.percentage_area_covered, c.percent_area_covered, 
                                                                                  h.percent_area_covered2
                                                                                ) as percentage_area_covered, 
                                                                                concat(
                                                                                  c.amount_of_undiluted_herbicide_used_liters, 
                                                                                  h.amount_of_undiluted_herbicide_used_liters2
                                                                                ) as amount_of_undiluted_herbicide_used_liters, 
                                                                                concat(h.dilution, h.dilution2) as dilution 
                                                                              from 
                                                                                invasive_plant_array_select i 
                                                                                inner join herbicide_select h on h.activity_incoming_data_id = i.activity_incoming_data_id 
                                                                                left join calculation_array_select c on c.calculation_invasive_plant_id = i.invasive_plant_id
                                                                            ), 
                                                                            tank_mix_plant_results_select as (
                                                                              select 
                                                                                h.activity_incoming_data_id, 
                                                                                h.calculation_herbicide_id, 
                                                                                concat(
                                                                                  h.activity_incoming_data_id, '-index-', 
                                                                                  h.herbIndex, h.plantIndex
                                                                                ) as results_herbicide_plant_index, 
                                                                                h.dilution, 
                                                                                h.amount_of_undiluted_herbicide_used_liters, 
                                                                                c.calculation_invasive_plant_id, 
                                                                                c.area_treated_ha, 
                                                                                c.area_treated_sqm, 
                                                                                c.amount_of_mix_used, 
                                                                                c.percent_area_covered 
                                                                              from 
                                                                                calculation_herbicide_array_select h 
                                                                                inner join calculation_array_select c on c.calculation_invasive_plant_id = h.calculation_herbicide_id
                                                                            ), 
                                                                            invasive_plant_herbicide as (
                                                                              select 
                                                                                i.activity_incoming_data_id, 
                                                                                concat(
                                                                                  i.activity_incoming_data_id, '-index-', 
                                                                                  h.tank_mix_herbicide_index, i.invasive_plant_index
                                                                                ) as herbicide_plant_index, 
                                                                                i.invasive_plant, 
                                                                                i.percent_area_covered, 
                                                                                i.invasive_plant_id, 
                                                                                h.tank_mix_herbicide_index, 
                                                                                concat(
                                                                                  h.liquid_herbicide, h.granular_herbicide
                                                                                ) as herbicide, 
                                                                                h.herbicide_type, 
                                                                                h.product_application_rate, 
                                                                                h.amount_of_mix, 
                                                                                h.calculation_type, 
                                                                                h.delivery_rate_of_mix, 
                                                                                h.tank_mix_herbicide_id 
                                                                              from 
                                                                                invasive_plant_array_select i 
                                                                                inner join tank_mix_herbicide_select h on h.activity_incoming_data_id = i.activity_incoming_data_id
                                                                            ), 
                                                                            tank_mix_results_select as (
                                                                              select 
                                                                                i.activity_incoming_data_id, 
                                                                                i.invasive_plant, 
                                                                                i.percent_area_covered as ip_percent_area_covered, 
                                                                                i.invasive_plant_id, 
                                                                                i.herbicide, 
                                                                                i.herbicide_type, 
                                                                                i.product_application_rate, 
                                                                                i.amount_of_mix, 
                                                                                i.calculation_type, 
                                                                                i.delivery_rate_of_mix, 
                                                                                i.tank_mix_herbicide_id, 
                                                                                c.calculation_herbicide_id, 
                                                                                c.dilution, 
                                                                                c.amount_of_undiluted_herbicide_used_liters, 
                                                                                c.calculation_invasive_plant_id, 
                                                                                c.area_treated_ha, 
                                                                                c.area_treated_sqm, 
                                                                                c.amount_of_mix_used, 
                                                                                c.percent_area_covered 
                                                                              from 
                                                                                invasive_plant_herbicide i 
                                                                                left join tank_mix_plant_results_select c on c.results_herbicide_plant_index = i.herbicide_plant_index
                                                                            ), 
                                                                            jurisdiction_array as (
                                                                              select 
                                                                                activity_incoming_data_id, 
                                                                                activity_subtype, 
                                                                                jsonb_array_elements(
                                                                                  activity_payload #> '{form_data, activity_data, jurisdictions}') as jurisdictions_array
                                                                                  from 
                                                                                    activity_incoming_data 
                                                                                  where 
                                                                                    activity_incoming_data_id in (
                                                                                      select 
                                                                                        incoming_data_id 
                                                                                      from 
                                                                                        activity_current
                                                                                    ) 
                                                                                    and form_status = 'Submitted' 
                                                                                    and deleted_timestamp is null 
                                                                                    and activity_subtype = 'Activity_Treatment_ChemicalPlantAquatic'
                                                                                ), 
                                                                                jurisdiction_array_select as (
                                                                                  select 
                                                                                    j.activity_incoming_data_id, 
                                                                                    j.jurisdictions_array #>> '{jurisdiction_code}' as jurisdiction_code,
                                                                                    jurisdiction_codes.code_description as jurisdiction, 
                                                                                    j.jurisdictions_array #>> '{percent_covered}' as percent_covered
                                                                                  from 
                                                                                    jurisdiction_array j 
                                                                                    left join code_header jurisdiction_code_header on jurisdiction_code_header.code_header_title = 'jurisdiction_code' 
                                                                                    and jurisdiction_code_header.valid_to is null 
                                                                                    left join code jurisdiction_codes on jurisdiction_codes.code_header_id = jurisdiction_code_header.code_header_id 
                                                                                    and j.jurisdictions_array #>> '{jurisdiction_code}' = jurisdiction_codes.code_name
                                                                                    ), 
                                                                                form_data as (
                                                                                  select 
                                                                                    activity_incoming_data_id, 
                                                                                    activity_subtype, 
                                                                                    form_status, 
                                                                                    activity_incoming_data.activity_payload #> '{form_data, activity_subtype_data}' as form_data
                                                                                  from 
                                                                                    activity_incoming_data 
                                                                                  where 
                                                                                    activity_incoming_data_id in (
                                                                                      select 
                                                                                        incoming_data_id 
                                                                                      from 
                                                                                        activity_current
                                                                                    ) 
                                                                                    and activity_subtype = 'Activity_Treatment_ChemicalPlantAquatic' 
                                                                                    and form_status = 'Submitted' 
                                                                                    and deleted_timestamp is null
                                                                                ), 
                                                                                json_select as (
                                                                                  select 
                                                                                    f.activity_incoming_data_id, 
                                                                                    f.form_data #>> '{Treatment_ChemicalPlant_Information, pesticide_employer_code}' as service_license_company,
                                                                                    service_license_codes.code_description as service_license, 
                                                                                    f.form_data #>> '{Treatment_ChemicalPlant_Information, pesticide_use_permit_PUP}' as pesticide_use_permit,
                                                                                    f.form_data #>> '{Treatment_ChemicalPlant_Information, pest_management_plan}' as pest_management_plan,
                                                                                    f.form_data #>> '{Treatment_ChemicalPlant_Information, pmp_not_in_dropdown}' as pmp_not_in_dropdown,
                                                                                    f.form_data #>> '{Treatment_ChemicalPlant_Information, temperature}' as temperature,
                                                                                    f.form_data #>> '{Treatment_ChemicalPlant_Information, wind_speed}' as wind_speed,
                                                                                    f.form_data #>> '{Treatment_ChemicalPlant_Information, wind_direction_code}' as wind_direction,
                                                                                    f.form_data #>> '{Treatment_ChemicalPlant_Information, humidity}' as humidity,
                                                                                    f.form_data #>> '{Treatment_ChemicalPlant_Information, signage_on_site}' as treatment_notice_signs,
                                                                                    f.form_data #>> '{Treatment_ChemicalPlant_Information, application_start_time}' as application_start_time,
                                                                                    h.invasive_plant, 
                                                                                    coalesce(
                                                                                      h.ip_percent_area_covered, '100'
                                                                                    ) as ip_percent_area_covered, 
                                                                                    j.jurisdiction, 
                                                                                    j.percent_covered, 
                                                                                    f.form_data #>> '{chemical_treatment_details, tank_mix}' as tank_mix,
                                                                                    f.form_data #>> '{chemical_treatment_details, chemical_application_method}' as chemical_application_method_code,
                                                                                    chemical_method_codes.code_description as chemical_application_method, 
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
                                                                                  from 
                                                                                    form_data f 
                                                                                    inner join not_tank_mix_plant_herbicide_join h on h.activity_incoming_data_id = f.activity_incoming_data_id 
                                                                                    left join jurisdiction_array_select j on j.activity_incoming_data_id = f.activity_incoming_data_id 
                                                                                    left join code_header chemical_method_code_header on chemical_method_code_header.code_header_title = 'chemical_method_code' 
                                                                                    and chemical_method_code_header.valid_to is null 
                                                                                    left join code chemical_method_codes on chemical_method_codes.code_header_id = chemical_method_code_header.code_header_id 
                                                                                    and f.form_data #>> '{chemical_treatment_details, chemical_application_method}' = chemical_method_codes.code_name
                                                                                    left join code_header service_license_code_header on service_license_code_header.code_header_title = 'service_license_code' 
                                                                                    and service_license_code_header.valid_to is null 
                                                                                    left join code service_license_codes on service_license_codes.code_header_id = service_license_code_header.code_header_id 
                                                                                    and f.form_data #>> '{Treatment_ChemicalPlant_Information, pesticide_employer_code}' = service_license_codes.code_name
                                                                                  where 
                                                                                    f.form_data #>> '{chemical_treatment_details, tank_mix}' = 'false'
                                                                                    ), 
                                                                                tank_mix_json_select as (
                                                                                  select 
                                                                                    f.activity_incoming_data_id, 
                                                                                    f.form_data #>> '{Treatment_ChemicalPlant_Information, pesticide_employer_code}' as service_license_company,
                                                                                    service_license_codes.code_description as service_license, 
                                                                                    f.form_data #>> '{Treatment_ChemicalPlant_Information, pesticide_use_permit_PUP}' as pesticide_use_permit,
                                                                                    f.form_data #>> '{Treatment_ChemicalPlant_Information, pest_management_plan}' as pest_management_plan,
                                                                                    f.form_data #>> '{Treatment_ChemicalPlant_Information, temperature}' as temperature,
                                                                                    f.form_data #>> '{Treatment_ChemicalPlant_Information, wind_speed}' as wind_speed,
                                                                                    f.form_data #>> '{Treatment_ChemicalPlant_Information, wind_direction_code}' as wind_direction,
                                                                                    f.form_data #>> '{Treatment_ChemicalPlant_Information, humidity}' as humidity,
                                                                                    f.form_data #>> '{Treatment_ChemicalPlant_Information, signage_on_site}' as treatment_notice_signs,
                                                                                    f.form_data #>> '{Treatment_ChemicalPlant_Information, application_start_time}' as application_start_time,
                                                                                    tm.invasive_plant, 
                                                                                    coalesce(
                                                                                      tm.ip_percent_area_covered, '100'
                                                                                    ) as ip_percent_area_covered, 
                                                                                    j.jurisdiction, 
                                                                                    j.percent_covered, 
                                                                                    f.form_data #>> '{chemical_treatment_details, tank_mix}' as tank_mix,
                                                                                    f.form_data #>> '{chemical_treatment_details, chemical_application_method}' as chemical_application_method_code,
                                                                                    chemical_method_codes.code_description as chemical_application_method, 
                                                                                    tm.herbicide_type, 
                                                                                    tm.herbicide, 
                                                                                    tm.calculation_type, 
                                                                                    tm.amount_of_mix, 
                                                                                    tm.delivery_rate_of_mix, 
                                                                                    tm.product_application_rate, 
                                                                                    tm.dilution, 
                                                                                    tm.amount_of_undiluted_herbicide_used_liters, 
                                                                                    tm.area_treated_ha as area_treated_hectares, 
                                                                                    tm.area_treated_sqm, 
                                                                                    tm.amount_of_mix_used, 
                                                                                    tm.percent_area_covered as percentage_area_covered 
                                                                                  from 
                                                                                    form_data f 
                                                                                    left join tank_mix_results_select tm on tm.activity_incoming_data_id = f.activity_incoming_data_id 
                                                                                    left join jurisdiction_array_select j on j.activity_incoming_data_id = f.activity_incoming_data_id 
                                                                                    left join code_header chemical_method_code_header on chemical_method_code_header.code_header_title = 'chemical_method_code' 
                                                                                    and chemical_method_code_header.valid_to is null 
                                                                                    left join code chemical_method_codes on chemical_method_codes.code_header_id = chemical_method_code_header.code_header_id 
                                                                                    and f.form_data #>> '{chemical_treatment_details, chemical_application_method}' = chemical_method_codes.code_name
                                                                                    left join code_header service_license_code_header on service_license_code_header.code_header_title = 'service_license_code' 
                                                                                    and service_license_code_header.valid_to is null 
                                                                                    left join code service_license_codes on service_license_codes.code_header_id = service_license_code_header.code_header_id 
                                                                                    and f.form_data #>> '{Treatment_ChemicalPlant_Information, pesticide_employer_code}' = service_license_codes.code_name
                                                                                  where 
                                                                                    f.form_data #>> '{chemical_treatment_details, tank_mix}' = 'true'
                                                                                    ) 
                                                                              SELECT 
                                                                                c.activity_incoming_data_id, 
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
                                                                                c.employer_description as employer, 
                                                                                c.funding_agency, 
                                                                                concat(
                                                                                  j.jurisdiction, tm.jurisdiction, 
                                                                                  ' ', j.percent_covered, tm.percent_covered, 
                                                                                  '%'
                                                                                ) as jurisdiction, 
                                                                                c.access_description, 
                                                                                c.location_description, 
                                                                                c.comment, 
                                                                                c.treatment_person, 
                                                                                c.well_proximity, 
                                                                                j.service_license, 
                                                                                concat(
                                                                                  tm.pesticide_use_permit, j.pesticide_use_permit
                                                                                ) as pesticide_use_permit, 
                                                                                concat(
                                                                                  tm.pest_management_plan, j.pest_management_plan
                                                                                ) as pest_management_plan, 
                                                                                j.pmp_not_in_dropdown as pmp_not_in_dropdown, 
                                                                                concat(tm.temperature, j.temperature) as temperature_celsius, 
                                                                                concat(tm.wind_speed, j.wind_speed) as wind_speed_km, 
                                                                                concat(
                                                                                  tm.wind_direction, j.wind_direction
                                                                                ) as wind_direction, 
                                                                                concat(tm.humidity, j.humidity) as humidity_percent, 
                                                                                concat(
                                                                                  tm.treatment_notice_signs, j.treatment_notice_signs
                                                                                ) as treatment_notice_signs, 
                                                                                to_char(
                                                                                  to_timestamp(
                                                                                    concat(
                                                                                      tm.application_start_time, j.application_start_time
                                                                                    ), 
                                                                                    'YYYY-MM-DD"T"HH24:MI:SS'
                                                                                  ), 
                                                                                  'YYYY-MM-DD HH24:MI:SS'
                                                                                ) as application_start_time, 
                                                                                concat(
                                                                                  tm.invasive_plant, j.invasive_plant
                                                                                ) as invasive_plant, 
                                                                                concat(
                                                                                  tm.ip_percent_area_covered, j.ip_percent_area_covered, 
                                                                                  '%'
                                                                                ) as invasive_plant_percent, 
                                                                                (
                                                                                  case when concat(tm.tank_mix, j.tank_mix) = 'false' then 'No' else 'Yes' end
                                                                                ) as tank_mix, 
                                                                                concat(
                                                                                  tm.chemical_application_method, 
                                                                                  j.chemical_application_method
                                                                                ) as chemical_application_method, 
                                                                                concat(
                                                                                  tm.herbicide_type, j.herbicide_type
                                                                                ) as herbicide_type, 
                                                                                concat(tm.herbicide, j.herbicide) as herbicide, 
                                                                                concat(
                                                                                  tm.calculation_type, j.calculation_type
                                                                                ) as calculation_type, 
                                                                                concat(
                                                                                  tm.delivery_rate_of_mix, j.delivery_rate_of_mix
                                                                                ) as delivery_rate_of_mix, 
                                                                                concat(
                                                                                  tm.product_application_rate, j.product_application_rate
                                                                                ) as product_application_rate, 
                                                                                concat(tm.dilution, j.dilution) as dilution, 
                                                                                concat(
                                                                                  tm.percent_covered, j.percent_covered
                                                                                ):: float8 / 100 * concat(
                                                                                  tm.amount_of_undiluted_herbicide_used_liters, 
                                                                                  j.amount_of_undiluted_herbicide_used_liters
                                                                                ):: float8 as amount_of_undiluted_herbicide_used_liters, 
                                                                                concat(
                                                                                  tm.percent_covered, j.percent_covered
                                                                                ):: float8 / 100 * concat(
                                                                                  tm.area_treated_hectares, j.area_treated_hectares
                                                                                ):: float8 as area_treated_hectares, 
                                                                                concat(
                                                                                  tm.percent_covered, j.percent_covered
                                                                                ):: float8 / 100 * concat(
                                                                                  tm.area_treated_sqm, j.area_treated_sqm
                                                                                ):: float8 as area_treated_sqm, 
                                                                                concat(
                                                                                  tm.percent_covered, j.percent_covered
                                                                                ):: float8 / 100 * concat(
                                                                                  tm.amount_of_mix_used, j.amount_of_mix
                                                                                ):: float8 as amount_of_mix_used, 
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
                                                                              from 
                                                                                common_fields c 
                                                                                left join json_select j on j.activity_incoming_data_id = c.activity_incoming_data_id 
                                                                                left join tank_mix_json_select tm on tm.activity_incoming_data_id = c.activity_incoming_data_id
                                                                            );
                                                                           
                                                                           
-- terrestrial mechanical treatment

create 
or replace view treatment_mechanical_terrestrial_plant_summary as (
  with array_elements as (
    select 
      activity_incoming_data_id, 
      activity_subtype, 
      jurisdictions_array, 
      project_code_array, 
      person_array, 
      funding_list 
    from 
      activity_incoming_data 
      left join jsonb_array_elements(
        activity_payload #> '{form_data, activity_data, jurisdictions}') jurisdictions_array on true
        left join jsonb_array_elements(
          activity_payload #> '{form_data, activity_data, project_code}') project_code_array on true
          left join jsonb_array_elements(
            activity_payload #> '{form_data, activity_type_data, activity_persons}') person_array on true
            left join convert_string_list_to_array_elements(
              activity_payload #>> '{form_data, activity_data, invasive_species_agency_code}') funding_list on true
              where 
                activity_incoming_data_id in (
                  select 
                    incoming_data_id 
                  from 
                    activity_current
                ) 
                and form_status = 'Submitted' 
                and deleted_timestamp is null 
                and activity_subtype = 'Activity_Treatment_MechanicalPlantTerrestrial'
            ), 
            array_aggregate as (
              select 
                a.activity_incoming_data_id, 
                string_agg (
                  distinct a.project_code_array #>> '{description}',
                  ', '
                ) project, 
                string_agg (
                  distinct a.person_array #>> '{person_name}',
                  ', '
                ) person_name, 
                string_agg(
                  distinct CASE WHEN a.person_array #>> '{applicator_license}' IS NOT NULL
                  THEN concat(
                    a.person_array #>> '{person_name}', ', ', a.person_array #>> '{applicator_license}'
                    ) ELSE a.person_array #>> '{person_name}'
                  END, 
                  ', '
                ) treatment_person_name, 
                string_agg (
                  distinct concat(
                    jurisdiction_codes.code_description, 
                    ' ', 
                    (
                      a.jurisdictions_array #>> '{percent_covered}' || '%')
                      ), 
                    ', '
                  ) jurisdiction, 
                  string_agg(
                    distinct invasive_species_agency_codes.code_description, 
                    ', '
                  ) funding_agency 
                  from 
                    array_elements a 
                    left join code_header jurisdiction_code_header on jurisdiction_code_header.code_header_title = 'jurisdiction_code' 
                    and jurisdiction_code_header.valid_to is null 
                    left join code jurisdiction_codes on jurisdiction_codes.code_header_id = jurisdiction_code_header.code_header_id 
                    and a.jurisdictions_array #>> '{jurisdiction_code}' = jurisdiction_codes.code_name
                    left join code_header invasive_species_agency_code_header on invasive_species_agency_code_header.code_header_title = 'invasive_species_agency_code' 
                    and invasive_species_agency_code_header.valid_to is null 
                    left join code invasive_species_agency_codes on invasive_species_agency_codes.code_header_id = invasive_species_agency_code_header.code_header_id 
                    and a.funding_list = invasive_species_agency_codes.code_name 
                  group by 
                    a.activity_incoming_data_id
                ), 
                common_fields as (
                  select 
                    p.jurisdiction, 
                    a.activity_incoming_data_id, 
                    a.activity_id, 
                    a.activity_payload #>> '{short_id}' as short_id,
                    p.project as project_code, 
                    a.activity_payload #>> '{activity_type}' as activity_type,
                    a.activity_payload #>> '{activity_subtype}' as activity_subtype,
                    a.form_status, 
                    to_char(
                      to_timestamp(
                        a.activity_payload #>> '{form_data, activity_data, activity_date_time}', 'YYYY-MM-DD"T"HH24:MI:SS'), 'YYYY-MM-DD HH24:MI:SS') AS activity_date_time,
                        a.activity_payload #>> '{form_data, activity_data, utm_zone}' AS utm_zone,
                        a.activity_payload #>> '{form_data, activity_data, utm_easting}' AS utm_easting,
                        a.activity_payload #>> '{form_data, activity_data, utm_northing}' AS utm_northing,
                        a.activity_payload #>> '{form_data, activity_data, latitude}' AS latitude,
                        a.activity_payload #>> '{form_data, activity_data, longitude}' AS longitude,
                        translate(
                          a.activity_payload #>> '{species_positive}', '[]"', '') as species_positive,
                          jsonb_array_length(
                            a.activity_payload #> '{species_positive}') as positive_species_count,
                            translate(
                              a.activity_payload #>> '{species_negative}', '[]"', '') as species_negative,
                              jsonb_array_length(
                                a.activity_payload #> '{species_negative}') as negative_species_count,
                                a.activity_payload #>> '{form_data, activity_data, reported_area}' AS reported_area_sqm,
                                a.activity_payload #>> '{form_data, activity_type_data, pre_treatment_observation}' AS pre_treatment_observation,
                                p.person_name as observation_person, 
                                p.treatment_person_name as treatment_person, 
                                a.activity_payload #>> '{form_data, activity_data, employer_code}' AS employer_code,
                                employer_codes.code_description as employer_description, 
                                p.funding_agency, 
                                a.activity_payload #>> '{form_data, activity_data, access_description}' AS access_description,
                                a.activity_payload #>> '{form_data, activity_data, location_description}' AS location_description,
                                a.activity_payload #>> '{form_data, activity_data, general_comment}' AS comment,
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
                                (
                                  case when a.media_keys is null then 'No' else 'Yes' end
                                ) as photo, 
                                a.created_timestamp, 
                                a.received_timestamp 
                                FROM 
                                  activity_incoming_data a 
                                  left join array_aggregate p on p.activity_incoming_data_id = a.activity_incoming_data_id 
                                  left join code_header employer_code_header on employer_code_header.code_header_title = 'employer_code' 
                                  and employer_code_header.valid_to is null 
                                  left join code employer_codes on employer_codes.code_header_id = employer_code_header.code_header_id 
                                  and a.activity_payload #>> '{form_data, activity_data, employer_code}' = employer_codes.code_name
                                where 
                                  a.activity_incoming_data_id in (
                                    select 
                                      incoming_data_id 
                                    from 
                                      activity_current
                                  ) 
                                  and a.form_status = 'Submitted' 
                                  and a.deleted_timestamp is null 
                                  and a.activity_subtype = 'Activity_Treatment_MechanicalPlantTerrestrial'
                              ), 
                              mechanical_treatment_array as (
                                select 
                                  activity_incoming_data_id, 
                                  activity_subtype, 
                                  jsonb_array_elements(
                                    activity_payload #> '{form_data, activity_subtype_data, Treatment_MechanicalPlant_Information}') as json_array
                                    from 
                                      activity_incoming_data 
                                    where 
                                      activity_incoming_data_id in (
                                        select 
                                          incoming_data_id 
                                        from 
                                          activity_current
                                      ) 
                                      and form_status = 'Submitted' 
                                      and deleted_timestamp is null 
                                      and activity_subtype = 'Activity_Treatment_MechanicalPlantTerrestrial'
                                  ), 
                                  mechanical_treatment_select as (
                                    select 
                                      m.activity_incoming_data_id, 
                                      m.json_array #>> '{treated_area}' as treated_area,
                                      m.json_array #>> '{disposed_material, disposed_material_input_format}' as disposed_material_format,
                                      m.json_array #>> '{disposed_material, disposed_material_input_number}' as disposed_material_amount,
                                      m.json_array #>> '{invasive_plant_code}' as invasive_plant_code,
                                      invasive_plant_codes.code_description as invasive_plant, 
                                      m.json_array #>> '{mechanical_method_code}' as mechanical_method_code,
                                      mechanical_method_codes.code_description as mechanical_method, 
                                      m.json_array #>> '{mechanical_disposal_code}' as mechanical_disposal_code,
                                      mechanical_disposal_codes.code_description as disposal_method 
                                    from 
                                      mechanical_treatment_array m 
                                      left join code_header invasive_plant_code_header on invasive_plant_code_header.code_header_title = 'invasive_plant_code' 
                                      and invasive_plant_code_header.valid_to is null 
                                      left join code invasive_plant_codes on invasive_plant_codes.code_header_id = invasive_plant_code_header.code_header_id 
                                      and m.json_array #>> '{invasive_plant_code}' = invasive_plant_codes.code_name
                                      left join code_header mechanical_method_code_header on mechanical_method_code_header.code_header_title = 'mechanical_method_code' 
                                      and mechanical_method_code_header.valid_to is null 
                                      left join code mechanical_method_codes on mechanical_method_codes.code_header_id = mechanical_method_code_header.code_header_id 
                                      and m.json_array #>> '{mechanical_method_code}' = mechanical_method_codes.code_name
                                      left join code_header mechanical_disposal_code_header on mechanical_disposal_code_header.code_header_title = 'mechanical_disposal_code' 
                                      and mechanical_disposal_code_header.valid_to is null 
                                      left join code mechanical_disposal_codes on mechanical_disposal_codes.code_header_id = mechanical_disposal_code_header.code_header_id 
                                      and m.json_array #>> '{mechanical_disposal_code}' = mechanical_disposal_codes.code_name
                                      ) 
                                SELECT 
                                  c.activity_incoming_data_id, 
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
                                  c.employer_description as employer, 
                                  c.funding_agency, 
                                  c.jurisdiction, 
                                  c.access_description, 
                                  c.location_description, 
                                  c.comment, 
                                  c.observation_person, 
                                  m.invasive_plant, 
                                  m.treated_area as treated_area_sqm, 
                                  m.mechanical_method, 
                                  m.disposal_method, 
                                  (
                                    case when m.disposed_material_format = 'weight' then 'weight (kg)' else m.disposed_material_format end
                                  ) as disposed_material_format, 
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
                                FROM 
                                  common_fields c 
                                  join mechanical_treatment_select m on m.activity_incoming_data_id = c.activity_incoming_data_id
                              );
                                                                           
-- aquatic mechanical treatment

create 
or replace view treatment_mechanical_aquatic_plant_summary as (
  with array_elements as (
    select 
      activity_incoming_data_id, 
      activity_subtype, 
      jurisdictions_array, 
      project_code_array, 
      person_array, 
      funding_list 
    from 
      activity_incoming_data 
      left join jsonb_array_elements(
        activity_payload #> '{form_data, activity_data, jurisdictions}') jurisdictions_array on true
        left join jsonb_array_elements(
          activity_payload #> '{form_data, activity_data, project_code}') project_code_array on true
          left join jsonb_array_elements(
            activity_payload #> '{form_data, activity_type_data, activity_persons}') person_array on true
            left join convert_string_list_to_array_elements(
              activity_payload #>> '{form_data, activity_data, invasive_species_agency_code}') funding_list on true
              where 
                activity_incoming_data_id in (
                  select 
                    incoming_data_id 
                  from 
                    activity_current
                ) 
                and form_status = 'Submitted' 
                and deleted_timestamp is null 
                and activity_subtype = 'Activity_Treatment_MechanicalPlantAquatic'
            ), 
            array_aggregate as (
              select 
                a.activity_incoming_data_id, 
                string_agg (
                  distinct a.project_code_array #>> '{description}',
                  ', '
                ) project, 
                string_agg (
                  distinct a.person_array #>> '{person_name}',
                  ', '
                ) person_name, 
                string_agg(
                  distinct CASE WHEN a.person_array #>> '{applicator_license}' IS NOT NULL
                  THEN concat(
                    a.person_array #>> '{person_name}', ', ', a.person_array #>> '{applicator_license}'
                    ) ELSE a.person_array #>> '{person_name}'
                  END, 
                  ', '
                ) treatment_person_name, 
                string_agg (
                  distinct concat(
                    jurisdiction_codes.code_description, 
                    ' ', 
                    (
                      a.jurisdictions_array #>> '{percent_covered}' || '%')
                      ), 
                    ', '
                  ) jurisdiction, 
                  string_agg(
                    distinct invasive_species_agency_codes.code_description, 
                    ', '
                  ) funding_agency 
                  from 
                    array_elements a 
                    left join code_header jurisdiction_code_header on jurisdiction_code_header.code_header_title = 'jurisdiction_code' 
                    and jurisdiction_code_header.valid_to is null 
                    left join code jurisdiction_codes on jurisdiction_codes.code_header_id = jurisdiction_code_header.code_header_id 
                    and a.jurisdictions_array #>> '{jurisdiction_code}' = jurisdiction_codes.code_name
                    left join code_header invasive_species_agency_code_header on invasive_species_agency_code_header.code_header_title = 'invasive_species_agency_code' 
                    and invasive_species_agency_code_header.valid_to is null 
                    left join code invasive_species_agency_codes on invasive_species_agency_codes.code_header_id = invasive_species_agency_code_header.code_header_id 
                    and a.funding_list = invasive_species_agency_codes.code_name 
                  group by 
                    a.activity_incoming_data_id
                ), 
                common_fields as (
                  select 
                    p.jurisdiction, 
                    a.activity_incoming_data_id, 
                    a.activity_id, 
                    a.activity_payload #>> '{short_id}' as short_id,
                    p.project as project_code, 
                    a.activity_payload #>> '{activity_type}' as activity_type,
                    a.activity_payload #>> '{activity_subtype}' as activity_subtype,
                    a.form_status, 
                    to_char(
                      to_timestamp(
                        a.activity_payload #>> '{form_data, activity_data, activity_date_time}', 'YYYY-MM-DD"T"HH24:MI:SS'), 'YYYY-MM-DD HH24:MI:SS') AS activity_date_time,
                        a.activity_payload #>> '{form_data, activity_data, utm_zone}' AS utm_zone,
                        a.activity_payload #>> '{form_data, activity_data, utm_easting}' AS utm_easting,
                        a.activity_payload #>> '{form_data, activity_data, utm_northing}' AS utm_northing,
                        a.activity_payload #>> '{form_data, activity_data, latitude}' AS latitude,
                        a.activity_payload #>> '{form_data, activity_data, longitude}' AS longitude,
                        translate(
                          a.activity_payload #>> '{species_positive}', '[]"', '') as species_positive,
                          jsonb_array_length(
                            a.activity_payload #> '{species_positive}') as positive_species_count,
                            translate(
                              a.activity_payload #>> '{species_negative}', '[]"', '') as species_negative,
                              jsonb_array_length(
                                a.activity_payload #> '{species_negative}') as negative_species_count,
                                a.activity_payload #>> '{form_data, activity_data, reported_area}' AS reported_area_sqm,
                                a.activity_payload #>> '{form_data, activity_type_data, pre_treatment_observation}' AS pre_treatment_observation,
                                p.person_name as observation_person, 
                                p.treatment_person_name as treatment_person, 
                                a.activity_payload #>> '{form_data, activity_data, employer_code}' AS employer_code,
                                employer_codes.code_description as employer_description, 
                                p.funding_agency, 
                                a.activity_payload #>> '{form_data, activity_data, access_description}' AS access_description,
                                a.activity_payload #>> '{form_data, activity_data, location_description}' AS location_description,
                                a.activity_payload #>> '{form_data, activity_data, general_comment}' AS comment,
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
                                (
                                  case when a.media_keys is null then 'No' else 'Yes' end
                                ) as photo, 
                                a.created_timestamp, 
                                a.received_timestamp 
                                FROM 
                                  activity_incoming_data a 
                                  left join array_aggregate p on p.activity_incoming_data_id = a.activity_incoming_data_id 
                                  left join code_header employer_code_header on employer_code_header.code_header_title = 'employer_code' 
                                  and employer_code_header.valid_to is null 
                                  left join code employer_codes on employer_codes.code_header_id = employer_code_header.code_header_id 
                                  and a.activity_payload #>> '{form_data, activity_data, employer_code}' = employer_codes.code_name
                                where 
                                  a.activity_incoming_data_id in (
                                    select 
                                      incoming_data_id 
                                    from 
                                      activity_current
                                  ) 
                                  and a.form_status = 'Submitted' 
                                  and a.deleted_timestamp is null 
                                  and a.activity_subtype = 'Activity_Treatment_MechanicalPlantAquatic'
                              ), 
                              mechanical_treatment_array as (
                                select 
                                  activity_incoming_data_id, 
                                  activity_subtype, 
                                  form_status, 
                                  jsonb_array_elements(
                                    activity_payload #> '{form_data, activity_subtype_data, Treatment_MechanicalPlant_Information}') as json_array
                                    from 
                                      activity_incoming_data 
                                    where 
                                      activity_incoming_data_id in (
                                        select 
                                          incoming_data_id 
                                        from 
                                          activity_current
                                      ) 
                                      and form_status = 'Submitted' 
                                      and deleted_timestamp is null 
                                      and activity_subtype = 'Activity_Treatment_MechanicalPlantAquatic'
                                  ), 
                                  shoreline_array as (
                                    select 
                                      activity_incoming_data_id, 
                                      activity_subtype, 
                                      form_status, 
                                      jsonb_array_elements(
                                        activity_payload #> '{form_data, activity_subtype_data, ShorelineTypes}') as shorelines
                                        from 
                                          activity_incoming_data 
                                        where 
                                          activity_incoming_data_id in (
                                            select 
                                              incoming_data_id 
                                            from 
                                              activity_current
                                          ) 
                                          and form_status = 'Submitted' 
                                          and deleted_timestamp is null 
                                          and activity_subtype = 'Activity_Treatment_MechanicalPlantAquatic'
                                      ), 
                                      mechanical_treatment_select as (
                                        select 
                                          m.activity_incoming_data_id, 
                                          a.activity_payload #>> '{form_data, activity_subtype_data, Authorization_Infotmation, additional_auth_information}' as authorization_information,
                                          m.json_array #>> '{treated_area}' as treated_area_sqm,
                                          m.json_array #>> '{disposed_material, disposed_material_input_format}' as disposed_material_format,
                                          m.json_array #>> '{disposed_material, disposed_material_input_number}' as disposed_material_amount,
                                          m.json_array #>> '{invasive_plant_code}' as invasive_plant_code,
                                          invasive_plant_aquatic_codes.code_description as invasive_plant, 
                                          m.json_array #>> '{mechanical_method_code}' as mechanical_method_code,
                                          mechanical_method_codes.code_description as mechanical_method, 
                                          m.json_array #>> '{mechanical_disposal_code}' as mechanical_disposal_code,
                                          mechanical_disposal_codes.code_description as disposal_method 
                                        from 
                                          mechanical_treatment_array m 
                                          join activity_incoming_data a on a.activity_incoming_data_id = m.activity_incoming_data_id 
                                          left join code_header invasive_plant_aquatic_code_header on invasive_plant_aquatic_code_header.code_header_title = 'invasive_plant_aquatic_code' 
                                          and invasive_plant_aquatic_code_header.valid_to is null 
                                          left join code invasive_plant_aquatic_codes on invasive_plant_aquatic_codes.code_header_id = invasive_plant_aquatic_code_header.code_header_id 
                                          and m.json_array #>> '{invasive_plant_code}' = invasive_plant_aquatic_codes.code_name
                                          left join code_header mechanical_method_code_header on mechanical_method_code_header.code_header_title = 'mechanical_method_code' 
                                          and mechanical_method_code_header.valid_to is null 
                                          left join code mechanical_method_codes on mechanical_method_codes.code_header_id = mechanical_method_code_header.code_header_id 
                                          and m.json_array #>> '{mechanical_method_code}' = mechanical_method_codes.code_name
                                          left join code_header mechanical_disposal_code_header on mechanical_disposal_code_header.code_header_title = 'mechanical_disposal_code' 
                                          and mechanical_disposal_code_header.valid_to is null 
                                          left join code mechanical_disposal_codes on mechanical_disposal_codes.code_header_id = mechanical_disposal_code_header.code_header_id 
                                          and m.json_array #>> '{mechanical_disposal_code}' = mechanical_disposal_codes.code_name
                                          ), 
                                      shoreline_array_select as (
                                        select 
                                          a.activity_incoming_data_id, 
                                          a.shorelines #>> '{shoreline_type}' as shoreline_type,
                                          shoreline_type_codes.code_description as shoreline_description, 
                                          a.shorelines #>> '{percent_covered}' as percent_covered
                                        from 
                                          shoreline_array a 
                                          left join code_header shoreline_type_code_header on shoreline_type_code_header.code_header_title = 'shoreline_type_code' 
                                          and shoreline_type_code_header.valid_to is null 
                                          left join code shoreline_type_codes on shoreline_type_codes.code_header_id = shoreline_type_code_header.code_header_id 
                                          and a.shorelines #>> '{shoreline_type}' = shoreline_type_codes.code_name
                                          ), 
                                      shoreline_agg as (
                                        select 
                                          string_agg (
                                            a.shoreline_description || ' ' || a.percent_covered || '%', 
                                            ', ' 
                                            order by 
                                              a.shoreline_description
                                          ) shorelines, 
                                          a.activity_incoming_data_id 
                                        from 
                                          shoreline_array_select a 
                                        group by 
                                          a.activity_incoming_data_id
                                      ) 
                                    SELECT 
                                      c.activity_incoming_data_id, 
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
                                      c.employer_description as employer, 
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
                                    FROM 
                                      common_fields c 
                                      join mechanical_treatment_select m on m.activity_incoming_data_id = c.activity_incoming_data_id 
                                      join shoreline_agg a on a.activity_incoming_data_id = c.activity_incoming_data_id
                                  );
                             

-- chemical treatment monitoring summary

CREATE 
OR REPLACE VIEW invasivesbc.chemical_treatment_monitoring_summary as (
  with array_elements as (
    select 
      activity_incoming_data_id, 
      activity_subtype, 
      jurisdictions_array, 
      project_code_array, 
      person_array, 
      funding_list 
    from 
      activity_incoming_data 
      left join jsonb_array_elements(
        activity_payload #> '{form_data, activity_data, jurisdictions}') jurisdictions_array on true
        left join jsonb_array_elements(
          activity_payload #> '{form_data, activity_data, project_code}') project_code_array on true
          left join jsonb_array_elements(
            activity_payload #> '{form_data, activity_type_data, activity_persons}') person_array on true
            left join convert_string_list_to_array_elements(
              activity_payload #>> '{form_data, activity_data, invasive_species_agency_code}') funding_list on true
              where 
                activity_incoming_data_id in (
                  select 
                    incoming_data_id 
                  from 
                    activity_current
                ) 
                and form_status = 'Submitted' 
                and deleted_timestamp is null 
                and activity_subtype = 'Activity_Monitoring_ChemicalTerrestrialAquaticPlant'
            ), 
            array_aggregate as (
              select 
                a.activity_incoming_data_id, 
                string_agg (
                  distinct a.project_code_array #>> '{description}',
                  ', '
                ) project, 
                string_agg (
                  distinct a.person_array #>> '{person_name}',
                  ', '
                ) person_name, 
                string_agg(
                  distinct CASE WHEN a.person_array #>> '{applicator_license}' IS NOT NULL
                  THEN concat(
                    a.person_array #>> '{person_name}', ', ', a.person_array #>> '{applicator_license}'
                    ) ELSE a.person_array #>> '{person_name}'
                  END, 
                  ', '
                ) treatment_person_name, 
                string_agg (
                  distinct concat(
                    jurisdiction_codes.code_description, 
                    ' ', 
                    (
                      a.jurisdictions_array #>> '{percent_covered}' || '%')
                      ), 
                    ', '
                  ) jurisdiction, 
                  string_agg(
                    distinct invasive_species_agency_codes.code_description, 
                    ', '
                  ) funding_agency 
                  from 
                    array_elements a 
                    left join code_header jurisdiction_code_header on jurisdiction_code_header.code_header_title = 'jurisdiction_code' 
                    and jurisdiction_code_header.valid_to is null 
                    left join code jurisdiction_codes on jurisdiction_codes.code_header_id = jurisdiction_code_header.code_header_id 
                    and a.jurisdictions_array #>> '{jurisdiction_code}' = jurisdiction_codes.code_name
                    left join code_header invasive_species_agency_code_header on invasive_species_agency_code_header.code_header_title = 'invasive_species_agency_code' 
                    and invasive_species_agency_code_header.valid_to is null 
                    left join code invasive_species_agency_codes on invasive_species_agency_codes.code_header_id = invasive_species_agency_code_header.code_header_id 
                    and a.funding_list = invasive_species_agency_codes.code_name 
                  group by 
                    a.activity_incoming_data_id
                ), 
                common_fields as (
                  select 
                    p.jurisdiction, 
                    a.activity_incoming_data_id, 
                    a.activity_id, 
                    a.activity_payload #>> '{short_id}' as short_id,
                    p.project as project_code, 
                    a.activity_payload #>> '{activity_type}' as activity_type,
                    a.activity_payload #>> '{activity_subtype}' as activity_subtype,
                    a.form_status, 
                    to_char(
                      to_timestamp(
                        a.activity_payload #>> '{form_data, activity_data, activity_date_time}', 'YYYY-MM-DD"T"HH24:MI:SS'), 'YYYY-MM-DD HH24:MI:SS') AS activity_date_time,
                        a.activity_payload #>> '{form_data, activity_data, utm_zone}' AS utm_zone,
                        a.activity_payload #>> '{form_data, activity_data, utm_easting}' AS utm_easting,
                        a.activity_payload #>> '{form_data, activity_data, utm_northing}' AS utm_northing,
                        a.activity_payload #>> '{form_data, activity_data, latitude}' AS latitude,
                        a.activity_payload #>> '{form_data, activity_data, longitude}' AS longitude,
                        translate(
                          a.activity_payload #>> '{species_positive}', '[]"', '') as species_positive,
                          jsonb_array_length(
                            a.activity_payload #> '{species_positive}') as positive_species_count,
                            translate(
                              a.activity_payload #>> '{species_negative}', '[]"', '') as species_negative,
                              jsonb_array_length(
                                a.activity_payload #> '{species_negative}') as negative_species_count,
                                a.activity_payload #>> '{form_data, activity_data, reported_area}' AS reported_area_sqm,
                                a.activity_payload #>> '{form_data, activity_type_data, pre_treatment_observation}' AS pre_treatment_observation,
                                p.person_name as observation_person, 
                                p.treatment_person_name as treatment_person, 
                                a.activity_payload #>> '{form_data, activity_data, employer_code}' AS employer_code,
                                employer_codes.code_description as employer_description, 
                                p.funding_agency, 
                                a.activity_payload #>> '{form_data, activity_data, access_description}' AS access_description,
                                a.activity_payload #>> '{form_data, activity_data, location_description}' AS location_description,
                                a.activity_payload #>> '{form_data, activity_data, general_comment}' AS comment,
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
                                (
                                  case when a.media_keys is null then 'No' else 'Yes' end
                                ) as photo, 
                                a.created_timestamp, 
                                a.received_timestamp 
                                FROM 
                                  activity_incoming_data a 
                                  left join array_aggregate p on p.activity_incoming_data_id = a.activity_incoming_data_id 
                                  left join code_header employer_code_header on employer_code_header.code_header_title = 'employer_code' 
                                  and employer_code_header.valid_to is null 
                                  left join code employer_codes on employer_codes.code_header_id = employer_code_header.code_header_id 
                                  and a.activity_payload #>> '{form_data, activity_data, employer_code}' = employer_codes.code_name
                                where 
                                  a.activity_incoming_data_id in (
                                    select 
                                      incoming_data_id 
                                    from 
                                      activity_current
                                  ) 
                                  and a.form_status = 'Submitted' 
                                  and a.deleted_timestamp is null 
                                  and a.activity_subtype = 'Activity_Monitoring_ChemicalTerrestrialAquaticPlant'
                              ), 
                              chemical_monitoring_array as (
                                select 
                                  activity_incoming_data_id, 
                                  jsonb_array_elements(
                                    activity_incoming_data.activity_payload #> '{form_data, activity_subtype_data, Monitoring_ChemicalTerrestrialAquaticPlant_Information}') as monitoring_array
                                    from 
                                      activity_incoming_data 
                                    where 
                                      activity_incoming_data_id in (
                                        select 
                                          incoming_data_id 
                                        from 
                                          activity_current
                                      ) 
                                      and form_status = 'Submitted' 
                                      and deleted_timestamp is null 
                                      and activity_subtype = 'Activity_Monitoring_ChemicalTerrestrialAquaticPlant'
                                  ), 
                                  invasive_plants_on_site as (
                                    select 
                                      concat(
                                        activity_incoming_data_id, 
                                        '-', 
                                        monitoring_array #>> '{invasive_plant_code}') as plant_id,
                                        convert_string_list_to_array_elements(
                                          monitoring_array #>> '{invasive_plants_on_site}') as invasive_plants_on_site_code
                                          from 
                                            chemical_monitoring_array
                                        ), 
                                        invasive_plants_on_site_select as (
                                          select 
                                            i.plant_id, 
                                            i.invasive_plants_on_site_code, 
                                            monitoring_evidence_codes.code_description as invasive_plants_on_site 
                                          from 
                                            invasive_plants_on_site i 
                                            left join code_header monitoring_evidence_code_header on monitoring_evidence_code_header.code_header_title = 'monitoring_evidence_code' 
                                            and monitoring_evidence_code_header.valid_to is null 
                                            left join code monitoring_evidence_codes on monitoring_evidence_codes.code_header_id = monitoring_evidence_code_header.code_header_id 
                                            and i.invasive_plants_on_site_code = monitoring_evidence_codes.code_name
                                        ), 
                                        invasive_plants_on_site_agg as (
                                          select 
                                            i.plant_id, 
                                            string_agg (
                                              i.invasive_plants_on_site, 
                                              ', ' 
                                              order by 
                                                i.invasive_plants_on_site
                                            ) invasive_plants_on_site 
                                          from 
                                            invasive_plants_on_site_select i 
                                          group by 
                                            i.plant_id
                                        ), 
                                        chemical_monitoring_json as (
                                          select 
                                            a.activity_incoming_data_id, 
                                            a.monitoring_array #>> '{invasive_plant_code}' as terrestrial_invasive_plant_code,
                                            invasive_plant_codes.code_description as terrestrial_invasive_plant, 
                                            a.monitoring_array #>> '{invasive_plant_aquatic_code}' as aquatic_invasive_plant_code,
                                            invasive_plant_aquatic_codes.code_description as aquatic_invasive_plant, 
                                            a.monitoring_array #>> '{efficacy_code}' as treatment_efficacy_rating_code,
                                            efficacy_codes.code_description as treatment_efficacy_rating, 
                                            a.monitoring_array #>> '{management_efficacy_rating}' as management_efficacy_rating_code,
                                            management_efficacy_codes.code_description as management_efficacy_rating, 
                                            a.monitoring_array #>> '{evidence_of_treatment}' as evidence_of_treatment,
                                            s.invasive_plants_on_site, 
                                            a.monitoring_array #>> '{treatment_pass}' as treatment_pass,
                                            a.monitoring_array #>> '{comment}' as comment
                                          from 
                                            chemical_monitoring_array a 
                                            join invasive_plants_on_site_agg s on s.plant_id = concat(
                                              a.activity_incoming_data_id, 
                                              '-', 
                                              a.monitoring_array #>> '{invasive_plant_code}')
                                              left join code_header invasive_plant_code_header on invasive_plant_code_header.code_header_title = 'invasive_plant_code' 
                                              and invasive_plant_code_header.valid_to is null 
                                              left join code invasive_plant_codes on invasive_plant_codes.code_header_id = invasive_plant_code_header.code_header_id 
                                              and a.monitoring_array #>> '{invasive_plant_code}' = invasive_plant_codes.code_name
                                              left join code_header invasive_plant_aquatic_code_header on invasive_plant_aquatic_code_header.code_header_title = 'invasive_plant_aquatic_code' 
                                              and invasive_plant_aquatic_code_header.valid_to is null 
                                              left join code invasive_plant_aquatic_codes on invasive_plant_aquatic_codes.code_header_id = invasive_plant_aquatic_code_header.code_header_id 
                                              and a.monitoring_array #>> '{invasive_plant_aquatic_code}' = invasive_plant_aquatic_codes.code_name
                                              left join code_header efficacy_code_header on efficacy_code_header.code_header_title = 'efficacy_code' 
                                              and efficacy_code_header.valid_to is null 
                                              left join code efficacy_codes on efficacy_codes.code_header_id = efficacy_code_header.code_header_id 
                                              and a.monitoring_array #>> '{efficacy_code}' = efficacy_codes.code_name
                                              left join code_header management_efficacy_code_header on management_efficacy_code_header.code_header_title = 'management_efficacy_code' 
                                              and management_efficacy_code_header.valid_to is null 
                                              left join code management_efficacy_codes on management_efficacy_codes.code_header_id = management_efficacy_code_header.code_header_id 
                                              and a.monitoring_array #>> '{management_efficacy_rating}' = management_efficacy_codes.code_name
                                              ) 
                                          SELECT 
                                            c.activity_incoming_data_id, 
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
                                            c.employer_description as employer, 
                                            c.funding_agency, 
                                            c.jurisdiction, 
                                            c.access_description, 
                                            c.location_description, 
                                            c.comment, 
                                            c.observation_person, 
                                            coalesce(
                                              j.terrestrial_invasive_plant, j.aquatic_invasive_plant
                                            ) as invasive_plant, 
                                            j.treatment_efficacy_rating, 
                                            j.management_efficacy_rating, 
                                            j.evidence_of_treatment, 
                                            j.invasive_plants_on_site, 
                                            j.treatment_pass, 
                                            j.comment as monitor_comment, 
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
                                            ST_AsText(c.geog) as geography 
                                          FROM 
                                            common_fields c 
                                            left join chemical_monitoring_json j on j.activity_incoming_data_id = c.activity_incoming_data_id
                                        );
                                       
-- mechanical treatment monitoring summary

CREATE 
OR REPLACE VIEW invasivesbc.mechanical_treatment_monitoring_summary as (
  with array_elements as (
    select 
      activity_incoming_data_id, 
      activity_subtype, 
      jurisdictions_array, 
      project_code_array, 
      person_array, 
      funding_list 
    from 
      activity_incoming_data 
      left join jsonb_array_elements(
        activity_payload #> '{form_data, activity_data, jurisdictions}') jurisdictions_array on true
        left join jsonb_array_elements(
          activity_payload #> '{form_data, activity_data, project_code}') project_code_array on true
          left join jsonb_array_elements(
            activity_payload #> '{form_data, activity_type_data, activity_persons}') person_array on true
            left join convert_string_list_to_array_elements(
              activity_payload #>> '{form_data, activity_data, invasive_species_agency_code}') funding_list on true
              where 
                activity_incoming_data_id in (
                  select 
                    incoming_data_id 
                  from 
                    activity_current
                ) 
                and form_status = 'Submitted' 
                and deleted_timestamp is null 
                and activity_subtype = 'Activity_Monitoring_MechanicalTerrestrialAquaticPlant'
            ), 
            array_aggregate as (
              select 
                a.activity_incoming_data_id, 
                string_agg (
                  distinct a.project_code_array #>> '{description}',
                  ', '
                ) project, 
                string_agg (
                  distinct a.person_array #>> '{person_name}',
                  ', '
                ) person_name, 
                string_agg(
                  distinct CASE WHEN a.person_array #>> '{applicator_license}' IS NOT NULL
                  THEN concat(
                    a.person_array #>> '{person_name}', ', ', a.person_array #>> '{applicator_license}'
                    ) ELSE a.person_array #>> '{person_name}'
                  END, 
                  ', '
                ) treatment_person_name, 
                string_agg (
                  distinct concat(
                    jurisdiction_codes.code_description, 
                    ' ', 
                    (
                      a.jurisdictions_array #>> '{percent_covered}' || '%')
                      ), 
                    ', '
                  ) jurisdiction, 
                  string_agg(
                    distinct invasive_species_agency_codes.code_description, 
                    ', '
                  ) funding_agency 
                  from 
                    array_elements a 
                    left join code_header jurisdiction_code_header on jurisdiction_code_header.code_header_title = 'jurisdiction_code' 
                    and jurisdiction_code_header.valid_to is null 
                    left join code jurisdiction_codes on jurisdiction_codes.code_header_id = jurisdiction_code_header.code_header_id 
                    and a.jurisdictions_array #>> '{jurisdiction_code}' = jurisdiction_codes.code_name
                    left join code_header invasive_species_agency_code_header on invasive_species_agency_code_header.code_header_title = 'invasive_species_agency_code' 
                    and invasive_species_agency_code_header.valid_to is null 
                    left join code invasive_species_agency_codes on invasive_species_agency_codes.code_header_id = invasive_species_agency_code_header.code_header_id 
                    and a.funding_list = invasive_species_agency_codes.code_name 
                  group by 
                    a.activity_incoming_data_id
                ), 
                common_fields as (
                  select 
                    p.jurisdiction, 
                    a.activity_incoming_data_id, 
                    a.activity_id, 
                    a.activity_payload #>> '{short_id}' as short_id,
                    p.project as project_code, 
                    a.activity_payload #>> '{activity_type}' as activity_type,
                    a.activity_payload #>> '{activity_subtype}' as activity_subtype,
                    a.form_status, 
                    to_char(
                      to_timestamp(
                        a.activity_payload #>> '{form_data, activity_data, activity_date_time}', 'YYYY-MM-DD"T"HH24:MI:SS'), 'YYYY-MM-DD HH24:MI:SS') AS activity_date_time,
                        a.activity_payload #>> '{form_data, activity_data, utm_zone}' AS utm_zone,
                        a.activity_payload #>> '{form_data, activity_data, utm_easting}' AS utm_easting,
                        a.activity_payload #>> '{form_data, activity_data, utm_northing}' AS utm_northing,
                        a.activity_payload #>> '{form_data, activity_data, latitude}' AS latitude,
                        a.activity_payload #>> '{form_data, activity_data, longitude}' AS longitude,
                        translate(
                          a.activity_payload #>> '{species_positive}', '[]"', '') as species_positive,
                          jsonb_array_length(
                            a.activity_payload #> '{species_positive}') as positive_species_count,
                            translate(
                              a.activity_payload #>> '{species_negative}', '[]"', '') as species_negative,
                              jsonb_array_length(
                                a.activity_payload #> '{species_negative}') as negative_species_count,
                                a.activity_payload #>> '{form_data, activity_data, reported_area}' AS reported_area_sqm,
                                a.activity_payload #>> '{form_data, activity_type_data, pre_treatment_observation}' AS pre_treatment_observation,
                                p.person_name as observation_person, 
                                p.treatment_person_name as treatment_person, 
                                a.activity_payload #>> '{form_data, activity_data, employer_code}' AS employer_code,
                                employer_codes.code_description as employer_description, 
                                p.funding_agency, 
                                a.activity_payload #>> '{form_data, activity_data, access_description}' AS access_description,
                                a.activity_payload #>> '{form_data, activity_data, location_description}' AS location_description,
                                a.activity_payload #>> '{form_data, activity_data, general_comment}' AS comment,
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
                                (
                                  case when a.media_keys is null then 'No' else 'Yes' end
                                ) as photo, 
                                a.created_timestamp, 
                                a.received_timestamp 
                                FROM 
                                  activity_incoming_data a 
                                  left join array_aggregate p on p.activity_incoming_data_id = a.activity_incoming_data_id 
                                  left join code_header employer_code_header on employer_code_header.code_header_title = 'employer_code' 
                                  and employer_code_header.valid_to is null 
                                  left join code employer_codes on employer_codes.code_header_id = employer_code_header.code_header_id 
                                  and a.activity_payload #>> '{form_data, activity_data, employer_code}' = employer_codes.code_name
                                where 
                                  a.activity_incoming_data_id in (
                                    select 
                                      incoming_data_id 
                                    from 
                                      activity_current
                                  ) 
                                  and a.form_status = 'Submitted' 
                                  and a.deleted_timestamp is null 
                                  and a.activity_subtype = 'Activity_Monitoring_MechanicalTerrestrialAquaticPlant'
                              ), 
                              mechanical_monitoring_array as (
                                select 
                                  activity_incoming_data_id, 
                                  jsonb_array_elements(
                                    activity_incoming_data.activity_payload #> '{form_data, activity_subtype_data, Monitoring_MechanicalTerrestrialAquaticPlant_Information}') as monitoring_array
                                    from 
                                      activity_incoming_data 
                                    where 
                                      activity_incoming_data_id in (
                                        select 
                                          incoming_data_id 
                                        from 
                                          activity_current
                                      ) 
                                      and form_status = 'Submitted' 
                                      and deleted_timestamp is null 
                                      and activity_subtype = 'Activity_Monitoring_MechanicalTerrestrialAquaticPlant'
                                  ), 
                                  invasive_plants_on_site as (
                                    select 
                                      concat(
                                        activity_incoming_data_id, 
                                        '-', 
                                        monitoring_array #>> '{invasive_plant_code}') as plant_id,
                                        convert_string_list_to_array_elements(
                                          monitoring_array #>> '{invasive_plants_on_site}') as invasive_plants_on_site_code
                                          from 
                                            mechanical_monitoring_array
                                        ), 
                                        invasive_plants_on_site_select as (
                                          select 
                                            i.plant_id, 
                                            i.invasive_plants_on_site_code, 
                                            monitoring_evidence_codes.code_description as invasive_plants_on_site 
                                          from 
                                            invasive_plants_on_site i 
                                            left join code_header monitoring_evidence_code_header on monitoring_evidence_code_header.code_header_title = 'monitoring_evidence_code' 
                                            and monitoring_evidence_code_header.valid_to is null 
                                            left join code monitoring_evidence_codes on monitoring_evidence_codes.code_header_id = monitoring_evidence_code_header.code_header_id 
                                            and i.invasive_plants_on_site_code = monitoring_evidence_codes.code_name
                                        ), 
                                        invasive_plants_on_site_agg as (
                                          select 
                                            i.plant_id, 
                                            string_agg (
                                              i.invasive_plants_on_site, 
                                              ', ' 
                                              order by 
                                                i.invasive_plants_on_site
                                            ) invasive_plants_on_site 
                                          from 
                                            invasive_plants_on_site_select i 
                                          group by 
                                            i.plant_id
                                        ), 
                                        mechanical_monitoring_json as (
                                          select 
                                            a.activity_incoming_data_id, 
                                            a.monitoring_array #>> '{invasive_plant_code}' as terrestrial_invasive_plant_code,
                                            invasive_plant_codes.code_description as terrestrial_invasive_plant, 
                                            a.monitoring_array #>> '{invasive_plant_aquatic_code}' as aquatic_invasive_plant_code,
                                            invasive_plant_aquatic_codes.code_description as aquatic_invasive_plant, 
                                            a.monitoring_array #>> '{efficacy_code}' as treatment_efficacy_rating_code,
                                            efficacy_codes.code_description as treatment_efficacy_rating, 
                                            a.monitoring_array #>> '{management_efficacy_rating}' as management_efficacy_rating_code,
                                            management_efficacy_codes.code_description as management_efficacy_rating, 
                                            a.monitoring_array #>> '{evidence_of_treatment}' as evidence_of_treatment,
                                            i.invasive_plants_on_site, 
                                            a.monitoring_array #>> '{treatment_pass}' as treatment_pass,
                                            a.monitoring_array #>> '{comment}' as comment
                                          from 
                                            mechanical_monitoring_array a 
                                            join invasive_plants_on_site_agg i on i.plant_id = concat(
                                              a.activity_incoming_data_id, 
                                              '-', 
                                              a.monitoring_array #>> '{invasive_plant_code}')
                                              left join code_header invasive_plant_code_header on invasive_plant_code_header.code_header_title = 'invasive_plant_code' 
                                              and invasive_plant_code_header.valid_to is null 
                                              left join code invasive_plant_codes on invasive_plant_codes.code_header_id = invasive_plant_code_header.code_header_id 
                                              and a.monitoring_array #>> '{invasive_plant_code}' = invasive_plant_codes.code_name
                                              left join code_header invasive_plant_aquatic_code_header on invasive_plant_aquatic_code_header.code_header_title = 'invasive_plant_aquatic_code' 
                                              and invasive_plant_aquatic_code_header.valid_to is null 
                                              left join code invasive_plant_aquatic_codes on invasive_plant_aquatic_codes.code_header_id = invasive_plant_aquatic_code_header.code_header_id 
                                              and a.monitoring_array #>> '{invasive_plant_aquatic_code}' = invasive_plant_aquatic_codes.code_name
                                              left join code_header efficacy_code_header on efficacy_code_header.code_header_title = 'efficacy_code' 
                                              and efficacy_code_header.valid_to is null 
                                              left join code efficacy_codes on efficacy_codes.code_header_id = efficacy_code_header.code_header_id 
                                              and a.monitoring_array #>> '{efficacy_code}' = efficacy_codes.code_name
                                              left join code_header management_efficacy_code_header on management_efficacy_code_header.code_header_title = 'management_efficacy_code' 
                                              and management_efficacy_code_header.valid_to is null 
                                              left join code management_efficacy_codes on management_efficacy_codes.code_header_id = management_efficacy_code_header.code_header_id 
                                              and a.monitoring_array #>> '{management_efficacy_rating}' = management_efficacy_codes.code_name
                                              ) 
                                          SELECT 
                                            c.activity_incoming_data_id, 
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
                                            c.employer_description as employer, 
                                            c.funding_agency, 
                                            c.jurisdiction, 
                                            c.access_description, 
                                            c.location_description, 
                                            c.comment, 
                                            c.observation_person, 
                                            coalesce(
                                              j.terrestrial_invasive_plant, j.aquatic_invasive_plant
                                            ) as invasive_plant, 
                                            j.treatment_efficacy_rating, 
                                            j.management_efficacy_rating, 
                                            j.evidence_of_treatment, 
                                            j.invasive_plants_on_site, 
                                            j.treatment_pass, 
                                            j.comment as monitor_comment, 
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
                                            ST_AsText(c.geog) as geography 
                                          FROM 
                                            common_fields c 
                                            left join mechanical_monitoring_json j on j.activity_incoming_data_id = c.activity_incoming_data_id
                                        );
                                       
-- biocontrol collection summary 

create 
or replace view invasivesbc.biocontrol_collection_summary as (
  with array_elements as (
    select 
      activity_incoming_data_id, 
      activity_subtype, 
      jurisdictions_array, 
      project_code_array, 
      person_array, 
      funding_list 
    from 
      activity_incoming_data 
      left join jsonb_array_elements(
        activity_payload #> '{form_data, activity_data, jurisdictions}') jurisdictions_array on true
        left join jsonb_array_elements(
          activity_payload #> '{form_data, activity_data, project_code}') project_code_array on true
          left join jsonb_array_elements(
            activity_payload #> '{form_data, activity_type_data, activity_persons}') person_array on true
            left join convert_string_list_to_array_elements(
              activity_payload #>> '{form_data, activity_data, invasive_species_agency_code}') funding_list on true
              where 
                activity_incoming_data_id in (
                  select 
                    incoming_data_id 
                  from 
                    activity_current
                ) 
                and form_status = 'Submitted' 
                and deleted_timestamp is null 
                and activity_subtype = 'Activity_Biocontrol_Collection'
            ), 
            array_aggregate as (
              select 
                a.activity_incoming_data_id, 
                string_agg (
                  distinct a.project_code_array #>> '{description}',
                  ', '
                ) project, 
                string_agg (
                  distinct a.person_array #>> '{person_name}',
                  ', '
                ) person_name, 
                string_agg(
                  distinct CASE WHEN a.person_array #>> '{applicator_license}' IS NOT NULL
                  THEN concat(
                    a.person_array #>> '{person_name}', ', ', a.person_array #>> '{applicator_license}'
                    ) ELSE a.person_array #>> '{person_name}'
                  END, 
                  ', '
                ) treatment_person_name, 
                string_agg (
                  distinct concat(
                    jurisdiction_codes.code_description, 
                    ' ', 
                    (
                      a.jurisdictions_array #>> '{percent_covered}' || '%')
                      ), 
                    ', '
                  ) jurisdiction, 
                  string_agg(
                    distinct invasive_species_agency_codes.code_description, 
                    ', '
                  ) funding_agency 
                  from 
                    array_elements a 
                    left join code_header jurisdiction_code_header on jurisdiction_code_header.code_header_title = 'jurisdiction_code' 
                    and jurisdiction_code_header.valid_to is null 
                    left join code jurisdiction_codes on jurisdiction_codes.code_header_id = jurisdiction_code_header.code_header_id 
                    and a.jurisdictions_array #>> '{jurisdiction_code}' = jurisdiction_codes.code_name
                    left join code_header invasive_species_agency_code_header on invasive_species_agency_code_header.code_header_title = 'invasive_species_agency_code' 
                    and invasive_species_agency_code_header.valid_to is null 
                    left join code invasive_species_agency_codes on invasive_species_agency_codes.code_header_id = invasive_species_agency_code_header.code_header_id 
                    and a.funding_list = invasive_species_agency_codes.code_name 
                  group by 
                    a.activity_incoming_data_id
                ), 
                common_fields as (
                  select 
                    p.jurisdiction, 
                    a.activity_incoming_data_id, 
                    a.activity_id, 
                    a.activity_payload #>> '{short_id}' as short_id,
                    p.project as project_code, 
                    a.activity_payload #>> '{activity_type}' as activity_type,
                    a.activity_payload #>> '{activity_subtype}' as activity_subtype,
                    a.form_status, 
                    to_char(
                      to_timestamp(
                        a.activity_payload #>> '{form_data, activity_data, activity_date_time}', 'YYYY-MM-DD"T"HH24:MI:SS'), 'YYYY-MM-DD HH24:MI:SS') AS activity_date_time,
                        a.activity_payload #>> '{form_data, activity_data, utm_zone}' AS utm_zone,
                        a.activity_payload #>> '{form_data, activity_data, utm_easting}' AS utm_easting,
                        a.activity_payload #>> '{form_data, activity_data, utm_northing}' AS utm_northing,
                        a.activity_payload #>> '{form_data, activity_data, latitude}' AS latitude,
                        a.activity_payload #>> '{form_data, activity_data, longitude}' AS longitude,
                        translate(
                          a.activity_payload #>> '{species_positive}', '[]"', '') as species_positive,
                          jsonb_array_length(
                            a.activity_payload #> '{species_positive}') as positive_species_count,
                            translate(
                              a.activity_payload #>> '{species_negative}', '[]"', '') as species_negative,
                              jsonb_array_length(
                                a.activity_payload #> '{species_negative}') as negative_species_count,
                                a.activity_payload #>> '{form_data, activity_data, reported_area}' AS reported_area_sqm,
                                a.activity_payload #>> '{form_data, activity_type_data, pre_treatment_observation}' AS pre_treatment_observation,
                                p.person_name as observation_person, 
                                p.treatment_person_name as treatment_person, 
                                a.activity_payload #>> '{form_data, activity_data, employer_code}' AS employer_code,
                                employer_codes.code_description as employer_description, 
                                p.funding_agency, 
                                a.activity_payload #>> '{form_data, activity_data, access_description}' AS access_description,
                                a.activity_payload #>> '{form_data, activity_data, location_description}' AS location_description,
                                a.activity_payload #>> '{form_data, activity_data, general_comment}' AS comment,
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
                                (
                                  case when a.media_keys is null then 'No' else 'Yes' end
                                ) as photo, 
                                a.created_timestamp, 
                                a.received_timestamp 
                                FROM 
                                  activity_incoming_data a 
                                  left join array_aggregate p on p.activity_incoming_data_id = a.activity_incoming_data_id 
                                  left join code_header employer_code_header on employer_code_header.code_header_title = 'employer_code' 
                                  and employer_code_header.valid_to is null 
                                  left join code employer_codes on employer_codes.code_header_id = employer_code_header.code_header_id 
                                  and a.activity_payload #>> '{form_data, activity_data, employer_code}' = employer_codes.code_name
                                where 
                                  a.activity_incoming_data_id in (
                                    select 
                                      incoming_data_id 
                                    from 
                                      activity_current
                                  ) 
                                  and a.form_status = 'Submitted' 
                                  and a.deleted_timestamp is null 
                                  and a.activity_subtype = 'Activity_Biocontrol_Collection'
                              ), 
                              biocontrol_collection_json as (
                                select 
                                  activity_incoming_data_id, 
                                  activity_subtype, 
                                  form_status, 
                                  activity_payload #>> '{form_data, activity_type_data, linked_id}' as linked_treatment_id,
                                  activity_payload #> '{form_data, activity_subtype_data}' as json_data
                                from 
                                  activity_incoming_data 
                                where 
                                  activity_incoming_data_id in (
                                    select 
                                      incoming_data_id 
                                    from 
                                      activity_current
                                  ) 
                                  and form_status = 'Submitted' 
                                  and deleted_timestamp is null 
                                  and activity_subtype = 'Activity_Biocontrol_Collection'
                              ), 
                              collection_array as (
                                select 
                                  concat(
                                    activity_incoming_data_id, '-', biocontrol_collection_information ->> 'invasive_plant_code', 
                                    '-', biocontrol_collection_information ->> 'biological_agent_code'
                                  ) as agent_id, 
                                  activity_incoming_data_id, 
                                  biocontrol_collection_information ->> 'invasive_plant_code' as invasive_plant_code, 
                                  biocontrol_collection_information ->> 'comment' as collection_comment, 
                                  biocontrol_collection_information ->> 'stop_time' as stop_time, 
                                  biocontrol_collection_information ->> 'start_time' as start_time, 
                                  biocontrol_collection_information ->> 'plant_count' as plant_count, 
                                  biocontrol_collection_information ->> 'collection_type' as collection_type, 
                                  biocontrol_collection_information ->> 'collection_method' as collection_method_code, 
                                  biocontrol_collection_information ->> 'biological_agent_code' as biological_agent_code, 
                                  biocontrol_collection_information ->> 'historical_iapp_site_id' as historical_iapp_site_id, 
                                  biocontrol_collection_information ->> 'total_bio_agent_quantity_actual' as total_agent_quantity_actual, 
                                  biocontrol_collection_information ->> 'total_bio_agent_quantity_estimated' as total_agent_quantity_estimated 
                                from 
                                  activity_incoming_data, 
                                  jsonb_array_elements(
                                    activity_incoming_data.activity_payload #> '{form_data, activity_subtype_data, Biocontrol_Collection_Information}') biocontrol_collection_information
                                    where 
                                      activity_incoming_data_id in (
                                        select 
                                          incoming_data_id 
                                        from 
                                          activity_current
                                      ) 
                                      and form_status = 'Submitted' 
                                      and deleted_timestamp is null 
                                      and activity_subtype = 'Activity_Biocontrol_Collection'
                                  ), 
                                  actual_agents as (
                                    select 
                                      concat(
                                        activity_incoming_data_id, '-', biocontrol_collection_information ->> 'invasive_plant_code', 
                                        '-', biocontrol_collection_information ->> 'biological_agent_code'
                                      ) as agent_id, 
                                      activity_incoming_data_id, 
                                      string_agg(
                                        biological_agent_stage_codes.code_description, 
                                        ', ' 
                                        order by 
                                          biological_agent_stage_codes.code_description
                                      ) actual_agent_stage, 
                                      string_agg(
                                        actual_biological_agents ->> 'release_quantity', 
                                        ', ' 
                                        order by 
                                          biological_agent_stage_codes.code_description
                                      ) actual_agent_count 
                                    from 
                                      activity_incoming_data, 
                                      jsonb_array_elements(
                                        activity_incoming_data.activity_payload #> '{form_data, activity_subtype_data, Biocontrol_Collection_Information}') biocontrol_collection_information
                                        left join lateral jsonb_array_elements(
                                          biocontrol_collection_information #> '{actual_biological_agents}') actual_biological_agents on true
                                          left join code_header biological_agent_stage_code_header on biological_agent_stage_code_header.code_header_title = 'biological_agent_stage_code' 
                                          and biological_agent_stage_code_header.valid_to is null 
                                          left join code biological_agent_stage_codes on biological_agent_stage_codes.code_header_id = biological_agent_stage_code_header.code_header_id 
                                          and actual_biological_agents ->> 'biological_agent_stage_code' = biological_agent_stage_codes.code_name 
                                          where 
                                            activity_incoming_data_id in (
                                              select 
                                                incoming_data_id 
                                              from 
                                                activity_current
                                            ) 
                                            and form_status = 'Submitted' 
                                            and deleted_timestamp is null 
                                            and activity_subtype = 'Activity_Biocontrol_Collection' 
                                          group by 
                                            activity_incoming_data_id, 
                                            concat(
                                              activity_incoming_data_id, '-', biocontrol_collection_information ->> 'invasive_plant_code', 
                                              '-', biocontrol_collection_information ->> 'biological_agent_code'
                                            )
                                        ), 
                                        estimated_agents as (
                                          select 
                                            concat(
                                              activity_incoming_data_id, '-', biocontrol_collection_information ->> 'invasive_plant_code', 
                                              '-', biocontrol_collection_information ->> 'biological_agent_code'
                                            ) as agent_id, 
                                            activity_incoming_data_id, 
                                            string_agg(
                                              biological_agent_stage_codes.code_description, 
                                              ', ' 
                                              order by 
                                                biological_agent_stage_codes.code_description
                                            ) estimated_agent_stage, 
                                            string_agg(
                                              estimated_biological_agents ->> 'release_quantity', 
                                              ', ' 
                                              order by 
                                                biological_agent_stage_codes.code_description
                                            ) estimated_agent_count 
                                          from 
                                            activity_incoming_data, 
                                            jsonb_array_elements(
                                              activity_incoming_data.activity_payload #> '{form_data, activity_subtype_data, Biocontrol_Collection_Information}') biocontrol_collection_information
                                              left join lateral jsonb_array_elements(
                                                biocontrol_collection_information #> '{estimated_biological_agents}') estimated_biological_agents on true
                                                left join code_header biological_agent_stage_code_header on biological_agent_stage_code_header.code_header_title = 'biological_agent_stage_code' 
                                                and biological_agent_stage_code_header.valid_to is null 
                                                left join code biological_agent_stage_codes on biological_agent_stage_codes.code_header_id = biological_agent_stage_code_header.code_header_id 
                                                and estimated_biological_agents ->> 'biological_agent_stage_code' = biological_agent_stage_codes.code_name 
                                                where 
                                                  activity_incoming_data_id in (
                                                    select 
                                                      incoming_data_id 
                                                    from 
                                                      activity_current
                                                  ) 
                                                  and form_status = 'Submitted' 
                                                  and deleted_timestamp is null 
                                                  and activity_subtype = 'Activity_Biocontrol_Collection' 
                                                group by 
                                                  activity_incoming_data_id, 
                                                  concat(
                                                    activity_incoming_data_id, '-', biocontrol_collection_information ->> 'invasive_plant_code', 
                                                    '-', biocontrol_collection_information ->> 'biological_agent_code'
                                                  )
                                              ), 
                                              collection_array_select as (
                                                select 
                                                  c.activity_incoming_data_id, 
                                                  invasive_plant_codes.code_description as invasive_plant, 
                                                  a.actual_agent_stage, 
                                                  a.actual_agent_count, 
                                                  e.estimated_agent_stage, 
                                                  e.estimated_agent_count, 
                                                  c.total_agent_quantity_actual, 
                                                  c.total_agent_quantity_estimated, 
                                                  c.collection_comment, 
                                                  c.stop_time, 
                                                  c.start_time, 
                                                  c.plant_count, 
                                                  c.collection_type, 
                                                  biocontrol_monitoring_methods_codes.code_description as collection_method, 
                                                  biological_agent_codes.code_description as biological_agent, 
                                                  c.historical_iapp_site_id 
                                                from 
                                                  collection_array c 
                                                  left join actual_agents a on a.agent_id = c.agent_id 
                                                  left join estimated_agents e on e.agent_id = c.agent_id 
                                                  left join code_header invasive_plant_code_header on invasive_plant_code_header.code_header_title = 'invasive_plant_code' 
                                                  and invasive_plant_code_header.valid_to is null 
                                                  left join code invasive_plant_codes on invasive_plant_codes.code_header_id = invasive_plant_code_header.code_header_id 
                                                  and c.invasive_plant_code = invasive_plant_codes.code_name 
                                                  left join code_header biological_agent_code_header on biological_agent_code_header.code_header_title = 'biological_agent_code' 
                                                  and biological_agent_code_header.valid_to is null 
                                                  left join code biological_agent_codes on biological_agent_codes.code_header_id = biological_agent_code_header.code_header_id 
                                                  and c.biological_agent_code = biological_agent_codes.code_name 
                                                  left join code_header biocontrol_monitoring_methods_code_header on biocontrol_monitoring_methods_code_header.code_header_title = 'biocontrol_collection_code' 
                                                  and biocontrol_monitoring_methods_code_header.valid_to is null 
                                                  left join code biocontrol_monitoring_methods_codes on biocontrol_monitoring_methods_codes.code_header_id = biocontrol_monitoring_methods_code_header.code_header_id 
                                                  and c.collection_method_code = biocontrol_monitoring_methods_codes.code_name
                                              ), 
                                              biocontrol_collection_monitoring_select as (
                                                select 
                                                  b.activity_incoming_data_id, 
                                                  b.linked_treatment_id, 
                                                  b.json_data #>> '{Weather_Conditions, temperature}' as temperature,
                                                  b.json_data #>> '{Weather_Conditions, cloud_cover_code}' as cloud_cover_code,
                                                  cloud_cover_codes.code_description as cloud_cover, 
                                                  b.json_data #>> '{Weather_Conditions, precipitation_code}' as precipitation_code,
                                                  precipitation_codes.code_description as precipitation, 
                                                  b.json_data #>> '{Weather_Conditions, wind_speed}' as wind_speed,
                                                  b.json_data #>> '{Weather_Conditions, wind_direction_code}' as wind_aspect,
                                                  b.json_data #>> '{Weather_Conditions, weather_comments}' as weather_comments,
                                                  b.json_data #>> '{Microsite_Conditions, mesoslope_position_code}' as mesoslope_position_code,
                                                  mesoslope_position_codes.code_description as mesoslope_position, 
                                                  b.json_data #>> '{Microsite_Conditions, site_surface_shape_code}' as site_surface_shape_code,
                                                  site_surface_shape_codes.code_description as site_surface_shape, 
                                                  b.json_data #>> '{Target_Plant_Phenology, phenology_details_recorded}' as phenology_details_recorded,
                                                  translate(
                                                    b.json_data #>> '{Target_Plant_Phenology, target_plant_heights}', '[{}]', '') as target_plant_heights,
                                                    b.json_data #>> '{Target_Plant_Phenology, winter_dormant}' as winter_dormant,
                                                    b.json_data #>> '{Target_Plant_Phenology, seedlings}' as seedlings,
                                                    b.json_data #>> '{Target_Plant_Phenology, rosettes}' as rosettes,
                                                    b.json_data #>> '{Target_Plant_Phenology, bolts}' as bolts,
                                                    b.json_data #>> '{Target_Plant_Phenology, flowering}' as flowering,
                                                    b.json_data #>> '{Target_Plant_Phenology, seeds_forming}' as seeds_forming,
                                                    b.json_data #>> '{Target_Plant_Phenology, senescent}' as senescent,
                                                    c.invasive_plant, 
                                                    c.biological_agent, 
                                                    c.historical_iapp_site_id, 
                                                    c.collection_type, 
                                                    c.plant_count, 
                                                    c.collection_method, 
                                                    c.start_time, 
                                                    c.stop_time, 
                                                    c.actual_agent_stage, 
                                                    c.actual_agent_count, 
                                                    c.estimated_agent_stage, 
                                                    c.estimated_agent_count, 
                                                    c.total_agent_quantity_actual, 
                                                    c.total_agent_quantity_estimated 
                                                    from 
                                                      collection_array_select c 
                                                      join biocontrol_collection_json b on b.activity_incoming_data_id = c.activity_incoming_data_id 
                                                      left join code_header cloud_cover_code_header on cloud_cover_code_header.code_header_title = 'cloud_cover_code' 
                                                      and cloud_cover_code_header.valid_to is null 
                                                      left join code cloud_cover_codes on cloud_cover_codes.code_header_id = cloud_cover_code_header.code_header_id 
                                                      and b.json_data #>> '{Weather_Conditions, cloud_cover_code}' = cloud_cover_codes.code_name
                                                      left join code_header precipitation_code_header on precipitation_code_header.code_header_title = 'precipitation_code' 
                                                      and precipitation_code_header.valid_to is null 
                                                      left join code precipitation_codes on precipitation_codes.code_header_id = precipitation_code_header.code_header_id 
                                                      and b.json_data #>> '{Weather_Conditions, precipitation_code}' = precipitation_codes.code_name
                                                      left join code_header mesoslope_position_code_header on mesoslope_position_code_header.code_header_title = 'mesoslope_position_code' 
                                                      and mesoslope_position_code_header.valid_to is null 
                                                      left join code mesoslope_position_codes on mesoslope_position_codes.code_header_id = mesoslope_position_code_header.code_header_id 
                                                      and b.json_data #>> '{Microsite_Conditions, mesoslope_position_code}' = mesoslope_position_codes.code_name
                                                      left join code_header site_surface_shape_code_header on site_surface_shape_code_header.code_header_title = 'site_surface_shape_code' 
                                                      and site_surface_shape_code_header.valid_to is null 
                                                      left join code site_surface_shape_codes on site_surface_shape_codes.code_header_id = site_surface_shape_code_header.code_header_id 
                                                      and b.json_data #>> '{Microsite_Conditions, site_surface_shape_code}' = site_surface_shape_codes.code_name
                                                      left join code_header invasive_plant_code_header on invasive_plant_code_header.code_header_title = 'invasive_plant_code' 
                                                      and invasive_plant_code_header.valid_to is null 
                                                      left join code invasive_plant_codes on invasive_plant_codes.code_header_id = invasive_plant_code_header.code_header_id 
                                                      and b.json_data #>> '{Biocontrol_Collection_Information, invasive_plant_code}' = invasive_plant_codes.code_name
                                                      left join code_header biological_agent_code_header on biological_agent_code_header.code_header_title = 'biological_agent_code' 
                                                      and biological_agent_code_header.valid_to is null 
                                                      left join code biological_agent_codes on biological_agent_codes.code_header_id = biological_agent_code_header.code_header_id 
                                                      and b.json_data #>> '{Biocontrol_Collection_Information, biological_agent_code}' = biological_agent_codes.code_name
                                                      left join code_header biological_agent_presence_code_header on biological_agent_presence_code_header.code_header_title = 'biological_agent_presence_code' 
                                                      and biological_agent_presence_code_header.valid_to is null 
                                                      left join code biological_agent_presence_codes on biological_agent_presence_codes.code_header_id = biological_agent_presence_code_header.code_header_id 
                                                      and b.json_data #>> '{Biocontrol_Collection_Information, biological_agent_presence_code}' = biological_agent_presence_codes.code_name
                                                      ) 
                                                SELECT 
                                                  c.activity_incoming_data_id, 
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
                                                  c.employer_description as employer, 
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
                                                  b.wind_aspect as wind_direction, 
                                                  b.weather_comments, 
                                                  b.mesoslope_position, 
                                                  b.site_surface_shape, 
                                                  b.invasive_plant, 
                                                  b.biological_agent, 
                                                  b.historical_iapp_site_id, 
                                                  b.collection_type, 
                                                  b.plant_count, 
                                                  b.collection_method, 
                                                  to_char(
                                                    to_timestamp(
                                                      b.start_time, 'YYYY-MM-DD"T"HH24:MI:SS'
                                                    ), 
                                                    'YYYY-MM-DD HH24:MI:SS'
                                                  ) as start_time, 
                                                  to_char(
                                                    to_timestamp(
                                                      b.stop_time, 'YYYY-MM-DD"T"HH24:MI:SS'
                                                    ), 
                                                    'YYYY-MM-DD HH24:MI:SS'
                                                  ) as stop_time, 
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
                                                  ST_AsText(c.geog) as geography 
                                                FROM 
                                                  common_fields c 
                                                  join biocontrol_collection_monitoring_select b on b.activity_incoming_data_id = c.activity_incoming_data_id
                                              );

                                             
-- biocontrol dispersal monitoring summary
                                             
create 
or replace view invasivesbc.biocontrol_dispersal_monitoring_summary as (
  with array_elements as (
    select 
      activity_incoming_data_id, 
      activity_subtype, 
      jurisdictions_array, 
      project_code_array, 
      person_array, 
      funding_list 
    from 
      activity_incoming_data 
      left join jsonb_array_elements(
        activity_payload #> '{form_data, activity_data, jurisdictions}') jurisdictions_array on true
        left join jsonb_array_elements(
          activity_payload #> '{form_data, activity_data, project_code}') project_code_array on true
          left join jsonb_array_elements(
            activity_payload #> '{form_data, activity_type_data, activity_persons}') person_array on true
            left join convert_string_list_to_array_elements(
              activity_payload #>> '{form_data, activity_data, invasive_species_agency_code}') funding_list on true
              where 
                activity_incoming_data_id in (
                  select 
                    incoming_data_id 
                  from 
                    activity_current
                ) 
                and form_status = 'Submitted' 
                and deleted_timestamp is null 
                and activity_subtype = 'Activity_Monitoring_BiocontrolDispersal_TerrestrialPlant'
            ), 
            array_aggregate as (
              select 
                a.activity_incoming_data_id, 
                string_agg (
                  distinct a.project_code_array #>> '{description}',
                  ', '
                ) project, 
                string_agg (
                  distinct a.person_array #>> '{person_name}',
                  ', '
                ) person_name, 
                string_agg(
                  distinct CASE WHEN a.person_array #>> '{applicator_license}' IS NOT NULL
                  THEN concat(
                    a.person_array #>> '{person_name}', ', ', a.person_array #>> '{applicator_license}'
                    ) ELSE a.person_array #>> '{person_name}'
                  END, 
                  ', '
                ) treatment_person_name, 
                string_agg (
                  distinct concat(
                    jurisdiction_codes.code_description, 
                    ' ', 
                    (
                      a.jurisdictions_array #>> '{percent_covered}' || '%')
                      ), 
                    ', '
                  ) jurisdiction, 
                  string_agg(
                    distinct invasive_species_agency_codes.code_description, 
                    ', '
                  ) funding_agency 
                  from 
                    array_elements a 
                    left join code_header jurisdiction_code_header on jurisdiction_code_header.code_header_title = 'jurisdiction_code' 
                    and jurisdiction_code_header.valid_to is null 
                    left join code jurisdiction_codes on jurisdiction_codes.code_header_id = jurisdiction_code_header.code_header_id 
                    and a.jurisdictions_array #>> '{jurisdiction_code}' = jurisdiction_codes.code_name
                    left join code_header invasive_species_agency_code_header on invasive_species_agency_code_header.code_header_title = 'invasive_species_agency_code' 
                    and invasive_species_agency_code_header.valid_to is null 
                    left join code invasive_species_agency_codes on invasive_species_agency_codes.code_header_id = invasive_species_agency_code_header.code_header_id 
                    and a.funding_list = invasive_species_agency_codes.code_name 
                  group by 
                    a.activity_incoming_data_id
                ), 
                common_fields as (
                  select 
                    p.jurisdiction, 
                    a.activity_incoming_data_id, 
                    a.activity_id, 
                    a.activity_payload #>> '{short_id}' as short_id,
                    p.project as project_code, 
                    a.activity_payload #>> '{activity_type}' as activity_type,
                    a.activity_payload #>> '{activity_subtype}' as activity_subtype,
                    a.form_status, 
                    to_char(
                      to_timestamp(
                        a.activity_payload #>> '{form_data, activity_data, activity_date_time}', 'YYYY-MM-DD"T"HH24:MI:SS'), 'YYYY-MM-DD HH24:MI:SS') AS activity_date_time,
                        a.activity_payload #>> '{form_data, activity_data, utm_zone}' AS utm_zone,
                        a.activity_payload #>> '{form_data, activity_data, utm_easting}' AS utm_easting,
                        a.activity_payload #>> '{form_data, activity_data, utm_northing}' AS utm_northing,
                        a.activity_payload #>> '{form_data, activity_data, latitude}' AS latitude,
                        a.activity_payload #>> '{form_data, activity_data, longitude}' AS longitude,
                        translate(
                          a.activity_payload #>> '{species_positive}', '[]"', '') as species_positive,
                          jsonb_array_length(
                            a.activity_payload #> '{species_positive}') as positive_species_count,
                            translate(
                              a.activity_payload #>> '{species_negative}', '[]"', '') as species_negative,
                              jsonb_array_length(
                                a.activity_payload #> '{species_negative}') as negative_species_count,
                                a.activity_payload #>> '{form_data, activity_data, reported_area}' AS reported_area_sqm,
                                a.activity_payload #>> '{form_data, activity_type_data, pre_treatment_observation}' AS pre_treatment_observation,
                                p.person_name as observation_person, 
                                p.treatment_person_name as treatment_person, 
                                a.activity_payload #>> '{form_data, activity_data, employer_code}' AS employer_code,
                                employer_codes.code_description as employer_description, 
                                p.funding_agency, 
                                a.activity_payload #>> '{form_data, activity_data, access_description}' AS access_description,
                                a.activity_payload #>> '{form_data, activity_data, location_description}' AS location_description,
                                a.activity_payload #>> '{form_data, activity_data, general_comment}' AS comment,
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
                                (
                                  case when a.media_keys is null then 'No' else 'Yes' end
                                ) as photo, 
                                a.created_timestamp, 
                                a.received_timestamp 
                                FROM 
                                  activity_incoming_data a 
                                  left join array_aggregate p on p.activity_incoming_data_id = a.activity_incoming_data_id 
                                  left join code_header employer_code_header on employer_code_header.code_header_title = 'employer_code' 
                                  and employer_code_header.valid_to is null 
                                  left join code employer_codes on employer_codes.code_header_id = employer_code_header.code_header_id 
                                  and a.activity_payload #>> '{form_data, activity_data, employer_code}' = employer_codes.code_name
                                where 
                                  a.activity_incoming_data_id in (
                                    select 
                                      incoming_data_id 
                                    from 
                                      activity_current
                                  ) 
                                  and a.form_status = 'Submitted' 
                                  and a.deleted_timestamp is null 
                                  and a.activity_subtype = 'Activity_Monitoring_BiocontrolDispersal_TerrestrialPlant'
                              ), 
                              biocontrol_dispersal_monitoring_json as (
                                select 
                                  activity_incoming_data_id, 
                                  activity_subtype, 
                                  form_status, 
                                  activity_payload #>> '{form_data, activity_type_data, linked_id}' as linked_treatment_id,
                                  activity_payload #> '{form_data, activity_subtype_data}' as json_data
                                from 
                                  activity_incoming_data 
                                where 
                                  activity_incoming_data_id in (
                                    select 
                                      incoming_data_id 
                                    from 
                                      activity_current
                                  ) 
                                  and form_status = 'Submitted' 
                                  and deleted_timestamp is null 
                                  and activity_subtype = 'Activity_Monitoring_BiocontrolDispersal_TerrestrialPlant'
                              ), 
                              agent_location_code as (
                                select 
                                  concat(
                                    activity_incoming_data_id, '-', biocontrol_dispersal_information ->> 'invasive_plant_code', 
                                    '-', biocontrol_dispersal_information ->> 'biological_agent_code'
                                  ) as agent_id, 
                                  convert_string_list_to_array_elements(
                                    biocontrol_dispersal_information ->> 'bio_agent_location_code'
                                  ) bio_agent_location_code 
                                from 
                                  activity_incoming_data, 
                                  jsonb_array_elements(
                                    activity_incoming_data.activity_payload #> '{form_data, activity_subtype_data, Monitoring_BiocontrolDispersal_Information}') biocontrol_dispersal_information
                                    where 
                                      activity_incoming_data_id in (
                                        select 
                                          incoming_data_id 
                                        from 
                                          activity_current
                                      ) 
                                      and form_status = 'Submitted' 
                                      and deleted_timestamp is null 
                                      and activity_subtype = 'Activity_Monitoring_BiocontrolDispersal_TerrestrialPlant'
                                  ), 
                                  agent_location_code_agg as (
                                    select 
                                      a.agent_id, 
                                      string_agg(
                                        location_agents_found_codes.code_description, 
                                        ', ' 
                                        order by 
                                          location_agents_found_codes.code_description
                                      ) location_agent_found 
                                    from 
                                      agent_location_code a 
                                      left join code_header location_agents_found_code_header on location_agents_found_code_header.code_header_title = 'location_agents_found_code' 
                                      and location_agents_found_code_header.valid_to is null 
                                      left join code location_agents_found_codes on location_agents_found_codes.code_header_id = location_agents_found_code_header.code_header_id 
                                      and a.bio_agent_location_code = location_agents_found_codes.code_name 
                                    group by 
                                      a.agent_id
                                  ), 
                                  agent_presence_code as (
                                    select 
                                      concat(
                                        activity_incoming_data_id, '-', biocontrol_dispersal_information ->> 'invasive_plant_code', 
                                        '-', biocontrol_dispersal_information ->> 'biological_agent_code'
                                      ) as agent_id, 
                                      convert_string_list_to_array_elements(
                                        biocontrol_dispersal_information ->> 'biological_agent_presence_code'
                                      ) biological_agent_presence_code 
                                    from 
                                      activity_incoming_data, 
                                      jsonb_array_elements(
                                        activity_incoming_data.activity_payload #> '{form_data, activity_subtype_data, Monitoring_BiocontrolDispersal_Information}') biocontrol_dispersal_information
                                        where 
                                          activity_incoming_data_id in (
                                            select 
                                              incoming_data_id 
                                            from 
                                              activity_current
                                          ) 
                                          and form_status = 'Submitted' 
                                          and deleted_timestamp is null 
                                          and activity_subtype = 'Activity_Monitoring_BiocontrolDispersal_TerrestrialPlant'
                                      ), 
                                      agent_presence_code_agg as (
                                        select 
                                          a.agent_id, 
                                          string_agg(
                                            biological_agent_presence_codes.code_description, 
                                            ', ' 
                                            order by 
                                              biological_agent_presence_codes.code_description
                                          ) biological_agent_presence 
                                        from 
                                          agent_presence_code a 
                                          left join code_header biological_agent_presence_code_header on biological_agent_presence_code_header.code_header_title = 'biological_agent_presence_code' 
                                          and biological_agent_presence_code_header.valid_to is null 
                                          left join code biological_agent_presence_codes on biological_agent_presence_codes.code_header_id = biological_agent_presence_code_header.code_header_id 
                                          and a.biological_agent_presence_code = biological_agent_presence_codes.code_name 
                                        group by 
                                          a.agent_id
                                      ), 
                                      biocontrol_dispersal_monitoring_array as (
                                        select 
                                          concat(
                                            activity_incoming_data_id, '-', biocontrol_dispersal_information ->> 'invasive_plant_code', 
                                            '-', biocontrol_dispersal_information ->> 'biological_agent_code'
                                          ) as agent_id, 
                                          activity_incoming_data_id, 
                                          biocontrol_dispersal_information ->> 'invasive_plant_code' as invasive_plant_code, 
                                          biocontrol_dispersal_information ->> 'biological_agent_code' as biological_agent_code, 
                                          biocontrol_dispersal_information ->> 'biocontrol_present' as biocontrol_present, 
                                          biocontrol_dispersal_information ->> 'monitoring_type' as monitoring_type, 
                                          biocontrol_dispersal_information ->> 'plant_count' as plant_count, 
                                          biocontrol_dispersal_information ->> 'biocontrol_monitoring_methods_code' as biocontrol_monitoring_methods_code, 
                                          biocontrol_dispersal_information ->> 'linear_segment' as linear_segment, 
                                          biocontrol_dispersal_information ->> 'start_time' as start_time, 
                                          biocontrol_dispersal_information ->> 'stop_time' as stop_time, 
                                          biocontrol_dispersal_information ->> 'total_bio_agent_quantity_actual' as total_bio_agent_quantity_actual, 
                                          biocontrol_dispersal_information ->> 'total_bio_agent_quantity_estimated' as total_bioagent_quantity_estimated 
                                        from 
                                          activity_incoming_data, 
                                          jsonb_array_elements(
                                            activity_incoming_data.activity_payload #> '{form_data, activity_subtype_data, Monitoring_BiocontrolDispersal_Information}') biocontrol_dispersal_information
                                            where 
                                              activity_incoming_data_id in (
                                                select 
                                                  incoming_data_id 
                                                from 
                                                  activity_current
                                              ) 
                                              and form_status = 'Submitted' 
                                              and deleted_timestamp is null 
                                              and activity_subtype = 'Activity_Monitoring_BiocontrolDispersal_TerrestrialPlant'
                                          ), 
                                          actual_agents as (
                                            select 
                                              concat(
                                                activity_incoming_data_id, '-', biocontrol_dispersal_information ->> 'invasive_plant_code', 
                                                '-', biocontrol_dispersal_information ->> 'biological_agent_code'
                                              ) as agent_id, 
                                              activity_incoming_data_id, 
                                              string_agg(
                                                biological_agent_stage_codes.code_description, 
                                                ', ' 
                                                order by 
                                                  biological_agent_stage_codes.code_description
                                              ) actual_biological_agent_stage, 
                                              string_agg(
                                                actual_biological_agents ->> 'release_quantity', 
                                                ', ' 
                                                order by 
                                                  biological_agent_stage_codes.code_description
                                              ) actual_release_quantity, 
                                              string_agg(
                                                actual_plant_position_codes.code_description, 
                                                ', ' 
                                                order by 
                                                  biological_agent_stage_codes.code_description
                                              ) actual_agent_location, 
                                              string_agg(
                                                actual_agent_location_codes.code_description, 
                                                ', ' 
                                                order by 
                                                  biological_agent_stage_codes.code_description
                                              ) actual_plant_position 
                                            from 
                                              activity_incoming_data, 
                                              jsonb_array_elements(
                                                activity_incoming_data.activity_payload #> '{form_data, activity_subtype_data, Monitoring_BiocontrolDispersal_Information}') biocontrol_dispersal_information
                                                left join lateral jsonb_array_elements(
                                                  biocontrol_dispersal_information #> '{actual_biological_agents}') actual_biological_agents on true
                                                  left join code_header biological_agent_stage_code_header on biological_agent_stage_code_header.code_header_title = 'biological_agent_stage_code' 
                                                  and biological_agent_stage_code_header.valid_to is null 
                                                  left join code biological_agent_stage_codes on biological_agent_stage_codes.code_header_id = biological_agent_stage_code_header.code_header_id 
                                                  and actual_biological_agents ->> 'biological_agent_stage_code' = biological_agent_stage_codes.code_name 
                                                  left join code_header actual_plant_position_code_header on actual_plant_position_code_header.code_header_title = 'plant_position_code' 
                                                  and actual_plant_position_code_header.valid_to is null 
                                                  left join code actual_plant_position_codes on actual_plant_position_codes.code_header_id = actual_plant_position_code_header.code_header_id 
                                                  and actual_biological_agents ->> 'plant_position' = actual_plant_position_codes.code_name 
                                                  left join code_header actual_agent_location_code_header on actual_agent_location_code_header.code_header_title = 'agent_location_code' 
                                                  and actual_agent_location_code_header.valid_to is null 
                                                  left join code actual_agent_location_codes on actual_agent_location_codes.code_header_id = actual_agent_location_code_header.code_header_id 
                                                  and actual_biological_agents ->> 'agent_location' = actual_agent_location_codes.code_name 
                                                  where 
                                                    activity_incoming_data_id in (
                                                      select 
                                                        incoming_data_id 
                                                      from 
                                                        activity_current
                                                    ) 
                                                    and form_status = 'Submitted' 
                                                    and deleted_timestamp is null 
                                                    and activity_subtype = 'Activity_Monitoring_BiocontrolDispersal_TerrestrialPlant' 
                                                  group by 
                                                    activity_incoming_data_id, 
                                                    concat(
                                                      activity_incoming_data_id, '-', biocontrol_dispersal_information ->> 'invasive_plant_code', 
                                                      '-', biocontrol_dispersal_information ->> 'biological_agent_code'
                                                    )
                                                ), 
                                                estimated_agents as (
                                                  select 
                                                    concat(
                                                      activity_incoming_data_id, '-', biocontrol_dispersal_information ->> 'invasive_plant_code', 
                                                      '-', biocontrol_dispersal_information ->> 'biological_agent_code'
                                                    ) as agent_id, 
                                                    activity_incoming_data_id, 
                                                    string_agg(
                                                      biological_agent_stage_codes.code_description, 
                                                      ', ' 
                                                      order by 
                                                        biological_agent_stage_codes.code_description
                                                    ) estimated_biological_agent_stage, 
                                                    string_agg(
                                                      estimated_biological_agents ->> 'release_quantity', 
                                                      ', ' 
                                                      order by 
                                                        biological_agent_stage_codes.code_description
                                                    ) estimated_release_quantity, 
                                                    string_agg(
                                                      estimated_plant_position_codes.code_description, 
                                                      ', ' 
                                                      order by 
                                                        biological_agent_stage_codes.code_description
                                                    ) estimated_agent_location, 
                                                    string_agg(
                                                      estimated_agent_location_codes.code_description, 
                                                      ', ' 
                                                      order by 
                                                        biological_agent_stage_codes.code_description
                                                    ) estimated_plant_position 
                                                  from 
                                                    activity_incoming_data, 
                                                    jsonb_array_elements(
                                                      activity_incoming_data.activity_payload #> '{form_data, activity_subtype_data, Monitoring_BiocontrolDispersal_Information}') biocontrol_dispersal_information
                                                      left join lateral jsonb_array_elements(
                                                        biocontrol_dispersal_information #> '{estimated_biological_agents}') estimated_biological_agents on true
                                                        left join code_header biological_agent_stage_code_header on biological_agent_stage_code_header.code_header_title = 'biological_agent_stage_code' 
                                                        and biological_agent_stage_code_header.valid_to is null 
                                                        left join code biological_agent_stage_codes on biological_agent_stage_codes.code_header_id = biological_agent_stage_code_header.code_header_id 
                                                        and estimated_biological_agents ->> 'biological_agent_stage_code' = biological_agent_stage_codes.code_name 
                                                        left join code_header estimated_plant_position_code_header on estimated_plant_position_code_header.code_header_title = 'plant_position_code' 
                                                        and estimated_plant_position_code_header.valid_to is null 
                                                        left join code estimated_plant_position_codes on estimated_plant_position_codes.code_header_id = estimated_plant_position_code_header.code_header_id 
                                                        and estimated_biological_agents ->> 'plant_position' = estimated_plant_position_codes.code_name 
                                                        left join code_header estimated_agent_location_code_header on estimated_agent_location_code_header.code_header_title = 'agent_location_code' 
                                                        and estimated_agent_location_code_header.valid_to is null 
                                                        left join code estimated_agent_location_codes on estimated_agent_location_codes.code_header_id = estimated_agent_location_code_header.code_header_id 
                                                        and estimated_biological_agents ->> 'agent_location' = estimated_agent_location_codes.code_name 
                                                        where 
                                                          activity_incoming_data_id in (
                                                            select 
                                                              incoming_data_id 
                                                            from 
                                                              activity_current
                                                          ) 
                                                          and deleted_timestamp is null 
                                                          and form_status = 'Submitted' 
                                                          and activity_subtype = 'Activity_Monitoring_BiocontrolDispersal_TerrestrialPlant' 
                                                        group by 
                                                          activity_incoming_data_id, 
                                                          concat(
                                                            activity_incoming_data_id, '-', biocontrol_dispersal_information ->> 'invasive_plant_code', 
                                                            '-', biocontrol_dispersal_information ->> 'biological_agent_code'
                                                          )
                                                      ), 
                                                      monitoring_array_select as (
                                                        select 
                                                          d.activity_incoming_data_id, 
                                                          invasive_plant_codes.code_description as invasive_plant, 
                                                          biological_agent_codes.code_description as biological_agent, 
                                                          d.biocontrol_present, 
                                                          l.location_agent_found, 
                                                          p.biological_agent_presence, 
                                                          d.monitoring_type, 
                                                          d.plant_count, 
                                                          biocontrol_monitoring_methods_codes.code_description as monitoring_method, 
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
                                                        from 
                                                          biocontrol_dispersal_monitoring_array d 
                                                          left join actual_agents a on a.agent_id = d.agent_id 
                                                          left join estimated_agents e on e.agent_id = d.agent_id 
                                                          left join agent_location_code_agg l on l.agent_id = d.agent_id 
                                                          left join agent_presence_code_agg p on p.agent_id = d.agent_id 
                                                          left join code_header invasive_plant_code_header on invasive_plant_code_header.code_header_title = 'invasive_plant_code' 
                                                          and invasive_plant_code_header.valid_to is null 
                                                          left join code invasive_plant_codes on invasive_plant_codes.code_header_id = invasive_plant_code_header.code_header_id 
                                                          and d.invasive_plant_code = invasive_plant_codes.code_name 
                                                          left join code_header biological_agent_code_header on biological_agent_code_header.code_header_title = 'biological_agent_code' 
                                                          and biological_agent_code_header.valid_to is null 
                                                          left join code biological_agent_codes on biological_agent_codes.code_header_id = biological_agent_code_header.code_header_id 
                                                          and d.biological_agent_code = biological_agent_codes.code_name 
                                                          left join code_header biocontrol_monitoring_methods_code_header on biocontrol_monitoring_methods_code_header.code_header_title = 'biocontrol_monitoring_methods_code' 
                                                          and biocontrol_monitoring_methods_code_header.valid_to is null 
                                                          left join code biocontrol_monitoring_methods_codes on biocontrol_monitoring_methods_codes.code_header_id = biocontrol_monitoring_methods_code_header.code_header_id 
                                                          and d.biocontrol_monitoring_methods_code = biocontrol_monitoring_methods_codes.code_name
                                                      ), 
                                                      biocontrol_release_monitoring_select as (
                                                        select 
                                                          b.activity_incoming_data_id, 
                                                          b.linked_treatment_id, 
                                                          b.json_data #>> '{Weather_Conditions, temperature}' as temperature,
                                                          b.json_data #>> '{Weather_Conditions, cloud_cover_code}' as cloud_cover_code,
                                                          cloud_cover_codes.code_description as cloud_cover, 
                                                          b.json_data #>> '{Weather_Conditions, precipitation_code}' as precipitation_code,
                                                          precipitation_codes.code_description as precipitation, 
                                                          b.json_data #>> '{Weather_Conditions, wind_speed}' as wind_speed,
                                                          b.json_data #>> '{Weather_Conditions, wind_direction_code}' as wind_aspect,
                                                          b.json_data #>> '{Weather_Conditions, weather_comments}' as weather_comments,
                                                          b.json_data #>> '{Microsite_Conditions, mesoslope_position_code}' as mesoslope_position_code,
                                                          mesoslope_position_codes.code_description as mesoslope_position, 
                                                          b.json_data #>> '{Microsite_Conditions, site_surface_shape_code}' as site_surface_shape_code,
                                                          site_surface_shape_codes.code_description as site_surface_shape, 
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
                                                          b.json_data #>> '{Target_Plant_Phenology, phenology_details_recorded}' as phenology_details_recorded,
                                                          translate(
                                                            b.json_data #>> '{Target_Plant_Phenology, target_plant_heights}', '[{}]', '') as target_plant_heights,
                                                            b.json_data #>> '{Target_Plant_Phenology, winter_dormant}' as winter_dormant,
                                                            b.json_data #>> '{Target_Plant_Phenology, seedlings}' as seedlings,
                                                            b.json_data #>> '{Target_Plant_Phenology, rosettes}' as rosettes,
                                                            b.json_data #>> '{Target_Plant_Phenology, bolts}' as bolts,
                                                            b.json_data #>> '{Target_Plant_Phenology, flowering}' as flowering,
                                                            b.json_data #>> '{Target_Plant_Phenology, seeds_forming}' as seeds_forming,
                                                            b.json_data #>> '{Target_Plant_Phenology, senescent}' as senescent
                                                            from 
                                                              biocontrol_dispersal_monitoring_json b 
                                                              join monitoring_array_select a on a.activity_incoming_data_id = b.activity_incoming_data_id 
                                                              left join code_header cloud_cover_code_header on cloud_cover_code_header.code_header_title = 'cloud_cover_code' 
                                                              and cloud_cover_code_header.valid_to is null 
                                                              left join code cloud_cover_codes on cloud_cover_codes.code_header_id = cloud_cover_code_header.code_header_id 
                                                              and b.json_data #>> '{Weather_Conditions, cloud_cover_code}' = cloud_cover_codes.code_name
                                                              left join code_header precipitation_code_header on precipitation_code_header.code_header_title = 'precipitation_code' 
                                                              and precipitation_code_header.valid_to is null 
                                                              left join code precipitation_codes on precipitation_codes.code_header_id = precipitation_code_header.code_header_id 
                                                              and b.json_data #>> '{Weather_Conditions, precipitation_code}' = precipitation_codes.code_name
                                                              left join code_header mesoslope_position_code_header on mesoslope_position_code_header.code_header_title = 'mesoslope_position_code' 
                                                              and mesoslope_position_code_header.valid_to is null 
                                                              left join code mesoslope_position_codes on mesoslope_position_codes.code_header_id = mesoslope_position_code_header.code_header_id 
                                                              and b.json_data #>> '{Microsite_Conditions, mesoslope_position_code}' = mesoslope_position_codes.code_name
                                                              left join code_header site_surface_shape_code_header on site_surface_shape_code_header.code_header_title = 'site_surface_shape_code' 
                                                              and site_surface_shape_code_header.valid_to is null 
                                                              left join code site_surface_shape_codes on site_surface_shape_codes.code_header_id = site_surface_shape_code_header.code_header_id 
                                                              and b.json_data #>> '{Microsite_Conditions, site_surface_shape_code}' = site_surface_shape_codes.code_name
                                                              ) 
                                                        SELECT 
                                                          c.activity_incoming_data_id, 
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
                                                          c.employer_description as employer, 
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
                                                          b.wind_aspect as wind_direction, 
                                                          b.weather_comments, 
                                                          b.mesoslope_position, 
                                                          b.site_surface_shape, 
                                                          b.invasive_plant, 
                                                          b.biological_agent, 
                                                          case when b.biocontrol_present = 'true' then 'Yes' else 'No' end as biocontrol_present, 
                                                          b.biological_agent_presence, 
                                                          b.monitoring_type, 
                                                          b.plant_count, 
                                                          b.monitoring_method, 
                                                          b.linear_segment, 
                                                          to_char(
                                                            to_timestamp(
                                                              b.start_time, 'YYYY-MM-DD"T"HH24:MI:SS'
                                                            ), 
                                                            'YYYY-MM-DD HH24:MI:SS'
                                                          ) as start_time, 
                                                          to_char(
                                                            to_timestamp(
                                                              b.stop_time, 'YYYY-MM-DD"T"HH24:MI:SS'
                                                            ), 
                                                            'YYYY-MM-DD HH24:MI:SS'
                                                          ) as stop_time, 
                                                          b.location_agent_found, 
                                                          b.actual_biological_agent_stage, 
                                                          b.actual_release_quantity as actual_agent_count, 
                                                          b.actual_plant_position, 
                                                          b.actual_agent_location, 
                                                          b.estimated_biological_agent_stage, 
                                                          b.estimated_release_quantity as estimated_agent_count, 
                                                          b.estimated_plant_position, 
                                                          b.estimated_agent_location, 
                                                          b.total_bio_agent_quantity_actual as total_agent_quantity_actual, 
                                                          b.total_bioagent_quantity_estimated as total_agent_quantity_estimated, 
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
                                                          ST_AsText(c.geog) as geography 
                                                        FROM 
                                                          common_fields c 
                                                          join biocontrol_release_monitoring_select b on b.activity_incoming_data_id = c.activity_incoming_data_id
                                                      );

-- biocontrol release monitoring summary
                                                     
create 
or replace view invasivesbc.biocontrol_release_monitoring_summary as (
  with array_elements as (
    select 
      activity_incoming_data_id, 
      activity_subtype, 
      jurisdictions_array, 
      project_code_array, 
      person_array, 
      funding_list 
    from 
      activity_incoming_data 
      left join jsonb_array_elements(
        activity_payload #> '{form_data, activity_data, jurisdictions}') jurisdictions_array on true
        left join jsonb_array_elements(
          activity_payload #> '{form_data, activity_data, project_code}') project_code_array on true
          left join jsonb_array_elements(
            activity_payload #> '{form_data, activity_type_data, activity_persons}') person_array on true
            left join convert_string_list_to_array_elements(
              activity_payload #>> '{form_data, activity_data, invasive_species_agency_code}') funding_list on true
              where 
                activity_incoming_data_id in (
                  select 
                    incoming_data_id 
                  from 
                    activity_current
                ) 
                and form_status = 'Submitted' 
                and deleted_timestamp is null 
                and activity_subtype = 'Activity_Monitoring_BiocontrolRelease_TerrestrialPlant'
            ), 
            array_aggregate as (
              select 
                a.activity_incoming_data_id, 
                string_agg (
                  distinct a.project_code_array #>> '{description}',
                  ', '
                ) project, 
                string_agg (
                  distinct a.person_array #>> '{person_name}',
                  ', '
                ) person_name, 
                string_agg(
                  distinct CASE WHEN a.person_array #>> '{applicator_license}' IS NOT NULL
                  THEN concat(
                    a.person_array #>> '{person_name}', ', ', a.person_array #>> '{applicator_license}'
                    ) ELSE a.person_array #>> '{person_name}'
                  END, 
                  ', '
                ) treatment_person_name, 
                string_agg (
                  distinct concat(
                    jurisdiction_codes.code_description, 
                    ' ', 
                    (
                      a.jurisdictions_array #>> '{percent_covered}' || '%')
                      ), 
                    ', '
                  ) jurisdiction, 
                  string_agg(
                    distinct invasive_species_agency_codes.code_description, 
                    ', '
                  ) funding_agency 
                  from 
                    array_elements a 
                    left join code_header jurisdiction_code_header on jurisdiction_code_header.code_header_title = 'jurisdiction_code' 
                    and jurisdiction_code_header.valid_to is null 
                    left join code jurisdiction_codes on jurisdiction_codes.code_header_id = jurisdiction_code_header.code_header_id 
                    and a.jurisdictions_array #>> '{jurisdiction_code}' = jurisdiction_codes.code_name
                    left join code_header invasive_species_agency_code_header on invasive_species_agency_code_header.code_header_title = 'invasive_species_agency_code' 
                    and invasive_species_agency_code_header.valid_to is null 
                    left join code invasive_species_agency_codes on invasive_species_agency_codes.code_header_id = invasive_species_agency_code_header.code_header_id 
                    and a.funding_list = invasive_species_agency_codes.code_name 
                  group by 
                    a.activity_incoming_data_id
                ), 
                common_fields as (
                  select 
                    p.jurisdiction, 
                    a.activity_incoming_data_id, 
                    a.activity_id, 
                    a.activity_payload #>> '{short_id}' as short_id,
                    p.project as project_code, 
                    a.activity_payload #>> '{activity_type}' as activity_type,
                    a.activity_payload #>> '{activity_subtype}' as activity_subtype,
                    a.form_status, 
                    to_char(
                      to_timestamp(
                        a.activity_payload #>> '{form_data, activity_data, activity_date_time}', 'YYYY-MM-DD"T"HH24:MI:SS'), 'YYYY-MM-DD HH24:MI:SS') AS activity_date_time,
                        a.activity_payload #>> '{form_data, activity_data, utm_zone}' AS utm_zone,
                        a.activity_payload #>> '{form_data, activity_data, utm_easting}' AS utm_easting,
                        a.activity_payload #>> '{form_data, activity_data, utm_northing}' AS utm_northing,
                        a.activity_payload #>> '{form_data, activity_data, latitude}' AS latitude,
                        a.activity_payload #>> '{form_data, activity_data, longitude}' AS longitude,
                        translate(
                          a.activity_payload #>> '{species_positive}', '[]"', '') as species_positive,
                          jsonb_array_length(
                            a.activity_payload #> '{species_positive}') as positive_species_count,
                            translate(
                              a.activity_payload #>> '{species_negative}', '[]"', '') as species_negative,
                              jsonb_array_length(
                                a.activity_payload #> '{species_negative}') as negative_species_count,
                                a.activity_payload #>> '{form_data, activity_data, reported_area}' AS reported_area_sqm,
                                a.activity_payload #>> '{form_data, activity_type_data, pre_treatment_observation}' AS pre_treatment_observation,
                                p.person_name as observation_person, 
                                p.treatment_person_name as treatment_person, 
                                a.activity_payload #>> '{form_data, activity_data, employer_code}' AS employer_code,
                                employer_codes.code_description as employer_description, 
                                p.funding_agency, 
                                a.activity_payload #>> '{form_data, activity_data, access_description}' AS access_description,
                                a.activity_payload #>> '{form_data, activity_data, location_description}' AS location_description,
                                a.activity_payload #>> '{form_data, activity_data, general_comment}' AS comment,
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
                                (
                                  case when a.media_keys is null then 'No' else 'Yes' end
                                ) as photo, 
                                a.created_timestamp, 
                                a.received_timestamp 
                                FROM 
                                  activity_incoming_data a 
                                  left join array_aggregate p on p.activity_incoming_data_id = a.activity_incoming_data_id 
                                  left join code_header employer_code_header on employer_code_header.code_header_title = 'employer_code' 
                                  and employer_code_header.valid_to is null 
                                  left join code employer_codes on employer_codes.code_header_id = employer_code_header.code_header_id 
                                  and a.activity_payload #>> '{form_data, activity_data, employer_code}' = employer_codes.code_name
                                where 
                                  a.activity_incoming_data_id in (
                                    select 
                                      incoming_data_id 
                                    from 
                                      activity_current
                                  ) 
                                  and a.form_status = 'Submitted' 
                                  and a.deleted_timestamp is null 
                                  and a.activity_subtype = 'Activity_Monitoring_BiocontrolRelease_TerrestrialPlant'
                              ), 
                              biocontrol_release_monitoring_json as (
                                select 
                                  activity_incoming_data_id, 
                                  activity_subtype, 
                                  form_status, 
                                  activity_payload #>> '{form_data, activity_type_data, linked_id}' as linked_treatment_id,
                                  activity_payload #> '{form_data, activity_subtype_data}' as json_data
                                from 
                                  activity_incoming_data 
                                where 
                                  activity_incoming_data_id in (
                                    select 
                                      incoming_data_id 
                                    from 
                                      activity_current
                                  ) 
                                  and form_status = 'Submitted' 
                                  and deleted_timestamp is null 
                                  and activity_subtype = 'Activity_Monitoring_BiocontrolRelease_TerrestrialPlant'
                              ), 
                              agent_location_code as (
                                select 
                                  concat(
                                    activity_incoming_data_id, '-', biocontrol_release_information ->> 'invasive_plant_code', 
                                    '-', biocontrol_release_information ->> 'biological_agent_code'
                                  ) as agent_id, 
                                  convert_string_list_to_array_elements(
                                    biocontrol_release_information ->> 'bio_agent_location_code'
                                  ) bio_agent_location_code 
                                from 
                                  activity_incoming_data, 
                                  jsonb_array_elements(
                                    activity_incoming_data.activity_payload #> '{form_data, activity_subtype_data, Monitoring_BiocontrolRelease_TerrestrialPlant_Information}') biocontrol_release_information
                                    where 
                                      activity_incoming_data_id in (
                                        select 
                                          incoming_data_id 
                                        from 
                                          activity_current
                                      ) 
                                      and form_status = 'Submitted' 
                                      and deleted_timestamp is null 
                                      and activity_subtype = 'Activity_Monitoring_BiocontrolRelease_TerrestrialPlant'
                                  ), 
                                  agent_location_code_agg as (
                                    select 
                                      a.agent_id, 
                                      string_agg(
                                        location_agents_found_codes.code_description, 
                                        ', ' 
                                        order by 
                                          location_agents_found_codes.code_description
                                      ) location_agent_found 
                                    from 
                                      agent_location_code a 
                                      left join code_header location_agents_found_code_header on location_agents_found_code_header.code_header_title = 'location_agents_found_code' 
                                      and location_agents_found_code_header.valid_to is null 
                                      left join code location_agents_found_codes on location_agents_found_codes.code_header_id = location_agents_found_code_header.code_header_id 
                                      and a.bio_agent_location_code = location_agents_found_codes.code_name 
                                    group by 
                                      a.agent_id
                                  ), 
                                  agent_presence_code as (
                                    select 
                                      concat(
                                        activity_incoming_data_id, '-', biocontrol_release_information ->> 'invasive_plant_code', 
                                        '-', biocontrol_release_information ->> 'biological_agent_code'
                                      ) as agent_id, 
                                      convert_string_list_to_array_elements(
                                        biocontrol_release_information ->> 'biological_agent_presence_code'
                                      ) biological_agent_presence_code 
                                    from 
                                      activity_incoming_data, 
                                      jsonb_array_elements(
                                        activity_incoming_data.activity_payload #> '{form_data, activity_subtype_data, Monitoring_BiocontrolRelease_TerrestrialPlant_Information}') biocontrol_release_information
                                        where 
                                          activity_incoming_data_id in (
                                            select 
                                              incoming_data_id 
                                            from 
                                              activity_current
                                          ) 
                                          and form_status = 'Submitted' 
                                          and deleted_timestamp is null 
                                          and activity_subtype = 'Activity_Monitoring_BiocontrolRelease_TerrestrialPlant'
                                      ), 
                                      agent_presence_code_agg as (
                                        select 
                                          a.agent_id, 
                                          string_agg(
                                            biological_agent_presence_codes.code_description, 
                                            ', ' 
                                            order by 
                                              biological_agent_presence_codes.code_description
                                          ) biological_agent_presence 
                                        from 
                                          agent_presence_code a 
                                          left join code_header biological_agent_presence_code_header on biological_agent_presence_code_header.code_header_title = 'biological_agent_presence_code' 
                                          and biological_agent_presence_code_header.valid_to is null 
                                          left join code biological_agent_presence_codes on biological_agent_presence_codes.code_header_id = biological_agent_presence_code_header.code_header_id 
                                          and a.biological_agent_presence_code = biological_agent_presence_codes.code_name 
                                        group by 
                                          a.agent_id
                                      ), 
                                      biocontrol_release_monitoring_array as (
                                        select 
                                          concat(
                                            activity_incoming_data_id, '-', biocontrol_release_information ->> 'invasive_plant_code', 
                                            '-', biocontrol_release_information ->> 'biological_agent_code'
                                          ) as agent_id, 
                                          activity_incoming_data_id, 
                                          biocontrol_release_information ->> 'invasive_plant_code' as invasive_plant_code, 
                                          biocontrol_release_information ->> 'biological_agent_code' as biological_agent_code, 
                                          biocontrol_release_information ->> 'biocontrol_present' as biocontrol_present, 
                                          biocontrol_release_information ->> 'monitoring_type' as monitoring_type, 
                                          biocontrol_release_information ->> 'plant_count' as plant_count, 
                                          biocontrol_release_information ->> 'biocontrol_monitoring_methods_code' as biocontrol_monitoring_methods_code, 
                                          biocontrol_release_information ->> 'start_time' as start_time, 
                                          biocontrol_release_information ->> 'stop_time' as stop_time, 
                                          biocontrol_release_information ->> 'total_bio_agent_quantity_actual' as total_bio_agent_quantity_actual, 
                                          biocontrol_release_information ->> 'total_bio_agent_quantity_estimated' as total_bio_agent_quantity_estimated 
                                        from 
                                          activity_incoming_data, 
                                          jsonb_array_elements(
                                            activity_incoming_data.activity_payload #> '{form_data, activity_subtype_data, Monitoring_BiocontrolRelease_TerrestrialPlant_Information}') biocontrol_release_information
                                            where 
                                              activity_incoming_data_id in (
                                                select 
                                                  incoming_data_id 
                                                from 
                                                  activity_current
                                              ) 
                                              and form_status = 'Submitted' 
                                              and deleted_timestamp is null 
                                              and activity_subtype = 'Activity_Monitoring_BiocontrolRelease_TerrestrialPlant'
                                          ), 
                                          actual_agents as (
                                            select 
                                              concat(
                                                activity_incoming_data_id, '-', biocontrol_release_information ->> 'invasive_plant_code', 
                                                '-', biocontrol_release_information ->> 'biological_agent_code'
                                              ) as agent_id, 
                                              activity_incoming_data_id, 
                                              string_agg(
                                                biological_agent_stage_codes.code_description, 
                                                ', ' 
                                                order by 
                                                  biological_agent_stage_codes.code_description
                                              ) actual_biological_agent_stage, 
                                              string_agg(
                                                actual_biological_agents ->> 'release_quantity', 
                                                ', ' 
                                                order by 
                                                  biological_agent_stage_codes.code_description
                                              ) actual_release_quantity, 
                                              string_agg(
                                                actual_plant_position_codes.code_description, 
                                                ', ' 
                                                order by 
                                                  biological_agent_stage_codes.code_description
                                              ) actual_agent_location, 
                                              string_agg(
                                                actual_agent_location_codes.code_description, 
                                                ', ' 
                                                order by 
                                                  biological_agent_stage_codes.code_description
                                              ) actual_plant_position 
                                            from 
                                              activity_incoming_data, 
                                              jsonb_array_elements(
                                                activity_incoming_data.activity_payload #> '{form_data, activity_subtype_data, Monitoring_BiocontrolRelease_TerrestrialPlant_Information}') biocontrol_release_information
                                                left join lateral jsonb_array_elements(
                                                  biocontrol_release_information #> '{actual_biological_agents}') actual_biological_agents on true
                                                  left join code_header biological_agent_stage_code_header on biological_agent_stage_code_header.code_header_title = 'biological_agent_stage_code' 
                                                  and biological_agent_stage_code_header.valid_to is null 
                                                  left join code biological_agent_stage_codes on biological_agent_stage_codes.code_header_id = biological_agent_stage_code_header.code_header_id 
                                                  and actual_biological_agents ->> 'biological_agent_stage_code' = biological_agent_stage_codes.code_name 
                                                  left join code_header actual_plant_position_code_header on actual_plant_position_code_header.code_header_title = 'plant_position_code' 
                                                  and actual_plant_position_code_header.valid_to is null 
                                                  left join code actual_plant_position_codes on actual_plant_position_codes.code_header_id = actual_plant_position_code_header.code_header_id 
                                                  and actual_biological_agents ->> 'plant_position' = actual_plant_position_codes.code_name 
                                                  left join code_header actual_agent_location_code_header on actual_agent_location_code_header.code_header_title = 'agent_location_code' 
                                                  and actual_agent_location_code_header.valid_to is null 
                                                  left join code actual_agent_location_codes on actual_agent_location_codes.code_header_id = actual_agent_location_code_header.code_header_id 
                                                  and actual_biological_agents ->> 'agent_location' = actual_agent_location_codes.code_name 
                                                  where 
                                                    activity_incoming_data_id in (
                                                      select 
                                                        incoming_data_id 
                                                      from 
                                                        activity_current
                                                    ) 
                                                    and form_status = 'Submitted' 
                                                    and deleted_timestamp is null 
                                                    and activity_subtype = 'Activity_Monitoring_BiocontrolRelease_TerrestrialPlant' 
                                                  group by 
                                                    activity_incoming_data_id, 
                                                    concat(
                                                      activity_incoming_data_id, '-', biocontrol_release_information ->> 'invasive_plant_code', 
                                                      '-', biocontrol_release_information ->> 'biological_agent_code'
                                                    )
                                                ), 
                                                estimated_agents as (
                                                  select 
                                                    concat(
                                                      activity_incoming_data_id, '-', biocontrol_release_information ->> 'invasive_plant_code', 
                                                      '-', biocontrol_release_information ->> 'biological_agent_code'
                                                    ) as agent_id, 
                                                    activity_incoming_data_id, 
                                                    string_agg(
                                                      biological_agent_stage_codes.code_description, 
                                                      ', ' 
                                                      order by 
                                                        biological_agent_stage_codes.code_description
                                                    ) estimated_biological_agent_stage, 
                                                    string_agg(
                                                      estimated_biological_agents ->> 'release_quantity', 
                                                      ', ' 
                                                      order by 
                                                        biological_agent_stage_codes.code_description
                                                    ) estimated_release_quantity, 
                                                    string_agg(
                                                      estimated_plant_position_codes.code_description, 
                                                      ', ' 
                                                      order by 
                                                        biological_agent_stage_codes.code_description
                                                    ) estimated_agent_location, 
                                                    string_agg(
                                                      estimated_agent_location_codes.code_description, 
                                                      ', ' 
                                                      order by 
                                                        biological_agent_stage_codes.code_description
                                                    ) estimated_plant_position 
                                                  from 
                                                    activity_incoming_data, 
                                                    jsonb_array_elements(
                                                      activity_incoming_data.activity_payload #> '{form_data, activity_subtype_data, Monitoring_BiocontrolRelease_TerrestrialPlant_Information}') biocontrol_release_information
                                                      left join lateral jsonb_array_elements(
                                                        biocontrol_release_information #> '{estimated_biological_agents}') estimated_biological_agents on true
                                                        left join code_header biological_agent_stage_code_header on biological_agent_stage_code_header.code_header_title = 'biological_agent_stage_code' 
                                                        and biological_agent_stage_code_header.valid_to is null 
                                                        left join code biological_agent_stage_codes on biological_agent_stage_codes.code_header_id = biological_agent_stage_code_header.code_header_id 
                                                        and estimated_biological_agents ->> 'biological_agent_stage_code' = biological_agent_stage_codes.code_name 
                                                        left join code_header estimated_plant_position_code_header on estimated_plant_position_code_header.code_header_title = 'plant_position_code' 
                                                        and estimated_plant_position_code_header.valid_to is null 
                                                        left join code estimated_plant_position_codes on estimated_plant_position_codes.code_header_id = estimated_plant_position_code_header.code_header_id 
                                                        and estimated_biological_agents ->> 'plant_position' = estimated_plant_position_codes.code_name 
                                                        left join code_header estimated_agent_location_code_header on estimated_agent_location_code_header.code_header_title = 'agent_location_code' 
                                                        and estimated_agent_location_code_header.valid_to is null 
                                                        left join code estimated_agent_location_codes on estimated_agent_location_codes.code_header_id = estimated_agent_location_code_header.code_header_id 
                                                        and estimated_biological_agents ->> 'agent_location' = estimated_agent_location_codes.code_name 
                                                        where 
                                                          activity_incoming_data_id in (
                                                            select 
                                                              incoming_data_id 
                                                            from 
                                                              activity_current
                                                          ) 
                                                          and form_status = 'Submitted' 
                                                          and deleted_timestamp is null 
                                                          and activity_subtype = 'Activity_Monitoring_BiocontrolRelease_TerrestrialPlant' 
                                                        group by 
                                                          activity_incoming_data_id, 
                                                          concat(
                                                            activity_incoming_data_id, '-', biocontrol_release_information ->> 'invasive_plant_code', 
                                                            '-', biocontrol_release_information ->> 'biological_agent_code'
                                                          )
                                                      ), 
                                                      monitoring_array_select as (
                                                        select 
                                                          r.activity_incoming_data_id, 
                                                          invasive_plant_codes.code_description as invasive_plant, 
                                                          biological_agent_codes.code_description as biological_agent, 
                                                          r.biocontrol_present, 
                                                          p.biological_agent_presence, 
                                                          l.location_agent_found, 
                                                          r.monitoring_type, 
                                                          r.plant_count, 
                                                          biocontrol_monitoring_methods_codes.code_description as monitoring_method, 
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
                                                        from 
                                                          biocontrol_release_monitoring_array r 
                                                          left join actual_agents a on a.agent_id = r.agent_id 
                                                          left join estimated_agents e on e.agent_id = r.agent_id 
                                                          left join agent_location_code_agg l on l.agent_id = r.agent_id 
                                                          left join agent_presence_code_agg p on p.agent_id = r.agent_id 
                                                          left join code_header invasive_plant_code_header on invasive_plant_code_header.code_header_title = 'invasive_plant_code' 
                                                          and invasive_plant_code_header.valid_to is null 
                                                          left join code invasive_plant_codes on invasive_plant_codes.code_header_id = invasive_plant_code_header.code_header_id 
                                                          and r.invasive_plant_code = invasive_plant_codes.code_name 
                                                          left join code_header biological_agent_code_header on biological_agent_code_header.code_header_title = 'biological_agent_code' 
                                                          and biological_agent_code_header.valid_to is null 
                                                          left join code biological_agent_codes on biological_agent_codes.code_header_id = biological_agent_code_header.code_header_id 
                                                          and r.biological_agent_code = biological_agent_codes.code_name 
                                                          left join code_header biocontrol_monitoring_methods_code_header on biocontrol_monitoring_methods_code_header.code_header_title = 'biocontrol_monitoring_methods_code' 
                                                          and biocontrol_monitoring_methods_code_header.valid_to is null 
                                                          left join code biocontrol_monitoring_methods_codes on biocontrol_monitoring_methods_codes.code_header_id = biocontrol_monitoring_methods_code_header.code_header_id 
                                                          and r.biocontrol_monitoring_methods_code = biocontrol_monitoring_methods_codes.code_name
                                                      ), 
                                                      biocontrol_release_monitoring_select as (
                                                        select 
                                                          b.activity_incoming_data_id, 
                                                          b.linked_treatment_id, 
                                                          b.json_data #>> '{Weather_Conditions, temperature}' as temperature,
                                                          b.json_data #>> '{Weather_Conditions, cloud_cover_code}' as cloud_cover_code,
                                                          cloud_cover_codes.code_description as cloud_cover, 
                                                          b.json_data #>> '{Weather_Conditions, precipitation_code}' as precipitation_code,
                                                          precipitation_codes.code_description as precipitation, 
                                                          b.json_data #>> '{Weather_Conditions, wind_speed}' as wind_speed,
                                                          b.json_data #>> '{Weather_Conditions, wind_direction_code}' as wind_aspect,
                                                          b.json_data #>> '{Weather_Conditions, weather_comments}' as weather_comments,
                                                          b.json_data #>> '{Microsite_Conditions, mesoslope_position_code}' as mesoslope_position_code,
                                                          mesoslope_position_codes.code_description as mesoslope_position, 
                                                          b.json_data #>> '{Microsite_Conditions, site_surface_shape_code}' as site_surface_shape_code,
                                                          site_surface_shape_codes.code_description as site_surface_shape, 
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
                                                          b.json_data #>> '{Target_Plant_Phenology, phenology_details_recorded}' as phenology_details_recorded,
                                                          translate(
                                                            b.json_data #>> '{Target_Plant_Phenology, target_plant_heights}', '[{}]', '') as target_plant_heights_cm,
                                                            b.json_data #>> '{Target_Plant_Phenology, winter_dormant}' as winter_dormant,
                                                            b.json_data #>> '{Target_Plant_Phenology, seedlings}' as seedlings,
                                                            b.json_data #>> '{Target_Plant_Phenology, rosettes}' as rosettes,
                                                            b.json_data #>> '{Target_Plant_Phenology, bolts}' as bolts,
                                                            b.json_data #>> '{Target_Plant_Phenology, flowering}' as flowering,
                                                            b.json_data #>> '{Target_Plant_Phenology, seeds_forming}' as seeds_forming,
                                                            b.json_data #>> '{Target_Plant_Phenology, senescent}' as senescent,
                                                            b.json_data #>> '{Spread_Results, spread_details_recorded}' as spread_details_recorded,
                                                            b.json_data #>> '{Spread_Results, agent_density}' as agent_density,
                                                            b.json_data #>> '{Spread_Results, plant_attack}' as plant_attack,
                                                            b.json_data #>> '{Spread_Results, max_spread_distance}' as max_spread_distance,
                                                            b.json_data #>> '{Spread_Results, max_spread_aspect}' as max_spread_aspect
                                                            from 
                                                              biocontrol_release_monitoring_json b 
                                                              join monitoring_array_select a on a.activity_incoming_data_id = b.activity_incoming_data_id 
                                                              left join code_header cloud_cover_code_header on cloud_cover_code_header.code_header_title = 'cloud_cover_code' 
                                                              and cloud_cover_code_header.valid_to is null 
                                                              left join code cloud_cover_codes on cloud_cover_codes.code_header_id = cloud_cover_code_header.code_header_id 
                                                              and b.json_data #>> '{Weather_Conditions, cloud_cover_code}' = cloud_cover_codes.code_name
                                                              left join code_header precipitation_code_header on precipitation_code_header.code_header_title = 'precipitation_code' 
                                                              and precipitation_code_header.valid_to is null 
                                                              left join code precipitation_codes on precipitation_codes.code_header_id = precipitation_code_header.code_header_id 
                                                              and b.json_data #>> '{Weather_Conditions, precipitation_code}' = precipitation_codes.code_name
                                                              left join code_header mesoslope_position_code_header on mesoslope_position_code_header.code_header_title = 'mesoslope_position_code' 
                                                              and mesoslope_position_code_header.valid_to is null 
                                                              left join code mesoslope_position_codes on mesoslope_position_codes.code_header_id = mesoslope_position_code_header.code_header_id 
                                                              and b.json_data #>> '{Microsite_Conditions, mesoslope_position_code}' = mesoslope_position_codes.code_name
                                                              left join code_header site_surface_shape_code_header on site_surface_shape_code_header.code_header_title = 'site_surface_shape_code' 
                                                              and site_surface_shape_code_header.valid_to is null 
                                                              left join code site_surface_shape_codes on site_surface_shape_codes.code_header_id = site_surface_shape_code_header.code_header_id 
                                                              and b.json_data #>> '{Microsite_Conditions, site_surface_shape_code}' = site_surface_shape_codes.code_name
                                                              ) 
                                                        SELECT 
                                                          c.activity_incoming_data_id, 
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
                                                          c.employer_description as employer, 
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
                                                          b.wind_aspect as wind_direction, 
                                                          b.weather_comments, 
                                                          b.mesoslope_position, 
                                                          b.site_surface_shape, 
                                                          b.invasive_plant, 
                                                          b.biological_agent, 
                                                          case when b.biocontrol_present = 'true' then 'Yes' else 'No' end as biocontrol_present, 
                                                          b.biological_agent_presence, 
                                                          b.monitoring_type, 
                                                          b.plant_count, 
                                                          b.monitoring_method, 
                                                          to_char(
                                                            to_timestamp(
                                                              b.start_time, 'YYYY-MM-DD"T"HH24:MI:SS'
                                                            ), 
                                                            'YYYY-MM-DD HH24:MI:SS'
                                                          ) as start_time, 
                                                          to_char(
                                                            to_timestamp(
                                                              b.stop_time, 'YYYY-MM-DD"T"HH24:MI:SS'
                                                            ), 
                                                            'YYYY-MM-DD HH24:MI:SS'
                                                          ) as stop_time, 
                                                          b.actual_biological_agent_stage, 
                                                          b.actual_release_quantity as actual_agent_count, 
                                                          b.estimated_biological_agent_stage, 
                                                          b.estimated_release_quantity as estimated_agent_count, 
                                                          b.total_bio_agent_quantity_actual as total_agent_quantity_actual, 
                                                          b.total_bio_agent_quantity_estimated as total_agent_quantity_estimated, 
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
                                                          ST_AsText(c.geog) as geography 
                                                        FROM 
                                                          common_fields c 
                                                          join biocontrol_release_monitoring_select b on b.activity_incoming_data_id = c.activity_incoming_data_id
                                                      );
 
-- biocontrol release summary
                                                     
create 
or replace view invasivesbc.biocontrol_release_summary as (
  with array_elements as (
    select 
      activity_incoming_data_id, 
      activity_subtype, 
      jurisdictions_array, 
      project_code_array, 
      person_array, 
      funding_list 
    from 
      activity_incoming_data 
      left join jsonb_array_elements(
        activity_payload #> '{form_data, activity_data, jurisdictions}') jurisdictions_array on true
        left join jsonb_array_elements(
          activity_payload #> '{form_data, activity_data, project_code}') project_code_array on true
          left join jsonb_array_elements(
            activity_payload #> '{form_data, activity_type_data, activity_persons}') person_array on true
            left join convert_string_list_to_array_elements(
              activity_payload #>> '{form_data, activity_data, invasive_species_agency_code}') funding_list on true
              where 
                activity_incoming_data_id in (
                  select 
                    incoming_data_id 
                  from 
                    activity_current
                ) 
                and form_status = 'Submitted' 
                and deleted_timestamp is null 
                and activity_subtype = 'Activity_Biocontrol_Release'
            ), 
            array_aggregate as (
              select 
                a.activity_incoming_data_id, 
                string_agg (
                  distinct a.project_code_array #>> '{description}',
                  ', '
                ) project, 
                string_agg (
                  distinct a.person_array #>> '{person_name}',
                  ', '
                ) person_name, 
                string_agg(
                  distinct CASE WHEN a.person_array #>> '{applicator_license}' IS NOT NULL
                  THEN concat(
                    a.person_array #>> '{person_name}', ', ', a.person_array #>> '{applicator_license}'
                    ) ELSE a.person_array #>> '{person_name}'
                  END, 
                  ', '
                ) treatment_person_name, 
                string_agg (
                  distinct concat(
                    jurisdiction_codes.code_description, 
                    ' ', 
                    (
                      a.jurisdictions_array #>> '{percent_covered}' || '%')
                      ), 
                    ', '
                  ) jurisdiction, 
                  string_agg(
                    distinct invasive_species_agency_codes.code_description, 
                    ', '
                  ) funding_agency 
                  from 
                    array_elements a 
                    left join code_header jurisdiction_code_header on jurisdiction_code_header.code_header_title = 'jurisdiction_code' 
                    and jurisdiction_code_header.valid_to is null 
                    left join code jurisdiction_codes on jurisdiction_codes.code_header_id = jurisdiction_code_header.code_header_id 
                    and a.jurisdictions_array #>> '{jurisdiction_code}' = jurisdiction_codes.code_name
                    left join code_header invasive_species_agency_code_header on invasive_species_agency_code_header.code_header_title = 'invasive_species_agency_code' 
                    and invasive_species_agency_code_header.valid_to is null 
                    left join code invasive_species_agency_codes on invasive_species_agency_codes.code_header_id = invasive_species_agency_code_header.code_header_id 
                    and a.funding_list = invasive_species_agency_codes.code_name 
                  group by 
                    a.activity_incoming_data_id
                ), 
                common_fields as (
                  select 
                    p.jurisdiction, 
                    a.activity_incoming_data_id, 
                    a.activity_id, 
                    a.activity_payload #>> '{short_id}' as short_id,
                    p.project as project_code, 
                    a.activity_payload #>> '{activity_type}' as activity_type,
                    a.activity_payload #>> '{activity_subtype}' as activity_subtype,
                    a.form_status, 
                    to_char(
                      to_timestamp(
                        a.activity_payload #>> '{form_data, activity_data, activity_date_time}', 'YYYY-MM-DD"T"HH24:MI:SS'), 'YYYY-MM-DD HH24:MI:SS') AS activity_date_time,
                        a.activity_payload #>> '{form_data, activity_data, utm_zone}' AS utm_zone,
                        a.activity_payload #>> '{form_data, activity_data, utm_easting}' AS utm_easting,
                        a.activity_payload #>> '{form_data, activity_data, utm_northing}' AS utm_northing,
                        a.activity_payload #>> '{form_data, activity_data, latitude}' AS latitude,
                        a.activity_payload #>> '{form_data, activity_data, longitude}' AS longitude,
                        translate(
                          a.activity_payload #>> '{species_positive}', '[]"', '') as species_positive,
                          jsonb_array_length(
                            a.activity_payload #> '{species_positive}') as positive_species_count,
                            translate(
                              a.activity_payload #>> '{species_negative}', '[]"', '') as species_negative,
                              jsonb_array_length(
                                a.activity_payload #> '{species_negative}') as negative_species_count,
                                a.activity_payload #>> '{form_data, activity_data, reported_area}' AS reported_area_sqm,
                                a.activity_payload #>> '{form_data, activity_type_data, pre_treatment_observation}' AS pre_treatment_observation,
                                p.person_name as observation_person, 
                                p.treatment_person_name as treatment_person, 
                                a.activity_payload #>> '{form_data, activity_data, employer_code}' AS employer_code,
                                employer_codes.code_description as employer_description, 
                                p.funding_agency, 
                                a.activity_payload #>> '{form_data, activity_data, access_description}' AS access_description,
                                a.activity_payload #>> '{form_data, activity_data, location_description}' AS location_description,
                                a.activity_payload #>> '{form_data, activity_data, general_comment}' AS comment,
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
                                (
                                  case when a.media_keys is null then 'No' else 'Yes' end
                                ) as photo, 
                                a.created_timestamp, 
                                a.received_timestamp 
                                FROM 
                                  activity_incoming_data a 
                                  left join array_aggregate p on p.activity_incoming_data_id = a.activity_incoming_data_id 
                                  left join code_header employer_code_header on employer_code_header.code_header_title = 'employer_code' 
                                  and employer_code_header.valid_to is null 
                                  left join code employer_codes on employer_codes.code_header_id = employer_code_header.code_header_id 
                                  and a.activity_payload #>> '{form_data, activity_data, employer_code}' = employer_codes.code_name
                                where 
                                  a.activity_incoming_data_id in (
                                    select 
                                      incoming_data_id 
                                    from 
                                      activity_current
                                  ) 
                                  and a.form_status = 'Submitted' 
                                  and a.deleted_timestamp is null 
                                  and a.activity_subtype = 'Activity_Biocontrol_Release'
                              ), 
                              biocontrol_release_json as (
                                select 
                                  activity_incoming_data_id, 
                                  activity_subtype, 
                                  form_status, 
                                  activity_payload #>> '{form_data, activity_type_data, linked_id}' as linked_treatment_id,
                                  activity_payload #> '{form_data, activity_subtype_data}' as json_data
                                from 
                                  activity_incoming_data 
                                where 
                                  activity_incoming_data_id in (
                                    select 
                                      incoming_data_id 
                                    from 
                                      activity_current
                                  ) 
                                  and form_status = 'Submitted' 
                                  and deleted_timestamp is null 
                                  and activity_subtype = 'Activity_Biocontrol_Release'
                              ), 
                              biocontrol_release_json_array as (
                                select 
                                  concat(
                                    activity_incoming_data_id, '-', biocontrol_release_information ->> 'invasive_plant_code', 
                                    '-', biocontrol_release_information ->> 'biological_agent_code'
                                  ) as agent_id, 
                                  activity_incoming_data_id, 
                                  biocontrol_release_information ->> 'invasive_plant_code' as invasive_plant_code, 
                                  biocontrol_release_information ->> 'biological_agent_code' as biological_agent_code, 
                                  biocontrol_release_information ->> 'mortality' as mortality, 
                                  biocontrol_release_information ->> 'agent_source' as agent_source, 
                                  biocontrol_release_information ->> 'linear_segment' as linear_segment, 
                                  biocontrol_release_information ->> 'collection_date' as collection_date, 
                                  biocontrol_release_information ->> 'plant_collected_from' as plant_collected_from, 
                                  biocontrol_release_information ->> 'plant_collected_from_unlisted' as plant_collected_from_unlisted, 
                                  biocontrol_release_information ->> 'total_bio_agent_quantity_actual' as total_bio_agent_quantity_actual, 
                                  biocontrol_release_information ->> 'total_bio_agent_quantity_estimated' as total_bio_agent_quantity_estimated 
                                from 
                                  activity_incoming_data, 
                                  jsonb_array_elements(
                                    activity_incoming_data.activity_payload #> '{form_data, activity_subtype_data, Biocontrol_Release_Information}') biocontrol_release_information
                                    where 
                                      activity_incoming_data_id in (
                                        select 
                                          incoming_data_id 
                                        from 
                                          activity_current
                                      ) 
                                      and form_status = 'Submitted' 
                                      and deleted_timestamp is null 
                                      and activity_subtype = 'Activity_Biocontrol_Release'
                                  ), 
                                  actual_agents as (
                                    select 
                                      concat(
                                        activity_incoming_data_id, '-', biocontrol_release_information ->> 'invasive_plant_code', 
                                        '-', biocontrol_release_information ->> 'biological_agent_code'
                                      ) as agent_id, 
                                      activity_incoming_data_id, 
                                      string_agg(
                                        biological_agent_stage_codes.code_description, 
                                        ', ' 
                                        order by 
                                          biological_agent_stage_codes.code_description
                                      ) actual_biological_agent_stage, 
                                      string_agg(
                                        actual_biological_agents ->> 'release_quantity', 
                                        ', ' 
                                        order by 
                                          biological_agent_stage_codes.code_description
                                      ) actual_release_quantity 
                                    from 
                                      activity_incoming_data, 
                                      jsonb_array_elements(
                                        activity_incoming_data.activity_payload #> '{form_data, activity_subtype_data, Biocontrol_Release_Information}') biocontrol_release_information
                                        left join lateral jsonb_array_elements(
                                          biocontrol_release_information #> '{actual_biological_agents}') actual_biological_agents on true
                                          left join code_header biological_agent_stage_code_header on biological_agent_stage_code_header.code_header_title = 'biological_agent_stage_code' 
                                          and biological_agent_stage_code_header.valid_to is null 
                                          left join code biological_agent_stage_codes on biological_agent_stage_codes.code_header_id = biological_agent_stage_code_header.code_header_id 
                                          and actual_biological_agents ->> 'biological_agent_stage_code' = biological_agent_stage_codes.code_name 
                                          where 
                                            activity_incoming_data_id in (
                                              select 
                                                incoming_data_id 
                                              from 
                                                activity_current
                                            ) 
                                            and form_status = 'Submitted' 
                                            and deleted_timestamp is null 
                                            and activity_subtype = 'Activity_Biocontrol_Release' 
                                          group by 
                                            activity_incoming_data_id, 
                                            concat(
                                              activity_incoming_data_id, '-', biocontrol_release_information ->> 'invasive_plant_code', 
                                              '-', biocontrol_release_information ->> 'biological_agent_code'
                                            )
                                        ), 
                                        estimated_agents as (
                                          select 
                                            concat(
                                              activity_incoming_data_id, '-', biocontrol_release_information ->> 'invasive_plant_code', 
                                              '-', biocontrol_release_information ->> 'biological_agent_code'
                                            ) as agent_id, 
                                            activity_incoming_data_id, 
                                            string_agg(
                                              biological_agent_stage_codes.code_description, 
                                              ', ' 
                                              order by 
                                                biological_agent_stage_codes.code_description
                                            ) estimated_biological_agent_stage, 
                                            string_agg(
                                              estimated_biological_agents ->> 'release_quantity', 
                                              ', ' 
                                              order by 
                                                biological_agent_stage_codes.code_description
                                            ) estimated_release_quantity 
                                          from 
                                            activity_incoming_data, 
                                            jsonb_array_elements(
                                              activity_incoming_data.activity_payload #> '{form_data, activity_subtype_data, Biocontrol_Release_Information}') biocontrol_release_information
                                              left join lateral jsonb_array_elements(
                                                biocontrol_release_information #> '{estimated_biological_agents}') estimated_biological_agents on true
                                                left join code_header biological_agent_stage_code_header on biological_agent_stage_code_header.code_header_title = 'biological_agent_stage_code' 
                                                and biological_agent_stage_code_header.valid_to is null 
                                                left join code biological_agent_stage_codes on biological_agent_stage_codes.code_header_id = biological_agent_stage_code_header.code_header_id 
                                                and estimated_biological_agents ->> 'biological_agent_stage_code' = biological_agent_stage_codes.code_name 
                                                where 
                                                  activity_incoming_data_id in (
                                                    select 
                                                      incoming_data_id 
                                                    from 
                                                      activity_current
                                                  ) 
                                                  and form_status = 'Submitted' 
                                                  and deleted_timestamp is null 
                                                  and activity_subtype = 'Activity_Biocontrol_Release' 
                                                group by 
                                                  activity_incoming_data_id, 
                                                  concat(
                                                    activity_incoming_data_id, '-', biocontrol_release_information ->> 'invasive_plant_code', 
                                                    '-', biocontrol_release_information ->> 'biological_agent_code'
                                                  )
                                              ), 
                                              release_array_select as (
                                                select 
                                                  r.activity_incoming_data_id, 
                                                  invasive_plant_codes.code_description as invasive_plant, 
                                                  biological_agent_codes.code_description as biological_agent, 
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
                                                from 
                                                  biocontrol_release_json_array r 
                                                  left join actual_agents a on a.agent_id = r.agent_id 
                                                  left join estimated_agents e on e.agent_id = r.agent_id 
                                                  left join code_header invasive_plant_code_header on invasive_plant_code_header.code_header_title = 'invasive_plant_code' 
                                                  and invasive_plant_code_header.valid_to is null 
                                                  left join code invasive_plant_codes on invasive_plant_codes.code_header_id = invasive_plant_code_header.code_header_id 
                                                  and r.invasive_plant_code = invasive_plant_codes.code_name 
                                                  left join code_header biological_agent_code_header on biological_agent_code_header.code_header_title = 'biological_agent_code' 
                                                  and biological_agent_code_header.valid_to is null 
                                                  left join code biological_agent_codes on biological_agent_codes.code_header_id = biological_agent_code_header.code_header_id 
                                                  and r.biological_agent_code = biological_agent_codes.code_name
                                              ), 
                                              biocontrol_release_json_select as (
                                                select 
                                                  b.activity_incoming_data_id, 
                                                  b.linked_treatment_id, 
                                                  b.json_data #>> '{Weather_Conditions, temperature}' as temperature,
                                                  b.json_data #>> '{Weather_Conditions, cloud_cover_code}' as cloud_cover_code,
                                                  cloud_cover_codes.code_description as cloud_cover, 
                                                  b.json_data #>> '{Weather_Conditions, precipitation_code}' as precipitation_code,
                                                  precipitation_codes.code_description as precipitation, 
                                                  b.json_data #>> '{Weather_Conditions, wind_speed}' as wind_speed,
                                                  b.json_data #>> '{Weather_Conditions, wind_direction_code}' as wind_aspect,
                                                  b.json_data #>> '{Weather_Conditions, weather_comments}' as weather_comments,
                                                  b.json_data #>> '{Microsite_Conditions, mesoslope_position_code}' as mesoslope_position_code,
                                                  mesoslope_position_codes.code_description as mesoslope_position, 
                                                  b.json_data #>> '{Microsite_Conditions, site_surface_shape_code}' as site_surface_shape_code,
                                                  site_surface_shape_codes.code_description as site_surface_shape, 
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
                                                  a.total_bio_agent_quantity_actual as total_release_quantity_actual, 
                                                  a.total_bio_agent_quantity_estimated as total_release_quantity_estimated 
                                                from 
                                                  biocontrol_release_json b 
                                                  join release_array_select a on a.activity_incoming_data_id = b.activity_incoming_data_id 
                                                  left join code_header cloud_cover_code_header on cloud_cover_code_header.code_header_title = 'cloud_cover_code' 
                                                  and cloud_cover_code_header.valid_to is null 
                                                  left join code cloud_cover_codes on cloud_cover_codes.code_header_id = cloud_cover_code_header.code_header_id 
                                                  and b.json_data #>> '{Weather_Conditions, cloud_cover_code}' = cloud_cover_codes.code_name
                                                  left join code_header precipitation_code_header on precipitation_code_header.code_header_title = 'precipitation_code' 
                                                  and precipitation_code_header.valid_to is null 
                                                  left join code precipitation_codes on precipitation_codes.code_header_id = precipitation_code_header.code_header_id 
                                                  and b.json_data #>> '{Weather_Conditions, precipitation_code}' = precipitation_codes.code_name
                                                  left join code_header mesoslope_position_code_header on mesoslope_position_code_header.code_header_title = 'mesoslope_position_code' 
                                                  and mesoslope_position_code_header.valid_to is null 
                                                  left join code mesoslope_position_codes on mesoslope_position_codes.code_header_id = mesoslope_position_code_header.code_header_id 
                                                  and b.json_data #>> '{Microsite_Conditions, mesoslope_position_code}' = mesoslope_position_codes.code_name
                                                  left join code_header site_surface_shape_code_header on site_surface_shape_code_header.code_header_title = 'site_surface_shape_code' 
                                                  and site_surface_shape_code_header.valid_to is null 
                                                  left join code site_surface_shape_codes on site_surface_shape_codes.code_header_id = site_surface_shape_code_header.code_header_id 
                                                  and b.json_data #>> '{Microsite_Conditions, site_surface_shape_code}' = site_surface_shape_codes.code_name
                                                  ) 
                                              SELECT 
                                                c.activity_incoming_data_id, 
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
                                                c.employer_description as employer, 
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
                                                b.wind_aspect as wind_direction, 
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
                                                ST_AsText(c.geog) as geography 
                                              FROM 
                                                common_fields c 
                                                join biocontrol_release_json_select b on b.activity_incoming_data_id = c.activity_incoming_data_id
                                            );
  
`
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
  
  set search_path=invasivesbc,public;

  `);
}

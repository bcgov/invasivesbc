import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(
    `
    set 
    search_path = invasivesbc, 
    public;
   
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
                      jurisdiction_codes.code_description, 
                      ', ', 
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
                      a.activity_payload #>> '{form_data, activity_data, activity_date_time}', 'YYYY-MM-DD HH24:MI:SS'), 'YYYY-MM-DD HH24:MI:SS') AS activity_date_time,
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
                           
                           
  drop 
    view if exists biocontrol_collection_summary;
  drop 
    view if exists biocontrol_dispersal_monitoring_summary;
  drop 
    view if exists biocontrol_release_monitoring_summary;
  drop 
    view if exists biocontrol_release_summary;
  create 
  or replace view invasivesbc.biocontrol_collection_summary as (
    with biocontrol_collection_json as (
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
                            b.start_time, 'YYYY-MM-DD HH24:MI:SS'
                          ), 
                          'YYYY-MM-DD HH24:MI:SS'
                        ) as start_time, 
                        to_char(
                          to_timestamp(
                            b.stop_time, 'YYYY-MM-DD HH24:MI:SS'
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
                        invasivesbc.common_summary c 
                        join biocontrol_collection_monitoring_select b on b.activity_incoming_data_id = c.activity_incoming_data_id 
                      where 
                        c.activity_subtype = 'Activity_Biocontrol_Collection' 
                        and c.activity_incoming_data_id in (
                          select 
                            incoming_data_id 
                          from 
                            activity_current
                        ) 
                        and c.form_status = 'Submitted'
                    );
  create 
  or replace view invasivesbc.biocontrol_dispersal_monitoring_summary as (
    with biocontrol_dispersal_monitoring_json as (
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
            and activity_subtype = 'Activity_Monitoring_BiocontrolDispersal_TerrestrialPlant' 
            and form_status = 'Submitted'
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
                and activity_subtype = 'Activity_Monitoring_BiocontrolDispersal_TerrestrialPlant' 
                and form_status = 'Submitted'
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
                    and activity_subtype = 'Activity_Monitoring_BiocontrolDispersal_TerrestrialPlant' 
                    and form_status = 'Submitted'
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
                                  where 
                                    b.activity_incoming_data_id in (
                                      select 
                                        incoming_data_id 
                                      from 
                                        activity_current
                                    ) 
                                    and activity_subtype = 'Activity_Monitoring_BiocontrolDispersal_TerrestrialPlant'
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
                                    b.start_time, 'YYYY-MM-DD HH24:MI:SS'
                                  ), 
                                  'YYYY-MM-DD HH24:MI:SS'
                                ) as start_time, 
                                to_char(
                                  to_timestamp(
                                    b.stop_time, 'YYYY-MM-DD HH24:MI:SS'
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
                                invasivesbc.common_summary c 
                                join biocontrol_release_monitoring_select b on b.activity_incoming_data_id = c.activity_incoming_data_id 
                              where 
                                c.activity_subtype = 'Activity_Monitoring_BiocontrolDispersal_TerrestrialPlant' 
                                and c.activity_incoming_data_id in (
                                  select 
                                    incoming_data_id 
                                  from 
                                    activity_current
                                ) 
                                and c.form_status = 'Submitted'
                            );
  create 
  or replace view invasivesbc.biocontrol_release_monitoring_summary as (
    with biocontrol_release_monitoring_json as (
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
            and activity_subtype = 'Activity_Monitoring_BiocontrolRelease_TerrestrialPlant' 
            and form_status = 'Submitted'
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
                and activity_subtype = 'Activity_Monitoring_BiocontrolRelease_TerrestrialPlant' 
                and form_status = 'Submitted'
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
                    and activity_subtype = 'Activity_Monitoring_BiocontrolRelease_TerrestrialPlant' 
                    and form_status = 'Submitted'
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
                                    b.start_time, 'YYYY-MM-DD HH24:MI:SS'
                                  ), 
                                  'YYYY-MM-DD HH24:MI:SS'
                                ) as start_time, 
                                to_char(
                                  to_timestamp(
                                    b.stop_time, 'YYYY-MM-DD HH24:MI:SS'
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
                                invasivesbc.common_summary c 
                                join biocontrol_release_monitoring_select b on b.activity_incoming_data_id = c.activity_incoming_data_id 
                              where 
                                c.activity_subtype = 'Activity_Monitoring_BiocontrolRelease_TerrestrialPlant' 
                                and c.activity_incoming_data_id in (
                                  select 
                                    incoming_data_id 
                                  from 
                                    activity_current
                                ) 
                                and c.form_status = 'Submitted'
                            );
  create 
  or replace view invasivesbc.biocontrol_release_summary as (
    with biocontrol_release_json as (
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
                      invasivesbc.common_summary c 
                      join biocontrol_release_json_select b on b.activity_incoming_data_id = c.activity_incoming_data_id 
                    where 
                      c.activity_subtype = 'Activity_Biocontrol_Release' 
                      and c.activity_incoming_data_id in (
                        select 
                          incoming_data_id 
                        from 
                          activity_current
                      ) 
                      and c.form_status = 'Submitted'
                  );
`
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`

  set search_path='invasivesbc';



  `);
}

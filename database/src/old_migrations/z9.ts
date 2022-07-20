import Knex from 'knex';

const DB_SCHEMA = process.env.DB_SCHEMA || 'invasivesbc';
const NODE_ENV = process.env.NODE_ENV;

export const create_all_summary_views = `

set 
  search_path = invasivesbc, 
  public;
drop 
  trigger if exists activity_deleted on activity_incoming_data;
drop 
  view if exists common_summary cascade;
CREATE 
OR REPLACE VIEW invasivesbc.common_summary as (
    with jurisdiction_array as (
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
          ), 
          project_array as (
            select 
              activity_incoming_data_id, 
              activity_subtype, 
              jsonb_array_elements(
                activity_payload #> '{form_data, activity_data, project_code}') as json_array
                from 
                  activity_incoming_data 
                where 
                  activity_incoming_data_id in (
                    select 
                      incoming_data_id 
                    from 
                      activity_current
                  )
              ), 
              project_list as (
                select 
                  p.activity_incoming_data_id, 
                  string_agg (
                    p.json_array #>> '{description}', 
                    ', ' 
                    order by 
                      p.json_array #>> '{description}'
                      ) project 
                from 
                  project_array p 
                group by 
                  p.activity_incoming_data_id
              ), 
              person_array as (
                select 
                  activity_incoming_data_id, 
                  activity_subtype, 
                  jsonb_array_elements(
                    activity_payload #> '{form_data, activity_type_data, activity_persons}') as json_array
                    from 
                      activity_incoming_data 
                    where 
                      activity_incoming_data_id in (
                        select 
                          incoming_data_id 
                        from 
                          activity_current
                      )
                  ), 
                  person_select as (
                    select 
                      p.activity_incoming_data_id, 
                      p.json_array #>> '{person_name}' as person_name,
                      p.json_array #>> '{applicator_license}' as applicator_license
                    from 
                      person_array p
                  ), 
                  person_list as (
                    select 
                      p.activity_incoming_data_id, 
                      string_agg (
                        p.person_name, 
                        ', ' 
                        order by 
                          p.person_name
                      ) person_name 
                    from 
                      person_select p 
                    group by 
                      p.activity_incoming_data_id
                  ), 
                  treatment_person_list as (
                    select 
                      p.activity_incoming_data_id, 
                      string_agg (
                        p.person_name || ', ' || p.applicator_license, 
                        ', ' 
                        order by 
                          p.person_name
                      ) treatment_person_name 
                    from 
                      person_select p 
                    group by 
                      p.activity_incoming_data_id
                  ), 
                  jurisdictions_list as (
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
                  jurisdiction_agg as (
                    select 
                      j.activity_incoming_data_id, 
                      string_agg (
                        j.jurisdiction || ' ' || j.percent_covered || '%', 
                        ', ' 
                        order by 
                          j.jurisdiction
                      ) jurisdictions 
                    from 
                      jurisdictions_list j 
                    group by 
                      j.activity_incoming_data_id
                  ), 
                  funding_agency_array as (
                    select 
                      activity_incoming_data_id, 
                      convert_string_list_to_array_elements(
                        activity_payload #>> '{form_data, activity_data, invasive_species_agency_code}') as funding_list
                        from 
                          activity_incoming_data 
                        where 
                          activity_incoming_data_id in (
                            select 
                              incoming_data_id 
                            from 
                              activity_current
                          )
                      ), 
                      funding_agency_select as (
                        select 
                          f.activity_incoming_data_id, 
                          f.funding_list, 
                          invasive_species_agency_codes.code_description as funding_agency 
                        from 
                          funding_agency_array f 
                          left join code_header invasive_species_agency_code_header on invasive_species_agency_code_header.code_header_title = 'invasive_species_agency_code' 
                          and invasive_species_agency_code_header.valid_to is null 
                          left join code invasive_species_agency_codes on invasive_species_agency_codes.code_header_id = invasive_species_agency_code_header.code_header_id 
                          and f.funding_list = invasive_species_agency_codes.code_name
                      ), 
                      funding_agency_agg as (
                        select 
                          f.activity_incoming_data_id, 
                          string_agg(
                            f.funding_agency, 
                            ', ' 
                            order by 
                              f.funding_agency
                          ) funding_agency 
                        from 
                          funding_agency_select f 
                        group by 
                          f.activity_incoming_data_id
                      ) 
                    select 
                      j.jurisdictions, 
                      a.activity_incoming_data_id, 
                      a.activity_id, 
                      a.activity_payload #>> '{short_id}' as short_id,
                      l.project as project_code, 
                      a.activity_payload #>> '{activity_type}' as activity_type,
                      a.activity_payload #>> '{activity_subtype}' as activity_subtype,
                      a.form_status, 
                      translate(
                        a.activity_payload #>> '{form_data, activity_data, activity_date_time}', 'T', ' ') AS activity_date_time,
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
                                t.treatment_person_name as treatment_person, 
                                a.activity_payload #>> '{form_data, activity_data, employer_code}' AS employer_code,
                                employer_codes.code_description as employer_description, 
                                f.funding_agency, 
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
                                  join project_list l on l.activity_incoming_data_id = a.activity_incoming_data_id 
                                  join treatment_person_list t on t.activity_incoming_data_id = a.activity_incoming_data_id 
                                  join person_list p on p.activity_incoming_data_id = a.activity_incoming_data_id 
                                  join jurisdiction_agg j on j.activity_incoming_data_id = a.activity_incoming_data_id 
                                  join funding_agency_agg f on f.activity_incoming_data_id = a.activity_incoming_data_id 
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
create 
or replace view treatment_mechanical_aquatic_plant_summary as (
  with mechanical_treatment_array as (
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
          ), 
          mechanical_treatment_select as (
            select 
              m.activity_incoming_data_id, 
              m.json_array #>> '{treated_area}' as treated_area,
              m.json_array #>> '{disposed_material, disposed_material_input_format}' as input_format,
              m.json_array #>> '{disposed_material, disposed_material_input_number}' as input_number,
              m.json_array #>> '{invasive_plant_code}' as invasive_plant_code,
              invasive_plant_aquatic_codes.code_description as invasive_plant, 
              m.json_array #>> '{mechanical_method_code}' as mechanical_method_code,
              mechanical_method_codes.code_description as mechanical_method, 
              m.json_array #>> '{mechanical_disposal_code}' as mechanical_disposal_code,
              mechanical_disposal_codes.code_description as mechanical_disposal 
            from 
              mechanical_treatment_array m 
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
            where 
              activity_subtype = 'Activity_Treatment_MechanicalPlantAquatic'
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
          c.jurisdictions, 
          c.access_description, 
          c.location_description, 
          c.comment, 
          c.observation_person, 
          a.shorelines, 
          m.treated_area, 
          m.input_format, 
          m.input_number, 
          m.invasive_plant, 
          m.mechanical_method, 
          m.mechanical_disposal, 
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
          c.geom, 
          c.geog 
        FROM 
          invasivesbc.common_summary c 
          join mechanical_treatment_select m on m.activity_incoming_data_id = c.activity_incoming_data_id 
          join shoreline_agg a on a.activity_incoming_data_id = c.activity_incoming_data_id 
        where 
          c.activity_subtype = 'Activity_Treatment_MechanicalPlantAquatic' 
          and c.activity_incoming_data_id in (
            select 
              incoming_data_id 
            from 
              activity_current
          )
          and c.form_status = 'Submitted'
      );
create 
or replace view invasivesbc.observation_aquatic_plant_summary as (
  with waterbody_outflow as (
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
                                    aquatic_plant_json_select as (
                                      select 
                                        a.shorelines, 
                                        a.activity_incoming_data_id, 
                                        a.json_data #>> '{WaterbodyData, waterbody_type}' as waterbody_type,
                                        a.json_data #>> '{WaterbodyData, waterbody_name_gazetted}' as waterbody_name_gazetted,
                                        a.json_data #>> '{WaterbodyData, waterbody_name_local}' as waterbody_name_local,
                                        a.json_data #>> '{WaterbodyData, waterbody_access}' as waterbody_access,
                                        waterbody_use_agg.waterbody_use, 
                                        a.json_data #>> '{WaterbodyData, water_level_management}' as water_level_management,
                                        a.json_data #>> '{WaterbodyData, substrate_type}' as substrate_type,
                                        a.json_data #>> '{WaterbodyData, tidal_influence}' as tidal_influence,
                                        adjacent_land_use_agg.adjacent_land_use, 
                                        waterbody_inflow_agg.inflow as inflow_permanent, 
                                        waterbody_inflow_other_agg.inflow_other, 
                                        waterbody_outflow_agg.outflow, 
                                        waterbody_outflow_other_agg.outflow_other, 
                                        a.json_data #>> '{WaterbodyData, comment}' as waterbody_comment,
                                        a.json_data #>> '{WaterQuality, water_sample_depth}' as water_sample_depth,
                                        a.json_data #>> '{WaterQuality, secchi_depth}' as secchi_depth,
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
                                      where 
                                        activity_subtype = 'Activity_Observation_PlantAquatic' 
                                        and a.activity_incoming_data_id in (
                                          select 
                                            incoming_data_id 
                                          from 
                                            activity_current
                                        )
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
                                      c.jurisdictions, 
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
                                      a.water_sample_depth, 
                                      a.secchi_depth, 
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
                                      c.geom, 
                                      c.geog 
                                    FROM 
                                      invasivesbc.common_summary c 
                                      left join aquatic_plant_json_select a on a.activity_incoming_data_id = c.activity_incoming_data_id 
                                    where 
                                      c.activity_subtype = 'Activity_Observation_PlantAquatic' 
                                      and c.activity_incoming_data_id in (
                                        select 
                                          incoming_data_id 
                                        from 
                                          activity_current
                                      )
                                      and c.form_status = 'Submitted'
                                  );
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
  ), 
  collection_array as (
    select 
      activity_incoming_data_id, 
      biocontrol ->> 'invasive_plant_code' as invasive_plant_code, 
      actual_quantity ->> 'biological_agent_stage_code' as actual_agent_stage_code, 
      actual_quantity ->> 'biological_agent_number' as actual_agent_count, 
      estimated_quantity ->> 'biological_agent_stage_code' as estimated_agent_stage_code, 
      estimated_quantity ->> 'biological_agent_number' as estimated_agent_count, 
      biocontrol ->> 'comment' as collection_comment, 
      biocontrol ->> 'stop_time' as stop_time, 
      biocontrol ->> 'start_time' as start_time, 
      biocontrol ->> 'plant_count' as plant_count, 
      biocontrol ->> 'collection_type' as collection_type, 
      biocontrol ->> 'collection_method' as collection_method_code, 
      biocontrol ->> 'biological_agent_code' as biological_agent_code, 
      biocontrol ->> 'historical_iapp_site_id' as historical_iapp_site_id 
    from 
      activity_incoming_data, 
      lateral jsonb_array_elements(
        activity_incoming_data.activity_payload #> '{form_data, activity_subtype_data, Biocontrol_Collection_Information}') biocontrol
        left join jsonb_array_elements(
          biocontrol -> 'estimated_quantity_and_life_stage_of_agent_collected'
        ) estimated_quantity on true 
        left join jsonb_array_elements(
          biocontrol -> 'actual_quantity_and_life_stage_of_agent_collected'
        ) actual_quantity on true
      ), 
      collection_array_select as (
        select 
          c.activity_incoming_data_id, 
          c.invasive_plant_code, 
          invasive_plant_codes.code_description as invasive_plant, 
          c.actual_agent_stage_code, 
          biological_agent_stage_codes.code_description as actual_agent_stage, 
          c.actual_agent_count, 
          c.estimated_agent_stage_code, 
          estimated_agent_stage_codes.code_description as estimated_agent_stage, 
          c.estimated_agent_count, 
          c.collection_comment, 
          c.stop_time, 
          c.start_time, 
          c.plant_count, 
          c.collection_type, 
          c.collection_method_code, 
          biocontrol_monitoring_methods_codes.code_description as collection_method, 
          c.biological_agent_code, 
          biological_agent_codes.code_description as biological_agent, 
          c.historical_iapp_site_id 
        from 
          collection_array c 
          left join code_header invasive_plant_code_header on invasive_plant_code_header.code_header_title = 'invasive_plant_code' 
          and invasive_plant_code_header.valid_to is null 
          left join code invasive_plant_codes on invasive_plant_codes.code_header_id = invasive_plant_code_header.code_header_id 
          and c.invasive_plant_code = invasive_plant_codes.code_name 
          left join code_header biological_agent_stage_code_header on biological_agent_stage_code_header.code_header_title = 'biological_agent_stage_code' 
          and biological_agent_stage_code_header.valid_to is null 
          left join code biological_agent_stage_codes on biological_agent_stage_codes.code_header_id = biological_agent_stage_code_header.code_header_id 
          and c.actual_agent_stage_code = biological_agent_stage_codes.code_name 
          left join code_header estimated_agent_stage_code_header on estimated_agent_stage_code_header.code_header_title = 'biological_agent_stage_code' 
          and estimated_agent_stage_code_header.valid_to is null 
          left join code estimated_agent_stage_codes on estimated_agent_stage_codes.code_header_id = estimated_agent_stage_code_header.code_header_id 
          and c.estimated_agent_stage_code = estimated_agent_stage_codes.code_name 
          left join code_header biological_agent_code_header on biological_agent_code_header.code_header_title = 'biological_agent_code' 
          and biological_agent_code_header.valid_to is null 
          left join code biological_agent_codes on biological_agent_codes.code_header_id = biological_agent_code_header.code_header_id 
          and c.biological_agent_code = biological_agent_codes.code_name 
          left join code_header biocontrol_monitoring_methods_code_header on biocontrol_monitoring_methods_code_header.code_header_title = 'biocontrol_monitoring_methods_code' 
          and biocontrol_monitoring_methods_code_header.valid_to is null 
          left join code biocontrol_monitoring_methods_codes on biocontrol_monitoring_methods_codes.code_header_id = biocontrol_monitoring_methods_code_header.code_header_id 
          and c.collection_method_code = biocontrol_monitoring_methods_codes.code_name
      ), 
      collection_string_agg as (
        select 
          c.activity_incoming_data_id, 
          c.invasive_plant, 
          c.collection_comment, 
          c.stop_time, 
          c.start_time, 
          c.plant_count, 
          c.collection_type, 
          c.collection_method, 
          c.biological_agent, 
          c.historical_iapp_site_id, 
          string_agg (
            distinct c.actual_agent_stage, 
            ', ' 
            order by 
              c.actual_agent_stage
          ) actual_agent_stage, 
          string_agg (
            distinct c.actual_agent_count, 
            ', ' 
            order by 
              c.actual_agent_count
          ) actual_agent_count, 
          string_agg (
            distinct c.estimated_agent_stage, 
            ', ' 
            order by 
              c.estimated_agent_stage
          ) estimated_agent_stage, 
          string_agg (
            distinct c.estimated_agent_count, 
            ', ' 
            order by 
              c.estimated_agent_count
          ) estimated_agent_count 
        from 
          collection_array_select c 
        group by 
          c.activity_incoming_data_id, 
          c.invasive_plant, 
          c.collection_comment, 
          c.stop_time, 
          c.start_time, 
          c.plant_count, 
          c.collection_type, 
          c.collection_method, 
          c.biological_agent, 
          c.historical_iapp_site_id
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
          b.json_data #>> '{Weather_Conditions, wind_aspect}' as wind_aspect,
          b.json_data #>> '{Weather_Conditions, weather_comments}' as weather_comments,
          b.json_data #>> '{Microsite_Conditions, mesoslope_position_code}' as mesoslope_position_code,
          mesoslope_position_codes.code_description as mesoslope_position, 
          b.json_data #>> '{Microsite_Conditions, site_surface_shape_code}' as site_surface_shape_code,
          site_surface_shape_codes.code_description as site_surface_shape, 
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
          c.estimated_agent_count 
        from 
          collection_string_agg c 
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
      c.jurisdictions, 
      c.access_description, 
      c.location_description, 
      c.comment, 
      c.observation_person, 
      b.linked_treatment_id, 
      b.temperature, 
      b.cloud_cover, 
      b.precipitation, 
      b.wind_speed, 
      b.wind_aspect, 
      b.weather_comments, 
      b.mesoslope_position, 
      b.site_surface_shape, 
      b.invasive_plant, 
      b.biological_agent, 
      b.collection_type, 
      b.plant_count, 
      b.collection_method, 
      b.start_time, 
      b.stop_time, 
      b.actual_agent_stage, 
      b.actual_agent_count, 
      b.estimated_agent_stage, 
      b.estimated_agent_count, 
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
      c.geom, 
      c.geog 
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
  ), 
  actual_agents_array as (
    select 
      activity_incoming_data.activity_incoming_data_id, 
      form_status,
      jsonb_array_elements(
        activity_incoming_data.activity_payload #> '{form_data, activity_subtype_data, Monitoring_BiocontrolDispersal_Information, actual_biological_agents}') as json_array
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
      ), 
      actual_agents_array_select as (
        select 
          a.activity_incoming_data_id, 
          a.json_array #>> '{biological_agent_stage_code}' as actual_biological_agent_stage_code,
          biological_agent_stage_codes.code_description as actual_biological_agent_stage, 
          a.json_array #>> '{release_quantity}' as actual_release_quantity,
          a.json_array #>> '{agent_location}' as actual_agent_location_code,
          agent_location_codes.code_description as actual_agent_location, 
          a.json_array #>> '{plant_position}' as actual_plant_position_code,
          plant_position_codes.code_description as actual_plant_position 
        from 
          actual_agents_array a 
          left join code_header biological_agent_stage_code_header on biological_agent_stage_code_header.code_header_title = 'biological_agent_stage_code' 
          and biological_agent_stage_code_header.valid_to is null 
          left join code biological_agent_stage_codes on biological_agent_stage_codes.code_header_id = biological_agent_stage_code_header.code_header_id 
          and a.json_array #>> '{biological_agent_stage_code}' = biological_agent_stage_codes.code_name
          left join code_header agent_location_code_header on agent_location_code_header.code_header_title = 'agent_location_code' 
          and agent_location_code_header.valid_to is null 
          left join code agent_location_codes on agent_location_codes.code_header_id = agent_location_code_header.code_header_id 
          and a.json_array #>> '{agent_location}' = agent_location_codes.code_name
          left join code_header plant_position_code_header on plant_position_code_header.code_header_title = 'plant_position_code' 
          and plant_position_code_header.valid_to is null 
          left join code plant_position_codes on plant_position_codes.code_header_id = plant_position_code_header.code_header_id 
          and a.json_array #>> '{plant_position}' = plant_position_codes.code_name
          ), 
      actual_bioagents_agg as (
        select 
          b.activity_incoming_data_id, 
          string_agg (
            b.actual_biological_agent_stage, 
            ', ' 
            order by 
              b.actual_biological_agent_stage
          ) actual_biological_agent_stage, 
          string_agg (
            b.actual_agent_location, 
            ', ' 
            order by 
              b.actual_agent_location
          ) actual_agent_location, 
          string_agg (
            b.actual_plant_position, 
            ', ' 
            order by 
              b.actual_plant_position
          ) actual_plant_position, 
          string_agg (
            b.actual_release_quantity, 
            ', ' 
            order by 
              b.actual_release_quantity
          ) actual_release_quantity 
        from 
          actual_agents_array_select b 
        group by 
          b.activity_incoming_data_id
      ), 
      estimated_agents_array as (
        select 
          activity_incoming_data_id, 
          form_status,
          jsonb_array_elements(
            activity_payload #> '{form_data, activity_subtype_data, Monitoring_BiocontrolDispersal_Information, estimated_biological_agents}') as json_array
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
          ), 
          estimated_agents_array_select as (
            select 
              e.activity_incoming_data_id, 
              e.json_array #>> '{biological_agent_stage_code}' as estimated_biological_agent_stage_code,
              biological_agent_stage_codes.code_description as estimated_biological_agent_stage, 
              e.json_array #>> '{release_quantity}' as estimated_release_quantity,
              e.json_array #>> '{agent_location}' as estimated_agent_location_code,
              agent_location_codes.code_description as estimated_agent_location, 
              e.json_array #>> '{plant_position}' as estimated_plant_position_code,
              plant_position_codes.code_description as estimated_plant_position 
            from 
              estimated_agents_array e 
              left join code_header biological_agent_stage_code_header on biological_agent_stage_code_header.code_header_title = 'biological_agent_stage_code' 
              and biological_agent_stage_code_header.valid_to is null 
              left join code biological_agent_stage_codes on biological_agent_stage_codes.code_header_id = biological_agent_stage_code_header.code_header_id 
              and e.json_array #>> '{biological_agent_stage_code}' = biological_agent_stage_codes.code_name
              left join code_header agent_location_code_header on agent_location_code_header.code_header_title = 'agent_location_code' 
              and agent_location_code_header.valid_to is null 
              left join code agent_location_codes on agent_location_codes.code_header_id = agent_location_code_header.code_header_id 
              and e.json_array #>> '{agent_location}' = agent_location_codes.code_name
              left join code_header plant_position_code_header on plant_position_code_header.code_header_title = 'plant_position_code' 
              and plant_position_code_header.valid_to is null 
              left join code plant_position_codes on plant_position_codes.code_header_id = plant_position_code_header.code_header_id 
              and e.json_array #>> '{plant_position}' = plant_position_codes.code_name
              ), 
          estimated_bioagents_agg as (
            select 
              e.activity_incoming_data_id, 
              string_agg (
                e.estimated_biological_agent_stage, 
                ', ' 
                order by 
                  e.estimated_biological_agent_stage
              ) estimated_biological_agent_stage, 
              string_agg (
                e.estimated_agent_location, 
                ', ' 
                order by 
                  e.estimated_agent_location
              ) estimated_agent_location, 
              string_agg (
                e.estimated_plant_position, 
                ', ' 
                order by 
                  e.estimated_plant_position
              ) estimated_plant_position, 
              string_agg (
                e.estimated_release_quantity, 
                ', ' 
                order by 
                  e.estimated_release_quantity
              ) estimated_release_quantity 
            from 
              estimated_agents_array_select e 
            group by 
              e.activity_incoming_data_id
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
              b.json_data #>> '{Weather_Conditions, wind_aspect}' as wind_aspect,
              b.json_data #>> '{Weather_Conditions, weather_comments}' as weather_comments,
              b.json_data #>> '{Microsite_Conditions, mesoslope_position_code}' as mesoslope_position_code,
              mesoslope_position_codes.code_description as mesoslope_position, 
              b.json_data #>> '{Microsite_Conditions, site_surface_shape_code}' as site_surface_shape_code,
              site_surface_shape_codes.code_description as site_surface_shape, 
              b.json_data #>> '{Monitoring_BiocontrolDispersal_Information, invasive_plant_code}' as invasive_plant_code,
              invasive_plant_codes.code_description as invasive_plant, 
              b.json_data #>> '{Monitoring_BiocontrolDispersal_Information, biological_agent_code}' as biological_agent_code,
              biological_agent_codes.code_description as biological_agent, 
              b.json_data #>> '{Monitoring_BiocontrolDispersal_Information, biocontrol_present}' as biocontrol_present,
              b.json_data #>> '{Monitoring_BiocontrolDispersal_Information, biological_agent_presence_code}' as biological_agent_presence_code,
              biological_agent_presence_codes.code_description as biological_agent_presence, 
              b.json_data #>> '{Monitoring_BiocontrolDispersal_Information, monitoring_type}' as monitoring_type,
              b.json_data #>> '{Monitoring_BiocontrolDispersal_Information, plant_count}' as plant_count,
              b.json_data #>> '{Monitoring_BiocontrolDispersal_Information, monitoring_method}' as monitoring_method_code,
              biocontrol_monitoring_methods_codes.code_description as monitoring_method, 
              b.json_data #>> '{Monitoring_BiocontrolDispersal_Information, linear_segment}' as linear_segment,
              b.json_data #>> '{Monitoring_BiocontrolDispersal_Information, start_time}' as start_time,
              b.json_data #>> '{Monitoring_BiocontrolDispersal_Information, stop_time}' as stop_time,
              a.actual_biological_agent_stage, 
              a.actual_release_quantity, 
              a.actual_agent_location, 
              a.actual_plant_position, 
              e.estimated_biological_agent_stage, 
              e.estimated_release_quantity, 
              e.estimated_agent_location, 
              e.estimated_plant_position, 
              b.json_data #>> '{Monitoring_BiocontrolDispersal_Information, total_bio_agent_quantity_actual}' as total_bio_agent_quantity_actual,
              b.json_data #>> '{Monitoring_BiocontrolDispersal_Information, total_bio_agent_quantity_estimated}' as total_bioagent_quantity_estimated,
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
                  biocontrol_dispersal_monitoring_json b full 
                  join actual_bioagents_agg a on a.activity_incoming_data_id = b.activity_incoming_data_id full 
                  join estimated_bioagents_agg e on e.activity_incoming_data_id = b.activity_incoming_data_id 
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
                  and b.json_data #>> '{Monitoring_BiocontrolDispersal_Information, invasive_plant_code}' = invasive_plant_codes.code_name
                  left join code_header biological_agent_code_header on biological_agent_code_header.code_header_title = 'biological_agent_code' 
                  and biological_agent_code_header.valid_to is null 
                  left join code biological_agent_codes on biological_agent_codes.code_header_id = biological_agent_code_header.code_header_id 
                  and b.json_data #>> '{Monitoring_BiocontrolDispersal_Information, biological_agent_code}' = biological_agent_codes.code_name
                  left join code_header biological_agent_presence_code_header on biological_agent_presence_code_header.code_header_title = 'biological_agent_presence_code' 
                  and biological_agent_presence_code_header.valid_to is null 
                  left join code biological_agent_presence_codes on biological_agent_presence_codes.code_header_id = biological_agent_presence_code_header.code_header_id 
                  and b.json_data #>> '{Monitoring_BiocontrolDispersal_Information, biological_agent_presence_code}' = biological_agent_presence_codes.code_name
                  left join code_header biocontrol_monitoring_methods_code_header on biocontrol_monitoring_methods_code_header.code_header_title = 'biocontrol_monitoring_methods_code' 
                  and biocontrol_monitoring_methods_code_header.valid_to is null 
                  left join code biocontrol_monitoring_methods_codes on biocontrol_monitoring_methods_codes.code_header_id = biocontrol_monitoring_methods_code_header.code_header_id 
                  and b.json_data #>> '{Monitoring_BiocontrolDispersal_Information, monitoring_method}' = biocontrol_monitoring_methods_codes.code_name
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
              c.jurisdictions, 
              c.access_description, 
              c.location_description, 
              c.comment, 
              c.observation_person, 
              b.linked_treatment_id, 
              b.temperature, 
              b.cloud_cover, 
              b.precipitation, 
              b.wind_speed, 
              b.wind_aspect, 
              b.weather_comments, 
              b.mesoslope_position, 
              b.site_surface_shape, 
              b.invasive_plant, 
              b.biological_agent, 
              b.biocontrol_present, 
              b.biological_agent_presence, 
              b.monitoring_type, 
              b.plant_count, 
              b.monitoring_method, 
              b.linear_segment, 
              b.start_time, 
              b.stop_time, 
              b.actual_biological_agent_stage, 
              b.actual_release_quantity, 
              b.actual_agent_location, 
              b.actual_plant_position, 
              b.estimated_biological_agent_stage, 
              b.estimated_release_quantity, 
              b.estimated_agent_location, 
              b.estimated_plant_position, 
              b.total_bio_agent_quantity_actual, 
              b.total_bioagent_quantity_estimated, 
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
              c.geom, 
              c.geog 
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
  ), 
  actual_agents_array as (
    select 
      activity_incoming_data_id, 
      form_status,
      jsonb_array_elements(
        activity_payload #> '{form_data, activity_subtype_data, Monitoring_BiocontrolRelease_TerrestrialPlant_Information, actual_biological_agents}') as json_array
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
      ), 
      actual_agents_array_select as (
        select 
          a.activity_incoming_data_id, 
          a.json_array #>> '{biological_agent_stage_code}' as actual_biological_agent_stage_code,
          biological_agent_stage_codes.code_description as actual_biological_agent_stage, 
          a.json_array #>> '{release_quantity}' as actual_release_quantity,
          a.json_array #>> '{agent_location}' as actual_agent_location_code,
          agent_location_codes.code_description as actual_agent_location, 
          a.json_array #>> '{plant_position}' as actual_plant_position_code,
          plant_position_codes.code_description as actual_plant_position 
        from 
          actual_agents_array a 
          left join code_header biological_agent_stage_code_header on biological_agent_stage_code_header.code_header_title = 'biological_agent_stage_code' 
          and biological_agent_stage_code_header.valid_to is null 
          left join code biological_agent_stage_codes on biological_agent_stage_codes.code_header_id = biological_agent_stage_code_header.code_header_id 
          and a.json_array #>> '{biological_agent_stage_code}' = biological_agent_stage_codes.code_name
          left join code_header agent_location_code_header on agent_location_code_header.code_header_title = 'agent_location_code' 
          and agent_location_code_header.valid_to is null 
          left join code agent_location_codes on agent_location_codes.code_header_id = agent_location_code_header.code_header_id 
          and a.json_array #>> '{agent_location}' = agent_location_codes.code_name
          left join code_header plant_position_code_header on plant_position_code_header.code_header_title = 'plant_position_code' 
          and plant_position_code_header.valid_to is null 
          left join code plant_position_codes on plant_position_codes.code_header_id = plant_position_code_header.code_header_id 
          and a.json_array #>> '{plant_position}' = plant_position_codes.code_name
          ), 
      actual_bioagents_agg as (
        select 
          b.activity_incoming_data_id, 
          string_agg (
            b.actual_biological_agent_stage, 
            ', ' 
            order by 
              b.actual_biological_agent_stage
          ) actual_biological_agent_stage, 
          string_agg (
            b.actual_agent_location, 
            ', ' 
            order by 
              b.actual_agent_location
          ) actual_agent_location, 
          string_agg (
            b.actual_plant_position, 
            ', ' 
            order by 
              b.actual_plant_position
          ) actual_plant_position, 
          string_agg (
            b.actual_release_quantity, 
            ', ' 
            order by 
              b.actual_release_quantity
          ) actual_release_quantity 
        from 
          actual_agents_array_select b 
        group by 
          b.activity_incoming_data_id
      ), 
      estimated_agents_array as (
        select 
          activity_incoming_data_id, 
          form_status,
          jsonb_array_elements(
            activity_payload #> '{form_data, activity_subtype_data, Monitoring_BiocontrolRelease_TerrestrialPlant_Information, estimated_biological_agents}') as json_array
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
          ), 
          estimated_agents_array_select as (
            select 
              e.activity_incoming_data_id, 
              e.json_array #>> '{biological_agent_stage_code}' as estimated_biological_agent_stage_code,
              biological_agent_stage_codes.code_description as estimated_biological_agent_stage, 
              e.json_array #>> '{release_quantity}' as estimated_release_quantity,
              e.json_array #>> '{agent_location}' as estimated_agent_location_code,
              agent_location_codes.code_description as estimated_agent_location, 
              e.json_array #>> '{plant_position}' as estimated_plant_position_code,
              plant_position_codes.code_description as estimated_plant_position 
            from 
              estimated_agents_array e 
              left join code_header biological_agent_stage_code_header on biological_agent_stage_code_header.code_header_title = 'biological_agent_stage_code' 
              and biological_agent_stage_code_header.valid_to is null 
              left join code biological_agent_stage_codes on biological_agent_stage_codes.code_header_id = biological_agent_stage_code_header.code_header_id 
              and e.json_array #>> '{biological_agent_stage_code}' = biological_agent_stage_codes.code_name
              left join code_header agent_location_code_header on agent_location_code_header.code_header_title = 'agent_location_code' 
              and agent_location_code_header.valid_to is null 
              left join code agent_location_codes on agent_location_codes.code_header_id = agent_location_code_header.code_header_id 
              and e.json_array #>> '{agent_location}' = agent_location_codes.code_name
              left join code_header plant_position_code_header on plant_position_code_header.code_header_title = 'plant_position_code' 
              and plant_position_code_header.valid_to is null 
              left join code plant_position_codes on plant_position_codes.code_header_id = plant_position_code_header.code_header_id 
              and e.json_array #>> '{plant_position}' = plant_position_codes.code_name
              ), 
          estimated_bioagents_agg as (
            select 
              e.activity_incoming_data_id, 
              string_agg (
                e.estimated_biological_agent_stage, 
                ', ' 
                order by 
                  e.estimated_biological_agent_stage
              ) estimated_biological_agent_stage, 
              string_agg (
                e.estimated_agent_location, 
                ', ' 
                order by 
                  e.estimated_agent_location
              ) estimated_agent_location, 
              string_agg (
                e.estimated_plant_position, 
                ', ' 
                order by 
                  e.estimated_plant_position
              ) estimated_plant_position, 
              string_agg (
                e.estimated_release_quantity, 
                ', ' 
                order by 
                  e.estimated_release_quantity
              ) estimated_release_quantity 
            from 
              estimated_agents_array_select e 
            group by 
              e.activity_incoming_data_id
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
              b.json_data #>> '{Weather_Conditions, wind_aspect}' as wind_aspect,
              b.json_data #>> '{Weather_Conditions, weather_comments}' as weather_comments,
              b.json_data #>> '{Microsite_Conditions, mesoslope_position_code}' as mesoslope_position_code,
              mesoslope_position_codes.code_description as mesoslope_position, 
              b.json_data #>> '{Microsite_Conditions, site_surface_shape_code}' as site_surface_shape_code,
              site_surface_shape_codes.code_description as site_surface_shape, 
              b.json_data #>> '{Monitoring_BiocontrolRelease_TerrestrialPlant_Information, invasive_plant_code}' as invasive_plant_code,
              invasive_plant_codes.code_description as invasive_plant, 
              b.json_data #>> '{Monitoring_BiocontrolRelease_TerrestrialPlant_Information, biological_agent_code}' as biological_agent_code,
              biological_agent_codes.code_description as biological_agent, 
              b.json_data #>> '{Monitoring_BiocontrolRelease_TerrestrialPlant_Information, biocontrol_present}' as biocontrol_present,
              b.json_data #>> '{Monitoring_BiocontrolRelease_TerrestrialPlant_Information, biological_agent_presence_code}' as biological_agent_presence_code,
              biological_agent_presence_codes.code_description as biological_agent_presence, 
              b.json_data #>> '{Monitoring_BiocontrolRelease_TerrestrialPlant_Information, monitoring_type}' as monitoring_type,
              b.json_data #>> '{Monitoring_BiocontrolRelease_TerrestrialPlant_Information, plant_count}' as plant_count,
              b.json_data #>> '{Monitoring_BiocontrolRelease_TerrestrialPlant_Information, monitoring_method}' as monitoring_method_code,
              biocontrol_monitoring_methods_codes.code_description as monitoring_method, 
              b.json_data #>> '{Monitoring_BiocontrolRelease_TerrestrialPlant_Information, start_time}' as start_time,
              b.json_data #>> '{Monitoring_BiocontrolRelease_TerrestrialPlant_Information, stop_time}' as stop_time,
              a.actual_biological_agent_stage, 
              a.actual_release_quantity, 
              a.actual_agent_location, 
              a.actual_plant_position, 
              e.estimated_biological_agent_stage, 
              e.estimated_release_quantity, 
              e.estimated_agent_location, 
              e.estimated_plant_position, 
              b.json_data #>> '{Monitoring_BiocontrolRelease_TerrestrialPlant_Information, total_bio_agent_quantity_actual}' as total_bio_agent_quantity_actual,
              b.json_data #>> '{Monitoring_BiocontrolRelease_TerrestrialPlant_Information, total_bio_agent_quantity_estimated}' as total_bio_agent_quantity_estimated,
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
                b.json_data #>> '{Spread_Results, spread_details_recorded}' as spread_details_recorded,
                b.json_data #>> '{Spread_Results, agent_density}' as agent_density,
                b.json_data #>> '{Spread_Results, plant_attack}' as plant_attack,
                b.json_data #>> '{Spread_Results, max_spread_distance}' as max_spread_distance,
                b.json_data #>> '{Spread_Results, max_spread_aspect}' as max_spread_aspect
                from 
                  biocontrol_release_monitoring_json b full 
                  join actual_bioagents_agg a on a.activity_incoming_data_id = b.activity_incoming_data_id full 
                  join estimated_bioagents_agg e on e.activity_incoming_data_id = b.activity_incoming_data_id 
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
                  and b.json_data #>> '{Monitoring_BiocontrolRelease_TerrestrialPlant_Information, invasive_plant_code}' = invasive_plant_codes.code_name
                  left join code_header biological_agent_code_header on biological_agent_code_header.code_header_title = 'biological_agent_code' 
                  and biological_agent_code_header.valid_to is null 
                  left join code biological_agent_codes on biological_agent_codes.code_header_id = biological_agent_code_header.code_header_id 
                  and b.json_data #>> '{Monitoring_BiocontrolRelease_TerrestrialPlant_Information, biological_agent_code}' = biological_agent_codes.code_name
                  left join code_header biological_agent_presence_code_header on biological_agent_presence_code_header.code_header_title = 'biological_agent_presence_code' 
                  and biological_agent_presence_code_header.valid_to is null 
                  left join code biological_agent_presence_codes on biological_agent_presence_codes.code_header_id = biological_agent_presence_code_header.code_header_id 
                  and b.json_data #>> '{Monitoring_BiocontrolRelease_TerrestrialPlant_Information, biological_agent_presence_code}' = biological_agent_presence_codes.code_name
                  left join code_header biocontrol_monitoring_methods_code_header on biocontrol_monitoring_methods_code_header.code_header_title = 'biocontrol_monitoring_methods_code' 
                  and biocontrol_monitoring_methods_code_header.valid_to is null 
                  left join code biocontrol_monitoring_methods_codes on biocontrol_monitoring_methods_codes.code_header_id = biocontrol_monitoring_methods_code_header.code_header_id 
                  and b.json_data #>> '{Monitoring_BiocontrolRelease_TerrestrialPlant_Information, monitoring_method}' = biocontrol_monitoring_methods_codes.code_name
                where 
                  b.activity_incoming_data_id in (
                    select 
                      incoming_data_id 
                    from 
                      activity_current
                  ) 
                  and activity_subtype = 'Activity_Monitoring_BiocontrolRelease_TerrestrialPlant'
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
              c.jurisdictions, 
              c.access_description, 
              c.location_description, 
              c.comment, 
              c.observation_person, 
              b.linked_treatment_id, 
              b.temperature, 
              b.cloud_cover, 
              b.precipitation, 
              b.wind_speed, 
              b.wind_aspect, 
              b.weather_comments, 
              b.mesoslope_position, 
              b.site_surface_shape, 
              b.invasive_plant, 
              b.biological_agent, 
              b.biocontrol_present, 
              b.biological_agent_presence, 
              b.monitoring_type, 
              b.plant_count, 
              b.monitoring_method, 
              b.start_time, 
              b.stop_time, 
              b.actual_biological_agent_stage, 
              b.actual_release_quantity, 
              b.actual_agent_location, 
              b.actual_plant_position, 
              b.estimated_biological_agent_stage, 
              b.estimated_release_quantity, 
              b.estimated_agent_location, 
              b.estimated_plant_position, 
              b.total_bio_agent_quantity_actual, 
              b.total_bio_agent_quantity_estimated, 
              b.phenology_details_recorded, 
              b.target_plant_heights, 
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
              c.geom, 
              c.geog 
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
  ), 
  actual_bio_agents_array as (
    select 
      activity_incoming_data_id,
      form_status,
      jsonb_array_elements(
        activity_payload #> '{form_data, activity_subtype_data, Biocontrol_Release_Information, actual_biological_agents}') as json_array
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
      ), 
      estimated_bio_agents_array as (
        select 
          activity_incoming_data.activity_incoming_data_id, 
          form_status,
          jsonb_array_elements(
            activity_incoming_data.activity_payload #> '{form_data, activity_subtype_data, Biocontrol_Release_Information, estimated_biological_agents}') as json_array
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
          ), 
          estimated_bio_agents_array_select as (
            select 
              a.activity_incoming_data_id, 
              a.json_array #>> '{biological_agent_stage_code}' as biological_agent_stage_code,
              biological_agent_stage_codes.code_description as biological_agent_stage, 
              a.json_array #>> '{release_quantity}' as release_quantity,
              a.json_array #>> '{agent_location}' as agent_location_code,
              agent_location_codes.code_description as agent_location, 
              a.json_array #>> '{plant_position}' as plant_position_code,
              plant_position_codes.code_description as plant_position 
            from 
              estimated_bio_agents_array a 
              left join code_header biological_agent_stage_code_header on biological_agent_stage_code_header.code_header_title = 'biological_agent_stage_code' 
              and biological_agent_stage_code_header.valid_to is null 
              left join code biological_agent_stage_codes on biological_agent_stage_codes.code_header_id = biological_agent_stage_code_header.code_header_id 
              and a.json_array #>> '{biological_agent_stage_code}' = biological_agent_stage_codes.code_name
              left join code_header agent_location_code_header on agent_location_code_header.code_header_title = 'agent_location_code' 
              and agent_location_code_header.valid_to is null 
              left join code agent_location_codes on agent_location_codes.code_header_id = agent_location_code_header.code_header_id 
              and a.json_array #>> '{agent_location}' = agent_location_codes.code_name
              left join code_header plant_position_code_header on plant_position_code_header.code_header_title = 'plant_position_code' 
              and plant_position_code_header.valid_to is null 
              left join code plant_position_codes on plant_position_codes.code_header_id = plant_position_code_header.code_header_id 
              and a.json_array #>> '{plant_position}' = plant_position_codes.code_name
              ), 
          actual_bio_agents_array_select as (
            select 
              a.activity_incoming_data_id, 
              a.json_array #>> '{biological_agent_stage_code}' as biological_agent_stage_code,
              biological_agent_stage_codes.code_description as biological_agent_stage, 
              a.json_array #>> '{release_quantity}' as release_quantity,
              a.json_array #>> '{agent_location}' as agent_location_code,
              agent_location_codes.code_description as agent_location, 
              a.json_array #>> '{plant_position}' as plant_position_code,
              plant_position_codes.code_description as plant_position 
            from 
              actual_bio_agents_array a 
              left join code_header biological_agent_stage_code_header on biological_agent_stage_code_header.code_header_title = 'biological_agent_stage_code' 
              and biological_agent_stage_code_header.valid_to is null 
              left join code biological_agent_stage_codes on biological_agent_stage_codes.code_header_id = biological_agent_stage_code_header.code_header_id 
              and a.json_array #>> '{biological_agent_stage_code}' = biological_agent_stage_codes.code_name
              left join code_header agent_location_code_header on agent_location_code_header.code_header_title = 'agent_location_code' 
              and agent_location_code_header.valid_to is null 
              left join code agent_location_codes on agent_location_codes.code_header_id = agent_location_code_header.code_header_id 
              and a.json_array #>> '{agent_location}' = agent_location_codes.code_name
              left join code_header plant_position_code_header on plant_position_code_header.code_header_title = 'plant_position_code' 
              and plant_position_code_header.valid_to is null 
              left join code plant_position_codes on plant_position_codes.code_header_id = plant_position_code_header.code_header_id 
              and a.json_array #>> '{plant_position}' = plant_position_codes.code_name
              ), 
          estimated_bio_agents_agg as (
            select 
              b.activity_incoming_data_id, 
              string_agg (
                b.biological_agent_stage, 
                ', ' 
                order by 
                  b.biological_agent_stage
              ) estimated_biological_agent_stage, 
              string_agg (
                b.agent_location, 
                ', ' 
                order by 
                  b.agent_location
              ) estimated_agent_location, 
              string_agg (
                b.plant_position, 
                ', ' 
                order by 
                  b.plant_position
              ) estimated_plant_position, 
              string_agg (
                b.release_quantity, 
                ', ' 
                order by 
                  b.release_quantity
              ) estimated_release_quantity 
            from 
              estimated_bio_agents_array_select b 
            group by 
              b.activity_incoming_data_id
          ), 
          actual_bio_agents_agg as (
            select 
              b.activity_incoming_data_id, 
              string_agg (
                b.biological_agent_stage, 
                ', ' 
                order by 
                  b.biological_agent_stage
              ) actual_biological_agent_stage, 
              string_agg (
                b.agent_location, 
                ', ' 
                order by 
                  b.agent_location
              ) actual_agent_location, 
              string_agg (
                b.plant_position, 
                ', ' 
                order by 
                  b.plant_position
              ) actual_plant_position, 
              string_agg (
                b.release_quantity, 
                ', ' 
                order by 
                  b.release_quantity
              ) actual_release_quantity 
            from 
              actual_bio_agents_array_select b 
            group by 
              b.activity_incoming_data_id
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
              b.json_data #>> '{Weather_Conditions, wind_aspect}' as wind_aspect,
              b.json_data #>> '{Weather_Conditions, weather_comments}' as weather_comments,
              b.json_data #>> '{Microsite_Conditions, mesoslope_position_code}' as mesoslope_position_code,
              mesoslope_position_codes.code_description as mesoslope_position, 
              b.json_data #>> '{Microsite_Conditions, site_surface_shape_code}' as site_surface_shape_code,
              site_surface_shape_codes.code_description as site_surface_shape, 
              b.json_data #>> '{Biocontrol_Release_Information, invasive_plant_code}' as invasive_plant_code,
              invasive_plant_codes.code_description as invasive_plant, 
              b.json_data #>> '{Biocontrol_Release_Information, biological_agent_code}' as biological_agent_code,
              biological_agent_codes.code_description as biological_agent, 
              b.json_data #>> '{Biocontrol_Release_Information, linear_segment}' as linear_segment,
              a.actual_biological_agent_stage, 
              a.actual_release_quantity, 
              a.actual_agent_location, 
              a.actual_plant_position, 
              e.estimated_biological_agent_stage, 
              e.estimated_release_quantity, 
              e.estimated_agent_location, 
              e.estimated_plant_position 
            from 
              biocontrol_release_json b 
              join estimated_bio_agents_agg e on e.activity_incoming_data_id = b.activity_incoming_data_id 
              join actual_bio_agents_agg a on a.activity_incoming_data_id = b.activity_incoming_data_id 
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
              and b.json_data #>> '{Biocontrol_Release_Information, invasive_plant_code}' = invasive_plant_codes.code_name
              left join code_header biological_agent_code_header on biological_agent_code_header.code_header_title = 'biological_agent_code' 
              and biological_agent_code_header.valid_to is null 
              left join code biological_agent_codes on biological_agent_codes.code_header_id = biological_agent_code_header.code_header_id 
              and b.json_data #>> '{Biocontrol_Release_Information, biological_agent_code}' = biological_agent_codes.code_name
              left join code_header biological_agent_presence_code_header on biological_agent_presence_code_header.code_header_title = 'biological_agent_presence_code' 
              and biological_agent_presence_code_header.valid_to is null 
              left join code biological_agent_presence_codes on biological_agent_presence_codes.code_header_id = biological_agent_presence_code_header.code_header_id 
              and b.json_data #>> '{Biocontrol_Release_Information, biological_agent_presence_code}' = biological_agent_presence_codes.code_name
              left join code_header monitoring_method_code_header on monitoring_method_code_header.code_header_title = 'monitoring_method_code' 
              and monitoring_method_code_header.valid_to is null 
              left join code monitoring_method_codes on monitoring_method_codes.code_header_id = monitoring_method_code_header.code_header_id 
              and b.json_data #>> '{Biocontrol_Release_Information, monitoring_method_code}' = monitoring_method_codes.code_name
            where 
              b.activity_incoming_data_id in (
                select 
                  incoming_data_id 
                from 
                  activity_current
              ) 
              and activity_subtype = 'Activity_Biocontrol_Release'
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
          c.jurisdictions, 
          c.access_description, 
          c.location_description, 
          c.comment, 
          c.observation_person, 
          b.activity_incoming_data_id as bio_activity_incoming_data_id, 
          b.temperature, 
          b.cloud_cover, 
          b.precipitation, 
          b.wind_speed, 
          b.wind_aspect, 
          b.weather_comments, 
          b.mesoslope_position, 
          b.site_surface_shape, 
          b.invasive_plant, 
          b.biological_agent, 
          b.linear_segment, 
          b.actual_biological_agent_stage, 
          b.actual_release_quantity, 
          b.actual_agent_location, 
          b.actual_plant_position, 
          b.estimated_biological_agent_stage, 
          b.estimated_release_quantity, 
          b.estimated_agent_location, 
          b.estimated_plant_position, 
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
          c.geom, 
          c.geog 
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
CREATE 
OR REPLACE VIEW invasivesbc.chemical_treatment_monitoring_summary as (
  with chemical_monitoring_json as (
    select 
      a.activity_incoming_data_id, 
      a.activity_payload #>> '{form_data, activity_subtype_data, Monitoring_ChemicalTerrestrialAquaticPlant_Information, invasive_plant_code}' as terrestrial_invasive_plant_code,
      invasive_plant_codes.code_description as terrestrial_invasive_plant, 
      a.activity_payload #>> '{form_data, activity_subtype_data, Monitoring_ChemicalTerrestrialAquaticPlant_Information, invasive_plant_aquatic_code}' as aquatic_invasive_plant_code,
      invasive_plant_aquatic_codes.code_description as aquatic_invasive_plant, 
      a.activity_payload #>> '{form_data, activity_subtype_data, Monitoring_ChemicalTerrestrialAquaticPlant_Information, monitoring_details}' as monitoring_details,
      a.activity_payload #>> '{form_data, activity_subtype_data, Monitoring_ChemicalTerrestrialAquaticPlant_Information, efficacy_code}' as efficacy_code,
      efficacy_codes.code_description as efficacy_rating, 
      a.activity_payload #>> '{form_data, activity_subtype_data, Monitoring_ChemicalTerrestrialAquaticPlant_Information, comment}' as comment
    from 
      activity_incoming_data a 
      left join code_header invasive_plant_code_header on invasive_plant_code_header.code_header_title = 'invasive_plant_code' 
      and invasive_plant_code_header.valid_to is null 
      left join code invasive_plant_codes on invasive_plant_codes.code_header_id = invasive_plant_code_header.code_header_id 
      and a.activity_payload #>> '{form_data, activity_subtype_data, Monitoring_ChemicalTerrestrialAquaticPlant_Information, invasive_plant_code}' = invasive_plant_codes.code_name
      left join code_header invasive_plant_aquatic_code_header on invasive_plant_aquatic_code_header.code_header_title = 'invasive_plant_aquatic_code' 
      and invasive_plant_aquatic_code_header.valid_to is null 
      left join code invasive_plant_aquatic_codes on invasive_plant_aquatic_codes.code_header_id = invasive_plant_aquatic_code_header.code_header_id 
      and a.activity_payload #>> '{form_data, activity_subtype_data, Monitoring_ChemicalTerrestrialAquaticPlant_Information, invasive_plant_aquatic_code}' = invasive_plant_aquatic_codes.code_name
      left join code_header efficacy_code_header on efficacy_code_header.code_header_title = 'efficacy_code' 
      and efficacy_code_header.valid_to is null 
      left join code efficacy_codes on efficacy_codes.code_header_id = efficacy_code_header.code_header_id 
      and a.activity_payload #>> '{form_data, activity_subtype_data, Monitoring_ChemicalTerrestrialAquaticPlant_Information, efficacy_code}' = efficacy_codes.code_name
    where 
      activity_incoming_data_id in (
        select 
          incoming_data_id 
        from 
          activity_current
      )
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
    c.jurisdictions, 
    c.access_description, 
    c.location_description, 
    c.comment, 
    c.observation_person, 
    j.terrestrial_invasive_plant, 
    j.aquatic_invasive_plant, 
    j.monitoring_details, 
    j.efficacy_rating, 
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
    c.geom, 
    c.geog 
  FROM 
    invasivesbc.common_summary c 
    left join chemical_monitoring_json j on j.activity_incoming_data_id = c.activity_incoming_data_id 
  where 
    activity_subtype = 'Activity_Monitoring_ChemicalTerrestrialAquaticPlant' 
    and c.activity_incoming_data_id in (
      select 
        incoming_data_id 
      from 
        activity_current
    )
    and c.form_status = 'Submitted'
);
CREATE 
OR REPLACE VIEW invasivesbc.mechanical_treatment_monitoring_summary as (
  with json_select as (
    select 
      activity_incoming_data_id, 
      activity_payload #>> '{form_data, activity_subtype_data, Monitoring_MechanicalTerrestrialAquaticPlant_Information, invasive_plant_code}' as terrestrial_invasive_plant_code,
      invasive_plant_codes.code_description as terrestrial_invasive_plant, 
      activity_payload #>> '{form_data, activity_subtype_data, Monitoring_MechanicalTerrestrialAquaticPlant_Information, invasive_plant_aquatic_code}' as aquatic_invasive_plant_code,
      invasive_plant_aquatic_codes.code_description as aquatic_invasive_plant, 
      activity_payload #>> '{form_data, activity_subtype_data, Monitoring_MechanicalTerrestrialAquaticPlant_Information, monitoring_details}' as monitoring_details,
      activity_payload #>> '{form_data, activity_subtype_data, Monitoring_MechanicalTerrestrialAquaticPlant_Information, efficacy_code}' as efficacy_code,
      efficacy_codes.code_description as efficacy_rating, 
      activity_payload #>> '{form_data, activity_subtype_data, Monitoring_MechanicalTerrestrialAquaticPlant_Information, comment}' as comment
    from 
      activity_incoming_data 
      left join code_header invasive_plant_code_header on invasive_plant_code_header.code_header_title = 'invasive_plant_code' 
      and invasive_plant_code_header.valid_to is null 
      left join code invasive_plant_codes on invasive_plant_codes.code_header_id = invasive_plant_code_header.code_header_id 
      and activity_payload #>> '{form_data, activity_subtype_data, Monitoring_MechanicalTerrestrialAquaticPlant_Information, invasive_plant_code}' = invasive_plant_codes.code_name
      left join code_header invasive_plant_aquatic_code_header on invasive_plant_aquatic_code_header.code_header_title = 'invasive_plant_aquatic_code' 
      and invasive_plant_aquatic_code_header.valid_to is null 
      left join code invasive_plant_aquatic_codes on invasive_plant_aquatic_codes.code_header_id = invasive_plant_aquatic_code_header.code_header_id 
      and activity_payload #>> '{form_data, activity_subtype_data, Monitoring_MechanicalTerrestrialAquaticPlant_Information, invasive_plant_aquatic_code}' = invasive_plant_aquatic_codes.code_name
      left join code_header efficacy_code_header on efficacy_code_header.code_header_title = 'efficacy_code' 
      and efficacy_code_header.valid_to is null 
      left join code efficacy_codes on efficacy_codes.code_header_id = efficacy_code_header.code_header_id 
      and activity_payload #>> '{form_data, activity_subtype_data, Monitoring_MechanicalTerrestrialAquaticPlant_Information, efficacy_code}' = efficacy_codes.code_name
    where 
      activity_subtype = 'Activity_Monitoring_MechanicalTerrestrialAquaticPlant' 
      and activity_incoming_data_id in (
        select 
          incoming_data_id 
        from 
          activity_current
      )
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
    c.jurisdictions, 
    c.access_description, 
    c.location_description, 
    c.comment, 
    c.observation_person, 
    j.terrestrial_invasive_plant, 
    j.aquatic_invasive_plant, 
    j.monitoring_details, 
    j.efficacy_rating, 
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
    c.geom, 
    c.geog 
  FROM 
    invasivesbc.common_summary c 
    join json_select j on j.activity_incoming_data_id = c.activity_incoming_data_id 
  where 
    c.activity_subtype = 'Activity_Monitoring_MechanicalTerrestrialAquaticPlant' 
    and c.activity_incoming_data_id in (
      select 
        incoming_data_id 
      from 
        activity_current
    )
    and c.form_status = 'Submitted'
);
create 
or replace view treatment_chemical_terrestrial_plant_summary as (
  with herbicide_array as (
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
                              where 
                                activity_incoming_data_id in (
                                  select 
                                    incoming_data_id 
                                  from 
                                    activity_current
                                ) 
                                and activity_subtype = 'Activity_Treatment_ChemicalPlantTerrestrial'
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
                                  where 
                                    activity_incoming_data_id in (
                                      select 
                                        incoming_data_id 
                                      from 
                                        activity_current
                                    )
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
                                      where 
                                        t.activity_incoming_data_id in (
                                          select 
                                            incoming_data_id 
                                          from 
                                            activity_current
                                        )
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
                                          where 
                                            i.activity_incoming_data_id in (
                                              select 
                                                incoming_data_id 
                                              from 
                                                activity_current
                                            )
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
                                                        and activity_subtype = 'Activity_Treatment_ChemicalPlantTerrestrial'
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
                                                    ), 
                                                    json_select as (
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
                                                        f.activity_subtype = 'Activity_Treatment_ChemicalPlantTerrestrial' 
                                                        and f.form_data #>> '{chemical_treatment_details, tank_mix}' = 'false' and
                                                        f.activity_incoming_data_id in (
                                                          select 
                                                            incoming_data_id 
                                                          from 
                                                            activity_current
                                                        ) 
                                                        and form_status = 'Submitted'
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
                                                        f.activity_subtype = 'Activity_Treatment_ChemicalPlantTerrestrial' 
                                                        and f.form_data #>> '{chemical_treatment_details, tank_mix}' = 'true' and
                                                        f.activity_incoming_data_id in (
                                                          select 
                                                            incoming_data_id 
                                                          from 
                                                            activity_current
                                                        ) 
                                                        and form_status = 'Submitted'
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
                                                    concat(
                                                      tm.service_license_company, j.service_license_company
                                                    ) as service_license_company, 
                                                    concat(
                                                      tm.pesticide_use_permit, j.pesticide_use_permit
                                                    ) as pesticide_use_permit, 
                                                    concat(
                                                      tm.pest_management_plan, j.pest_management_plan
                                                    ) as pest_management_plan, 
                                                    concat(tm.temperature, j.temperature) as temperature, 
                                                    concat(tm.wind_speed, j.wind_speed) as wind_speed, 
                                                    concat(
                                                      tm.wind_direction, j.wind_direction
                                                    ) as wind_direction, 
                                                    concat(tm.humidity, j.humidity) as humidity, 
                                                    concat(
                                                      tm.treatment_notice_signs, j.treatment_notice_signs
                                                    ) as treatment_notice_signs, 
                                                    concat(
                                                      tm.application_start_time, j.application_start_time
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
                                                    c.geom, 
                                                    c.geog 
                                                  from 
                                                    invasivesbc.common_summary c 
                                                    left join json_select j on j.activity_incoming_data_id = c.activity_incoming_data_id 
                                                    left join tank_mix_json_select tm on tm.activity_incoming_data_id = c.activity_incoming_data_id 
                                                  where 
                                                    c.activity_subtype = 'Activity_Treatment_ChemicalPlantTerrestrial' 
                                                    and c.activity_incoming_data_id in (
                                                      select 
                                                        incoming_data_id 
                                                      from 
                                                        activity_current
                                                    ) 
                                                    and c.form_status = 'Submitted'
                                                );
create 
or replace view treatment_chemical_aquatic_plant_summary as (
  with herbicide_array as (
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
                              where 
                                activity_incoming_data_id in (
                                  select 
                                    incoming_data_id 
                                  from 
                                    activity_current
                                ) 
                                and activity_subtype = 'Activity_Treatment_ChemicalPlantAquatic'
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
                                  where 
                                    activity_incoming_data_id in (
                                      select 
                                        incoming_data_id 
                                      from 
                                        activity_current
                                    )
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
                                      where 
                                        t.activity_incoming_data_id in (
                                          select 
                                            incoming_data_id 
                                          from 
                                            activity_current
                                        )
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
                                          where 
                                            i.activity_incoming_data_id in (
                                              select 
                                                incoming_data_id 
                                              from 
                                                activity_current
                                            )
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
                                                    ), 
                                                    json_select as (
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
                                                        f.activity_subtype = 'Activity_Treatment_ChemicalPlantAquatic' 
                                                        and f.form_data #>> '{chemical_treatment_details, tank_mix}' = 'false' and
                                                        f.activity_incoming_data_id in (
                                                          select 
                                                            incoming_data_id 
                                                          from 
                                                            activity_current
                                                        ) 
                                                        and form_status = 'Submitted'
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
                                                        f.activity_subtype = 'Activity_Treatment_ChemicalPlantAquatic' 
                                                        and f.form_data #>> '{chemical_treatment_details, tank_mix}' = 'true' and
                                                        f.activity_incoming_data_id in (
                                                          select 
                                                            incoming_data_id 
                                                          from 
                                                            activity_current
                                                        ) 
                                                        and form_status = 'Submitted'
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
                                                    concat(
                                                      tm.service_license_company, j.service_license_company
                                                    ) as service_license_company, 
                                                    concat(
                                                      tm.pesticide_use_permit, j.pesticide_use_permit
                                                    ) as pesticide_use_permit, 
                                                    concat(
                                                      tm.pest_management_plan, j.pest_management_plan
                                                    ) as pest_management_plan, 
                                                    concat(tm.temperature, j.temperature) as temperature, 
                                                    concat(tm.wind_speed, j.wind_speed) as wind_speed, 
                                                    concat(
                                                      tm.wind_direction, j.wind_direction
                                                    ) as wind_direction, 
                                                    concat(tm.humidity, j.humidity) as humidity, 
                                                    concat(
                                                      tm.treatment_notice_signs, j.treatment_notice_signs
                                                    ) as treatment_notice_signs, 
                                                    concat(
                                                      tm.application_start_time, j.application_start_time
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
                                                    c.geom, 
                                                    c.geog 
                                                  from 
                                                    invasivesbc.common_summary c 
                                                    left join json_select j on j.activity_incoming_data_id = c.activity_incoming_data_id 
                                                    left join tank_mix_json_select tm on tm.activity_incoming_data_id = c.activity_incoming_data_id 
                                                  where 
                                                    c.activity_subtype = 'Activity_Treatment_ChemicalPlantAquatic' 
                                                    and c.activity_incoming_data_id in (
                                                      select 
                                                        incoming_data_id 
                                                      from 
                                                        activity_current
                                                    ) 
                                                    and c.form_status = 'Submitted'
                                                );
create 
or replace view treatment_mechanical_terrestrial_plant_summary as (
  with mechanical_treatment_array as (
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
      ), 
      mechanical_treatment_select as (
        select 
          m.activity_incoming_data_id, 
          m.json_array #>> '{treated_area}' as treated_area,
          m.json_array #>> '{disposed_material, disposed_material_input_format}' as input_format,
          m.json_array #>> '{disposed_material, disposed_material_input_number}' as input_number,
          m.json_array #>> '{invasive_plant_code}' as invasive_plant_code,
          invasive_plant_codes.code_description as invasive_plant, 
          m.json_array #>> '{mechanical_method_code}' as mechanical_method_code,
          mechanical_method_codes.code_description as mechanical_method, 
          m.json_array #>> '{mechanical_disposal_code}' as mechanical_disposal_code,
          mechanical_disposal_codes.code_description as mechanical_disposal 
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
        where 
          activity_incoming_data_id in (
            select 
              incoming_data_id 
            from 
              activity_current
          ) 
          and activity_subtype = 'Activity_Treatment_MechanicalPlantTerrestrial'
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
      c.jurisdictions, 
      c.access_description, 
      c.location_description, 
      c.comment, 
      c.pre_treatment_observation, 
      c.observation_person, 
      m.invasive_plant, 
      m.treated_area, 
      m.mechanical_method, 
      m.mechanical_disposal, 
      m.input_format, 
      m.input_number, 
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
      c.geom, 
      c.geog 
    FROM 
      invasivesbc.common_summary c full 
      join mechanical_treatment_select m on m.activity_incoming_data_id = c.activity_incoming_data_id 
    where 
      c.activity_subtype = 'Activity_Treatment_MechanicalPlantTerrestrial' 
      and c.activity_incoming_data_id in (
        select 
          incoming_data_id 
        from 
          activity_current
      )
      and c.form_status = 'Submitted'
  );
create 
or replace view invasivesbc.observation_terrestrial_plant_summary as (
  with terrestrial_plant_array as (
    select 
      activity_incoming_data_id, 
      activity_subtype, 
      jsonb_array_elements(
        activity_incoming_data.activity_payload #> '{form_data, activity_subtype_data, TerrestrialPlants}') as json_array, 
        (
          activity_incoming_data.activity_payload #> '{form_data, activity_subtype_data, Observation_PlantTerrestrial_Information}') as json_data 
          from 
            activity_incoming_data
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
          where 
            activity_subtype = 'Activity_Observation_PlantTerrestrial' 
            and activity_incoming_data_id in (
              select 
                incoming_data_id 
              from 
                activity_current
            )
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
          c.jurisdictions, 
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
          c.geom, 
          c.geog 
        FROM 
          invasivesbc.common_summary c 
          join terrestrial_plant_select t on t.activity_incoming_data_id = c.activity_incoming_data_id 
        where 
          c.activity_subtype = 'Activity_Observation_PlantTerrestrial' 
          and c.activity_incoming_data_id in (
            select 
              incoming_data_id 
            from 
              activity_current
          )
          and c.form_status = 'Submitted'
      );

      `;

export async function up(knex: Knex): Promise<void> {
  await knex.raw(create_all_summary_views);
}

/**
 * Drop the `application_user` table.
 *
 * @export
 * @param {Knex} knex
 * @return {*}  {Promise<void>}
 */
export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    set schema '${DB_SCHEMA}';
    set search_path = ${DB_SCHEMA},public;

    drop view if exists invasivesbc.activity_current;
  `);
}
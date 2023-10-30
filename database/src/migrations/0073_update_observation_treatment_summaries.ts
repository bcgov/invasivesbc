import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(
    `
    set 
    search_path = invasivesbc, 
    public;
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
                                                                                      'YYYY-MM-DD HH24:MI:SS'
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
                                 
  
  CREATE OR REPLACE FUNCTION invasivesbc.code_to_name()
   RETURNS trigger
   LANGUAGE plpgsql
  AS $function$
      BEGIN
          set search_path=invasivesbc,public;
        
    
        WITH species_code_by_activity_id AS (
        
          SELECT aid.activity_incoming_data_id, 
              aid.activity_id,
              
              case when jsonb_typeof(species_positive) <> 'array' or species_positive  = '[]' 
              then '[null]' else jsonb_array_elements_text(species_positive) 
              end AS positive_code,
              
              case when jsonb_typeof(species_negative) <> 'array' or species_negative  = '[]' 
              then '[null]' else jsonb_array_elements_text(species_negative) 
              end AS negative_code, 
    
              case when jsonb_typeof(species_treated) <> 'array' or species_treated  = '[]' 
              then '[null]' else jsonb_array_elements_text(species_treated) 
              end AS treated_code,
              
              case when jsonb_typeof(coalesce(activity_payload #> '{form_data, activity_subtype_data, Biocontrol_Collection_Information}', 
              activity_payload #> '{form_data, activity_subtype_data, Monitoring_BiocontrolDispersal_Information}',
              activity_payload #> '{form_data, activity_subtype_data, Monitoring_BiocontrolRelease_TerrestrialPlant_Information}',
              activity_payload #> '{form_data, activity_subtype_data, Biocontrol_Release_Information}', '[]')) <> 'array'
              or coalesce(activity_payload #> '{form_data, activity_subtype_data, Biocontrol_Collection_Information}', 
              activity_payload #> '{form_data, activity_subtype_data, Monitoring_BiocontrolDispersal_Information}',
              activity_payload #> '{form_data, activity_subtype_data, Monitoring_BiocontrolRelease_TerrestrialPlant_Information}',
              activity_payload #> '{form_data, activity_subtype_data, Biocontrol_Release_Information}', '[]') = '[]'
              then '[null]' else jsonb_array_elements(coalesce(activity_payload #> '{form_data, activity_subtype_data, Biocontrol_Collection_Information}', 
              activity_payload #> '{form_data, activity_subtype_data, Monitoring_BiocontrolDispersal_Information}',
              activity_payload #> '{form_data, activity_subtype_data, Monitoring_BiocontrolRelease_TerrestrialPlant_Information}',
              activity_payload #> '{form_data, activity_subtype_data, Biocontrol_Release_Information}')) 
              end AS biocontrol_code
              
          FROM 
            invasivesbc.activity_incoming_data aid   
          inner join invasivesbc.activity_current ac on ac.incoming_data_id = aid.activity_incoming_data_id 
                  
          where ac.activity_id = new.activity_id
          GROUP BY activity_incoming_data_id
        ),
        species_positive_translated_by_activity_id as (
        
          select im.char_code, sid.positive_code, im.invbc_name, sid.activity_id, sid.activity_incoming_data_id
          from 	iapp_invbc_mapping im
          inner join species_code_by_activity_id sid on sid.positive_code = im.char_code
        
        ),
          species_negative_translated_by_activity_id as (
        
          select im.char_code, sid.negative_code, im.invbc_name, sid.activity_id, sid.activity_incoming_data_id
          from 	iapp_invbc_mapping im
          inner join species_code_by_activity_id sid on sid.negative_code = im.char_code
        
        ),
        species_treated_translated_by_activity_id as (
        
          select im.char_code, sid.treated_code, im.invbc_name, sid.activity_id, sid.activity_incoming_data_id
          from 	iapp_invbc_mapping im
          inner join species_code_by_activity_id sid on sid.treated_code = im.char_code
        
        ),
        species_biocontrol_translated_by_activity_id as (
        
          select im.code_name, sid.biocontrol_code ->> 'biological_agent_code', im.code_description, sid.activity_id, sid.activity_incoming_data_id
          from 	code im
          inner join species_code_by_activity_id sid on sid.biocontrol_code ->> 'biological_agent_code' = im.code_name
          where im.code_header_id = 43
        
        ),
        species_positive_description_aggregated_by_activity_id as (
          select array_to_string(ARRAY_AGG(st.invbc_name), ', ') as species_positive_full,
          st.activity_id,
          st.activity_incoming_data_id
          from species_positive_translated_by_activity_id st
          group by st.activity_id, st.activity_incoming_data_id
        ),
        species_negative_description_aggregated_by_activity_id as (
              select array_to_string(ARRAY_AGG(st.invbc_name), ', ') as species_negative_full, 
              st.activity_id,
              st.activity_incoming_data_id
              from species_negative_translated_by_activity_id st
              group by st.activity_id, st.activity_incoming_data_id
        ),   
        species_treated_description_aggregated_by_activity_id as (
            select array_to_string(ARRAY_AGG(st.invbc_name), ', ') as species_treated_full, 
            st.activity_id,
            st.activity_incoming_data_id
            from species_treated_translated_by_activity_id st
            group by st.activity_id, st.activity_incoming_data_id
        ),
        species_biocontrol_description_aggregated_by_activity_id as (
            select array_to_string(ARRAY_AGG(st.code_description), ', ') as species_biocontrol_full, 
            st.activity_id,
            st.activity_incoming_data_id
            from species_biocontrol_translated_by_activity_id st
            group by st.activity_id, st.activity_incoming_data_id
        ),
        species_full_descriptions_by_activity_id as (
        select ac.activity_id, ac.incoming_data_id AS activity_incoming_data_id, species_positive_full, species_negative_full, species_treated_full, species_biocontrol_full  
        from activity_current ac 
        left join species_positive_description_aggregated_by_activity_id sp on sp.activity_id = ac.activity_id
        left join species_negative_description_aggregated_by_activity_id sn on sn.activity_id = ac.activity_id 
        left join species_treated_description_aggregated_by_activity_id st on st.activity_id = ac.activity_id 
        left join species_biocontrol_description_aggregated_by_activity_id sb on sb.activity_id = ac.activity_id
          
        where ac.activity_id = new.activity_id
        )
        
        UPDATE activity_incoming_data aid
        set species_positive_full = sf.species_positive_full,
            species_negative_full = sf.species_negative_full,
            species_treated_full = sf.species_treated_full,
            species_biocontrol_full = sf.species_biocontrol_full
            
        FROM 	species_full_descriptions_by_activity_id sf
        
        WHERE 	aid.activity_incoming_data_id = sf.activity_incoming_data_id
        and 	aid.activity_incoming_data_id = new.activity_incoming_data_id
        and 	aid.activity_id = new.activity_id;
              
          RETURN NEW;
      END
      $function$
  ;
`
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`

  set search_path='invasivesbc';



  `);
}

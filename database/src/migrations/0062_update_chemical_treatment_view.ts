import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(
    `
    set 
    search_path = invasivesbc, 
    public;
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
                    ) jurisdiction
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
                    j.jurisdiction,
                    a.activity_incoming_data_id,
                    a.activity_id,
                    a.activity_payload #>> '{short_id}' as short_id,
                    l.project as project_code,
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
                                  left join project_list l on l.activity_incoming_data_id = a.activity_incoming_data_id
                                  left join treatment_person_list t on t.activity_incoming_data_id = a.activity_incoming_data_id
                                  left join person_list p on p.activity_incoming_data_id = a.activity_incoming_data_id
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
    
`
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`

  set search_path='invasivesbc';



  `);
}

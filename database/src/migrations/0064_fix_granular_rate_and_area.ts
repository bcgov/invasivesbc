import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(
    `
    set 
  search_path = invasivesbc, 
  public;
with type_code as (
  select 
    activity_incoming_data_id, 
    jsonb_array_elements(
      activity_payload #> '{form_data, activity_subtype_data, chemical_treatment_details, herbicides}') as herbicide_array
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
    select_this as (
      select 
        a.activity_incoming_data_id, 
        activity_subtype, 
        t.herbicide_array #>> '{herbicide_type_code}' as herbicide_type_code, 
        t.herbicide_array #>> '{product_application_rate}' as product_application_rate,
        t.herbicide_array #>> '{product_application_rate_calculated}' as product_application_rate_calculated,
        t.herbicide_array #>> '{delivery_rate_of_mix}' as delivery_rate,
        t.herbicide_array #>> '{amount_of_mix}' as amount_of_mix
      from 
        activity_incoming_data a 
        join type_code t on t.activity_incoming_data_id = a.activity_incoming_data_id 
      where 
        a.activity_incoming_data_id in (
          select 
            incoming_data_id 
          from 
            activity_current
        ) 
        and a.activity_subtype = 'Activity_Treatment_ChemicalPlantTerrestrial' 
        and t.herbicide_array #>> '{herbicide_type_code}' = 'G'
        and t.herbicide_array #>> '{product_application_rate}' is not null
        ), 
    calculation_array as (
      select 
        activity_incoming_data_id, 
        jsonb_array_elements(
          activity_payload #> '{form_data, activity_subtype_data, chemical_treatment_details, calculation_results, invasive_plants}') as results_array,
          activity_payload #>> '{form_data, activity_subtype_data, chemical_treatment_details, calculation_results, dilution}' as dilution
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
            and jsonb_array_length(
              activity_payload #> '{form_data, activity_subtype_data, chemical_treatment_details, calculation_results, invasive_plants}') = 1
              ), 
            calculation_select as (
              select 
                activity_incoming_data_id, 
                results_array #>> '{amount_of_undiluted_herbicide_used_liters}' as amount_of_undiluted_herbicide_used_liters,
                results_array #>> '{percentage_area_covered}' as percentage_area_covered,
                dilution 
              from 
                calculation_array
            ), 
            stuff_to_fix as (
              select 
                s.activity_incoming_data_id, 
                s.herbicide_type_code, 
                s.delivery_rate :: numeric, 
                s.product_application_rate :: numeric, 
                s.product_application_rate_calculated :: numeric, 
                s.amount_of_mix :: numeric, 
                c.amount_of_undiluted_herbicide_used_liters :: numeric, 
                c.percentage_area_covered :: numeric, 
                c.dilution :: numeric 
              from 
                select_this s 
                inner join calculation_select c on c.activity_incoming_data_id = s.activity_incoming_data_id 
              where 
                s.product_application_rate :: float8 < 10
            ) 
          UPDATE 
            activity_incoming_data as a 
          SET 
            activity_payload = jsonb_set(
              jsonb_set(
                jsonb_set(
                  jsonb_set(
                    a.activity_payload, 
                    '{form_data, activity_subtype_data, chemical_treatment_details, herbicides, 0, product_application_rate}', 
                    round(
                      (
                        s.product_application_rate * 1000
                      ), 
                      4
                    ):: text :: jsonb, 
                    false
                  ), 
                  '{form_data, activity_subtype_data, chemical_treatment_details, herbicides, 0, product_application_rate_calculated}', 
                  round(
                    (
                      s.product_application_rate_calculated * 1000
                    ), 
                    4
                  ):: text :: jsonb, 
                  false
                ), 
                '{form_data, activity_subtype_data, chemical_treatment_details, calculation_results, dilution}', 
                round(
                  (
                    (
                      (
                        s.product_application_rate_calculated * 1000
                      ) / s.delivery_rate
                    ) * 100
                  ), 
                  4
                ):: text :: jsonb, 
                false
              ), 
              '{form_data, activity_subtype_data, chemical_treatment_details, calculation_results, invasive_plants, 0, amount_of_undiluted_herbicide_used_liters}', 
              round(
                (
                  (
                    (
                      s.product_application_rate_calculated * 1000
                    ) / s.delivery_rate
                  ) * s.amount_of_mix
                ), 
                4
              ):: text :: jsonb, 
              false
            ) 
          from 
            stuff_to_fix s 
          WHERE 
            a.activity_incoming_data_id = s.activity_incoming_data_id;
           
WITH batch_json AS (
  SELECT 
    id, 
    jsonb_array_elements(
      json_representation #> '{rows}') AS batch_rows
      FROM 
        batch_uploads 
      where 
        template like '%temp%'
    ), 
    batch_select AS (
      SELECT 
        batch_rows #>> '{data,Area}' AS batch_area,
        batch_rows #>> '{rowIndex}' AS batch_index,
        id 
      FROM 
        batch_json
    ), 
    payload_select AS (
      SELECT 
        activity_payload #>> '{form_data,activity_data,reported_area}' AS blob_area,
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
      '{form_data,activity_data,reported_area}', 
      to_jsonb(b.batch_area), 
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
    
`
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`

  set search_path='invasivesbc';



  `);
}

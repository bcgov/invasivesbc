import { Knex } from 'knex';

export async function up(knex: Knex) {
  await knex.raw(
    //language=PostgreSQL
    `
      set search_path = invasivesbc,public;

      CREATE OR REPLACE FUNCTION invasivesbc.jurisdiction_mapping()
        RETURNS trigger
        LANGUAGE plpgsql
      AS
      $function$
      BEGIN
        set search_path = invasivesbc,public;

        with jurisdictions as (select activity_incoming_data_id,
                                      jurisdictions_array
                               from activity_incoming_data
                                      left join jsonb_array_elements(
                                 activity_payload #> '{form_data, activity_data, jurisdictions}') jurisdictions_array
                                                on true
                               where activity_incoming_data_id = new.activity_incoming_data_id),
             jurisdictions_description as (select activity_incoming_data_id,
                                                  string_agg(
                                                    concat(
                                                      jurisdiction_codes.code_description,
                                                      ' ' || '(',
                                                      (
                                                        jurisdictions_array #>> '{percent_covered}' || '%)')
                                                    ),
                                                    ', '
                                                    order by
                                                      jurisdiction_codes.code_description
                                                  ) jurisdiction
                                           from jurisdictions
                                                  left join code_header jurisdiction_code_header on
                                             jurisdiction_code_header.code_header_title = 'jurisdiction_code'
                                               and jurisdiction_code_header.valid_to is null
                                                  left join code jurisdiction_codes on
                                             jurisdiction_codes.code_header_id = jurisdiction_code_header.code_header_id
                                               and jurisdictions_array #>> '{jurisdiction_code}' =
                                                   jurisdiction_codes.code_name

                                           where jurisdictions.jurisdictions_array is not null

                                           group by activity_incoming_data_id)
        UPDATE activity_incoming_data
        SET jurisdiction_display = s.jurisdiction
        FROM jurisdictions_description s
        WHERE activity_incoming_data.activity_incoming_data_id = s.activity_incoming_data_id
          AND activity_incoming_data.activity_incoming_data_id = NEW.activity_incoming_data_id
          and iscurrent;
        RETURN NEW;
      END
      $function$
      ;
    `
  );
}

export async function down(knex: Knex) {
  await knex.raw(
    //language=PostgreSQL
    `
      set search_path to invasivesbc, public;

      CREATE FUNCTION invasivesbc.jurisdiction_mapping() RETURNS trigger
        LANGUAGE plpgsql
      AS
      $$
      BEGIN
        set search_path = invasivesbc,public;
        -- Get mapping table
        WITH codes AS
               (SELECT *
                FROM code
                WHERE code_header_id =
                      (SELECT code_header_id
                       FROM code_header
                       WHERE code_header_description = 'jurisdiction_code')),
             -- Get jurisdiction codes
             mapped AS
               (SELECT activity_id, jurisdiction_percentage, code_description
                FROM activity_jurisdictions,
                     codes
                WHERE jurisdiction_code = code_name),
             -- Collect jurisdiction codes into strings
             stringified AS
               (SELECT activity_id,
                       STRING_AGG(code_description::text || ' (' || jurisdiction_percentage::TEXT || '%)',
                                  ', ') AS jurisdictions
                FROM mapped
                GROUP BY activity_id)
        UPDATE activity_incoming_data
        SET jurisdiction_display = s.jurisdictions
        FROM stringified s
        WHERE activity_incoming_data.activity_id = s.activity_id
          AND activity_incoming_data.activity_id = NEW.activity_id;
        RETURN NEW;
      END
      $$;


    `
  );
}

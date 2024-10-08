import { Knex } from 'knex';

export async function up(knex: Knex) {
  await knex.raw(
    //language=PostgreSQL
    `
      CREATE OR REPLACE VIEW invasivesbc.activity_jurisdictions
      AS
      WITH jurisdictions AS (SELECT a_1.activity_incoming_data_id,
                                    jsonb_array_elements(a_1.activity_payload #>
                                                         '{form_data,activity_data,jurisdictions}'::text[]) AS jurisdictions_array
                             FROM invasivesbc.activity_incoming_data a_1
                             where a_1.iscurrent = true)
      SELECT a.activity_id,
             a.activity_incoming_data_id,
             j.jurisdictions_array,
             btrim((j.jurisdictions_array -> 'jurisdiction_code'::text)::text, '"'::text) AS jurisdiction_code,
             btrim((j.jurisdictions_array -> 'percent_covered'::text)::text,
                   '"'::text)::double precision                                           AS jurisdiction_percentage
      FROM invasivesbc.activity_incoming_data a
             LEFT JOIN jurisdictions j ON j.activity_incoming_data_id = a.activity_incoming_data_id
      where a.iscurrent = true
      ORDER BY a.activity_id DESC;



      set search_path = 'invasivesbc', 'public';
      ALTER VIEW activity_jurisdictions RENAME TO activity_jurisdictions_raw;
      create materialized view if not exists activity_jurisdictions as
      select *
      from activity_jurisdictions_raw;


    `
  );
}

export async function down(knex: Knex) {
  await knex.raw(`
  `);
}

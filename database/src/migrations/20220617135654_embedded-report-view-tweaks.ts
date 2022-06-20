import * as Knex from 'knex';

const DB_SCHEMA = 'invasivesbc';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    DROP VIEW ${DB_SCHEMA}.embedded_reports_view;

    CREATE VIEW ${DB_SCHEMA}.embedded_reports_view AS
      (
      SELECT r.id           AS id,
             r.metabase_resource as metabase_resource,
             r.metabase_id as metabase_id,
             r.display_name AS name,
             c.name         AS category
      FROM ${DB_SCHEMA}.embedded_reports                  r
             JOIN ${DB_SCHEMA}.embedded_report_categories c ON r.category_id = c.id
      WHERE r.enabled IS TRUE
      ORDER BY c.sort_order ASC, c.name ASC, r.sort_order ASC, r.display_name ASC
        );
    `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    `);
}

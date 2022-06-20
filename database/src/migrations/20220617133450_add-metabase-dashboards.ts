import * as Knex from 'knex';

const DB_SCHEMA = 'invasivesbc';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    CREATE TYPE embedded_metabase_resource_type AS ENUM ('dashboard', 'question');
    ALTER TABLE ${DB_SCHEMA}.embedded_reports rename column id to metabase_id;
    ALTER TABLE ${DB_SCHEMA}.embedded_reports DROP CONSTRAINT embedded_reports_pkey;
    ALTER TABLE ${DB_SCHEMA}.embedded_reports add column id int NULL;
    UPDATE ${DB_SCHEMA}.embedded_reports set id = metabase_id;
    CREATE SEQUENCE ${DB_SCHEMA}.embedded_reports_id_seq START 10000 OWNED by ${DB_SCHEMA}.embedded_reports.id;
    ALTER TABLE ${DB_SCHEMA}.embedded_reports ALTER column id SET NOT NULL;
   ALTER TABLE ${DB_SCHEMA}.embedded_reports ALTER column id SET default nextval('${DB_SCHEMA}.embedded_reports_id_seq');
    ALTER TABLE ${DB_SCHEMA}.embedded_reports ADD CONSTRAINT embedded_reports_pkey PRIMARY KEY (id);

    ALTER TABLE ${DB_SCHEMA}.embedded_reports add column metabase_resource embedded_metabase_resource_type not null default 'question';

    DROP VIEW ${DB_SCHEMA}.embedded_reports_view;

    CREATE VIEW ${DB_SCHEMA}.embedded_reports_view AS
      (
      SELECT r.id           AS id,
             r.metabase_resource as metabase_resource,
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

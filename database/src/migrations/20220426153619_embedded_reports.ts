import * as Knex from 'knex';

const DB_SCHEMA = 'invasivesbc';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    CREATE TABLE ${DB_SCHEMA}.embedded_report_categories
    (
      id         SERIAL PRIMARY KEY,
      name       VARCHAR(128) NOT NULL UNIQUE,
      sort_order INT          NOT NULL DEFAULT 1000 CHECK (sort_order > 0)
    );

    CREATE TABLE ${DB_SCHEMA}.embedded_reports
    (
      id           INTEGER PRIMARY KEY CHECK (id > 0),
      category_id  INTEGER      NOT NULL REFERENCES ${DB_SCHEMA}.embedded_report_categories (id) ON DELETE RESTRICT,
      display_name VARCHAR(100) NOT NULL UNIQUE,
      enabled      BOOLEAN      NOT NULL DEFAULT TRUE,
      sort_order   INT          NOT NULL DEFAULT 1000 CHECK (sort_order > 0)
    );

    COMMENT ON COLUMN ${DB_SCHEMA}.embedded_reports.id IS 'must match ID of metabase report';

      CREATE VIEW ${DB_SCHEMA}.embedded_reports_view AS
      (
      SELECT r.id           AS id,
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
    DROP VIEW ${DB_SCHEMA}.embedded_reports_view;
    DROP TABLE ${DB_SCHEMA}.embedded_reports;
    DROP TABLE ${DB_SCHEMA}.embedded_report_categories;
  `);
}

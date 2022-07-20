import * as Knex from 'knex';

const DB_SCHEMA = 'public';

export async function up(knex: Knex): Promise<void> {
  try {
    const sql = `
      set schema '${DB_SCHEMA}';
      set client_encoding to utf8;
      set standard_conforming_strings to on;

      drop table if exists regional_districts;

      CREATE TABLE "public"."regional_districts" (gid serial,
        "agency" varchar(200),
        "agency_cd" varchar(40),
        "dropdown_n" varchar(240),
        "geog" geography(MULTIPOLYGON,4326));

      ALTER TABLE "public"."regional_districts" ADD PRIMARY KEY (gid);

      CREATE INDEX "regional_districts_geog_geom_idx" ON "public"."regional_districts" USING GIST ("geog");
    `;
    await knex.raw(sql);
  } catch (e) {
    console.error('Error loading Regional Districts', e);
  }
}

export async function down(knex: Knex): Promise<void> {
  try {
    const sql = `
      set schema '${DB_SCHEMA}';
      set client_encoding to utf8;
      set standard_conforming_strings to on;

      drop table if exists regional_districts;
    `;
    await knex.raw(sql);
  } catch (e) {
    console.error('Error deleting Regional Districts', e);
  }
}

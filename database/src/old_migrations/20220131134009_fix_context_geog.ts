import { Knex } from 'knex';

const DB_SCHEMA = 'public';

export async function up(knex: Knex): Promise<void> {
  try {
    const sql = `
      set schema '${DB_SCHEMA}';
      set client_encoding to utf8;
      set standard_conforming_strings to on;

      -- Aggregate
      alter table "${DB_SCHEMA}"."aggregate" add column "geog" ${DB_SCHEMA}.geography(MULTIPOLYGON,4326);
      update "${DB_SCHEMA}"."aggregate" set "geog" = ${DB_SCHEMA}.geography("geom");
      CREATE INDEX "aggregate_geog_geom_idx" ON "${DB_SCHEMA}"."aggregate" USING GIST ("geog");
      alter table "${DB_SCHEMA}"."aggregate" drop column "geom";
      
      -- invasive_plant_management_areas
      alter table "${DB_SCHEMA}"."invasive_plant_management_areas" add column "geog" ${DB_SCHEMA}.geography(MULTIPOLYGON,4326);
      update "${DB_SCHEMA}"."invasive_plant_management_areas" set "geog" = ${DB_SCHEMA}.geography("geom");
      CREATE INDEX "invasive_plant_management_areas_geog_geom_idx" ON "${DB_SCHEMA}"."invasive_plant_management_areas" USING GIST ("geog");
      alter table "${DB_SCHEMA}"."invasive_plant_management_areas" drop column "geom";
      
      -- regional_invasive_species_organization_areas
      alter table "${DB_SCHEMA}"."regional_invasive_species_organization_areas" add column "geog" ${DB_SCHEMA}.geography(MULTIPOLYGON,4326);
      update "${DB_SCHEMA}"."regional_invasive_species_organization_areas" set "geog" = ${DB_SCHEMA}.geography(st_force2d("geom"));
      CREATE INDEX "regional_invasive_species_organization_areas_geog_geom_idx" ON "${DB_SCHEMA}"."regional_invasive_species_organization_areas" USING GIST ("geog");
      alter table "${DB_SCHEMA}"."regional_invasive_species_organization_areas" drop column "geom";
      
      -- jurisdiction
      alter table "${DB_SCHEMA}"."jurisdiction" add column "geog" ${DB_SCHEMA}.geography(MULTIPOLYGON,4326);
      update "${DB_SCHEMA}"."jurisdiction" set "geog" = ${DB_SCHEMA}.geography("geom");
      CREATE INDEX "jurisdiction_geog_geom_idx" ON "${DB_SCHEMA}"."jurisdiction" USING GIST ("geog");
      alter table "${DB_SCHEMA}"."jurisdiction" drop column "geom";
    `;
    await knex.raw(sql);
  } catch (e) {
    console.error('Error migrating context tables', e);
  }
}

export async function down(knex: Knex): Promise<void> {
  try {
    const sql = `
      set schema '${DB_SCHEMA}';
      set client_encoding to utf8;
      set standard_conforming_strings to on;

      -- Aggregate
      SELECT AddGeometryColumn('','aggregate','geom','4326','MULTIPOLYGON',2);
      update "${DB_SCHEMA}"."aggregate" set "geom" = ${DB_SCHEMA}.geometry("geog");
      CREATE INDEX ON "${DB_SCHEMA}"."aggregate" USING GIST ("geom");
      alter table "${DB_SCHEMA}"."aggregate" drop column "geog";

      -- invasive_plant_management_areas
      SELECT AddGeometryColumn('','invasive_plant_management_areas','geom','4326','MULTIPOLYGON',2);
      update "${DB_SCHEMA}"."invasive_plant_management_areas" set "geom" = ${DB_SCHEMA}.geometry("geog");
      CREATE INDEX ON "${DB_SCHEMA}"."invasive_plant_management_areas" USING GIST ("geom");
      alter table "${DB_SCHEMA}"."invasive_plant_management_areas" drop column "geog";

      -- regional_invasive_species_organization_areas
      SELECT AddGeometryColumn('','regional_invasive_species_organization_areas','geom','4326','MULTIPOLYGON',2);
      update "${DB_SCHEMA}"."regional_invasive_species_organization_areas" set "geom" = ${DB_SCHEMA}.geometry("geog");
      CREATE INDEX ON "${DB_SCHEMA}"."regional_invasive_species_organization_areas" USING GIST ("geom");
      alter table "${DB_SCHEMA}"."regional_invasive_species_organization_areas" drop column "geog";

      -- jurisdiction
      SELECT AddGeometryColumn('','jurisdiction','geom','4326','MULTIPOLYGON',2);
      update "${DB_SCHEMA}"."jurisdiction" set "geom" = ${DB_SCHEMA}.geometry("geog");
      CREATE INDEX ON "${DB_SCHEMA}"."jurisdiction" USING GIST ("geom");
      alter table "${DB_SCHEMA}"."jurisdiction" drop column "geog";
      `;
    await knex.raw(sql);
  } catch (e) {
    console.error('Error rolling back migration of context tables', e);
  }
}

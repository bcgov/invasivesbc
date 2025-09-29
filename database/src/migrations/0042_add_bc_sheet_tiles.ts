import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.raw(`
    -- Add geom_3857 columns
    ALTER TABLE invasivesbc.nts_50k_grid ADD COLUMN IF NOT EXISTS geom_3857 geometry(MultiPolygon, 3857);
    UPDATE invasivesbc.nts_50k_grid SET geom_3857 = ST_Transform(geog::geometry, 3857);

    ALTER TABLE invasivesbc.nts_250k_grid ADD COLUMN IF NOT EXISTS geom_3857 geometry(MultiPolygon, 3857);
    UPDATE invasivesbc.nts_250k_grid SET geom_3857 = ST_Transform(geog::geometry, 3857);

    -- Create spatial indexes
    CREATE INDEX IF NOT EXISTS nts_50k_grid_geom3857_gix ON invasivesbc.nts_50k_grid USING GIST(geom_3857);
    CREATE INDEX IF NOT EXISTS nts_250k_grid_geom3857_gix ON invasivesbc.nts_250k_grid USING GIST(geom_3857);

    -- Create bc_sheet_tiles table
    CREATE TABLE IF NOT EXISTS invasivesbc.bc_sheet_tiles (
      sheet_id TEXT NOT NULL,
      scale TEXT NOT NULL CHECK (scale IN ('50k', '250k')),
      z INT NOT NULL,
      x INT NOT NULL,
      y INT NOT NULL,
      PRIMARY KEY (sheet_id, scale, z, x, y)
    );

    -- Create index on bc_sheet_tiles
    CREATE INDEX IF NOT EXISTS bc_sheet_tiles_sheet_z_idx ON invasivesbc.bc_sheet_tiles (sheet_id, z);

    -- Create build_bc_sheet_tiles function
    CREATE OR REPLACE FUNCTION invasivesbc.build_bc_sheet_tiles(p_scale TEXT, p_zmin INT, p_zmax INT)
    RETURNS VOID
    LANGUAGE plpgsql
    AS $$
    DECLARE
      rec RECORD;
      tiles_per_axis INT;
      tile_size NUMERIC;
      WORLD CONSTANT NUMERIC := 20037508.342789244;
      z INT;
      xmin INT; xmax INT; ymin INT; ymax INT;
      sql TEXT;
    BEGIN
      SET search_path = invasivesbc, public;

      IF p_scale NOT IN ('50k', '250k') THEN
        RAISE EXCEPTION 'scale must be 50k or 250k';
      END IF;

      sql := FORMAT(
        'SELECT gid::text AS sheet_id, geom_3857 AS g FROM %I',
        CASE WHEN p_scale = '50k' THEN 'nts_50k_grid' ELSE 'nts_250k_grid' END
      );

      FOR rec IN EXECUTE sql LOOP
        FOR z IN p_zmin..p_zmax LOOP
          tiles_per_axis := (1 << z);
          tile_size := (2.0 * WORLD) / tiles_per_axis;
          xmin := FLOOR((ST_XMin(rec.g) + WORLD) / tile_size)::INT;
          xmax := FLOOR((ST_XMax(rec.g) + WORLD) / tile_size)::INT;
          ymin := FLOOR((WORLD - ST_YMax(rec.g)) / tile_size)::INT;
          ymax := FLOOR((WORLD - ST_YMin(rec.g)) / tile_size)::INT;

          IF xmin < 0 THEN xmin := 0; END IF;
          IF ymin < 0 THEN ymin := 0; END IF;
          IF xmax > (tiles_per_axis - 1) THEN xmax := (tiles_per_axis - 1); END IF;
          IF ymax > (tiles_per_axis - 1) THEN ymax := (tiles_per_axis - 1); END IF;

          IF xmin > xmax OR ymin > ymax THEN
            CONTINUE;
          END IF;

          INSERT INTO invasivesbc.bc_sheet_tiles (sheet_id, scale, z, x, y)
          SELECT rec.sheet_id, p_scale, z, x, y
          FROM generate_series(xmin, xmax) AS x,
               generate_series(ymin, ymax) AS y
          WHERE ST_Intersects(rec.g, ST_TileEnvelope(z, x, y))
          ON CONFLICT DO NOTHING;
        END LOOP;
      END LOOP;

      ANALYZE invasivesbc.bc_sheet_tiles;
    END;
    $$;

    -- Run function for 50k scale; takes about 4-5min to run at zoom 16
    SELECT invasivesbc.build_bc_sheet_tiles('50k', 0, 16);
  `);
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(`
    -- Drop function
    DROP FUNCTION IF EXISTS invasivesbc.build_bc_sheet_tiles(text, int, int);

    -- Drop indexes
    DROP INDEX IF EXISTS nts_50k_grid_geom3857_gix;
    DROP INDEX IF EXISTS nts_250k_grid_geom3857_gix;
    DROP INDEX IF EXISTS bc_sheet_tiles_sheet_z_idx;

    -- Drop table
    DROP TABLE IF EXISTS invasivesbc.bc_sheet_tiles;

    -- Drop columns
    ALTER TABLE invasivesbc.nts_50k_grid DROP COLUMN IF EXISTS geom_3857;
    ALTER TABLE invasivesbc.nts_250k_grid DROP COLUMN IF EXISTS geom_3857;
  `);
}

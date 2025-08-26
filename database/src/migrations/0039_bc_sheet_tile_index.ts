import { Knex } from 'knex';

export const config = { transaction: false };

export async function up(knex: Knex): Promise<void> {
  await knex.schema.raw(`
    ALTER TABLE invasivesbc.nts_50k_grid
    ADD COLUMN geom_3857 geometry(MultiPolygon, 3857);
  `);

  await knex.schema.raw(`
    UPDATE invasivesbc.nts_50k_grid
    SET geom_3857 = ST_Transform(geog::geometry, 3857)
    WHERE geog IS NOT NULL;
  `);

  await knex.schema.raw(`
    CREATE OR REPLACE FUNCTION update_geom_3857()
    RETURNS trigger AS $$
    BEGIN
      NEW.geom_3857 := ST_Transform(NEW.geog::geometry, 3857);
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);

  await knex.schema.raw(`
    CREATE TRIGGER trg_update_geom_3857
    BEFORE INSERT OR UPDATE ON invasivesbc.nts_50k_grid
    FOR EACH ROW
    EXECUTE FUNCTION update_geom_3857();
  `);
}

export async function down(knex: Knex): Promise<void> {
  try {
    await knex.schema.raw(`
      DROP TRIGGER IF EXISTS trg_update_geom_3857 ON invasivesbc.nts_50k_grid;
    `);

    await knex.schema.raw(`
      DROP FUNCTION IF EXISTS update_geom_3857;
    `);

    await knex.schema.raw(`
      ALTER TABLE invasivesbc.nts_50k_grid
      DROP COLUMN IF EXISTS geom_3857;
    `);
  } catch (e) {
    console.error('Failed to rollback table:', e);
    throw e;
  }
}

/* Plug these in...
 
ALTER TABLE invasivesbc.nts_50k_grid 
ADD COLUMN geom_3857 geometry(MultiPolygon, 3857);

UPDATE invasivesbc.nts_50k_grid 
SET geom_3857 = ST_Transform(geog::geometry, 3857);

ALTER TABLE invasivesbc.nts_250k_grid 
ADD COLUMN geom_3857 geometry(MultiPolygon, 3857);

UPDATE invasivesbc.nts_250k_grid 
SET geom_3857 = ST_Transform(geog::geometry, 3857);

create index if not exists nts_50k_grid_geom3857_gix on invasivesbc.nts_50k_grid using GIST(geom_3857); 
create index if not exists nts_250k_grid_geom3857_gix on invasivesbc.nts_250k_grid using GIST(geom_3857); 

create table if not exists invasivesbc.bc_sheet_tiles (
	sheet_id text not null,
	scale text not null check (scale in ('50k', '250k')),
	z int not null,
	x int not null,
	y int not null,
	primary key (sheet_id, scale, z, x, y)
);

create index if not exists bc_sheet_tiles_sheet_z_idx on invasivesbc.bc_sheet_tiles (sheet_id, z);

CREATE OR REPLACE FUNCTION invasivesbc.build_bc_sheet_tiles(p_scale text, p_zmin int, p_zmax int)
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    rec RECORD;
	tiles_per_axis int;
	tile_size numeric;
	WORLD constant numeric:=20037508.342789244;
    z INT;
    xmin INT; xmax INT; ymin INT; ymax INT;
    sql TEXT;
BEGIN
	set search_path = invasivesbc,public;
    IF p_scale NOT IN ('50k', '250k') THEN
        RAISE EXCEPTION 'scale must be 50k or 250k';
    END IF;

    sql := format(
        'SELECT gid::text as sheet_id, geom_3857 AS g FROM %I',
        CASE WHEN p_scale = '50k' THEN 'nts_50k_grid' ELSE 'nts_250k_grid' END
    );

    FOR rec IN EXECUTE sql LOOP
        FOR z IN p_zmin..p_zmax LOOP
			tiles_per_axis:=(1<<z);
			tile_size:=(2.0*WORLD)/tiles_per_axis;
			xmin:=floor((st_xmin(rec.g)+WORLD)/tile_size)::int;
			xmax:=floor((st_xmax(rec.g)+WORLD)/tile_size)::int;
			ymin:=floor((WORLD-st_ymax(rec.g))/tile_size)::int;
			ymax:=floor((WORLD-st_ymin(rec.g))/tile_size)::int;
            
            IF xmin < 0 THEN xmin := 0; END IF;
            IF ymin < 0 THEN ymin := 0; END IF;
            IF xmax > (tiles_per_axis - 1) THEN xmax := (tiles_per_axis - 1); END IF;
            IF ymax > (tiles_per_axis - 1) THEN ymax := (tiles_per_axis - 1); END IF;

			IF xmin>xmax OR ymin>ymax then
				continue;
			end if;

            INSERT INTO invasivesbc.bc_sheet_tiles (sheet_id, scale, z, x, y)
            SELECT rec.sheet_id, p_scale, z, x, y
            FROM generate_series(xmin, xmax) AS x,
                 generate_series(ymin, ymax) AS y
            WHERE ST_Intersects(rec.g, ST_TileEnvelope(z,x,y))
            ON CONFLICT DO NOTHING;
        END LOOP;
    END LOOP;

    ANALYZE invasivesbc.bc_sheet_tiles;
END;
$$;


select invasivesbc.build_bc_sheet_tiles('250k', 0, 8);
select invasivesbc.build_bc_sheet_tiles('50k', 9, 12);
 */

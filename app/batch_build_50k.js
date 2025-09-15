import pkg from 'pg';
const { Pool } = pkg;
import * as path from 'path';
import fs from 'node:fs';
import { buildCell } from './build_cell_pmtiles.js';

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  const outDir = path.resolve('out_pmtiles_50k');
  const zMin = +(process.env.ZMIN || 9);
  const zMax = +(process.env.ZMAX || 16);
  const mode = (process.env.MODE) || 'build';
  const pmtilesBin = process.env.PMTILES_BIN || 'pmtiles';

  // where pmtiles are served
  const localBase = process.env.LOCAL_BASE || 'http://localhost:8080/';

  const pool = new Pool({ connectionString: dbUrl });
  fs.mkdirSync(outDir, { recursive: true });


  // ---  BUILD MODE ---
  // picking cells to build; missing from manifest
  // const {rows: cells } = await pool.query(`
  //   select s.gid::text as sheet_id
  //   from invasivesbc.nts_50k_grid s
  //   left join invasivesbc.pmtiles_manifest m
  //     on m.sheet_id=s.gid::text and m.minzoom=$1 and m.maxzoom=$2 where m.sheet_id is null;
  //   `, [zMin, zMax]);


  //    SELECT s.gid::text as sheet_id FROM invasivesbc.nts_50k_grid s WHERE s.gid IN (185, 175, 166, 158, 196, 186, 176, 167, 197);

  const { rows: cells } = await pool.query(
    `
    SELECT s.gid::text as sheet_id FROM invasivesbc.nts_50k_grid s WHERE s.gid IN (185);
    `
  );

  console.log(`building ${cells.length} cells...(z=${zMin}...${zMax})`);

  for (const { sheet_id } of cells) {
    const result = await buildCell(sheet_id, { zMin, zMax, outDir, dbUrl, pmtilesBin });
    if (!result) continue;
    const { pmPath, bytes } = result;

    //TO DO: upload pmPath to object storage
    const fileName = path.basename(pmPath);
    const url = localBase.replace(/\/+$/, '') + '/' + fileName;
    const url_no_ext = url.replace(".pmtiles", '');

    await pool.query(
      `
      INSERT INTO invasivesbc.pmtiles_manifest (scale, sheet_id, url, minzoom, maxzoom, bytes)
      VALUES ('50k', $1, $2, $3, $4, $5)
      ON CONFLICT (scale, sheet_id) DO UPDATE
        SET url=EXCLUDED.url, minzoom=EXCLUDED.minzoom, maxzoom=EXCLUDED.maxzoom, bytes=EXCLUDED.bytes, updated_at=now()
      `,
      [sheet_id, url, zMin, zMax, bytes]
    );


    console.log(`[manifest] ${sheet_id} -> ${fileName}`);
  }
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

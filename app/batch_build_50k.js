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
  const pmtilesBin = process.env.PMTILES_BIN || 'pmtiles';

  // pmtiles are served here
  // Run: npx http-server ./out_pmtiles_50k -p 8080 --cors
  const localBase = process.env.LOCAL_BASE || 'http://localhost:8080/';

  const pool = new Pool({ connectionString: dbUrl });
  fs.mkdirSync(outDir, { recursive: true });


  // The tiles selected here are around the Penticton area. Confirm downloaded pmtiles in http://pmtiles.io/
  const { rows: cells } = await pool.query(
    `
    SELECT s.gid::text as sheet_id FROM invasivesbc.nts_50k_grid s WHERE s.gid IN (185, 175, 166, 158, 196, 186, 176, 167, 197);
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

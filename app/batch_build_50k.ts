import { Pool } from 'pg';
import * as path from 'path';
import * as fs from 'fs';
import { buildCell } from './build_cell_pmtiles';

type Mode = 'build' | 'register';

async function main() {
  // const [zMin, zMax, outDir] = process.argv.slice(2);
  const dbUrl = process.env.DATABASE_URL!;
  const outDir = path.resolve('out_pmtiles_50k');
  const zMin = +(process.env.ZMIN || 9);
  const zMax = +(process.env.ZMAX || 12);
  // const uploadBase = process.env.UPLOAD_BASE;
  const mode = (process.env.MODE as Mode) || 'build';
  const pmtilesBin = process.env.PMTILES_BIN || 'pmtiles';

  // where pmtiles are served
  const localBase = process.env.LOCAL_BASE || 'http://localhost:8080/';

  const pool = new Pool({ connectionString: dbUrl });
  fs.mkdirSync(outDir, { recursive: true });

  // --- REGISTER MODE ---

  if (mode === 'register') {
    const files = fs.readdirSync(outDir).filter((f) => f.endsWith('.pmtiles'));
    console.log(`Registering ${files.length} local files from ${outDir}`);

    for (const f of files) {
      const m = f.match(/^sheet_50k_(.+)\.pmtiles$/);
      if (!m) continue;
      const sheet_id = m[1];
      const pmPath = path.join(outDir, f);
      const stat = fs.statSync(pmPath);
      const url = localBase.replace(/\/+$/, '') + '/' + f;

      await pool.query(
        `
      INSERT INTO invasivesbc.pmtiles_manifest (scale, sheet_id, url, minzoom, maxzoom, bytes)
      VALUES ('50k', $1, $2, $3, $4, $5)
      ON CONFLICT (scale, sheet_id) DO UPDATE
        SET url=EXCLUDED.url, minzoom=EXCLUDED.minzoom, maxzoom=EXCLUDED.maxzoom, bytes=EXCLUDED.bytes, updated_at=now()
      `,
        [sheet_id, url, zMin, zMax, stat.size]
      );
      console.log(`[manifest] registered ${sheet_id} -> ${url}`);
    }

    return;
  }

  // ---  BUILD MODE ---
  // picking cells to build; missing from manifest
  // const {rows: cells } = await pool.query(`
  //   select s.gid::text as sheet_id
  //   from invasivesbc.nts_50k_grid s
  //   left join invasivesbc.pmtiles_manifest m
  //     on m.sheet_id=s.gid::text and m.minzoom=$1 and m.maxzoom=$2 where m.sheet_id is null;
  //   `, [zMin, zMax]);

  const { rows: cells } = await pool.query(
    `
    SELECT s.gid::text as sheet_id FROM invasivesbc.nts_50k_grid s WHERE s.gid IN (185, 175, 166, 158, 196, 186, 176, 167, 197);
    `,
    [zMin, zMax]
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

    console.log(`[manifest] ${sheet_id} -> ${url}`);
  }
  await pool.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

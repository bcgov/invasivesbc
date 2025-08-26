#!/usr/bin/env node
import * as sqlite3 from 'sqlite3';
import fetch from 'node-fetch';
import { execFile } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import { Pool } from 'pg';

const execFileAsync = promisify(execFile);

type Tile = { z: number; x: number; y: number };

const WORLD_IMG = (z: number, x: number, y: number) =>
  `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`;

async function queryTiles(pool: Pool, gid: string, zMin: number, zMax: number): Promise<Tile[]> {
  const sql = `
    SELECT z,x,y
    FROM invasivesbc.bc_sheet_tiles
    WHERE sheet_id=$1 AND z BETWEEN $2 AND $3
    ORDER BY z,x,y`;
  const { rows } = await pool.query(sql, [gid, zMin, zMax]);
  return rows as Tile[];
}

function openMbTiles(outPath: string, name: string, format: 'jpg' | 'png' = 'jpg') {
  // const db = new sqlite3.Database('./public/assets/databases/tile_store.db');
  const db = new sqlite3.Database(outPath);
  //language=SQLite
  db.serialize(() => {
    db.run(`PRAGMA jounal_mode=WAL`);
    db.run(`PRAGMA synchronous=OFF`);
    db.run(`CREATE TABLE IF NOT EXISTS tiles (
        zoom_level integer, tile_column integer, tile_row integer, tile_data blob
      );`);
    db.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_tiles ON tiles (zoom_level, tile_column, tile_row);`);
    db.run(`CREATE TABLE IF NOT EXISTS metadata (name TEXT, value TEXT);`);
    db.run(
      `INSERT OR REPLACE INTO metadata(name, value) VALUES
        ('name',?),
        ('version','1.1'),
        ('type','baseLayer'),
        ('format', ?)`,
      [name, format]
    );
  });

  // function to insert many rows in one transaction
  function insertMany(rows: [number, number, number, Buffer][], done: (err?: Error) => void) {
    db.serialize(() => {
      db.run('BEGIN');
      const stmt = db.prepare(
        `INSERT OR REPLACE INTO tiles (zoom_level, tile_column,tile_row,tile_data) VALUES (?,?,?,?)`
      );
      for (const r of rows) {
        stmt.run(r, (err: Error | null) => {
          if (err) console.error('insert error', err);
        });
      }
      stmt.finalize();
      db.run('COMMIT', done);
    });
  }

  return { db, insertMany };
}

async function fetchTile(t: Tile): Promise<Buffer | null> {
  const url = WORLD_IMG(t.z, t.y, t.x);
  const r = await fetch(url, { timeout: 15000 });
  if (!r.ok) return null;
  const ab = await r.arrayBuffer();
  return Buffer.from(ab);
}

export async function buildCell(
  gid: string,
  opts: { zMin: number; zMax: number; outDir: string; dbUrl: string; pmtilesBin?: string }
) {
  const { zMin, zMax, outDir, dbUrl, pmtilesBin = 'pmtiles' } = opts;
  const pool = new Pool({ connectionString: dbUrl });

  console.log(`[cell ${gid}] querying tiles ${zMin}...${zMax}`);
  const tiles = await queryTiles(pool, gid, zMin, zMax);
  if (!tiles.length) {
    console.warn(`[cell ${gid}] no tiles in index for chosen zooms`);
    await pool.end();
    return null;
  }

  const base = `sheet_50k_${gid}`;
  const mbPath = path.join(outDir, `${base}.mbtiles`);
  const pmPath = path.join(outDir, `${base}.pmtiles`);
  fs.mkdirSync(outDir, { recursive: true });
  const { db, insertMany } = openMbTiles(mbPath, base, 'jpg');

  console.log(`[cell ${gid}] downloading ${tiles.length} tiles`);
  const CONC = 24;
  let i = 0;
  let inserted = 0;

  async function worker(batch: Tile[]) {
    const rows: [number, number, number, Buffer][] = [];
    for (const t of batch) {
      try {
        const buf = await fetchTile(t);
        if (!buf) continue;
        const tmsY = (1 << t.z) - 1 - t.y; // XYZ->TMS
        rows.push([t.z, t.x, tmsY, buf]);
      } catch {
        // retry logic
      }
    }
    if (rows.length) {
      insertMany(rows, (err) => {
        if (err) console.error('batch insert finished', err);
      });
      inserted += rows.length;
    }
  }

  const batchSize = 64;
  const tasks: Promise<void>[] = [];
  while (i < tiles.length) {
    const batch = tiles.slice(i, i + batchSize);
    const w = worker(batch);
    tasks.push(w);
    while (tasks.length >= CONC) {
      await Promise.race(tasks).catch(() => {});
      for (let k = tasks.length - 1; k >= 0; k--) {
        if ((tasks[k] as any).isFulfilled || (tasks[k] as any).isRejected) tasks.splice(k, 1);
      }
    }
    i += batchSize;
  }
  console.log(`[cell ${gid}] inserted ${inserted}`);
  await Promise.allSettled(tasks);
  db.close();
  await pool.end();

  console.log(`[cell ${gid}]convert MBTiles -> PMTiles`);
  await execFileAsync(pmtilesBin, ['convert', mbPath, pmPath]);

  const stat = fs.statSync(pmPath);
  console.log(`[cell ${gid}] done, size=${stat.size} bytes, file=${pmPath}`);
  return { pmPath, bytest: stat.size, zMin, zMax };
}

// start here
if (require.main === module) {
  const [gid, zMin, zMax, outDir] = process.argv.slice(2);
  if (!gid || !zMin || !zMax || !outDir) {
    console.error('All arguments needed');
    process.exit(1);
  }
  buildCell(gid, { zMin: +zMin, zMax: +zMax, outDir, dbUrl: process.env.DATABASE_URL! }).catch((e) => {
    console.error('All arguments needed', e);
    process.exit(1);
  });
}

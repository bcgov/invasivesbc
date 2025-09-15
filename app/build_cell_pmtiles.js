#!/usr/bin/env node
import sqlite3 from 'sqlite3';
import fetch from 'node-fetch';
import { execFile } from 'child_process';
import { promisify } from 'util';
import fs from 'node:fs';
import * as path from 'path';
import https from 'https';
import pkg from 'pg';
const { Pool } = pkg;
const execFileAsync = promisify(execFile);
import sharp from 'sharp';

const WORLD_IMG = (z, x, y) =>
  `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`;

// -------------- DB Helpers --------------

async function queryTiles(pool, gid, zMin, zMax) {
  const sql = `
    SELECT z,x,y
    FROM invasivesbc.bc_sheet_tiles
    WHERE sheet_id=$1 AND z BETWEEN $2 AND $3
    ORDER BY z,x,y`;
  const { rows } = await pool.query(sql, [gid, zMin, zMax]);
  return rows;
}

function openMbTiles(outPath, name, format = 'jpg') {
  const db = new sqlite3.Database(outPath);
  //language=SQLite
  db.serialize(() => {
    db.run(`PRAGMA jounal_mode=WAL`);
    db.run(`PRAGMA synchronous=OFF`);
    db.run(`PRAGMA locking_mode=EXCLUSIVE`);
    db.run(`PRAGMA temp_store=MEMORY`);
    db.run(`PRAGMA mmap_size=268435456`);
    db.run(`PRAGMA cache_size=-50000`); // ~50mb in-memory cache

    db.run(`CREATE TABLE IF NOT EXISTS tiles (
        zoom_level integer, 
        tile_column integer, 
        tile_row integer, 
        tile_data blob
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

  // Promise-based bulk insert inside a single transaction
  function insertMany(rows) {
    return new Promise((resolve, reject) => {
      if (!rows.length) return resolve();
      db.serialize(() => {
        db.run('BEGIN');
        const stmt = db.prepare(
          `INSERT OR REPLACE INTO tiles (zoom_level, tile_column,tile_row,tile_data) VALUES (?,?,?,?)`
        );
        for (const r of rows) {
          stmt.run(r, (err) => {
            if (err) console.error('insert error', err);
          });
        }
        stmt.finalize((err) => {
          if (err) return reject(err);
          db.run('COMMIT', (err2) => (err2 ? reject(err2) : resolve(err)));
        });
      });
    });
  }

  return { db, insertMany };
}


// -------------- HTTP fetch (keep-alive+retry) --------------

const keepAliveAgent = new https.Agent({
  keepAlive: true,
  maxSockets: 64,
  maxFreeSockets: 16,
  timeout: 30_000
});

async function fetchTile(t, attempts = 3) {
  console.log(`[url] fetching tiles ${t.z}, ${t.y}, ${t.x}`);
  const url = WORLD_IMG(t.z, t.y, t.x);
  let backoff = 200;

  for (let i = 0; i < attempts; i++) {
    try {
      const r = await fetch(url, { agent: keepAliveAgent, timeout: 15_000 });
      if (r.ok) {
        const ab = await r.arrayBuffer();
        return Buffer.from(ab);
      }
    } catch {
      // ignore and retry
    }
    await new Promise((r) => setTimeout(r, backoff + Math.random() * 150));
    backoff *= 2;
  }
  return null;

  // const r = await fetch(url, { timeout: 15000 });
  // if (!r.ok) return null;
  // const ab = await r.arrayBuffer();
  // return Buffer.from(ab);

  // const buf = Buffer.from(await r.arrayBuffer());
  // return sharp(buf).webp({ quality: 80 }).toBuffer();

  // return sharp(buf).webp({ lossless:True }).toBuffer();
}

// -------------- Concurrency Limiter --------------

function createLimiter(limit) {
  let active = 0;
  const queue = [];

  function runNext() {
    if (active >= limit || queue.length === 0) return;
    active++;
    const { fn, resolve, reject } = queue.shift();
    (async () => fn())()
      .then((v) => {
        active--;
        resolve(v);
        runNext();
      })
      .catch((e) => {
        active--;
        reject(e);
        runNext();
      });
  }
  return (fn) => new Promise((resolve, reject) => {
    queue.push({ fn, resolve, reject });
    runNext();
  })
}

// -------------- Main Build --------------

export async function buildCell(gid, opts) {
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


  // Concurrency/backpressure params
  const highZoom = zMax >= 15;
  const CONC = +(process.env.FETCH_CONC || (highZoom ? 16 : 24)); // fewer at high zooms
  const FLUSH_THRESHOLD = +(process.env.FLUSH_THRESHOLD || (highZoom ? 600 : 1000));

  const limit = createLimiter(CONC);
  let pendingRows = [];
  let fetched = 0;
  let inserted = 0;

  const flush = async (force = false) => {
    if (!pendingRows.length) return;
    const toWrite = pendingRows;
    pendingRows = []; // free memory before I/O
    await insertMany(toWrite);
    inserted += toWrite.length;
    if (force || inserted % 10_000 === 0) {
      console.log(`[cell ${gid}] inserted ${inserted.toLocaleString()} tiles`);
    }
  };
  console.log(`[cell ${gid}] downloading ${tiles.length.toLocaleString()} tiles (conc=${CONC}, flush=${FLUSH_THRESHOLD})`);

  // Schedule all fetches through the limiter (no bounded tasks array)
  const jobs = tiles.map((t) =>
    limit(async () => {
      const buf = await fetchTile(t);
      if (!buf) return;

      // Convert XYZ to TMS row index
      const tmsY = (1 << t.z) - 1 - t.y;

      // Push one row; the buffer is freed after flush
      pendingRows.push([t.z, t.x, tmsY, buf]);
      fetched++;

      // Periodic flush to bound heap
      if (pendingRows.length >= FLUSH_THRESHOLD) {
        await flush();
      }
    })
  );

  // Wait for all work under bounded concurrency
  await Promise.allSettled(jobs);

  // Final flush
  await flush(true);

  // Close SQLite and PG before conversion
  db.close();
  await pool.end();

  console.log(`[cell ${gid}]convert MBTiles -> PMTiles`);

  await execFileAsync(pmtilesBin, ['convert', mbPath, pmPath]);

  // Clean up mbtiles to reclaim disk
  try {
    fs.unlinkSync(mbPath);
  } catch {
    //ignore
  }

  const stat = fs.statSync(pmPath);
  console.log(`[cell ${gid}] done, size=${stat.size.toLocaleString()} bytes, file=${pmPath}`);
  return { pmPath, bytes: stat.size, zMin, zMax };
  // async function worker(batch) {
  //   const rows = [];
  //   for (const t of batch) {
  //     try {
  //       const buf = await fetchTile(t);
  //       if (!buf) continue;
  //       const tmsY = (1 << t.z) - 1 - t.y; // XYZ->TMS
  //       rows.push([t.z, t.x, tmsY, buf]);
  //     } catch {
  //       // retry logic
  //     }
  //   }
  //   if (rows.length) {
  //     insertMany(rows, (err) => {
  //       if (err) console.error('batch insert finished', err);
  //     });
  //   }
  // }

  // const batchSize = 64;
  // const tasks = [];
  // while (i < tiles.length) {
  //   const batch = tiles.slice(i, i + batchSize);
  //   const w = worker(batch);
  //   tasks.push(w);
  //   while (tasks.length >= CONC) {
  //     await Promise.race(tasks).catch(() => { });
  //     for (let k = tasks.length - 1; k >= 0; k--) {
  //       if ((tasks[k]).isFulfilled || (tasks[k]).isRejected) tasks.splice(k, 1);
  //     }
  //   }
  //   i += batchSize;
  // }
  // await Promise.allSettled(tasks);
  // db.close();
  // await pool.end();

  // console.log(`[cell ${gid}]convert MBTiles -> PMTiles`);
  // await execFileAsync(pmtilesBin, ['convert', mbPath, pmPath]);
  // try {
  //   fs.unlinkSync(mbPath);
  // } catch (err) {
  //   console.warn("Could not delete");
  // }
  // const stat = fs.statSync(pmPath);
  // console.log(`[cell ${gid}] done, size=${stat.size} bytes, file=${pmPath}`);
  // return { pmPath, bytes: stat.size, zMin, zMax };
}

// CLI

// const [gid, zMin, zMax, outDir] = process.argv.slice(2);
// if (!gid || !zMin || !zMax || !outDir) {
//   console.error('All arguments needed');
//   process.exit(1);
// }
// console.log("-->", gid, zMin, zMax, outDir);

// buildCell(gid, { zMin: +zMin, zMax: +zMax, outDir, dbUrl: process.env.DATABASE_URL }).catch((e) => {
//   console.error('All arguments needed', e);
//   process.exit(1);
// });

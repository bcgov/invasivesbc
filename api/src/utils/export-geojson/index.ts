import { tmpdir } from 'os';
import Crypto from 'crypto';
import zlib from 'node:zlib';
import { Readable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { createWriteStream } from 'node:fs';

import { exec } from 'child_process';

import * as Path from 'path';
import * as fs from 'fs';
import { getLogger } from '../logger';
import { S3ACLRole } from '../../constants/misc';
import AWS from 'aws-sdk';
import { ALL_ACTIVITY_SQL, PUBLIC_IAPP_SQL } from '../../queries/export-queries';
import Cursor from 'pg-cursor';
import { DELETE_STALE_EXPORT_RECORD, STALE_EXPORTS_SQL } from '../../queries/export-record-queries';

const defaultLog = getLogger('exports');

const OBJECT_STORE_BUCKET_NAME = process.env.OBJECT_STORE_BUCKET_NAME;
const OBJECT_STORE_URL = process.env.OBJECT_STORE_URL || 'nrs.objectstore.gov.bc.ca';
const AWS_ENDPOINT = new AWS.Endpoint(OBJECT_STORE_URL);

const S3 = new AWS.S3({
  endpoint: AWS_ENDPOINT.href,
  accessKeyId: process.env.OBJECT_STORE_ACCESS_KEY_ID,
  secretAccessKey: process.env.OBJECT_STORE_SECRET_KEY_ID,
  signatureVersion: 'v4',
  s3ForcePathStyle: true
});

async function dumpGeoJSONToFileAsDict(connection, filename, query) {
  const cursor = await connection.query(new Cursor(query.text, query.values));

  defaultLog.debug({ message: 'Writing query result to tempfile', filename });

  const streamed = Readable.from(
    (async function* (): AsyncIterableIterator<string> {
      yield '{\n';
      let first = true;
      let page = await cursor.read(1);
      do {
        for (const row of page) {
          const stringified = JSON.stringify(row['feature'], null, 0);
          yield `${first ? '\n' : ',\n'}${JSON.stringify(row['key'].toString())}: ${stringified}`;
        }
        first = false;
        page = await cursor.read(100);
      } while (page.length > 0);
      yield '}\n';
      defaultLog.debug({ message: 'read complete' });
    })()
  );

  await pipeline(streamed, zlib.createGzip(), createWriteStream(filename));
}

export async function cleanupOldExports(connection) {
  const result = await connection.query(STALE_EXPORTS_SQL.text, STALE_EXPORTS_SQL.values);
  const queuedDeletionIDs = [];

  for (const row of result.rows) {
    try {
      defaultLog.debug({ message: `Deleting stale export record`, id: row['id'], filename: row['file_reference'] });
      await S3.deleteObject({
        Bucket: OBJECT_STORE_BUCKET_NAME,
        Key: row['file_reference']
      }).promise();
    } catch (e) {
      defaultLog.error({ message: 'error deleting stale S3 object', error: e });
    } finally {
      queuedDeletionIDs.push(row['id']);
    }
  }

  for (const id of queuedDeletionIDs) {
    const deletionQuery = DELETE_STALE_EXPORT_RECORD(id);
    try {
      await connection.query(deletionQuery.text, deletionQuery.values);
    } catch (e) {
      defaultLog.error({ message: 'error marking stale object as deleted in local DB', error: e });
    }
  }

  defaultLog.info({ message: `Deleted stale export records` });
}

export async function doActivityAndIAPPExports(connection) {
  const randomBytes = Crypto.randomBytes(6).readUIntLE(0, 6).toString(36);
  const filePrefix = Path.join(tmpdir(), `export.${randomBytes}`);
  const env = process.env.ENVIRONMENT || 'local';

  const last_activity_res = await connection.query(
    'select max(activity_incoming_data_id) as last from activity_incoming_data'
  );
  const last_iapp_res = await connection.query('select max(site_id) as last from iapp_site_summary_and_geojson');

  const generation_meta = [
    {
      filename: `${filePrefix}-${env}-iapp.json.gz`,
      export_type: 'iapp',
      last_record: last_activity_res.rows[0]['last'],
      s3key: `iapp.${randomBytes}.${env}.json.gz`
    },
    {
      filename: `${filePrefix}-${env}-activities.json.gz`,
      export_type: 'activities',
      last_record: last_iapp_res.rows[0]['last'],
      s3key: `activities.${randomBytes}.${env}.json.gz`
    }
  ];

  await dumpGeoJSONToFileAsDict(connection, generation_meta[0].filename, PUBLIC_IAPP_SQL);
  await dumpGeoJSONToFileAsDict(connection, generation_meta[1].filename, ALL_ACTIVITY_SQL);

  for (const f of generation_meta) {
    try {
      await S3.upload({
        Bucket: OBJECT_STORE_BUCKET_NAME,
        Body: fs.readFileSync(f.filename),
        Key: f.s3key,
        ACL: S3ACLRole.AUTH_READ,
        ContentEncoding: 'gzip',
        ContentType: 'application/json',
        Metadata: {},
        CacheControl: 'max-age=86400'
      }).promise();

      // push the signed URL out to console for manual verification
      const testURL = S3.getSignedUrl('getObject', {
        Bucket: OBJECT_STORE_BUCKET_NAME,
        Key: f.s3key,
        Expires: 900
      });

      defaultLog.info({ message: 'upload complete', filename: f.filename, testURL: testURL });

      await connection.query(
        `insert into export_records (export_type, last_record, file_reference)
         values ($1, $2, $3)`,
        [f.export_type, f.last_record, f.s3key]
      );
    } finally {
      fs.unlinkSync(f.filename);
    }
  }

  defaultLog.info({ message: 'uploads complete' });
}

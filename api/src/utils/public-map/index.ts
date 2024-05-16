import { tmpdir } from 'os';
import Crypto from 'crypto';
import { exec } from 'child_process';

import * as Path from 'path';
import * as fs from 'fs';
import AWS from 'aws-sdk';
import { getLogger } from 'utils/logger';
import { S3ACLRole } from 'constants/misc';
import { PUBLIC_ACTIVITY_SQL, PUBLIC_IAPP_SQL } from 'queries/public-map';

const defaultLog = getLogger('tile_processor');

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

async function dumpGeoJSONToFile(connection, filename, query) {
  const response = await connection.query(query.text, query.values);

  defaultLog.debug({ message: 'Writing query result to tempfile', filename });
  fs.writeFileSync(
    filename,
    JSON.stringify(
      response.rows.map((r) => r['feature']),
      null,
      2
    )
  );
}

export async function buildPublicMapExport(connection) {
  const randomBytes = Crypto.randomBytes(6).readUIntLE(0, 6).toString(36);
  const filePrefix = Path.join(tmpdir(), `map.${randomBytes}`);

  await dumpGeoJSONToFile(connection, `${filePrefix}-iapp.json`, PUBLIC_IAPP_SQL);
  await dumpGeoJSONToFile(connection, `${filePrefix}-activities.json`, PUBLIC_ACTIVITY_SQL);

  try {
    await new Promise<void>((resolve, reject) => {
      exec(
        `tippecanoe -o ${filePrefix}.mbtiles -n InvasivesBC -z15 -r1 -aC --cluster-distance=4 -Liapp:${filePrefix}-iapp.json -Linvasives:${filePrefix}-activities.json`,
        (error, stdout, stderr) => {
          if (error) {
            defaultLog.error({ message: 'Error in tippecanoe', stdout, stderr });
            reject('Subprocess returned error code');
          }
          resolve();
        }
      );
    });
  } catch (e) {
    defaultLog.error({ message: 'error in tippecanoe', error: e });
  } finally {
    fs.unlinkSync(`${filePrefix}-iapp.json`);
    fs.unlinkSync(`${filePrefix}-activities.json`);
  }

  defaultLog.info({ message: 'tippecanoe pass complete, now optimizing with pmtiles' });

  try {
    await new Promise<void>((resolve, reject) => {
      exec(`pmtiles convert ${filePrefix}.mbtiles ${filePrefix}.pmtiles`, (error, stdout, stderr) => {
        if (error) {
          defaultLog.error({ message: 'Error in pmtiles', stdout, stderr });
          reject('Subprocess returned error code');
        }
        resolve();
      });
    });
  } catch (e) {
    defaultLog.error({ message: 'error in pmtiles', error: e });
  } finally {
    fs.unlinkSync(`${filePrefix}.mbtiles`);
  }

  const s3key = `invasives-${process.env.ENVIRONMENT || 'local'}.pmtiles`;

  defaultLog.info({ message: `processing complete, starting upload of ${s3key}` });

  try {
    await S3.upload({
      Bucket: OBJECT_STORE_BUCKET_NAME,
      Body: fs.readFileSync(`${filePrefix}.pmtiles`),
      Key: s3key,
      ACL: S3ACLRole.PUBLIC_READ,
      Metadata: {}
    }).promise();
  } finally {
    fs.unlinkSync(`${filePrefix}.pmtiles`);
  }
}

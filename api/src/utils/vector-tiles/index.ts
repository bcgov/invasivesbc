import { PoolClient } from 'pg';
import { SQL, SQLStatement } from 'sql-template-strings';
import { getIAPPsites } from '../iapp-json-utils';
import { tmpdir } from 'os';
import Crypto from 'crypto';
import { exec } from 'child_process';

import * as Path from 'path';
import * as fs from 'fs';
import { getLogger } from '../logger';
import { getSitesBasedOnSearchCriteriaSQL } from '../../queries/iapp-queries';
import { S3ACLRole } from '../../constants/misc';
import AWS from 'aws-sdk';

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

export async function requestVectorLayerGeneration(connection: PoolClient, query): Promise<number> {
  /*
  Requests the generation of a vector tile layer for the given domain, principal, and query.

  Returns an ID that can be used to retrieve the status of vector tile generation.
   */

  const result = await connection.query(
    SQL`INSERT INTO vector_generation_request(data_version, domain, principal, query)
        values ($1, $2, $3, $4)
        returning vector_generation_request_id as id;`,
    ['test', 'IAPP', 'public', JSON.stringify(query)]
  );

  return result.rows[0]['id'];
}

export async function getLatestProcessingRequestID(connection): Promise<number | null> {
  const result = await connection.query(
    SQL`SELECT vector_generation_request_id
        from vector_generation_request
        where status = 'NEW'
        order by created desc
        limit 1`
  );

  if (result.rowCount > 0) {
    return result.rows[0]['vector_generation_request_id'];
  }
  return null;
}

async function setVectorTileRequestStatus(connection, id, status) {
  await connection.query(
    SQL`UPDATE vector_generation_request
        set status = $2
        where vector_generation_request_id = $1`,
    [id, status]
  );
}

async function dumpGeoJSONToFile(connection, filename, domain, query) {
  if (domain !== 'IAPP') {
    throw new Error('Non-IAPP data not yet supported by GeoJSON renderer');
  }

  const sqlStatement: SQLStatement = getSitesBasedOnSearchCriteriaSQL(JSON.parse(query));

  if (!sqlStatement) {
    throw {
      code: 400,
      message: 'Failed to build SQL statement',
      namespace: 'iapp-json-utils'
    };
  }

  const response = await connection.query(sqlStatement.text, sqlStatement.values);

  defaultLog.debug({ message: 'Writing query result to tempfile', filename });
  fs.writeFileSync(filename, JSON.stringify(response.rows, null, 2));
}

export async function processVectorTileRequest(connection, id) {
  await setVectorTileRequestStatus(connection, id, 'PROCESSING');

  const details = (
    await connection.query(
      SQL`SELECT *
          from vector_generation_request
          where vector_generation_request_id = $1`,
      [id]
    )
  ).rows[0];

  const randomBytes = Crypto.randomBytes(6).readUIntLE(0, 6).toString(36);
  const filePrefix = Path.join(tmpdir(), `map.${randomBytes}`);

  await dumpGeoJSONToFile(connection, `${filePrefix}.json`, details.domain, details.query);

  try {
    await new Promise<void>((resolve, reject) => {
      exec(
        `tippecanoe -o ${filePrefix}.mbtiles -n IAPP -z22 -r1 --cluster-distance=3 -l iapp -S3 -ah -U 3 -ae ${filePrefix}.json`,
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
    await setVectorTileRequestStatus(connection, id, 'ERROR');
  } finally {
    fs.unlinkSync(`${filePrefix}.json`);
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
    await setVectorTileRequestStatus(connection, id, 'ERROR');
  } finally {
    fs.unlinkSync(`${filePrefix}.mbtiles`);
  }

  defaultLog.info({ message: `processing complete on ${id}, starting upload` });

  const s3key = `generated-${randomBytes}.pmtiles`;

  try {
    await S3.upload({
      Bucket: OBJECT_STORE_BUCKET_NAME,
      Body: fs.readFileSync(`${filePrefix}.pmtiles`),
      Key: s3key,
      ACL: S3ACLRole.PUBLIC_READ,
      Metadata: {}
    }).promise();

    await connection.query(
      SQL`UPDATE vector_generation_request
          set status = $2,
              object_key = $3
          where vector_generation_request_id = $1`,
      [id, 'READY', s3key]
    );
  } finally {
    fs.unlinkSync(`${filePrefix}.pmtiles`);
  }
}

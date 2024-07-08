import { parse, stringify } from 'wkt';
import * as turf from '@turf/helpers';
import booleanOverlap from '@turf/boolean-overlap';
import booleanWithin from '@turf/boolean-within';
import { getDBConnection } from 'database/db';
import { getLogger } from 'utils/logger';

const defaultLog = getLogger('batch');

export type parsedGeoType = {
  geojson: any;
  latitude: number;
  longitude: number;
  utm_zone: string;
  utm_northing: number;
  utm_easting: number;
  area: number;
  within_bc: boolean;
  geog: any;
};

export const validateAsWKT = (input: string) => {
  try {
    const parsed = parse(input);
    return parsed !== null;
  } catch (e) {
    defaultLog.error({ message: 'invalid wkt', input, error: e });
  }
  return false;
};

export const parseWKTasGeoJSON = (input: string) => {
  let parsed;
  try {
    parsed = parse(input);
    return parsed !== null ? parsed : null;
  } catch (e) {
    defaultLog.error({ message: 'invalid wkt', input, error: e });
  }
  return parsed;
};

export const parseGeoJSONasWKT = (input: any) => {
  let parsed;
  try {
    parsed = stringify(input);
    return parsed !== null ? parsed : null;
  } catch (e) {
    defaultLog.error({ message: 'invalid wkt', input, error: e });
  }
  return parsed;
};

/**
 * @desc Returns record matching shortID from Database, converts 'geog' into geojson
 * @param shortId short form ID for a given record
 * @return Record with 'activity_payload' removed to reduce size
 */
export const getRecordFromShort = async (shortId: string): Promise<Record<string, any>> => {
  const connection = await getDBConnection();
  if (!connection) { throw new Error('Could not get a DB Connection'); }

  try {
    const res = await connection.query({
      text: `
        SELECT *,
        st_asgeojson(geog) AS sample
        FROM activity_incoming_data
        WHERE short_id = $1 
        AND iscurrent = True
        LIMIT 1
      `,
      values: [shortId]
    });
    delete res.rows[0]['activity_payload']
    return res.rows[0];
  } catch (e) {
    defaultLog.error({
      message: '[getRecordFromShort]',
      error: e,
    });
  }
}
/**
 * @desc Parses database for record matching shortID
 * @param shortId shortForm of ID From batch upload record
 * @returns UUID - Longform ID of record (activity_id)
 */
export const getLongIDFromShort = async (shortId: string): Promise<string> => {
  const connection = await getDBConnection();
  if (!connection) { throw new Error('Could not get a DB Connection'); }

  try {
    const res = await connection.query({
      text: `
        SELECT activity_id
        FROM activity_incoming_data
        WHERE short_id = $1 
        AND iscurrent = True
        LIMIT 1
      `,
      values: [shortId]
    });

    return res.rows[0]['activity_id'];
  } catch (e) {
    defaultLog.error({
      message: '[getLongIDFromShort]',
      error: e,
    });
    throw new Error('Error validating geometry in the database' + e.message);
  }
}

/**
 * @desc Parses database for record matching shortID
 * @param shortId shortForm of ID From batch upload record
 * @returns UUID - Longform ID of record (activity_id)
 */
export const getRecordTypeFromShort = async (shortId: string): Promise<string> => {
  const connection = await getDBConnection();
  if (!connection) { throw new Error('Could not get a DB Connection'); }

  try {
    const res = await connection.query({
      text: `
        SELECT activity_id
        FROM activity_incoming_data
        WHERE short_id = $1 
        AND iscurrent = True
        LIMIT 1
      `,
      values: [shortId]
    });
    return res.rows[0]['activity_subtype'];
  } catch (e) {
    defaultLog.error({
      message: '[getRecordTypeFromShort]',
      error: e,
    });
    throw new Error('Error validating geometry in the database' + e.message);
  }
}

export const getGeometryAsGeoJSONFromShort = async (shortId: string): Promise<string> => {
  const connection = await getDBConnection();
  if (!connection) { throw new Error('Could not get a DB Connection'); }

  try {
    const res
      = await connection.query({
        text: `select geog
               from activity_incoming_data
               where short_id = $1`,
        values: [shortId]
      });

    return res.rows[0]['geog'];
  } catch (e) {
    console.log('error in getGeometryAsGeoJSONFromShort', e);
    throw new Error('Error validating geometry in the database' + e.message);
  }
}


export const autofillFromPostGIS = async (input: string, inputArea?: number): Promise<parsedGeoType> => {
  const connection = await getDBConnection();

  if (!connection) {
    throw new Error('Could not get a DB Connection');
  }
  try {
    const res = await connection.query({
      text: `select latitude,
                    longitude,
                    geojson,
                    within_bc,
                    utm_zone,
                    utm_easting,
                    utm_northing,
                    area,
                    geog
             from compute_geo_autofill($1)`,
      values: [input]
    });
    return {
      latitude: res.rows[0]['latitude'],
      longitude: res.rows[0]['longitude'],
      geojson: JSON.parse(res.rows[0]['geojson']), //comes back as text type, not json type
      within_bc: res.rows[0]['within_bc'],
      utm_zone: `${res.rows[0]['utm_zone']}`, // it's represented as a string in rjsf for some reason
      utm_northing: res.rows[0]['utm_northing'],
      utm_easting: res.rows[0]['utm_easting'],
      area: res.rows[0]['area'],
      geog: res.rows[0]['geog']
    };
  } catch (e) {
    console.log('error in autofillFromPostGIS', e);
    throw new Error('Error validating geometry in the database' + e.message);
  } finally {
    connection.release();
  }
};

const getOverlappedIndexes = (polygons: Array<turf.Polygon>, index: number) => {
  const overlappedIndexes = [];
  for (let i = 0; i < polygons.length; i++) {
    if (i !== index) {
      if (
        booleanOverlap(polygons[index], polygons[i]) ||
        booleanWithin(polygons[index], polygons[i]) ||
        booleanWithin(polygons[i], polygons[index])
      ) {
        overlappedIndexes.push(i);
      }
    }
  }
  return overlappedIndexes;
};

const checkPolygonsConnected = (polygons: Array<turf.Polygon>) => {
  const visited = new Array(polygons.length).fill(false);

  const dfs = (index) => {
    visited[index] = true;

    const overlapped = getOverlappedIndexes(polygons, index);
    for (const i of overlapped) {
      if (!visited[i]) {
        dfs(i);
      }
    }
  };

  dfs(0);

  return visited.every((isVisited) => isVisited);
};

export const multipolygonIsConnected = (input: string) => {
  const polygons = parse(input).coordinates.map((polygon) => turf.polygon(polygon));

  // if only one polygon in multipolygon, return true
  if (polygons.length <= 1) return true;

  // if more than two polygons
  return checkPolygonsConnected(polygons);
};

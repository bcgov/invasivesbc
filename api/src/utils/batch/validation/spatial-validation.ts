import { getDBConnection } from '../../../database/db';

import { parse } from 'wkt';
import { getLogger } from '../../logger';

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

export const autofillFromPostGIS = async (input: string): Promise<parsedGeoType> => {
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
                    area
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
      area: res.rows[0]['area']
    };
  } finally {
    connection.release();
  }
};

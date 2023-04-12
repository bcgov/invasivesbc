import {getDBConnection} from '../../database/db';

import {parse} from 'wkt';

export const validateAsWKT = (input: string) => {
  try {
    const parsed = parse(input);
    return parsed !== null ? true : false;
  } catch (e) {
    console.log('invalid wkt: ' + input);
  }
  return false;
};

export const checkWKTInBounds = async (input: string) => {
  const connection = await getDBConnection();

  if (!connection) {
    throw new Error('Could not get a DB Connection');
  }
  try {
    const res = await connection.query({
      text: `SELECT ST_Covers((SELECT geog from provincial_boundary where id = 1), ST_GeomFromText($1)) as valid`,
      values: [input]
    });
    return res.rows[0]['valid'];
  } finally {
    connection.release();
  }
};

export const computeWKTArea = async (input: string) => {
  const connection = await getDBConnection();

  if (!connection) {
    throw new Error('Could not get a DB Connection');
  }
  try {
    const res = await connection.query({
      text: `SELECT ST_Area(ST_GeomFromText($1)::geography) as area`,
      values: [input]
    });
    return res.rows[0]['area'];
  } finally {
    connection.release();
  }
};

import { SQL } from 'sql-template-strings';
import { PoolClient } from 'pg';
import QueryHandler from './endpoints/QueryHandler';
import LoggerHandler from './endpoints/LoggerHandler';
import getElevation from './context/getElevation';
import getWfsData from './context/getWfsData';
import getWell from './context/getWell';

const logger = new LoggerHandler('context-queries');

interface Params {
  activity_id: string;
  latitude: number;
  longitude: number;
  db?: PoolClient;
}
/**
 * @desc Insert contextual data for the new activity record from the BC Geographic Warehouse (BCGW)
 * @param id The record ID for the new activity
 */
const saveBCGW = async (params: Params) => {
  const { activity_id, latitude, longitude } = params;
  /* All the layers to get queried */
  const LAYERS = [
    {
      tableName: 'WHSE_CADASTRE.PMBC_PARCEL_FABRIC_POLY_SVW', // BCGW table
      targetAttribute: 'OWNER_TYPE', // The attribute to collect
      targetColumn: 'ownership' // The column in our database table
    },
    {
      tableName: 'WHSE_FOREST_VEGETATION.BEC_BIOGEOCLIMATIC_POLY',
      targetAttribute: 'BGC_LABEL',
      targetColumn: 'biogeoclimatic_zones'
    },
    {
      tableName: 'WHSE_ADMIN_BOUNDARIES.ADM_NR_DISTRICTS_SPG',
      targetAttribute: 'DISTRICT_NAME',
      targetColumn: 'flnro_districts'
    },
    {
      tableName: 'WHSE_ADMIN_BOUNDARIES.TADM_MOT_DISTRICT_BNDRY_POLY',
      targetAttribute: 'DISTRICT_NAME',
      targetColumn: 'moti_districts'
    }
  ];

  const db = params?.db ?? new QueryHandler({ maintain: true });
  for (const layer of LAYERS) {
    const { tableName, targetColumn, targetAttribute } = layer;
    try {
      const feature = await getWfsData(latitude, longitude, tableName);
      if (!feature?.properties?.[targetAttribute]) continue;
      const sql = SQL`
        UPDATE activity_incoming_data
        SET `.append(targetColumn).append(SQL` = ${feature.properties[targetAttribute]}
        WHERE activity_id = ${activity_id}
        AND iscurrent IS TRUE;
      `);
      await db.query(sql);
      logger.debug(`[saveBCGW] Updating Entry`, { targetColumn, value: feature.properties[targetAttribute] });
    } catch (e) {
      logger.error(e, `Error updating ${targetColumn}`);
      continue;
    }
  }
  if (!params?.db) {
    db?.close();
  }
};

/**
 * @desc Insert contextual data for the new activity record from local datasets housed in the PostGres database.
 * @param id The record ID for the new activity
 */
const saveElevation = async (params: Params) => {
  const { activity_id, latitude, longitude } = params;

  /* For each layer run an asynchronous request */
  const elevation = await getElevation(latitude, longitude);
  if (isNaN(elevation)) return;

  await (params?.db ?? new QueryHandler()).query(SQL`
    UPDATE activity_incoming_data
    SET elevation = round(${elevation}, 0)
    WHERE activity_id = ${activity_id}
    AND iscurrent IS TRUE;
  `);
};

/**
 * @desc Fetch the well nearest the activity, and update the DB entry
 */
const saveWell = async (params: Params): Promise<void> => {
  const { activity_id, longitude, latitude } = params;

  const { well, distance } = await getWell(latitude, longitude);

  if (!well || isNaN(distance)) return;

  await (params?.db ?? new QueryHandler()).query(SQL`
    UPDATE activity_incoming_data
    SET well_proximity = round(${distance} ,0)
    WHERE activity_id = ${activity_id}
    AND iscurrent IS TRUE
  `);

  logger.debug('[getWell]: Entered well proximity', { distance: distance, activity_id });
};

const commit = async (params: Params) => {
  await saveBCGW(params); // Insert DataBC BCGW attributes
  await saveElevation(params); // Insert elevation
  await saveWell(params); // Insert closest well
};

export { commit };

import axios from 'axios';
import { getDBConnection } from '../database/db';
import { getLogger } from './logger';

const defaultLog = getLogger('activity');

/**
 * Insert contextual data for the new activity record from
 * the BC Geographic Warehouse (BCGW)
 *
 * @param id {integar} The record ID for the activity recently
 *   entered in the database.
 * @param req {object} The express request object
 */
const saveBCGW = (id: any,req: any) => {
  const geom = req.body.locationAndGeometry;
  const x = geom.anchorPointX;
  const y = geom.anchorPointY;
  const api = `${req.protocol}://${req.get('host')}/api`
  const config = {
    headers: {
      authorization: req.headers.authorization
    }
  }

  /* All the layers to get queried */
  const layers = [
    {
      tableName: 'WHSE_CADASTRE.CBM_CADASTRAL_FABRIC_PUB_SVW', // BCGW table
      targetAttribute: 'OWNERSHIP_CLASS', // The attribute to collect
      targetColumn: 'ownership' // The column in our database table
    },{
      tableName: 'WHSE_FOREST_VEGETATION.BEC_BIOGEOCLIMATIC_POLY',
      targetAttribute: 'BGC_LABEL',
      targetColumn: 'biogeoclimatic_zones'
    },{
      tableName: 'WHSE_LEGAL_ADMIN_BOUNDARIES.ABMS_REGIONAL_DISTRICTS_SP',
      targetAttribute: 'ADMIN_AREA_NAME',
      targetColumn: 'regional_districts'
    },{
      tableName: 'WHSE_ADMIN_BOUNDARIES.ADM_NR_DISTRICTS_SPG',
      targetAttribute: 'DISTRICT_NAME',
      targetColumn: 'flnro_districts'
    },{
      tableName: 'WHSE_ADMIN_BOUNDARIES.TADM_MOT_DISTRICT_BNDRY_POLY',
      targetAttribute: 'DISTRICT_NAME',
      targetColumn: 'moti_districts'
    }
  ];

  /* For each layer run an asynchronous request */
  for (let layer of layers) {
    const url = `${api}/context/databc/${layer.tableName}?lon=${x}&lat=${y}`;

    axios.get(url,config)
      .then(async (response) => {
        const attribute = response.data.target[layer.targetAttribute];
        const column = layer.targetColumn;
        const connection = await getDBConnection();
        const sql = `
          update activity_incoming_data
          set (${column}) = ('${attribute}')
          where activity_id = '${id}'
        `;

        await connection.query(sql);

        connection.release();
      })
      .catch((error) => {
        defaultLog.debug({ label: 'addingContext', message: 'error', error });
      });
  }
};


/**
 * ## saveInternal
 * Insert contextual data for the new activity record from
 * local datasets housed in the PostGres database.
 *
 * @param id {integar} The record ID for the activity recently
 *   entered in the database.
 * @param req {object} The express request object
 */
const saveInternal = (id: any,req: any) => {
  const geom = req.body.locationAndGeometry;
  const x = geom.anchorPointX;
  const y = geom.anchorPointY;
  const api = `${req.protocol}://${req.get('host')}/api`
  const config = {
    headers: {
      authorization: req.headers.authorization
    }
  }

  /* All the layers to get queried */
  const layers = [
    {
      targetAttribute: 'ipma', // The attribute to collect
      targetColumn: 'invasive_plant_management_areas' // The column in our database table
    },{
      targetAttribute: 'riso',
      targetColumn: 'regional_invasive_species_organization_areas'
    },{
      targetAttribute: 'utm',
      targetColumn: 'utm_zone'
    }
  ];

  /* For each layer run an asynchronous request */
  for (let layer of layers) {
    const url = `${api}/context/internal/${layer.targetAttribute}?lon=${x}&lat=${y}`;

    axios.get(url,config)
      .then(async (response) => {
        const attribute = response.data.target;
        const column = layer.targetColumn;
        const connection = await getDBConnection();
        const sql = `
          update activity_incoming_data
          set (${column}) = ('${attribute}')
          where activity_id = '${id}'
        `;

        await connection.query(sql);

        connection.release();
      })
      .catch((error) => {
        defaultLog.debug({ label: 'addingContext', message: 'error', error });
      });
  }
};

export const commit = function (record:any,req:any) {
  const id = record.activity_id;
  saveBCGW(id,req); // Insert DataBC BCGW attributes
  saveInternal(id,req); // Insert local attributes
};
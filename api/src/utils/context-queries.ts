import axios from 'axios';
import { getDBConnection } from '../database/db';
import { getLogger } from './logger';
import { getWell } from '../paths/context/well';
import { insertWellDistanceSQL } from './../queries/context-queries';
import { SQL, SQLStatement } from 'sql-template-strings';

const defaultLog = getLogger('context-queries');

/**
 * Insert contextual data for the new activity record from
 * the BC Geographic Warehouse (BCGW)
 *
 * @param id {integer} The record ID for the activity recently
 *   entered in the database.
 * @param req {object} The express request object
 */
const saveBCGW = async (id: any, req: any) => {
  const lat = req.body.form_data.activity_data.latitude;
  const lon = req.body.form_data.activity_data.longitude;
  const api = `${req.protocol}://${req.get('host')}/api`;
  const config = {
    headers: {
      authorization: req.headers.authorization
    }
  };

  /* All the layers to get queried */
  const layers = [
    {
      tableName: 'WHSE_CADASTRE.CBM_CADASTRAL_FABRIC_PUB_SVW', // BCGW table
      targetAttribute: 'OWNERSHIP_CLASS', // The attribute to collect
      targetColumn: 'ownership' // The column in our database table
    },
    {
      tableName: 'WHSE_FOREST_VEGETATION.BEC_BIOGEOCLIMATIC_POLY',
      targetAttribute: 'BGC_LABEL',
      targetColumn: 'biogeoclimatic_zones'
    },
    {
      tableName: 'WHSE_LEGAL_ADMIN_BOUNDARIES.ABMS_REGIONAL_DISTRICTS_SP',
      targetAttribute: 'ADMIN_AREA_NAME',
      targetColumn: 'regional_districts'
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

  const sqlStatement: SQLStatement = SQL``;

  const queryBCGW = async (layer) => {
    const url = `${api}/context/databc/${layer.tableName}?lon=${lon}&lat=${lat}`;

    await axios
      .get(url, config)
      .then(async (response) => {
        const attribute = response.data.result[layer.targetAttribute];
        const column = layer.targetColumn;
        sqlStatement.append(`
          update activity_incoming_data
          set ${column} = '${attribute}'
          where activity_id = '${id}';
        `);
      })
      .catch((error) => {
        defaultLog.debug({ label: 'addingContext', message: 'error', error });
      });
  };

  /* Build the bulk insert statement*/
  for (const layer of layers) {
    await queryBCGW(layer);
  }

  const connection = await getDBConnection();

  await connection
    .query(sqlStatement.sql)
    .then(() => {
      defaultLog.info({ message: 'Successfully entered BCGW data.' });
    })
    .catch((err) => {
      defaultLog.error({ message: 'Error inserting BCGW data into the database', error: err });
    });

  connection.release();
};

/**
 * ## saveInternal
 * Insert contextual data for the new activity record from
 * local datasets housed in the PostGres database.
 *
 * @param id {integer} The record ID for the activity recently
 *   entered in the database.
 * @param req {object} The express request object
 */
const saveInternal = (id: any, req: any) => {
  const lat = req.body.form_data.activity_data.latitude;
  const lon = req.body.form_data.activity_data.longitude;
  const api = `${req.protocol}://${req.get('host')}/api`;
  const config = {
    headers: {
      authorization: req.headers.authorization
    }
  };

  /* All the layers to get queried */
  const layers = [
    {
      targetAttribute: 'ipma', // The attribute to collect
      targetColumn: 'invasive_plant_management_areas' // The column in our database table
    },
    {
      targetAttribute: 'riso',
      targetColumn: 'regional_invasive_species_organization_areas'
    },
    {
      targetAttribute: 'utm',
      targetColumn: 'utm_zone'
    }
  ];

  /* For each layer run an asynchronous request */
  for (const layer of layers) {
    const url = `${api}/context/internal/${layer.targetAttribute}?lon=${lon}&lat=${lat}`;

    axios
      .get(url, config)
      .then(async (response) => {
        const attribute = response.data.target;
        const column = layer.targetColumn;
        const connection = await getDBConnection();
        const sql = `
          update activity_incoming_data
          set ${column} = '${attribute}'
          where activity_id = '${id}'
        `;

        await connection
          .query(sql)
          .then(() => {
            defaultLog.info({ message: `Successfully entered ${attribute} into column ${column}` });
          })
          .catch((err) => {
            defaultLog.error({ message: 'Error inserting into the database', error: err });
          });

        connection.release();
      })
      .catch((error) => {
        defaultLog.debug({ label: 'addingContext', message: 'error', error });
      });
  }
};

/**
 * ## saveElevation
 * Insert contextual data for the new activity record from
 * local datasets housed in the PostGres database.
 *
 * @param id {integer} The record ID for the activity recently
 *   entered in the database.
 * @param req {object} The express request object
 */
const saveElevation = (id: any, req: any) => {
  const lat = req.body.form_data.activity_data.latitude;
  const lon = req.body.form_data.activity_data.longitude;
  const api = `${req.protocol}://${req.get('host')}/api`;
  const config = {
    headers: {
      authorization: req.headers.authorization
    }
  };

  /* For each layer run an asynchronous request */
  const url = `${api}/context/elevation?lon=${lon}&lat=${lat}`;

  axios
    .get(url, config)
    .then(async (response) => {
      const elevation = response.data.result;
      const connection = await getDBConnection();
      const sql = `
        update activity_incoming_data
        set elevation = round(${elevation}, 0)
        where activity_id = '${id}'
      `;

      await connection
        .query(sql)
        .then(() => {
          defaultLog.info({ message: 'Successfully entered elevation' });
        })
        .catch((err) => {
          defaultLog.error({ message: 'Error inserting into the database', error: err });
        });

      connection.release();
    })
    .catch((error) => {
      defaultLog.debug({ label: 'addingContext', message: 'error', error });
    });
};

/**
 * ## saveWell
 * Insert contextual well data for the new activity record from
 * local datasets housed in the PostGres database.
 *
 * @param id {integer} The record ID for the activity recently
 *   entered in the database.
 * @param req {object} The express request object
 */
const saveWell = (id: any, req: any) => {
  const a = req.body.form_data.activity_data;
  const payload = {
    query: {
      lon: a.longitude,
      lat: a.latitude
    }
  };

  /* ### callback
    Use a callback to insert the data
    @param bundle {object} The well object containing well data and distance.
   */
  const callback = async (bundle) => {
    const connection = await getDBConnection();
    const params = {
      distance: bundle.distance,
      id: id
    };

    const sql: SQLStatement = insertWellDistanceSQL(params);

    await connection
      .query(sql.text, sql.values)
      .then(() => {
        defaultLog.info({ message: 'Successfully entered well proximity' });
      })
      .catch((err) => {
        defaultLog.error({ message: 'Error inserting into the database', error: err });
      });

    connection.release();
  };

  getWell(payload, false, callback);
};

// TODO: Pass only what's necessary in the 'req' object.
export const commit = function (record: any, req: any) {
  const id = record.activity_id;
  saveBCGW(id, req); // Insert DataBC BCGW attributes
  saveInternal(id, req); // Insert local attributes
  saveElevation(id, req); // Insert elevation
  saveWell(id, req); // Insert the closest well
};

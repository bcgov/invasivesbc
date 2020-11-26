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
    }
  ];

  /* For each layer run an asynchronous request */
  for (let layer of layers) {
    const url = `${api}/context/databc/${layer.tableName}?lon=${x}&lat=${y}`

    axios.get(url,config)
      .then(async (response) => {
        const ownership = response.data.target[layer.targetAttribute];
        const column = layer.targetColumn;
        const connection = await getDBConnection();
        const sql = `
          update activity_incoming_data
          set (${column}) = ('${ownership}')
          where activity_incoming_data_id = ${id}
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
  const id = record.activity_incoming_data_id;
  saveBCGW(id,req); // Insert DataBC BCGW attributes
};
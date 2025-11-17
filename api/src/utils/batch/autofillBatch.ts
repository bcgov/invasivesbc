import SQL from 'sql-template-strings';
import { BCGW_SUPPLEMENTAL_LAYERS } from 'utils/context-queries';
import getElevation from 'utils/context/getElevation';
import getWell from 'utils/context/getWell';
import getWfsData from 'utils/context/getWfsData';
import LoggerHandler from 'utils/endpoints/LoggerHandler';
import QueryHandler from 'utils/endpoints/QueryHandler';

/**
 * @desc Get all external api values for records in a batch upload and update
 * @param batchId ID of Batch to update
 */
const autofillBatch = async (batchId: string | number): Promise<void> => {
  const START_TIME = Date.now();
  const STEP = 5;
  const db = new QueryHandler({ maintain: true });

  try {
    // Get needed information
    const { rows, rowCount } = await db.query(SQL`
      SELECT
        activity_id,
        (activity_payload::json->'form_data'->'activity_data'->>'latitude')::double precision as latitude,
        (activity_payload::json->'form_data'->'activity_data'->>'longitude')::double precision as longitude
      FROM activity_incoming_data
      WHERE batch_id = ${batchId}
      AND iscurrent
    `);

    db.query(SQL`BEGIN`);

    // Rotate through entry updates in controlled amounts by STEP,
    for (let i = 0; i < rowCount; i += STEP) {
      const valuesSql = SQL``;

      // Fetch Supplementary Data per row in API, append to valuesSQL
      for (let j = i; j < Math.min(rowCount, (i += STEP)); j++) {
        const { latitude, longitude, activity_id } = rows[j];

        // Fetch all supplementary values from sources asynchronously.
        const [well, elevation, ...[ownership, biogeoclimatic_zones, flnro_districts, moti_districts]] =
          await Promise.all([
            getWell(latitude, longitude),
            getElevation(latitude, longitude),
            ...BCGW_SUPPLEMENTAL_LAYERS.map(async (l) => {
              const data = await getWfsData(latitude, longitude, l.tableName);
              return data?.properties?.[l.targetAttribute] as string;
            })
          ]);

        valuesSql.append(SQL`
        (${activity_id}, ${elevation}, ${well.distance}, ${ownership}, ${moti_districts}, ${flnro_districts}, ${biogeoclimatic_zones})
      `);
        if (j < rows.length - 1) {
          valuesSql.append(SQL`,`);
        }
      }
      const query = SQL`
        UPDATE activity_incoming_data AS t
        SET
          elevation = c.elevation::integer,          -- Cast to correct type
          well_proximity = c.well_distance::integer, -- Cast to correct type
          flnro_districts = c.flnro_districts,
          moti_districts = c.moti_districts,
          ownership = c.ownership,
          biogeoclimatic_zones = c.biogeoclimatic_zones
        FROM
          (VALUES`.append(valuesSql).append(SQL`
          ) AS c(activity_id, elevation, well_distance, ownership, moti_districts, flnro_districts, biogeoclimatic_zones)
        WHERE
          c.activity_id::uuid = t.activity_id        -- Cast Text values to UUID
          AND t.batch_id = ${batchId}
          AND t.iscurrent
      `);
      await db.query(query); // Fire off batch round
    }
    await await db?.query(SQL`COMMIT`);
  } catch (e) {
    await db?.query(SQL`ROLLBACK`);
    throw e;
  } finally {
    db?.close();
    new LoggerHandler('autofillBatch').info(`Autofill for BatchID ${batchId} finished in ${Date.now() - START_TIME}ms`);
  }
};
export { autofillBatch };

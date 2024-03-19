import { getLogger } from './utils/logger.js';
import { cleanupOldExports, doActivityAndIAPPExports } from './utils/export-geojson/index.js';
import { getDBConnection } from './database/db.js';

const defaultLog = getLogger('geojson-exporter');

async function run() {
  const connection = await getDBConnection();
  await doActivityAndIAPPExports(connection);
  await cleanupOldExports(connection);
  await connection.release();
  defaultLog.info({ message: 'run complete' });
}

run().then(() => {
  defaultLog.info({ message: 'shutting down' });
});

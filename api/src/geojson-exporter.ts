import { getLogger } from './utils/logger';
import { getDBConnection } from './database/db';
import { cleanupOldExports, doActivityAndIAPPExports } from './utils/export-geojson';

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

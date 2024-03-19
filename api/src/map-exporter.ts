import { getLogger } from './utils/logger.js';
import { getDBConnection } from './database/db.js';
import { buildPublicMapExport } from './utils/public-map/index.js';

const defaultLog = getLogger('map-exporter');

async function run() {
  const connection = await getDBConnection();
  await buildPublicMapExport(connection);
  await connection.release();
  defaultLog.info({ message: 'run complete' });
}

run().then(() => {
  defaultLog.info({ message: 'shutting down' });
});

import { getLogger } from 'utils/logger';
import { getDBConnection } from 'database/db';
import { buildPublicMapExport } from 'utils/public-map';

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

import { getLogger } from './utils/logger';
import { app, adminApp } from './app';

const HOST = process.env.API_HOST || 'localhost';
const PORT = Number(process.env.API_PORT || '3002');
const ADMIN_PORT = 8500;
// Start api
const defaultLog = getLogger('app');

try {
  app.listen(PORT, () => {
    defaultLog.info({ label: 'start api', message: `started api on ${HOST}:${PORT}/api` });
  });
  adminApp.listen(ADMIN_PORT, () => {
    defaultLog.info({ label: 'start admin api', message: `started api on ${HOST}:${ADMIN_PORT}/admin` });
  });
} catch (error) {
  defaultLog.error({ label: 'start api', message: 'error', error });
  process.exit(1);
}

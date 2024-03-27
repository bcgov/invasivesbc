import { getLogger } from './utils/logger';
import { app, adminApp } from './app';
import ViteExpress from 'vite-express';

const HOST = process.env.API_HOST || 'localhost';
const PORT = Number(process.env.API_PORT || '3002');
const ADMIN_PORT = 8500;
// Start api
const defaultLog = getLogger('app');

try {
  ViteExpress.listen(app, PORT, () => {
    defaultLog.info({ label: 'start api', message: `started api on ${HOST}:${PORT}/api` });
  });
  ViteExpress.listen(adminApp, ADMIN_PORT, () => {
    defaultLog.info({ label: 'start admin api', message: `started api on ${HOST}:${ADMIN_PORT}/admin` });
  });
} catch (error) {
  defaultLog.error({ label: 'start api', message: 'error', error });
  process.exit(1);
}

import { Pool, PoolClient, PoolConfig } from 'pg';
import { getLogger } from 'utils/logger';

const defaultLog = getLogger('db');

const DB_HOST: string = process.env.DB_HOST || 'localhost';
const DB_PORT: number = Number(process.env.DB_PORT) || 5432;
const DB_USERNAME: string = process.env.DB_USER || 'invasivebc';
const DB_PASSWORD: string = process.env.DB_PASS || 'world';
const DB_DATABASE: string = process.env.DB_DATABASE || 'invasives';
const DB_SCHEMA: string = process.env.DB_SCHEMA || 'invasivesbc';

const poolConfig: PoolConfig = {
  user: DB_USERNAME,
  password: DB_PASSWORD,
  database: DB_DATABASE,
  port: DB_PORT,
  host: DB_HOST,
  max: 20,
  connectionTimeoutMillis: 0, // default
  idleTimeoutMillis: 10000 // default
};

defaultLog.debug({ label: 'create db pool', message: 'pool config', poolConfig });

let pool: Pool = null;

try {
  pool = new Pool(poolConfig);
} catch (error) {
  defaultLog.error({ label: 'create db pool', message: 'failed to create pool', error, poolConfig });
  process.exit(1);
}

/**
 * Waits for availability, and returns a pool client from the existing `pool`.
 *
 * Note: Sets the initial `search_path` and `SCHEMA` based on the DB_SCHEMA env variable.
 * Note: Callers should call `client.release()` when finished with the pool client.
 *
 * @returns {Promise<PoolClient>}
 */
export const getDBConnection = async function (): Promise<PoolClient> {
  let client: PoolClient = null;

  try {
    client = await pool.connect();

    await client.query(`SET search_path TO ${client.escapeLiteral(DB_SCHEMA)}, public;`);
  } catch (error) {
    defaultLog.error({ label: 'getDBConnection', message: 'error', error });
    throw error;
  }

  return client;
};

import { Request } from 'express';
import { CustomError } from 'middleware/globalErrorHandler';
import { Pool, PoolClient, PoolConfig } from 'pg';
import { SQLStatement } from 'sql-template-strings';
import { getLogger, LoggerWithContext } from 'utils/logger';

const DB_HOST: string = process.env.DB_HOST;
const DB_PORT: number = Number(process.env.DB_PORT);
const DB_USERNAME: string = process.env.DB_USER;
const DB_PASSWORD: string = process.env.DB_PASS;
const DB_DATABASE: string = process.env.DB_DATABASE;
const DB_SCHEMA: string = process.env.DB_SCHEMA;

/** Information needed for Logging */
interface Log {
  request: Request;
  message: string;
  options?: Record<string, any>;
}

/** Options for Common */
interface Options {
  poolConfig?: PoolConfig;
  logDetails?: Log;
}

class CommonDatabase {
  client: PoolClient;
  logDetails: Log;
  logger: LoggerWithContext;
  pool: Pool;
  poolConfig: PoolConfig;

  defaultPool: PoolConfig = {
    database: DB_DATABASE,
    connectionTimeoutMillis: 0, // default
    host: DB_HOST,
    idleTimeoutMillis: 10000, // default
    max: 20,
    password: DB_PASSWORD,
    port: DB_PORT,
    user: DB_USERNAME
  };

  constructor({ poolConfig, logDetails }: Options = {}) {
    this.logDetails = logDetails;
    this.logger = getLogger('db');
    this.pool = new Pool(poolConfig ?? this.defaultPool);
  }

  /**
   * @desc Waits for availability, and returns a pool client from the existing 'Pool'
   * Sets initial search_path
   * @returns {PoolClient}
   */
  private readonly getDBConnection = async (): Promise<PoolClient> => {
    const client = await this.pool.connect();
    await client.query(`SET search_path TO ${client.escapeLiteral(DB_SCHEMA)}, public;`);
    return client;
  };

  private readonly log = (): void => {
    const { message, request, options } = this.logDetails;
    this.logger.debug({
      label: request.url,
      message: message,
      ...options
    });
  };
  /**
   * @desc Query handler for database,
   * @param   sqlStatement Sql to be executed
   * @param   caller_name Name of the function calling genericDbRequest (used for logging/error handling)
   * @returns Database response
   */
  public readonly query = async (sqlStatement: SQLStatement): Promise<any> => {
    let connection: PoolClient;
    try {
      connection = await this.getDBConnection();
      if (this.logDetails) {
        this.log();
      }
      return await connection.query(sqlStatement.text, sqlStatement.values);
    } catch (e) {
      throw new CustomError(e?.message || 'Connection Refused', 503);
    } finally {
      connection?.release();
    }
  };
}

export default CommonDatabase;

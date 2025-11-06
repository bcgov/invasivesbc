import { Pool, PoolClient, PoolConfig, Result } from 'pg';
import { SQLStatement } from 'sql-template-strings';
import { DB_DATABASE, DB_HOST, DB_PASSWORD, DB_PORT, DB_SCHEMA, DB_USERNAME } from 'database/db';

const defaultPool: PoolConfig = {
  database: DB_DATABASE,
  connectionTimeoutMillis: 0, // default
  host: DB_HOST,
  idleTimeoutMillis: 10000, // default
  max: 20,
  password: DB_PASSWORD,
  port: DB_PORT,
  user: DB_USERNAME
};

interface Options {
  poolConfig?: PoolConfig;
  maintain?: boolean;
}

class QueryHandler {
  pool: Pool;
  poolConfig: PoolConfig;
  connection: PoolClient;
  maintain: boolean;

  constructor({ poolConfig, maintain }: Options = {}) {
    this.pool = new Pool(poolConfig ?? defaultPool);
    this.maintain = !!maintain;
  }

  public close() {
    this.connection?.release();
  }

  private readonly getDBConnection = async (): Promise<PoolClient> => {
    const client = await this.pool.connect();
    await client.query(`SET search_path TO ${client.escapeLiteral(DB_SCHEMA)}, public;`);
    this.connection = client;
  };

  public readonly query = async (sqlStatement: SQLStatement): Promise<Result> => {
    try {
      if (!this.connection) {
        await this.getDBConnection();
      }
      return await this.connection.query(sqlStatement.text, sqlStatement.values);
    } finally {
      if (!this.maintain) this.close();
    }
  };
}

export default QueryHandler;

import { Pool, PoolClient, PoolConfig, Result } from 'pg';
import { SQLStatement } from 'sql-template-strings';

const DB_HOST: string = process.env.DB_HOST;
const DB_PORT: number = Number(process.env.DB_PORT);
const DB_USERNAME: string = process.env.DB_USER;
const DB_PASSWORD: string = process.env.DB_PASS;
const DB_DATABASE: string = process.env.DB_DATABASE;
const DB_SCHEMA: string = process.env.DB_SCHEMA;

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
}

class QueryHandler {
  pool: Pool;
  poolConfig: PoolConfig;
  connection: PoolClient;

  constructor({ poolConfig }: Options = {}) {
    this.pool = new Pool(poolConfig ?? defaultPool);
  }

  public close() {
    this.connection?.release();
  }

  private readonly getDBConnection = async (): Promise<PoolClient> => {
    const client = await this.pool.connect();
    await client.query(`SET search_path TO ${client.escapeLiteral(DB_SCHEMA)}, public;`);
    this.connection = client;
  };

  public readonly query = async (sqlStatement: SQLStatement, maintainConnection: boolean = false): Promise<Result> => {
    try {
      if (!this.connection) {
        await this.getDBConnection();
      }
      return await this.connection.query(sqlStatement.text, sqlStatement.values);
    } finally {
      if (!maintainConnection) this.close();
    }
  };
}

export default QueryHandler;

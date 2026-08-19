import { PoolClient, Result } from 'pg';
import { SQLStatement } from 'sql-template-strings';
import { DB_SCHEMA, pool } from 'database/db';

interface Options {
  maintain?: boolean;
}

class QueryHandler {
  private connection: PoolClient;
  maintain: boolean;

  constructor({ maintain }: Options = {}) {
    this.maintain = !!maintain;
  }

  public close() {
    if (this.connection) {
      this.connection?.release();
      this.connection = null;
    }
  }

  private getPool() {
    return pool; // use the global pool definition instead of recreating one here
  }
  private readonly getDBConnection = async (): Promise<PoolClient> => {
    const client = await this.getPool().connect();
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

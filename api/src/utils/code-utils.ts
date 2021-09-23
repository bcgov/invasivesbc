import { QueryResult, QueryResultRow } from 'pg';
import { SQLStatement } from 'sql-template-strings';
import { getDBConnection } from '../database/db';
import { getCodeCategoriesSQL, getCodeHeadersSQL, getCodesSQL } from '../queries/code-queries';
import { getLogger } from './logger';

const defaultLog = getLogger('code-utils');

export interface IAllCodeEntities {
  categories: QueryResultRow[];
  headers: QueryResultRow[];
  codes: QueryResultRow[];
}

export async function getAllCodeEntities(): Promise<IAllCodeEntities> {
  const connection = await getDBConnection();

  if (!connection) {
    throw {
      status: 503,
      message: 'Failed to establish database connection'
    };
  }

  try {
    const codeCategoriesSQL: SQLStatement = getCodeCategoriesSQL();
    const codeHeadersSQL: SQLStatement = getCodeHeadersSQL();
    const codesSQL: SQLStatement = getCodesSQL();

    if (!codeCategoriesSQL || !codeHeadersSQL || !codesSQL) {
      throw {
        status: 400,
        message: 'Failed to build SQL statement'
      };
    }

    const promises = [];

    promises.push(connection.query(codeCategoriesSQL.text, codeCategoriesSQL.values));
    promises.push(connection.query(codeHeadersSQL.text, codeHeadersSQL.values));
    promises.push(connection.query(codesSQL.text, codesSQL.values));

    const responses: QueryResult[] = await Promise.all(promises);

    if (!responses || responses.length !== 3) {
      return null;
    }

    return {
      categories: responses[0].rows,
      headers: responses[1].rows,
      codes: responses[2].rows
    };
  } catch (error) {
    defaultLog.debug({ label: 'getAllCodeEntities', message: 'error', error });
    throw error;
  } finally {
    connection.release();
  }
}

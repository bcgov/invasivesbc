import { getDBConnection } from '../database/db';
import { getMetabaseGroupsSQL } from '../queries/role-queries';

async function getMetabaseGroupMappings(req, res) {
  const connection = await getDBConnection();
  if (!connection) {
    return res.status(503).json({ message: 'Database connection unavailable', request: req.body, code: 503 });
  }
  try {
    const sqlStatement = getMetabaseGroupsSQL();
    const result = await connection.query(sqlStatement.text, sqlStatement.values);
    return res.status(200).json(result.rows);
  } catch (error) {
    return res.status(500).send();
  } finally {
    connection.release();
  }
}

export { getMetabaseGroupMappings };

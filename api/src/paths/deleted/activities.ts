import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SQLStatement } from 'sql-template-strings';
import { getDBConnection } from '../../database/db.js';
import { undeleteActivitiesSQL } from '../../queries/activity-queries.js';
import { getLogger } from '../../utils/logger.js';
import { DELETE as activitiesDeleteApiDoc } from '../activities.js';

const defaultLog = getLogger('activity');

export const POST: Operation = [undeleteActivitiesByIds()];

POST.apiDoc = {
  ...activitiesDeleteApiDoc.apiDoc,
  description: 'Un-deletes all activities based on a list of ids.'
};

/**
 * Un-deletes all activity records based on a list of ids.
 *
 * @return {RequestHandler}
 */
function undeleteActivitiesByIds(): RequestHandler {
  return async (req, res) => {
    const ids = Object.values(req.query.id) as string[];

    if (!ids || !ids.length) {
      return res.status(400).json({
        message: 'No ids provided',
        request: req.body,
        namespace: 'deleted/activities',
        code: 400
      });
    }

    const connection = await getDBConnection();
    if (!connection) {
      return res.status(503).json({ message: 'Database connection unavailable', request: req.body, code: '503' });
    }

    try {
      const sqlStatement: SQLStatement = undeleteActivitiesSQL(ids);

      if (!sqlStatement) {
        return res.status(500).json({
          message: 'Failed to generate SQL statement',
          request: req.body,
          namespace: 'deleted/activities',
          code: 500
        });
      }

      const response = await connection.query(sqlStatement.text, sqlStatement.values);

      return res.status(200).json({
        message: 'Successfully un-deleted activities',
        request: req.body,
        result: response.rows,
        count: response.rowCount,
        namespace: 'deleted/activities',
        code: 200
      });
    } catch (error) {
      defaultLog.debug({ label: 'undeleteActivitiesByIds', message: 'error', error });
      return res.status(500).json({
        message: 'Failed to un-delete activities',
        request: req.body,
        error: error,
        namespace: 'deleted/activities',
        code: 500
      });
    } finally {
      connection.release();
    }
  };
}

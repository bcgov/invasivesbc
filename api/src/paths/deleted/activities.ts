'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SQLStatement } from 'sql-template-strings';
import { getDBConnection } from '../../database/db';
import { undeleteActivitiesSQL } from '../../queries/activity-queries';
import { getLogger } from '../../utils/logger';
import { DELETE as activitiesDeleteApiDoc } from '../activities';

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
    defaultLog.debug({ label: 'activity', message: 'undeleteActivitiesByIds', body: req.body });

    const ids = Object.values(req.query.id) as string[];

    if (!ids || !ids.length) {
      throw {
        status: 400,
        message: 'Activity ids must be supplied'
      };
    }

    const connection = await getDBConnection();
    if (!connection) {
      throw {
        status: 503,
        message: 'Failed to establish database connection'
      };
    }

    try {
      const sqlStatement: SQLStatement = undeleteActivitiesSQL(ids);

      if (!sqlStatement) {
        throw {
          status: 400,
          message: 'Failed to build SQL statement'
        };
      }

      const response = await connection.query(sqlStatement.text, sqlStatement.values);

      const result = { count: (response && response.rowCount) || 0 };

      return res.status(200).json(result);
    } catch (error) {
      defaultLog.debug({ label: 'undeleteActivitiesByIds', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}

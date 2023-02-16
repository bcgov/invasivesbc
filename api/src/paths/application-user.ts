'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SQLStatement } from 'sql-template-strings';
import { ALL_ROLES, SECURITY_ON } from '../constants/misc';
import { getDBConnection } from '../database/db';
import { getUsersSQL, getUserByBCEIDSQL, getUserByIDIRSQL } from '../queries/user-queries';
import { getLogger } from '../utils/logger';

// const defaultLog = getLogger('activity/{activityId}');

export const GET: Operation = [getHandler()];

GET.apiDoc = {
  description: 'Fetches a list of users from the database',
  tags: ['users'],
  security: SECURITY_ON
    ? [
        {
          Bearer: ALL_ROLES
        }
      ]
    : [],
  parameters: [],
  responses: {
    200: {
      description: 'Users get response object array.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              // Don't specify exact response, as it will vary, and is not currently enforced anyways
              // Eventually this could be updated to be a oneOf list, similar to the Post request below.
            }
          }
        }
      }
    },
    401: {
      $ref: '#/components/responses/401'
    },
    503: {
      $ref: '#/components/responses/503'
    },
    default: {
      $ref: '#/components/responses/default'
    }
  }
};

function getHandler() {
  return async (req, res, next) => {
    const bceid = req.query.bceid;
    const idir = req.query.idir;
    if (idir && bceid) {
      return res.status(400).json({
        message: 'Cannot specify both BCEID ID and IDIR IDs',
        request: req.query,
        namespace: 'application-user',
        code: 400
      });
    } else if (bceid) {
      return await getUserByBCEID(req, res, next, bceid);
    } else if (idir) {
      return await getUserByIDIR(req, res, next, idir);
    } else {
      // Fetch all application users
      return await getUsers(req, res, next);
    }
  };
}

/**
 * Fetches a list of users
 *
 * @return {RequestHandler}
 */
async function getUsers(req, res, next) {
  const connection = await getDBConnection();
  if (!connection) {
    return res.status(503).json({
      message: 'Failed to establish database connection',
      request: req.query,
      namespace: 'application-user',
      code: 503
    });
  }
  try {
    const sqlStatement: SQLStatement = getUsersSQL();
    if (!sqlStatement) {
      return res
        .status(500)
        .json({ message: 'Failed to build SQL statement', request: req.query, namespace: 'application-user' });
    }
    const response = await connection.query(sqlStatement.text, sqlStatement.values);
    return res.status(200).json({
      message: 'Successfully got users',
      request: req.query,
      result: response.rows,
      count: response.rowCount,
      namespace: 'application-user',
      code: 200
    });
  } catch (error) {
    // defaultLog.debug({ label: 'getUsers', message: 'error', error });
    return res
      .status(500)
      .json({ message: 'Failed to fetch users', error, request: req.query, namespace: 'application-user', code: 500 });
  } finally {
    connection.release();
  }
}

async function getUserByBCEID(req, res, next, bceid) {
  // defaultLog.debug({ label: '{bceid}', message: 'getUserByBCEID', body: req.query });
  const connection = await getDBConnection();
  if (!connection) {
    return res.status(503).json({
      message: 'Failed to establish database connection',
      request: req.query,
      namespace: 'application-user',
      code: 503
    });
  }
  try {
    const sqlStatement: SQLStatement = getUserByBCEIDSQL(bceid);
    if (!sqlStatement) {
      return res.status(500).json({
        message: 'Failed to build SQL statement',
        request: req.query,
        namespace: 'application-user',
        code: 500
      });
    }
    const response = await connection.query(sqlStatement.text, sqlStatement.values);
    return res.status(200).json({
      message: 'Successfully got user',
      request: req.query,
      result: response.rows,
      count: response.rowCount,
      namespace: 'application-user',
      code: 200
    });
  } catch (error) {
    // defaultLog.debug({ label: 'getUserByBCEID', message: 'error', error });
    return res
      .status(500)
      .json({ message: 'Failed to fetch users', error, request: req.query, namespace: 'application-user', code: 500 });
  } finally {
    connection.release();
  }
}

async function getUserByIDIR(req, res, next, idir) {
  // defaultLog.debug({ label: '{bceid}', message: 'getUserByIDIR', body: req.query });
  const connection = await getDBConnection();
  if (!connection) {
    return res.status(503).json({
      message: 'Failed to establish database connection',
      request: req.query,
      namespace: 'application-user',
      code: 503
    });
  }
  try {
    const sqlStatement: SQLStatement = getUserByIDIRSQL(idir);
    if (!sqlStatement) {
      return res.status(500).json({
        message: 'Failed to build SQL statement',
        request: req.query,
        namespace: 'application-user',
        code: 500
      });
    }
    const response = await connection.query(sqlStatement.text, sqlStatement.values);
    return res.status(200).json({
      message: 'Successfully got user',
      request: req.query,
      result: response.rows,
      count: response.rowCount,
      namespace: 'application-user',
      code: 200
    });
  } catch (error) {
    // defaultLog.debug({ label: 'getUserByIDIR', message: 'error', error });
    return res
      .status(500)
      .json({ message: 'Failed to fetch users', error, request: req.query, namespace: 'application-user', code: 500 });
  } finally {
    connection.release();
  }
}

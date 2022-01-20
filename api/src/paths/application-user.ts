'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SQLStatement } from 'sql-template-strings';
import { ALL_ROLES } from '../constants/misc';
import { getDBConnection } from '../database/db';
import { getUsersSQL, getUserByBCEIDSQL, getUserByIDIRSQL } from '../queries/user-queries';
import { getLogger } from '../utils/logger';

const defaultLog = getLogger('activity/{activityId}');

export const GET: Operation = [getHandler()];

GET.apiDoc = {
  description: 'Fetches a list of users from the database',
  tags: ['users'],
  security: [
    {
      Bearer: ALL_ROLES
    }
  ],
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
    console.log('bceid', bceid);
    console.log('idir', idir);
    if (idir && bceid) {
      return res.status(400).send('Cannot specify both BCEID ID and IDIR IDs');
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
    throw {
      status: 503,
      message: 'Failed to establish database connection'
    };
  }
  try {
    const sqlStatement: SQLStatement = getUsersSQL();
    if (!sqlStatement) {
      throw {
        status: 400,
        message: 'Failed to build SQL statement'
      };
    }
    const response = await connection.query(sqlStatement.text, sqlStatement.values);
    const result = (response && response.rows) || null;
    return res.status(200).json(result);
  } catch (error) {
    defaultLog.debug({ label: 'getUsers', message: 'error', error });
    throw error;
  } finally {
    connection.release();
  }
}

async function getUserByBCEID(req, res, next, bceid) {
  defaultLog.debug({ label: '{bceid}', message: 'getUserByBCEID', body: req.query });
  const connection = await getDBConnection();
  if (!connection) {
    throw {
      status: 503,
      message: 'Failed to establish database connection'
    };
  }
  try {
    const sqlStatement: SQLStatement = getUserByBCEIDSQL(bceid);
    if (!sqlStatement) {
      throw {
        status: 400,
        message: 'Failed to build SQL statement'
      };
    }
    const response = await connection.query(sqlStatement.text, sqlStatement.values);
    const result = (response && response.rows) || null;
    console.log('result', result);
    return res.status(200).json(result);
  } catch (error) {
    defaultLog.debug({ label: 'getUserByBCEID', message: 'error', error });
    throw error;
  } finally {
    connection.release();
  }
}

async function getUserByIDIR(req, res, next, idir) {
  defaultLog.debug({ label: '{bceid}', message: 'getUserByIDIR', body: req.query });
  const connection = await getDBConnection();
  if (!connection) {
    throw {
      status: 503,
      message: 'Failed to establish database connection'
    };
  }
  try {
    const sqlStatement: SQLStatement = getUserByIDIRSQL(idir);
    if (!sqlStatement) {
      throw {
        status: 400,
        message: 'Failed to build SQL statement'
      };
    }
    const response = await connection.query(sqlStatement.text, sqlStatement.values);
    const result = (response && response.rows) || null;
    console.log('result', result);
    return res.status(200).json(result);
  } catch (error) {
    defaultLog.debug({ label: 'getUserByIDIR', message: 'error', error });
    throw error;
  } finally {
    connection.release();
  }
}

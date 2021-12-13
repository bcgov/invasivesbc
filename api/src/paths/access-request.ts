'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { SQLStatement } from 'sql-template-strings';
import { ALL_ROLES, SEARCH_LIMIT_MAX, SEARCH_LIMIT_DEFAULT } from '../constants/misc';
import { getDBConnection } from '../database/db';
import geoJSON_Feature_Schema from '../openapi/geojson-feature-doc.json';
import {
  getAccessRequestForUserSQL,
  getAccessRequestsSQL,
  createAccessRequestSQL,
  updateAccessRequestStatusSQL
} from '../queries/access-request-queries';
import { getLogger } from '../utils/logger';

const defaultLog = getLogger('access-request');

export const POST: Operation = [createAccessRequest()];
export const GET: Operation = [getAccessRequests(), getAccessRequestForUser()];
export const PUT: Operation = [updateAccessRequestStatus()];

POST.apiDoc = {
  description: 'Create a new access request.',
  tags: ['access-request'],
  security: [
    {
      Bearer: ALL_ROLES
    }
  ],
  requestBody: {
    description: 'Access request post request object.',
    content: {
      'application/json': {
        schema: {
          properties: {}
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Access request post response object.',
      content: {
        'application/json': {
          schema: {
            properties: {}
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
GET.apiDoc = {
  description: 'Fetches a list of access requests from the database',
  tags: ['access-request'],
  security: [
    {
      Bearer: ALL_ROLES
    }
  ],
  parameters: [],
  responses: {
    200: {
      description: 'Access request get response object array.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {}
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
PUT.apiDoc = {
  description: 'Update an access request.',
  tags: ['access=request'],
  security: [
    {
      Bearer: ALL_ROLES
    }
  ],
  requestBody: {
    description: 'Access request post request object.',
    content: {
      'application/json': {
        schema: {
          properties: {}
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Access request post response object.',
      content: {
        'application/json': {
          schema: {
            properties: {}
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

// Get access request for user
function getAccessRequestForUser(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'access-request', message: 'getAccessRequestForUser', body: req.body });

    let connection;
    try {
      connection = await getDBConnection();
    } catch (e) {
      console.log('error getting database connetion');
      console.log(JSON.stringify(e));
    }
    if (!connection) {
      throw {
        status: 503,
        message: 'Failed to establish database connection'
      };
    }
    try {
      const sqlStatement: SQLStatement = getAccessRequestForUserSQL(req.params.userEmail);

      if (!sqlStatement) {
        throw {
          status: 400,
          message: 'Failed to build SQL statement'
        };
      }
      const response = await connection.query(sqlStatement.text, sqlStatement.values);

      // parse the rows from the response
      const rows = { rows: (response && response.rows) || [] };
      // parse the count from the response
      const count = { count: rows.rows.length && parseInt(rows.rows[0]['total_rows_count']) } || {};
      // build the return object
      const result = { ...rows, ...count };
      return res.status(200).json(result);
    } catch (error) {
      defaultLog.debug({ label: 'getAccessRequestForUser', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}

// function getAccessRequestForUser(): RequestHandler {
//   return async (req, res, next) => {
//     try {
//       const db = await getDBConnection();
//       const result = await db.query(getAccessRequestForUserSQL(userEmail));
//       db.release();
//       res.json(result);
//     } catch (err) {
//       defaultLog.error(err);
//       next(err);
//     }
//   };
// }

/**
 * Fetches all Accesss Requests based on request search filter criteria.
 *
 * @return {RequestHandler}
 */
function getAccessRequests(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'access-request', message: 'getAccessRequests', body: req.body });

    let connection;
    try {
      connection = await getDBConnection();
    } catch (e) {
      console.log('error getting database connetion');
      console.log(JSON.stringify(e));
    }

    if (!connection) {
      throw {
        status: 503,
        message: 'Failed to establish database connection'
      };
    }

    try {
      const sqlStatement: SQLStatement = getAccessRequestsSQL();

      if (!sqlStatement) {
        throw {
          status: 400,
          message: 'Failed to build SQL statement'
        };
      }

      const response = await connection.query(sqlStatement.text, sqlStatement.values);

      // parse the rows from the response
      const rows = { rows: (response && response.rows) || [] };

      // parse the count from the response
      const count = { count: rows.rows.length && parseInt(rows.rows[0]['total_rows_count']) } || {};

      // build the return object
      const result = { ...rows, ...count };

      return res.status(200).json(result);
    } catch (error) {
      defaultLog.debug({ label: 'getActivitiesBySearchFilterCriteria', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}

/**
 * Update an access request's statuts
 */
function updateAccessRequestStatus(): RequestHandler {
  return async (req, res, next) => {
    defaultLog.debug({ label: 'access-request', message: 'updateAccessRequestStatus', body: req.body });
    let connection;
    try {
      connection = await getDBConnection();
    } catch (e) {
      console.log('error getting database connetion');
      console.log(JSON.stringify(e));
    }
    if (!connection) {
      throw {
        status: 503,
        message: 'Failed to establish database connection'
      };
    }
    try {
      const sqlStatement: SQLStatement = updateAccessRequestStatusSQL(req.body.email, req.body.status);

      if (!sqlStatement) {
        throw {
          status: 400,
          message: 'Failed to build SQL statement'
        };
      }
      const response = await connection.query(sqlStatement.text, sqlStatement.values);
      return res.status(200).json(response);
    } catch (error) {
      defaultLog.debug({ label: 'updateAccessRequestStatus', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}

/**
 * Create an access request
 */
function createAccessRequest(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'access-request', message: 'create', body: req.body });

    const connection = await getDBConnection();
    if (!connection) {
      throw {
        status: 503,
        message: 'Failed to establish database connection'
      };
    }

    try {
      const sqlStatement: SQLStatement = createAccessRequestSQL(req.body);
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
      defaultLog.debug({ label: 'create', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}

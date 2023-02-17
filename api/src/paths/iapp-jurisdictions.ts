'use strict';

import { RequestHandler, response } from 'express';
import { Operation } from 'express-openapi';
import { SQLStatement } from 'sql-template-strings';
import { ALL_ROLES, SEARCH_LIMIT_MAX, SEARCH_LIMIT_DEFAULT, SECURITY_ON } from '../constants/misc';
import { getDBConnection } from '../database/db';
import { getJurisdictionsSQL } from '../queries/iapp-jurisdiction-queries';
// import { getLogger } from '../utils/logger';

// const defaultLog = getLogger('iapp-jurisdictions');

export const GET: Operation = [getJurisdictions()];

GET.apiDoc = {
  description: 'Fetches all iapp jurisdictions.',
  tags: ['iapp-jurisdictions'],
  security: SECURITY_ON
    ? [
        {
          Bearer: ALL_ROLES
        }
      ]
    : [],
  responses: {
    200: {
      description: 'Iapp Jurisdictions get response object array.',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
              }
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

/**
 * Fetches all jurisdiction records.
 *
 * @return {RequestHandler}
 */
function getJurisdictions(): RequestHandler {
  return async (req, res) => {
    // defaultLog.debug({
    //   label: 'iapp-jurisdictions',
    //   message: 'getJurisdictions',
    //   body: req.body
    // });

    const connection = await getDBConnection();

    if (!connection) {
      return res.status(503).json({
        message: 'Database connection unavailable.',
        request: req.body,
        namespace: 'iapp-jurisdiction',
        code: 503
      });
    }

    try {
      const sqlStatement: SQLStatement = getJurisdictionsSQL();

      if (!sqlStatement) {
        return res.status(500).json({
          message: 'Failed to build SQL statement',
          request: req.body,
          namespace: 'iapp-jurisdiction',
          code: 500
        });
      }

      const response = await connection.query(sqlStatement.text, sqlStatement.values);

      // parse the rows from the response
      const rows = { rows: (response && response.rows) || [] };

      // parse the count from the response
      const count = { count: rows.rows.length && parseInt(rows.rows[0]['total_rows_count']) } || {};

      // defaultLog.debug({
      //   label: 'iapp-jurisdictions',
      //   message: 'getJurisdictions',
      //   body: rows
      // });

      return res.status(200).json({
        message: 'Got iapp jurisdictions',
        request: req.body,
        result: rows.rows,
        count: count,
        namespace: 'iapp-jurisdiction',
        code: 200
      });
    } catch (error) {
      // defaultLog.debug({ label: 'getJurisdictions', message: 'error', error });
      return res.status(500).json({
        message: 'Failed to get iapp jurisdictions',
        request: req.body,
        error: error,
        namespace: 'iapp-jurisdiction',
        code: 500
      });
    } finally {
      connection.release();
    }
  };
}
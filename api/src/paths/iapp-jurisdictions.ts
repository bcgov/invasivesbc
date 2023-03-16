'use strict';

import { RequestHandler, response } from 'express';
import { Operation } from 'express-openapi';
import { SQLStatement } from 'sql-template-strings';
import { ALL_ROLES, SEARCH_LIMIT_MAX, SEARCH_LIMIT_DEFAULT, SECURITY_ON } from '../constants/misc';
import { getDBConnection } from '../database/db';
import { getJurisdictionsSQL } from '../queries/iapp-jurisdiction-queries';
import { logEndpoint, logData, logErr, getStartTime, logMetrics } from '../utils/logger';

const namespace = 'iapp-jurisdictions';

export const GET: Operation = [getJurisdictions()];

GET.apiDoc = {
  description: 'Fetches all iapp jurisdictions.',
  tags: [namespace],
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
    logEndpoint()(req,res);
    const startTime = getStartTime(namespace);

    const connection = await getDBConnection();

    if (!connection) {
      logErr()(namespace,`Database connection unavailable: 503\n${req?.body}`);
      return res.status(503).json({
        message: 'Database connection unavailable.',
        request: req.body,
        namespace,
        code: 503
      });
    }

    try {
      const sqlStatement: SQLStatement = getJurisdictionsSQL();
      logData()(namespace,logMetrics.SQL_QUERY_SOURCE,sqlStatement.sql);
      logData()(namespace,logMetrics.SQL_PARAMS,sqlStatement.values);

      if (!sqlStatement) {
        logErr()(namespace,`Error generating SQL statement: 500\n${req?.body}`);
        return res.status(500).json({
          message: 'Failed to build SQL statement',
          request: req.body,
          namespace,
          code: 500
        });
      }

      const response = await connection.query(sqlStatement.text, sqlStatement.values);

      // parse the rows from the response
      const rows = { rows: (response && response.rows) || [] };

      // parse the count from the response
      const count = { count: rows.rows.length && parseInt(rows.rows[0]['total_rows_count']) } || {};
      logData()(namespace,logMetrics.SQL_RESULTS,JSON.stringify(rows));
      logData()(namespace,logMetrics.SQL_RESPONSE_TIME,startTime);

      return res.status(200).json({
        message: 'Got iapp jurisdictions',
        request: req.body,
        result: rows.rows,
        count: count,
        namespace,
        code: 200
      });
    } catch (error) {
      logErr()(namespace,`Error getting iapp jurisdictions\n${req?.body}\n${error}`);
      return res.status(500).json({
        message: 'Failed to get iapp jurisdictions',
        request: req.body,
        error: error,
        namespace,
        code: 500
      });
    } finally {
      connection.release();
    }
  };
}
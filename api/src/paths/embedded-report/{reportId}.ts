'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { ALL_ROLES, SECURITY_ON } from '../../constants/misc';
import { getLogger } from '../../utils/logger';
import { sign } from 'jsonwebtoken';
import { getDBConnection } from '../../database/db';
import { getEmbeddedReport } from '../../queries/embedded-report-queries';

const defaultLog = getLogger('metabase-query/{reportId}');

const METABASE_URL: string = process.env.METABASE_URL || 'http://localhost:2000';
const EMBEDDING_KEY: string = process.env.METABASE_EMBEDDING_KEY || null;

export const GET: Operation = [getMetabaseEmbeddedReport()];

GET.apiDoc = {
  description: 'Returns a signed url for access to metabase embedded reports',
  tags: ['metabase'],
  security: SECURITY_ON
    ? [
      {
        Bearer: ALL_ROLES
      }
    ]
    : [],
  parameters: [
    {
      in: 'path',
      name: 'reportId',
      required: true
    }
  ],
  responses: {
    200: {
      description: 'The signed url for inclusion in an iframe',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              embeddedUrl: {
                type: 'string'
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
 * Create and sign a URL for metabase for the given reportId (assuming it is valid)
 *
 * @return {RequestHandler}
 */
function getMetabaseEmbeddedReport(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: '{reportId}', message: 'getMetabaseEmbeddedReport', body: req.params });

    const connection = await getDBConnection();
    if (!connection) {
      return res.status(503).json({
        error: 'Database connection unavailable',
        request: req.body,
        namespace: 'embedded-report',
        code: 503
      });
    }

    try {
      const reportId: number = ~~req?.params?.reportId;

      if (!reportId) {
        return res.status(400).json({
          message: 'Bad request - missing reportId',
          request: req.params,
          namespace: 'embedded-report/{reportId}',
          code: 400
        });
      }


      const sql = getEmbeddedReport(reportId);
      const response = await connection.query(sql.text, sql.values);

      if (response.rowCount < 1) {
        return res.status(400).json({
          message: 'Invalid report requested',
          request: req.params,
          namespace: 'embedded-report/{reportId}',
          code: 400
        });
      }

      const metabaseResource = response.rows[0].metabase_resource;

      const payload = {
        resource: { [metabaseResource]: response.rows[0].metabase_id },
        params: {},
        exp: Math.round(Date.now() / 1000) + 600
      };
      const token = sign(payload, EMBEDDING_KEY);

      const embeddedUrl = `${METABASE_URL}/embed/${metabaseResource}/${token}#bordered=false&titled=false`;

      return res.status(200).json({
        embeddedUrl
      });
    } catch (error) {
      defaultLog.debug({ label: 'getMetabaseEmbeddedReport', message: 'error', error });

      return res.status(500).json({
        message: 'Error getting metabase url',
        error: error,
        namespace: 'embedded-report/{reportId}',
        code: 500
      });
    }
    finally {

      connection.release();
    }

  };
}

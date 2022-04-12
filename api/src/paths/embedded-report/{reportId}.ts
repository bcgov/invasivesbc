'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { ALL_ROLES, SECURITY_ON, SEARCH_LIMIT_MAX } from '../../constants/misc';
import { getLogger } from '../../utils/logger';
import { sign } from 'jsonwebtoken';
const defaultLog = getLogger('metabase-query/{reportId}');

const METABASE_URL: string = process.env.METABASE_URL || 'http://localhost:2000';
const EMBEDDING_KEY: string = process.env.METABASE_EMBEDDING_KEY || null;

// @todo hacky PoC. use the db
export const VALID_EMBEDDED_REPORTS = [
  { name: 'Observation Terrestrial Plant Summary', id: 151 },
  { name: 'Treatment Chemical Terrestrial Plant Summary', id: 160 }
];

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
 * Fetches all activity and point of interest ids present in a given Metabase Query, identified by query id.
 *
 * @return {RequestHandler}
 */
function getMetabaseEmbeddedReport(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: '{reportId}', message: 'getMetabaseEmbeddedReport', body: req.params });

    try {
      const reportId: number = ~~req?.params?.reportId;

      const matchedReport = VALID_EMBEDDED_REPORTS.find(f => f.id === reportId)

      if (!matchedReport) {
        return res.status(400).json({
          message: 'Invalid report requested',
          request: req.params,
          namespace: 'embedded-report/{reportId}',
          code: 400
        });
      }

      if (!reportId) {
        return res.status(400).json({
          message: 'Bad request - missing reportId',
          request: req.params,
          namespace: 'embedded-report/{reportId}',
          code: 400
        });
      }

      const payload = {
        resource: { question: matchedReport.id },
        params: {},
        exp: Math.round(Date.now() / 1000) + 600
      };
      const token = sign(payload, EMBEDDING_KEY);

      const embeddedUrl = `${METABASE_URL}/embed/question/${token}#bordered=true&titled=true`;

      return res.status(200).json({
        embeddedUrl
      });
    } catch (error) {
      defaultLog.debug({ label: 'getMetabaseQueryResults', message: 'error', error });
      return res.status(500).json({
        message: 'Error getting metabase url',
        error: error,
        namespace: 'embedded-report/{reportId}',
        code: 500
      });
    }
  };
}

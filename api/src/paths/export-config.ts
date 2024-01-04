'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getLogger } from '../utils/logger';
import { getDBConnection } from '../database/db';
import { GET_LATEST_EXPORT_METADATA } from '../queries/export-record-queries';
import AWS from 'aws-sdk';
import { ALL_ROLES, SECURITY_ON } from '../constants/misc';

const logger = getLogger('export-config');

const OBJECT_STORE_BUCKET_NAME = process.env.OBJECT_STORE_BUCKET_NAME;
const OBJECT_STORE_URL = process.env.OBJECT_STORE_URL || 'nrs.objectstore.gov.bc.ca';
const AWS_ENDPOINT = new AWS.Endpoint(OBJECT_STORE_URL);

const S3 = new AWS.S3({
  endpoint: AWS_ENDPOINT.href,
  accessKeyId: process.env.OBJECT_STORE_ACCESS_KEY_ID,
  secretAccessKey: process.env.OBJECT_STORE_SECRET_KEY_ID,
  signatureVersion: 'v4',
  s3ForcePathStyle: true
});

export const GET: Operation = [getExportMetadata()];

GET.apiDoc = {
  description: 'Get export metadata',
  tags: ['export-config'],
  security: SECURITY_ON
    ? [
      {
        Bearer: ALL_ROLES
      }
    ]
    : [],
  responses: {
    200: {
      description: 'Current',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            properties: {}
          }
        }
      }
    },
    503: {
      $ref: '#/components/responses/503'
    },
    default: {
      $ref: '#/components/responses/default'
    }
  }
};

function getExportMetadata(): RequestHandler {
  return async (req, res, next) => {

    const connection = await getDBConnection();
    if (!connection) {
      return res.status(503).json({
        error: 'Database connection unavailable',
        request: req.body,
        namespace: 'export-config',
        code: 503
      });
    }

    const result = await connection.query(GET_LATEST_EXPORT_METADATA.query, GET_LATEST_EXPORT_METADATA.values);

    const rowsWithSignedURLs = result.rows.map(r => {
      return {
        ...r,
        url: S3.getSignedUrl('getObject', {
          Bucket: OBJECT_STORE_BUCKET_NAME,
          Key: r['file_reference'],
          Expires: 600
        })
      };
    });

    return res.status(200).json({
      message: 'Successfully retrieved export metadata.',
      request: req.body,
      result: rowsWithSignedURLs,
      count: result.rows.length,
      namespace: 'export-config',
      code: 200
    });
  };
}

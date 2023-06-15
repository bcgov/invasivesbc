'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { getLogger } from '../utils/logger';
import * as fs from 'fs';

const logger = getLogger('training_videos');

export const GET: Operation = [getTrainingVideos()];

GET.apiDoc = {
  description: 'Get training video metadata',
  tags: ['training'],
  security: [],
  responses: {
    200: {
      description: 'Training Video metadata array.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
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

const TRAINING_VIDEOS_JSON_FILE = process.env.TRAINING_VIDEOS_JSON_FILE || null;
const TRAINING_VIDEOS_JSON = [];
if (TRAINING_VIDEOS_JSON_FILE === null) {
  logger.warn({
    message:
      'Expecting the environment variable TRAINING_VIDEOS_JSON_FILE to be set to the path of a JSON file containing training video metadata. No video metadata will be served.'
  });
} else {
  try {
    const rawFile = fs.readFileSync(TRAINING_VIDEOS_JSON_FILE);
    const parsedJSON = JSON.parse(rawFile.toString());
    TRAINING_VIDEOS_JSON.push(...parsedJSON);
  } catch (e) {
    logger.error({ message: 'Caught an error while reading the JSON file', error: e });
  }
  logger.info({ message: `Training video parse complete, will serve ${TRAINING_VIDEOS_JSON.length} videos` });
}

function getTrainingVideos(): RequestHandler {
  return async (req, res, next) => {
    return res.status(200).json({
      message: 'Successfully retrieved training videos.',
      request: req.body,
      result: TRAINING_VIDEOS_JSON,
      count: TRAINING_VIDEOS_JSON.length,
      namespace: 'training_videos',
      code: 200
    });
  };
}

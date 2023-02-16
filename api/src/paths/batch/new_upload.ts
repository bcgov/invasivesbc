'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { ALL_ROLES, SECURITY_ON } from '../../constants/misc';
import { getLogger } from '../../utils/logger';
import { PlantFormSubmissionFromData } from '../../utils/batch/plant_form_submit_template';
import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';
import { HOST, PORT } from '../../app';
import csvParser from 'csv-parser';
import { Readable } from 'stream';
import { atob } from 'js-base64';
import { getDBConnection } from '../../database/db';
import { QueryResult } from 'pg';
import {InvasivesRequest} from "../../utils/auth-utils";

// const defaultLog = getLogger('batch');

export const POST: Operation = [upload()];

const POST_API_DOC = {
  tags: ['batch'],
  security: SECURITY_ON
    ? [
        {
          Bearer: ALL_ROLES
        }
      ]
    : [],
  requestBody: {
    description: 'Batch upload processor',
    content: {
      'application/json': {
        schema: {
          // required: ['data'],
          required: [],
          properties: {
            data: {
              type: 'string',
              title: 'Encoded',
              description: 'base64-encoded CSV data'
            }
          }
        }
      }
    }
  },
  responses: {
    201: {
      description: 'Created successfully',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              id: {
                type: 'number'
              }
            }
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

POST.apiDoc = {
  description: 'Create a new file upload.',
  ...POST_API_DOC
};

export const HEADERS = [
  'latitude',
  'longitude',
  'utm_easting',
  'utm_northing',
  'utm_zone',
  'employer_code',
  'jurisdiction_pct_covered',
  'jurisdiction_code',
  'comment',
  'access_description',
  'location_description',
  'slope_code',
  'aspect_code',
  'soil_texture_code',
  'specific_use_code',
  'research_detection_ind',
  'invasive_plants_occurrence',
  'invasive_plants_observation_type',
  'invasive_plants_distribution_code',
  'invasive_plants_density_code',
  'invasive_plants_life_stage_code',
  'invasive_plants_plant_code'
];

const dataFromRow = (row, created_by) => {
  return {
    created_by: created_by,
    created_timestamp: new Date().toISOString(),
    activity_id: uuidv4(),
    latitude: row['latitude'],
    longitude: row['longitude'],
    utm_easting: row['utm_easting'],
    utm_northing: row['utm_northing'],
    utm_zone: row['utm_zone'],
    employer_code: row['employer_code'],
    jurisdictions: [
      {
        percent_covered: row['jurisdiction_pct_covered'],
        jurisdiction_code: row['jurisdiction_code']
      }
    ],
    general_comment: row['comment'],
    access_description: row['access_description'],
    activity_date_time: null,
    location_description: row['location_description'],
    invasive_species_agency_code: null,
    observation_person_name: null,
    observation_plant_terrestrial_data: {
      well_ind: false,
      slope_code: row['slope_code'],
      aspect_code: row['aspect_code'],
      soil_texture_code: row['soil_texture_code'],
      specific_use_code: row['specific_use_code'],
      research_detection_ind: row['research_detection_ind']
    },
    invasive_plants: {
      occurrence: row['invasive_plants_occurrence'],
      observation_type: row['invasive_plants_observation_type'],
      distribution_code: row['invasive_plants_distribution_code'],
      density_code: row['invasive_plants_density_code'],
      life_stage_code: row['invasive_plants_life_stage_code'],
      plant_code: row['invasive_plants_plant_code']
    }
  };
};

/**
 * Creates new activity records from CSV data.
 *
 * @returns {RequestHandler}
 */
function upload(): RequestHandler {
  return async (req: InvasivesRequest, res) => {
    const data = { ...req.body };
    const decoded = atob(data['data']);

    const batch = [];

    const connection = await getDBConnection();

    if (!connection) {
      return res.status(503).json({
        error: 'Database connection unavailable',
        request: req.body,
        namespace: 'batch/new_upload',
        code: 503
      });
    }

    let createdId;

    try {
      try {
        // Perform both get and create operations as a single transaction
        await connection.query('BEGIN');

        const response: QueryResult = await connection.query(
          `insert into batch_uploads (csv_data, created_by)
           values ($1, $2)
           returning id `,
          [decoded, req.authContext.preferredUsername]
        );

        await connection.query('COMMIT');

        createdId = response.rows[0]['id'];
      } catch (error) {
        await connection.query('ROLLBACK');
        // defaultLog.error({ label: 'batchUpload', message: 'error', error });
        return res.status(500).json({
          message: 'Error creating batch upload',
          request: req.body,
          error: error,
          namespace: 'batch/new_upload',
          code: 500
        });
      }
    } finally {
      connection.release();
    }

    const parser = csvParser({
      mapHeaders: ({ header }) => header.trim()
    });

    let i = 0;

    const readComplete = new Promise((resolve, reject) => {
      Readable.from(decoded)
        .pipe(parser)
        .on('data', async (row) => {
          i++;
          batch.push(PlantFormSubmissionFromData(dataFromRow(row, req['auth_payload'].preferred_username)));
        })
        .on('close', () => {
          //resolve();
        });
    });

    await readComplete;

    // defaultLog.info(`submitting batch: ${batch}`);

    await fetch(`http://${HOST}:${PORT}/activity/batch`, {
      method: 'POST',
      headers: {
        Authorization: req.headers.authorization,
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(batch)
    });

    return res.status(201).json({
      message: 'Upload successful',
      request: req.body,
      batchId: createdId,
      namespace: 'batch/new_upload',
      code: 201
    });
  };
}

'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { ALL_ROLES } from '../../constants/misc';
import { getLogger } from '../../utils/logger';
import { PlantFormSubmissionFromData } from '../../utils/batch/plant_form_submit_template';
import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';
import { HOST, PORT } from '../../app';
import csvParser from 'csv-parser';
import { Readable } from 'stream';
import { atob } from 'js-base64';

const defaultLog = getLogger('batch');

export const POST: Operation = [upload()];

const POST_API_DOC = {
  tags: ['batch'],
  security: [
    {
      Bearer: ALL_ROLES
    }
  ],
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
  return async (req, res) => {
    const data = { ...req.body };
    const decoded = atob(data['data']);

    const batch = [];

    const parser = csvParser({
      mapHeaders: ({ header }) => header.trim()
    });

    let i = 0;

    await Readable.from(decoded)
      .pipe(parser)
      .on('data', async (row) => {
        i++;

        batch.push(PlantFormSubmissionFromData(dataFromRow(row, req['auth_payload'].preferred_username)));
      });

    defaultLog.info(`submitting batch: ${batch}`);

    const result = await fetch(`http://${HOST}:${PORT}/activity/batch`, {
      method: 'POST',
      headers: {
        Authorization: req.headers.authorization,
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(batch)
    });

    return res.status(result.status).send(await result.json());
  };
}

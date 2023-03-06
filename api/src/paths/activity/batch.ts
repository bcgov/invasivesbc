'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { ALL_ROLES, SECURITY_ON } from '../../constants/misc';
import geoJSON_Feature_Schema from '../../openapi/geojson-feature-doc.json';
// import { getLogger } from '../../utils/logger';
import { ActivityPostRequestBody } from '../../models/activity';
import { getDBConnection } from '../../database/db';
import { getActivitySQL, postActivitySQL } from '../../queries/activity-queries';
import { QueryResult } from 'pg';
import {InvasivesRequest} from "../../utils/auth-utils";

const namespace = ('activity/batch');

export const POST: Operation = [createActivities()];

// Api doc common to both the POST and PUT endpoints
const batch_apiDoc = {
  tags: ['activity'],
  security: SECURITY_ON
    ? [
        {
          Bearer: ALL_ROLES
        }
      ]
    : [],
  requestBody: {
    description: 'Activity post request object array.',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: {
            required: ['activity_id', 'created_timestamp', 'activity_type', 'activity_subtype', 'created_by'],
            properties: {
              activity_id: {
                type: 'string',
                format: 'uuid',
                example: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
                description: 'An RFC4122 UUID'
              },
              created_timestamp: {
                type: 'string',
                format: 'date-time',
                example: '2018-11-13T20:20:39+00:00',
                description: 'Date created on user device. Must be in ISO8601 format.'
              },
              activity_type: {
                type: 'string',
                title: 'Activity type'
              },
              activity_subtype: {
                type: 'string',
                title: 'Activity subtype'
              },
              created_by: {
                type: 'string',
                title: 'Created by',
                description: 'ID of the author of the activity.'
              },
              species_positive: {
                type: 'array',
                title: 'Species Codes',
                description: 'List of species in the given activity',
                items: {
                  type: 'string'
                }
              },
              species_negative: {
                type: 'array',
                title: 'Species Codes (Negatively Occurring)',
                description: 'List of species negatively occurring in the given activity',
                items: {
                  type: 'string'
                }
              }
            },
            allOf: [
              {
                properties: {
                  media: {
                    type: 'array',
                    title: 'Media',
                    items: {
                      $ref: '#/components/schemas/Media'
                    }
                  },
                  geometry: {
                    type: 'array',
                    title: 'Geometries',
                    items: {
                      ...(geoJSON_Feature_Schema as any)
                    },
                    description: 'An array of GeoJSON Features'
                  },
                  form_data: {
                    oneOf: [
                      { $ref: '#/components/schemas/Activity_Observation_PlantTerrestrial' },
                      { $ref: '#/components/schemas/Activity_Observation_PlantAquatic' },
                      { $ref: '#/components/schemas/Activity_Dispersal_BiologicalDispersal' },
                      { $ref: '#/components/schemas/Activity_Treatment_ChemicalPlant' },
                      { $ref: '#/components/schemas/Activity_Treatment_MechanicalPlant' },
                      { $ref: '#/components/schemas/Activity_Treatment_BiologicalPlant' },
                      { $ref: '#/components/schemas/Activity_Monitoring_ChemicalTerrestrialAquaticPlant' },
                      { $ref: '#/components/schemas/Activity_Monitoring_MechanicalTerrestrialAquaticPlant' },
                      { $ref: '#/components/schemas/Activity_Monitoring_BiologicalTerrestrialPlant' },
                      { $ref: '#/components/schemas/Activity_AnimalActivity_AnimalTerrestrial' },
                      { $ref: '#/components/schemas/Activity_AnimalActivity_AnimalAquatic' },
                      { $ref: '#/components/schemas/Activity_Transect_FireMonitoring' },
                      { $ref: '#/components/schemas/Activity_Transect_Vegetation' },
                      { $ref: '#/components/schemas/Activity_Transect_BiocontrolEfficacy' }
                    ]
                  },
                  created_by: {
                    type: 'string',
                    title: 'Created by',
                    description: 'ID of the author of the activity.'
                  },
                  sync_status: {
                    enum: ['Save Successful', 'Not Saved', 'Saving Failed'],
                    type: 'string',
                    title: 'Save status',
                    description: 'Whether the activity was saved or not, or had a saving error'
                  },
                  form_status: {
                    enum: ['Submitted', 'In Review'],
                    type: 'string',
                    title: 'Form status',
                    description: 'Validation status of the activity form.'
                  },
                  review_status: {
                    enum: ['Pre-Approved', 'Not Reviewed', 'Under Review', 'Approved', 'Disapproved'],
                    type: 'string',
                    title: 'Review status',
                    description: 'The current review status of the activity'
                  }
                }
              }
            ]
          }
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Activity batch create response object.',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              required: ['activity_id'],
              properties: {
                activity_id: {
                  type: 'string',
                  format: 'uuid',
                  example: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
                  description: 'An RFC4122 UUID'
                }
              }
            }
          }
        }
      }
    },
    400: {
      $ref: '#/components/responses/400'
    },
    401: {
      $ref: '#/components/responses/401'
    },
    409: {
      $ref: '#/components/responses/409'
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
  description: 'Create multiple activities.',
  ...batch_apiDoc
};

/**
 * Creates a set of activity records.
 *
 * @returns {RequestHandler}
 */
function createActivities(): RequestHandler {
  return async (req: InvasivesRequest, res) => {
    // defaultLog.debug({ label: 'activity', message: 'createActivities', body: req.params });

    const sanitizedActions = [];

    for (const activity of req.body) {
      const sanitized = new ActivityPostRequestBody(activity);
      sanitized['activityPostBody']['form_data'] = activity['activity_payload']['form_data'];

      console.dir(sanitized);

      const getSQL = getActivitySQL(sanitized.activity_id);
      const createSQL = postActivitySQL(sanitized);

      if (!getSQL || !createSQL) {
        return res.status(500).json({
          message: 'Failed to generate SQL for activity creation.',
          request: req.body,
          namespace,
          code: 500
        });
      }

      sanitizedActions.push({
        sanitized,
        getSQL,
        createSQL
      });
    }

    const connection = await getDBConnection();

    if (!connection) {
      return res.status(503).json({
        message: 'Failed to get database connection.',
        request: req.body,
        namespace,
        code: 503
      });
    }

    const creationResults = [];

    try {
      try {
        // all statements fall within a single transaction
        await connection.query('BEGIN TRANSACTION ISOLATION LEVEL SERIALIZABLE');

        for (const item of sanitizedActions) {
          const getResponse: QueryResult = await connection.query(item.getSQL.text, item.getSQL.values);

          if (getResponse && getResponse.rowCount) {
            // Found 1 or more rows with matching activity_id (which are not marked as deleted), expecting 0
            return res.status(409).json({
              message: `Resource with matching activity_id ${item.sanitized.activity_id} already exists.`,
              request: req.body,
              namespace,
              code: 409
            });
          }

          const createResponse = await connection.query(item.createSQL.text, item.createSQL.values);
          creationResults.push(createResponse.rows[0]);
        }

        await connection.query('COMMIT');
      } catch (error) {
        await connection.query('ROLLBACK');
        return res.status(500).json({
          message: 'Failed to create activity.',
          request: req.body,
          error: error,
          namespace,
          code: 500
        });
      }
    } catch (error) {
      // defaultLog.debug({ label: 'createActivities', message: 'error', error });
      return res.status(500).json({
        message: 'Failed to create activity.',
        request: req.body,
        error: error,
        namespace,
        code: 500
      });
    } finally {
      connection.release();
    }

    return res.status(200).json({
      message: 'Activity created.',
      request: req.body,
      result: creationResults,
      count: creationResults.length,
      namespace,
      code: 200
    });
  };
}

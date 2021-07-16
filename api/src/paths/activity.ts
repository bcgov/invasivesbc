'use strict';

import { RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { QueryResult } from 'pg';
import { SQLStatement } from 'sql-template-strings';
import { ALL_ROLES } from '../constants/misc';
import { getDBConnection } from '../database/db';
import { ActivityPostRequestBody } from '../models/activity';
import geoJSON_Feature_Schema from '../openapi/geojson-feature-doc.json';
import { getActivitySQL, IPutActivitySQL, postActivitySQL, putActivitySQL } from '../queries/activity-queries';
import { commit as commitContext } from '../utils/context-queries';
import { getLogger } from '../utils/logger';
import { uploadMedia } from './media';

const defaultLog = getLogger('activity');

export const POST: Operation = [uploadMedia(), createActivity()];

export const PUT: Operation = [uploadMedia(), updateActivity()];

// Api doc common to both the POST and PUT endpoints
const post_put_apiDoc = {
  tags: ['activity'],
  security: [
    {
      Bearer: ALL_ROLES
    }
  ],
  requestBody: {
    description: 'Activity post request object.',
    content: {
      'application/json': {
        schema: {
          required: ['activity_id', 'created_timestamp', 'activity_type', 'activity_subtype', 'created_by', 'sync_status', 'form_status'],
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
            sync_status: {
              enum: ['Sync Successful', 'Not Synced', 'Sync Failed'],
              type: 'string',
              title: 'Sync status',
              description: 'Whether the activity was synced, not-synced, or had a sync error'
            },
            form_status: {
              enum: ['Valid', 'Invalid', 'Not Validated'],
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
          },
          allOf: [{
            oneOf: [{
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
                enum: ['Not Synced', 'Sync Failed', 'Sync Successful'],
                type: 'string',
                title: 'Sync status',
                description: 'Whether the activity was synced, not-synced, or had a sync error'
              },
              form_status: {
                enum: ['Valid'],
                type: 'string',
                title: 'Form status',
                description: 'Validation status of the activity form.'
              }
            }
            },{
              properties: {
                form_status: {
                  enum: ['Invalid', 'Not Validated'],
                  type: 'string',
                  title: 'Form status',
                  description: 'Validation status of the activity form.'
                }
              }
            }]
          }, {
            oneOf: [{
              properties: {
                review_status: {
                  enum: ['Pre-Approved', 'Not Reviewed', 'Under Review'],
                  type: 'string',
                  title: 'Review status',
                  description: 'The current review status of the activity'
                }
              }
            },{
              properties: {
                review_status: {
                  enum: ['Approved', 'Disapproved'],
                  type: 'string',
                  title: 'Review status',
                  description: 'The current review status of the activity'
                },
                reviewed_by: {
                  type: 'string',
                  title: 'Reviewed by',
                  description: 'The id of the latest reviewer'
                },
                reviewed_at: {
                  type: 'string',
                  title: 'Reviewed at',
                  format: 'date-time',
                  example: '2018-11-13T20:20:39+00:00',
                  description: 'Date of latest review. Must be in ISO8601 format.'
                }
              }
            }]
          }]
        }
      }
    }
  },
  responses: {
    200: {
      description: 'Activity response object.',
      content: {
        'application/json': {
          schema: {
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
  description: 'Create a new activity.',
  ...post_put_apiDoc
};

PUT.apiDoc = {
  description: 'Update an existing activity.',
  ...post_put_apiDoc
};

/**
 * Creates a new activity record.
 *
 * @returns {RequestHandler}
 */
function createActivity(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'activity', message: 'createActivity', body: req.params });

    const data = { ...req.body, mediaKeys: req['mediaKeys'] };

    const sanitizedActivityData = new ActivityPostRequestBody(data);

    const connection = await getDBConnection();

    if (!connection) {
      throw {
        status: 503,
        message: 'Failed to establish database connection'
      };
    }

    try {
      const getActivitySQLStatement: SQLStatement = getActivitySQL(sanitizedActivityData.activity_id);
      const createActivitySQLStatement: SQLStatement = postActivitySQL(sanitizedActivityData);

      if (!getActivitySQLStatement || !createActivitySQLStatement) {
        throw {
          status: 400,
          message: 'Failed to build SQL statement'
        };
      }

      let createResponse: QueryResult = null;

      try {
        // Perform both get and create operations as a single transaction
        await connection.query('BEGIN');

        const getResponse: QueryResult = await connection.query(
          getActivitySQLStatement.text,
          getActivitySQLStatement.values
        );

        if (getResponse && getResponse.rowCount) {
          // Found 1 or more rows with matching activity_id (which are not marked as deleted), expecting 0
          await connection.query('COMMIT');

          throw {
            status: 409,
            message: 'Resource with matching activity_id already exists.'
          };
        }
        createResponse = await connection.query(createActivitySQLStatement.text, createActivitySQLStatement.values);

        await connection.query('COMMIT');
      } catch (error) {
        await connection.query('ROLLBACK');
        throw error;
      }

      const result = (createResponse && createResponse.rows && createResponse.rows[0]) || null;

      // kick off asynchronous context collection activities
      if (req.body.form_data.activity_data.latitude)
        commitContext(result, req);

      return res.status(200).json(result);
    } catch (error) {
      defaultLog.debug({ label: 'createActivity', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}

/**
 * Updates an activity record.
 *
 * Note: An update consists of marking the existing record as 'deleted' and creating a new record with the updated data.
 *
 * @returns {RequestHandler}
 */
function updateActivity(): RequestHandler {
  return async (req, res) => {
    defaultLog.debug({ label: 'activity', message: 'updateActivity', body: req.params });

    const data = { ...req.body, mediaKeys: req['mediaKeys'] };

    const sanitizedActivityData = new ActivityPostRequestBody(data);

    const connection = await getDBConnection();

    if (!connection) {
      throw {
        status: 503,
        message: 'Failed to establish database connection'
      };
    }

    try {
      const sqlStatements: IPutActivitySQL = putActivitySQL(sanitizedActivityData);

      if (!sqlStatements || !sqlStatements.updateSQL || !sqlStatements.createSQL) {
        throw {
          status: 400,
          message: 'Failed to build SQL statements'
        };
      }

      let createResponse = null;

      try {
        // Perform both update and create operations as a single transaction
        await connection.query('BEGIN');

        await connection.query(sqlStatements.updateSQL.text, sqlStatements.updateSQL.values);
        createResponse = await connection.query(sqlStatements.createSQL.text, sqlStatements.createSQL.values);

        await connection.query('COMMIT');
      } catch (error) {
        await connection.query('ROLLBACK');
        throw error;
      }

      const result = (createResponse && createResponse.rows && createResponse.rows[0]) || null;

      // kick off asynchronous context collection activities
      if (req.body.form_data?.activity_data?.latitude)
        commitContext(result, req);

      return res.status(200).json(result);
    } catch (error) {
      defaultLog.debug({ label: 'updateActivity', message: 'error', error });
      throw error;
    } finally {
      connection.release();
    }
  };
}

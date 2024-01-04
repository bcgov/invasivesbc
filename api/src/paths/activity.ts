'use strict';

import { request, RequestHandler } from 'express';
import { Operation } from 'express-openapi';
import { QueryResult } from 'pg';
import { SQLStatement } from 'sql-template-strings';
import { ALL_ROLES, SECURITY_ON } from '../constants/misc';
import { getDBConnection } from '../database/db';
import { ActivityPostRequestBody } from '../models/activity';
import geoJSON_Feature_Schema from '../openapi/geojson-feature-doc.json';
import { getActivitySQL, IPutActivitySQL, postActivitySQL, putActivitySQL } from '../queries/activity-queries';
import { commit as commitContext } from '../utils/context-queries';
import { getLogger } from '../utils/logger';
import { uploadMedia } from './media';
import { InvasivesRequest } from '../utils/auth-utils';

const defaultLog = getLogger('activity');

export const POST: Operation = [uploadMedia(), createActivity()];

export const PUT: Operation = [uploadMedia(), updateActivity()];

// Api doc common to both the POST and PUT endpoints
const post_put_apiDoc = {
  tags: ['activity'],
  security: SECURITY_ON
    ? [
        {
          Bearer: ALL_ROLES
        }
      ]
    : [],
  requestBody: {
    description: 'Activity post request object.',
    content: {
      'application/json': {
        schema: {
          required: [
            'activity_id',
            'created_timestamp',
            'activity_type',
            'activity_subtype',
            'created_by',
            'form_status'
          ],
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
              enum: ['Save Successful', 'Not Saved', 'Saving Failed'],
              type: 'string',
              title: 'Save status',
              description: 'Whether the activity was saved or not, or had a saving error'
            },
            form_status: {
              enum: ['Submitted', 'In review', 'Draft'],
              type: 'string',
              title: 'Form status',
              description: 'Validation status of the activity form.'
            },
            review_status: {
              enum: ['Pre-Approved', 'Not Reviewed', 'Under Review', 'Approved', 'Disapproved'],
              type: 'string',
              title: 'Review status',
              description: 'The current review status of the activity'
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
              oneOf: [
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
                        { $ref: '#/components/schemas/Activity_Transect_BiocontrolEfficacy' },
                        { $ref: '#/components/schemas/Activity_FREP_FormC' }
                      ]
                    },
                    created_by: {
                      type: 'string',
                      title: 'Created by',
                      description: 'ID of the author of the activity.'
                    },
                    sync_status: {
                      enum: ['Not Saved', 'Saving Failed', 'Save Successful'],
                      type: 'string',
                      title: 'Saving status',
                      description: 'Whether the activity was saved or not, or had a saving error'
                    },
                    form_status: {
                      enum: ['Submitted', 'In Review', 'Draft'],
                      type: 'string',
                      title: 'Form status',
                      description: 'Validation status of the activity form.'
                    }
                  }
                },
                {
                  properties: {
                    form_status: {
                      enum: ['Submitted', 'Draft', 'In Review'],
                      type: 'string',
                      title: 'Form status',
                      description: 'Validation status of the activity form.'
                    }
                  }
                }
              ]
            },
            {
              anyOf: [
                {
                  properties: {
                    review_status: {
                      enum: ['Pre-Approved', 'Not Reviewed', 'Under Review'],
                      type: 'string',
                      title: 'Review status',
                      description: 'The current review status of the activity'
                    }
                  }
                },
                {
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
                }
              ]
            }
          ]
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
  return async (req: InvasivesRequest, res) => {
    defaultLog.debug({ label: 'activity', message: 'createActivity', body: req.params });

    const data = { ...req.body, media_keys: req['media_keys'], user_role: req.authContext?.roles[0] };

    const sanitizedActivityData = new ActivityPostRequestBody(data);
    sanitizedActivityData.created_by = req.authContext?.friendlyUsername;
    sanitizedActivityData.created_by_with_guid = req.authContext?.preferredUsername;
    sanitizedActivityData.updated_by = req.authContext?.friendlyUsername;
    sanitizedActivityData.updated_by_with_guid = req.authContext?.preferredUsername;

    const connection = await getDBConnection();

    if (!connection) {
      return res.status(503).json({
        message: 'Database connection unavailable.',
        request: req.body,
        namespace: 'activity',
        code: 503
      });
    }

    try {
      const getActivitySQLStatement: SQLStatement = getActivitySQL(sanitizedActivityData.activity_id);
      const createActivitySQLStatement: SQLStatement = postActivitySQL(sanitizedActivityData);

      if (!getActivitySQLStatement || !createActivitySQLStatement) {
        return res.status(500).json({
          message: 'Failed to build SQL statement.',
          request: req.body,
          namespace: 'activity',
          code: 500
        });
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

          return res.status(409).json({
            message: 'Resource with matching activity_id already exists.',
            request: req.body,
            namespace: 'activity',
            code: 409
          });
        }
        createResponse = await connection.query(createActivitySQLStatement.text, createActivitySQLStatement.values);

        await connection.query('COMMIT');
      } catch (error) {
        await connection.query('ROLLBACK');
        return res.status(500).json({
          message: 'Failed to create activity.',
          error: error,
          request: req.body,
          namespace: 'activity',
          code: 500
        });
      }

      const result = (createResponse && createResponse.rows && createResponse.rows[0]) || null;

      // kick off asynchronous context collection activities
      if (req.body.form_data.activity_data.latitude) commitContext(result, req);

      return res.status(201).json({
        message: 'Activity created.',
        request: req.body,
        activity_id: result.activity_id,
        count: createResponse.rowCount,
        result: createResponse.rows,
        namespace: 'activity',
        code: 201
      });
    } catch (error) {
      defaultLog.debug({ label: 'createActivity', message: 'error', error });
      return res.status(500).json({
        message: 'Error creating activity.',
        request: req.body,
        error: error,
        namespace: 'activity',
        code: 500
      });
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
  return async (req: InvasivesRequest, res) => {
    defaultLog.debug({ label: 'activity', message: 'updateActivity', body: req.params });

    const data = { ...req.body, media_keys: req['media_keys'], user_role: req.authContext?.roles[0] };

    const isAdmin = (req as any).authContext.roles.find((role) => role.role_id === 18);
    const sanitizedActivityData = new ActivityPostRequestBody(data);
    sanitizedActivityData.created_by_with_guid = req.authContext?.preferredUsername;
    sanitizedActivityData.updated_by = req.authContext?.friendlyUsername;
    sanitizedActivityData.updated_by_with_guid = req.authContext?.preferredUsername;

    const connection = await getDBConnection();

    if (!connection) {
      return res.status(503).json({
        message: 'Database connection unavailable.',
        request: req.body,
        namespace: 'activity',
        code: 503
      });
    }

    const sanitizedSearchCriteria: string = data.activity_id;
    const sqlStatementForCheck = getActivitySQL(sanitizedSearchCriteria);

    if (!sqlStatementForCheck) {
      return res.status(500).json({
        message: 'Failed to build SQL statement.',
        request: req.body,
        namespace: 'activity',
        code: 500
      });
    }

    const response = await connection.query(sqlStatementForCheck.text, sqlStatementForCheck.values);

    if (!isAdmin) {

      // some batch record guids don't have the suffix or id.  this will still work for the new ones though
      const containsOldIDAndIsOK = sanitizedActivityData.updated_by_with_guid.includes(response.rows[0]?.created_by_with_guid?.toLowerCase())

      if ((sanitizedActivityData.updated_by_with_guid?.replace('bceid-business', 'bceidbusiness') !== response.rows[0]?.created_by_with_guid.replace('bceid-business','bceidbusiness') && !containsOldIDAndIsOK) &&
        (response.rows[0].created_by_with_guid !== null)) { // some old records are null
        return res.status(401).json({
          message: 'Invalid request, user is not authorized to update this record',
          request: req.body,
          namespace: 'activity',
          code: 401
        });
      }
    }

    if (response.rows[0].activity_type === 'Monitoring' && req?.body?.form_data?.activity_type_data?.linked_id) {
      const sqlStatementForCheck = getActivitySQL(req.body.form_data.activity_type_data.linked_id);
      const response = await connection.query(sqlStatementForCheck.text, sqlStatementForCheck.values);
      const linked_species_treated = response.rows[0].species_treated;

      // make sure monitoring a subset
      sanitizedActivityData.species_treated.forEach((species) => {
        defaultLog.info({message: 'species check', species});

        if (linked_species_treated.includes(species) === false) {
          defaultLog.debug({message: 'linked_species_treated', linked_species_treated});
          // otherwise throw 400
          return res.status(400).json({
            message: 'Invalid request, species in monitoring not included in linked treatment',
            request: req.body,
            namespace: 'activity',
            code: 401
          });
        }
      }
    )
    }

    try {
      const sqlStatements: IPutActivitySQL = putActivitySQL(sanitizedActivityData);

      if (!sqlStatements || !sqlStatements.createSQL) {
        return res.status(500).json({
          message: 'Failed to build SQL statement.',
          request: req.body,
          namespace: 'activity',
          code: 500
        });
      }

      let createResponse = null;

      try {
        // Perform both update and create operations as a single transaction
        await connection.query('BEGIN');

        createResponse = await connection.query(sqlStatements.createSQL.text, sqlStatements.createSQL.values);

        await connection.query('COMMIT');
      } catch (error) {
        await connection.query('ROLLBACK');
        return res.status(500).json({
          message: 'Error updating activity.',
          request: req.body,
          error: error,
          namespace: 'activity',
          code: 500
        });
      }

      const result = (createResponse && createResponse.rows && createResponse.rows[0]) || null;

      // kick off asynchronous context collection activities
      if (req.body.form_data?.activity_data?.latitude) commitContext(result, req);

      return res.status(200).json(result);
    } catch (error) {
      defaultLog.debug({ label: 'updateActivity', message: 'error', error });
      return res.status(500).json({
        message: 'Error updating activity.',
        request: req.body,
        error: error,
        namespace: 'activity',
        code: 500
      });
    } finally {
      connection.release();
    }
  };
}

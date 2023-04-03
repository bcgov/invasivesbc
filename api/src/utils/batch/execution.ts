import { Template } from './definitions';
import { getLogger } from '../logger';
import { PoolClient } from 'pg';
import { randomUUID } from 'crypto';
import moment from 'moment';
import { activity_create_function, ActivityLetter } from 'sharedAPI';
import { mapDefaultFields, mapObservationTerrestrialPlant } from './batchBlobHelpers';

const defaultLog = getLogger('batch');

interface BatchExecutionResult {
  createdActivityIDs: string[];
}

interface _MappedForDB {
  id: string;
  shortId: string;
  payload: object;
}

function _mapToDBObject(row, status, type, subtype, userInfo): _MappedForDB {
  const uuidToCreate = randomUUID();

  const shortYear = moment().format().substr(2, 2);

  const shortId = shortYear + ActivityLetter[subtype] + uuidToCreate.substr(0, 4).toUpperCase();

  let mapped = activity_create_function(type, subtype, userInfo?.preferred_username, [], 'Brennan', '123');

  defaultLog.debug('the row');
  defaultLog.debug(JSON.stringify(row, null, 2));

  defaultLog.debug('the blob before');
  defaultLog.debug(JSON.stringify(mapped, null, 2));

  //todo:
  //mapped2.fieldname = row.fieldname

  mapped = mapDefaultFields(mapped, row);

  /*
  const mapped = {
    _id: uuidToCreate,
    geog: null,
    geom: null,
    media: [],
    agency: null,
    version: null,
    geometry: null,
    utm_zone: null,
    elevation: null,
    ownership: null,
    user_role: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 18, 19],
    created_by: 'brewebst@idir',
    updated_by: 'brewebst@idir',
    activity_id: uuidToCreate,
    form_status: status,
    reviewed_at: null,
    reviewed_by: null,
    sync_status: 'Not Saved',
    utm_easting: null,
    date_created: new Date().toUTCString(),
    date_updated: null,
    jurisdiction: null,
    utm_northing: null,
    activity_type: type,
    review_status: 'Not Reviewed',
    albers_easting: null,
    moti_districts: null,
    well_proximity: null,
    albers_northing: null,
    flnro_districts: null,
    species_treated: [],
    activity_subtype: subtype,
    species_negative: [],
    species_positive: [],
    created_timestamp: new Date().toUTCString(),
    deleted_timestamp: null,
    media_delete_keys: [],
    received_timestamp: new Date().toUTCString(),
    regional_districts: null,
    biogeoclimatic_zones: null,
    jurisdiction_display: null,
    species_treated_full: null,
    initial_autofill_done: false,
    species_negative_full: null,
    species_positive_full: null,
    invasive_plant_management_areas: null,
    regional_invasive_species_organization_areas: null,
    short_id: shortId,
    ...row.mappedObject
  };
  if (mapped?.['form_data']?.['form_status']) {
    mapped['form_data']['form_status'] = status;
  }
  */

  mapped['form_data']['form_status'] = 'Submitted'

  return {
    id: uuidToCreate,
    shortId: shortId,
    payload: mapped
  };
}

export const BatchExecutionService = {
  executeBatch: async (
    dbConnection: PoolClient,
    id: number | string,
    template: Template,
    validatedBatchData,
    desiredFinalStatus: 'Draft' | 'Submitted',
    errorRowsBehaviour: 'Draft' | 'Skip',
    userInfo: any
  ): Promise<BatchExecutionResult> => {
    defaultLog.info(`Starting batch exec run, status->${desiredFinalStatus}, error rows->${errorRowsBehaviour}`);
    const createdIds = [];

    const statusQueryResult = await dbConnection.query({
      text: `SELECT status
             from batch_uploads
             where id = $1
               and status = 'NEW'`,
      values: [id]
    });
    if (statusQueryResult.rowCount !== 1) {
      throw new Error('Batch not in executable status');
    }

    for (const row of validatedBatchData.rows) {
      //@todo skip errored rows

      const { id: activityId, shortId, payload } = _mapToDBObject(
        row,
        desiredFinalStatus,
        template.type,
        template.subtype,
        userInfo
      );

      dbConnection.query({
        text: `INSERT INTO activity_incoming_data (activity_id, short_id, activity_payload, batch_id, activity_type, activity_subtype, form_status, created_by)
               values ($1, $2, $3, $4, $5, $6, $7, $8)`,
        values: [
          activityId,
          shortId,
          payload,
          id,
          template.type,
          template.subtype,
          desiredFinalStatus,
          userInfo.preferred_username
        ]
      });
    }

    await dbConnection.query({
      text: `UPDATE batch_uploads
             set status='SUCCESS'
             where id = $1
               and status = 'NEW'`,
      values: [id]
    });

    defaultLog.info('Finishing batch exec run');

    return {
      createdActivityIDs: createdIds
    };
  }
};

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

  let mapped = activity_create_function(
    type,
    subtype,
    userInfo?.preferred_username,
    [],
    'Brennan',
    userInfo?.pac_number
  );

  defaultLog.debug('the row');
  defaultLog.debug(JSON.stringify(row, null, 2));

  defaultLog.debug('the blob before');
  defaultLog.debug(JSON.stringify(mapped, null, 2));


 mapped = mapDefaultFields(mapped, row)

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

      let guid = null;
      if (userInfo?.idir_userid !== null) {
        guid = userInfo?.idir_userid;
      } else if (userInfo?.bceid_userid !== null) {
        guid = userInfo?.bceid_userid;
      }

      dbConnection.query({
        text: `INSERT INTO activity_incoming_data (activity_id, short_id, activity_payload, batch_id, activity_type, activity_subtype, form_status, created_by, updated_by, created_by_with_guid, updated_by_with_guid)
               values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        values: [
          activityId,
          shortId,
          payload,
          id,
          template.type,
          template.subtype,
          desiredFinalStatus,
          userInfo?.preferred_username,
          userInfo?.preferred_username,
          guid,
          guid
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

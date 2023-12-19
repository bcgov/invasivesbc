import { Template } from './definitions';
import { getLogger } from '../logger';
import { PoolClient } from 'pg';
import { randomUUID } from 'crypto';
import moment from 'moment';
import { activity_create_function, ActivityLetter, autofillChemFields, populateSpeciesArrays } from 'sharedAPI';
import { mapTemplateFields } from './blob-utils';

const defaultLog = getLogger('batch');

interface BatchExecutionResult {
  createdActivityIDs: string[];
}

interface _MappedForDB {
  id: string;
  shortId: string;
  payload: object;
  geog: any;
}

export function _mapToDBObject(row, status, type, subtype, userInfo): _MappedForDB {
  const uuidToCreate = randomUUID();

  const shortYear = moment().format().substr(2, 2);

  const shortId = shortYear + ActivityLetter[subtype] + uuidToCreate.substr(0, 8).toUpperCase();

  let mapped = activity_create_function(
    type,
    subtype,
    userInfo?.preferred_username,
    userInfo?.friendlyUsername,
    userInfo?.pac_number
  );

  mapped = mapTemplateFields(mapped, row);

  if (
    mapped?.form_data?.activity_data?.invasive_species_agency_code &&
    mapped.form_data.activity_data.invasive_species_agency_code.length > 0
  ) {
    mapped.form_data.activity_data.invasive_species_agency_code = mapped.form_data.activity_data.invasive_species_agency_code.join();
  }

  if (['Activity_Treatment_ChemicalPlantTerrestrial', 'Activity_Treatment_ChemicalPlantAquatic'].includes(subtype)) {
    const chemicalMethodSprayCodes = row.data[
      'Chemical Treatment (If Tank Mix) - Application Method'
    ]?.templateColumn.codes.map((codeObj) => {
      return codeObj.code;
    });

    const chemicalMethodCodes = row.data[
      'Chemical Treatment (No Tank Mix) - Application Method'
    ]?.templateColumn.codes.map((codeObj) => {
      return codeObj.code;
    });

    mapped = autofillChemFields(mapped, chemicalMethodSprayCodes, chemicalMethodCodes);
  }

  mapped = populateSpeciesArrays(mapped);

  mapped['form_data']['form_status'] = status;

  const geog = mapped.geog;
  delete mapped.geog;
  mapped.short_id = shortId;
  mapped.activity_id = uuidToCreate;

  return {
    id: uuidToCreate,
    shortId: shortId,
    payload: mapped,
    geog: geog
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
    defaultLog.info({
      message: `Starting batch exec run, status->${desiredFinalStatus}, error rows->${errorRowsBehaviour}`
    });
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

    await dbConnection.query('BEGIN;');

    try {
      for (const [index, row] of validatedBatchData.rows.entries()) {
        let errorRow = false;
        if (row.rowValidationResult.find((vr) => !vr.valid)) {
          errorRow = true;
        } else {
          Object.values(row.data).forEach((propertyValue: any) => {
            if (
              (propertyValue.validationMessages.length > 0 &&
                propertyValue.validationMessages.find((vm) => vm.severity === 'error')) ||
              row.RowValidationResult
            ) {
              errorRow = true;
            }
          });
        }
        if (errorRow && errorRowsBehaviour === 'Skip') continue;

        const { id: activityId, shortId, payload, geog } = _mapToDBObject(
          row,
          desiredFinalStatus,
          template.type,
          template.subtype,
          userInfo
        );

        let guid = null;
        if (userInfo?.idir_userid !== null) {
          guid = userInfo?.idir_userid.toLowerCase() + '@idir';
        } else if (userInfo?.bceid_userid !== null) {
          guid = userInfo?.bceid_userid.toLowerCase() + '@bceid-business';
        }
        const qc = {
          text: `INSERT INTO activity_incoming_data (activity_id, short_id, activity_payload, batch_id, activity_type,
                                                   activity_subtype, form_status, created_by, updated_by,
                                                   created_by_with_guid, updated_by_with_guid, geog, row_number,
                                                   species_positive,
                                                   species_negative,
                                                   species_treated)
               values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
          values: [
            activityId,
            shortId,
            payload,
            id,
            template.type,
            template.subtype,
            errorRow ? errorRowsBehaviour : desiredFinalStatus,
            userInfo?.preferred_username,
            userInfo?.preferred_username,
            guid,
            guid,
            geog,
            index,
            JSON.stringify(payload['species_positive']),
            JSON.stringify(payload['species_negative']),
            JSON.stringify(payload['species_treated'])
          ]
        };

        defaultLog.debug({
          message: 'executing insert for batch',
          params: {
            qc
          }
        });

        try {
          await dbConnection.query(qc);
        } catch (e) {
          defaultLog.debug({
            message: 'error executing insert for batch error->' + JSON.stringify(e)
          });
          throw e;
        }
      }
    } catch (e) {
      await dbConnection.query('ROLLBACK;');
      throw e;
    }
    await dbConnection.query('COMMIT;');

    await dbConnection.query({
      text: `UPDATE batch_uploads
             set status = 'SUCCESS'
             where id = $1
               and status = 'NEW'`,
      values: [id]
    });

    defaultLog.info({
      message: 'finishing batch exec run',
      id
    });

    return {
      createdActivityIDs: createdIds
    };
  }
};

import { randomUUID } from 'crypto';
import { PoolClient } from 'pg';
import moment from 'moment';
import {
  activity_create_function,
  ActivityLetter,
  ActivitySubtype,
  autofillChemFields,
  populateSpeciesArrays
} from 'sharedAPI';
import SQL, { SQLStatement } from 'sql-template-strings';
import { Template } from './definitions';
import { mapTemplateFields } from './blob-utils';
import { InvasivesRequest } from 'utils/auth-utils';

interface BatchExecutionResult {
  createdActivityIDs: string[];
}

interface MappedForDB {
  id: string;
  shortId: string;
  payload: object;
  geog: unknown;
}

function _mapToDBObject(row, status, type, subtype, userInfo): MappedForDB {
  const uuidToCreate = randomUUID();
  const shortYear = moment().format().substr(2, 2);
  const shortId = shortYear + ActivityLetter[subtype] + uuidToCreate.substr(0, 8).toUpperCase();
  const tankMix = {
    no: 'Chemical Treatment (No Tank Mix) - Application Method',
    yes: 'Chemical Treatment (If Tank Mix) - Application Method'
  };
  let mapped = activity_create_function(
    type,
    subtype,
    userInfo?.preferred_username,
    userInfo?.friendlyUsername,
    userInfo?.pac_number,
    'batch'
  );

  mapped = mapTemplateFields(mapped, row);

  if (
    mapped?.form_data?.activity_data?.invasive_species_agency_code &&
    mapped.form_data.activity_data.invasive_species_agency_code.length > 0
  ) {
    mapped.form_data.activity_data.invasive_species_agency_code =
      mapped.form_data.activity_data.invasive_species_agency_code.join();
  }

  if ([ActivitySubtype.Treatment_ChemicalPlant, ActivitySubtype.Treatment_ChemicalPlantAquatic].includes(subtype)) {
    const chemicalMethodSprayCodes = row.data[tankMix.yes]?.templateColumn.codes.map((codeObj) => codeObj.code);
    const chemicalMethodCodes = row.data[tankMix.no]?.templateColumn.codes.map((codeObj) => codeObj.code);
    mapped = autofillChemFields(mapped, chemicalMethodSprayCodes, chemicalMethodCodes);
  }

  const blobPathMapping = {
    Activity_Monitoring_BiocontrolDispersal_TerrestrialPlant: 'Monitoring_BiocontrolDispersal_Information',
    Activity_Biocontrol_Release: 'Biocontrol_Release_Information',
    Activity_Biocontrol_Collection: 'Biocontrol_Collection_Information',
    Activity_Monitoring_BiocontrolRelease_TerrestrialPlant: 'Monitoring_BiocontrolRelease_TerrestrialPlant_Information'
  };

  function updateTotalBioAgentQuantity(record) {
    const subtypeData = record?.form_data?.activity_subtype_data;
    const path = blobPathMapping[record.activity_subtype];

    if (!subtypeData || !path || !Array.isArray(subtypeData[path])) return record;

    subtypeData[path].forEach((item) => {
      if (!item.actual_biological_agents && !item.estimated_biological_agents) return;
      if (item.actual_biological_agents) {
        const actualTotal = item.actual_biological_agents.reduce((sum, agent) => sum + agent.release_quantity, 0);
        item.total_bio_agent_quantity_actual = actualTotal;
        item.total_bio_agent_quantity_estimated = 0;
        delete item.estimated_biological_agents;
      }
      if (item.estimated_biological_agents) {
        const estimatedTotal = item.estimated_biological_agents.reduce((sum, agent) => sum + agent.release_quantity, 0);
        item.total_bio_agent_quantity_estimated = estimatedTotal;
        item.total_bio_agent_quantity_actual = 0;
        delete item.actual_biological_agents;
      }
    });

    return record;
  }

  mapped = updateTotalBioAgentQuantity(mapped);
  mapped = populateSpeciesArrays(mapped);
  mapped.form_data.form_status = status;

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

interface Config {
  dbConnection: PoolClient;
  id: number | string;
  template: Template;
  validatedBatchData: any;
  desiredFinalStatus: 'Draft' | 'Submitted';
  errorRowsBehaviour: 'Draft' | 'Skip';
  userInfo: InvasivesRequest['authContext']['user'];
}

export const BatchExecutionService = {
  executeBatch: async (config: Config): Promise<BatchExecutionResult> => {
    /**
     * @desc bulk insert batch values, empty array after upload.
     */
    const batchUploadCurrentEntries = async (): Promise<void> => {
      if (insertValues.length === 0) return; // Array is empty, skip transaction.
      const sql = SQL`
        INSERT INTO activity_incoming_data(
          activity_id,          short_id,     activity_payload,  batch_id,         activity_type,
          activity_subtype,     form_status,  created_by,        updated_by,       created_by_with_guid,
          updated_by_with_guid, geog,         row_number,        species_positive, species_negative,
          species_treated,      platform_src         
        ) VALUES
      `;
      insertValues.forEach((row, index) => {
        sql.append(row);
        if (index !== insertValues.length - 1) sql.append(',');
      });
      await dbConnection.query(sql.text, sql.values);
      insertValues.length = 0; // empty array.
    };

    const { dbConnection, id, template, validatedBatchData, desiredFinalStatus, errorRowsBehaviour, userInfo } = config;
    const createdIds = [];
    const sql = SQL`
      SELECT status
      FROM batch_uploads
      WHERE id = ${id}
      AND status = 'NEW'
    `;
    const statusQueryResult = (await dbConnection.query(sql.text, sql.values)).rowCount;
    if (statusQueryResult !== 1) throw new Error('Batch not in executable status');

    await dbConnection.query(SQL`BEGIN`);

    const insertValues: Array<SQLStatement> = [];
    try {
      for (const [index, row] of validatedBatchData.rows.entries()) {
        const hasErrorRow =
          row.rowValidationResult.some(({ valid }) => !valid) ||
          Object.values(row.data).some(
            (v: any) => v?.validationMessages?.some(({ severity }) => severity === 'error') || row.RowValidationResult
          );

        if (hasErrorRow && errorRowsBehaviour === 'Skip') continue;

        const {
          id: activityId,
          shortId,
          payload,
          geog
        } = _mapToDBObject(row, desiredFinalStatus, template.type, template.subtype, userInfo);

        const guid = (() => {
          if (userInfo?.idir_userid !== null) {
            return userInfo?.idir_userid.toLowerCase() + '@idir';
          } else if (userInfo?.bceid_userid !== null) {
            return userInfo?.bceid_userid.toLowerCase() + '@bceid-business';
          }
        })();
        const sTreat = JSON.stringify(payload['species_treated']);
        const sNeg = JSON.stringify(payload['species_negative']);
        const sPos = JSON.stringify(payload['species_positive']);
        const errEntry = hasErrorRow ? errorRowsBehaviour : desiredFinalStatus;

        insertValues.push(SQL` (
            ${activityId},        ${shortId},                 ${payload},                     ${id},                          ${template.type},
            ${template.subtype},  ${errEntry},                ${userInfo.preferred_username}, ${userInfo.preferred_username}, ${guid},
            ${guid},              ${geog},                    ${index},                       ${sPos},                        ${sNeg},
            ${sTreat},            ${payload['platform_src']} 
          )
        `);
        if (insertValues.length >= 10) await batchUploadCurrentEntries();
      }
      await batchUploadCurrentEntries(); // Insert any remaining rows
    } catch (e) {
      await dbConnection.query(SQL`ROLLBACK`);
      throw e;
    }
    await dbConnection.query(SQL`COMMIT`);
    await dbConnection.query(SQL`
      UPDATE batch_uploads
      SET status = 'SUCCESS'
      WHERE id = ${id}
      AND status = 'NEW';  
    `);
    return { createdActivityIDs: createdIds };
  }
};

export { _mapToDBObject };

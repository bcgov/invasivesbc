import { randomUUID } from 'crypto';
import { PoolClient } from 'pg';
import moment from 'moment';
import { activity_create_function, ActivityLetter, autofillChemFields, populateSpeciesArrays } from 'sharedAPI';
import SQL from 'sql-template-strings';
import { Template } from './definitions';
import { mapTemplateFields } from './blob-utils';
import { commit as commitContext } from 'utils/context-queries';
import LoggerHandler from 'utils/endpoints/LoggerHandler';
import { InvasivesRequest } from 'utils/auth-utils';

const logger = new LoggerHandler('batch-execution');

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

  const blobPathMapping = {
    Activity_Monitoring_BiocontrolDispersal_TerrestrialPlant: 'Monitoring_BiocontrolDispersal_Information',
    Activity_Biocontrol_Release: 'Biocontrol_Release_Information',
    Activity_Biocontrol_Collection: 'Biocontrol_Collection_Information',
    Activity_Monitoring_BiocontrolRelease_TerrestrialPlant: 'Monitoring_BiocontrolRelease_TerrestrialPlant_Information'
  };

  function updateTotalBioAgentQuantity(record) {
    const subtypeData = record?.form_data?.activity_subtype_data;
    const path = blobPathMapping[record.activity_subtype];

    if (!subtypeData || !path || !Array.isArray(subtypeData[path])) {
      return record;
    }

    subtypeData[path].forEach((item) => {
      if (!item.actual_biological_agents && !item.estimated_biological_agents) {
        return;
      }

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

interface Config {
  dbConnection: PoolClient;
  id: number | string;
  template: Template;
  validatedBatchData: any;
  desiredFinalStatus: 'Draft' | 'Submitted';
  errorRowsBehaviour: 'Draft' | 'Skip';
  userInfo: any;
  req: InvasivesRequest;
}
export const BatchExecutionService = {
  executeBatch: async (config: Config): Promise<BatchExecutionResult> => {
    const { dbConnection, id, template, validatedBatchData, desiredFinalStatus, errorRowsBehaviour, userInfo, req } =
      config;

    logger.info(`Starting batch exec run, status->${desiredFinalStatus}, error rows->${errorRowsBehaviour}`);
    const createdIds = [];
    const sql = SQL`
      SELECT status
      FROM batch_uploads
      WHERE id = ${id}
      AND status = 'NEW'
    `;
    const statusQueryResult = await dbConnection.query(sql.text, sql.values);
    if (statusQueryResult.rowCount !== 1) throw new Error('Batch not in executable status');

    await dbConnection.query(SQL`BEGIN`);

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
        const errEntry = errorRow ? errorRowsBehaviour : desiredFinalStatus;
        const qc = SQL`
          INSERT INTO activity_incoming_data(
            activity_id,          short_id,    activity_payload, batch_id,         activity_type,
            activity_subtype,     form_status, created_by,       updated_by,       created_by_with_guid,
            updated_by_with_guid, geog,        row_number,       species_positive, species_negative,
            species_treated,      platform_src
          )
          VALUES (
            ${activityId},       ${shortId},                ${payload},                     ${id},                          ${template.type},
            ${template.subtype}, ${errEntry},               ${userInfo.preferred_username}, ${userInfo.preferred_username}, ${guid},
            ${guid},             ${geog},                   ${index},                       ${sPos},                        ${sNeg},
            ${sTreat},           ${payload['platform_src']}
          )
        `;

        logger.debug('[executeBatch]: Inserting new Entry', {
          activity_id: activityId,
          short_id: shortId,
          batch_id: Number(id)
        });

        await dbConnection.query(qc.text, qc.values);
        // Add BCGW Data
        const { latitude, longitude } = payload?.form_data?.activity_data;
        const context = {
          activity_id: activityId,
          latitude,
          longitude,
          db: dbConnection
        };
        await commitContext(context);
      }
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

    logger.info('[executeBatch]: Finishing Exec Run', { id });
    return { createdActivityIDs: createdIds };
  }
};

export { _mapToDBObject };

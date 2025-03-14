import { Feature } from 'geojson';
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import {
  ActivityStatus,
  ActivitySubtype,
  ActivitySyncStatus,
  ActivityType,
  getShortActivityID,
  ReviewStatus,
  ActivitySubtypeShortLabels,
  ActivitySubtypeTargetKey
} from 'sharedAPI';
import { getFieldsToCopy } from '../rjsf/business-rules/formDataCopyFields';
import { IActivity } from '../interfaces/activity-interfaces';
import { DocType } from '../constants/database';

export const activityDefaults = {
  doc_type: DocType.ACTIVITY,
  date_created: new Date(),
  media: undefined,
  created_by: undefined,
  user_role: undefined,
  sync_status: ActivitySyncStatus.NOT_SAVED,
  form_status: ActivityStatus.DRAFT,
  review_status: ReviewStatus.NOT_REVIEWED,
  reviewed_by: undefined,
  reviewed_at: undefined
};

/*
  Function to generate activity payload for a new activity (in old pouchDB doc format)
*/
export function generateActivityPayload(
  formData: any,
  geometry: Feature[],
  activityType: ActivityType,
  activitySubtype: ActivitySubtype,
  docType?: DocType
): IActivity {
  const id = uuidv4();
  const short_id: string = getShortActivityID({
    activity_subtype: activitySubtype,
    activity_id: id,
    date_created: new Date()
  });
  return {
    _id: id,
    id: id,
    shortId: short_id,
    activityId: id,
    docType: docType,
    activityType,
    activitySubtype,
    status: ActivityStatus.DRAFT,
    sync: {
      ready: false,
      status: ActivitySyncStatus.NOT_SAVED,
      error: null
    },
    dateCreated: new Date(),
    dateUpdated: null,
    formData,
    formStatus: ActivityStatus.DRAFT,
    geometry
  };
}

/*
  Function to generate activity payload for a new activity (in old pouchDB doc format)
*/

export function cloneDBRecord(dbRecord) {
  const id = uuidv4();
  const time = moment(new Date()).format();
  const clonedRecord = {
    ...dbRecord,
    _id: id,
    date_created: time,
    date_updated: null,
    status: ActivityStatus.DRAFT,
    activity_id: id
  };
  clonedRecord.short_id = getShortActivityID(clonedRecord);
  return clonedRecord;
}

/*
  Function to create a brand new activity and save it to the DB
*/
export async function addNewActivityToDB(
  databaseContext: any,
  activityType: ActivityType,
  activitySubtype: ActivitySubtype
): Promise<IActivity> {
  const formData = {
    activity_data: {
      activity_date_time: moment(new Date()).format()
    }
  };
  const doc: IActivity = generateActivityPayload(formData, null, activityType, activitySubtype);

  await databaseContext.database.put(doc);
  return doc;
}

export async function cloneActivity(clonedRecord: any) {
  const id = uuidv4();

  // Used to avoid pouch DB conflict
  delete clonedRecord._rev;

  const doc: any = {
    ...clonedRecord,
    _id: id,
    dateCreated: new Date(),
    dateUpdated: null,
    status: ActivityStatus.DRAFT,
    activityId: id
  };

  return doc;
}

/*
  Function to format a linked activity object
  The activity_id field which is present in the form data is populated to reference the linked activity record's id
  Also, the activity_data is populated based on business logic rules which specify which fields to copy
*/
export async function createLinkedActivity(
  activityType: ActivityType,
  activitySubtype: ActivitySubtype,
  linkedRecord: any
): Promise<IActivity> {
  const { activityData, activitySubtypeData } = getFieldsToCopy(
    linkedRecord.formData.activity_data,
    linkedRecord.formData.activity_subtype_data,
    linkedRecord.activitySubtype
  );

  const formData: any = {
    activity_data: {
      ...activityData,
      activity_date_time: moment(new Date()).format()
    },
    activity_subtype_data: {
      ...activitySubtypeData
    }
  };
  const geometry = linkedRecord.geometry;

  /*
    Since chemical plant treatments are different and do not have activity_type_data
    the linked record activity id field is present in the activity_subtype_data
  */
  if (activitySubtype === ActivitySubtype.Treatment_ChemicalPlant) {
    formData.activity_subtype_data = {
      ...formData.activity_subtype_data,
      activity_id: linkedRecord._id
    };
  } else {
    formData.activity_type_data = { activity_id: linkedRecord._id };
  }

  const doc: IActivity = generateActivityPayload(formData, geometry, activityType, activitySubtype);

  return doc;
}

/*
  function to determine if a Monitoring activity subtype requires a linked treatment ID.
*/
export function isLinkedTreatmentSubtype(subType: ActivitySubtype): boolean {
  return [
    ActivitySubtype.Monitoring_ChemicalTerrestrialAquaticPlant,
    ActivitySubtype.Monitoring_MechanicalTerrestrialAquaticPlant,
    ActivitySubtype.Monitoring_BiologicalTerrestrialPlant
  ].includes(subType);
}
// extract and set the species codes (both positive and negative) of a given activity (or POI, once they're editable)

export function populateJurisdictionArray(record) {
  const jurisdictions = record?.form_data?.activity_data?.jurisdictions;

  let jurisdiction = [];
  if (jurisdictions) {
    jurisdiction = jurisdictions?.map((j) => {
      return j.jurisdiction_code;
    });
  } else {
    return record;
  }

  return {
    ...record,
    jurisdiction: jurisdiction.sort() || []
  };
}

export function findSpeciesCodesAndConcatenateLabels(
  obj: any,
  targetKey: string,
  properties: Record<string, any>,
  specialCase: boolean
): string {
  const result: Record<string, Set<string>> = {
    invasive_plant_code: new Set(),
    invasive_plant_aquatic_code: new Set()
  };

  const keysToFind = ['invasive_plant_code', 'invasive_plant_aquatic_code'];

  function searchAndExtract(obj: any): void {
    if (Array.isArray(obj)) {
      obj.forEach(searchAndExtract);
    } else if (obj !== null && typeof obj === 'object') {
      Object.keys(obj).forEach((key) => {
        if (key === targetKey) {
          searchAndExtract(obj[key]); // continue searching in the targetKey's value
        } else if (keysToFind.includes(key) && obj[key]) {
          const values = Array.isArray(obj[key]) ? obj[key] : [obj[key]];
          values.forEach((value) => result[key].add(value));
        } else {
          searchAndExtract(obj[key]); // recurse into other nested objects
        }
      });
    }
  }

  function getLabels(): string {
    let labels: string[] = [];

    for (const key of keysToFind) {
      let propertyKey = specialCase ? 'invasive_plant_aquatic_code' : key;

      if (result[key].size > 0 && properties[propertyKey]?.options) {
        const optionsMap = new Map<string, string>(
          properties[propertyKey].options.map((option: { value: string; label: string }) => [
            option.value,
            option.label
          ])
        );

        result[key].forEach((value) => {
          const label = optionsMap.get(value);
          if (label) {
            labels.push(label);
          }
        });
      }
    }
    return labels.join(', ') || '';
  }

  searchAndExtract(obj);
  return getLabels();
}

export function transformOfflineActivitiesForRecordTable(
  offlineActivities: Record<string, any>,
  listOptions: any
): Record<string, any> {
  try {
    Object.entries(offlineActivities).forEach(([key, value]) => {
      offlineActivities[key].data.activity_date = new Date(
        value.data?.form_data?.activity_data?.activity_date_time ??
          value.data?.form_data?.activity_data?.activity_date_time ??
          null
      )
        .toISOString()
        .substring(0, 10);

      offlineActivities[key].data.activity_subtype = ActivitySubtypeShortLabels[value.record_type] || 'Unknown';

      offlineActivities[key].data.invasive_plant = findSpeciesCodesAndConcatenateLabels(
        offlineActivities[key].data.form_data.activity_subtype_data,
        ActivitySubtypeTargetKey[offlineActivities[key].record_type],
        listOptions?.components?.schemas.ChemicalTreatment_Species_Codes.properties,
        [
          // Special case: if activity_subtype is in this list, switch between invasive_plant_code and invasive_plant_aquatic_code when searching api docs
          ActivitySubtype.Treatment_MechanicalPlantAquatic,
          ActivitySubtype.Treatment_ChemicalPlantAquatic,
          ActivitySubtype.Observation_PlantAquatic
        ].includes(offlineActivities[key].record_type as ActivitySubtype)
      );

      offlineActivities[key].data.jurisdiction_display = (offlineActivities[key].data?.jurisdiction || [])
        .map(
          (val) =>
            listOptions?.components?.schemas[
              value.record_type
            ].properties.activity_data.properties.jurisdictions.items.properties.jurisdiction_code.options.find(
              (item) => item.value === val
            )?.label
        )
        .filter((label) => label)
        .join(', ');

      offlineActivities[key].data.agency =
        listOptions?.components?.schemas[
          value.record_type
        ].properties.activity_data.properties.invasive_species_agency_code.options.find(
          (item) => item.value === offlineActivities[key].data.form_data.activity_data.invasive_species_agency_code
        )?.label || '';

      offlineActivities[key].data.reported_area = offlineActivities[key].data.form_data.activity_data.reported_area;
    });
    return offlineActivities;
  } catch (error) {
    console.log(error);
    return {};
  }
}

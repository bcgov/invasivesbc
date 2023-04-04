import { Feature } from 'geojson';
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
export * from './herbicideCalculator'
export * from './chemTreatmentValidation'
export * from './herbicideApplicationRates'

export const activity_create_function = (
  type: string,
  subType: string,
  username: string,
  displayName: string,
  pac_number?: string
) => {
  let activityV1 = generateDBActivityPayload({}, null, type, subType);
  let activityV2 = populateSpeciesArrays(activityV1);
  activityV2.created_by = username;

  //    if ([ActivityType.Observation, ActivityType.Treatment].includes(activityV2.activity_type))
  {
    activityV2.form_data.activity_type_data.activity_persons = [{ person_name: displayName }];
  }

  if ([ActivityType.Treatment].includes(activityV2.activity_type)) {
    activityV2.form_data.activity_type_data.activity_persons[0].applicator_license = pac_number;
  }

  return activityV2;
};


export function generateDBActivityPayload(
  formData: any,
  geometry: Feature[] | null,
  activityType: string,
  activitySubtype: string
) {
  const id = uuidv4();
  const time = moment(new Date()).format();
  const short_id: string | undefined = getShortActivityID({
    activity_subtype: activitySubtype,
    activity_id: id,
    date_created: time
  });
  let returnVal = {
    initial_autofill_done: false,
    _id: id,
    short_id: short_id,
    activity_id: id,
    activity_type: activityType,
    activity_subtype: activitySubtype,
    geometry,
    created_timestamp: time, // TODO different?
    date_created: time, // TODO different?
    date_updated: null,
    form_data: {
      ...formData,
      activity_data: {
        ...formData?.activity_data,
        activity_date_time: time
      },
      activity_type_data: {},
      activity_subtype_data: {}
    },
    media: undefined,
    created_by: undefined,
    sync_status: ActivitySyncStatus.NOT_SAVED,
    form_status: ActivityStatus.DRAFT,
    review_status: 'Not Reviewed',
    reviewed_by: undefined,
    reviewed_at: undefined
  };
  if (returnVal.activity_subtype === ActivitySubtype.Treatment_ChemicalPlant) {
    returnVal.form_data.activity_subtype_data.chemical_treatment_details = {
      invasive_plants: [],
      herbicides: [],
      tank_mix: false,
      chemical_application_method: null,
      tank_mix_object: {
        herbicides: [],
        calculation_type: null
      },
      skipAppRateValidation: false
    };
  }
  if (returnVal.activity_subtype === ActivitySubtype.Treatment_ChemicalPlantAquatic) {
    returnVal.form_data.activity_subtype_data.chemical_treatment_details = {
      invasive_plants: [],
      herbicides: [],
      tank_mix: false,
      chemical_application_method: null,
      tank_mix_object: {
        herbicides: [],
        calculation_type: null
      },
      skipAppRateValidation: false
    };
  }
  if (returnVal.activity_subtype === ActivitySubtype.Collection_Biocontrol) {
    returnVal.form_data.activity_subtype_data.Biocontrol_Collection_Information = {
      actual_biological_agents: [{}],
      estimated_biological_agents: [{}]
    };
  }
  if (returnVal.activity_subtype === ActivitySubtype.Treatment_BiologicalPlant) {
    returnVal.form_data.activity_subtype_data.Biocontrol_Release_Information = {
      actual_biological_agents: [{}],
      estimated_biological_agents: [{}]
    };
  }
  if (returnVal.activity_subtype === ActivitySubtype.Monitoring_BiologicalDispersal) {
    returnVal.form_data.activity_subtype_data.Monitoring_BiocontrolRelease_TerrestrialPlant_Information = {
      actual_biological_agents: [{}],
      estimated_biological_agents: [{}]
    };
  }
  return returnVal;
}


export const getShortActivityID = (activity) => {
  if (!activity?.activity_subtype || !activity?.activity_id || !(activity?.date_created || activity.created_timestamp))
    return;
  const shortYear = moment(activity.date_created || activity.created_timestamp)
    .format()
    .substr(2, 2);
  return shortYear + ActivityLetter[activity.activity_subtype] + activity.activity_id.substr(0, 4).toUpperCase();
};


export function populateSpeciesArrays(record) {
  let species_positive: any = [];
  let species_negative: any[] = [];
  let species_treated: any[] = [];

  const subtypeData = record?.form_data?.activity_subtype_data;

  switch (record.activity_subtype) {
    case ActivitySubtype.Observation_PlantTerrestrial:
      species_positive = subtypeData?.TerrestrialPlants?.filter((plant) =>
        plant.observation_type?.includes('Positive')
      ).map((plant) => plant.invasive_plant_code);
      species_negative = subtypeData?.TerrestrialPlants?.filter((plant) =>
        plant.observation_type?.includes('Negative')
      ).map((plant) => plant.invasive_plant_code);
      break;
    case ActivitySubtype.Observation_PlantAquatic:
      species_positive = subtypeData?.AquaticPlants?.filter((plant) =>
        plant.observation_type?.includes('Positive')
      ).map((plant) => plant.invasive_plant_code);
      species_negative = subtypeData?.AquaticPlants?.filter((plant) =>
        plant.observation_type?.includes('Negative')
      ).map((plant) => plant.invasive_plant_code);
      break;

    case ActivitySubtype.Activity_AnimalTerrestrial:
      // no species selection currently
      break;
    case ActivitySubtype.Activity_AnimalAquatic:
      species_treated = subtypeData?.invasive_aquatic_animals?.map((animal) => animal.invasive_animal_code);
      break;
    case ActivitySubtype.Treatment_ChemicalPlantAquatic:
      species_treated = subtypeData?.chemical_treatment_details?.invasive_plants?.map(
        (plant) => plant.invasive_plant_code
      );
      break;
    case ActivitySubtype.Treatment_ChemicalPlant:
      species_treated = subtypeData?.chemical_treatment_details?.invasive_plants?.map(
        (plant) => plant.invasive_plant_code
      );
      break;
    case ActivitySubtype.Treatment_MechanicalPlantAquatic:
      species_treated = subtypeData?.Treatment_MechanicalPlant_Information?.map((plant) => plant.invasive_plant_code);
      break;
    case ActivitySubtype.Treatment_MechanicalPlant:
      species_treated = subtypeData?.Treatment_MechanicalPlant_Information?.map((plant) => plant.invasive_plant_code);
      break;
    case ActivitySubtype.Treatment_BiologicalPlant:
      species_treated = [subtypeData?.Biocontrol_Release_Information?.invasive_plant_code];
      break;
    case ActivitySubtype.Monitoring_ChemicalTerrestrialAquaticPlant:
      species_treated = subtypeData?.Monitoring_ChemicalTerrestrialAquaticPlant_Information?.invasive_plant_code
        ? [subtypeData?.Monitoring_ChemicalTerrestrialAquaticPlant_Information?.invasive_plant_code]
        : [subtypeData?.Monitoring_ChemicalTerrestrialAquaticPlant_Information?.invasive_plant_aquatic_code];
      break;
    case ActivitySubtype.Monitoring_MechanicalTerrestrialAquaticPlant:
      species_treated = subtypeData?.Monitoring_MechanicalTerrestrialAquaticPlant_Information?.invasive_plant_code
        ? [subtypeData?.Monitoring_MechanicalTerrestrialAquaticPlant_Information?.invasive_plant_code]
        : [subtypeData?.Monitoring_MechanicalTerrestrialAquaticPlant_Information?.invasive_plant_aquatic_code];
      break;
    case ActivitySubtype.Monitoring_BiologicalTerrestrialPlant:
      species_treated = [subtypeData?.Monitoring_BiocontrolRelease_TerrestrialPlant_Information?.invasive_plant_code];
      break;
    case ActivitySubtype.Monitoring_BiologicalDispersal:
      species_positive = [subtypeData?.Monitoring_BiocontrolDispersal_Information?.invasive_plant_code];
      break;
    case ActivitySubtype.Transect_FireMonitoring:
      species_positive = subtypeData?.fire_monitoring_transect_lines
        ?.map((line) =>
          line.fire_monitoring_transect_points?.map((point) =>
            point.invasive_plants?.map((plant) => plant.invasive_plant_code)
          )
        )
        .flat(3);
      break;
    case ActivitySubtype.Transect_Vegetation:
      species_positive = subtypeData?.vegetation_transect_lines
        ?.map((line) =>
          [
            line.vegetation_transect_points_percent_cover,
            line.vegetation_transect_points_number_plants,
            line.vegetation_transect_points_daubenmire
          ]
            .flat(2)
            .filter((point) => point)
            .map((point) =>
              point.vegetation_transect_species?.invasive_plants?.map((plant) => plant.invasive_plant_code)
            )
        )
        .flat(3);
      break;
    case ActivitySubtype.Transect_BiocontrolEfficacy:
      species_positive = subtypeData?.transect_invasive_plants?.map((plant) => plant.invasive_plant_code) || [];
      break;
    case ActivitySubtype.Collection_Biocontrol:
      species_treated = [subtypeData?.Biocontrol_Collection_Information?.invasive_plant_code];
      break;
    default:
      break;
  }
  const returnVal = {
    ...record,
    species_positive:
      Array.from(new Set(species_positive || []))
        ?.filter((code) => typeof code === 'string')
        .sort() || [],
    species_negative:
      Array.from(new Set(species_negative || []))
        ?.filter((code) => typeof code === 'string')
        .sort() || [],
    species_treated:
      Array.from(new Set(species_treated || []))
        ?.filter((code) => typeof code === 'string')
        .sort() || []
  };
  return returnVal;
}

export enum ActivityCategory {
  Plant = 'Plant',
  Animal = 'Animal',
  FREP = 'FREP'
}

export enum ActivityType {
  Observation = 'Observation',
  Collection = 'Collection',
  Biocontrol = 'Biocontrol',
  Treatment = 'Treatment',
  Monitoring = 'Monitoring',
  FREP = 'FREP'
}

export enum ActivitySubtype {
  // Observations:
  Observation_PlantTerrestrial = 'Activity_Observation_PlantTerrestrial',
  Observation_PlantTerrestrial_BulkEdit = 'Activity_Observation_PlantTerrestrial_BulkEdit',
  Observation_PlantAquatic = 'Activity_Observation_PlantAquatic',

  Activity_AnimalTerrestrial = 'Activity_AnimalActivity_AnimalTerrestrial',
  Activity_AnimalAquatic = 'Activity_AnimalActivity_AnimalAquatic',

  // Treatments:
  Treatment_ChemicalPlant = 'Activity_Treatment_ChemicalPlantTerrestrial',
  Treatment_ChemicalPlant_BulkEdit = 'Activity_Treatment_ChemicalPlant_BulkEdit',
  Treatment_ChemicalPlantAquatic = 'Activity_Treatment_ChemicalPlantAquatic',
  Treatment_MechanicalPlant = 'Activity_Treatment_MechanicalPlantTerrestrial',
  Treatment_MechanicalPlant_BulkEdit = 'Activity_Treatment_MechanicalPlant_BulkEdit',
  Treatment_MechanicalPlantAquatic = 'Activity_Treatment_MechanicalPlantAquatic',
  Treatment_BiologicalPlant = 'Activity_Biocontrol_Release',
  Treatment_BiologicalPlant_BulkEdit = 'Activity_Treatment_BiologicalPlant_BulkEdit',
  Treatment_ChemicalAnimalTerrestrial = 'Activity_Treatment_ChemicalAnimalTerrestrial',
  Treatment_MechanicalAnimalTerrestrial = 'Activity_Treatment_MechanicalAnimalTerrestrial',

  // Monitoring:
  Monitoring_ChemicalTerrestrialAquaticPlant = 'Activity_Monitoring_ChemicalTerrestrialAquaticPlant',
  Monitoring_MechanicalTerrestrialAquaticPlant = 'Activity_Monitoring_MechanicalTerrestrialAquaticPlant',
  Monitoring_BiologicalTerrestrialPlant = 'Activity_Monitoring_BiocontrolRelease_TerrestrialPlant',
  Monitoring_ChemicalAnimalTerrestrial = 'Activity_Monitoring_ChemicalAnimalTerrestrial',
  Monitoring_MechanicalAnimalTerrestrial = 'Activity_Monitoring_MechanicalAnimalTerrestrial',

  //Transects
  Transect_FireMonitoring = 'Activity_Transect_FireMonitoring',
  Transect_Vegetation = 'Activity_Transect_Vegetation',
  Transect_BiocontrolEfficacy = 'Activity_Transect_BiocontrolEfficacy',

  // Biocontrol:
  Monitoring_BiologicalDispersal = 'Activity_Monitoring_BiocontrolDispersal_TerrestrialPlant',
  Collection_Biocontrol = 'Activity_Biocontrol_Collection',

  //FREP
  Activity_FREP_FormA = 'Activity_FREP_FormA',
  Activity_FREP_FormB = 'Activity_FREP_FormB',
  Activity_FREP_FormC = 'Activity_FREP_FormC'
}

export const ActivitySubtypeRelations = {
  [ActivityCategory.Plant]: {
    [ActivityType.Observation]: [
      ActivitySubtype.Observation_PlantTerrestrial,
      ActivitySubtype.Observation_PlantAquatic
    ],
    [ActivityType.Treatment]: [
      ActivitySubtype.Treatment_ChemicalPlant,
      ActivitySubtype.Treatment_ChemicalPlantAquatic,
      ActivitySubtype.Treatment_MechanicalPlant,
      ActivitySubtype.Treatment_MechanicalPlantAquatic,
      ActivitySubtype.Treatment_BiologicalPlant
    ],
    [ActivityType.Biocontrol]: [ActivitySubtype.Collection_Biocontrol, ActivitySubtype.Monitoring_BiologicalDispersal],
    [ActivityType.Monitoring]: [
      ActivitySubtype.Monitoring_ChemicalTerrestrialAquaticPlant,
      ActivitySubtype.Monitoring_MechanicalTerrestrialAquaticPlant,
      ActivitySubtype.Monitoring_BiologicalTerrestrialPlant
    ]
  },
  [ActivityCategory.Animal]: {
    [ActivityType.Observation]: [ActivitySubtype.Activity_AnimalTerrestrial, ActivitySubtype.Activity_AnimalAquatic],
    [ActivityType.Treatment]: [
      ActivitySubtype.Treatment_ChemicalAnimalTerrestrial,
      ActivitySubtype.Treatment_MechanicalAnimalTerrestrial
    ],
    [ActivityType.Monitoring]: [
      ActivitySubtype.Monitoring_ChemicalAnimalTerrestrial,
      ActivitySubtype.Monitoring_MechanicalAnimalTerrestrial
    ]
  },
  [ActivityCategory.FREP]: { [ActivityType.FREP]: [ActivitySubtype.Activity_FREP_FormC] }
};

export enum ActivitySubtypeShortLabels {
  // Observations:
  Activity_Observation_PlantTerrestrial = 'Terrestrial Invasive Plant Observation',
  Activity_Observation_PlantAquatic = 'Aquatic Invasive Plant Observation',
  Activity_AnimalActivity_AnimalTerrestrial = 'Terrestrial Animal Observation',
  Activity_AnimalActivity_AnimalAquatic = 'Aquatic Animal Observation',

  // Treatments:
  Activity_Treatment_ChemicalPlantTerrestrial = 'Terrestrial Plant Treatment - Chemical',
  Activity_Treatment_ChemicalPlantAquatic = 'Aquatic Plant Treatment - Chemical',
  Activity_Treatment_MechanicalPlantTerrestrial = 'Terrestrial Plant Treatment - Mechanical',
  Activity_Treatment_MechanicalPlantAquatic = 'Aquatic Invasive Plant Mechanical Treatment',
  Activity_Biocontrol_Release = 'Biocontrol Release',
  Activity_Treatment_ChemicalAnimalTerrestrial = 'Terrestrial Animal Chemical Treatment',
  Activity_Treatment_MechanicalAnimalTerrestrial = 'Terrestrial Animal Mechanical Treatment',

  // Monitoring:
  Activity_Monitoring_ChemicalTerrestrialAquaticPlant = 'Chemical Treatment Monitoring',
  Activity_Monitoring_MechanicalTerrestrialAquaticPlant = 'Mechanical Treatment Monitoring',
  Activity_Monitoring_BiocontrolRelease_TerrestrialPlant = 'Biocontrol Release Monitoring',
  Activity_Monitoring_BiocontrolDispersal_TerrestrialPlant = 'Biocontrol Dispersal Monitoring',
  Activity_Monitoring_ChemicalAnimalTerrestrial = 'Chemical Monitoring Animal Terrestrial',
  Activity_Monitoring_MechanicalAnimalTerrestrial = 'Mechanical Monitoring Animal Terrestrial',

  // Transects:
  Activity_Transect_FireMonitoring = 'Wildfire & Prescribed Burn Monitoring',
  Activity_Transect_Vegetation = 'Vegetation Transect (Full, Lumped, Invasive Plant Density)',
  Activity_Transect_BiocontrolEfficacy = 'Biocontrol Efficacy Transect',

  // Collections:
  Activity_Biocontrol_Collection = 'Biocontrol Collection',

  // FREP
  Activity_FREP_FormA = 'Form A',
  Activity_FREP_FormB = 'Form B',
  Activity_FREP_FormC = 'Form C'
}


export enum ActivityLetter {
  // Observations:
  Activity_Observation_PlantTerrestrial = 'PTO',
  Activity_Observation_PlantTerrestrial_BulkEdit = 'PTO',
  Activity_Observation_PlantAquatic = 'PAO',
  Activity_AnimalActivity_AnimalTerrestrial = 'ATO',
  Activity_AnimalActivity_AnimalAquatic = 'AAO',

  // Treatments:
  Activity_Treatment_ChemicalPlantTerrestrial = 'PTC',
  Activity_Treatment_ChemicalPlant_BulkEdit = 'PTC',
  Activity_Treatment_ChemicalPlantAquatic = 'PAC',
  Activity_Treatment_MechanicalPlantTerrestrial = 'PTM',
  Activity_Treatment_MechanicalPlant_BulkEdit = 'PTM',
  Activity_Treatment_MechanicalPlantAquatic = 'PAM',
  Activity_Biocontrol_Release = 'PBR',
  Activity_Treatment_BiologicalPlant_BulkEdit = 'PBR',
  Activity_Treatment_ChemicalAnimalTerrestrial = 'ATC',
  Activity_Treatment_MechanicalAnimalTerrestrial = 'ATM',
  Activity_Treatment_MechanicalAnimalAquatic = 'AAM',
  Activity_Treatment_ChemicalAnimalAquatic = 'AAC',

  // Monitoring:
  Activity_Monitoring_ChemicalTerrestrialAquaticPlant = 'PMC',
  Activity_Monitoring_MechanicalTerrestrialAquaticPlant = 'PMM',
  Activity_Monitoring_BiocontrolRelease_TerrestrialPlant = 'PBM',
  Activity_Monitoring_ChemicalAnimalTerrestrial = 'AMC',
  Activity_Monitoring_MechanicalAnimalTerrestrial = 'AMM',

  // Transects:
  Activity_Transect_FireMonitoring = 'PXW',
  Activity_Transect_Vegetation = 'PXV',
  Activity_Transect_BiocontrolEfficacy = 'PXB',

  // Biocontrol:
  Activity_Biocontrol_Collection = 'PBC',
  Activity_Monitoring_BiocontrolDispersal_TerrestrialPlant = 'PBD',

  // FREP
  Activity_FREP_FormA = 'PFA',
  Activity_FREP_FormB = 'PFB',
  Activity_FREP_FormC = 'PFC'
}

export enum ActivityStatus {
  DRAFT = 'Draft',
  SUBMITTED = 'Submitted',
  IN_REVIEW = 'In Review'
}

export enum ActivitySyncStatus {
  NOT_SAVED = 'Not Saved',
  SAVE_SUCCESSFUL = 'Save Successful',
  SAVE_FAILED = 'Saving Failed'
}

export enum FormValidationStatus {
  NOT_VALIDATED = 'Not Validated',
  INVALID = 'Invalid',
  VALID = 'Valid'
}

export enum ReviewStatus {
  PREAPPROVED = 'Pre-Approved', // is an admin activity, requiring no mandatory review process
  NOT_REVIEWED = 'Not Reviewed', // unreviewed, requiring review eventually
  UNDER_REVIEW = 'Under Review', // passed to review process
  APPROVED = 'Approved', // approved by review process
  DISAPPROVED = 'Disapproved' // deemed invalid by review process - can be resubmitted for review
}

export const ReviewActionDescriptions: { [key: string]: string } = {
  [ReviewStatus.PREAPPROVED]:
    'Submit this for Review by InvasivesBC staff. Currently pre-approved and does not require further review.',
  [ReviewStatus.NOT_REVIEWED]: 'Submit this for Review by InvasivesBC staff.',
  [ReviewStatus.UNDER_REVIEW]: 'Submitted for review.  This form is currently being reviewed by the InvasivesBC staff',
  [ReviewStatus.APPROVED]:
    'Re-Submit this for Review by InvasivesBC staff. Currently approved and does not require further review.',
  [ReviewStatus.DISAPPROVED]:
    'Re-Submit this for Review by InvasivesBC staff. Currently dispproved and requires changes for approval.'
};





export class ChemTreatmentCalculator  {

  constructor() {
//    this.calculation_type = 'default';
  }

}
import { Assignment, Build, SvgIconComponent, Visibility } from '@mui/icons-material';

// this stuff would make a lot more sense in a database table
export enum ActivityType {
  Observation = 'Observation',
  Collection = 'Collection',
  AnimalActivity = 'AnimalActivity',
  Dispersal = 'Dispersal',
  Transect = 'Transect',
  Treatment = 'Treatment',
  Monitoring = 'Monitoring',
  FREP = 'FREP'
}

export enum ActivitySubtype {
  Observation_PlantTerrestrial = 'Activity_Observation_PlantTerrestrial',
  Observation_PlantTerrestrial_BulkEdit = 'Activity_Observation_PlantTerrestrial_BulkEdit',
  Observation_PlantAquatic = 'Activity_Observation_PlantAquatic',

  Activity_AnimalTerrestrial = 'Activity_AnimalActivity_AnimalTerrestrial',
  Activity_AnimalAquatic = 'Activity_AnimalActivity_AnimalAquatic',

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

  Monitoring_ChemicalTerrestrialAquaticPlant = 'Activity_Monitoring_ChemicalTerrestrialAquaticPlant',
  Monitoring_MechanicalTerrestrialAquaticPlant = 'Activity_Monitoring_MechanicalTerrestrialAquaticPlant',
  Monitoring_BiologicalTerrestrialPlant = 'Activity_Monitoring_BiocontrolRelease_TerrestrialPlant',
  Monitoring_BiologicalDispersal = 'Activity_Monitoring_BiocontrolDispersal_TerrestrialPlant',
  Monitoring_ChemicalAnimalTerrestrial = 'Activity_Monitoring_ChemicalAnimalTerrestrial',
  Monitoring_MechanicalAnimalTerrestrial = 'Activity_Monitoring_MechanicalAnimalTerrestrial',

  Transect_FireMonitoring = 'Activity_Transect_FireMonitoring',
  Transect_Vegetation = 'Activity_Transect_Vegetation',
  Transect_BiocontrolEfficacy = 'Activity_Transect_BiocontrolEfficacy',

  Collection_Biocontrol = 'Activity_Biocontrol_Collection',
  Activity_FREP_FormA = 'Activity_FREP_FormA',
  Activity_FREP_FormB = 'Activity_FREP_FormB',
  Activity_FREP_FormC = 'Activity_FREP_FormC'
}

export enum ActivitySubtypeShortLabels {
  // Observations:
  Activity_Observation_PlantTerrestrial = 'Terrestrial Plant Observation',
  Activity_Observation_PlantAquatic = 'Aquatic Plant Observation',
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
  Activity_Monitoring_ChemicalTerrestrialAquaticPlant = 'Chemical',
  Activity_Monitoring_MechanicalTerrestrialAquaticPlant = 'Mechanical',
  Activity_Monitoring_BiocontrolRelease_TerrestrialPlant = 'Biocontrol Release Monitoring',
  Activity_Monitoring_BiocontrolDispersal_TerrestrialPlant = 'Biocontrol Dispersal Monitoring',
  Activity_Monitoring_ChemicalAnimalTerrestrial = 'Chemical animal',
  Activity_Monitoring_MechanicalAnimalTerrestrial = 'Mechanical mon',

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

export enum ActivityMonitoringLinks {
  // Treatments:
  Activity_Treatment_ChemicalPlant = 'Activity_Monitoring_ChemicalTerrestrialAquaticPlant',
  Activity_Treatment_MechanicalPlant = 'Activity_Monitoring_MechanicalTerrestrialAquaticPlant',
  Activity_Biocontrol_Release = 'Activity_Monitoring_BiologicalTerrestrialPlant',
  Activity_Treatment_ChemicalAnimalTerrestrial = 'Activity_Monitoring_ChemicalAnimalTerrestrial',
  Activity_Treatment_MechanicalAnimalTerrestrial = 'Activity_Monitoring_MechanicalAnimalTerrestrial',

  // Monitoring:
  Activity_Monitoring_ChemicalTerrestrialAquaticPlant = 'Activity_Treatment_ChemicalPlant',
  Activity_Monitoring_MechanicalTerrestrialAquaticPlant = 'Activity_Treatment_MechanicalPlant',
  Activity_Monitoring_BiologicalTerrestrialPlant = 'Activity_Monitoring_BiocontrolRelease_TerrestrialPlant',
  Activity_Monitoring_ChemicalAnmialTerrestrial = 'Activity_Treatment_ChemicalAnimalTerrestrial',
  Activity_Monitoring_MechanicalAnimalTerrestrial = 'Activity_Treatment_MechanicalAnimalTerrestrial',

  Activity_Monitoring_BiologicalDispersal = 'Activity_Biocontrol_Collection',
  Activity_Biocontrol_Collection = 'Activity_Biocontrol_Collection'
}

export const ActivityTypeIcon: { [key: string]: SvgIconComponent } = {
  [ActivityType.Observation]: Assignment,
  [ActivityType.AnimalActivity]: Assignment,
  [ActivityType.Transect]: Assignment,
  [ActivityType.Treatment]: Build,
  [ActivityType.Monitoring]: Visibility,
  [ActivityType.Dispersal]: Visibility,
  [ActivityType.Collection]: Assignment,
  [ActivityType.FREP]: Visibility
};

export enum ActivityLetter {
  Activity_Observation_PlantTerrestrial = 'PTO',
  Activity_Observation_PlantTerrestrial_BulkEdit = 'PTO',
  Activity_Observation_PlantAquatic = 'PAO',
  Activity_AnimalActivity_AnimalTerrestrial = 'ATO',
  Activity_AnimalActivity_AnimalAquatic = 'AAO',

  // Treatments:
  Activity_Treatment_ChemicalPlantTerrestrial = 'PTC',
  Activity_Treatment_ChemicalPlant_BulkEdit = 'PTC',
  Activity_Treatment_ChemicalPlantAquatic = 'PAC',
  Activity_Treatment_MechanicalPlant = 'PTM',
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
  Activity_Monitoring_BiocontrolDispersal_TerrestrialPlant = 'PBD',
  Activity_Monitoring_ChemicalAnimalTerrestrial = 'AMC',
  Activity_Monitoring_MechanicalAnimalTerrestrial = 'AMM',

  // Transects:
  Activity_Transect_FireMonitoring = 'PXW',
  Activity_Transect_Vegetation = 'PXV',
  Activity_Transect_BiocontrolEfficacy = 'PXB',

  // Collections:
  Activity_Biocontrol_Collection = 'PBC',

  Activity_FREP_FormA = 'PFA',
  Activity_FREP_FormB = 'PFB',
  Activity_FREP_FormC = 'PFC'
}

export enum ActivityStatus {
  NEW = 'New',
  EDITED = 'Edited'
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

import { SvgIconComponent, Assignment, Build, Visibility } from '@material-ui/icons';

// this stuff would make a lot more sense in a database table
export enum ActivityType {
  Observation = 'Observation',
  Collection = 'Collection',
  AnimalActivity = 'AnimalActivity',
  Dispersal = 'Dispersal',
  Transect = 'Transect',
  Treatment = 'Treatment',
  Monitoring = 'Monitoring'
}

export enum ActivitySubtype {
  Observation_PlantTerrestrial = 'Activity_Observation_PlantTerrestrial',
  Observation_PlantTerrestrial_BulkEdit = 'Activity_Observation_PlantTerrestrial_BulkEdit',
  Observation_PlantAquatic = 'Activity_Observation_PlantAquatic',

  Activity_AnimalTerrestrial = 'Activity_AnimalActivity_AnimalTerrestrial',
  Activity_AnimalAquatic = 'Activity_AnimalActivity_AnimalAquatic',

  Treatment_ChemicalPlant = 'Activity_Treatment_ChemicalPlant',
  Treatment_ChemicalPlant_BulkEdit = 'Activity_Treatment_ChemicalPlant_BulkEdit',
  Treatment_ChemicalPlantAquatic = 'Activity_Treatment_ChemicalPlantAquatic',
  Treatment_MechanicalPlant = 'Activity_Treatment_MechanicalPlant',
  Treatment_MechanicalPlant_BulkEdit = 'Activity_Treatment_MechanicalPlant_BulkEdit',
  Treatment_MechanicalPlantAquatic = 'Activity_Treatment_MechanicalPlantAquatic',
  Treatment_BiologicalPlant = 'Activity_Treatment_BiologicalPlant',
  Treatment_BiologicalPlant_BulkEdit = 'Activity_Treatment_BiologicalPlant_BulkEdit',

  Monitoring_ChemicalTerrestrialAquaticPlant = 'Activity_Monitoring_ChemicalTerrestrialAquaticPlant',
  Monitoring_MechanicalTerrestrialAquaticPlant = 'Activity_Monitoring_MechanicalTerrestrialAquaticPlant',
  Monitoring_BiologicalTerrestrialPlant = 'Activity_Monitoring_BiologicalTerrestrialPlant',
  Monitoring_BiologicalDispersal = 'Activity_Monitoring_BiologicalDispersal',

  Transect_FireMonitoring = 'Activity_Transect_FireMonitoring',
  Transect_Vegetation = 'Activity_Transect_Vegetation',
  Transect_BiocontrolEfficacy = 'Activity_Transect_BiocontrolEfficacy',

  Collection_Biocontrol = 'Activity_Collection_Biocontrol'
}

export enum ActivitySubtypeShortLabels {
  // Observations:
  Activity_Observation_PlantTerrestrial = 'Plant Terrestrial',
  Activity_Observation_PlantTerrestrial_BulkEdit = 'Plant Terrestrial',
  Activity_Observation_PlantAquatic = 'Plant Aquatic',
  Activity_AnimalActivity_AnimalTerrestrial = 'Animal Terrestrial',
  Activity_AnimalActivity_AnimalAquatic = 'Animal Aquatic',

  // Treatments:
  Activity_Treatment_ChemicalPlant = 'Terrestrial Invasive Plant Chemical Treatment',
  Activity_Treatment_ChemicalPlant_BulkEdit = 'Terrestrial Invasive Plant Chemical Treatment',
  Activity_Treatment_ChemicalPlantAquatic = 'Aquatic Invasive Plant Chemical Treatment',
  Activity_Treatment_MechanicalPlant = 'Terrestrial Invasive Plant Mechanical Treatment',
  Activity_Treatment_MechanicalPlant_BulkEdit = 'Terrestrial Invasive Plant Mechanical Treatment',
  Activity_Treatment_MechanicalPlantAquatic = 'Aquatic Invasive Plant Mechanical Treatment',
  Activity_Treatment_BiologicalPlant = 'Biocontrol Release',
  Activity_Treatment_BiologicalPlant_BulkEdit = 'Biocontrol Release',

  // Monitoring:
  Activity_Monitoring_ChemicalTerrestrialAquaticPlant = 'Chemical',
  Activity_Monitoring_MechanicalTerrestrialAquaticPlant = 'Mechanical',
  Activity_Monitoring_BiologicalTerrestrialPlant = 'Biocontrol Release Monitoring',
  Activity_Monitoring_BiologicalDispersal = 'Biocontrol Dispersal Monitoring',

  // Transects:
  Activity_Transect_FireMonitoring = 'Wildfire & Prescribed Burn Monitoring',
  Activity_Transect_Vegetation = 'Vegetation Transect (Full, Lumped, Invasive Plant Density)',
  Activity_Transect_BiocontrolEfficacy = 'Biocontrol Efficacy Transect',

  // Collections:
  Activity_Collection_Biocontrol = 'Biocontrol Collection'
}

export enum ActivityMonitoringLinks {
  // Treatments:
  Activity_Treatment_ChemicalPlant = 'Activity_Monitoring_ChemicalTerrestrialAquaticPlant',
  Activity_Treatment_MechanicalPlant = 'Activity_Monitoring_MechanicalTerrestrialAquaticPlant',
  Activity_Treatment_BiologicalPlant = 'Activity_Monitoring_BiologicalTerrestrialPlant',

  // Monitoring:
  Activity_Monitoring_ChemicalTerrestrialAquaticPlant = 'Activity_Treatment_ChemicalPlant',
  Activity_Monitoring_MechanicalTerrestrialAquaticPlant = 'Activity_Treatment_MechanicalPlant',
  Activity_Monitoring_BiologicalTerrestrialPlant = 'Activity_Treatment_BiologicalPlant',

  Activity_Monitoring_BiologicalDispersal = 'Activity_Collection_Biocontrol',
  Activity_Collection_Biocontrol = 'Activity_Collection_Biocontrol'
}

export const ActivityTypeIcon: { [key: string]: SvgIconComponent } = {
  [ActivityType.Observation]: Assignment,
  [ActivityType.AnimalActivity]: Assignment,
  [ActivityType.Transect]: Assignment,
  [ActivityType.Treatment]: Build,
  [ActivityType.Monitoring]: Visibility,
  [ActivityType.Dispersal]: Visibility,
  [ActivityType.Collection]: Assignment
};

export enum ActivityLetter {
  Activity_Observation_PlantTerrestrial = 'P',
  Activity_Observation_PlantTerrestrial_BulkEdit = 'P',
  Activity_Observation_PlantAquatic = 'C',
  Activity_AnimalActivity_AnimalTerrestrial = 'A',
  Activity_AnimalActivity_AnimalAquatic = 'N',

  // Treatments:
  Activity_Treatment_ChemicalPlant = 'P', // Aquatic?
  Activity_Treatment_ChemicalPlant_BulkEdit = 'P',
  Activity_Treatment_ChemicalPlantAquatic = 'A',
  Activity_Treatment_MechanicalPlant = 'P',
  Activity_Treatment_MechanicalPlant_BulkEdit = 'P',
  Activity_Treatment_MechanicalPlantAquatic = 'A',
  Activity_Treatment_BiologicalPlant = 'R',
  Activity_Treatment_BiologicalPlant_BulkEdit = 'R',

  // Monitoring:
  Activity_Monitoring_ChemicalTerrestrialAquaticPlant = 'C',
  Activity_Monitoring_MechanicalTerrestrialAquaticPlant = 'P', // Aquatic?
  Activity_Monitoring_BiologicalTerrestrialPlant = 'P',
  Activity_Monitoring_BiologicalDispersal = 'D',

  // Transects:
  Activity_Transect_FireMonitoring = 'T',
  Activity_Transect_Vegetation = 'T',
  Activity_Transect_BiocontrolEfficacy = 'T',

  // Collections:
  Activity_Collection_Biocontrol = 'B'
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

import { SvgIconComponent, Assignment, Build, Visibility } from '@material-ui/icons';

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
  Treatment_MechanicalPlant = 'Activity_Treatment_MechanicalPlant',
  Treatment_MechanicalPlant_BulkEdit = 'Activity_Treatment_MechanicalPlant_BulkEdit',
  Treatment_BiologicalPlant = 'Activity_Treatment_BiologicalPlant',
  Treatment_BiologicalPlant_BulkEdit = 'Activity_Treatment_BiologicalPlant_BulkEdit',

  Monitoring_ChemicalTerrestrialAquaticPlant = 'Activity_Monitoring_ChemicalTerrestrialAquaticPlant',
  Monitoring_MechanicalTerrestrialAquaticPlant = 'Activity_Monitoring_MechanicalTerrestrialAquaticPlant',
  Monitoring_BiologicalTerrestrialPlant = 'Activity_Monitoring_BiologicalTerrestrialPlant',
  Activity_BiologicalDispersal = 'Activity_Dispersal_BiologicalDispersal',

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
  Activity_Treatment_ChemicalPlant = 'Chemical',
  Activity_Treatment_ChemicalPlant_BulkEdit = 'Chemical',
  Activity_Treatment_MechanicalPlant = 'Terrestrial Invasive Plant Mechanical Treatment',
  Activity_Treatment_MechanicalPlant_BulkEdit = 'Mechanical',
  Activity_Treatment_BiologicalPlant = 'Biocontrol Release',

  // Monitoring:
  Activity_Monitoring_ChemicalTerrestrialAquaticPlant = 'Chemical',
  Activity_Monitoring_MechanicalTerrestrialAquaticPlant = 'Mechanical',
  Activity_Monitoring_BiologicalTerrestrialPlant = 'Biocontrol Release Monitoring',
  Activity_Dispersal_BiologicalDispersal = 'Biocontrol Dispersal Monitoring',

  // Transects:
  Activity_Transect_FireMonitoring = 'Wildfire & Prescribed Burn Monitoring',
  Activity_Transect_Vegetation = 'Vegetation Transect (Full, Lumped, Invasive Plant Density)',
  Activity_Transect_BiocontrolEfficacy = 'Biocontrol Efficacy Transect',

  // Additional Biocontrol Activities:
  Activity_Collection_Biocontrol = 'Biocontrol Collection',
  Activity_Treatment_BiologicalPlant_BulkEdit = 'Biocontrol Release'
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

export enum ActivityStatus {
  NEW = 'New',
  EDITED = 'Edited'
}

export enum ActivitySyncStatus {
  NOT_SYNCED = 'Not Synced',
  SYNC_SUCCESSFUL = 'Sync Successful',
  SYNC_FAILED = 'Sync Failed'
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

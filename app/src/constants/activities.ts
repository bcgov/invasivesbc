import { SvgIconComponent, Assignment, Build, Visibility } from '@material-ui/icons';

export enum ActivityType {
  Observation = 'Observation',
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

  Activity_BiologicalDispersal = 'Activity_Dispersal_BiologicalDispersal',

  Transect_FireMonitoring = 'Activity_Transect_FireMonitoring',
  Transect_InvasivePlantDensity = 'Activity_Transect_InvasivePlantDensity',
  Transect_FullVegetation = 'Activity_Transect_FullVegetation',
  Transect_LumpedSpeciesVegetation = 'Activity_Transect_LumpedSpeciesVegetation',
  Transect_BiocontrolEfficacy = 'Activity_Transect_BiocontrolEfficacy',

  Treatment_ChemicalPlant = 'Activity_Treatment_ChemicalPlant',
  Treatment_ChemicalPlant_BulkEdit = 'Activity_Treatment_ChemicalPlant_BulkEdit',
  Treatment_MechanicalPlant = 'Activity_Treatment_MechanicalPlant',
  Treatment_MechanicalPlant_BulkEdit = 'Activity_Treatment_MechanicalPlant_BulkEdit',
  Treatment_BiologicalPlant = 'Activity_Treatment_BiologicalPlant',
  Treatment_BiologicalPlant_BulkEdit = 'Activity_Treatment_BiologicalPlant_BulkEdit',

  Monitoring_ChemicalTerrestrialAquaticPlant = 'Activity_Monitoring_ChemicalTerrestrialAquaticPlant',
  Monitoring_MechanicalTerrestrialAquaticPlant = 'Activity_Monitoring_MechanicalTerrestrialAquaticPlant',
  Monitoring_BiologicalTerrestrialPlant = 'Activity_Monitoring_BiologicalTerrestrialPlant'
}

export const ActivityTypeIcon: { [key: string]: SvgIconComponent } = {
  [ActivityType.Observation]: Assignment,
  [ActivityType.AnimalActivity]: Assignment,
  [ActivityType.Transect]: Assignment,
  [ActivityType.Treatment]: Build,
  [ActivityType.Monitoring]: Visibility,
  [ActivityType.Dispersal]: Visibility
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

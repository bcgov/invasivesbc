import { IFilter } from 'state/actions/userSettings/RecordSet';
import { RecordCacheProgressCallbackParameters } from 'utils/record-cache';

export enum RecordSetType {
  IAPP = 'IAPP',
  Activity = 'Activity'
}

export enum RecordSetId {
  Drafts = '1',
  Activity = '2',
  IAPP = '3',
  OfflineActivities = '4'
}

export enum UserRecordCacheStatus {
  CACHED = 'CACHED',
  DELETING = 'DELETING',
  DOWNLOADING = 'DOWNLOADING',
  ERROR = 'ERROR',
  NOT_CACHED = 'NOT_CACHED',
  NOT_ELIGIBLE = 'NOT_ELIGIBLE',
  PAUSED = 'PAUSED',
  QUEUED = 'QUEUED'
}

export interface UserRecordSet {
  tableFilters: IFilter[];
  id: string;
  idList: Array<string | number>;
  ids_to_filter?: Array<string | number>; // May include Activity Short ID's, or Site IDs for IAPP
  colorScheme?: {
    Activity_Biocontrol_Collection: string;
    Activity_Biocontrol_Release: string;
    Activity_Monitoring_BiocontrolDispersal_TerrestrialPlant: string;
    Activity_Monitoring_BiocontrolRelease_TerrestrialPlant: string;
    Activity_Monitoring_ChemicalTerrestrialAquaticPlant: string;
    Activity_Monitoring_MechanicalTerrestrialAquaticPlant: string;
    Activity_Observation_PlantAquatic: string;
    Activity_Observation_PlantTerrestrial: string;
    Activity_Treatment_ChemicalPlantAquatic: string;
    Activity_Treatment_ChemicalPlantTerrestrial: string;
    Activity_Treatment_MechanicalPlantAquatic: string;
    Activity_Treatment_MechanicalPlantTerrestrial: string;
  };
  color?: string;
  drawOrder: number;
  expanded: boolean;
  isSelected: boolean;
  mapToggle: boolean;
  labelToggle: boolean;
  recordSetName: string;
  recordSetType: RecordSetType;
  searchBoundary: {
    geos: [];
    id: number;
    name: string;
    server_id: any;
  };
  cacheMetadataStatus: UserRecordCacheStatus;
  cacheDownloadProgress: RecordCacheProgressCallbackParameters;
  tableFiltersHash?: string;
  tableFiltersPreviousHash?: string;
  sortOrder?: 'ASC' | 'DESC';
  sortColumn?: string;
}

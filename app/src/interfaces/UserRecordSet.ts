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
  id?: string;
  color: string;
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

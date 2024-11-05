export enum RecordSetType {
  IAPP = 'IAPP',
  Activity = 'Activity'
}

export enum UserRecordCacheStatus {
  NOT_CACHED = 'NOT_CACHED',
  NOT_ELIGIBLE = 'NOT_ELIGIBLE',
  DOWNLOADING = 'DOWNLOADING',
  ERROR = 'ERROR',
  CACHED = 'CACHED',
  DELETING = 'DELETING'
}

export interface UserRecordSet {
  tableFilters?: any;
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
  cacheMetadata: {
    status: UserRecordCacheStatus;
  };
}

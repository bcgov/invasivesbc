export enum RecordSetType {
  IAPP = 'IAPP',
  Activity = 'Activity'
}
export interface UserRecordSet {
  tableFilters?: any;
  color: string;
  drawOrder: number;
  expanded: boolean;
  isSelected: boolean;
  mapToggle: boolean;
  recordSetName: string;
  cached: false;
  cachedTime: '';
  offlineMode: false;
  isDeletingCache: false;
  isCaching: false;
  recordSetType: RecordSetType;
  searchBoundary: {
    geos: [];
    id: number;
    name: string;
    server_id: any;
  };
}

export enum DocType {
  APPSTATE = 'appstate',
  ACTIVITY = 'activity',
  TRIP = 'trip',
  API_SPEC = 'api_spec',
  REFERENCE_ACTIVITY = 'reference_activity',
  REFERENCE_POINT_OF_INTEREST = 'reference_point_of_interest',
  POINT_OF_INTEREST = 'point_of_interest',
  NOTIFICATION = 'notification',
  SPATIAL_UPLOADS = 'spatial_uploads',
  OFFLINE_EXTENT = 'offline_extent',
  OFFLINE_DATA = 'offline_data',
  PLAN_PAGE_EXTENT = 'plan_page_extent'
}

// max and default db page row limit
export const MAX_PAGE_SIZE = 1000;
export const DEFAULT_PAGE_SIZE = 1000;

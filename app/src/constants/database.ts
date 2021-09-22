export enum DocType {
  APPSTATE = 'appstate',
  ACTIVITY = 'activity',
  KEYCLOAK = 'keycloak',
  API_SPEC = 'api_spec',
  TRIP = 'trip',
  REFERENCE_ACTIVITY = 'reference_activity',
  REFERENCE_POINT_OF_INTEREST = 'reference_point_of_interest',
  POINT_OF_INTEREST = 'point_of_interest',
  NOTIFICATION = 'notification',
  SPATIAL_UPLOADS = 'spatial_uploads',
  OFFLINE_EXTENT = 'offline_extent',
  OFFLINE_DATA = 'offline_data',
  PLAN_PAGE_EXTENT = 'plan_page_extent',
  LARGE_GRID_LAYER_DATA = 'large_grid_layer_data',
  SMALL_GRID_LAYER_DATA = 'small_grid_layer_data'
}

// max and default db page row limit
export const MAX_PAGE_SIZE = 1000;
export const DEFAULT_PAGE_SIZE = 1000;

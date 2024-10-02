import { createAction } from '@reduxjs/toolkit';
import { RecordSetType } from 'interfaces/UserRecordSet';
import {
  MAP_TOGGLE_WHATS_HERE,
  MAP_WHATS_HERE_FEATURE,
  MAP_WHATS_HERE_INIT_GET_ACTIVITY,
  MAP_WHATS_HERE_INIT_GET_ACTIVITY_IDS_FETCHED,
  MAP_WHATS_HERE_INIT_GET_POI,
  MAP_WHATS_HERE_INIT_GET_POI_IDS_FETCHED,
  WHATS_HERE_PAGE_POI,
  WHATS_HERE_SORT_FILTER_UPDATE,
  MAP_SET_WHATS_HERE_PAGE_LIMIT,
  MAP_SET_WHATS_HERE_SECTION,
  MAP_WHATS_HERE_SET_HIGHLIGHTED_IAPP,
  MAP_WHATS_HERE_SET_HIGHLIGHTED_ACTIVITY,
  WHATS_HERE_IAPP_ROWS_REQUEST,
  WHATS_HERE_IAPP_ROWS_ONLINE,
  WHATS_HERE_IAPP_ROWS_OFFLINE,
  WHATS_HERE_IAPP_ROWS_SUCCESS,
  WHATS_HERE_PAGE_ACTIVITY,
  MAP_WHATS_HERE_INIT_GET_ACTIVITIES,
  WHATS_HERE_ACTIVITY_ROWS_REQUEST,
  WHATS_HERE_ACTIVITY_ROWS_ONLINE,
  WHATS_HERE_ACTIVITY_ROWS_OFFLINE,
  WHATS_HERE_ACTIVITY_ROWS_SUCCESS,
  WHATS_HERE_SERVER_FILTERED_IDS_FETCHED
} from 'state/actions';

class WhatsHere {
  static readonly toggle = createAction<boolean>(MAP_TOGGLE_WHATS_HERE);
  static readonly iapp_rows_request = createAction(WHATS_HERE_IAPP_ROWS_REQUEST);
  static readonly activity_rows_request = createAction(WHATS_HERE_ACTIVITY_ROWS_REQUEST);
  static readonly map_init_get_poi = createAction(MAP_WHATS_HERE_INIT_GET_POI);
  static readonly map_init_get_activity = createAction(MAP_WHATS_HERE_INIT_GET_ACTIVITY);

  static readonly map_init_get_activity_ids_fetched = createAction<string[]>(
    MAP_WHATS_HERE_INIT_GET_ACTIVITY_IDS_FETCHED
  );
  static readonly map_feature = createAction<Record<string, any>>(MAP_WHATS_HERE_FEATURE);
  static readonly server_filtered_ids_fetched = createAction(
    WHATS_HERE_SERVER_FILTERED_IDS_FETCHED,
    (activities, iapp) => ({
      payload: { activities, iapp }
    })
  );

  static readonly map_init_get_poi_ids_fetched = createAction<string[]>(MAP_WHATS_HERE_INIT_GET_POI_IDS_FETCHED);
  // Needs Typed Payloads before Converting
  static readonly sort_filter_update = createAction(
    WHATS_HERE_SORT_FILTER_UPDATE,
    (type: RecordSetType, field: string) => ({
      payload: { type, field }
    })
  );
  static readonly map_set_section = createAction(MAP_SET_WHATS_HERE_SECTION);
  static readonly set_highlighted_iapp = createAction(MAP_WHATS_HERE_SET_HIGHLIGHTED_IAPP);
  static readonly set_highlighted_activity = createAction(MAP_WHATS_HERE_SET_HIGHLIGHTED_ACTIVITY);
  static readonly iapp_rows_succes = createAction(WHATS_HERE_IAPP_ROWS_SUCCESS);
  static readonly activity_rows_success = createAction(WHATS_HERE_ACTIVITY_ROWS_SUCCESS);

  // Currently unused in application
  static readonly page_poi = createAction(WHATS_HERE_PAGE_POI);
  static readonly map_page_limit = createAction(MAP_SET_WHATS_HERE_PAGE_LIMIT);
  static readonly iapp_rows_online = createAction(WHATS_HERE_IAPP_ROWS_ONLINE);
  static readonly iapp_rows_offline = createAction(WHATS_HERE_IAPP_ROWS_OFFLINE);
  static readonly page_activity = createAction(WHATS_HERE_PAGE_ACTIVITY);
  static readonly init_get_activities = createAction(MAP_WHATS_HERE_INIT_GET_ACTIVITIES);
  static readonly activity_rows_online = createAction(WHATS_HERE_ACTIVITY_ROWS_ONLINE);
  static readonly activity_rows_offline = createAction(WHATS_HERE_ACTIVITY_ROWS_OFFLINE);
}

export default WhatsHere;

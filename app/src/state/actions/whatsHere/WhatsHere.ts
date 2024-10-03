import { createAction } from '@reduxjs/toolkit';
import { SortFilter } from 'interfaces/filterParams';
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
  WHATS_HERE_SERVER_FILTERED_IDS_FETCHED,
  WHATS_HERE_ID_CLICKED
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
  static readonly sort_filter_update = createAction(
    WHATS_HERE_SORT_FILTER_UPDATE,
    (type: RecordSetType, field: string, direction: string = SortFilter.Desc) => ({
      payload: { type, field, direction }
    })
  );
  static readonly map_set_section = createAction<string>(MAP_SET_WHATS_HERE_SECTION);
  static readonly set_highlighted_iapp = createAction<string>(MAP_WHATS_HERE_SET_HIGHLIGHTED_IAPP);
  static readonly set_highlighted_activity = createAction(
    MAP_WHATS_HERE_SET_HIGHLIGHTED_ACTIVITY,
    (id: string, short_id: string) => ({
      payload: { id, short_id }
    })
  );
  static readonly iapp_rows_success = createAction<Record<string, any>[]>(WHATS_HERE_IAPP_ROWS_SUCCESS);
  static readonly activity_rows_success = createAction<Record<string, any>[]>(WHATS_HERE_ACTIVITY_ROWS_SUCCESS);
  static readonly id_clicked = createAction<{ type?: RecordSetType; description?: string; id?: string }>(
    WHATS_HERE_ID_CLICKED
  );
  static readonly page_poi = createAction<{ page: number; limit: number }>(WHATS_HERE_PAGE_POI);
  static readonly map_page_limit = createAction<{ page: number; limit: number }>(MAP_SET_WHATS_HERE_PAGE_LIMIT);
  static readonly page_activity = createAction<{ page: number; limit: number }>(WHATS_HERE_PAGE_ACTIVITY);

  static readonly init_get_activities = createAction(MAP_WHATS_HERE_INIT_GET_ACTIVITIES);
  static readonly iapp_rows_online = createAction(WHATS_HERE_IAPP_ROWS_ONLINE);
  static readonly iapp_rows_offline = createAction(WHATS_HERE_IAPP_ROWS_OFFLINE);
  static readonly activity_rows_online = createAction(WHATS_HERE_ACTIVITY_ROWS_ONLINE);
  static readonly activity_rows_offline = createAction(WHATS_HERE_ACTIVITY_ROWS_OFFLINE);
}

export default WhatsHere;

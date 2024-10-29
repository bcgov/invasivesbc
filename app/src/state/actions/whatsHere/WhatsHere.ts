import { createAction } from '@reduxjs/toolkit';
import { SortFilter } from 'interfaces/filterParams';
import { RecordSetType } from 'interfaces/UserRecordSet';

class WhatsHere {
  private static readonly PREFIX = 'WhatsHere';
  static readonly activity_rows_online = createAction(`${this.PREFIX}/activity_rows_online`);
  static readonly activity_rows_offline = createAction(`${this.PREFIX}/activity_rows_offline`);
  static readonly activity_rows_request = createAction(`${this.PREFIX}/activity_rows_request`);
  static readonly activity_rows_success = createAction<Record<string, any>[]>(`${this.PREFIX}/activity_rows_success`);
  static readonly iapp_rows_request = createAction(`${this.PREFIX}/iapp_rows_request`);
  static readonly iapp_rows_success = createAction<Record<string, any>[]>(`${this.PREFIX}/iapp_rows_success`);
  static readonly iapp_rows_online = createAction(`${this.PREFIX}/iapp_rows_online`);
  static readonly iapp_rows_offline = createAction(`${this.PREFIX}/iapp_rows_offline`);
  static readonly id_clicked = createAction<{ type?: RecordSetType; description?: string; id?: string }>(
    `${this.PREFIX}/id_clicked`
  );
  static readonly init_get_activities = createAction(`${this.PREFIX}/init_get_activities`);
  static readonly map_init_get_activity = createAction(`${this.PREFIX}/map_init_get_activity`);
  static readonly map_init_get_activity_ids_fetched = createAction<string[]>(
    `${this.PREFIX}/map_init_get_activity_ids_fetched`
  );
  static readonly map_init_get_poi = createAction(`${this.PREFIX}/map_init_get_poi`);
  static readonly map_init_get_poi_ids_fetched = createAction<string[]>(`${this.PREFIX}/map_init_get_poi_ids_fetched`);
  static readonly map_page_limit = createAction<{ page: number; limit: number }>(`${this.PREFIX}/map_page_limit`);
  static readonly map_set_section = createAction<string>(`${this.PREFIX}/map_set_section`);
  static readonly map_feature = createAction<Record<string, any>>(`${this.PREFIX}/map_feature`);
  static readonly page_poi = createAction<{ page: number; limit: number }>(`${this.PREFIX}/page_poi`);
  static readonly page_activity = createAction<{ page: number; limit: number }>(`${this.PREFIX}/page_activity`);
  static readonly server_filtered_ids_fetched = createAction(
    `${this.PREFIX}/server_filtered_ids_fetched`,
    (activities, iapp) => ({
      payload: { activities, iapp }
    })
  );
  static readonly set_highlighted_iapp = createAction<string>(`${this.PREFIX}/set_highlighted_iapp`);
  static readonly set_highlighted_activity = createAction(
    `${this.PREFIX}/set_highlighted_activity`,
    (id: string, short_id: string) => ({
      payload: { id, short_id }
    })
  );

  static readonly sort_filter_update = createAction(
    `${this.PREFIX}/sort_filter_update`,
    (type: RecordSetType, field: string, direction: string = SortFilter.Desc) => ({
      payload: { type, field, direction }
    })
  );

  static readonly toggle = createAction<boolean>(`${this.PREFIX}/toggle`);
}

export default WhatsHere;

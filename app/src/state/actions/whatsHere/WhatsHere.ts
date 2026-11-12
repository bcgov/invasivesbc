import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import { reUuid } from 'sharedAPI/src/regex';
import { Feature } from 'geojson';
import { center } from '@turf/turf';
import { SortFilter } from 'interfaces/filterParams';
import { RecordSetType } from 'interfaces/UserRecordSet';

interface IGetIdsForRecordset {
  recordSetID: PropertyKey;
  tableFiltersHash: string;
}
interface IGetIdsForRecordsetSuccess extends IGetIdsForRecordset {
  idList: Array<string | number>;
}

interface IProcessWhatsHereIDs {
  ids: Array<string | number>;
  shape: Feature;
}
class WhatsHere {
  private static readonly PREFIX = 'WhatsHere';

  static readonly processWhatsHereIds = createAsyncThunk(
    `${this.PREFIX}/processWhatsHereIDs`,
    (opts: IProcessWhatsHereIDs) => {
      const centreCoord = center(opts.shape).geometry.coordinates;
      const activityIdReg = new RegExp(reUuid);
      const siteIdReg = new RegExp(/^\d{1,6}$/);

      const iappIds: Array<number> = [];
      const ibcIds: Array<string> = [];

      opts.ids.forEach((id) => {
        if (typeof id === 'number') {
          iappIds.push(id);
        } else if (activityIdReg.test(id)) {
          ibcIds.push(id);
        } else if (siteIdReg.test(id)) {
          iappIds.push(Number.parseInt(id));
        }
      });
      return { iapp: iappIds, ibcIds: ibcIds, shapeCentre: centreCoord };
    }
  );
  static readonly NewWhatsHereFeature = createAction(`${this.PREFIX}/NewWhatsHereFeature`);
  static readonly ChangePage = createAction(`${this.PREFIX}/ChangePage`);

  static readonly activity_rows_request = createAction(`${this.PREFIX}/activity_rows_request`);
  static readonly activity_rows_success = createAction<Record<string, any>[]>(`${this.PREFIX}/activity_rows_success`);

  static readonly iapp_rows_request = createAction(`${this.PREFIX}/iapp_rows_request`);
  static readonly iapp_rows_success = createAction<Record<string, any>[]>(`${this.PREFIX}/iapp_rows_success`);
  static readonly iapp_rows_offline = createAction(`${this.PREFIX}/iapp_rows_offline`);
  static readonly id_clicked = createAction<{ type?: RecordSetType; description?: string; id?: string }>(
    `${this.PREFIX}/id_clicked`
  );
  static readonly init_get_activities = createAction(`${this.PREFIX}/init_get_activities`);
  static readonly map_init_get_activity = createAction(`${this.PREFIX}/map_init_get_activity`);
  static readonly map_init_get_activity_ids_fetched = createAction<string[]>(
    `${this.PREFIX}/map_init_get_activity_ids_fetched`
  );
  static readonly map_init_get_poi_ids_fetched = createAction<string[]>(`${this.PREFIX}/map_init_get_poi_ids_fetched`);
  static readonly map_page_limit = createAction<{ page: number; limit: number }>(`${this.PREFIX}/map_page_limit`);
  static readonly map_change_tab = createAction(`${this.PREFIX}/map_change_section`);
  static readonly map_feature = createAction<Record<string, any>>(`${this.PREFIX}/map_feature`);
  static readonly page_poi = createAction<{ page: number; limit: number }>(`${this.PREFIX}/page_poi`);
  static readonly page_activity = createAction<{ page: number; limit: number }>(`${this.PREFIX}/page_activity`);
  static readonly server_filtered_ids_fetched = createAction(
    `${this.PREFIX}/server_filtered_ids_fetched`,
    (activities: string[], iapp: string[]) => ({
      payload: { activities, iapp }
    })
  );
  static readonly clear_whats_here = createAction(`${this.PREFIX}/clear_whats_here`);

  static readonly sort_filter_update = createAction(
    `${this.PREFIX}/sort_filter_update`,
    (type: RecordSetType, field: string, direction: string = SortFilter.Desc) => ({
      payload: { type, field, direction }
    })
  );

  static readonly toggle = createAction(`${this.PREFIX}/toggle`);
}

export default WhatsHere;
export type { IGetIdsForRecordset };

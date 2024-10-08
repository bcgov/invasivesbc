import { createAction } from '@reduxjs/toolkit';
import {
  ACTIVITIES_GEOJSON_GET_OFFLINE,
  ACTIVITIES_GET_IDS_FOR_RECORDSET_OFFLINE,
  ACTIVITIES_TABLE_ROWS_GET_OFFLINE,
  ACTIVITY_OFFLINE_SYNC_DIALOG_SET_STATE,
  ACTIVITY_RUN_OFFLINE_SYNC,
  ACTIVITY_RUN_OFFLINE_SYNC_COMPLETE,
  ACTIVITY_SAVE_OFFLINE,
  ACTIVITY_RESTORE_OFFLINE,
  ACTIVITY_OFFLINE_DELETE_ITEM
} from '../../actions';

class Offline {
  static readonly getGeojson = createAction(ACTIVITIES_GEOJSON_GET_OFFLINE);
  static readonly getRecordsetIds = createAction(ACTIVITIES_GET_IDS_FOR_RECORDSET_OFFLINE);
  static readonly getTableRows = createAction(ACTIVITIES_TABLE_ROWS_GET_OFFLINE);

  static readonly setSyncDialogue = createAction(ACTIVITY_OFFLINE_SYNC_DIALOG_SET_STATE);
  static readonly syncRun = createAction(ACTIVITY_RUN_OFFLINE_SYNC);
  static readonly syncRunComplete = createAction(ACTIVITY_RUN_OFFLINE_SYNC_COMPLETE);

  static readonly save = createAction(ACTIVITY_SAVE_OFFLINE);
  static readonly restore = createAction(ACTIVITY_RESTORE_OFFLINE);
  static readonly delete = createAction(ACTIVITY_OFFLINE_DELETE_ITEM);
}
export default Offline;

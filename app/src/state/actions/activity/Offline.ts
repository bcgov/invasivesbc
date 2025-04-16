import { createAction } from '@reduxjs/toolkit';
import {
  ACTIVITY_OFFLINE_SYNC_DIALOG_SET_STATE,
  ACTIVITY_RUN_OFFLINE_SYNC,
  ACTIVITY_RUN_OFFLINE_SYNC_COMPLETE,
  ACTIVITY_SAVE_OFFLINE,
  ACTIVITY_RESTORE_OFFLINE,
  ACTIVITY_OFFLINE_DELETE_ITEM
} from 'state/actions';

class Offline {
  private static readonly PREFIX = 'Offline';
  static readonly setSyncDialogue = createAction(ACTIVITY_OFFLINE_SYNC_DIALOG_SET_STATE);
  static readonly syncRun = createAction(ACTIVITY_RUN_OFFLINE_SYNC);
  static readonly syncRunComplete = createAction(ACTIVITY_RUN_OFFLINE_SYNC_COMPLETE);

  static readonly save = createAction(ACTIVITY_SAVE_OFFLINE);
  static readonly restore = createAction(ACTIVITY_RESTORE_OFFLINE);
  static readonly delete = createAction(ACTIVITY_OFFLINE_DELETE_ITEM);

  static readonly setAllShapeVisibility = createAction(`${this.PREFIX}/setAllShapeVisibility`);
  static readonly setLabelVisibility = createAction(`${this.PREFIX}/setLabelVisibility`);

  static readonly getIdsForRecordset = createAction<Record<PropertyKey, any>>(`${this.PREFIX}/getIdsForRecordset`);
  static readonly getIdsForRecordsetSuccess = createAction<Record<PropertyKey, any>>(
    `${this.PREFIX}/getIdsForRecordsetSuccess`
  );
}

export default Offline;

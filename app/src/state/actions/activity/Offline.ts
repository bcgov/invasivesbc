import { createAction } from '@reduxjs/toolkit';
import {
  ACTIVITY_OFFLINE_SYNC_DIALOG_SET_STATE,
  ACTIVITY_RUN_OFFLINE_SYNC,
  ACTIVITY_RUN_OFFLINE_SYNC_COMPLETE,
  ACTIVITY_SAVE_OFFLINE,
  ACTIVITY_RESTORE_OFFLINE,
  ACTIVITY_OFFLINE_DELETE_ITEM,
  ACTIVITY_OFFLINE_ALL_SHAPE_VISIBILITY_STATE
} from '../../actions';

class Offline {
  static readonly setSyncDialogue = createAction(ACTIVITY_OFFLINE_SYNC_DIALOG_SET_STATE);
  static readonly syncRun = createAction(ACTIVITY_RUN_OFFLINE_SYNC);
  static readonly syncRunComplete = createAction(ACTIVITY_RUN_OFFLINE_SYNC_COMPLETE);
  static readonly setAllShapeVisibility = createAction(ACTIVITY_OFFLINE_ALL_SHAPE_VISIBILITY_STATE);

  static readonly save = createAction(ACTIVITY_SAVE_OFFLINE);
  static readonly restore = createAction(ACTIVITY_RESTORE_OFFLINE);
  static readonly delete = createAction(ACTIVITY_OFFLINE_DELETE_ITEM);
}
export default Offline;

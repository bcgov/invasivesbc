import { createAction } from '@reduxjs/toolkit';
import { IGetIdsForRecordsetSuccess } from './Activity';
import UserRecord from 'interfaces/UserRecord';
import { OfflineActivitySyncState } from 'state/reducers/offlineActivity';

interface ISaveOffline {
  id: string;
  data: UserRecord;
}
interface IUpdateSync {
  id: string;
  data: UserRecord;
  sync_state: OfflineActivitySyncState;
  error_detail?: string;
  error_object?: unknown;
}
class Offline {
  private static readonly PREFIX = 'Activity/Offline';
  static readonly setSyncDialogueWindow = createAction<{ open: boolean }>(`${this.PREFIX}/setSyncDialogueWindow`);
  static readonly syncRun = createAction(`${this.PREFIX}/syncRun`);
  static readonly syncRunComplete = createAction(`${this.PREFIX}/syncRunComplete`);

  static readonly updateSyncState = createAction<IUpdateSync>(`${this.PREFIX}/updateSyncState`);
  static readonly save = createAction<ISaveOffline>(`${this.PREFIX}/save`);
  static readonly delete = createAction<string>(`${this.PREFIX}/delete`);

  static readonly getIdsForRecordset = createAction<Record<PropertyKey, any>>(`${this.PREFIX}/getIdsForRecordset`);
  static readonly getIdsForRecordsetSuccess = createAction<IGetIdsForRecordsetSuccess>(
    `${this.PREFIX}/getIdsForRecordsetSuccess`
  );
}

export default Offline;
export type { ISaveOffline, IUpdateSync };

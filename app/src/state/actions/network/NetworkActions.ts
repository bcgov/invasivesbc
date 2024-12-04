import { createAction } from '@reduxjs/toolkit';

class NetworkActions {
  private static readonly PREFIX = 'NetworkActions';
  static readonly online = createAction(`${this.PREFIX}/online`);
  static readonly offline = createAction(`${this.PREFIX}/offline`);
  static readonly monitorHeartbeat = createAction(`${this.PREFIX}/monitorHeartbeat`, (cancel: boolean = false) => ({
    payload: cancel
  }));
  static readonly userLostConnection = createAction(`${this.PREFIX}/userLostConnection`);
  static readonly manualReconnect = createAction(`${this.PREFIX}/manualReconnect`);
  static readonly automaticReconnectFailed = createAction(`${this.PREFIX}/automaticReconnectFailed`);
  static readonly checkInitConnection = createAction(`${this.PREFIX}/checkInitConnection`);
  static readonly setAdministrativeStatus = createAction<boolean>(`${this.PREFIX}/toggleAdministrativeStatus`);
  static readonly setOperationalStatus = createAction<boolean>(`${this.PREFIX}/setOperationalStatus`);
  static readonly updateConnectionStatus = createAction<boolean>(`${this.PREFIX}/updateConnectionStatus`);
}
export default NetworkActions;

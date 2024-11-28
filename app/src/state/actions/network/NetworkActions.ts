import { createAction } from '@reduxjs/toolkit';

class NetworkActions {
  private static readonly PREFIX = 'NetworkActions';
  static readonly online = createAction(`${this.PREFIX}/online`);
  static readonly offline = createAction(`${this.PREFIX}/offline`);
  static readonly checkMobileNetworkStatus = createAction(
    `${this.PREFIX}/checkMobileNetworkStatus`,
    (cancel: boolean = false) => ({ payload: cancel })
  );
  static readonly userLostConnection = createAction(`${this.PREFIX}/userLostConnection`);
  static readonly manualReconnect = createAction(`${this.PREFIX}/manualReconnect`);
  static readonly automaticReconnectFailed = createAction(`${this.PREFIX}/automaticReconnectFailed`);
  static readonly checkInitConnection = createAction(`${this.PREFIX}/checkInitConnection`);
}
export default NetworkActions;

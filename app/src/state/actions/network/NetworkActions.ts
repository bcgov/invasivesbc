import { createAction } from '@reduxjs/toolkit';

class NetworkActions {
  private static readonly PREFIX = 'NetworkActions';
  static readonly online = createAction(`${this.PREFIX}/online`);
  static readonly offline = createAction(`${this.PREFIX}/offline`);
  static readonly checkMobileNetworkStatus = createAction(`${this.PREFIX}/checkMobileNetworkStatus`);
  static readonly userLostConnection = createAction(`${this.PREFIX}/userLostConnection`);
}
export default NetworkActions;

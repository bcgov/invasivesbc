import { createAction } from '@reduxjs/toolkit';

class NetworkActions {
  private static readonly PREFIX = 'NetworkActions';

  static readonly online = createAction(`${this.PREFIX}/online`);
  static readonly offline = createAction(`${this.PREFIX}/offline`);
}
export default NetworkActions;

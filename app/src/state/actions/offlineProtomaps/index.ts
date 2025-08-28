import { createAction } from '@reduxjs/toolkit';

class OfflineProtomapsActions {
  private static readonly PREFIX = `OfflineProtomapsActions`;

  static readonly setDebugPanelState = createAction<boolean>(`${this.PREFIX}/setDebugPanelState`);
  static readonly toggleDebugPanelState = createAction<boolean>(`${this.PREFIX}/toggleDebugPanelState`);
}

export { OfflineProtomapsActions };

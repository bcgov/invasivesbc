import { createAction } from '@reduxjs/toolkit';

class MapActions {
  private static readonly PREFIX = `MapActions`;

  static readonly chooseBaseMap = createAction<string>(`${this.PREFIX}/chooseBaseMap`);
  static readonly initForRecordset = createAction(`${this.PREFIX}/initForRecordset`);
  static readonly initRequest = createAction(`${this.PREFIX}/initRequest`);
  static readonly toggleOverlay = createAction<string>(`${this.PREFIX}/toggleOverlay`);
  static readonly updateAvailableBaseMaps = createAction<string[]>(`${this.PREFIX}/updateAvailableBaseMaps`);
  static readonly updateAvailableOverlays = createAction<string[]>(`${this.PREFIX}/updateAvailableOverlays`);
}

export default MapActions;

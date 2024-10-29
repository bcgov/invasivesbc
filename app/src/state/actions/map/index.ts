import { createAction } from '@reduxjs/toolkit';

class MapActions {
  private static readonly PREFIX = `MapActions`;

  static readonly toggleOverlay = createAction<string>(`${MapActions.PREFIX}/toggleOverlay`);
  static readonly chooseBaseMap = createAction<string>(`${MapActions.PREFIX}/chooseBaseMap`);
  static readonly updateAvailableBaseMaps = createAction<string[]>(`${MapActions.PREFIX}/updateAvailableBaseMaps`);
  static readonly updateAvailableOverlays = createAction<string[]>(`${MapActions.PREFIX}/updateAvailableOverlays`);
}

export default MapActions;

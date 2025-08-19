import { createAction } from '@reduxjs/toolkit';

class MapActions {
  private static readonly PREFIX = `MapActions`;

  static readonly chooseBaseMap = createAction<string>(`${this.PREFIX}/chooseBaseMap`);
  static readonly initForRecordset = createAction(`${this.PREFIX}/initForRecordset`);
  static readonly initRequest = createAction(`${this.PREFIX}/initRequest`);
  static readonly toggleOverlay = createAction<string>(`${this.PREFIX}/toggleOverlay`);
  static readonly updateAvailableBaseMaps = createAction<string[]>(`${this.PREFIX}/updateAvailableBaseMaps`);
  static readonly updateAvailableOverlays = createAction<string[]>(`${this.PREFIX}/updateAvailableOverlays`);

  static readonly trackLocationStart = createAction(`${this.PREFIX}/trackLocationStart`);
  static readonly trackLocationStop = createAction(`${this.PREFIX}/trackLocationStop`);
  static readonly trackLocationToggle = createAction(`${this.PREFIX}/trackLocationToggle`);

  static readonly accuracyToggle = createAction(`${this.PREFIX}/accuracyToggle`);
  static readonly panningOff = createAction(`${this.PREFIX}/panningOff`);
  static readonly panningOn = createAction(`${this.PREFIX}/panningOn`);

  public static readonly setCurrentOpenSet = createAction<string>(`${this.PREFIX}/setCurrentOpenSet`);
}

export default MapActions;

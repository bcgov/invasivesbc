import { createAction } from '@reduxjs/toolkit';
import { IServerLayer } from 'state/reducers/map';

interface IMapCenter {
  lat: number;
  lng: number;
  zoom: number;
}
class MapActions {
  private static readonly PREFIX = `MapActions`;

  static readonly initServerBoundaries = createAction<IServerLayer[]>(`${this.PREFIX}/initServerBoundaries`);
  static readonly refetchServerBoundaries = createAction(`${this.PREFIX}/refetchServerBoundaries`);

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

  static readonly panToActivity = createAction(`${this.PREFIX}/panToActivity`);
  static readonly panToIAPP = createAction(`${this.PREFIX}/panToIAPP`);
  static readonly setCurrentOpenSet = createAction<string>(`${this.PREFIX}/setCurrentOpenSet`);

  static readonly centerMap = createAction<IMapCenter>(`${this.PREFIX}/centerMap`);
}

export default MapActions;
export type { IMapCenter };

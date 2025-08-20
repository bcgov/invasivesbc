import { createAction } from '@reduxjs/toolkit';
import { Feature } from 'geojson';

class DrawToolActions {
  private static readonly PREFIX = 'DrawToolActions';
  public static readonly createShape = createAction<Feature>(`${this.PREFIX}/createShape`);
  public static readonly updateShape = createAction<Feature>(`${this.PREFIX}/updateShape`);
  public static readonly updateGeo = createAction<Array<Feature>>(`${this.PREFIX}/updateGeo`);
  public static readonly updateGeoSuccess = createAction(`${this.PREFIX}/updateGeoSuccess`);
}

export default DrawToolActions;

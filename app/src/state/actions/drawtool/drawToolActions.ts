import { createAction } from '@reduxjs/toolkit';
import { Feature } from 'geojson';

interface IUpdateShapeSuccess {
  geometry?: Feature[];
  utm?: [number, number, number];
  lat?: number;
  long?: number;
  reported_area?: number;
  Well_Information?: Array<{
    well_id: string;
    well_proximity: string;
  }>;
}
class DrawToolActions {
  private static readonly PREFIX = 'DrawToolActions';
  public static readonly createShape = createAction<Feature>(`${this.PREFIX}/createShape`);
  public static readonly updateShape = createAction<Feature>(`${this.PREFIX}/updateShape`);
  public static readonly updateGeo = createAction<Array<Feature>>(`${this.PREFIX}/updateGeo`);
  public static readonly deleteGeo = createAction(`${this.PREFIX}/deleteGeo`);
  public static readonly updateGeoSuccess = createAction(
    `${this.PREFIX}/updateGeoSuccess`,
    (spec: IUpdateShapeSuccess) => ({
      payload: {
        geometry: spec?.geometry ?? null,
        utm: spec?.utm ?? null,
        lat: spec?.lat ?? null,
        long: spec?.long ?? null,
        reported_area: spec?.reported_area ?? null,
        Well_Information: spec?.Well_Information ?? null
      }
    })
  );
}

export default DrawToolActions;
export type { IUpdateShapeSuccess };

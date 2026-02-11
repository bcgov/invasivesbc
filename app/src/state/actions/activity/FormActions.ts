import { createAction } from '@reduxjs/toolkit';
import { Feature, GeoJSON } from 'geojson';
import { FormSchema } from 'UI/Features/Records/Activity/forms/plant/subtypeInterfaces';

class FormActions {
  private static readonly PREFIX = 'FormActions';

  static readonly clearFormState = createAction(`${this.PREFIX}/clearFormState`);
  static readonly updateGeometry = createAction<Feature | GeoJSON>(`${this.PREFIX}/updateGeometry`);
  static readonly interceptGeometry = createAction<Feature | GeoJSON>(`${this.PREFIX}/interceptGeometry`);

  static readonly updateState = createAction<FormSchema>(`${this.PREFIX}/updateState`);
}

export default FormActions;

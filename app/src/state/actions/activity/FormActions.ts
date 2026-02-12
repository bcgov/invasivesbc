import { createAction } from '@reduxjs/toolkit';
import { Feature, GeoJSON } from 'geojson';
import { ActivitySubtypes } from 'sharedAPI';
import { FormSchema } from 'UI/Features/Records/Activity/forms/plant/interfaces';

class FormActions {
  private static readonly PREFIX = 'FormActions';

  static readonly createNewForm = createAction<ActivitySubtypes>(`${this.PREFIX}/createNewForm`);
  static readonly duplicateForm = createAction<ActivitySubtypes>(`${this.PREFIX}/duplicateForm`);

  static readonly clearFormState = createAction(`${this.PREFIX}/clearFormState`);
  static readonly updateGeometry = createAction<Feature | GeoJSON>(`${this.PREFIX}/updateGeometry`);
  static readonly interceptGeometry = createAction<Feature | GeoJSON>(`${this.PREFIX}/interceptGeometry`);

  static readonly updateState = createAction<FormSchema>(`${this.PREFIX}/updateState`);
}

export default FormActions;

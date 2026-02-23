import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Feature, GeoJSON } from 'geojson';
import { ActivitySubtypes } from 'sharedAPI';
import { RootState } from 'state/reducers/rootReducer';
import getDefaultFormState from 'UI/Features/Records/Activity/forms/plant/builders/getDefaultState';
import { FormSchema } from 'UI/Features/Records/Activity/forms/plant/interfaces';

interface FormSubmission {
  data: FormSchema;
  type: 'submission' | 'draft';
}

interface DuplicateForm {
  subtype: ActivitySubtypes;
}
class FormActions {
  private static readonly PREFIX = 'FormActions';

  static readonly createNewForm = createAction<ActivitySubtypes>(`${this.PREFIX}/createNewForm`);
  static readonly startDuplicateForm = createAction(`${this.PREFIX}/startDuplicateForm`);

  static readonly duplicateForm = createAsyncThunk(
    `${this.PREFIX}/duplicateForm`,
    async ({ subtype }: DuplicateForm, { getState }) => {
      const {
        Auth,
        ActivityPage: { formState }
      } = getState() as RootState;
      if (!formState) throw new Error('Formstate is null');
      if (!Auth.username) throw new Error('No authenticated user');
      const duplicatedForm = structuredClone(formState);
      //Reset record specific details.
      duplicatedForm.created_by = Auth.username;
      duplicatedForm.short_id = ''; // Gets assigned when API receives it.
      duplicatedForm.date = new Date();
      duplicatedForm.id = crypto.randomUUID();
      if (duplicatedForm.subtype !== subtype) {
        //For mismatched subtype, remove all the subtype_data
        duplicatedForm.subtype = subtype;
        duplicatedForm.subtype_data = getDefaultFormState(subtype).subtype_data;
      }
      return duplicatedForm;
    }
  );
  static readonly clearFormState = createAction(`${this.PREFIX}/clearFormState`);
  static readonly updateGeometry = createAction<Feature | GeoJSON>(`${this.PREFIX}/updateGeometry`);
  static readonly interceptGeometry = createAction<Feature | GeoJSON>(`${this.PREFIX}/interceptGeometry`);

  static readonly sendForm = createAsyncThunk(`${this.PREFIX}/sendForm`, async ({ type, data }: FormSubmission) => {
    console.info('Type:', type, 'Data:', data);
    // TODO: Add API Call, Return Short ID generated from form, branch Draft/Submission logic'
    return '12PTO12345678';
  });
  static readonly updateState = createAction<FormSchema>(`${this.PREFIX}/updateState`);
}

export default FormActions;

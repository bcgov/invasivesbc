import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import { Feature, GeoJSON } from 'geojson';
import { ActivitySubtypes } from 'sharedAPI';
import Alerts from 'state/actions/alerts/Alerts';

import { RecordSetType } from 'interfaces/UserRecordSet';
import { RootState } from 'state/reducers/rootReducer';
import getDefaultFormState from 'UI/Features/Records/Activity/forms/plant/builders/getDefaultState';
import { FormSchema } from 'UI/Features/Records/Activity/forms/plant/interfaces';
import { IQueryParams } from 'utils/record-cache';
import { RecordCacheServiceFactory } from 'utils/record-cache/context';
import { AlertSeverity, AlertSubjects } from 'constants/alertEnums';
import EFilterType from 'constants/EFilterType';

interface FormSubmission {
  data: FormSchema;
  type: 'submission' | 'draft';
}

interface DuplicateForm {
  subtype: ActivitySubtypes;
}
interface VerifyLinkedActivity {
  id: string;
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
      duplicatedForm.date = new Date().toISOString().substring(0, 10);
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

  static readonly validateManualLinkedId = createAsyncThunk(
    `${this.PREFIX}/validateManualLinkedId`,
    async ({ id }: VerifyLinkedActivity, { getState, dispatch }) => {
      const state: RootState = getState() as RootState;
      const MOBILE = state.Configuration.current.build.MOBILE;
      const OFFLINE = !state.Network.connected;
      /*
    TODO: implement
    if Online:
      Ping API using the shortID, if response comes back valid, return the full ID of the record
    */
      // if (MOBILE && OFFLINE) {
      const service = await RecordCacheServiceFactory.getPlatformInstance();
      const queryObj: IQueryParams = {
        limit: 1,
        tableFilters: [
          {
            field: 'short_id',
            filter: id,
            filterType: EFilterType.Table,
            id: '1',
            operator: 'CONTAINS',
            operator2: 'AND'
          }
        ],
        recordSetType: RecordSetType.Activity,
        selectColumns: ['id', 'short_id']
      };
      const data = (await service.query(queryObj))[0];
      // Confirm the match in case of partial string matching returns
      if (data.short_id === id) return data.id;
      // }
      dispatch(
        Alerts.create({
          severity: AlertSeverity.Error,
          subject: AlertSubjects.Form,
          content: `Unable to find a record matching "${id}". This entry will be deleted`,
          autoClose: 8
        })
      );
    }
  );

  /**
   * @desc Iterate payload object and convert {code, full} pairs into code strings, reducing payload size.
   */
  private static readonly drillAndSimplify = (data: unknown) => {
    if (Array.isArray(data)) {
      return data.map(this.drillAndSimplify);
    }
    if (data !== null && typeof data === 'object') {
      const isCodeObj = 'code' in data && 'full' in data && Object.keys(data).length === 2;
      if (isCodeObj) {
        return data.code;
      }
      const result: Record<string, unknown> = {};
      for (const key in data) {
        if (Object.hasOwn(data, key)) {
          result[key] = this.drillAndSimplify(data[key]);
        }
      }
      return result;
    }
    return data;
  };
  static readonly sendForm = createAsyncThunk(
    `${this.PREFIX}/sendForm`,
    async ({ type, data }: FormSubmission, { dispatch }) => {
      const simplifiedData = this.drillAndSimplify(data);
      console.info('Type:', type, 'Data:', simplifiedData);
      // TODO: Add API Call, Return Short ID generated from form, branch Draft/Submission logic
      dispatch(
        Alerts.create({
          severity: AlertSeverity.Success,
          subject: AlertSubjects.Form,
          content: 'Form submitted successfully.',
          autoClose: 8
        })
      );
      return '12PTO12345678';
    }
  );
  static readonly updateState = createAction<FormSchema>(`${this.PREFIX}/updateState`);
}

export default FormActions;

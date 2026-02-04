import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import { ActivityStatus } from 'sharedAPI';
import { FieldError } from '@rjsf/utils';
import Offline from './Offline';
import Photos from './Photos';
import Suggestions from './Suggestions';
import AutoFill from './AutoFill';
import ChemicalTreatments from './ChemicalTreatments';
import FilterObjects from 'interfaces/FilterObjects';
import IActivityPermissions from 'interfaces/IActivityPermissions';
import UserRecord from 'interfaces/UserRecord';
import { getCurrentJWT } from 'state/sagas/auth/auth';

interface INewActivity {
  type: string;
  subType: string;
}

interface ISaveNetwork {
  activity_id: string;
  updatedFormData?: Record<string, any>;
  form_status?: ActivityStatus;
}

interface ICreateLocal {
  id: string;
  data: Record<string, any>;
}

interface ActivityTableRowRequest {
  recordSetID: string | number;
  tableFiltersHash: string;
  page: number;
  limit: number;
}

/** Errors used in RJSF Validation */
interface IActivityError {
  [key: PropertyKey]: FieldError;
}

interface ActivityTableRowGetRequest extends ActivityTableRowRequest {
  filterObj: Record<PropertyKey, any>;
}

interface ActivityTableRowsGetSuccess extends ActivityTableRowRequest {
  rows: Record<PropertyKey, any>[];
}

interface IGetIdsForRecordset {
  recordSetID: PropertyKey;
  tableFiltersHash: string;
}

interface IGetIdsForRecordsetOnline extends IGetIdsForRecordset {
  filterObj: FilterObjects;
}

interface IGetIdsForRecordsetSuccess extends IGetIdsForRecordset {
  idList: Array<string | number>;
}

interface IGetSuccess {
  activity: UserRecord;
  permissions: IActivityPermissions;
}

interface IActivityFormChangeRequest {
  eventFormData: UserRecord;
}

interface SwitchRecordSetPayload {
  setId: string;
  type: 'Activity' | 'IAPP';
}

class Activity {
  private static readonly PREFIX = 'Activity';
  static readonly Offline = Offline;
  static readonly Photo = Photos;
  static readonly Suggestions = Suggestions;
  static readonly Autofill = AutoFill;
  static readonly ChemicalTreatments = ChemicalTreatments;
  static readonly createReq = createAction<INewActivity>(`${this.PREFIX}/createReq`);
  static readonly createNetwork = createAction<Record<string, any>>(`${this.PREFIX}/createNetwork`);
  static readonly updateGeoFailure = createAction<Record<string, any>>(`${this.PREFIX}/updateGeoFailure`);
  static readonly saveNetworkRequest = createAction<ISaveNetwork>(`${this.PREFIX}/saveNetworkRequest`);
  static readonly getNetworkRequest = createAction<string>(`${this.PREFIX}/getNetworkRequest`);
  static readonly save = createAction(`${this.PREFIX}/save`);
  static readonly saveSuccess = createAction<Record<string, any>>(`${this.PREFIX}/saveSuccess`);
  static readonly createLocal = createAction<ICreateLocal>(`${this.PREFIX}/createLocal`);
  static readonly createSuccess = createAction<string>(`${this.PREFIX}/createSuccess`);
  static readonly deleteReq = createAction(`${this.PREFIX}/deleteReq`);
  static readonly deleteNetwork = createAction(`${this.PREFIX}/deleteNetwork`);
  static readonly deleteSuccess = createAction(`${this.PREFIX}/deleteSuccess`);
  static readonly deleteFailure = createAction(`${this.PREFIX}/deleteFailure`);
  static readonly submit = createAction(`${this.PREFIX}/submit`);
  static readonly paste = createAction(`${this.PREFIX}/paste`);
  static readonly copy = createAction(`${this.PREFIX}/copy`);
  static readonly copySuccess = createAction<Record<string, any>>(`${this.PREFIX}/copySuccess`);
  static readonly get = createAction<string>(`${this.PREFIX}/get`);
  static readonly getLocal = createAction<string>(`${this.PREFIX}/getLocal`);
  static readonly getSuccess = createAction<IGetSuccess>(`${this.PREFIX}/getSuccess`);
  static readonly getFailure = createAction(`${this.PREFIX}/getFailure`, (arg?: Response) => ({
    payload: arg
  }));
  static readonly refreshFormCodes = createAsyncThunk(`${this.PREFIX}/refreshFormCodes`, async () => {
    const response = await fetch(`http://localhost:8000/codes`, {
      headers: { Authorization: await getCurrentJWT() }
    });
    const formCodes = await response.json();
    const mappedCodes = {};
    for (const arr of formCodes) {
      if (arr.length === 0) continue;
      mappedCodes[arr[0]?.table] = arr;
    }
    return mappedCodes;
  });
  static readonly getRows = createAction<ActivityTableRowRequest>(`${this.PREFIX}/getRows`);
  static readonly getRowsRequest = createAction<ActivityTableRowGetRequest>(`${this.PREFIX}/getRowsRequest`);
  static readonly getRowsOnline = createAction<ActivityTableRowGetRequest>(`${this.PREFIX}/getRowsOnline`);
  static readonly getRowsOffline = createAction<ActivityTableRowGetRequest>(`${this.PREFIX}/getRowsOffline`);
  static readonly getRowsSuccess = createAction<ActivityTableRowsGetSuccess>(`${this.PREFIX}/getRowsSuccess`);

  static readonly setErrors = createAction<IActivityError[]>(`${this.PREFIX}/setErrors`);
  static readonly buildFormSchema = createAction(`${this.PREFIX}/buildFormSchema`, (formCreatedByUser: boolean) => ({
    payload: { formCreatedByUser }
  }));
  static readonly buildFormSchemaSuccess = createAction(
    `${this.PREFIX}/buildFormSchemaSuccess`,
    ({ schema, uiSchema }) => ({
      payload: { schema, uiSchema }
    })
  );
  static readonly onFormChangeRequest = createAction<UserRecord>(`${this.PREFIX}/onFormChangeRequest`);
  static readonly OnFormChangeRequestSuccess = createAction<UserRecord>(`${this.PREFIX}/onFormChangeRequestSuccess`);

  static readonly loadActivityIfRequired = createAction<string>(`${this.PREFIX}/loadActivity`);
  static readonly switchRecordSet = createAction<SwitchRecordSetPayload>(`${this.PREFIX}/switchRecordSet`);
}

export default Activity;
export type {
  IActivityFormChangeRequest,
  INewActivity,
  ICreateLocal,
  IGetIdsForRecordsetSuccess,
  IGetIdsForRecordsetOnline,
  IGetIdsForRecordset,
  ActivityTableRowsGetSuccess,
  ActivityTableRowGetRequest,
  IActivityError,
  ActivityTableRowRequest,
  SwitchRecordSetPayload
};

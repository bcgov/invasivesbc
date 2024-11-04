import { createAction } from '@reduxjs/toolkit';
import Offline from './Offline';
import Photos from './Photos';
import Suggestions from './Suggestions';
import AutoFill from './AutoFill';
import GeoJson from './GeoJson';
import { ActivityStatus } from 'sharedAPI';

export interface INewActivity {
  type: string;
  subType: string;
}
interface ISaveNetwork {
  activity_id: string;
  updatedFormData?: Record<string, any>;
  form_status?: ActivityStatus;
}
export interface ICreateLocal {
  id: string;
  data: Record<string, any>;
}
class Activity {
  private static readonly PREFIX = 'Activity';
  static readonly Offline = Offline;
  static readonly Photo = Photos;
  static readonly Suggestions = Suggestions;
  static readonly Autofill = AutoFill;
  static readonly GeoJson = GeoJson;

  static readonly createReq = createAction<INewActivity>(`${this.PREFIX}/createReq`);
  static readonly createNetwork = createAction<Record<string, any>>(`${this.PREFIX}/createNetwork`);

  static readonly saveNetworkRequest = createAction<ISaveNetwork>(`${this.PREFIX}/saveNetworkRequest`);
  static readonly getNetworkRequest = createAction<string>(`${this.PREFIX}/getNetworkRequest`);

  static readonly save = createAction(`${this.PREFIX}/save`);
  static readonly saveSuccess = createAction<Record<string, any>>(`${this.PREFIX}/saveSuccess`);

  static readonly setSavedHashSuccess = createAction<string>(`${this.PREFIX}/setSavedHashSuccess`);

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
  static readonly getSuccess = createAction<Record<string, any>>(`${this.PREFIX}/getSuccess`);
  static readonly getFailure = createAction(`${this.PREFIX}/getFailure`, (arg?: Response) => ({
    payload: arg
  }));
}
export default Activity;

import { createAction } from '@reduxjs/toolkit';
import IappRecord from 'interfaces/IappRecord';

export interface IappTableRowRequest {
  recordSetID: string | number;
  tableFiltersHash: Record<PropertyKey, any>;
  page: number;
  limit: number;
}

export interface IappTableRowGetRequest extends IappTableRowRequest {
  filterObj: Record<PropertyKey, any>;
}
export interface IappTableRowsGetSuccess extends IappTableRowRequest {
  rows: Record<PropertyKey, any>[];
}
export interface IappTableRowsGetFailure extends IappTableRowRequest {
  error: Record<PropertyKey, any>[];
}

class IappActions {
  private static readonly PREFIX = 'IappActions';

  static readonly get = createAction<string>(`${this.PREFIX}/get`);
  static readonly getRequest = createAction<string>(`${this.PREFIX}/getRequest`);
  static readonly getSuccess = createAction<IappRecord>(`${this.PREFIX}/getSuccess`);
  static readonly getFailure = createAction(`${this.PREFIX}/getFailure`);

  static readonly getRows = createAction<IappTableRowRequest>(`${this.PREFIX}/getRows`);
  static readonly getRowsRequest = createAction<IappTableRowGetRequest>(`${this.PREFIX}/getRowsRequest`);
  static readonly getRowsSuccess = createAction<IappTableRowsGetSuccess>(`${this.PREFIX}/getRowsSuccess`);
  static readonly getRowsFailure = createAction<IappTableRowsGetFailure>(`${this.PREFIX}/getRowsFailure`);
}

export default IappActions;

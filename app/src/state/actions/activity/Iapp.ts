import { createAction } from '@reduxjs/toolkit';
import { IGetIdsForRecordset, IGetIdsForRecordsetOnline, IGetIdsForRecordsetSuccess } from './Activity';
import IappRecord from 'interfaces/IappRecord';

interface IappTableRowRequest {
  recordSetID: string | number;
  tableFiltersHash: string;
  page: number;
  limit: number;
}

interface IappTableRowGetRequest extends IappTableRowRequest {
  filterObj: Record<PropertyKey, any>;
}

interface IappTableRowsGetSuccess extends IappTableRowRequest {
  rows: Record<PropertyKey, any>[];
}

interface IappTableRowsGetFailure extends IappTableRowRequest {
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

  static readonly getIdsForRecordset = createAction<IGetIdsForRecordset>(`${this.PREFIX}/getIdsForRecordset`);
  static readonly getIdsForRecordsetOnline = createAction<IGetIdsForRecordsetOnline>(
    `${this.PREFIX}/getIdsForRecordsetOnline`
  );
  static readonly getIdsForRecordsetSuccess = createAction<IGetIdsForRecordsetSuccess>(
    `${this.PREFIX}/getIdsForRecordsetSuccess`
  );
}

export default IappActions;
export type { IappTableRowRequest, IappTableRowGetRequest, IappTableRowsGetSuccess, IappTableRowsGetFailure };

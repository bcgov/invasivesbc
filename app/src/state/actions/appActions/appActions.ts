import { createAction } from '@reduxjs/toolkit';
import FilterObjects from 'interfaces/FilterObjects';
import { RecordSetType } from 'interfaces/UserRecordSet';

interface IGlobalError {
  detail: {
    error: Error;
    errorInfo: { sagaStack: string };
  };
}
interface IPrepFilter {
  recordSetID: string | number;
  tableFiltersHash: string;
}
interface IPreppedFilters {
  filterObject: FilterObjects;
  recordSetID: string | number;
  tableFiltersHash: string;
  recordSetType: RecordSetType;
}
class AppActions {
  private static readonly PREFIX = 'AppActions';

  public static readonly urlChange = createAction<string>(`${this.PREFIX}/urlChange`);
  public static readonly crashHandleGlobalError = createAction<IGlobalError>(`${this.PREFIX}/crashHandleGlobalError`);
  public static readonly toggleCustomLayersModal = createAction(`${this.PREFIX}/toggleCustomLayersModal`);
  static readonly prepVectorFilters = createAction<IPrepFilter>(`${this.PREFIX}/prepVectorFilters`);
  static readonly vectorFiltersPrepped = createAction<IPreppedFilters>(`${this.PREFIX}/vectorFiltersPrepped`);
}

export default AppActions;
export type { IPrepFilter, IPreppedFilters };

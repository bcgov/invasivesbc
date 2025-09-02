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
  mapToggle: boolean;
  labelToggle: boolean;
  color: string;
}
interface IUserCoord {
  position: {
    coords: {
      latitude: number | null;
      longitude: number | null;
      accuracy: number | null;
      heading: number | null;
    };
  };
}
class AppActions {
  private static readonly PREFIX = 'AppActions';

  public static readonly urlChange = createAction<string>(`${this.PREFIX}/urlChange`);
  public static readonly crashHandleGlobalError = createAction<IGlobalError>(`${this.PREFIX}/crashHandleGlobalError`);
  public static readonly toggleCustomLayersModal = createAction(`${this.PREFIX}/toggleCustomLayersModal`);
  static readonly prepVectorFilters = createAction<IPrepFilter>(`${this.PREFIX}/prepVectorFilters`);
  static readonly vectorFiltersPrepped = createAction<IPreppedFilters>(`${this.PREFIX}/vectorFiltersPrepped`);
  static readonly setUserCoords = createAction<IUserCoord>(`${this.PREFIX}/setUserCoords`);
}

export default AppActions;
export type { IPrepFilter, IPreppedFilters };

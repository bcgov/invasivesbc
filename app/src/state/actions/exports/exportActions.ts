import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import { RecordSetType } from 'interfaces/UserRecordSet';
import { RootState } from 'state/reducers/rootReducer';
import { getCurrentJWT } from 'state/sagas/auth/auth';
import { getRecordFilterObjectFromStateForAPI } from 'state/sagas/map/dataAccess';

class ExportActions {
  private static readonly PREFIX = 'ExportActions';
  public static readonly requestExcel = createAsyncThunk(
    `${this.PREFIX}/requestExcel`,
    async (spec: { setId: string; csvType: string }, { getState, rejectWithValue }) => {
      const state = (await getState()) as RootState;
      const API_BASE = state.Configuration.current.runtime.API_BASE;
      const set = state.UserSettings?.recordSets[spec.setId];
      const filterObject = getRecordFilterObjectFromStateForAPI(spec.setId, state.UserSettings);

      if (!filterObject) return rejectWithValue('Filter Object is null, cannot process request.');

      filterObject.limit = 200000;
      filterObject.isCSV = true;
      filterObject.CSVType = spec.csvType;

      const recordSetEndPoint = set.recordSetType === RecordSetType.Activity ? 'activities' : 'iapp';

      const res = await fetch(API_BASE + `/api/v2/${recordSetEndPoint}/`, {
        method: 'POST',
        headers: { Authorization: await getCurrentJWT(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ filterObjects: [filterObject] })
      });

      if (!res?.ok) return rejectWithValue('HTTP Request failed to resolve');

      const url = await res.text();
      return { link: url, setId: spec.setId };
    }
  );
  public static readonly resetCsvUrl = createAction(`${this.PREFIX}/resetCsvUrl`);
}

export default ExportActions;

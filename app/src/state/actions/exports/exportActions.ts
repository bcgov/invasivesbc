import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import { RecordSetType } from 'interfaces/UserRecordSet';
import { RootState } from 'state/reducers/rootReducer';
import { getCurrentJWT } from 'state/sagas/auth/auth';
import { getRecordFilterObjectFromStateForAPI } from 'state/sagas/map/dataAccess';

class ExportActions {
  private static readonly PREFIX = 'ExportActions';

  public static readonly requestActivityCSV = createAsyncThunk(
    `${this.PREFIX}/requestActivityCSV`,
    async (spec: { setId: string; csvType: string }, { getState, rejectWithValue }) => {
      const state = (await getState()) as RootState;
      const API_V2_BASE = state.Configuration.current.runtime.API_V2_BASE;
      const filterObject = getRecordFilterObjectFromStateForAPI(spec.setId, state.UserSettings);

      if (!filterObject) return rejectWithValue('Filter Object is null, cannot process request.');

      filterObject.limit = 200000;
      filterObject.isCSV = true;
      filterObject.CSVType = spec.csvType;

      const res = await fetch(`${API_V2_BASE}/recordset/csv`, {
        method: 'POST',
        headers: { Authorization: await getCurrentJWT(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ filterObjects: [filterObject] })
      });

      if (!res?.ok) return rejectWithValue('HTTP Request failed to resolve');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const date = new Date();

      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();

      const formattedDate = `${year}-${month}-${day}`; // "2026-05-12"

      // Create an invisible link component and "clicks" it to start download, then removes it
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${spec.csvType.toLowerCase()}-${formattedDate}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL('url');
      document.body.removeChild(a);
    }
  );

  public static readonly requestExcel = createAsyncThunk(
    `${this.PREFIX}/requestExcel`,
    async (spec: { setId: string; csvType: string }, { getState, rejectWithValue }) => {
      const state = (await getState()) as RootState;
      const { API_BASE, API_V2_BASE } = state.Configuration.current.runtime;
      const set = state.UserSettings?.recordSets[spec.setId];
      const filterObject = getRecordFilterObjectFromStateForAPI(spec.setId, state.UserSettings);

      if (!filterObject) return rejectWithValue('Filter Object is null, cannot process request.');

      filterObject.limit = 200000;
      filterObject.isCSV = true;
      filterObject.CSVType = spec.csvType;

      const recordSetEndPoint =
        set.recordSetType === RecordSetType.Activity ? `${API_V2_BASE}/recordset/csv` : `${API_BASE}/v2/iapp/`;

      const res = await fetch(recordSetEndPoint, {
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

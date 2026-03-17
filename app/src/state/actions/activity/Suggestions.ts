import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import { FeatureCollection, Geometry, GeoJSON } from 'geojson';
import { ActivitySubtypeShortLabels } from 'sharedAPI';
import SuggestedTreatmentId from 'interfaces/SuggestedTreatmentId';
import { RootState } from 'state/reducers/rootReducer';
import { getCurrentJWT } from 'state/sagas/auth/auth';

interface TreatmentIdsRequestOnline {
  activity_subtype: ActivitySubtypeShortLabels[];
  user_roles: Record<string, any>[];
  search_feature: FeatureCollection | boolean;
}

interface LinkedRecordIdsRequest {
  bounds: GeoJSON;
  subtype?: string;
}
class Suggestions {
  private static readonly PREFIX = 'Activity/Suggestions';
  // Jurisdiction Suggestions
  static readonly jurisdictions = createAction<Geometry>(`${this.PREFIX}/jurisdictions`);
  static readonly jurisdictionsOnline = createAction<Geometry>(`${this.PREFIX}/jurisdictionsOnline`);
  static readonly jurisdictionsOffline = createAction(`${this.PREFIX}/jurisdictionsOffline`);
  static readonly jurisdictionsSuccess = createAction<Geometry[]>(`${this.PREFIX}/jurisdictionsSuccess`);

  // Biocontrol Suggestions
  static readonly biocontrolOnline = createAction(`${this.PREFIX}/biocontrolOnline`);
  static readonly biocontrolOnlineSuccess = createAction<Record<string, any>[]>(
    `${this.PREFIX}/biocontrolOnlineSuccess`
  );

  // Persons Suggestions
  static readonly persons = createAction(`${this.PREFIX}/persons`);
  static readonly personsOnline = createAction(`${this.PREFIX}/personsOnline`);
  static readonly personsSuccess = createAction<Record<string, any>[]>(`${this.PREFIX}/personsSuccess`);

  // Treatment ID Suggestions
  static readonly treatmentIdsRequest = createAction<Record<PropertyKey, any>>(`${this.PREFIX}/treatmentIdsRequest`);
  static readonly treatmentIdsRequestOnline = createAction<TreatmentIdsRequestOnline>(
    `${this.PREFIX}/treatmentIdsRequestOnline`
  );

  static readonly getLinkedRecordIDs = createAsyncThunk(
    `${this.PREFIX}/getLinkedRecordIDs`,
    async (spec: LinkedRecordIdsRequest, { getState }) => {
      const { Configuration, Network }: RootState = getState() as RootState;
      const MOBILE = Configuration.current.build.MOBILE;
      const OFFLINE = !Network.connected;
      if (MOBILE && OFFLINE) {
        //Do the offline thing;
      }
      const res = await fetch(`${Configuration.current.runtime.API_V2_BASE}/ids-within-bounds`, {
        method: 'POST',
        headers: { Authorization: await getCurrentJWT(), 'Content-Type': 'application/json' },
        body: JSON.stringify(spec)
      });
      return await res.json();
    }
  );
  static readonly treatmentIdsSuccess = createAction<SuggestedTreatmentId[]>(`${this.PREFIX}/treatmentIdsSuccess`);
}

export type { TreatmentIdsRequestOnline };
export default Suggestions;

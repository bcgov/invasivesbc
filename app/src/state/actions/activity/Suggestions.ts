import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import { FeatureCollection, Geometry, GeoJSON, Feature } from 'geojson';
import { ActivitySubtypeShortLabels } from 'sharedAPI';
import SuggestedTreatmentId from 'interfaces/SuggestedTreatmentId';
import { RootState } from 'state/reducers/rootReducer';
import { getCurrentJWT } from 'state/sagas/auth/auth';
import { RecordCacheServiceFactory } from 'utils/record-cache/context';

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
  static readonly getJurisdictions = createAsyncThunk(
    `${this.PREFIX}/getJurisdictions`,
    async (shape: Feature, { getState }) => {
      const { Network, Configuration } = getState() as RootState;
      const connected = Network.connected;
      if (!connected || !shape) return [];
      const url = `${Configuration.current.runtime.API_BASE}/api/jurisdictions`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { Authorization: await getCurrentJWT(), 'Content-Type': 'application/json' },
        body: JSON.stringify({ search_feature: { ...shape, properties: {} } })
      });

      const { result } = await res.json();
      return result;
    }
  );

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

  /**
   * Query the current Subtype / Shape to get records of interest in Area
   */
  static readonly getLinkedRecordIDs = createAsyncThunk(
    `${this.PREFIX}/getLinkedRecordIDs`,
    async (spec: LinkedRecordIdsRequest, { getState }) => {
      const { Configuration, Network }: RootState = getState() as RootState;
      const MOBILE = Configuration.current.build.MOBILE;

      if (Network.connected) {
        try {
          const res = await fetch(`${Configuration.current.runtime.API_V2_BASE}/ids-within-bounds`, {
            method: 'POST',
            headers: { Authorization: await getCurrentJWT(), 'Content-Type': 'application/json' },
            body: JSON.stringify(spec)
          });

          return await res.json();
        } catch (e) {
          console.error('Error Occurred, attempting Mobile Cache', e);
        }
      }
      if (MOBILE) {
        // Fetch Records from Cache [If applicable]
        const service = await RecordCacheServiceFactory.getPlatformInstance();
        const overlappingRecords = await service.getRecordIdsOverlappingFeature(spec.bounds as Feature);
        const treatmentRecords = await service.getPaginatedCachedActivityRecords(overlappingRecords, 0, 10000);
        return treatmentRecords.map((r) => ({
          full: r.activity_id,
          label: `${r.short_id} | ${r.created_by}` // TODO Refactor to include Date when schema changes
        }));
      }
    }
  );
  static readonly treatmentIdsSuccess = createAction<SuggestedTreatmentId[]>(`${this.PREFIX}/treatmentIdsSuccess`);
}

export type { TreatmentIdsRequestOnline };
export default Suggestions;

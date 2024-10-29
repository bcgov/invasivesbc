import { createAction } from '@reduxjs/toolkit';
import { FeatureCollection, Geometry } from '@turf/helpers';
import { ActivitySubtype } from 'sharedAPI';
import SuggestedTreatmentId from 'interfaces/SuggestedTreatmentId';

interface TreatmentIdsRequestOnline {
  activity_subtype: ActivitySubtype[];
  user_roles: Record<string, any>[];
  search_feature: FeatureCollection | boolean;
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
  static readonly treatmentIdsRequest = createAction<Record<string, any>>(`${this.PREFIX}/treatmentIdsRequest`);
  static readonly treatmentIdsRequestOnline = createAction<TreatmentIdsRequestOnline>(
    `${this.PREFIX}/treatmentIdsRequestOnline`
  );
  static readonly treatmentIdsSuccess = createAction<SuggestedTreatmentId[]>(`${this.PREFIX}/treatmentIdsSuccess`);
}
export default Suggestions;

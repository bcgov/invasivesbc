import { createAction } from '@reduxjs/toolkit';
import {
  ACTIVITY_GET_SUGGESTED_JURISDICTIONS_REQUEST,
  ACTIVITY_GET_SUGGESTED_JURISDICTIONS_REQUEST_ONLINE,
  ACTIVITY_GET_SUGGESTED_JURISDICTIONS_REQUEST_OFFLINE,
  ACTIVITY_GET_SUGGESTED_JURISDICTIONS_SUCCESS,
  ACTIVITY_GET_SUGGESTED_BIOCONTROL_REQUEST_ONLINE,
  ACTIVITY_GET_SUGGESTED_BIOCONTROL_REQUEST_ONLINE_SUCCESS,
  ACTIVITY_GET_SUGGESTED_BIOCONTROL_AGENTS,
  ACTIVITY_GET_SUGGESTED_BIOCONTROL_AGENTS_SUCCESS,
  ACTIVITY_GET_SUGGESTED_PERSONS_REQUEST,
  ACTIVITY_GET_SUGGESTED_PERSONS_REQUEST_ONLINE,
  ACTIVITY_GET_SUGGESTED_PERSONS_SUCCESS,
  ACTIVITY_GET_SUGGESTED_TREATMENT_IDS_REQUEST,
  ACTIVITY_GET_SUGGESTED_TREATMENT_IDS_REQUEST_ONLINE,
  ACTIVITY_GET_SUGGESTED_TREATMENT_IDS_SUCCESS
} from '../../actions';
import { FeatureCollection, Geometry } from '@turf/helpers';
import { ActivitySubtype } from 'sharedAPI';
import SuggestedTreatmentId from 'interfaces/SuggestedTreatmentId';

interface TreatmentIdsRequestOnline {
  activity_subtype: ActivitySubtype[];
  user_roles: Record<string, any>[];
  search_feature: FeatureCollection | boolean;
}

class Suggestions {
  // Jurisdiction Suggestions
  static readonly jurisdictions = createAction<Geometry>(ACTIVITY_GET_SUGGESTED_JURISDICTIONS_REQUEST);
  static readonly jurisdictionsOnline = createAction<Geometry>(ACTIVITY_GET_SUGGESTED_JURISDICTIONS_REQUEST_ONLINE);
  static readonly jurisdictionsOffline = createAction(ACTIVITY_GET_SUGGESTED_JURISDICTIONS_REQUEST_OFFLINE);
  static readonly jurisdictionsSuccess = createAction<Geometry[]>(ACTIVITY_GET_SUGGESTED_JURISDICTIONS_SUCCESS);

  // Biocontrol Suggestions
  static readonly biocontrolAgents = createAction(
    ACTIVITY_GET_SUGGESTED_BIOCONTROL_AGENTS,
    (plantCodes: { prev: string; curr: string }[], agentListTarget: string) => ({
      payload: { plantCodes, agentListTarget }
    })
  );
  static readonly biocontrolOnline = createAction(ACTIVITY_GET_SUGGESTED_BIOCONTROL_REQUEST_ONLINE);
  static readonly biocontrolOnlineSuccess = createAction<Record<string, any>[]>(
    ACTIVITY_GET_SUGGESTED_BIOCONTROL_REQUEST_ONLINE_SUCCESS
  );
  static readonly biocontrolAgentsSuccess = createAction(
    ACTIVITY_GET_SUGGESTED_BIOCONTROL_AGENTS_SUCCESS,
    (suggestedBiocontrolTreatments: Record<string, any>[], agentListTarget: string) => ({
      payload: { suggestedBiocontrolTreatments, agentListTarget }
    })
  );

  // Persons Suggestions
  static readonly persons = createAction(ACTIVITY_GET_SUGGESTED_PERSONS_REQUEST);
  static readonly personsOnline = createAction(ACTIVITY_GET_SUGGESTED_PERSONS_REQUEST_ONLINE);
  static readonly personsSuccess = createAction<Record<string, any>[]>(ACTIVITY_GET_SUGGESTED_PERSONS_SUCCESS);

  // Treatment ID Suggestions
  static readonly treatmentIdsRequest = createAction<Record<string, any>>(ACTIVITY_GET_SUGGESTED_TREATMENT_IDS_REQUEST);
  static readonly treatmentIdsRequestOnline = createAction<TreatmentIdsRequestOnline>(
    ACTIVITY_GET_SUGGESTED_TREATMENT_IDS_REQUEST_ONLINE
  );
  static readonly treatmentIdsSuccess = createAction<SuggestedTreatmentId[]>(
    ACTIVITY_GET_SUGGESTED_TREATMENT_IDS_SUCCESS
  );
}
export default Suggestions;

import { createAction } from '@reduxjs/toolkit';
import Boundary from 'interfaces/Boundary';
import { RecordSetType, UserRecordSet } from 'interfaces/UserRecordSet';
import {
  USER_SETTINGS_SET_RECORDSET,
  USER_SETTINGS_ADD_RECORD_SET,
  USER_SETTINGS_REMOVE_RECORD_SET,
  USER_SETTINGS_SET_SELECTED_RECORD_REQUEST,
  USER_SETTINGS_SET_BOUNDARIES_REQUEST,
  USER_SETTINGS_SET_BOUNDARIES_SUCCESS,
  USER_SETTINGS_SET_BOUNDARIES_FAILURE,
  USER_SETTINGS_DELETE_BOUNDARY_REQUEST,
  USER_SETTINGS_DELETE_BOUNDARY_SUCCESS,
  USER_SETTINGS_DELETE_KML_REQUEST,
  USER_SETTINGS_DELETE_KML_SUCCESS,
  USER_SETTINGS_DELETE_KML_FAILURE,
  USER_SETTINGS_ADD_BOUNDARY_TO_SET_REQUEST,
  USER_SETTINGS_ADD_BOUNDARY_TO_SET_SUCCESS,
  USER_SETTINGS_ADD_BOUNDARY_TO_SET_FAILURE,
  USER_SETTINGS_REMOVE_BOUNDARY_FROM_SET_REQUEST,
  USER_SETTINGS_REMOVE_BOUNDARY_FROM_SET_SUCCESS,
  USER_SETTINGS_REMOVE_BOUNDARY_FROM_SET_FAILURE,
  USER_SETTINGS_TOGGLE_RECORDS_EXPANDED_REQUEST,
  USER_SETTINGS_TOGGLE_RECORDS_EXPANDED_SUCCESS,
  USER_SETTINGS_SET_MAP_CENTER_REQUEST,
  USER_SETTINGS_SET_MAP_CENTER_SUCCESS,
  USER_SETTINGS_SET_MAP_CENTER_FAILURE,
  USER_SETTINGS_SET_NEW_RECORD_DIALOG_STATE_REQUEST,
  USER_SETTINGS_SET_NEW_RECORD_DIALOG_STATE_SUCCESS,
  USER_SETTINGS_GET_INITIAL_STATE_REQUEST,
  USER_SETTINGS_GET_INITIAL_STATE_SUCCESS,
  USER_SETTINGS_SET_ACTIVE_ACTIVITY_REQUEST,
  USER_SETTINGS_SET_ACTIVE_ACTIVITY_SUCCESS,
  USER_SETTINGS_SET_ACTIVE_IAPP_REQUEST,
  USER_SETTINGS_SET_ACTIVE_IAPP_SUCCESS
} from 'state/actions';
import { INewRecordDialogState } from 'UI/Overlay/Records/NewRecordDialog';

class Boundaries {
  static readonly set = createAction(USER_SETTINGS_SET_BOUNDARIES_REQUEST);
  static readonly setSuccess = createAction<Boundary[]>(USER_SETTINGS_SET_BOUNDARIES_SUCCESS);
  static readonly setFailure = createAction(USER_SETTINGS_SET_BOUNDARIES_FAILURE);

  static readonly delete = createAction(USER_SETTINGS_DELETE_BOUNDARY_REQUEST);
  static readonly deleteSuccess = createAction<Boundary>(USER_SETTINGS_DELETE_BOUNDARY_SUCCESS);

  static readonly addToSet = createAction<RecordSet>(USER_SETTINGS_ADD_BOUNDARY_TO_SET_REQUEST);
  static readonly addToSetSuccess = createAction<{ [key: string]: RecordSet }>(
    USER_SETTINGS_ADD_BOUNDARY_TO_SET_SUCCESS
  );
  static readonly addToSetFailure = createAction(USER_SETTINGS_ADD_BOUNDARY_TO_SET_FAILURE);

  static readonly removeFromSet = createAction(USER_SETTINGS_REMOVE_BOUNDARY_FROM_SET_REQUEST);
  static readonly removeFromSetSuccess = createAction<{ [key: string]: RecordSet }>(
    USER_SETTINGS_REMOVE_BOUNDARY_FROM_SET_SUCCESS
  );
  static readonly removeFromSetFailure = createAction(USER_SETTINGS_REMOVE_BOUNDARY_FROM_SET_FAILURE);
}

class KML {
  static readonly delete = createAction<string>(USER_SETTINGS_DELETE_KML_REQUEST);
  static readonly deleteSuccess = createAction<string>(USER_SETTINGS_DELETE_KML_SUCCESS);
  static readonly deleteFailure = createAction<string>(USER_SETTINGS_DELETE_KML_FAILURE);
}

class InitState {
  static readonly get = createAction(USER_SETTINGS_GET_INITIAL_STATE_REQUEST);
  static readonly getSuccess = createAction(USER_SETTINGS_GET_INITIAL_STATE_SUCCESS, (recordSets: UserRecordSet) => ({
    payload: {
      recordSets
    }
  }));
}

class IAPP {
  static readonly setActive = createAction<string>(USER_SETTINGS_SET_ACTIVE_IAPP_REQUEST);
  static readonly setActiveSuccess = createAction<string | null>(USER_SETTINGS_SET_ACTIVE_IAPP_SUCCESS);
}

class Activity {
  static readonly setActiveActivityId = createAction<string>(USER_SETTINGS_SET_ACTIVE_ACTIVITY_REQUEST);
  static readonly setActiveActivityIdSuccess = createAction<string>(USER_SETTINGS_SET_ACTIVE_ACTIVITY_SUCCESS);
}

class RecordSet {
  private static readonly createDefaultRecordset = (type: RecordSetType): UserRecordSet => ({
    tableFilters: null,
    color: '#FFFFFF',
    drawOrder: 0,
    expanded: false,
    isSelected: false,
    mapToggle: false,
    recordSetName: 'New Recordset - ' + type,
    recordSetType: type,
    cached: false,
    cachedTime: '',
    offlineMode: false,
    isDeletingCache: false,
    isCaching: false,
    searchBoundary: {
      geos: [],
      id: 0,
      name: '',
      server_id: 0
    }
  });

  static readonly add = createAction(USER_SETTINGS_ADD_RECORD_SET, (type: RecordSetType) => ({
    payload: this.createDefaultRecordset(type)
  }));
  static readonly remove = createAction<string>(USER_SETTINGS_REMOVE_RECORD_SET);
  static readonly set = createAction(
    USER_SETTINGS_SET_RECORDSET,
    (updatedSet: Record<string, any>, setName: string) => ({
      payload: {
        updatedSet,
        setName
      }
    })
  );
  static readonly setSelected = createAction<string | null>(USER_SETTINGS_SET_SELECTED_RECORD_REQUEST);
}

class Map {
  static readonly setCenter = createAction<number[]>(USER_SETTINGS_SET_MAP_CENTER_REQUEST);
  static readonly setCenterSuccess = createAction<number[]>(USER_SETTINGS_SET_MAP_CENTER_SUCCESS);
  static readonly setCenterFailure = createAction(USER_SETTINGS_SET_MAP_CENTER_FAILURE);
}

class UserSettings {
  static readonly Boundaries = Boundaries;
  static readonly KML = KML;
  static readonly InitState = InitState;
  static readonly IAPP = IAPP;
  static readonly Activity = Activity;
  static readonly RecordSet = RecordSet;
  static readonly Map = Map;

  static readonly toggleRecordExpand = createAction(USER_SETTINGS_TOGGLE_RECORDS_EXPANDED_REQUEST);
  static readonly toggleRecordExpandSuccess = createAction(USER_SETTINGS_TOGGLE_RECORDS_EXPANDED_SUCCESS);

  static readonly setNewRecordDialogueState = createAction<INewRecordDialogState>(
    USER_SETTINGS_SET_NEW_RECORD_DIALOG_STATE_REQUEST
  );
  static readonly setNewRecordDialogueStateSuccess = createAction<INewRecordDialogState>(
    USER_SETTINGS_SET_NEW_RECORD_DIALOG_STATE_SUCCESS
  );
}

export default UserSettings;

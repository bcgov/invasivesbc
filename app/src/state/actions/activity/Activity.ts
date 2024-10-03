import { createAction } from '@reduxjs/toolkit';
import Offline from './Offline';
import Photos from './Photos';
import Suggestions from './Suggestions';
import {
  ACTIVITY_LINK_RECORD_REQUEST,
  ACTIVITY_LINK_RECORD_SUCCESS,
  ACTIVITY_LINK_RECORD_FAILURE,
  ACTIVITY_PERSIST_REQUEST,
  ACTIVITY_PERSIST_SUCCESS,
  ACTIVITY_PERSIST_FAILURE,
  ACTIVITY_UPDATE_SYNC_STATE,
  ACTIVITY_ERRORS,
  ACTIVITY_DEBUG,
  ACTIVITY_PAGE_MAP_EXTENT_TOGGLE,
  ACTIVITY_UPDATE_GEO_REQUEST,
  ACTIVITY_UPDATE_GEO_SUCCESS,
  ACTIVITY_UPDATE_GEO_FAILURE,
  ACTIVITY_GET_INITIAL_STATE_REQUEST,
  ACTIVITY_GET_INITIAL_STATE_SUCCESS,
  ACTIVITY_GET_INITIAL_STATE_FAILURE,
  ACTIVITY_BUILD_SCHEMA_FOR_FORM_REQUEST,
  ACTIVITY_BUILD_SCHEMA_FOR_FORM_SUCCESS,
  ACTIVITY_ON_FORM_CHANGE_REQUEST,
  ACTIVITY_ON_FORM_CHANGE_SUCCESS,
  ACTIVITY_SET_CURRENT_HASH_REQUEST,
  ACTIVITY_SET_CURRENT_HASH_SUCCESS,
  ACTIVITY_SET_CURRENT_HASH_FAILURE,
  ACTIVITY_CHEM_TREATMENT_DETAILS_FORM_ON_CHANGE_REQUEST,
  ACTIVITY_CHEM_TREATMENT_DETAILS_FORM_ON_CHANGE_SUCCESS,
  ACTIVITIES_TABLE_ROWS_GET_REQUEST,
  ACTIVITIES_TABLE_ROWS_GET_ONLINE,
  ACTIVITIES_TABLE_ROWS_GET_SUCCESS,
  ACTIVITIES_TABLE_ROWS_GET_FAILURE,
  ACTIVITIES_GET_IDS_FOR_RECORDSET_REQUEST,
  ACTIVITIES_GET_IDS_FOR_RECORDSET_ONLINE,
  ACTIVITIES_GET_IDS_FOR_RECORDSET_SUCCESS,
  ACTIVITY_SET_ACTIVE_REQUEST,
  ACTIVITY_SET_ACTIVE_SUCCESS,
  ACTIVITY_SET_ACTIVE_FAILURE,
  ACTIVITY_CREATE_REQUEST,
  ACTIVITY_CREATE_NETWORK,
  ACTIVITY_CREATE_LOCAL,
  ACTIVITY_CREATE_SUCCESS,
  ACTIVITY_CREATE_FAILURE,
  ACTIVITY_DELETE_REQUEST,
  ACTIVITY_DELETE_NETWORK_REQUEST,
  ACTIVITY_DELETE_SUCCESS,
  ACTIVITY_DELETE_FAILURE,
  ACTIVITY_SUBMIT_REQUEST,
  ACTIVITY_SUBMIT_SUCCESS,
  ACTIVITY_SUBMIT_FAILURE,
  ACTIVITY_SAVE_NETWORK_REQUEST,
  ACTIVITY_SAVE_NETWORK_SUCCESS,
  ACTIVITY_SAVE_NETWORK_FAILURE,
  ACTIVITY_SAVE_REQUEST,
  ACTIVITY_SAVE_SUCCESS,
  ACTIVITY_SET_SAVED_HASH_REQUEST,
  ACTIVITY_SET_SAVED_HASH_SUCCESS,
  ACTIVITY_SET_SAVED_HASH_FAILURE,
  ACTIVITY_GET_NETWORK_REQUEST,
  ACTIVITY_PASTE_REQUEST,
  ACTIVITY_PASTE_SUCCESS,
  ACTIVITY_PASTE_FAILURE,
  ACTIVITY_COPY_REQUEST,
  ACTIVITY_COPY_SUCCESS,
  ACTIVITY_COPY_FAILURE,
  ACTIVITY_GET_REQUEST,
  ACTIVITY_GET_LOCAL_REQUEST,
  ACTIVITY_GET_SUCCESS,
  ACTIVITY_GET_FAILURE
} from '../../actions';

class Activity {
  static readonly Offline = Offline;
  static readonly Photo = Photos;
  static readonly Suggestions = Suggestions;

  static readonly createReq = createAction(ACTIVITY_CREATE_REQUEST);
  static readonly createNetwork = createAction(ACTIVITY_CREATE_NETWORK);

  static readonly saveNetworkRequest = createAction(ACTIVITY_SAVE_NETWORK_REQUEST);
  static readonly saveNetworkSuccess = createAction(ACTIVITY_SAVE_NETWORK_SUCCESS);
  static readonly saveNetworkFailure = createAction(ACTIVITY_SAVE_NETWORK_FAILURE);
  static readonly getNetworkRequest = createAction(ACTIVITY_GET_NETWORK_REQUEST);

  static readonly save = createAction(ACTIVITY_SAVE_REQUEST);
  static readonly saveSuccess = createAction(ACTIVITY_SAVE_SUCCESS);

  static readonly setSavedHash = createAction(ACTIVITY_SET_SAVED_HASH_REQUEST);
  static readonly setSavedHashSuccess = createAction(ACTIVITY_SET_SAVED_HASH_SUCCESS);
  static readonly setSavedHashFailure = createAction(ACTIVITY_SET_SAVED_HASH_FAILURE);

  static readonly createLocal = createAction(ACTIVITY_CREATE_LOCAL);
  static readonly createSuccess = createAction(ACTIVITY_CREATE_SUCCESS);
  static readonly createFailure = createAction(ACTIVITY_CREATE_FAILURE);

  static readonly deleteReq = createAction(ACTIVITY_DELETE_REQUEST);
  static readonly deleteNetwork = createAction(ACTIVITY_DELETE_NETWORK_REQUEST);
  static readonly deleteSuccess = createAction(ACTIVITY_DELETE_SUCCESS);
  static readonly deleteFailure = createAction(ACTIVITY_DELETE_FAILURE);

  static readonly submit = createAction(ACTIVITY_SUBMIT_REQUEST);
  static readonly submitSuccess = createAction(ACTIVITY_SUBMIT_SUCCESS);
  static readonly submitFailure = createAction(ACTIVITY_SUBMIT_FAILURE);

  static readonly paste = createAction(ACTIVITY_PASTE_REQUEST);
  static readonly pasteSuccess = createAction(ACTIVITY_PASTE_SUCCESS);
  static readonly pasteFailure = createAction(ACTIVITY_PASTE_FAILURE);

  static readonly copy = createAction(ACTIVITY_COPY_REQUEST);
  static readonly copySuccess = createAction(ACTIVITY_COPY_SUCCESS);
  static readonly copyFailure = createAction(ACTIVITY_COPY_FAILURE);

  static readonly get = createAction(ACTIVITY_GET_REQUEST);
  static readonly getLocal = createAction(ACTIVITY_GET_LOCAL_REQUEST);
  static readonly getSuccess = createAction(ACTIVITY_GET_SUCCESS);
  static readonly getFailure = createAction(ACTIVITY_GET_FAILURE);

  static readonly setActive = createAction(ACTIVITY_SET_ACTIVE_REQUEST);
  static readonly setActiveSuccess = createAction(ACTIVITY_SET_ACTIVE_SUCCESS);
  static readonly setActiveFailure = createAction(ACTIVITY_SET_ACTIVE_FAILURE);
}
export default Activity;

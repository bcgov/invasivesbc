import { Http } from '@capacitor-community/http';
import { copyToClipboard } from 'components/batch-upload/ClipboardHelper';
import { ActivityStatus } from 'constants/activities';
import { InvasivesAPI_Call } from 'hooks/useInvasivesApi';
import { IActivitySearchCriteria } from 'interfaces/useInvasivesApi-interfaces';
import { put, select } from 'redux-saga/effects';
import {
  ACTIVITY_CREATE_SUCCESS,
  ACTIVITY_GET_SUCCESS,
  ACTIVITY_SAVE_SUCCESS,
  ACTIVITY_GET_SUGGESTED_JURISDICTIONS_SUCCESS,
  ACTIVITY_GET_SUGGESTED_PERSONS_SUCCESS,
  ACTIVITY_GET_SUGGESTED_TREATMENT_IDS_SUCCESS,
  ACTIVITY_CREATE_FAILURE,
  ACTIVITY_GET_FAILURE,
  ACTIVITY_SAVE_FAILURE,
  ACTIVITY_GET_SUGGESTED_JURISDICTIONS_FAILURE,
  ACTIVITY_GET_SUGGESTED_PERSONS_FAILURE,
  ACTIVITY_GET_SUGGESTED_TREATMENT_IDS_FAILURE,
} from 'state/actions';
import { selectActivity } from 'state/reducers/activity';
import { autoRestart } from 'state/utilities/errorHandlers';
import { getShortActivityID } from 'utils/addActivity';

const checkForErrors = (response: any, status?: any, url?: any) => {
  if (response.code > 201) {
  }
};

//
export const handle_ACTIVITY_CREATE_NETWORK = autoRestart(
  function* handle_ACTIVITY_CREATE_NETWORK(action) {
    const networkReturn = yield InvasivesAPI_Call('POST', `/api/activity/`, action.payload.activity);
  
    yield put({ type: ACTIVITY_CREATE_SUCCESS, payload: { activity_id: action.payload.activity.activity_id } });
  },
  function* handleError(e) {
    const errorMessage = 'Online activity request failed: ' + e.toString();
    copyToClipboard({
      message: errorMessage,
      value: errorMessage
    });
    yield put({
      type: ACTIVITY_CREATE_FAILURE
    });
  }
);

export const handle_ACTIVITY_GET_NETWORK_REQUEST = autoRestart(
  function* handle_ACTIVITY_GET_NETWORK_REQUEST(action) {
    const networkReturn = yield InvasivesAPI_Call('GET', `/api/activity/${action.payload.activityID}`);
  
    const datav2 = {
      ...networkReturn.data,
      species_positive: networkReturn.data.species_positive || [],
      species_negative: networkReturn.data.species_negative || [],
      species_treated: networkReturn.data.species_treated || [],
      media: networkReturn.data.media || [],
      media_delete_keys: networkReturn.data.media_delete_keys || []
    };
  
    //const validatedReturn = yield checkForErrors(networkReturn)
  
    // const remappedBlob = yield mapDBActivityToDoc(networkReturn.data)
  
    yield put({ type: ACTIVITY_GET_SUCCESS, payload: { activity: datav2 } });
  },
  function* handleError(e) {
    const errorMessage = 'Online activity get request failed: ' + e.toString();
    copyToClipboard({
      message: errorMessage,
      value: errorMessage
    });
    yield put({
      type: ACTIVITY_GET_FAILURE
    });
  }
);

export const handle_ACTIVITY_SAVE_NETWORK_REQUEST = autoRestart(
  function* handle_ACTIVITY_SAVE_NETWORK_REQUEST(action) {
    //save to server
  
    const oldActivity = yield select(selectActivity);
  
    const newActivity = {
      ...oldActivity.activity,
      species_positive: oldActivity.activity?.species_positive[0] !== null ? oldActivity.activity?.species_positive : [],
      species_negative: oldActivity.activity?.species_negative[0] !== null ? oldActivity.activity?.species_negative : [],
      species_treated: oldActivity.activity?.species_treated[0] !== null ? oldActivity.activity?.species_treated : [],
      form_data: action.payload.updatedFormData ? action.payload.updatedFormData : oldActivity.activity.form_data,
      form_status: [ActivityStatus.DRAFT, ActivityStatus.IN_REVIEW, ActivityStatus.SUBMITTED].includes(
        action.payload.form_status
      )
        ? action.payload.form_status
        : ActivityStatus.DRAFT
    };
  
    // handle delete photos if needed
    let keys_to_delete = [];
    if (newActivity.media_delete_keys?.length) {
      const keys = newActivity.media_delete_keys;
      for (let key of keys) {
        const deleteReturn = yield InvasivesAPI_Call('DELETE', `/api/media/delete/${key}`);
        if (deleteReturn) {
          keys_to_delete.push(key);
        }
      }
    }
  
    const filtered_media_delete_keys = newActivity.media_delete_keys.filter(key => !keys_to_delete.includes(key));
  
    const networkReturn = yield InvasivesAPI_Call('PUT', `/api/activity/`, {
      ...newActivity,
      activity_id: oldActivity.activity.activity_id
    });
    //const validatedReturn = yield checkForErrors(networkReturn)
  
    //        const remappedBlob = yield mapDBActivityToDoc(networkReturn.data)
  
    yield put({
      type: ACTIVITY_SAVE_SUCCESS, payload: {
        activity: {
          ...newActivity,
          media_delete_keys: filtered_media_delete_keys
        }
      }
    });
  },
  function* handleError(e) {
    const errorMessage = 'Online activity save request failed: ' + e.toString();
    copyToClipboard({
      message: errorMessage,
      value: errorMessage
    });
    yield put({
      type: ACTIVITY_SAVE_FAILURE
    });
  }
);

export const handle_ACTIVITY_GET_SUGGESTED_JURISDICTIONS_REQUEST_ONLINE = autoRestart(
  function* handle_ACTIVITY_GET_SUGGESTED_JURISDICTIONS_REQUEST_ONLINE(action) {
    const networkReturn = yield InvasivesAPI_Call('POST', `/api/jurisdictions/`, {
      search_feature: action.payload.search_feature[0]
    });
  
    yield put({
      type: ACTIVITY_GET_SUGGESTED_JURISDICTIONS_SUCCESS,
      payload: { jurisdictions: networkReturn.data.result }
    });
  },
  function* handleError(e) {
    const errorMessage = 'Online activity get suggested jurisdictions request failed: ' + e.toString();
    copyToClipboard({
      message: errorMessage,
      value: errorMessage
    });
    yield put({
      type: ACTIVITY_GET_SUGGESTED_JURISDICTIONS_FAILURE
    });
  }
);

export const handle_ACTIVITY_GET_SUGGESTED_PERSONS_REQUEST_ONLINE = autoRestart(
  function* handle_ACTIVITY_GET_SUGGESTED_PERSONS_REQUEST_ONLINE(action) {
    const networkReturn = yield InvasivesAPI_Call('GET', `/api/application-user/`);
  
    yield put({
      type: ACTIVITY_GET_SUGGESTED_PERSONS_SUCCESS,
      payload: { suggestedPersons: networkReturn.data.result }
    });
  },
  function* handleError(e) {
    const errorMessage = 'Online activity get suggested persons request failed: ' + e.toString();
    copyToClipboard({
      message: errorMessage,
      value: errorMessage
    });
    yield put({
      type: ACTIVITY_GET_SUGGESTED_PERSONS_FAILURE
    });
  }
);

export const handle_ACTIVITY_GET_SUGGESTED_TREATMENT_IDS_REQUEST_ONLINE = autoRestart(
  function* handle_ACTIVITY_GET_SUGGESTED_TREATMENT_IDS_REQUEST_ONLINE(action) {
    const search_feature = action.payload.search_feature;
    const networkReturn = yield InvasivesAPI_Call('GET', `/api/activities/`, {
      activity_subtype: action.payload.activity_subtype,
      search_feature
    });
  
    let treatments = [];
    if (networkReturn?.data?.result && networkReturn?.data?.result > 0) {
      treatments = networkReturn?.data?.result?.map((treatment, i) => {
        const shortActID = getShortActivityID(treatment);
        return {
          label: shortActID,
          title: shortActID,
          value: treatment.activity_id,
          'x-code_sort_order': i + 1
        };
      });
    }
  
    yield put({
      type: ACTIVITY_GET_SUGGESTED_TREATMENT_IDS_SUCCESS,
      payload: { suggestedTreatmentIDs: treatments, }
    });
  },
  function* handleError(e) {
    const errorMessage = 'Online activity get suggested treatment IDs request failed: ' + e.toString();
    copyToClipboard({
      message: errorMessage,
      value: errorMessage
    });
    yield put({
      type: ACTIVITY_GET_SUGGESTED_TREATMENT_IDS_FAILURE
    });
  }
);
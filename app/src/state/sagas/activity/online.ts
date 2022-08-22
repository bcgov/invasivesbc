import { Http } from "@capacitor-community/http";
import { IActivitySearchCriteria } from "interfaces/useInvasivesApi-interfaces";
import { put, select } from "redux-saga/effects";
import { ACTIVITY_GET_SUCCESS, ACTIVITY_SAVE_SUCCESS } from "state/actions";
import { selectActivity } from "state/reducers/activity";
import { selectAuthHeaders } from "state/reducers/auth";
import { selectConfiguration } from "state/reducers/configuration";
import { mapDBActivityToDoc } from "utils/addActivity";

const getRequestOptions = (config, requestHeaders) => {

    return {
      //baseUrl: config.API_BASE,
      baseUrl: 'https://api-dev-invasivesbci.apps.silver.devops.gov.bc.ca',
      headers: { 'Access-Control-Allow-Origin': '*', Authorization: requestHeaders.authorization }
    };
  };

  const checkForErrors = (response: any, status?: any, url?: any) => {
    if (response.code > 201) {
    }
  };



  function* InvasivesAPI_Call(method, endpoint, payloadData?) {
        // get config and request setup from store
        const requestOptions = yield select(selectAuthHeaders)
        const config = yield select(selectConfiguration)
        const options = getRequestOptions(config, requestOptions);
    
        const { data, status, url } = yield Http.request({
          method: method,
          headers: { ...options.headers, 'Content-Type': 'application/json' },
          url: options.baseUrl + endpoint,
          data: payloadData
        });

        return { data, status, url } 
  }



   export function* handle_ACTIVITY_GET_NETWORK_REQUEST(action) {
        const networkReturn = yield InvasivesAPI_Call('GET', `/api/activity/${action.payload.activityID}`)
        //const validatedReturn = yield checkForErrors(networkReturn)

       // const remappedBlob = yield mapDBActivityToDoc(networkReturn.data)

        yield put({ type:  ACTIVITY_GET_SUCCESS, payload: { activity: networkReturn}})
  };

   export function* handle_ACTIVITY_SAVE_NETWORK_REQUEST(action) {
        //save to server


        const oldActivity = yield select(selectActivity)
        const newActivity = { ...oldActivity.activity, formData: action.payload.updatedFormData}

      const networkReturn = yield InvasivesAPI_Call('PUT', `/api/activity/`, { ...newActivity, activity_id: oldActivity.activity.activityId})
        //const validatedReturn = yield checkForErrors(networkReturn)

//        const remappedBlob = yield mapDBActivityToDoc(networkReturn.data)

        yield put({ type:  ACTIVITY_SAVE_SUCCESS, payload: { activity: { ...newActivity, }}})
  };



  
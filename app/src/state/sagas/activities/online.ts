import { Http } from '@capacitor-community/http';
import { ActivityStatus } from 'constants/activities';
import { InvasivesAPI_Call } from 'hooks/useInvasivesApi';
import { IActivitySearchCriteria } from 'interfaces/useInvasivesApi-interfaces';
import { put, select } from 'redux-saga/effects';
import { ACTIVITIES_GEOJSON_GET_SUCCESS } from 'state/actions';
import { selectActivity } from 'state/reducers/activity';
import { selectAuthHeaders } from 'state/reducers/auth';
import { selectConfiguration } from 'state/reducers/configuration';

const checkForErrors = (response: any, status?: any, url?: any) => {
  if (response.code > 201) {
  }
};

//
export function* handle_ACTIVITIES_GEOJSON_GET_ONLINE(action) {
  const networkReturn = yield InvasivesAPI_Call(
    'POST',
    `/api/activities-lean/`,
    action.payload.activitiesFilterCriteria
  );
  yield put({
    type: ACTIVITIES_GEOJSON_GET_SUCCESS,
    payload: { recordSetID: action.payload.recordSetID, activitiesGeoJSON: networkReturn.data.result.rows }
  });
}

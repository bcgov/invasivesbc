import { put, select, take } from 'redux-saga/effects';
import { selectAuth } from 'state/reducers/auth';
import { InvasivesAPI_Call } from 'hooks/useInvasivesApi';
import { AUTH_INITIALIZE_COMPLETE, IAPP_GET_SUCCESS } from 'state/actions';

export function* handle_IAPP_GET_NETWORK_REQUEST(action) {
  const authState = yield select(selectAuth);
  if (!authState.authenticated) {
    yield take(AUTH_INITIALIZE_COMPLETE.type);
  }

  const networkReturn = yield InvasivesAPI_Call('GET', `/api/points-of-interest/`, {
    iappSiteID: action.payload.iappID,
    isIAPP: true,
    site_id_only: false
  });
  const data = networkReturn?.data?.result?.rows[0];
  yield put(IAPP_GET_SUCCESS({ iapp: data }));
}

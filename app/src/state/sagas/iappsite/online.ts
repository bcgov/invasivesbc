import { put, select, take } from 'redux-saga/effects';
import { selectAuth } from '../../reducers/auth';
import { InvasivesAPI_Call } from 'hooks/useInvasivesApi';
import { AUTH_INITIALIZE_COMPLETE } from 'state/actions';
import IappActions from 'state/actions/activity/Iapp';
import { PayloadAction } from '@reduxjs/toolkit';

export function* handle_IAPP_GET_NETWORK_REQUEST(iappId: PayloadAction<string>) {
  const { authenticated } = yield select(selectAuth);
  if (!authenticated) {
    yield take(AUTH_INITIALIZE_COMPLETE);
  }

  const networkReturn = yield InvasivesAPI_Call('GET', `/api/points-of-interest/`, {
    iappSiteID: iappId.payload,
    isIAPP: true,
    site_id_only: false
  });
  const data = networkReturn?.data?.result?.rows[0];
  yield put(IappActions.getSuccess(data));
}

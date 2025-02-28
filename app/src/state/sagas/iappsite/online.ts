import { put, select, take } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { selectAuth } from 'state/reducers/auth';
import { InvasivesAPI_Call } from 'hooks/useInvasivesApi';
import IappActions from 'state/actions/activity/Iapp';
import { AuthActions } from 'state/actions/auth/Auth';

export function* handle_IAPP_GET_NETWORK_REQUEST(iappId: PayloadAction<string>) {
  const { authenticated } = yield select(selectAuth);
  if (!authenticated) {
    yield take(AuthActions.initializeComplete.type);
  }

  const networkReturn = yield InvasivesAPI_Call('GET', `/api/points-of-interest/`, {
    iappSiteID: iappId.payload,
    isIAPP: true,
    site_id_only: false
  });
  const data = networkReturn?.data?.result?.rows[0];
  yield put(IappActions.getSuccess(data));
}

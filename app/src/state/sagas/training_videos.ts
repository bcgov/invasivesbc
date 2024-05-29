import { all, put, select, takeLatest } from 'redux-saga/effects';
import { Http } from '@capacitor-community/http';
import { TRAINING_VIDEOS_LIST_REQUEST, TRAINING_VIDEOS_LIST_REQUEST_COMPLETE } from '../actions';
import { selectConfiguration } from 'state/reducers/configuration';

function* listTrainingVideos(action) {
  const configuration = yield select(selectConfiguration);

  const { data } = yield Http.request({
    method: 'GET',
    url: configuration.API_BASE + `/api/training_videos`,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  yield put({ type: TRAINING_VIDEOS_LIST_REQUEST_COMPLETE, payload: data.result });
}

function* trainingVideosSaga() {
  yield all([takeLatest(TRAINING_VIDEOS_LIST_REQUEST, listTrainingVideos)]);
}

export default trainingVideosSaga;

import { all, put, select, takeLatest } from 'redux-saga/effects';
import { TRAINING_VIDEOS_LIST_REQUEST, TRAINING_VIDEOS_LIST_REQUEST_COMPLETE } from 'state/actions';
import { selectConfiguration } from 'state/reducers/configuration';

function* listTrainingVideos(action) {
  const configuration = yield select(selectConfiguration);

  const res = yield fetch(configuration.API_BASE + `/api/training_videos`);

  yield put({ type: TRAINING_VIDEOS_LIST_REQUEST_COMPLETE, payload: (yield res.json())?.result });
}

function* trainingVideosSaga() {
  yield all([takeLatest(TRAINING_VIDEOS_LIST_REQUEST, listTrainingVideos)]);
}

export default trainingVideosSaga;

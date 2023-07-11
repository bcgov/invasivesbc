import { all, put, takeEvery } from "redux-saga/effects";
import { appModeEnum } from "../reducers/appMode";
import { SET_APP_MODE, URL_CHANGE } from "../actions";

function* handle_SET_APP_MODE(action: any) {
  const URLMap = {
    [appModeEnum.Landing]: "landing",
    [appModeEnum.ViewAllRecords]: "explore",
    [appModeEnum.ViewOrEditRecord]: "record",
  };
  yield put({
    type: URL_CHANGE,
    payload: { url: URLMap[action.payload.mode as appModeEnum] as string },
  });
}

export function* appMode() {
  yield all([takeEvery(SET_APP_MODE, handle_SET_APP_MODE)]);
}

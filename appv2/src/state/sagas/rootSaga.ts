import { appMode } from "./appMode"
import { spawn } from 'redux-saga/effects'

export default function* rootSaga() {
    yield spawn(appMode)
  }


import { call, delay } from "redux-saga/effects"

// referenced from: https://medium.com/@bryanfillmer/keep-trying-redux-saga-style-b273882b9ec
// and mixed with "Retrying XHR Calls" from: https://redux-saga.js.org/docs/recipes/ 
export const autoRestart = (generator, handleError) => {
  return function * autoRestarting (...args: any[]) {
    let error: any;
    let i = 0;
    while(i < 5) {
      try {
        yield call(generator, ...args);
        break;
      } catch (e) {
        if (i < 4) {
          yield delay(2000);
        }
        error = e;
      }
      i++;
    }

    // failed after 5 attempts
    if (i === 5 && error) {
      yield handleError(error);
    }
  }
}
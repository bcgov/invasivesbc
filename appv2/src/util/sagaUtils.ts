import { Action } from 'redux-saga';
import { put } from 'redux-saga/effects';

export function* gracefullyFailingHandler(
  handler: (action: Action<string>) => any,
  dispatchOnFailure: string
): Generator<string> {
  return function* (action) {
    try {
      handler(action);
    } catch (e) {
      console.error(e);
      put({ type: dispatchOnFailure });
    }
  };
}

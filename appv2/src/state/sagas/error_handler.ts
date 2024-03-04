import { CRASH_HANDLE_GLOBAL_ERROR } from '../actions';
import { Http } from '@capacitor-community/http';
import { Store } from 'redux';
import { RootState } from '../reducers/rootReducer';

export function createSagaCrashHandler(storeRefHolder: { store: Store }) {
  return async (error: Error, errorInfo: { sagaStack: string }) => {
    console.error('unhandled error in saga');
    console.error(error.message);
    console.error(errorInfo.sagaStack);

    if (storeRefHolder.store == null) {
      console.error('Missing store ref when handling saga error');
      return;
    }

    const state: RootState = storeRefHolder.store.getState();

    storeRefHolder.store.dispatch({
      type: CRASH_HANDLE_GLOBAL_ERROR,
      payload: {
        detail: {
          error: JSON.parse(JSON.stringify(error)),
          errorInfo: errorInfo
        },
        actions: [
          {
            name: 'Clear app data',
            execute: () => {
              localStorage.clear();
              window.location.reload();
            }
          },
          {
            name: 'Refresh page',
            execute: () => {
              localStorage.clear();
              window.location.reload();
            }
          }
        ]
      }
    });

    if (state.Auth.authenticated) {
      let loggingState = JSON.parse(
        JSON.stringify({
          Auth: state.Auth,
          Configuration: state.Configuration,
          UserInfo: state.UserInfo,
          AppMode: state.AppMode,
          ActivityPage: state.ActivityPage,
          errorInfo,
          error
        })
      );

      await Http.request({
        method: 'POST',
        headers: {
          ...state.Auth.requestHeaders,
          'Content-Type': 'application/json'
        },
        url: state.Configuration.current.API_BASE + `/api/error/`,
        data: JSON.stringify({
          error: { message: error.message + '\n' + error.stack + '\n' + errorInfo.sagaStack },
          clientState: loggingState,
          commitHash: state.Configuration.current.COMMIT_HASH
        })
      }).then(() => {});
    }
  };
}

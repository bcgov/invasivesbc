import { CRASH_HANDLE_GLOBAL_ERROR, USER_SETTINGS_SET_API_ERROR_DIALOG } from '../actions';
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
          error: error,
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

    console.dir('made it 1');

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

      console.dir('made it 2');

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
      }).then(() => {
        console.dir('made it 4');
      });
    }
  };
}

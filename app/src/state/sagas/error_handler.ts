import { Store } from 'redux';
import { CRASH_HANDLE_GLOBAL_ERROR } from 'state/actions';
import { RootState } from 'state/reducers/rootReducer';
import { getCurrentJWT } from 'state/sagas/auth/auth';

export function createSagaCrashHandler(storeRefHolder: { store: Store | null }) {
  return async (error: Error, errorInfo: { sagaStack: string }) => {
    console.error('unhandled error in saga');
    console.error(error.message);
    console.error(error.cause);
    console.error(errorInfo.sagaStack);
    console.error(error);

    if (storeRefHolder.store == null) {
      console.error('Missing store ref when handling saga error');
      return;
    }

    const state: RootState = storeRefHolder.store.getState();

    storeRefHolder.store.dispatch(
      CRASH_HANDLE_GLOBAL_ERROR({
        detail: {
          error: JSON.parse(
            JSON.stringify({
              name: error.name,
              message: error.message,
              cause: error.cause,
              stack: error.stack
            })
          ),
          errorInfo: errorInfo
        }
      })
    );

    if (state.Auth.authenticated) {
      const loggingState = JSON.parse(
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

      await fetch(state.Configuration.current.API_BASE + `/api/error/`, {
        method: 'POST',
        headers: {
          Authorization: await getCurrentJWT(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          error: { message: error.message + '\n' + error.stack + '\n' + errorInfo.sagaStack },
          clientState: loggingState,
          commitHash: state.Configuration.current.COMMIT_HASH
        })
      });
    }
  };
}

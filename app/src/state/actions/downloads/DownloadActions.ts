import { createAsyncThunk } from '@reduxjs/toolkit';
import Alerts from '../alerts/Alerts';
import { RootState } from 'state/reducers/rootReducer';
import cacheAlertMessages from 'constants/alerts/cacheAlerts';

class DownloadActions {
  public static readonly PREFIX = 'DownloadActions';
  private static readonly BASE_DELAY_IN_MS = 2000;
  /**
   * @desc Waits for Semaphor to be available to resolve. Checks queue to avoid cutting in line
   */
  public static readonly request = createAsyncThunk(
    `${this.PREFIX}/request`,
    async (_, { getState, dispatch, requestId }) => {
      let state = (getState() as RootState).DownloadState;
      if (state.semaphores <= 0) {
        dispatch(Alerts.create(cacheAlertMessages.addedToQueue));
      }
      while (state.semaphores <= 0 || state.queue?.[0] !== requestId) {
        state = (getState() as RootState).DownloadState;
        await new Promise((resolve) =>
          setTimeout(resolve, DownloadActions.BASE_DELAY_IN_MS * (state.queue?.[0] === requestId ? 1 : 3))
        );
      }
    }
  );
}

export default DownloadActions;

import { createNextState, Draft } from '@reduxjs/toolkit';
import { RootState } from './rootReducer';
import DownloadActions from 'state/actions/downloads/DownloadActions';
import TileCache from 'state/actions/cache/TileCache';
import RecordCache from 'state/actions/cache/RecordCache';
import WellCache from 'state/actions/cache/WellCache';

const MAX_SEMAPHORS = 2;

/**
 * @property { number } semaphores Synchronization primitive
 * @property { string[] } queue Download requests in wait.
 */
interface DownloadState {
  semaphores: number;
  queue: string[];
}

const initialState: DownloadState = {
  semaphores: MAX_SEMAPHORS,
  queue: []
};

function createDownloadStateReducer(state = initialState, action) {
  return createNextState(state, (draftState: Draft<DownloadState>) => {
    if (DownloadActions.request.pending.match(action)) {
      draftState.queue = [...draftState.queue, action.meta.requestId];
    } else if (DownloadActions.request.fulfilled.match(action)) {
      draftState.semaphores--;
      draftState.queue = draftState.queue.slice(1);
    } else if (
      TileCache.requestCaching.fulfilled.match(action) ||
      TileCache.requestCaching.rejected.match(action) ||
      RecordCache.requestCaching.fulfilled.match(action) ||
      RecordCache.requestCaching.rejected.match(action) ||
      WellCache.requestCaching.fulfilled.match(action) ||
      WellCache.requestCaching.rejected.match(action)
    ) {
      draftState.semaphores++;
    }
  });
}

const selectDownloadState: (state: RootState) => DownloadState = (state) => state.DownloadState;

export { createDownloadStateReducer, selectDownloadState };

import { beforeEach, describe, expect, it } from 'vitest';
import { exportStore as store } from '../../main';
import { waitFor } from '@testing-library/react';
import { AUTH_INITIALIZE_COMPLETE, MAP_TOGGLE_BASEMAP } from 'state/actions';

describe('Can load initial record set state on startup', function () {
  // There might be a better way but this seems to work ok:
  beforeAll(async () => {
    localStorage.clear();
    require('../../main');
    await waitFor(() => {
      expect(store).toBeDefined();
    });
  });

  it('Can load initial default record sets on first visit', async function () {
    const state = store.getState();

    //fake logging in:
    store.dispatch({type: AUTH_INITIALIZE_COMPLETE, payload: {authenticated: true}})

    const numberOfSets = Object.keys(state.UserSettings.recordSets).length;
    await waitFor(() => {
      expect(numberOfSets).toBe(3);
    });
  });
});

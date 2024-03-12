import { beforeEach, describe, expect, it } from 'vitest';
import { exportStore as store } from '../../../../main';
import { waitFor } from '@testing-library/react';
import { AUTH_INITIALIZE_COMPLETE, MAP_TOGGLE_BASEMAP, RECORDSET_UPDATE_FILTER } from 'state/actions';

describe('Can load initial record set state on startup (first visit)', function () {
  // There might be a better way but this seems to work ok:
  beforeAll(async () => {
    localStorage.clear();
    require('../../../../main');
    await waitFor(() => {
      expect(store).toBeDefined();
    });
  });

  it('Can load initial 3 record sets on first visit', async function () {
    store.dispatch({ type: AUTH_INITIALIZE_COMPLETE, payload: { authenticated: true } });


    await waitFor(() => {
      expect(store.getState()?.UserSettings?.recordSets).toBeDefined();
    });
    await waitFor(() => {
      expect(Object.keys(store.getState()?.UserSettings?.recordSets).length).toEqual(3);
    });
  });
});

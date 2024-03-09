import { beforeEach, describe, expect, it } from 'vitest';
import { exportStore as store } from '../../../main';
import { waitFor } from '@testing-library/react';
import { AUTH_INITIALIZE_COMPLETE, MAP_TOGGLE_BASEMAP } from 'state/actions';

describe('Can load initial record set layer state on startup', function () {
  // There might be a better way but this seems to work ok:
  beforeAll(async () => {
    localStorage.clear();
    require('../../../main');
    await waitFor(() => {
      expect(store).toBeDefined();
    });
  });

  it('Can load initial 3 record set layers on first visit', async function () {
    store.dispatch({ type: AUTH_INITIALIZE_COMPLETE, payload: { authenticated: true } });
    await waitFor(() => {
      expect(store.getState()?.Map?.layers).toBeDefined()
      expect(store.getState()?.Map?.layers.length).toEqual(3)
      expect(store.getState()?.Map?.layers[0].geoJSON).toBeDefined()
      expect(store.getState()?.Map?.layers[1].geoJSON).toBeDefined()
      expect(store.getState()?.Map?.layers[2].geoJSON).toBeDefined()
    });
  });
});
import { describe, expect, it } from 'vitest';
import { exportStore as store } from '../../../../main';
import { waitFor } from '@testing-library/react';
import { AUTH_INITIALIZE_COMPLETE, MAP_TOGGLE_GEOJSON_CACHE } from 'state/actions';
import { server } from 'mocks/server';

describe('Can load initial record set state on startup (first visit)', function () {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterAll(() => server.close());
  afterEach(() => server.resetHandlers());
  // There might be a better way but this seems to work ok:
  beforeAll(async () => {
    localStorage.clear();
    require('../../../../main');
    await waitFor(() => {
      expect(store).toBeDefined();
      const MapMode = store.getState().Map.MapMode;
      if (MapMode !== 'VECTOR_ENDPOINT') {
        store.dispatch(MAP_TOGGLE_GEOJSON_CACHE());
      }
      expect(store.getState().Map.MapMode).toEqual('VECTOR_ENDPOINT');
    });
  });

  it('Can load initial 3 record sets on first visit', async function () {
    store.dispatch(AUTH_INITIALIZE_COMPLETE({ authenticated: true }));

    await waitFor(() => {
      expect(store.getState()?.UserSettings?.recordSets).toBeDefined();
    });
    await waitFor(() => {
      expect(Object.keys(store.getState()?.UserSettings?.recordSets).length).toEqual(3);
    });
  });
});

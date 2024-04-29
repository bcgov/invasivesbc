import { beforeEach, describe, expect, it } from 'vitest';
import { exportStore as store } from '../../../main';
import { waitFor } from '@testing-library/react';
import { AUTH_INITIALIZE_COMPLETE, MAP_TOGGLE_BASEMAP, RECORDSET_UPDATE_FILTER, URL_CHANGE } from 'state/actions';
import { server } from 'mocks/server';

describe('Can trigger refetch for both table and data on filter change', function () {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
  afterAll(() => server.close())
  afterEach(() => server.resetHandlers())

  beforeAll(async () => {
    localStorage.clear();
    require('../../../main');
    await waitFor(() => {
      expect(store).toBeDefined();
    });
  });

  it('Can loads recordset on open / url visit', async function () {
    store.dispatch({ type: AUTH_INITIALIZE_COMPLETE, payload: { authenticated: true } });
    store.dispatch({
      type: URL_CHANGE,
      payload: {
        url: '/Records/List/Local:2'
      }
    });
    //setup
    await waitFor(() => {
      expect(store.getState()?.Map.recordTables).toBeDefined();
      expect(store.getState()?.Map.recordTables[2]).toBeDefined();
      expect(store.getState()?.UserSettings?.recordSets?.[2]).toBeDefined();
      //TODO undefined on init:
      //expect(store.getState()?.UserSettings?.recordSets?.[2].tableFiltersHash).toBeDefined();
    });

    await waitFor(() => {
      // the minimum is there
      expect(store.getState()?.Map?.layers).toBeDefined();
      const layerIndex = store.getState()?.Map.layers.findIndex((l) => l.recordSetID === '2');
      expect(layerIndex).toBeGreaterThan(-1);
      expect(store.getState()?.Map.layers[layerIndex]).toBeDefined();

      // matching hashes - some in app code to improve here for 'on init'
      /*
      expect(store.getState()?.Map?.layers[layerIndex].tableFiltersHash).toEqual(
        store.getState()?.UserSettings?.recordSets?.[2].tableFiltersHash
      );
      expect(store.getState()?.Map?.recordTables[2].tableFiltersHash).toEqual(
        store.getState()?.UserSettings?.recordSets?.[2].tableFiltersHash
      );
      */

      // they're loaded
      expect(!store.getState()?.Map?.layers[layerIndex].loading).toBeTruthy();
      expect(!store.getState()?.Map?.recordTables[2].loading).toBeTruthy();

      // they have the data
      expect(store.getState()?.Map.recordTables[2].rows).toBeDefined();
      expect(store.getState()?.Map?.layers[layerIndex].geoJSON).toBeDefined();
      expect(store.getState()?.Map?.layers[layerIndex].IDList).toBeDefined();
    });
  })
});

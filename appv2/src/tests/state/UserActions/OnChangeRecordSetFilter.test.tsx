import { beforeEach, describe, expect, it } from 'vitest';
import { exportStore as store } from '../../../main';
import { waitFor } from '@testing-library/react';
import { AUTH_INITIALIZE_COMPLETE, MAP_TOGGLE_BASEMAP, RECORDSET_UPDATE_FILTER, URL_CHANGE } from 'state/actions';

describe('Can trigger refetch for both table and data on filter change', function () {
  // There might be a better way but this seems to work ok:
  beforeAll(async () => {
    localStorage.clear();
    require('../../../main');
    await waitFor(() => {
      expect(store).toBeDefined();
    });
  });

  it('is is ready for user to enter filter', async function () {
    store.dispatch({ type: AUTH_INITIALIZE_COMPLETE, payload: { authenticated: true } });

    // open / view set:
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
      //expect(store.getState()?.UserSettings?.recordSets?.[2].tableFiltersHash).toBeDefined();
    });
  });


  it('doesnt crash on user data entry', async function () {
    store.dispatch({
      type: RECORDSET_UPDATE_FILTER,
      payload: {
        filterType: 'tableFilter',
        setID: '2',
        filterID: '0.48654626556517731710017354903',
        filter: '23'
      }
    });
    await waitFor(() => {
      // TODO look at filter value in state and localstorage
    });
  });

  it.todo('updates state and local storage with user choice', async function () {
    await waitFor(() => {
      // TODO look at filter value in state and localstorage
    });
  });


  it('reloaded the table data', async function () {
    await waitFor(() => {
      // the minimum is there
      expect(store.getState()?.UserSettings?.recordSets?.[2].tableFiltersHash !== 'init').toBeTruthy();

      // they're loaded
      expect(!store.getState()?.Map?.recordTables[2].loading).toBeTruthy();

      // they have the data
      expect(store.getState()?.Map.recordTables[2].rows).toBeDefined();
    });
  });
  it('reloaded the map data', async function () {
    await waitFor(() => {
      expect(store.getState()?.Map?.layers).toBeDefined();
      const layerIndex = store.getState()?.Map.layers.findIndex((l) => l.recordSetID === '2');
      expect(layerIndex).toBeGreaterThan(-1);
      expect(store.getState()?.Map.layers[layerIndex]).toBeDefined();

      // they're loaded
      expect(!store.getState()?.Map?.layers[layerIndex].loading).toBeTruthy();

      // they have the data
      expect(store.getState()?.Map?.layers[layerIndex].geoJSON).toBeDefined();
      expect(store.getState()?.Map?.layers[layerIndex].IDList).toBeDefined();
    });
  });
  it('has matching hashes for the filters marked on both the layer and table in state', async function () {
    await waitFor(() => {
      expect(store.getState()?.UserSettings?.recordSets?.[2].tableFiltersHash !== 'init').toBeTruthy();
      const layerIndex = store.getState()?.Map.layers.findIndex((l) => l.recordSetID === '2');
      expect(layerIndex).toBeGreaterThan(-1);

      // matching hashes
      expect(store.getState()?.Map?.layers[layerIndex].tableFiltersHash).toEqual(
        store.getState()?.UserSettings?.recordSets?.[2].tableFiltersHash
      );
      expect(store.getState()?.Map?.recordTables[2].tableFiltersHash).toEqual(
        store.getState()?.UserSettings?.recordSets?.[2].tableFiltersHash
      );
    });
  });
});

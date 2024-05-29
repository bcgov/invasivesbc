import { beforeEach, describe, expect, it } from 'vitest';
import { exportStore as store } from '../../../main';
import { waitFor } from '@testing-library/react';
import {
  AUTH_INITIALIZE_COMPLETE,
  MAP_TOGGLE_BASEMAP,
  MAP_TOGGLE_GEOJSON_CACHE,
  RECORDSET_REMOVE_FILTER,
  RECORDSET_UPDATE_FILTER,
  URL_CHANGE
} from 'state/actions';
import { server } from 'mocks/server';

describe('Can trigger refetch for both table and data on filter change', function () {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterAll(() => server.close());
  afterEach(() => server.resetHandlers());
  // There might be a better way but this seems to work ok:
  beforeAll(async () => {
    localStorage.clear();
    require('../../../main');
    await waitFor(() => {
      expect(store).toBeDefined();
      const MapMode = store.getState().Map.MapMode;
      if (MapMode !== 'VECTOR_ENDPOINT') {
        store.dispatch({ type: MAP_TOGGLE_GEOJSON_CACHE });
      }
      expect(store.getState().Map.MapMode).toEqual('VECTOR_ENDPOINT');
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

  it('can deal with adding a spatial filter', async function () {
    const initialHash = store.getState()?.UserSettings?.recordSets?.[2].tableFiltersHash;

    store.dispatch({
      type: 'DRAW_CUSTOM_LAYER',
      payload: {
        name: 'asdf'
      }
    });

    store.dispatch({
      type: 'MAP_ON_SHAPE_UPDATE',
      payload: {
        id: 'e9a187d93daa876620f61dcc1b19504b',
        type: 'Feature',
        properties: {},
        geometry: {
          coordinates: [
            [
              [-120.7501971511349, 50.2442379145015],
              [-121.09256095635726, 50.47843473357389],
              [-121.46379881744173, 50.79237808126777],
              [-120.93581608167713, 50.98233533463562],
              [-119.94997331724156, 51.11717521294361],
              [-119.11262569723993, 50.66443782889749],
              [-119.17862353921058, 49.97175740423285],
              [-120.5439538949768, 50.00093122045391],
              [-120.7501971511349, 50.2442379145015]
            ]
          ],
          type: 'Polygon'
        }
      }
    });

    store.dispatch({
      type: 'RECORDSET_ADD_FILTER',
      payload: {
        filterType: 'tableFilter',
        field: 'short_id',
        setID: '2',
        operator: 'CONTAINS',
        blockFetchForNow: true
      }
    });

    const clientBoundaryID = store.getState()?.Map.clientBoundaries[0].id;
    const filterID = store.getState()?.UserSettings?.recordSets?.[2].tableFilters[0].id;

    store.dispatch({
      type: 'RECORDSET_UPDATE_FILTER',
      payload: {
        filterType: 'spatialFilterDrawn',
        setID: '2',
        filterID: filterID,
        filter: clientBoundaryID
      }
    });

    await waitFor(() => {
      // the minimum is there
      expect(store.getState()?.UserSettings?.recordSets?.[2].tableFiltersHash !== initialHash).toBeTruthy();

      // they're loaded
      expect(!store.getState()?.Map?.recordTables[2].loading).toBeTruthy();

      // they have the data
      expect(store.getState()?.Map.recordTables[2].rows).toBeDefined();

      expect(store.getState()?.Map?.layers).toBeDefined();
      const layerIndex = store.getState()?.Map.layers.findIndex((l) => l.recordSetID === '2');
      expect(layerIndex).toBeGreaterThan(-1);
      expect(store.getState()?.Map.layers[layerIndex]).toBeDefined();

      // they're loaded
      expect(!store.getState()?.Map?.layers[layerIndex].loading).toBeTruthy();

      // they have the data
      expect(store.getState()?.Map?.layers[layerIndex].IDList).toBeDefined();

      // matching hashes
      expect(store.getState()?.Map?.layers[layerIndex].tableFiltersHash).toEqual(
        store.getState()?.UserSettings?.recordSets?.[2].tableFiltersHash
      );
      expect(store.getState()?.Map?.recordTables[2].tableFiltersHash).toEqual(
        store.getState()?.UserSettings?.recordSets?.[2].tableFiltersHash
      );
    });
  });

  it('has a new filter hash after deleting spatial filter', async function () {
    const initialHash = store.getState()?.UserSettings?.recordSets?.[2].tableFiltersHash;
    const filterID = store.getState()?.UserSettings?.recordSets?.[2].tableFilters[0].id;

    console.log('filterID', filterID);
    console.log(initialHash);

    store.dispatch({
      type: RECORDSET_REMOVE_FILTER,
      payload: {
        filterType: 'spatialFilterDrawn',
        setID: '2',
        filterID: filterID
      }
    });

    await waitFor(() => {
      // there is a new filter hash
      expect(store.getState()?.UserSettings?.recordSets?.[2].tableFiltersHash !== initialHash).toBeTruthy();
      console.log(store.getState()?.UserSettings?.recordSets?.[2].tableFiltersHash);
      // the table and layer are reloaded and have matching hashes to the recordset
    });
  });
});

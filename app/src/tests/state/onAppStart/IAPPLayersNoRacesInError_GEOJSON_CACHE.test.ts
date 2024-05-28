import { beforeEach, describe, expect, it } from 'vitest';
import { exportStore as store } from '../../../main';
import { waitFor } from '@testing-library/react';
import {
  AUTH_INITIALIZE_COMPLETE,
  IAPP_GEOJSON_GET_SUCCESS,
  IAPP_RECORDSET_ID_LIST_GET_SUCCESS,
  MAP_TOGGLE_BASEMAP,
  MAP_TOGGLE_GEOJSON_CACHE,
  RECORDSET_ADD_FILTER,
  RECORDSET_UPDATE_FILTER
} from 'state/actions';
import { server, runServer, overRideRunningServer, customServer } from 'mocks/server';
import { IAPPS3Repsonse_Mock } from 'sharedAPI/src/openapi/api-doc/util/mocks/mock_handlers';

describe('Can load IAPP layer regardless of ID call or GeoJSON call happening first', function () {
  runServer(server);

  const overRideHandlers = [
    {
      method: 'get',
      url: process.env['IAPP_GEOJSON_URL'],
      req: null,
      responseBody: IAPPS3Repsonse_Mock(null),
      status: 200
    }
  ];
  overRideRunningServer(server, customServer(overRideHandlers));

  // There might be a better way but this seems to work ok:
  beforeAll(async () => {
    localStorage.clear();
    require('../../../main');
    await waitFor(() => {
      expect(store).toBeDefined();

      const MapMode = store.getState().Map.MapMode;
      if (MapMode === 'VECTOR_ENDPOINT') {
        store.dispatch({ type: MAP_TOGGLE_GEOJSON_CACHE });
      }
      expect(store.getState().Map.MapMode).toEqual('GEOJSON');
    });
  });

  it('Loads ok with whatever happens by default in test', async function () {
    console.log('IAPP_GEOJSON_URL');
    console.log(store.getState().Configuration?.current?.IAPP_GEOJSON_URL);
    //fake login
    store.dispatch({ type: AUTH_INITIALIZE_COMPLETE, payload: { authenticated: true } });

    await waitFor(() => {
      //make sure the recordsets are loaded:
      expect(store.getState().UserSettings.recordSets?.[3]).toBeDefined();
    });

    //fake being on the record set, user can't change filters when they aren't there and some code assumes that:
    store.dispatch({
      type: 'URL_CHANGE',
      payload: {
        url: '/Records/List/Local:3'
      }
    });

    // Wait for the initial load:
    await waitFor(() => {
      expect(store.getState()?.Map?.IAPPGeoJSONDict).toBeDefined();

      // global geojson and ID list both have site_ID 1:
      expect(store.getState()?.Map?.IAPPGeoJSONDict[1]).toBeDefined();
      const iappLayer = store.getState()?.Map?.layers.findIndex((l) => l.recordSetID === '3');
      expect(store.getState().Map.layers[iappLayer].IDList.includes(1)).toBeTruthy();

      // layer has ID 1:
      expect(
        store.getState()?.Map?.layers?.[iappLayer]?.geoJSON?.features?.[0]?.properties?.site_id,
        'No features in layer'
      ).toEqual(1);
    });

    //Fake a late load of geojson
    store.dispatch({
      type: IAPP_GEOJSON_GET_SUCCESS,
      payload: {
        IAPPGeoJSON: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: { type: 'Point', coordinates: [-123.365556, 48.428611] },
              properties: {
                site_id: 123456
              }
            }
          ]
        }
      }
    });
  });

  it('Loads ok with ID call happening first', async function () {
    //make sure the recordsets are loaded:
    await waitFor(() => {
      expect(store.getState().UserSettings.recordSets?.[3]).toBeDefined();
    });
    // get a new table hash:
    store.dispatch({
      type: 'RECORDSET_ADD_FILTER',
      payload: {
        filterType: 'tableFilter',
        field: 'site_id',
        setID: '3',
        operator: 'CONTAINS',
        blockFetchForNow: true
      }
    });

    // get the filter id from usersettings
    await waitFor(() => {
      const filterID = store.getState().UserSettings.recordSets?.[3].tableFilters?.[0]?.id;
      expect(filterID).toBeDefined();
    });
    const layerIndex = store.getState()?.Map?.layers.findIndex((l) => l.recordSetID === '3');
    const filterHash = store.getState().Map.layers[layerIndex].tableFiltersHash;

    //fake the ID get:
    store.dispatch({
      type: 'IAPP_GET_IDS_FOR_RECORDSET_SUCCESS',
      payload: {
        recordSetID: '3',
        IDList: [123456],
        tableFiltersHash: filterHash
      }
    });

    await waitFor(() => {
      expect(store.getState()?.Map?.layers[layerIndex].IDList.includes(123456)).toBeTruthy();
    });

    // now fake the geojson get happening late:
    store.dispatch({
      type: IAPP_GEOJSON_GET_SUCCESS,
      payload: {
        IAPPGeoJSON: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: { type: 'Point', coordinates: [-123.365556, 48.428611] },
              properties: {
                site_id: 123456
              }
            }
          ]
        }
      }
    });

    await waitFor(() => {
      const layerIndex = store.getState()?.Map?.layers.findIndex((l) => l.recordSetID === '3');
      expect(store.getState()?.Map?.layers[layerIndex].IDList.includes(123456)).toBeTruthy();
      expect(store.getState()?.Map?.layers[layerIndex].geoJSON.features[0].properties.site_id).toEqual(123456);
    });
  });

  it('Loads ok with GeoJSON call happening first', async function () {
    //fake the geojson get happening late:
    store.dispatch({
      type: IAPP_GEOJSON_GET_SUCCESS,
      payload: {
        IAPPGeoJSON: {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              geometry: { type: 'Point', coordinates: [-123.365556, 48.428611] },
              properties: {
                site_id: 123457
              }
            }
          ]
        }
      }
    });
    await waitFor(() => {
      expect(store.getState()?.Map?.IAPPGeoJSONDict[123457]).toBeDefined();
    });

    const layerIndex = store.getState()?.Map?.layers.findIndex((l) => l.recordSetID === '3');
    const filterHash = store.getState().Map.layers[layerIndex].tableFiltersHash;

    //fake the ID get:
    store.dispatch({
      type: 'IAPP_GET_IDS_FOR_RECORDSET_SUCCESS',
      payload: {
        recordSetID: '3',
        IDList: [1234567],
        tableFiltersHash: filterHash
      }
    });

    await waitFor(() => {
      expect(store.getState()?.Map?.layers[layerIndex].IDList.includes(1234567)).toBeTruthy();
    });
    await waitFor(() => {
      const layerIndex = store.getState()?.Map?.layers.findIndex((l) => l.recordSetID === '3');
      expect(store.getState()?.Map?.layers[layerIndex].IDList.includes(1234567)).toBeTruthy();
    });
  });
});

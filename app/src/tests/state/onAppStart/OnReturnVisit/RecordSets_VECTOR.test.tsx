import { beforeEach, describe, expect, it } from 'vitest';
import { exportStore as store } from '../../../../main';
import { waitFor } from '@testing-library/react';
import {
  AUTH_INITIALIZE_COMPLETE,
  MAP_TOGGLE_BASEMAP,
  MAP_TOGGLE_GEOJSON_CACHE,
  RECORDSET_UPDATE_FILTER
} from 'state/actions';
import { server } from 'mocks/server';

describe('Can load initial record set state on startup (return visit)', function () {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterAll(() => server.close());
  afterEach(() => server.resetHandlers());
  // There might be a better way but this seems to work ok:
  beforeAll(async () => {
    localStorage.clear();
    localStorage.setItem(
      'appstate-invasivesbc',
      JSON.stringify({
        recordSets: {
          '1': {
            recordSetType: 'Activity',
            recordSetName: 'My Drafts',
            tableFilters: [{ id: '1', field: 'form_status', filterType: 'tableFilter', filter: 'Draft' }],
            colorScheme: {
              Biocontrol: '#845ec2',
              FREP: '#de852c',
              Monitoring: '#2138e0',
              Observation: '#399c3e',
              Treatment: '#c6c617'
            },
            drawOrder: 1,
            mapToggle: true
          },
          '2': {
            recordSetType: 'Activity',
            recordSetName: 'All InvasivesBC Activities',
            colorScheme: {
              Biocontrol: '#845ec2',
              FREP: '#de852c',
              Monitoring: '#2138e0',
              Observation: '#399c3e',
              Treatment: '#c6c617'
            },
            drawOrder: 2,
            mapToggle: true,
            labelToggle: false,
            tableFilters: [
              {
                id: '0.0242329094757871571710201907771',
                field: 'short_id',
                filterType: 'tableFilter',
                operator: 'CONTAINS',
                filter: '23'
              }
            ],
            tableFiltersPreviousHash: '571fd56d92ba04108ead4834676bb7e9',
            tableFiltersHash: '8329ba814bac6c00f70a3a2a252b74b0'
          },
          '3': {
            recordSetType: 'IAPP',
            recordSetName: 'All IAPP Records',
            color: '#21f34f',
            drawOrder: 3,
            mapToggle: false
          },
          '4': {
            tableFilters: [],
            color: '#FFD326',
            drawOrder: 0,
            mapToggle: true,
            recordSetName: 'New Recordset - Activity',
            recordSetType: 'Activity',
            labelToggle: true
          },
          '5': {
            tableFilters: [],
            color: '#CB2B3E',
            drawOrder: 0,
            mapToggle: false,
            recordSetName: 'New Recordset - IAPP',
            recordSetType: 'IAPP'
          }
        }
      })
    );
    require('../../../../main');
    await waitFor(() => {
      expect(store).toBeDefined();
      const MapMode = store.getState().Map.MapMode;
      if (MapMode !== 'VECTOR_ENDPOINT') {
        store.dispatch({ type: MAP_TOGGLE_GEOJSON_CACHE });
      }
      expect(store.getState().Map.MapMode).toEqual('VECTOR_ENDPOINT');
    });
  });

  it('Can load default and previously saved custom recordsets', async function () {
    store.dispatch({ type: AUTH_INITIALIZE_COMPLETE, payload: { authenticated: true } });

    await waitFor(() => {
      expect(store.getState()?.UserSettings?.recordSets).toBeDefined();
    });
    await waitFor(() => {
      expect(Object.keys(store.getState()?.UserSettings?.recordSets).length).toEqual(5);
    });
  });

  it('Restored filters are correct', async function () {
    await waitFor(() => {
      expect(store.getState()?.UserSettings?.recordSets['2'].tableFilters).toBeDefined();
      expect(store.getState()?.UserSettings?.recordSets['2'].tableFilters.length).toEqual(1);
      expect(store.getState()?.UserSettings?.recordSets['2'].tableFilters[0].filter).toEqual('23');
    });
  });
});

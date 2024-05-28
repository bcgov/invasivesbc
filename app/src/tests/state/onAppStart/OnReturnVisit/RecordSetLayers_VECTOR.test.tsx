import { beforeEach, describe, expect, it } from 'vitest';
import { exportStore as store } from '../../../../main';
import { waitFor } from '@testing-library/react';
import { AUTH_INITIALIZE_COMPLETE, MAP_TOGGLE_BASEMAP, MAP_TOGGLE_GEOJSON_CACHE } from 'state/actions';
import { server } from 'mocks/server';

describe('Can load initial record set layer state on return visit', function () {
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

  it('Can load default and previous custom record set layers on return visit', async function () {
    store.dispatch({ type: AUTH_INITIALIZE_COMPLETE, payload: { authenticated: true } });
    await waitFor(() => {
      expect(store.getState()?.Map?.layers).toBeDefined();
      expect(store.getState()?.Map?.layers.length).toEqual(5);
      expect(store.getState()?.Map?.layers[0]).toBeDefined();
      expect(store.getState()?.Map?.layers[3]).toBeDefined();
      expect(store.getState()?.Map?.layers[4]).toBeDefined();
    });
  });

  it('custom IAPP layer has right color', async function () {
    await waitFor(() => {
      expect(store.getState()?.Map?.layers[4].layerState.color).toEqual('#CB2B3E'); //green
    });
  });

  it('custom activity layer has right color', async function () {
    await waitFor(() => {
      expect(store.getState()?.Map?.layers[3].layerState.color).toEqual('#FFD326'); //green
    });
  });

  it('Draft & Activity default layers still have color scheme loaded', async function () {
    await waitFor(() => {
      expect(store.getState()?.Map?.layers[0].layerState.colorScheme).toEqual({
        Biocontrol: '#845ec2',
        FREP: '#de852c',
        Monitoring: '#2138e0',
        Observation: '#399c3e',
        Treatment: '#c6c617'
      });
      expect(store.getState()?.Map?.layers[1].layerState.colorScheme).toEqual({
        Biocontrol: '#845ec2',
        FREP: '#de852c',
        Monitoring: '#2138e0',
        Observation: '#399c3e',
        Treatment: '#c6c617'
      });
    });
  });
});

import { beforeEach, describe, expect, it } from 'vitest';
import { exportStore as store } from '../../../../main';
import { waitFor } from '@testing-library/react';
import { AUTH_INITIALIZE_COMPLETE, MAP_TOGGLE_BASEMAP, MAP_TOGGLE_GEOJSON_CACHE } from 'state/actions';
import { server } from 'mocks/server';

describe('Can load initial record set layer state on startup', function () {
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
        store.dispatch({ type: MAP_TOGGLE_GEOJSON_CACHE });
        expect(store.getState().Map.MapMode).toEqual('VECTOR_ENDPOINT');
      }

    });
  });

  it('Can load initial 3 record set layers on first visit', async function () {
    store.dispatch({ type: AUTH_INITIALIZE_COMPLETE, payload: { authenticated: true } });
    await waitFor(() => {
      expect(store.getState()?.Map?.layers).toBeDefined();
      expect(store.getState()?.Map?.layers.length).toEqual(3);
      expect(store.getState()?.Map?.layers[0]).toBeDefined();
      expect(store.getState()?.Map?.layers[1]).toBeDefined();
      expect(store.getState()?.Map?.layers[2]).toBeDefined();
    });
  });

  it('IAPP layer has right color', async function () {
    await waitFor(() => {
      expect(store.getState()?.Map?.layers[2].layerState.color).toEqual('#21f34f'); //green
    });
  });

  it('Draft & Activity default layers have color scheme loaded', async function () {
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

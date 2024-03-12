import { beforeEach, describe, expect, it } from 'vitest';
import { exportStore as store } from '../../../../main';
import { waitFor } from '@testing-library/react';
import { AUTH_INITIALIZE_COMPLETE, MAP_TOGGLE_BASEMAP } from 'state/actions';

describe('Can load initial record set layer state on startup', function () {
  // There might be a better way but this seems to work ok:
  beforeAll(async () => {
    localStorage.clear();
    require('../../../../main');
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

  it('IAPP layer has right color', async function () {
    await waitFor(() => {
      expect(store.getState()?.Map?.layers[2].layerState.color).toEqual('#21f34f') //green
    })
  })


  it('Draft & Activity default layers have color scheme loaded', async function () {
    await waitFor(() => {
      expect(store.getState()?.Map?.layers[0].layerState.colorScheme).toEqual({
      Biocontrol: '#845ec2',
      FREP: '#de852c',
      Monitoring: '#2138e0',
      Observation: '#399c3e',
      Treatment: '#c6c617'
    })
      expect(store.getState()?.Map?.layers[1].layerState.colorScheme).toEqual({
      Biocontrol: '#845ec2',
      FREP: '#de852c',
      Monitoring: '#2138e0',
      Observation: '#399c3e',
      Treatment: '#c6c617'
    })
  })
  })
});
import { beforeEach, describe, expect, it } from 'vitest';
import { store } from '../main';
import { waitFor } from '@testing-library/react';
import { MAP_TOGGLE_BASEMAP } from 'state/actions';

describe('App init state, pre-login', function () {
  beforeEach(async () => {
    require('../main');

    await waitFor(() => {
      expect(store).toBeDefined();
    });
  });

  it('Map array has expected layers logged out', function () {
    const state = store.getState();

    const mapLayerArrayLength = state.Map.layers.length
    expect(mapLayerArrayLength).toBe(0);
  });


  it('Map state lets you toggle topo/sat', () => {
    store.dispatch({type: MAP_TOGGLE_BASEMAP})
    const state = store.getState();
    expect(state.Map.baseMapToggle).toBe(true)
    store.dispatch({type: MAP_TOGGLE_BASEMAP})
    const state2 = store.getState();
    expect(state2.Map.baseMapToggle).toBe(false)
  })

});
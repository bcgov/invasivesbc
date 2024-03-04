import { beforeEach, describe, expect, it } from 'vitest';
import { store } from '../main';
import { waitFor } from '@testing-library/react';
import { MAP_TOGGLE_BASEMAP } from 'state/actions';


describe('App init state, pre-login', function () {

  // There might be a better way but this seems to work ok:
  beforeEach(async () => {
    require('../main');
    await waitFor(() => {
      expect(store).toBeDefined();
    });
  });

  it('Map array has expected layers logged out', function () {
    const state = store.getState();
    expect(state.Map.layers.length).toBe(0);
  });

  it('Map state lets you toggle topo/sat', () => {
    let state = store.getState();
    // Init val:
    expect(state.Map.baseMapToggle).toBe(false)

    // On toggle:
    store.dispatch({type: MAP_TOGGLE_BASEMAP})
    state = store.getState();
    expect(state.Map.baseMapToggle).toBe(true)
  })
});
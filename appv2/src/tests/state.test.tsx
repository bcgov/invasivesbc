import { beforeEach, describe, expect, it } from 'vitest';
import { store } from '../main';
import { waitFor } from '@testing-library/react';

describe('App init state, pre-login', function () {
  beforeEach(async () => {
    require('../main');

    await waitFor(() => {
      expect(store).toBeDefined();
    });
  });

  it('Map array has expected layers logged out', function () {
    const state = store.getState();

    // We don't pass state.Map directly to expect or else it logs the whole state blob
    const mapLayerArrayLength = state.Map.layers.length
    expect(mapLayerArrayLength).toBe(0);
  });

});
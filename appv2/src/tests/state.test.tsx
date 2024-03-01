import { beforeEach, describe, expect, it } from 'vitest';
import { globalStore } from '../state/store';
import App from '../UI/App';
import { render } from '@testing-library/react';
import React from 'react';

describe('app state', function () {
  beforeEach(() => {
    render(<App />);
  });

  it('initializes', function () {
    const state = globalStore.getState();
    expect(state.Map.layers.length).toBe(0);
  });
});

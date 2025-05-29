import { act, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AccuracyToggle } from 'UI/Features/LegacyMap/Controls/AccuracyToggle';
import { configureStore } from '@reduxjs/toolkit';
import { Provider } from 'react-redux';

const configurationReducer =
  () =>
  (
    state = {
      accuracyToggle: true,
      positionTracking: true
    }
  ) =>
    state;
const createMockStore = () =>
  configureStore({
    reducer: {
      Map: configurationReducer()
    }
  });

const store = createMockStore();

describe('AccuracyToggle.tsx', () => {
  it('should toggle className with accuracyToggle state', async () => {
    const { container, getByRole } = render(
      <Provider store={store}>
        <AccuracyToggle />
      </Provider>
    );
    expect(container.querySelector('map-btn-selected')).toBe(null);
    act(() => {
      userEvent.click(getByRole('button'));
    });

    await waitFor(() => {
      expect(container.querySelector('map-btn-selected')).toBeDefined();
    });
  });
});

import { render, waitFor } from '@testing-library/react';
import AccuracyDisplay from './AccuracyDisplay';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

const configurationReducerRender =
  () =>
  (
    state = {
      accuracyToggle: true,
      positionTracking: true,
      userCoords: {
        lat: 54.1,
        long: -121.3,
        accuracy: 3,
        heading: 20
      }
    }
  ) =>
    state;
const configurationReducerNullRender =
  () =>
  (
    state = {
      accuracyToggle: false,
      positionTracking: true,
      userCoords: {
        lat: 54.1,
        long: -121.3,
        accuracy: 3,
        heading: 20
      }
    }
  ) =>
    state;
const createMockStore = (reducerCase) =>
  configureStore({
    reducer: {
      Map: reducerCase
    }
  });

describe('AccuracyDisplay.tsx', () => {
  it('should render', async () => {
    const store = createMockStore(configurationReducerRender);
    const { getByText } = render(
      <Provider store={store}>
        <AccuracyDisplay />
      </Provider>
    );
    waitFor(() => {
      expect(getByText(/GPS Accuracy:/)).toBeDefined();
    });
  });

  it('should return blank if "accuracyToggle" is false', async () => {
    const store = createMockStore(configurationReducerNullRender);
    const { queryByText } = render(
      <Provider store={store}>
        <AccuracyDisplay />
      </Provider>
    );
    waitFor(() => {
      expect(queryByText(/GPS Accuracy:/)).toBeNull();
    });
  });
});

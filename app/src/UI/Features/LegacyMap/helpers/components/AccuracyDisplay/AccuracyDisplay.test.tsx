import { render, waitFor } from '@testing-library/react';
import AccuracyDisplay from 'UI/Features/LegacyMap/helpers/components/AccuracyDisplay/AccuracyDisplay';
import { Provider } from 'react-redux';
import { createMockStore, mockSliceReducer } from 'test/testUtils';

describe('AccuracyDisplay.tsx', () => {
  const accuracyOnStore = createMockStore({
    ...mockSliceReducer('Map', {
      positionTracking: true,
      userCoords: {
        lat: 54.1,
        long: -121.3,
        accuracy: 3,
        heading: 20
      }
    })
  });
  const accuracyOffStore = createMockStore({
    ...mockSliceReducer('Map', {
      positionTracking: true,
      userCoords: {
        lat: 54.1,
        long: -121.3,
        accuracy: 3,
        heading: 20
      }
    })
  });
  it('should render', async () => {
    const { getByText } = render(
      <Provider store={accuracyOnStore}>
        <AccuracyDisplay />
      </Provider>
    );
    waitFor(() => {
      expect(getByText(/GPS Accuracy:/)).toBeDefined();
    });
  });

  it('should return blank if "accuracyToggle" is false', async () => {
    const { queryByText } = render(
      <Provider store={accuracyOffStore}>
        <AccuracyDisplay />
      </Provider>
    );
    waitFor(() => {
      expect(queryByText(/GPS Accuracy:/)).toBeNull();
    });
  });
});

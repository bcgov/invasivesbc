import { act, render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AccuracyToggle } from 'UI/Features/LegacyMap/Controls/AccuracyToggle';
import { Provider } from 'react-redux';
import { createMockStore, mockSliceReducer } from 'test/testUtils';

const store = createMockStore({
  ...mockSliceReducer('Map', {
    accuracyToggle: true,
    positionTracking: true
  })
});

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

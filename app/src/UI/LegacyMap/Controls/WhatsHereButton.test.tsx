import { configureStore } from '@reduxjs/toolkit';
import { render, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { WhatsHereButton } from './WhatsHereButton';
import { Router } from 'react-router';
import { historySingleton } from 'state/store';
import userEvent from '@testing-library/user-event';
import { createMapReducer } from 'state/reducers/map';
import Alerts from 'state/actions/alerts/Alerts';
import AlertMessage from 'interfaces/AlertMessage';

const createMockStore = () =>
  configureStore({
    reducer: { Map: createMapReducer() }
  });

describe('WhatsHereButton.tsx', () => {
  const store = createMockStore();
  const dispatchSpy = vi.spyOn(store, 'dispatch');
  it('should render', async () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <Router history={historySingleton}>
          <WhatsHereButton />
        </Router>
      </Provider>
    );

    await waitFor(() => {
      expect(getByTestId('TravelExploreIcon')).toBeDefined();
    });
  });

  it('should toggle whatsHere on and fire alert to user', async () => {
    const { getByTestId, container } = render(
      <Provider store={store}>
        <Router history={historySingleton}>
          <WhatsHereButton />
        </Router>
      </Provider>
    );
    userEvent.click(getByTestId('TravelExploreIcon'));

    await waitFor(() => {
      const alertDispatched = dispatchSpy.mock.calls.some(
        ([action]) => action.type === Alerts.create({} as AlertMessage).type
      );
      expect(alertDispatched).toBe(true);
      expect(container.querySelector('.map-btn-selected')).toBeDefined();
    });
  });

  it('Should turn WhatsHere toggle state off on second click', async () => {
    const { container, getByTestId } = render(
      <Provider store={store}>
        <Router history={historySingleton}>
          <WhatsHereButton />
        </Router>
      </Provider>
    );
    userEvent.click(getByTestId('TravelExploreIcon'));

    await waitFor(() => {
      expect(container.querySelector('.map-btn')).toBeDefined();
    });
  });
});

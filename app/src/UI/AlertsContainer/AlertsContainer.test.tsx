/**
 * @summary Tests The following
 *  - Component Renders
 *  - Can add alert
 *    - Alert renders with(out) Title
 *  - Can remove alert
 *  - Only displays 5 alerts at once
 *  - Can delete all alerts
 *  - Duplicate alerts don't display
 */
import { act, render, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Provider } from 'react-redux';
import AlertsContainer from './AlertsContainer';
import AlertMessage from 'interfaces/AlertMessage';
import { AlertSeverity, AlertSubjects } from 'constants/alertEnums';
import Alerts from 'state/actions/alerts/Alerts';
import { createAlertsAndPromptsReducer } from 'state/reducers/alertsAndPrompts';
import { configureStore } from '@reduxjs/toolkit';

const createMockStore = () =>
  configureStore({
    reducer: { AlertsAndPrompts: createAlertsAndPromptsReducer() }
  });
const store = createMockStore();

const testAlerts: Array<AlertMessage> = [
  {
    content: 'Alpha',
    title: 'Title Test',
    subject: AlertSubjects.Authentication,
    severity: AlertSeverity.Error
  },
  {
    content: 'Bravo',
    subject: AlertSubjects.Cache,
    severity: AlertSeverity.Info
  },
  {
    content: 'Charlie',
    subject: AlertSubjects.Form,
    severity: AlertSeverity.Success
  },
  {
    content: 'Echo',
    subject: AlertSubjects.Map,
    severity: AlertSeverity.Warning
  },
  {
    content: 'Foxtrot',
    subject: AlertSubjects.Network,
    severity: AlertSeverity.Error
  },
  {
    content: 'Golf',
    subject: AlertSubjects.Photo,
    severity: AlertSeverity.Info
  }
];
describe('Records.tsx', () => {
  it('shouldRender', () => {
    render(
      <Provider store={store}>
        <AlertsContainer />
      </Provider>
    );
  });

  it('Should display one alert with title', async () => {
    const { getByText } = render(
      <Provider store={store}>
        <AlertsContainer />
      </Provider>
    );
    act(() => {
      store.dispatch(Alerts.create(testAlerts[0]));
    });

    await waitFor(() => {
      expect(getByText(testAlerts[0].content)).toBeDefined();
      expect(getByText(testAlerts[0].title!)).toBeDefined();
    });
  });

  it('Can pop a single alert', async () => {
    const { getByText, queryAllByRole, queryAllByTitle, queryByText } = render(
      <Provider store={store}>
        <AlertsContainer />
      </Provider>
    );
    act(() => {
      store.dispatch(Alerts.create(testAlerts[1]));
      store.dispatch(Alerts.create(testAlerts[2]));
    });

    await waitFor(() => {
      expect(queryAllByRole('alert')).toHaveLength(3);
    });

    await userEvent.click(queryAllByTitle('Close')[1]);

    await waitFor(() => {
      expect(getByText(testAlerts[0].content)).toBeDefined();
      expect(queryByText(testAlerts[1].content)).toBeNull();
      expect(getByText(testAlerts[2].content)).toBeDefined();
    });
  });
  it('Only display Five Alerts at a time', async () => {
    const { queryAllByRole, queryAllByTitle } = render(
      <Provider store={store}>
        <AlertsContainer />
      </Provider>
    );

    // This should bring our total Alerts to 8
    act(() => {
      testAlerts.forEach((alert) => store.dispatch(Alerts.create(alert)));
    });
    await waitFor(() => {
      expect(queryAllByRole('alert')).toHaveLength(5);
    });

    await userEvent.click(queryAllByTitle('Close')[0]);
    await waitFor(() => {
      expect(queryAllByRole('alert')).toHaveLength(5);
    });
  });

  it('Clear all button removes all alerts', async () => {
    const { queryAllByRole, getByText } = render(
      <Provider store={store}>
        <AlertsContainer />
      </Provider>
    );
    expect(queryAllByRole('alert').length).toBeGreaterThanOrEqual(1);

    await userEvent.click(getByText('Clear All Alerts'));

    await waitFor(() => {
      expect(queryAllByRole('alert')).toHaveLength(0);
    });
  });

  it("Won't create duplicate Alerts", async () => {
    const { queryAllByRole } = render(
      <Provider store={store}>
        <AlertsContainer />
      </Provider>
    );

    act(() => {
      store.dispatch(Alerts.create(testAlerts[1]));
      store.dispatch(Alerts.create(testAlerts[1]));
    });

    await waitFor(() => {
      expect(queryAllByRole('alert')).toHaveLength(1);
    });
  });
});

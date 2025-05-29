import { render, waitFor, within } from '@testing-library/react';
import { LandingComponent } from 'UI/Features/Landing/Landing';
import { Provider } from 'react-redux';
import userEvent from '@testing-library/user-event';
import {
  createMockConfigurationReducer,
  createMockStore,
  DEFAULT_TEST_CONFIGURATION,
  IOS_TEST_CONFIGURATION,
  mockSliceReducer
} from 'test/testUtils';
import { UnifiedConfig } from 'state/configuration/unified-config';

const createStore = (auth: boolean, config: UnifiedConfig) =>
  createMockStore({
    ...mockSliceReducer('Auth', {
      authenticated: auth,
      loggedInOrWorkingOffline: auth,
      workingOffline: false,
      username: 'johnsmith',
      displayName: 'John Smith',
      email: 'JSmith@mail.ca',
      roles: auth ? [{ role_id: 1, role_name: 'Test Role' }] : []
    }),
    ...mockSliceReducer('UserInfo', {
      loaded: true,
      activated: false
    }),
    ...mockSliceReducer('Network', {
      connected: true
    }),
    ...mockSliceReducer('Configuration', { current: config }),
    Configuration: createMockConfigurationReducer(config)
  });

describe('Landing.tsx', async () => {
  it('should Render and display user details + roles', () => {
    const { getByText } = render(
      <Provider store={createStore(true, DEFAULT_TEST_CONFIGURATION)}>
        <LandingComponent />
      </Provider>
    );
    waitFor(() => {
      expect(getByText(/John Smith/i)).toBeDefined();
      expect(getByText(/Test Role/i)).toBeDefined();
      expect(getByText(/JSmith@mail.ca/i)).toBeDefined();
    });
  });

  it('should Render with URLs', () => {
    vi.mock('state/build-time-config', () => ({
      MOBILE: true
    }));
    const { getByText } = render(
      <Provider store={createStore(true, IOS_TEST_CONFIGURATION)}>
        <LandingComponent />
      </Provider>
    );
    expect(getByText('Informational Links')).toBeDefined();
  });

  it('should present call to action to "request access" if not authenticated', async () => {
    const { getByText, queryAllByRole } = render(
      <Provider store={createStore(false, DEFAULT_TEST_CONFIGURATION)}>
        <LandingComponent />
      </Provider>
    );
    await waitFor(() => {
      expect(getByText(/IF YOU ARE A NEW USER/i)).toBeDefined();
      expect(
        getByText(/To gain full access to the InvasivesBC application, please submit an access request./i)
      ).toBeDefined();
      const requestAccessButton = queryAllByRole('button').find(
        (button) => within(button).queryByText('Request Access') !== null
      );
      expect(requestAccessButton).toBeTruthy();
    });
    const requestAccessButton = queryAllByRole('button').find(
      (button) => within(button).queryByText('Request Access') !== null
    );
    await userEvent.click(requestAccessButton!);
  });
});

describe('[Web] Landing.tsx', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });
  afterEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  it('should Render with Download Link section', async () => {
    const { getByText } = render(
      <Provider store={createStore(true, DEFAULT_TEST_CONFIGURATION)}>
        <LandingComponent />
      </Provider>
    );
    await waitFor(() => {
      expect(getByText(/Download the Mobile app/i)).toBeDefined();
    });
  });
});

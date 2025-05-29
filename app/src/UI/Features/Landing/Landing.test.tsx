import { configureStore } from '@reduxjs/toolkit';
import { render, waitFor, within } from '@testing-library/react';
import { LandingComponent } from 'UI/Features/Landing/Landing';
import { Provider } from 'react-redux';
import userEvent from '@testing-library/user-event';
import { createMockConfigurationReducer, DEFAULT_TEST_CONFIGURATION, IOS_TEST_CONFIGURATION } from 'test/testUtils';
import { UnifiedConfig } from 'state/configuration/unified-config';

const createMockAuthReducer =
  (isAuth: boolean) =>
  (
    state = {
      authenticated: isAuth,
      loggedInOrWorkingOffline: isAuth,
      workingOffline: false,
      username: 'johnsmith',
      displayName: 'John Smith',
      email: 'JSmith@mail.ca',
      roles: isAuth ? [{ role_id: 1, role_name: 'Test Role', role_description: 'Testing Role' }] : []
    }
  ) =>
    state;

const mockUserInfoReducer = (
  state = {
    loaded: true,
    activated: false
  }
) => state;

const mockNetworkReducer = (
  state = {
    connected: true
  }
) => state;

const createMockStore = (auth: boolean, config: UnifiedConfig) =>
  configureStore({
    reducer: {
      Auth: createMockAuthReducer(auth),
      UserInfo: mockUserInfoReducer,
      Network: mockNetworkReducer,
      Configuration: createMockConfigurationReducer(config)
    }
  });

describe('Landing.tsx', async () => {
  it('should Render and display user details + roles', () => {
    const { getByText } = render(
      <Provider store={createMockStore(true, DEFAULT_TEST_CONFIGURATION)}>
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
      <Provider store={createMockStore(true, IOS_TEST_CONFIGURATION)}>
        <LandingComponent />
      </Provider>
    );
    expect(getByText('Informational Links')).toBeDefined();
  });

  it('should present call to action to "request access" if not authenticated', async () => {
    const { getByText, queryAllByRole } = render(
      <Provider store={createMockStore(false, DEFAULT_TEST_CONFIGURATION)}>
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
      <Provider store={createMockStore(true, DEFAULT_TEST_CONFIGURATION)}>
        <LandingComponent />
      </Provider>
    );
    await waitFor(() => {
      expect(getByText(/Download the Mobile app/i)).toBeDefined();
    });
  });
});

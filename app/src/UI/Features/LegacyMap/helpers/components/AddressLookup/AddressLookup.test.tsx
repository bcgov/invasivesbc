import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { createMockConfigurationReducer, createMockStore, mockSliceReducer } from 'test/testUtils';
import AddressLookup from './AddressLookup';
import userEvent from '@testing-library/user-event';

describe('AddressLookup.tsx', () => {
  const mockApiResponse = {
    results: [
      {
        suggestedAddress: 'Kanata, Vancouver, BC',
        feature: {
          type: 'Feature',
          geometry: {
            type: 'Point',
            crs: {
              type: 'EPSG',
              properties: {
                code: 4326
              }
            },
            coordinates: [-123.0291717, 49.2189265]
          }
        }
      }
    ],
    request: 'Canada',
    namespace: 'address-search'
  };

  const store = createMockStore({
    Configuration: createMockConfigurationReducer(),
    ...mockSliceReducer('Network', { connected: true })
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render', () => {
    render(
      <Provider store={store}>
        <AddressLookup />
      </Provider>
    );
    expect(screen.getByPlaceholderText('Search by address')).toBeDefined();
  });

  it('should call API when long enough string entered', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve(mockApiResponse)
        } as Response)
      )
    );
    const { queryAllByRole } = render(
      <Provider store={store}>
        <AddressLookup />
      </Provider>
    );

    // Partial search won't trigger API Call
    await userEvent.type(screen.getByPlaceholderText('Search by address'), 'Can');
    await waitFor(
      () => {
        expect(queryAllByRole('listitem')).toHaveLength(0);
      },
      { timeout: 1250 }
    );
    await userEvent.type(screen.getByPlaceholderText('Search by address'), 'ada');
    // Increasing the query length will
    await waitFor(
      () => {
        expect(queryAllByRole('listitem')).toHaveLength(1);
      },
      { timeout: 1250 }
    );
  });

  it('Should Fire event when clicking result', async () => {
    const dispatchTestStore = createMockStore({
      Configuration: createMockConfigurationReducer()
    });
    const dispatchSpy = vi.spyOn(dispatchTestStore, 'dispatch');
    const { getByText } = render(
      <Provider store={dispatchTestStore}>
        <AddressLookup />
      </Provider>
    );
    await userEvent.type(screen.getByPlaceholderText('Search by address'), 'Canada');
    await waitFor(
      () => {
        expect(getByText(/Kanata/)).toBeDefined();
      },
      { timeout: 1250 }
    );
    await userEvent.click(getByText(/Kanata/));
    await waitFor(() => {
      expect(dispatchSpy).toHaveBeenCalledOnce();
    });
  });

  it('Should toggle to Coordinates', async () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <AddressLookup />
      </Provider>
    );

    const getButton = () => screen.getByTestId('coordinate-button') as HTMLButtonElement;

    await userEvent.click(getByTestId('HomeIcon'));
    await waitFor(() => {
      expect(getButton().disabled).toBe(true);
    });
  });
  it('Should enable when Lat/long are both populated', async () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <AddressLookup />
      </Provider>
    );

    const getLatInput = () => screen.getByPlaceholderText('Lat, e.g. 54.321');
    const getLongInput = () => screen.getByPlaceholderText('Long, e.g. -123.21');
    const getButton = () => screen.getByTestId('coordinate-button') as HTMLButtonElement;

    await userEvent.click(getByTestId('HomeIcon'));

    await userEvent.type(getLatInput(), '54.32');
    await waitFor(() => {
      expect(getButton().disabled).toBe(true);
    });
    await userEvent.type(getLongInput(), '54.32');
    await waitFor(() => {
      expect(getButton().disabled).toBe(false);
    });

    await userEvent.clear(getLatInput());
    await waitFor(() => {
      expect(getButton().disabled).toBe(true);
    });
  });

  it('Should Fire Redux event with shape information', async () => {
    const dispatchTestStore = createMockStore({
      Configuration: createMockConfigurationReducer()
    });
    const dispatchSpy = vi.spyOn(dispatchTestStore, 'dispatch');
    const { getByTestId } = render(
      <Provider store={dispatchTestStore}>
        <AddressLookup />
      </Provider>
    );

    const getLatInput = () => screen.getByPlaceholderText('Lat, e.g. 54.321');
    const getLongInput = () => screen.getByPlaceholderText('Long, e.g. -123.21');
    const getButton = () => screen.getByTestId('coordinate-button') as HTMLButtonElement;

    await userEvent.click(getByTestId('HomeIcon'));
    await userEvent.type(getLatInput(), '54.32');
    await userEvent.type(getLongInput(), '54.32');
    await waitFor(() => {
      expect(getButton().disabled).toBe(false);
    });
    await userEvent.click(getButton());
    expect(dispatchSpy).toHaveBeenCalledOnce();
  });

  it('Should not allow numbers out of bounds or letters', async () => {
    const { getByTestId } = render(
      <Provider store={store}>
        <AddressLookup />
      </Provider>
    );

    const getLatInput = () => screen.getByPlaceholderText('Lat, e.g. 54.321') as HTMLInputElement;
    const getLongInput = () => screen.getByPlaceholderText('Long, e.g. -123.21') as HTMLInputElement;
    const alphaNumeric = '1a2b3c4d5e6f7g8h9';
    const smallDecimal = '0.0000001';
    const bigNegative = '-123456789';

    await userEvent.click(getByTestId('HomeIcon'));

    await userEvent.type(getLatInput(), alphaNumeric);
    await userEvent.type(getLongInput(), alphaNumeric);

    await waitFor(() => {
      expect(getLatInput().value).toBe('12');
      expect(getLongInput().value).toBe('123');
    });

    await userEvent.clear(getLatInput());
    await userEvent.clear(getLongInput());

    await userEvent.type(getLatInput(), bigNegative);
    await userEvent.type(getLongInput(), bigNegative);

    await waitFor(() => {
      expect(getLatInput().value).toBe('-12');
      expect(getLongInput().value).toBe('-123');
    });
    await userEvent.clear(getLatInput());
    await userEvent.clear(getLongInput());

    await userEvent.type(getLatInput(), smallDecimal);
    await userEvent.type(getLongInput(), smallDecimal);

    await waitFor(() => {
      expect(getLatInput().value).toBe(smallDecimal);
      expect(getLongInput().value).toBe(smallDecimal);
    });
  });
});

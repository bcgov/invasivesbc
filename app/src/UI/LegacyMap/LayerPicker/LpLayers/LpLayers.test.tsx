import { render, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import LpLayers from './LpLayers';
import { createMockStore, mockState } from '../../../../../testutils';
import { createMapReducer, DEFAULT_LOCAL_LAYERS } from 'state/reducers/map';
import userEvent from '@testing-library/user-event';

describe('LpLayers.tsx', () => {
  const store = (online: boolean) =>
    createMockStore({
      Map: createMapReducer(),
      Network: mockState({
        connected: online
      })
    });
  const storeWithShapes = createMockStore({
    Map: mockState({
      simplePickerLayers2: [],
      serverBoundaries: [
        {
          id: 760,
          title: 'Custom KML Layer',
          geojson: {
            type: 'FeatureCollection',
            features: [
              {
                type: 'Feature',
                properties: {},
                geometry: {
                  type: 'Polygon',
                  coordinates: [
                    [
                      [-119.2840107, 50.2770137],
                      [-119.2840107, 50.2570137],
                      [-119.2600107, 50.2570137],
                      [-119.2600107, 50.2770137],
                      [-119.2840107, 50.2770137]
                    ]
                  ]
                }
              }
            ]
          },
          toggle: false
        }
      ],
      clientBoundaries: [
        {
          id: 'WSwyw5TT0cYaqjhLUzt23',
          geojson: {
            id: 'M69pR7xJCINFhXnHnWvqh69LvbLJNilS',
            type: 'Feature',
            properties: {},
            geometry: {
              coordinates: [
                [
                  [-123.44300292570466, 50.150372726241585],
                  [-122.64557556213512, 50.53206702398313],
                  [-122.44621872124287, 49.90587783429376],
                  [-123.44300292570466, 50.150372726241585]
                ]
              ],
              type: 'Polygon'
            }
          },
          toggle: true,
          title: 'Custom Defined Layer'
        }
      ]
    }),
    Network: mockState({
      connected: false
    })
  });
  const dispatchSpy = vi.spyOn(storeWithShapes, 'dispatch');

  it('[Online] should render and show DataBC Layers', () => {
    const { getByText } = render(
      <Provider store={store(true)}>
        <LpLayers />
      </Provider>
    );
    expect(getByText(DEFAULT_LOCAL_LAYERS[0].title)).toBeDefined();
  });

  it('[Offline] should render DataBC layers unavailable', () => {
    const { getByText, queryByText } = render(
      <Provider store={store(false)}>
        <LpLayers />
      </Provider>
    );
    expect(getByText('DataBC layers unavailable when offline')).toBeDefined();
    expect(queryByText(DEFAULT_LOCAL_LAYERS[0].title)).toBeNull();
  });

  it('DataBC Layers should be togglable', async () => {
    const testStore = store(true);
    const dispatchSpy = vi.spyOn(testStore, 'dispatch');
    const { getAllByTestId } = render(
      <Provider store={testStore}>
        <LpLayers />
      </Provider>
    );
    const firstWMSOption = getAllByTestId('lp-layers-option-button')[0];
    await userEvent.click(firstWMSOption);
    const calledExpectedEvent = dispatchSpy.mock.calls.every(([action]) => (action.type = 'TOGGLE_WMS_LAYER'));
    expect(dispatchSpy).toHaveBeenCalledOnce();
    expect(calledExpectedEvent).toBe(true);
  });

  it('Should fire dispatch for Custom Layers Toggle', async () => {
    const testStore = store(false);
    const dispatchSpy = vi.spyOn(testStore, 'dispatch');
    const { getByTestId } = render(
      <Provider store={testStore}>
        <LpLayers />
      </Provider>
    );
    await userEvent.click(getByTestId('custom-layer-button'));
    const calledExpectedEvent = dispatchSpy.mock.calls.every(([action]) => (action.type = 'TOGGLE_CUSTOM_LAYERS'));
    expect(dispatchSpy).toHaveBeenCalledOnce();
    expect(calledExpectedEvent).toBe(true);
  });

  it('Should have Empty collections for KML and Custom Layers', () => {
    const { getByText } = render(
      <Provider store={store(false)}>
        <LpLayers />
      </Provider>
    );
    expect(getByText('You do not have any custom layers')).toBeDefined();
    expect(getByText('You have not uploaded any KML Layers')).toBeDefined();
  });

  it('Should render with KML and Custom Layer entries visible', () => {
    const { getByText } = render(
      <Provider store={storeWithShapes}>
        <LpLayers />
      </Provider>
    );
    expect(getByText('Custom KML Layer')).toBeDefined();
    expect(getByText('Custom Defined Layer')).toBeDefined();
  });

  it('Clicking Custom/KML layers should fire events', async () => {
    const { getByText, getAllByTestId } = render(
      <Provider store={storeWithShapes}>
        <LpLayers />
      </Provider>
    );
    expect(getByText('Custom KML Layer')).toBeDefined();
    expect(getByText('Custom Defined Layer')).toBeDefined();
    const layerButtons = getAllByTestId('lp-layers-option-button');
    layerButtons.forEach(async (button) => await userEvent.click(button));
    await waitFor(() => {
      expect(dispatchSpy).toHaveBeenCalledTimes(2);
      const calledExpectedEvents = dispatchSpy.mock.calls.every(([action]) =>
        ['TOGGLE_KML_LAYER', 'TOGGLE_DRAWN_LAYER'].includes(action.type)
      );
      expect(calledExpectedEvents).toBe(true);
    });
  });
});

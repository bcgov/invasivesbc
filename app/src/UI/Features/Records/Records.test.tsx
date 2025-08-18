/**
 * @summary Tests The following
 *  - Component Renders
 *  - Can Create new Recordsets via designated buttons
 *  - Can Delete Recordsets (handles the confirmation modal)
 *  - Background colour cycling
 *  - Label Layer button Dependent on Map layer toggle state.
 *  - Can Edit name of Recordset
 *  - Mobile
 *     - Warning appears
 *     - Non-cached recordsets don't render
 */
import { render, screen, waitFor, within, act } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { Records } from 'UI/Features/Records/Records';
import setupStore from 'state/store';
import UserInputModalController from 'UI/Reusable/UserInputModals/UserInputModalController';
import NetworkActions from 'state/actions/network/NetworkActions';
import { constructUnifiedConfig, UnifiedConfig } from 'state/configuration/unified-config';
import { beforeAll } from 'vitest';
import { buildTimeConfig } from 'state/configuration/build-time-config';

let store;
let config: UnifiedConfig;

import defaultRecordSets from 'constants/defaultRecordSets';
import UserSettings from 'state/actions/userSettings/UserSettings';

// Setup default Redux store for tests
beforeAll(async () => {
  config = await constructUnifiedConfig();
  const { store: configuredStore } = setupStore(config);

  store = configuredStore;
});

describe('Records.tsx', () => {
  const NUMBER_OF_DEFAULT_RECORDSETS = Object.keys(defaultRecordSets).length;

  // Setup default Redux store for tests
  it('should render', () => {
    render(
      <Provider store={store}>
        <Records />
      </Provider>
    );
    expect(screen.getByText('Add Layer of Records')).toBeDefined();
  });

  it('Can create new Activity/Iapp Recordsets', async () => {
    const { getByTestId, queryAllByTestId } = render(
      <Provider store={store}>
        <Records />
      </Provider>
    );
    const getRecordSets = () => queryAllByTestId('record-set');

    expect(getRecordSets()).toHaveLength(NUMBER_OF_DEFAULT_RECORDSETS);
    await userEvent.click(getByTestId('add-activity-layer'));
    await waitFor(() => {
      expect(getRecordSets()).toHaveLength(NUMBER_OF_DEFAULT_RECORDSETS + 1);
    });

    await userEvent.click(getByTestId('add-iapp-layer'));
    await waitFor(() => {
      expect(getRecordSets()).toHaveLength(NUMBER_OF_DEFAULT_RECORDSETS + 2);
    });
  });

  it('Can Delete Recordsets', async () => {
    const { getAllByTestId, getByTestId } = render(
      <Provider store={store}>
        <UserInputModalController />
        <Records />
      </Provider>
    );
    let recordsets = getAllByTestId('record-set') ?? [];
    const activityDelete = within(recordsets[NUMBER_OF_DEFAULT_RECORDSETS + 1]).getByTestId('delete-recordset');
    expect(activityDelete).toBeDefined();
    await userEvent.click(activityDelete);

    // Confirmation Modal Pops up
    await userEvent.click(getByTestId('confirmation-modal-confirm'));
    await waitFor(() => {
      recordsets = getAllByTestId('record-set');
      expect(recordsets.length).toEqual(NUMBER_OF_DEFAULT_RECORDSETS + 1);
    });
  });
  it('fires the correct Redux action when toggling map layer', async () => {
    const { store: configuredStore } = setupStore(config);
    const dispatchSpy = vi.spyOn(configuredStore, 'dispatch');
    const { getAllByTestId } = render(
      <Provider store={configuredStore}>
        <Records />
      </Provider>
    );
    await waitFor(() => {
      const state = store.getState().Map.layers;
      expect(!!state.find((layer) => layer?.recordSetID === '1').layerState).toBe(true);
    });
    const getMapLayerButton = () => getAllByTestId('layer-toggle')[0] as HTMLButtonElement;

    await userEvent.click(getMapLayerButton());

    await waitFor(() => {
      expect(dispatchSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          type: UserSettings.RecordSet.toggleVisibility.type,
          payload: expect.anything()
        })
      );
    });
  });

  it('Can cycle background color', async () => {
    const { getAllByTestId } = render(
      <Provider store={store}>
        <Records />
      </Provider>
    );
    const recordset = getAllByTestId('record-set')[NUMBER_OF_DEFAULT_RECORDSETS];
    const initialColour = getComputedStyle(recordset).backgroundColor;
    expect(initialColour).toBeDefined();
    const colourCycle = within(recordset).getByTestId('cycle-color');
    await userEvent.click(colourCycle);
    await waitFor(() => {
      expect(getComputedStyle(recordset).backgroundColor).not.toBe(initialColour);
    });
  });

  it('Toggling Map layers enables label layer button', async () => {
    const { store: configuredStore } = setupStore(await constructUnifiedConfig());

    const { getAllByTestId } = render(
      <Provider store={configuredStore}>
        <Records />
      </Provider>
    );
    const getRecordSet = () => getAllByTestId('record-set')[0] as HTMLUListElement;
    const getMapLayerButton = () => within(getRecordSet()).getAllByTestId('layer-toggle')[0] as HTMLButtonElement;
    const getLabelLayerButton = () => within(getRecordSet()).getAllByTestId('label-toggle')[0] as HTMLButtonElement;

    // Initially disabled since Map layer is off
    expect(getLabelLayerButton().disabled).toBe(true);

    // Toggle map layer on
    await userEvent.click(getMapLayerButton());

    await waitFor(() => {
      expect(getLabelLayerButton().disabled).toBe(false);
    });

    // Click enabled label button
    await userEvent.click(getLabelLayerButton());
    await waitFor(() => {
      expect(getAllByTestId('LabelIcon')[0]).toBeDefined();
    });
  });

  it('Edit Recordset name', async () => {
    const { getByTestId, getByText } = render(
      <Provider store={store}>
        <Records />
      </Provider>
    );
    expect(getByText(/New Recordset/)).toBeDefined();

    const editButton = getByTestId('recordset-edit');

    await userEvent.click(editButton);
    const inputField = getByTestId('recordset-name-input');
    expect(inputField).toBeDefined();

    await userEvent.type(inputField, 'Hello World');
    await userEvent.click(editButton);

    waitFor(() => {
      expect(getByText(/Hello World/)).toBeDefined();
    });
  });

  if (buildTimeConfig.MOBILE) {
    it('[Mobile] Check offline Render', async () => {
      const { queryAllByTestId, getByText } = render(
        <Provider store={store}>
          <Records />
        </Provider>
      );
      const initSets = queryAllByTestId('record-set');
      expect(initSets).toHaveLength(NUMBER_OF_DEFAULT_RECORDSETS + 1);
      act(() => {
        store.dispatch(NetworkActions.offline());
      });
      await waitFor(() => {
        expect(getByText(/Any recordsets that haven't been saved for offline/)).toBeDefined();
      });
      expect(queryAllByTestId('record-set')).toHaveLength(config.build.MOBILE ? 1 : 0); // Offline Recordset will be rendered on Mobile
    });
  }
});

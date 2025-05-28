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
import { Records } from './Records';
import setupStore from 'state/store';
import UserInputModalController from 'UI/UserInputModals/UserInputModalController';
import NetworkActions from 'state/actions/network/NetworkActions';
import { constructUnifiedConfig, UnifiedConfig } from 'state/configuration/unified-config';
import { beforeAll } from 'vitest';

let store;
let config: UnifiedConfig;

import defaultRecordSets from 'constants/defaultRecordSets';

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
    const { getAllByTestId } = render(
      <Provider store={store}>
        <Records />
      </Provider>
    );

    const getMapLayerButton = () => getAllByTestId('layer-toggle')[0] as HTMLButtonElement;
    const getLabelLayerButton = () => getAllByTestId('label-toggle')[0] as HTMLButtonElement;

    expect(getLabelLayerButton().disabled).toBe(true);

    await userEvent.click(getMapLayerButton());

    await waitFor(() => {
      const updatedLabelButton = getLabelLayerButton();
      expect(updatedLabelButton.disabled).toBe(false);
    });

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

  if (config.build.MOBILE) {
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

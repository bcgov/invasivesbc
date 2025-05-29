import { act, render, waitFor, within } from '@testing-library/react';
import LpRecordSet from './LpRecordSet';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import setupStore, { historySingleton } from 'state/store';
import userEvent from '@testing-library/user-event';
import UserSettings from 'state/actions/userSettings/UserSettings';
import { RecordSetType } from 'interfaces/UserRecordSet';
import defaultRecordSets from 'constants/defaultRecordSets';
import { DEFAULT_TEST_CONFIGURATION } from 'test/testUtils';

const NUMBER_OF_DEFAULT_RECORDSETS = Object.keys(defaultRecordSets).length;

const TestRender = () => {
  const closePicker = () => {};
  return <LpRecordSet closePicker={closePicker} />;
};

describe('LpRecordSet.tsx', () => {
  const { store } = setupStore(DEFAULT_TEST_CONFIGURATION);

  it('will render with custom and default recordsets', async () => {
    const { getAllByTestId } = render(
      <Provider store={store}>
        <Router history={historySingleton}>
          <TestRender />
        </Router>
      </Provider>
    );
    act(() => {
      store.dispatch(UserSettings.RecordSet.add(RecordSetType.Activity));
    });
    await waitFor(() => {
      expect(getAllByTestId('record-set')).toHaveLength(NUMBER_OF_DEFAULT_RECORDSETS + 1);
    });
  });

  it('Toggling Map layers enables label layer button', async () => {
    const { getAllByTestId } = render(
      <Provider store={store}>
        <Router history={historySingleton}>
          <TestRender />
        </Router>
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
      expect(getAllByTestId('LabelIcon')).toHaveLength(1);
    });
  });

  it('Can cycle background color', async () => {
    const { getAllByTestId } = render(
      <Provider store={store}>
        <Router history={historySingleton}>
          <TestRender />
        </Router>
      </Provider>
    );
    const recordset = getAllByTestId('record-set')[4];
    const initialColour = getComputedStyle(recordset).backgroundColor;
    expect(initialColour).toBeDefined();
    const colourCycle = within(recordset).getByTestId('cycle-color');
    await userEvent.click(colourCycle);
    await waitFor(() => {
      expect(getComputedStyle(recordset).backgroundColor).not.toBe(initialColour);
    });
  });
});

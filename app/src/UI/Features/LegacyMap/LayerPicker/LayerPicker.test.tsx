import { render, waitFor, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { LayerPicker } from 'UI/Features/LegacyMap/LayerPicker/LayerPicker';
import userEvent from '@testing-library/user-event';
import { act } from 'react';
import UserSettings from 'state/actions/userSettings/UserSettings';
import { createMockConfigurationReducer, createMockStore, mockSliceReducer } from 'test/testUtils';

describe('LayerPicker.tsx', () => {
  const userSettingsReducer = (state = { layerPickerIsAccordion: false }, action) => {
    if (UserSettings.toggleLayerPickerAccordion.match(action)) {
      return {
        ...state,
        layerPickerIsAccordion: !state.layerPickerIsAccordion
      };
    }
    return state;
  };
  const store = createMockStore({
    ...mockSliceReducer('Network', { connected: false }),
    Configuration: createMockConfigurationReducer(),
    UserSettings: userSettingsReducer
  });

  it('should initial render to button and toggle between open/closed', async () => {
    const { container, getByTestId } = render(
      <Provider store={store}>
        <LayerPicker />
      </Provider>
    );
    const lpToggleButton = getByTestId('lp-open');
    expect(lpToggleButton).toBeDefined();
    expect(container.querySelector('#layer-picker-container')).toBeNull();

    act(() => {
      userEvent.click(lpToggleButton);
    });

    await waitFor(() => {
      expect(container.querySelector('#layer-picker-container')).toBeDefined();
      expect(getByTestId('lp-close')).toBeDefined();
    });

    await userEvent.click(getByTestId('lp-close'));

    await waitFor(() => {
      expect(container.querySelector('layer-picker-closed-icon')).toBeDefined();
    });
  });

  it('Should display back button when rendering a module', async () => {
    const { getByTestId, queryByText, queryAllByRole } = render(
      <Provider store={store}>
        <LayerPicker />
      </Provider>
    );

    await userEvent.click(getByTestId('lp-open'));

    await waitFor(() => {
      expect(queryAllByRole('listitem').length).toBeGreaterThan(0);
    });

    const listItems = queryAllByRole('listitem');
    await userEvent.click(within(listItems[0]).getByRole('button'));

    await waitFor(() => {
      expect(queryByText('Expand')).toBeNull();
    });
  });

  it('should toggle to Accordion display', async () => {
    const { getByRole, getByTestId, queryByRole } = render(
      <Provider store={store}>
        <LayerPicker />
      </Provider>
    );

    await userEvent.click(getByTestId('lp-open'));

    await waitFor(() => {
      expect(queryByRole('list')).toBeDefined();
    });

    await userEvent.click(getByRole('checkbox'));

    await waitFor(() => {
      expect(queryByRole('list')).toBeNull();
    });
  });
});

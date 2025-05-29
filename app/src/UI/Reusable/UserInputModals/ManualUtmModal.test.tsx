import { act, render, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import UserInputModalController from './UserInputModalController';
import { createAlertsAndPromptsReducer } from 'state/reducers/alertsAndPrompts';
import Prompt from 'state/actions/prompts/Prompt';
import { ManualUtmModalInterface, UtmInputObj } from 'interfaces/prompt-interfaces';
import userEvent from '@testing-library/user-event';
import { createMockStore } from 'test/testUtils';

const utmCallback = (num: UtmInputObj) => {
  if (num) {
    return [{ type: 'SUCCESS' }];
  }
};

const testA: ManualUtmModalInterface = {
  cancelText: 'Cancel Override',
  callback: utmCallback,
  confirmText: 'Confirmation Override',
  prompt: 'Manual UTM Test',
  title: 'TestA'
};
const testB: ManualUtmModalInterface = {
  disableCancel: true,
  callback: utmCallback,
  prompt: ['Manual UTM Test', 'multi-paragraph'],
  title: 'TestB'
};

describe('ManualUtmModal.tsx', () => {
  const store = createMockStore({
    AlertsAndPrompts: createAlertsAndPromptsReducer()
  });
  let utils;
  beforeEach(() => {
    utils = render(
      <Provider store={store}>
        <UserInputModalController />
      </Provider>
    );
  });
  afterEach(() => {});
  it('should render with non-default text', async () => {
    act(() => {
      store.dispatch(Prompt.utm(testA));
    });
    const { getByText } = utils;

    await waitFor(() => {
      expect(getByText(testA.prompt as string)).toBeDefined();
      expect(getByText(testA.title)).toBeDefined();
      expect(getByText(testA.cancelText!)).toBeDefined();
      expect(getByText(testA.confirmText!)).toBeDefined();
    });
  });

  it('should close on cancel', async () => {
    const { queryByText, getByTestId } = utils;

    await waitFor(() => {
      expect(queryByText(testA.confirmText)).toBeDefined();
      expect(getByTestId('utm-modal-cancel')).toBeDefined();
    });

    userEvent.click(getByTestId('utm-modal-cancel'));
    await waitFor(() => {
      expect(queryByText(testA.title)).toBeNull();
    });
  });

  it('should render with multiple prompt lines and no cancel button', async () => {
    act(() => {
      store.dispatch(Prompt.utm(testB));
    });
    const { queryByTestId, queryAllByRole } = utils;

    await waitFor(() => {
      expect(queryAllByRole('paragraph').length).toEqual(2);
      expect(queryAllByRole('paragraph').length).toEqual(2);
      expect(queryByTestId('utm-modal-cancel')).toBeNull();
    });
  });

  it('should be disabled until all three fields are filled', async () => {
    const getInput = (label: string) => utils.getAllByLabelText(label)[0];
    const getConfirmButton = () => utils.queryByTestId('utm-modal-confirm');
    expect(getConfirmButton().disabled).toBe(true);

    await userEvent.type(getInput('Easting'), '10');
    expect(getConfirmButton().disabled).toBe(true);

    await userEvent.type(getInput('Northing'), '10');
    expect(getConfirmButton().disabled).toBe(true);

    await userEvent.type(getInput('Zone'), '10');
    expect(getConfirmButton().disabled).toBe(false);

    await userEvent.click(getConfirmButton());
    expect(getConfirmButton()).toBeNull();
  });
});

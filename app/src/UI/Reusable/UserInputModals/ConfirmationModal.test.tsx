import { act, render, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import UserInputModalController from 'UI/Reusable/UserInputModals/UserInputModalController';
import { configureStore } from '@reduxjs/toolkit';
import { createAlertsAndPromptsReducer } from 'state/reducers/alertsAndPrompts';
import Prompt from 'state/actions/prompts/Prompt';
import { ConfirmationModalInterface } from 'interfaces/prompt-interfaces';
import userEvent from '@testing-library/user-event';

const createMockStore = () =>
  configureStore({
    reducer: {
      AlertsAndPrompts: createAlertsAndPromptsReducer()
    }
  });

const confirmationCallBack = (bool: boolean) => {
  if (bool) {
    return [{ type: 'SUCCESS' }];
  }
};

const testA: ConfirmationModalInterface = {
  callback: confirmationCallBack,
  disableCancel: false,
  title: 'TestA',
  prompt: 'Testing Button Overrides',
  cancelText: 'Override cancel',
  confirmText: 'Override confirm'
};
const testB: ConfirmationModalInterface = {
  callback: confirmationCallBack,
  disableCancel: true,
  title: 'TestB',
  prompt: ['Testing Cancel button not available', 'and accepting arrays']
};

describe('ConfirmationModal.tsx', () => {
  const store = createMockStore();
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
      store.dispatch(Prompt.confirmation(testA));
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
      expect(getByTestId('confirmation-modal-cancel')).toBeDefined();
    });

    userEvent.click(getByTestId('confirmation-modal-cancel'));
    await waitFor(() => {
      expect(queryByText(testA.title)).toBeNull();
    });
  });

  it('should render with multiple prompt lines and no cancel button', async () => {
    act(() => {
      store.dispatch(Prompt.confirmation(testB));
    });
    const { queryByTestId, queryAllByRole } = utils;

    await waitFor(() => {
      expect(queryAllByRole('paragraph').length).toEqual(2);
      expect(queryByTestId('confirmation-modal-cancel')).toBeNull();
    });
  });
  it('should close after confirmation', async () => {
    const { getByTestId, queryByTestId } = utils;

    userEvent.click(getByTestId('confirmation-modal-confirm'));
    await waitFor(() => {
      expect(queryByTestId('confirmation-modal-confirm')).toBeNull();
    });
  });
});

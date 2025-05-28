import { act, render, RenderResult, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import UserInputModalController from './UserInputModalController';
import { createAlertsAndPromptsReducer } from 'state/reducers/alertsAndPrompts';
import Prompt from 'state/actions/prompts/Prompt';
import { RadioModalInterface } from 'interfaces/prompt-interfaces';
import userEvent from '@testing-library/user-event';
import { createMockStore } from '../../../testutils';

const textCallBack = (str: string | number) => {
  if (str) {
    return [{ type: 'SUCCESS' }];
  }
};

const testA: RadioModalInterface = {
  callback: textCallBack,
  cancelText: 'Override Cancel',
  confirmText: 'Override Confirm',
  label: 'Radio Test [String]',
  options: ['Hello', 'World'],
  prompt: 'Testing Radio',
  title: 'Radio [String]'
};

const testB: RadioModalInterface = {
  callback: textCallBack,
  label: 'Radio Test [String]',
  disableCancel: true,
  options: [1, 2, 3],
  prompt: ['Testing Radio', 'With Array Prompt'],
  title: 'Radio [Number]'
};

describe('RadioModal.tsx', () => {
  const store = createMockStore({ AlertsAndPrompts: createAlertsAndPromptsReducer() });
  let utils: RenderResult;
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
      store.dispatch(Prompt.radio(testA));
    });
    const { getByText } = utils;

    await waitFor(() => {
      expect(getByText(testA.prompt as string)).toBeDefined();
      expect(getByText(testA.title)).toBeDefined();
      expect(getByText(testA.cancelText!)).toBeDefined();
      expect(getByText(testA.confirmText!)).toBeDefined();
    });
  });
  it('renders all provided options [string] and submits', async () => {
    const { getByLabelText, getByRole, getByTestId, queryByText } = utils;
    const getByOption = (index: number) => getByLabelText(testA.options[index]) as HTMLInputElement;

    testA.options.forEach((option) => {
      expect(getByLabelText(option)).toBeDefined();
      expect(getByRole('radio', { name: option })).toBeDefined();
    });

    await userEvent.click(getByOption(1));
    expect(getByOption(0).checked).toBe(false);
    expect(getByOption(1).checked).toBe(true);
    await userEvent.click(getByTestId('radio-modal-confirm'));
    expect(queryByText(testB.title)).toBeNull();
  });

  it('should close on cancel', async () => {
    const { queryByText, getByTestId } = utils;

    await waitFor(() => {
      expect(getByTestId('radio-modal-cancel')).toBeDefined();
    });

    userEvent.click(getByTestId('radio-modal-cancel'));
    await waitFor(() => {
      expect(queryByText(testA.title)).toBeNull();
    });
  });

  it('should render with multiple prompt lines and no cancel button', async () => {
    act(() => {
      store.dispatch(Prompt.radio(testB));
    });
    const { queryByTestId, queryAllByRole } = utils;

    await waitFor(() => {
      expect(queryAllByRole('paragraph').length).toEqual(testB.prompt.length);
      expect(queryByTestId('radio-modal-cancel')).toBeNull();
    });
  });

  it('renders all provided options [number] and submits', async () => {
    const { getByLabelText, getByRole, getByTestId, queryByText } = utils;
    testB.options.forEach((option) => {
      expect(getByLabelText(option)).toBeDefined();
      expect(getByRole('radio', { name: option })).toBeDefined();
    });
    const getByOption = (index: number) => getByLabelText(testB.options[index]) as HTMLInputElement;

    await userEvent.click(getByOption(2));
    expect(getByOption(0).checked).toBe(false);
    expect(getByOption(2).checked).toBe(true);
    await userEvent.click(getByTestId('radio-modal-confirm'));
    expect(queryByText(testB.title)).toBeNull();
  });
});

import { act, render, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import UserInputModalController from './UserInputModalController';
import { createAlertsAndPromptsReducer } from 'state/reducers/alertsAndPrompts';
import Prompt from 'state/actions/prompts/Prompt';
import { TextModalInterface } from 'interfaces/prompt-interfaces';
import userEvent from '@testing-library/user-event';
import { createMockStore } from 'test/testUtils';

const textCallBack = (str: string) => {
  if (str) {
    return [{ type: 'SUCCESS' }];
  }
};

const testA: TextModalInterface = {
  callback: textCallBack,
  cancelText: 'Override Cancel',
  confirmText: 'Override Confirm',
  label: 'Text Input Label',
  prompt: 'Testing Button Overrides',
  title: 'TestA'
};
const testB: TextModalInterface = {
  callback: textCallBack,
  disableCancel: true,
  label: 'Length Test',
  max: 8,
  min: 6,
  prompt: ['Testing response', 'for set length'],
  title: 'TestB'
};

const testC: TextModalInterface = {
  callback: textCallBack,
  label: 'Regex Test',
  prompt: 'Testing Regex',
  regex: /^Hello World$/,
  regexErrorText: 'does not conform to pattern',
  title: 'TestC'
};

const testD: TextModalInterface = {
  prompt: 'Testing Select Options',
  callback: textCallBack,
  label: 'Select Options',
  selectOptions: ['Hello', 'World'],
  title: 'TestD'
};

describe('TextModal.tsx', () => {
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
      store.dispatch(Prompt.text(testA));
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
      expect(getByTestId('text-modal-cancel')).toBeDefined();
    });

    userEvent.click(getByTestId('text-modal-cancel'));
    await waitFor(() => {
      expect(queryByText(testA.title)).toBeNull();
    });
  });

  it('should render with multiple prompt lines and no cancel button', async () => {
    act(() => {
      store.dispatch(Prompt.text(testB));
    });
    const { queryByTestId, queryAllByRole } = utils;

    await waitFor(() => {
      expect(queryAllByRole('paragraph').length).toEqual(2);
      expect(queryByTestId('text-modal-cancel')).toBeNull();
    });
  });

  it('should show error text and block submit if response not 7 characters', async () => {
    const { getByLabelText, getByText, getByTestId, queryByText } = utils;
    const getConfirmButton = () => getByTestId('text-modal-confirm') as HTMLButtonElement;
    const input = getByLabelText(testB.label);
    await userEvent.type(input, 'short');
    await userEvent.click(getConfirmButton()); // Trigger Blur event
    await waitFor(() => {
      expect(getByText('Response must be between (6) and (8) characters in length')).toBeDefined();
    });
    await userEvent.clear(input); // Clear existing input
    await userEvent.type(input, 'Testing');
    await userEvent.click(getConfirmButton()); // Trigger Blur event
    await waitFor(() => {
      expect(queryByText('Response must be between (6) and (8) characters in length')).toBeNull();
    });
  });

  it('should test against supplied regex pattern', async () => {
    act(() => {
      store.dispatch(Prompt.text(testC));
    });
    const { getByLabelText, getByText, getByTestId, queryByText } = utils;
    const getConfirmButton = () => getByTestId('text-modal-confirm') as HTMLButtonElement;
    const input = getByLabelText(testC.label);
    await userEvent.type(input, 'World Hello');
    await userEvent.click(getConfirmButton()); // Trigger Blur event
    await waitFor(() => {
      expect(getByText(testC.regexErrorText)).toBeDefined();
    });
    await userEvent.clear(input); // Clear existing input
    await userEvent.type(input, 'Hello World');
    await userEvent.click(getConfirmButton()); // Trigger Blur event
    await waitFor(() => {
      expect(queryByText(testC.regexErrorText)).toBeNull();
      expect(queryByText(testC.label)).toBeNull(); // Prompt is closed
    });
  });

  it('should use select options when provided', async () => {
    act(() => {
      store.dispatch(Prompt.text(testD));
    });
    const { getByLabelText, getByTestId, getByText, queryByText } = utils;
    const select = getByLabelText(testD.label);
    await waitFor(() => {
      expect(getByText(testD.prompt)).toBeDefined(); // Prompt is open
      expect(select).toBeDefined();
    });
    await userEvent.click(getByTestId('text-modal-confirm'));
    expect(getByText('You need to select an option from the menu')).toBeDefined();

    await userEvent.click(select);
    await waitFor(() => {
      expect(getByText(testD.selectOptions![0])).toBeDefined();
      expect(getByText(testD.selectOptions![1])).toBeDefined();
    });
    await userEvent.click(getByText(testD.selectOptions![1]));
    await waitFor(() => {
      expect(queryByText(testD.selectOptions![0])).toBeNull(); // Select Items closed after selecting second option
    });
    await userEvent.click(getByTestId('text-modal-confirm'));
    await waitFor(() => {
      expect(queryByText(testD.prompt)).toBeNull(); // Prompt closed with Confirmation
    });
  });
});

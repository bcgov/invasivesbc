import { act, render, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import UserInputModalController from './UserInputModalController';
import { createAlertsAndPromptsReducer } from 'state/reducers/alertsAndPrompts';
import Prompt from 'state/actions/prompts/Prompt';
import { NumberModalInterface } from 'interfaces/prompt-interfaces';
import userEvent from '@testing-library/user-event';
import { createMockStore } from 'test/testUtils';

const numberCallback = (num: number) => {
  if (num) {
    return [{ type: 'SUCCESS' }];
  }
};

const testA: NumberModalInterface = {
  callback: numberCallback,
  cancelText: 'Override Cancel',
  confirmText: 'Override Confirm',
  label: 'Number Input Label',
  prompt: 'Testing Button Overrides',
  title: 'TestA'
};
const testB: NumberModalInterface = {
  callback: numberCallback,
  label: 'Expect size between',
  disableCancel: true,
  max: 8,
  min: 6,
  prompt: ['Testing response', 'for set length'],
  title: 'TestB'
};

const testC: NumberModalInterface = {
  prompt: 'Testing Select Options',
  callback: numberCallback,
  label: 'Select Options',
  selectOptions: [1, 2, 3, 4],
  title: 'TestD'
};

describe('NumberModal.tsx', () => {
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
      store.dispatch(Prompt.number(testA));
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
      expect(getByTestId('number-modal-cancel')).toBeDefined();
    });

    userEvent.click(getByTestId('number-modal-cancel'));
    await waitFor(() => {
      expect(queryByText(testA.title)).toBeNull();
    });
  });

  it('should render with multiple prompt lines and no cancel button', async () => {
    act(() => {
      store.dispatch(Prompt.number(testB));
    });
    const { queryByTestId, queryAllByRole } = utils;

    await waitFor(() => {
      expect(queryAllByRole('paragraph').length).toEqual(2);
      expect(queryAllByRole('paragraph').length).toEqual(2);
      expect(queryByTestId('number-modal-cancel')).toBeNull();
    });
  });

  it('should show error text and block submit if response not in parameters characters', async () => {
    const { getByLabelText, getByText, queryByTestId, queryByText } = utils;
    const expectedError = 'Number must be between (6) and (8)';

    const getConfirmButton = () => queryByTestId('number-modal-confirm');
    const input = getByLabelText(testB.label);
    await userEvent.type(input, '11');
    await waitFor(() => {
      expect(getByText(expectedError)).toBeDefined();
    });
    await userEvent.clear(input); // Clear existing input
    await userEvent.type(input, '7');
    expect(queryByText(expectedError)).toBeNull();
    await userEvent.click(queryByTestId('number-modal-confirm'));
    expect(getConfirmButton()).toBeNull(); // Prompt Gone
  });

  it('should use select options when provided', async () => {
    act(() => {
      store.dispatch(Prompt.number(testC));
    });
    const { getByLabelText, getByTestId, getByText, queryByText } = utils;
    const select = getByLabelText(testC.label);

    expect(getByText(testC.prompt)).toBeDefined(); // Prompt is open
    expect(select).toBeDefined();
    expect(getByTestId('number-modal-confirm').disabled).toBe(true);

    await userEvent.click(select);
    await waitFor(() => {
      expect(getByText(testC.selectOptions![0])).toBeDefined();
      expect(getByText(testC.selectOptions![1])).toBeDefined();
    });
    await userEvent.click(getByText(testC.selectOptions![1]));
    await waitFor(() => {
      expect(queryByText(testC.selectOptions![0])).toBeNull(); // Select Items closed after selecting second option
    });
    await userEvent.click(getByTestId('number-modal-confirm'));
    await waitFor(() => {
      expect(queryByText(testC.prompt)).toBeNull(); // Prompt closed with Confirmation
    });
  });
});

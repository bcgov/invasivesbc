import { cleanup, render, waitFor } from '@testing-library/react';
import DataSharingAgreement from './DataSharingAgreement';
import userEvent from '@testing-library/user-event';

const dataSharingAgreementHeader = 'InvasivesBC Data Sharing Agreement';
describe('DataSharingAgreement.tsx', () => {
  let utils;
  beforeEach(() => {
    utils = render(<DataSharingAgreement />);
  });
  afterEach(() => {
    cleanup();
  });
  it('should initially render as button', async () => {
    const { getByText, queryByText } = utils;
    await waitFor(() => {
      expect(getByText(/View Agreement/)).toBeDefined();
      expect(queryByText(dataSharingAgreementHeader)).toBeDefined();
    });
  });
  it('should display Modal on Click containing agreement', async () => {
    const { getByRole, getByText } = utils;
    await userEvent.click(getByRole('button'));
    await waitFor(() => {
      expect(getByText(dataSharingAgreementHeader)).toBeDefined();
    });
  });

  it('should close on click', async () => {
    const { getByRole, getByTestId, queryByTestId } = utils;
    await userEvent.click(getByRole('button'));
    await waitFor(() => {
      expect(getByTestId('CloseIcon')).toBeDefined();
    });
    await userEvent.click(getByTestId('CloseIcon'));
    expect(queryByTestId('CloseIcon')).toBeNull();
  });
});

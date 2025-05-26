import { render, waitFor } from '@testing-library/react';
import CustomPopover from './CustomPopover';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';

const defaultButtonText = 'Default Button';
const componentText = 'Hello World!';
// Uses Default Button
const TestComponentNoButton = () => (
  <div>
    <CustomPopover buttonText={defaultButtonText}>
      <p>{componentText}</p>
      <button>Test</button>
    </CustomPopover>
  </div>
);

const TestComponentSelfClose = () => (
  <div>
    <CustomPopover buttonText={defaultButtonText} closeAfterPress>
      <p>{componentText}</p>
      <button>Test</button>
    </CustomPopover>
  </div>
);

// Provides Button to Popover
const TestComponentWithButtonSelfClose = () => {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  return (
    <div>
      <button onClick={(evt) => setAnchorEl(evt.currentTarget)}>Override Button</button>
      <CustomPopover buttonOverrideOptions={{ anchorEl, setAnchorEl }} closeAfterPress>
        <p>{componentText}</p>
        <button>Test</button>
      </CustomPopover>
    </div>
  );
};

describe('CustomPopover.tsx', () => {
  it('Should Render with own button', async () => {
    const { getByRole, getByText } = render(<TestComponentNoButton />);
    await userEvent.click(getByRole('button'));
    await waitFor(() => {
      expect(getByText(componentText)).toBeDefined();
    });
    await userEvent.click(getByText('Test'));
    await waitFor(() => {
      expect(getByText(componentText)).toBeDefined();
    });
  });

  it('Should Remain open after clicking button', async () => {
    const { getByRole, getByText, queryByText } = render(<TestComponentNoButton />);
    await userEvent.click(getByRole('button'));
    await waitFor(() => {
      expect(getByText(componentText)).toBeDefined();
    });
    await userEvent.click(getByText('Test'));
    await waitFor(() => {
      expect(getByText(componentText)).toBeDefined();
    });
    await userEvent.keyboard('{Escape}');
    await waitFor(() => {
      expect(queryByText(componentText)).toBeNull();
    });
  });

  it('Should Close self after clicking internal button', async () => {
    const { getByRole, getByText, queryByText } = render(<TestComponentSelfClose />);
    await userEvent.click(getByRole('button'));
    await waitFor(() => {
      expect(getByText(componentText)).toBeDefined();
    });
    await userEvent.click(getByText('Test'));
    await waitFor(() => {
      expect(queryByText(componentText)).toBeNull();
    });
  });

  it('Should render with Supplied button and close after clicking internal button', async () => {
    const { getByRole, getByText, queryAllByRole, queryByText } = render(<TestComponentWithButtonSelfClose />);
    expect(queryAllByRole('button')).toHaveLength(1);
    await userEvent.click(getByRole('button'));
    await waitFor(() => {
      expect(getByText(componentText)).toBeDefined();
    });
    await userEvent.click(getByText('Test'));
    await waitFor(() => {
      expect(queryByText(componentText)).toBeNull();
    });
  });
});

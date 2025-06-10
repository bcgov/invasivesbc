import { render, waitFor } from '@testing-library/react';
import StyledModal from './StyledModal';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';

const renderText = 'Hello World!';

const TestComponent = () => {
  const [open, setOpen] = useState<boolean>(true);
  return (
    <StyledModal open={open} onClose={setOpen.bind(this, false)} variant="primary">
      <p>{renderText}</p>
    </StyledModal>
  );
};

describe('StyledModal.tsx', () => {
  it('will render and close when outter div clicked', async () => {
    const { getByText, getByTestId, queryByText } = render(<TestComponent />);

    expect(getByText(renderText)).toBeDefined();

    await userEvent.click(getByTestId('styled-modal'));
    await waitFor(() => {
      expect(queryByText(renderText)).toBeNull();
    });
  });
});

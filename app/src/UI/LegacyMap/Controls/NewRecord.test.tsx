import { render } from '@testing-library/react';
import { NewRecord } from './NewRecord';
import userEvent from '@testing-library/user-event';

const mockDispatch = vi.fn();
vi.mock('utils/use_selector', () => ({
  useDispatch: () => mockDispatch
}));

describe('NewRecord.tsx', () => {
  it('fires the openNewRecordDialogue event on click', async () => {
    const { getByRole } = render(<NewRecord />);

    await userEvent.click(getByRole('button'));
    expect(mockDispatch).toHaveBeenCalled();
  });
});

/**
 * Tests:
 *  - Tooltip Renders
 *  - Hover displays Tip
 *  - Click Displays Tip (Important for mobile)
 */
import { render, waitFor } from '@testing-library/react';
import TooltipWithIcon from 'UI/Reusable/TooltipWithIcon/TooltipWithIcon';
import userEvent from '@testing-library/user-event';

const toolTipText = 'Test Render';

describe('TooltipWithText.tsx', () => {
  it('should Render', () => {
    const { getByTestId } = render(<TooltipWithIcon tooltipText={toolTipText} />);
    expect(getByTestId('HelpOutlineIcon')).toBeDefined();
  });

  it('Should display tooltip on Hover', async () => {
    const { getByTestId, getByText, queryByText } = render(<TooltipWithIcon tooltipText={toolTipText} />);
    expect(queryByText(toolTipText)).toBeNull();
    await userEvent.hover(getByTestId('HelpOutlineIcon'));
    await waitFor(() => {
      expect(getByText(toolTipText)).toBeDefined();
    });
  });

  it('Should display tooltip on click', async () => {
    const { getByRole, getByText, queryByText } = render(<TooltipWithIcon tooltipText={toolTipText} />);
    expect(queryByText(toolTipText)).toBeNull();
    await userEvent.click(getByRole('button'));
    await waitFor(() => {
      expect(getByText(toolTipText)).toBeDefined();
    });
  });
});

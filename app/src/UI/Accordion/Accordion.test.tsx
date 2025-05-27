import { render, waitFor } from '@testing-library/react';
import Accordion from './Accordion';
import userEvent from '@testing-library/user-event';

describe('Accordion.tsx', () => {
  it('Should render without icon', () => {
    const { getByText, queryByText } = render(
      <Accordion title="Hello">
        <p>World</p>
      </Accordion>
    );
    expect(getByText('Hello')).toBeDefined();
    expect(queryByText('World')).toBeNull();
  });

  it('Should expand on Click', async () => {
    const { getByText, getByRole } = render(
      <Accordion title="Hello">
        <p>World</p>
      </Accordion>
    );

    userEvent.click(getByRole('button'));
    await waitFor(() => {
      expect(getByText('World')).toBeDefined();
    });
  });

  it('Should Render with Icon', () => {
    const { getByRole } = render(
      <Accordion title="Hello" icon="map">
        <p>World</p>
      </Accordion>
    );
    waitFor(() => {
      expect(getByRole('span')).toBeDefined();
    });
  });
});

/**
 * Tests:
 *  - It Renders (no moving parts)
 */
import { render } from '@testing-library/react';
import { Footer } from './Footer';

describe('Footer.tsx', () => {
  it('Should Render', () => {
    const { getByRole } = render(<Footer />);
    expect(getByRole('img')).toBeDefined();
  });
});

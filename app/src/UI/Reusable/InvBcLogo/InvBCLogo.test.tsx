import { render } from '@testing-library/react';
import InvBcLogo from 'UI/Reusable/InvBcLogo/InvBcLogo';

describe('InvBCLogo.tsx', () => {
  it('Should render', () => {
    const { getByRole } = render(<InvBcLogo />);
    expect(getByRole('img')).toBeDefined();
  });
});

import { PropsWithChildren, ReactNode } from 'react';

interface PropTypes extends PropsWithChildren {
  label: string;
  small?: boolean;
  children: ReactNode;
}

const Fieldset = ({ label, small = false, children }: PropTypes) => {
  return (
    <fieldset className={small ? 'small' : ''}>
      <legend>{label}</legend>
      {children}
    </fieldset>
  );
};

export default Fieldset;

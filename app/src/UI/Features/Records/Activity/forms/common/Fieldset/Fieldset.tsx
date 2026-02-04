import { PropsWithChildren, ReactNode } from 'react';
import './fieldset.css';

interface PropTypes extends PropsWithChildren {
  label: string;
  small?: boolean;
  children: ReactNode;
}

const Fieldset = ({ label, small = false, children }: PropTypes) => {
  return (
    <fieldset className={`form-fieldset ${small ? 'small' : ''}`}>
      <legend>{label}</legend>
      {children}
    </fieldset>
  );
};

export default Fieldset;

import { PropsWithChildren, ReactNode } from 'react';
import './fieldset.css';
import { getInputWidth, Width } from '../utils';

interface PropTypes extends PropsWithChildren {
  label: string;
  children: ReactNode;
  width?: Width;
}

const Fieldset = ({ label, width, children }: PropTypes) => {
  return (
    <fieldset className={`form-fieldset ${getInputWidth(width)}`}>
      <legend>{label}</legend>
      {children}
    </fieldset>
  );
};

export default Fieldset;

import { PropsWithChildren, ReactNode } from 'react';
import './fieldset.css';
import { getInputWidth, Width } from '../utils';
import TooltipWithIcon from 'UI/Reusable/TooltipWithIcon/TooltipWithIcon';

interface PropTypes extends PropsWithChildren {
  children: ReactNode;
  label: string;
  tooltip?: string;
  nested?: boolean;
  width?: Width;
}

const Fieldset = ({ label, width, tooltip, children, nested }: PropTypes) => {
  return (
    <fieldset className={`form-fieldset ${getInputWidth(width)} ${nested ? 'nested' : ''}`}>
      <legend>
        {label} {tooltip && <TooltipWithIcon tooltipText={tooltip} />}
      </legend>
      {children}
    </fieldset>
  );
};

export default Fieldset;

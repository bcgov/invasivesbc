import { PropsWithChildren, ReactNode } from 'react';
import { getInputWidth, Width } from '../utils';
import TooltipWithIcon from 'UI/Reusable/TooltipWithIcon/TooltipWithIcon';
import './fieldset.css';

interface PropTypes extends PropsWithChildren {
  className?: string;
  children: ReactNode;
  label: string;
  tooltip?: string;
  nested?: boolean;
  width?: Width | `${Width}`;
}

const Fieldset = ({ label, width, tooltip, children, nested, className }: PropTypes) => {
  const nestedClass = nested ? 'nested' : '';
  return (
    <fieldset className={`form-fieldset ${getInputWidth(width)} ${nestedClass} ${className ?? ''}`}>
      <legend className={nestedClass}>
        {label} {tooltip && <TooltipWithIcon tooltipText={tooltip} />}
      </legend>
      {children}
    </fieldset>
  );
};

export default Fieldset;

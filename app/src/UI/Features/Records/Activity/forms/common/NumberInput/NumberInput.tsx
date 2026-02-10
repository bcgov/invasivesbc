import { forwardRef, InputHTMLAttributes } from 'react';
import { FieldError } from 'react-hook-form';
import './numberInput.css';
import TooltipWithIcon from 'UI/Reusable/TooltipWithIcon/TooltipWithIcon';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
import { getInputWidth, Width } from '../utils';
import RequiredField from '../RequiredField/RequiredField';

interface PropTypes extends InputHTMLAttributes<HTMLInputElement> {
  error?: FieldError;
  label?: string;
  placeHolder?: string;
  readOnly?: boolean;
  required?: boolean;
  tooltip?: string;
  width?: Width;
}

// Use forwardRef so Hook Form can manage the input focus
export const NumberInput = forwardRef<HTMLInputElement, PropTypes>(
  ({ error, label, readOnly = false, required = false, tooltip, width, ...props }, ref) => {
    return (
      <div className={`form-number-input ${getInputWidth(width)}`}>
        {label && (
          <label>
            {label}
            {required && <RequiredField />}
            {tooltip && <TooltipWithIcon tooltipText={tooltip} />}
          </label>
        )}
        <input type="number" placeholder={props?.placeholder ?? label} readOnly={readOnly} ref={ref} {...props} />
        <ErrorMessage error={error} label={label} />
      </div>
    );
  }
);

export default NumberInput;

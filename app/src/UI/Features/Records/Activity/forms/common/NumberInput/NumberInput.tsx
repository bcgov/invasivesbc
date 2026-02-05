import { forwardRef, InputHTMLAttributes } from 'react';
import { FieldError } from 'react-hook-form';
import './numberInput.css';
import TooltipWithIcon from 'UI/Reusable/TooltipWithIcon/TooltipWithIcon';
import ErrorMessage from '../ErrorMessage/ErrorMessage';

interface PropTypes extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  readOnly?: boolean;
  tooltip?: string;
  placeHolder?: string;
  error?: FieldError;
}

// Use forwardRef so Hook Form can manage the input focus
export const NumberInput = forwardRef<HTMLInputElement, PropTypes>(
  ({ label, readOnly = false, error, tooltip, ...props }, ref) => {
    return (
      <div className="form-number-input">
        {label && (
          <label>
            {label}
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

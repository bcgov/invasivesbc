import { forwardRef, InputHTMLAttributes } from 'react';
import { FieldError } from 'react-hook-form';
import './dateInput.css';
import TooltipWithIcon from 'UI/Reusable/TooltipWithIcon/TooltipWithIcon';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
import { getInputWidth, Width } from '../utils';
import RequiredField from '../RequiredField/RequiredField';

interface PropTypes extends InputHTMLAttributes<HTMLInputElement> {
  error?: FieldError;
  includeTime?: boolean;
  label?: string;
  tooltip?: string;
  required: boolean;
  width?: Width;
}

// Use forwardRef so Hook Form can manage the input focus
export const DateInput = forwardRef<HTMLInputElement, PropTypes>(
  ({ includeTime = false, width, label, required, error, tooltip, ...props }, ref) => {
    return (
      <div className={`form-date-input ${getInputWidth(width)}`}>
        {label && (
          <label>
            {label}
            {required && <RequiredField />}
            {tooltip && <TooltipWithIcon tooltipText={tooltip} />}
          </label>
        )}
        <input type={includeTime ? 'datetime-local' : 'date'} ref={ref} {...props} />
        <ErrorMessage error={error} label={label} />
      </div>
    );
  }
);

export default DateInput;

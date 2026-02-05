import { forwardRef, InputHTMLAttributes } from 'react';
import { FieldError } from 'react-hook-form';
import './dateInput.css';
import TooltipWithIcon from 'UI/Reusable/TooltipWithIcon/TooltipWithIcon';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
import { getInputWidth, Width } from '../utils';

interface PropTypes extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: FieldError;
  includeTime?: boolean;
  tooltip?: string;
  width?: Width;
}

// Use forwardRef so Hook Form can manage the input focus
export const DateInput = forwardRef<HTMLInputElement, PropTypes>(
  ({ includeTime = false, width, label, error, tooltip, ...props }, ref) => {
    return (
      <div className={`form-date-input ${getInputWidth(width)}`}>
        {label && (
          <label>
            {label}
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

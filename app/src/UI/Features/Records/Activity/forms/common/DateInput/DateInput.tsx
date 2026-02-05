import { forwardRef, InputHTMLAttributes } from 'react';
import { FieldError } from 'react-hook-form';
import './dateInput.css';
import TooltipWithIcon from 'UI/Reusable/TooltipWithIcon/TooltipWithIcon';
import ErrorMessage from '../ErrorMessage/ErrorMessage';

interface PropTypes extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: FieldError;
  includeTime?: boolean;
  tooltip?: string;
}

// Use forwardRef so Hook Form can manage the input focus
export const DateInput = forwardRef<HTMLInputElement, PropTypes>(
  ({ includeTime = false, label, error, tooltip, ...props }, ref) => {
    return (
      <div className="form-date-input">
        {label && (
          <label>
            {label}
            {tooltip && <TooltipWithIcon tooltipText={tooltip} />}
          </label>
        )}
        <input type={includeTime ? 'datetime-local' : 'date'} ref={ref} {...props} />
        {error && <ErrorMessage message={error.message} />}
      </div>
    );
  }
);

export default DateInput;

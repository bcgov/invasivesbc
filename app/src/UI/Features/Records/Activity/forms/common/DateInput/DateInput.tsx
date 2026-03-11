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
  required?: boolean;
  width?: Width;
}

// Use forwardRef so Hook Form can manage the input focus
const DateInput = forwardRef<HTMLInputElement, PropTypes>(
  ({ includeTime = false, width, label, required = false, error, tooltip, ...props }, ref) => {
    return (
      <div className={`form-date-input ${getInputWidth(width)}`}>
        {label && (
          <div className="top">
            <label>
              {label}
              {required && <RequiredField />}
            </label>
            {tooltip && <TooltipWithIcon tooltipText={tooltip} />}
          </div>
        )}
        <input aria-invalid={!!error} type={includeTime ? 'datetime-local' : 'date'} ref={ref} {...props} />
        <ErrorMessage error={error} label={label} />
      </div>
    );
  }
);

export default DateInput;

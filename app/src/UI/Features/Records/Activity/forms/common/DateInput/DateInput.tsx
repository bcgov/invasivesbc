import { forwardRef, InputHTMLAttributes } from 'react';
import { FieldError } from 'react-hook-form';
import './dateInput.css';
import TooltipWithIcon from 'UI/Reusable/TooltipWithIcon/TooltipWithIcon';
import ErrorMessage from 'UI/Features/Records/Activity/forms/common/ErrorMessage/ErrorMessage';
import { getInputWidth, Width } from 'UI/Features/Records/Activity/forms/common/utils';
import OptionalField from 'UI/Features/Records/Activity/forms/common/OptionalField/OptionalField';

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
              {!required && <OptionalField />}
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

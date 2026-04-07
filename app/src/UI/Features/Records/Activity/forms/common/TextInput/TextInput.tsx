import { forwardRef, InputHTMLAttributes } from 'react';
import { FieldError } from 'react-hook-form';
import TooltipWithIcon from 'UI/Reusable/TooltipWithIcon/TooltipWithIcon';
import ErrorMessage from 'UI/Features/Records/Activity/forms/common/ErrorMessage/ErrorMessage';
import { getInputWidth, Width } from 'UI/Features/Records/Activity/forms/common/utils';
import AdvisoryMessage from 'UI/Features/Records/Activity/forms/common/AdvisoryMessage/AdvisoryMessage';
import OptionalField from 'UI/Features/Records/Activity/forms/common/OptionalField/OptionalField';
import './textInput.css';

interface PropTypes extends InputHTMLAttributes<HTMLInputElement> {
  error?: FieldError;
  label?: string;
  required?: boolean;
  advisoryText?: string;
  placeholder?: string;
  tooltip?: string;
  width?: Width;
}

// Use forwardRef so Hook Form can manage the input focus
export const TextInput = forwardRef<HTMLInputElement, PropTypes>(
  ({ error, advisoryText, label, placeholder = label, required = false, tooltip, width, ...props }, ref) => {
    return (
      <div className={`form-text-input ${getInputWidth(width)}`}>
        {label && (
          <div className="top">
            <label>
              {label}
              {!required && <OptionalField />}
            </label>
            {tooltip && <TooltipWithIcon tooltipText={tooltip} />}
          </div>
        )}
        <input aria-invalid={!!error} type="text" ref={ref} placeholder={placeholder} {...props} />
        {advisoryText && <AdvisoryMessage text={advisoryText} />}
        {error && <ErrorMessage error={error} label={label} />}
      </div>
    );
  }
);

export default TextInput;

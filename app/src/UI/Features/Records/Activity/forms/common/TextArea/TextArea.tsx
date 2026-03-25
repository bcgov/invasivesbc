import { forwardRef, InputHTMLAttributes } from 'react';
import { FieldError } from 'react-hook-form';
import ErrorMessage from 'UI/Features/Records/Activity/forms/common/ErrorMessage/ErrorMessage';
import { getInputWidth, Width } from 'UI/Features/Records/Activity/forms/common/utils';
import TooltipWithIcon from 'UI/Reusable/TooltipWithIcon/TooltipWithIcon';
import OptionalField from 'UI/Features/Records/Activity/forms/common/OptionalField/OptionalField';
import './textArea.css';

interface PropTypes extends InputHTMLAttributes<HTMLTextAreaElement> {
  error?: FieldError;
  label?: string;
  required?: boolean;
  tooltip?: string;
  width?: Width;
}

// Use forwardRef so Hook Form can manage the input focus
export const TextArea = forwardRef<HTMLTextAreaElement, PropTypes>(
  ({ error, label, required = false, tooltip, width, ...props }, ref) => {
    return (
      <div className={`form-textarea-input ${getInputWidth(width)}`}>
        {label && (
          <div className="top">
            <label>
              {label}
              {!required && <OptionalField />}
            </label>
            {tooltip && <TooltipWithIcon tooltipText={tooltip} />}
          </div>
        )}
        <textarea aria-invalid={!!error} rows={6} ref={ref} {...props} />
        <ErrorMessage error={error} label={label} />
      </div>
    );
  }
);

export default TextArea;

import { forwardRef, InputHTMLAttributes } from 'react';
import { FieldError } from 'react-hook-form';
import './textInput.css';
import TooltipWithIcon from 'UI/Reusable/TooltipWithIcon/TooltipWithIcon';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
import { getInputWidth, Width } from '../utils';
import RequiredField from '../RequiredField/RequiredField';
import AdvisoryMessage from '../AdvisoryMessage/AdvisoryMessage';

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
              {required && <RequiredField />}
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

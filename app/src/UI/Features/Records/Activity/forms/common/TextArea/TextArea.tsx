import { forwardRef, InputHTMLAttributes } from 'react';
import { FieldError } from 'react-hook-form';
import './textArea.css';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
import { getInputWidth, Width } from '../utils';
import TooltipWithIcon from 'UI/Reusable/TooltipWithIcon/TooltipWithIcon';
import RequiredField from '../RequiredField/RequiredField';

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
              {required && <RequiredField />}
            </label>
            {tooltip && <TooltipWithIcon tooltipText={tooltip} />}
          </div>
        )}
        <textarea rows={6} ref={ref} {...props} />
        <ErrorMessage error={error} label={label} />
      </div>
    );
  }
);

export default TextArea;

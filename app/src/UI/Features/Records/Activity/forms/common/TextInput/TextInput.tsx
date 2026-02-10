import { forwardRef, InputHTMLAttributes } from 'react';
import { FieldError } from 'react-hook-form';
import './textInput.css';
import TooltipWithIcon from 'UI/Reusable/TooltipWithIcon/TooltipWithIcon';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
import { getInputWidth, Width } from '../utils';
import RequiredField from '../RequiredField/RequiredField';

interface PropTypes extends InputHTMLAttributes<HTMLInputElement> {
  error?: FieldError;
  label?: string;
  required?: boolean;
  small?: boolean;
  tooltip?: string;
  width?: Width;
}

// Use forwardRef so Hook Form can manage the input focus
export const TextInput = forwardRef<HTMLInputElement, PropTypes>(
  ({ error, label, required = false, small, tooltip, width, ...props }, ref) => {
    return (
      <div className={`form-text-input ${getInputWidth(width)}`}>
        {label && (
          <label>
            {label}
            {required && <RequiredField />}
            {tooltip && <TooltipWithIcon tooltipText={tooltip} />}
          </label>
        )}
        <input type="text" className={small ? 'small' : ''} ref={ref} {...props} />
        {error && <ErrorMessage error={error} label={label} />}
      </div>
    );
  }
);

export default TextInput;

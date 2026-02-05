import { forwardRef, InputHTMLAttributes } from 'react';
import { FieldError } from 'react-hook-form';
import './numberInput.css';
import TooltipWithIcon from 'UI/Reusable/TooltipWithIcon/TooltipWithIcon';

interface PropTypes extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  readOnly?: boolean;
  tooltip?: string;
  placeHolder?: string;
  error?: FieldError;
}

// Use forwardRef so Hook Form can manage the input focus
export const NumberInput = forwardRef<HTMLInputElement, PropTypes>(
  ({ label, readOnly = false, error, tooltip, ...props }, ref) => {
    const errorMessage = (() => {
      if (error?.message) return error.message;
      if (error?.type === 'required') return `${label} is Required`;
      return '';
    })();
    return (
      <div className="form-number-input">
        {label && (
          <label>
            {label}
            {tooltip && <TooltipWithIcon tooltipText={tooltip} />}
          </label>
        )}
        <input type="number" placeholder={props?.placeholder ?? label} readOnly={readOnly} ref={ref} {...props} />
        {errorMessage && <span className="error">{errorMessage}</span>}
      </div>
    );
  }
);

export default NumberInput;

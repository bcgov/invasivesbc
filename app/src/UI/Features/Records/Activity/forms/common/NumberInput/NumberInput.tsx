import { forwardRef, InputHTMLAttributes } from 'react';
import { FieldError } from 'react-hook-form';
import './numberInput.css';
import TooltipWithIcon from 'UI/Reusable/TooltipWithIcon/TooltipWithIcon';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
import { getInputWidth, Width } from '../utils';
import RequiredField from '../RequiredField/RequiredField';
import AdvisoryMessage from '../AdvisoryMessage/AdvisoryMessage';

interface PropTypes extends InputHTMLAttributes<HTMLInputElement> {
  error?: FieldError;
  label?: string;
  placeHolder?: string;
  advisoryText?: string;
  readOnly?: boolean;
  required?: boolean;
  tooltip?: string;
  width?: Width;
}

// Use forwardRef so Hook Form can manage the input focus
export const NumberInput = forwardRef<HTMLInputElement, PropTypes>(
  ({ error, label, advisoryText, readOnly = false, required = false, tooltip, width, ...props }, ref) => {
    return (
      <div className={`form-number-input ${getInputWidth(width)}`}>
        {label && (
          <div className="top">
            <label>
              {label}
              {required && <RequiredField />}
            </label>
            {tooltip && <TooltipWithIcon tooltipText={tooltip} />}
          </div>
        )}
        <input
          type="number"
          aria-invalid={!!error}
          placeholder={props?.placeholder ?? label}
          readOnly={readOnly}
          ref={ref}
          {...props}
        />
        <ErrorMessage error={error} label={label} />
        {advisoryText && <AdvisoryMessage text={advisoryText} />}
      </div>
    );
  }
);

export default NumberInput;

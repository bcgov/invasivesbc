import { forwardRef, InputHTMLAttributes } from 'react';
import { FieldError } from 'react-hook-form';
import TooltipWithIcon from 'UI/Reusable/TooltipWithIcon/TooltipWithIcon';
import ErrorMessage from 'UI/Features/Records/Activity/forms/common/ErrorMessage/ErrorMessage';
import { getInputWidth, Width } from 'UI/Features/Records/Activity/forms/common/utils';
import AdvisoryMessage from 'UI/Features/Records/Activity/forms/common/AdvisoryMessage/AdvisoryMessage';
import OptionalField from 'UI/Features/Records/Activity/forms/common/OptionalField/OptionalField';
import './numberInput.css';

interface PropTypes extends InputHTMLAttributes<HTMLInputElement> {
  error?: FieldError;
  label?: string;
  placeHolder?: string;
  advisoryText?: string;
  readOnly?: boolean;
  required?: boolean;
  tooltip?: string;
  width?: Width;
  acceptFloats?: boolean;
  step?: number | 'any';
}

// Use forwardRef so Hook Form can manage the input focus
export const NumberInput = forwardRef<HTMLInputElement, PropTypes>(
  (
    {
      acceptFloats = false,
      step = 'any',
      error,
      label,
      advisoryText,
      readOnly = false,
      required = false,
      tooltip,
      width,
      ...props
    },
    ref
  ) => {
    // Allow any float if acceptFloats is true, or set step size if provided. Else default to integers
    const stepVal = !Number.isNaN(step) || acceptFloats ? step : 1;
    return (
      <div className={`form-number-input ${getInputWidth(width)}`}>
        {label && (
          <div className="top">
            <label>
              {label}
              {!required && <OptionalField />}
            </label>
            {tooltip && <TooltipWithIcon tooltipText={tooltip} />}
          </div>
        )}
        <input
          type="number"
          aria-invalid={!!error}
          placeholder={props?.placeholder ?? label}
          readOnly={readOnly}
          step={stepVal}
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

import { forwardRef, InputHTMLAttributes } from 'react';
import { FieldError } from 'react-hook-form';
import TooltipWithIcon from 'UI/Reusable/TooltipWithIcon/TooltipWithIcon';
import ErrorMessage from 'UI/Features/Records/Activity/forms/common/ErrorMessage/ErrorMessage';
import { getInputWidth, Width } from 'UI/Features/Records/Activity/forms/common/utils';
import AdvisoryMessage from 'UI/Features/Records/Activity/forms/common/AdvisoryMessage/AdvisoryMessage';
import './checkboxInput.css';

interface PropTypes extends InputHTMLAttributes<HTMLInputElement> {
  error?: FieldError;
  label?: string;
  advisoryText?: string;
  tooltip?: string;
  width?: Width;
}
export const CheckboxInput = forwardRef<HTMLInputElement, PropTypes>(
  ({ error, advisoryText, label, tooltip, name, width, ...props }, ref) => {
    return (
      <div className={`form-checkbox-input ${getInputWidth(width)}`}>
        <div className="row">
          <input type="checkbox" aria-invalid={!!error} id={name} ref={ref} {...props} />
          <div className="label-section">
            {label && (
              <label htmlFor={name} className="side-label">
                {label}
              </label>
            )}
            {tooltip && <TooltipWithIcon tooltipText={tooltip} />}
          </div>
        </div>

        {advisoryText && <AdvisoryMessage text={advisoryText} />}
        {error && <ErrorMessage error={error} label={label} />}
      </div>
    );
  }
);

export default CheckboxInput;

import FormCode from 'interfaces/FormCode';
import { forwardRef, InputHTMLAttributes } from 'react';
import { FieldError } from 'react-hook-form';
import './singleSelect.css';
import TooltipWithIcon from 'UI/Reusable/TooltipWithIcon/TooltipWithIcon';
import ErrorMessage from '../ErrorMessage/ErrorMessage';

interface PropTypes extends InputHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: FieldError;
  tooltip?: string;
  options: Array<FormCode>;
}

export const SingleSelect = forwardRef<HTMLSelectElement, PropTypes>(
  ({ label, error, options, tooltip, ...props }, ref) => {
    console.log('SingleSelect Error', error);
    return (
      <div className="form-select-input">
        {label && (
          <label>
            {label}
            {tooltip && <TooltipWithIcon tooltipText={tooltip} />}
          </label>
        )}
        <select ref={ref} {...props}>
          <option value="">None Selected</option>
          {options.map((o) => (
            <option value={o.code} key={o.code}>
              {o.full_name}
            </option>
          ))}
        </select>
        {error && <ErrorMessage message={error.message} />}
      </div>
    );
  }
);

export default SingleSelect;

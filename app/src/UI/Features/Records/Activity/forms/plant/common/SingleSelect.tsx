import { optionsList } from '@rjsf/utils';
import { forwardRef, InputHTMLAttributes } from 'react';
import { FieldError } from 'react-hook-form';

interface PropTypes extends InputHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: FieldError;
  options: Record<PropertyKey, any>;
}

export const SingleSelect = forwardRef<HTMLSelectElement, PropTypes>(({ label, error, options, ...props }, ref) => {
  return (
    <div className="form-text-input">
      {label && <label>{label}</label>}
      <select ref={ref} {...props}>
        {options.map((o) => (
          <option value={o.code}>{o.full_name}</option>
        ))}
      </select>
      {error && <span style={{ color: 'red', fontSize: '12px' }}>{error.message}</span>}
    </div>
  );
});

export default SingleSelect;

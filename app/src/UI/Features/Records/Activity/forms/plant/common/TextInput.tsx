import { forwardRef, InputHTMLAttributes } from 'react';
import { FieldError } from 'react-hook-form';

interface PropTypes extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: FieldError;
}

// Use forwardRef so Hook Form can manage the input focus
export const TextInput = forwardRef<HTMLInputElement, PropTypes>(({ label, error, ...props }, ref) => {
  return (
    <div className="form-text-input">
      {label && <label>{label}</label>}
      <input ref={ref} {...props} />
      {error && <span style={{ color: 'red', fontSize: '12px' }}>{error.message}</span>}
    </div>
  );
});

export default TextInput;

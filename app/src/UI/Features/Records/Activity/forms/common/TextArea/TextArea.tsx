import { forwardRef, InputHTMLAttributes } from 'react';
import { FieldError } from 'react-hook-form';
import './textArea.css';

interface PropTypes extends InputHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: FieldError;
}

// Use forwardRef so Hook Form can manage the input focus
export const TextArea = forwardRef<HTMLTextAreaElement, PropTypes>(({ label, error, ...props }, ref) => {
  return (
    <div className="form-textarea-input">
      {label && <label>{label}</label>}
      <textarea rows={4} ref={ref} {...props} />
      {error && <span className="error">{error.message}</span>}
    </div>
  );
});

export default TextArea;

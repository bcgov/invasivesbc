import { forwardRef, InputHTMLAttributes } from 'react';
import { FieldError } from 'react-hook-form';
import './textArea.css';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
import { getInputWidth, Width } from '../utils';

interface PropTypes extends InputHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: FieldError;
  width?: Width;
}

// Use forwardRef so Hook Form can manage the input focus
export const TextArea = forwardRef<HTMLTextAreaElement, PropTypes>(({ label, error, width, ...props }, ref) => {
  return (
    <div className={`form-textarea-input ${getInputWidth(width)}`}>
      {label && <label>{label}</label>}
      <textarea rows={4} ref={ref} {...props} />
      <ErrorMessage error={error} label={label} />
    </div>
  );
});

export default TextArea;

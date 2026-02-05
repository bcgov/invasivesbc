import { FieldError } from 'react-hook-form';
import './errorMessage.css';

type PropTypes = {
  error?: FieldError;
  label?: string;
};

const ErrorMessage = ({ error, label }: PropTypes) => {
  const errorMessage = (() => {
    if (error?.message) return error.message;
    if (error?.type === 'required' && label) return `${label} is required`;
    if (error?.type === 'required') return 'required';
    return '';
  })();
  return <span className="form-error">{errorMessage}</span>;
};

export default ErrorMessage;

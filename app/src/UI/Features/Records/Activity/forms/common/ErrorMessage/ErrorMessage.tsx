import './errorMessage.css';

type PropTypes = {
  message?: string;
};

const ErrorMessage = ({ message }: PropTypes) => {
  return <span className="form-error">{message}</span>;
};

export default ErrorMessage;

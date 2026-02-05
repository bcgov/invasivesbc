import { forwardRef, InputHTMLAttributes } from 'react';
import { FieldError } from 'react-hook-form';
import './textInput.css';
import TooltipWithIcon from 'UI/Reusable/TooltipWithIcon/TooltipWithIcon';
import ErrorMessage from '../ErrorMessage/ErrorMessage';

interface PropTypes extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: FieldError;
  small?: boolean;
  tooltip?: string;
  onRemove?: () => void;
}

// Use forwardRef so Hook Form can manage the input focus
export const TextInput = forwardRef<HTMLInputElement, PropTypes>(
  ({ label, error, small, onRemove, tooltip, ...props }, ref) => {
    console.log('Here', error);
    return (
      <div className="form-text-input">
        {label && (
          <label>
            {label}
            {tooltip && <TooltipWithIcon tooltipText={tooltip} />}
          </label>
        )}
        <div>
          <input type="text" className={small ? 'small' : ''} ref={ref} {...props} />
          {onRemove && <button onClick={onRemove}>Delete</button>}
        </div>
        {error && <ErrorMessage message={error.message} />}
      </div>
    );
  }
);

export default TextInput;

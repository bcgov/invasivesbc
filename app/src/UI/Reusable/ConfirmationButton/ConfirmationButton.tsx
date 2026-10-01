import { ComponentPropsWithoutRef, FocusEvent, MouseEvent, ReactNode, useState } from 'react';
import Button from '../Button/Button';
import { Warning } from '@mui/icons-material';

interface InputButtonProps extends ComponentPropsWithoutRef<'button'> {
  size?: 'sm' | 'med' | 'lg';
  confirmationPrompt?: ReactNode;
  variant?: 'contained' | 'outlined' | 'destructive' | 'icon' | 'none';
}

/**
 * @desc Button containing "Are you sure?" confirmation sequence.
 */
const ConfirmationButton = ({
  size = 'med',
  className = '',
  confirmationPrompt,
  variant,
  children,
  onClick,
  onBlur,
  ...props
}: InputButtonProps) => {
  const [prompted, setPrompted] = useState<boolean>(false);

  const handleBlur = (evt: FocusEvent<HTMLButtonElement>) => {
    onBlur?.(evt);
    setPrompted(false);
  };

  const handleClick = (evt: MouseEvent<HTMLButtonElement>) => {
    if (prompted) {
      onClick?.(evt);
    } else {
      setPrompted(true);
    }
  };
  return (
    <Button
      type="button"
      className={`invasives-button ${prompted ? 'destructive' : ''} ${className} ${size} ${variant ?? ''}`}
      onClick={handleClick}
      onBlur={handleBlur}
      {...props}
    >
      {!prompted
        ? children
        : (confirmationPrompt ?? (
            <>
              <Warning /> &nbsp;Are you sure?
            </>
          ))}
    </Button>
  );
};

export type { InputButtonProps };
export default ConfirmationButton;

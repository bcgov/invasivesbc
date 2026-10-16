import { FocusEvent, MouseEvent, ReactNode, useState } from 'react';
import Button, { InputButtonProps } from 'UI/Reusable/Button/Button';
import { Warning } from '@mui/icons-material';

interface PropTypes extends InputButtonProps {
  confirmationPrompt?: ReactNode;
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
}: PropTypes) => {
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

import { Button, Popover } from '@mui/material';
import { MouseEvent, ReactNode, TouchEvent, useState } from 'react';

/**
 * @property { boolean } closeAfterPress Popover should close after an internal click is registered
 * @property { string } buttonClasses classes to assign the button component for custom styling
 * @property { string } buttonText displayed text in the button component
 * @property { Object } buttonOverrideOptions Disables the default button, takes props to set show/hide functionality
 * @property { HTMLElement | null } buttonOverrideOptions.anchorEl HTML element triggering event, used to anchor the Popover in place
 * @property { (anchorEl: HTMLElement | null) => void } buttonOverrideOptions.setAnchorEl setter for the Anchor Element, needed to clear the popover from the view
 * @property { ReactNode } children Rendered display inside of popover
 * @property { number | string } horizontal relative horizontal postion for popover to appear
 * @property { number | string } vertical relative vertical postion for popover to appear
 */
type PropTypes = {
  closeAfterPress?: boolean;
  buttonClasses?: string;
  buttonOverrideOptions?: {
    anchorEl: HTMLElement | null;
    setAnchorEl: (anchorEl: HTMLElement | null) => void;
  };
  buttonText?: string;
  children: ReactNode;
  horizontal?: number | 'left' | 'center' | 'right';
  vertical?: number | 'top' | 'center' | 'bottom';
  disablePortal?: boolean;
};

/**
 * Reusable Popover container with self-contained button for ease if implementation/use
 */
const CustomPopover = ({
  buttonClasses = '',
  buttonText,
  buttonOverrideOptions,
  children,
  closeAfterPress = false,
  horizontal = 'center',
  vertical = 'center',
  disablePortal = false
}: PropTypes) => {
  const handleClick = (event: MouseEvent<HTMLButtonElement> | TouchEvent<HTMLButtonElement>) => {
    if (!buttonOverrideOptions) {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleClose = () => {
    if (buttonOverrideOptions) {
      buttonOverrideOptions.setAnchorEl(null);
    } else {
      setAnchorEl(null);
    }
  };

  const handleCloseAfterClick = () => {
    if (closeAfterPress) {
      if (buttonOverrideOptions) {
        buttonOverrideOptions.setAnchorEl(null);
      } else {
        setAnchorEl(null);
      }
    }
  };

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  return (
    <>
      {!buttonOverrideOptions && (
        <Button className={buttonClasses} variant={'contained'} onClick={handleClick}>
          {buttonText}
        </Button>
      )}
      <Popover
        open={!!anchorEl || !!buttonOverrideOptions?.anchorEl}
        anchorEl={anchorEl ?? buttonOverrideOptions?.anchorEl}
        anchorOrigin={{ vertical, horizontal }}
        onClick={handleCloseAfterClick}
        onClose={handleClose}
        disablePortal={disablePortal}
        style={{ zIndex: 100001 }}
      >
        {children}
      </Popover>
    </>
  );
};

export default CustomPopover;

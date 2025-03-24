import { Button, Popover } from '@mui/material';
import { nanoid } from '@reduxjs/toolkit';
import { MouseEvent, ReactNode, TouchEvent, useState } from 'react';

/**
 * @property { boolean } closeAfterPress Popover should close after an internal click is registered
 * @property { string } buttonClasses classes to assign the button component for custom styling
 * @property { string } buttonText displayed text in the button component
 * @property { ReactNode } children Rendered display inside of popover
 * @property { number | string } horizontal relative horizontal postion for popover to appear
 * @property { number | string } vertical relative vertical postion for popover to appear
 */
type PropTypes = {
  closeAfterPress?: boolean;
  buttonClasses?: string;
  buttonText?: string;
  children: ReactNode;
  horizontal?: number | 'left' | 'center' | 'right';
  vertical?: number | 'top' | 'center' | 'bottom';
};

/**
 * Reusable Popover container with self-contained button for ease if implementation/use
 */
const CustomPopover = ({
  buttonClasses = '',
  buttonText,
  children,
  closeAfterPress = false,
  horizontal = 'center',
  vertical = 'center'
}: PropTypes) => {
  const [id] = useState<string>(nanoid());
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const handleClick = (event: MouseEvent<HTMLButtonElement> | TouchEvent<HTMLButtonElement>) =>
    setAnchorEl(event.currentTarget);
  const handleInnerClick = () => {
    if (closeAfterPress) {
      setAnchorEl(null);
    }
  };
  return (
    <>
      <Button aria-describedby={id} className={buttonClasses} variant={'contained'} onClick={handleClick}>
        {buttonText}
      </Button>
      <Popover
        open={!!anchorEl}
        id={id}
        anchorEl={anchorEl}
        anchorOrigin={{ vertical, horizontal }}
        onClose={() => setAnchorEl(null)}
      >
        <div onClick={handleInnerClick}>{children}</div>
      </Popover>
    </>
  );
};

export default CustomPopover;

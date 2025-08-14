import { IconButton, IconButtonProps } from '@mui/material';
import { MouseEvent, useRef } from 'react';
import './animatedIconButton.css';

/**
 * @property { string } animation name of animation to play
 */
interface PropTypes extends IconButtonProps {
  animation: 'rotate-on-click' | 'grow';
  durationInMs?: number;
}

/**
 * @desc Wrapper class for MUI Icon Buttons.
 *       hijacks the onClick event to play an animation with timeout
 */
const AnimatedIconButton = (props: PropTypes) => {
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const overrideOnClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (!btnRef.current) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    btnRef.current.classList.add(props.animation); // Add animation class.

    props?.onClick?.(e); // Call prop assigned button

    timeoutRef.current = window.setTimeout(() => {
      btnRef.current?.classList?.remove(props.animation); // Remove animation class
    }, props?.durationInMs ?? 2000);
  };

  return (
    <IconButton
      {...props}
      ref={btnRef}
      className={`animated-icon-button ${props?.className}`}
      onClick={overrideOnClick}
    />
  );
};

export default AnimatedIconButton;

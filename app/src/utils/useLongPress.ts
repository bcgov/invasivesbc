import { useState, useRef } from 'react';

/**
 * @desc Optional Settings for hook
 * @property {Function} onClick Event for click events, when longpresses end early
 * @property {number} delay time of longpress in ms
 */
interface Options {
  onClick?: Function;
  delay?: number;
}

/**
 * @desc Custom event hook for longpress. can fire an event after a longpress, or optionally add a separate function for onClick
 *       Use:
 *        1.Import longPressEvent to component file,
 *           - const { handlers } = longPressEvent(callbackFunction, {options});
 *        2. use rest parameters as attributes on longpress target
 *           - <button {...handlers}> Press Me!</button>
 *
 * @summary Custom Callback event hook for longpress, works for mobile and pc
 * @external {@link https://github.com/colbyfayock/my-long-press} Source reference, refactored to TS and modified.
 * @param callback Action to follow longpress.
 * @param {Options} options additional customization
 * @returns custom hook for longpress event.
 */
const useLongPress = (callback: Function, options?: Options) => {
  enum Actions {
    longpress,
    click
  }
  const [action, setAction] = useState<Actions>();

  const timerRef = useRef<ReturnType<typeof setInterval>>({} as ReturnType<typeof setInterval>);
  const isLongPress = useRef<boolean>(false);

  const startPressTimer = () => {
    isLongPress.current = false;
    timerRef.current = setTimeout(() => {
      isLongPress.current = true;
      setAction(Actions.longpress);
    }, 500);
  };

  const handleOnClick = (e) => {
    if (isLongPress.current) {
      callback();
      return;
    }
    if (options?.onClick) {
      options.onClick();
    }
    setAction(Actions.click);
  };

  const handleOnMouseDown = () => startPressTimer();
  const handleOnMouseUp = () => clearTimeout(timerRef.current);
  const handleOnTouchStart = () => startPressTimer();
  const handleOnTouchEnd = () => {
    if (action === Actions.longpress) return;
    clearTimeout(timerRef.current);
  };

  return {
    handlers: {
      onClick: handleOnClick,
      onMouseDown: handleOnMouseDown,
      onMouseUp: handleOnMouseUp,
      onTouchStart: handleOnTouchStart,
      onTouchEnd: handleOnTouchEnd
    }
  };
};

export default useLongPress;

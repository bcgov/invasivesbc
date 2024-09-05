import { useState, useRef } from 'react';

/**
 * @desc Optional Settings for hook
 * @property {Function} onClickCallback Event for click events, when longpresses end early
 * @property {number} delay time of longpress in ms
 */
interface Options {
  onClickCallback?: Function;
  delay?: number;
}

/**
 * @desc Custom Callback event hook for longpress, works for mobile and pc
 * @external {@link https://github.com/colbyfayock/my-long-press} Source, refactored to TS and modified.
 * @param callback Action to follow longpress.
 * @param {Options} options additional customization
 * @returns custom hook for longpress event.
 */
const longPressEvent = (callback: Function, options?: Options) => {
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
    if (options?.onClickCallback) {
      options.onClickCallback();
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

export default longPressEvent;

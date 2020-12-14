/**
 * Wraps a function in a debounce function, which prevents it from being called until a delay period has elapsed.
 * Repeated calls within the delay period will reset the delay.
 *
 * @param {number} delay delay in milliseconds between calls that must elapse before the function will be executed
 * @param {(...args: any) => any} fn function to debounce
 * @returns {(...args: any) => any}
 */
export const debounced = function (delay: number, fn: (...args: any) => any): (...args: any) => any {
  let timerId: NodeJS.Timeout;

  return (...args) => {
    if (timerId) {
      clearTimeout(timerId);
    }

    timerId = setTimeout(() => {
      fn(...args);
      timerId = null;
    }, delay);
  };
};

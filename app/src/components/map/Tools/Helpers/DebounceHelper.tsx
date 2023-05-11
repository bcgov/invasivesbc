import { useEffect, useRef } from "react";

export function useDebouncedEffect(callback, delay, dependencies) {
  const timeoutRef = useRef(null);

  useEffect(() => {
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callback();
    }, delay);

    return () => {
      clearTimeout(timeoutRef.current);
    };
  }, dependencies);
}
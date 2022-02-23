import { useRef } from 'react';
import { useLayoutEffect } from './useLayoutEffect';

export function useFocusRef<T extends HTMLOrSVGElement>(isSelected: boolean) {
  const ref = useRef<T>(null);

  useLayoutEffect(() => {
    if (!isSelected) return;
    ref.current?.focus({ preventScroll: true });
  }, [isSelected]);

  try {
    return {
      ref,
      tabIndex: isSelected ? 0 : -1
    };
  } catch (e) {
    console.log('oh no');
    console.log(e);
  }
}

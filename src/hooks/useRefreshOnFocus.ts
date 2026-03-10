import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useRef } from 'react';

/**
 * Calls `refresh` whenever the screen regains focus, skipping the initial mount.
 * Wrap the passed function in `useCallback` to keep its reference stable.
 */
export function useRefreshOnFocus(refresh: () => void) {
  const hasMounted = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (hasMounted.current) {
        refresh();
      } else {
        hasMounted.current = true;
      }
    }, [refresh]),
  );
}

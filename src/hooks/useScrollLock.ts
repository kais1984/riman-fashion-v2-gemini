import { useEffect, useRef } from 'react';

/**
 * useScrollLock – Prevent page scrolling while a modal or overlay is open.
 *
 * The original implementation used `useLayoutEffect` and captured the
 * `originalStyle` each time the hook ran. When the lock toggled quickly
 * the stored original value could be overwritten, resulting in the
 * page remaining scroll‑locked after the component unmounted.
 *
 * This version stores the original overflow style in a `ref` so it is
 * captured **once** when the lock becomes active, and restored reliably
 * when the lock is released or the component unmounts.
 */
export function useScrollLock(lock: boolean) {
  const originalOverflow = useRef<string>('');

  useEffect(() => {
    if (lock) {
      // Save the current overflow style only the first time we lock.
      originalOverflow.current = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    } else {
      // When unlocking, restore the previously saved value.
      document.body.style.overflow = originalOverflow.current || '';
    }
    // Ensure cleanup on unmount restores the overflow style.
    return () => {
      document.body.style.overflow = originalOverflow.current || '';
    };
  }, [lock]);
}

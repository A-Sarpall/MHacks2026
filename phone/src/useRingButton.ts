import { useRef } from 'react';
export type PressAction = 'click' | 'double' | 'hold';

const DOUBLE_MS = 260;

/** One big button, three gestures: tap = click, double tap = double, long press = hold. */
export function useRingButton(send: (a: PressAction) => void) {
  const taps = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  return {
    onTap() {
      taps.current++;
      clearTimeout(timer.current);
      if (taps.current >= 2) {
        taps.current = 0;
        send('double');
        return;
      }
      timer.current = setTimeout(() => {
        taps.current = 0;
        send('click');
      }, DOUBLE_MS);
    },
    onHold() {
      clearTimeout(timer.current);
      taps.current = 0;
      send('hold');
    },
  };
}

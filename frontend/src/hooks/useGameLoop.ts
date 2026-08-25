// requestAnimationFrame loop with delta time
import { useRef, useEffect, useCallback } from 'react';

export function useGameLoop(
  callback: (deltaTime: number, time: number) => void,
  running: boolean = true
): void {
  const callbackRef = useRef(callback);
  const frameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  // Keep callback ref up to date
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const loop = useCallback((timestamp: number) => {
    if (lastTimeRef.current === 0) {
      lastTimeRef.current = timestamp;
    }

    const deltaTime = Math.min((timestamp - lastTimeRef.current) / 1000, 0.1); // cap at 100ms
    lastTimeRef.current = timestamp;

    callbackRef.current(deltaTime, timestamp / 1000);

    frameRef.current = requestAnimationFrame(loop);
  }, []);

  useEffect(() => {
    if (running) {
      lastTimeRef.current = 0;
      frameRef.current = requestAnimationFrame(loop);
    }

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [running, loop]);
}

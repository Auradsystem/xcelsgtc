import { useRef, useEffect, useState } from 'react';

interface AnimationFrameOptions {
  duration?: number;
  fps?: number;
  onComplete?: () => void;
}

export const useAnimationFrame = (
  callback: (progress: number, deltaTime: number) => void,
  options: AnimationFrameOptions = {}
) => {
  const { duration = 0, fps = 60, onComplete } = options;
  const requestRef = useRef<number>(0);
  const previousTimeRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const [isRunning, setIsRunning] = useState(false);
  const frameInterval = 1000 / fps;
  const lastFrameTimeRef = useRef<number>(0);

  const animate = (time: number) => {
    if (!isRunning) return;

    if (startTimeRef.current === 0) {
      startTimeRef.current = time;
    }

    const deltaTime = time - (previousTimeRef.current || time);
    previousTimeRef.current = time;

    // Limit frame rate
    if (time - lastFrameTimeRef.current >= frameInterval) {
      lastFrameTimeRef.current = time;

      // Calculate progress (0 to 1) if duration is set
      const progress = duration > 0 
        ? Math.min((time - startTimeRef.current) / duration, 1) 
        : 0;

      callback(progress, deltaTime);

      // Check if animation is complete
      if (duration > 0 && progress >= 1) {
        stop();
        if (onComplete) onComplete();
        return;
      }
    }

    requestRef.current = requestAnimationFrame(animate);
  };

  const start = () => {
    if (!isRunning) {
      setIsRunning(true);
      startTimeRef.current = 0;
      previousTimeRef.current = 0;
      lastFrameTimeRef.current = 0;
    }
  };

  const stop = () => {
    setIsRunning(false);
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
  };

  const reset = () => {
    stop();
    startTimeRef.current = 0;
    previousTimeRef.current = 0;
    lastFrameTimeRef.current = 0;
  };

  useEffect(() => {
    if (isRunning) {
      requestRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isRunning]);

  return { start, stop, reset, isRunning };
};

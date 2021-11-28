import { useLayoutEffect, useRef, useState } from "react";

export function useCanvas(width?: number, height?: number) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvas = canvasRef.current;

  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);

  useLayoutEffect(() => {
    if (!context && canvas) {
      setContext(canvas.getContext("2d"));
    }
  });

  return {
    Canvas: context,
  };
}

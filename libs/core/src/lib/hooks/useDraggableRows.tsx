import React, { Ref, useCallback, useEffect, useRef } from 'react';

const draggOffset = 10;
const ratio = 2;

export function useDragableRows(grid: any, container: any) {
  const mousedownPosition = useRef<{ left: number; top: number } | undefined>();
  const mousedownOffset = useRef<{ left: number; top: number } | undefined>();
  const isDragging = useRef(false);
  const draggedElement = useRef<HTMLDivElement>();

  const handleMouseMove = useRef((e: MouseEvent) => {
    if (
      !isDragging.current &&
      (e.clientX > (mousedownPosition.current?.left || 0) + draggOffset ||
        e.clientX < (mousedownPosition.current?.left || 0) - draggOffset ||
        e.clientY > (mousedownPosition.current?.top || 0) + draggOffset ||
        e.clientY < (mousedownPosition.current?.top || 0) - draggOffset)
    ) {
      isDragging.current = true;
      const boundingRect = container.current.getBoundingClientRect();
      draggedElement.current = document.createElement('div');
      draggedElement.current.style.position = 'fixed';
      draggedElement.current.style.left = '0px';
      draggedElement.current.style.top = '0px';
      draggedElement.current.style.width = boundingRect.width + 'px';
      draggedElement.current.style.height = grid.current?.rowHeight + 'px';
      draggedElement.current.style.boxShadow =
        '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)';
      const canvas = document.createElement('canvas');
      canvas.style.width = boundingRect.width + 'px';
      canvas.style.height = grid.current?.rowHeight + 'px';
      canvas.width = boundingRect.width * ratio;
      canvas.height = grid.current?.rowHeight * ratio;
      draggedElement.current.appendChild(canvas);
      document.body.appendChild(draggedElement.current);

      grid.current.startDraggingRowAtPosition(
        Math.max((mousedownPosition.current?.top || 0) - boundingRect.y, 0)
      );
      grid.current.drawRowToCanvasAtPosition(
        canvas,
        Math.max((mousedownPosition.current?.top || 0) - boundingRect.y, 0)
      );
    }
    if (isDragging.current && draggedElement.current) {
      const boundingRect = container.current.getBoundingClientRect();
      grid.current.dragRowToPosition(Math.max(e.clientY - boundingRect.y, 0));
      const x = e.clientX - (mousedownOffset.current?.left || 0);
      const y = e.clientY - (mousedownOffset.current?.top || 0);
      draggedElement.current.style.transform = `translate(${x}px, ${y}px)`;
    }
  });

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!grid.current.options.moveableRows) {
      return;
    }
    mousedownPosition.current = { left: e.clientX, top: e.clientY };
    window.addEventListener('mousemove', handleMouseMove.current);
    const boundingRect = container.current.getBoundingClientRect();
    mousedownOffset.current = {
      left: e.clientX - boundingRect.x,
      top: grid.current.rowHeight / 2,
    };
    window.addEventListener(
      'mouseup',
      () => {
        window.removeEventListener('mousemove', handleMouseMove.current);
        if (isDragging) {
          isDragging.current = false;
          if (draggedElement.current) {
            document.body.removeChild(draggedElement.current);
          }
          draggedElement.current = undefined;
          grid.current.stopDraggingRow();
        }
      },
      { once: true }
    );
  }, []);

  return { handleMouseDown };
}

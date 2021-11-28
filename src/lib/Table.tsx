import React, {
  MouseEvent,
  ReactElement,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Grid } from "./Grid";
import { useCanvas } from "./hooks/useCanvas";
import useResizeObserver from "use-resize-observer";
import { ColumnConfig } from "./types/ColumnConfig";
import { TableHeader } from "./TableHeader";
import { calculateColumnWidths, debounce } from "./utils/Util";
import { GridStub } from "./GridStub";

interface TableProps {
  data: any[];
  columns?: ColumnConfig[];
}

let ratio = 2;

export function Table(props: TableProps): ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasWrapperRef = useRef<HTMLCanvasElement>(null);
  const fakeScroll = useRef<HTMLDivElement>();
  const { width = 1, height = 1 } = useResizeObserver<HTMLDivElement>({
    box: "border-box",
    ref: fakeScroll.current,
  });

  const [grid, setGrid] = useState<GridStub | undefined>();
  const [top, setTop] = useState(0);
  const [left, setLeft] = useState(0);

  const scrollWidth = useMemo(() => {
    return calculateColumnWidths(props.columns || [], width - 18, ratio).reduce(
      (prev, next) => prev + next,
      0
    );
  }, []);

  const handleSroll = () => {
    const maxScrollTop =
      (gridRef.current?.rowHeight || 0) * (props.data.length || 0) - height;
    const top =
      (fakeScroll?.current?.scrollTop || 0) < maxScrollTop
        ? fakeScroll.current?.scrollTop || 0
        : maxScrollTop;

    const maxScrollLeft = scrollWidth;

    const left =
      (fakeScroll?.current?.scrollLeft || 0) < maxScrollLeft
        ? fakeScroll.current?.scrollLeft || 0
        : maxScrollLeft;

    if (gridRef.current) {
      gridRef.current.top = top;
      gridRef.current.left = left;
    }
    setTop(top);
    setLeft(left);
  };

  const gridRef = useRef<GridStub>();
  const hasScrollListenerRef = useRef(false);
  useEffect(() => {
    const handleScrollEvent = () => handleSroll();
    if (!gridRef.current && canvasRef.current) {
      const newGrid = new GridStub(canvasRef.current);
      gridRef.current = newGrid;
      setGrid(newGrid);
      if (!hasScrollListenerRef.current) {
        fakeScroll.current?.addEventListener("scroll", handleScrollEvent);
        hasScrollListenerRef.current = true;
      }
    }
  });

  useEffect(() => {
    if (props.data && grid) {
      grid.data = props.data;
    }
  }, [grid, props.data]);

  useEffect(() => {
    if (grid) {
      grid.width = (width - 18) * ratio;
      grid.height = height * ratio;
    }
  }, [grid, width, height]);

  useEffect(() => {
    if (props.columns && grid) {
      grid.columnConfig = props.columns;
    }
  }, [grid, props.columns]);

  // useEffect(() => {
  //   if (grid && width && props.columns) {
  //     requestAnimationFrame(() => {
  //       grid?.calculateColumnWidths(props.columns || []);
  //       grid?.redraw();
  //     });
  //   }
  // }, [grid, width]);

  const handleClick = (e: MouseEvent) => {
    grid?.fireClickEvent({
      left: e.nativeEvent.offsetX,
      top: e.nativeEvent.offsetY,
      shiftKey: e.shiftKey,
    }),
      {
        passive: true,
      };
  };

  return (
    <div
      style={{
        height: "100%",
        width: "100%",
        overflow: "hidden",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <TableHeader columns={props.columns} scrollLeft={left} />
      <div
        ref={fakeScroll as any}
        style={{
          flex: 1,
          width: "100%",
          overflow: "auto",
          position: "relative",
        }}
      >
        <div
          ref={canvasWrapperRef as any}
          style={{
            position: "absolute",
            transform: `translate(${left}px, ${top}px)`,
            pointerEvents: "none",
          }}
        >
          <canvas
            ref={canvasRef}
            height={height * ratio}
            width={(width - 18) * ratio}
            style={{
              width: width - 18,
              height: height,
              pointerEvents: "all",
            }}
            onClick={handleClick}
          />
        </div>
        <div
          style={{
            height: (grid?.rowHeight || 0) * props.data.length,
            width: scrollWidth,
            position: "relative",
            overflow: "hidden",
            pointerEvents: "none",
          }}
        ></div>
      </div>
    </div>
  );
}

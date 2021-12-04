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
import { IFormatter } from "./formatter/IFormatter";

interface TableProps {
  data: any[];
  columns?: ColumnConfig[];
  onColumnsChange?(columns: ColumnConfig[]): void;
}

let ratio = 4;

export function Table(props: TableProps): ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasWrapperRef = useRef<HTMLCanvasElement>(null);
  const canvasRef2 = useRef<HTMLCanvasElement>(null);
  const canvasWrapperRef2 = useRef<HTMLCanvasElement>(null);
  const fakeScroll = useRef<HTMLDivElement>();
  const { width = 1, height = 1 } = useResizeObserver<HTMLDivElement>({
    box: "border-box",
    ref: fakeScroll.current,
  });

  const [dataHeight, setDataHeight] = useState(0);

  const [grid, setGrid] = useState<GridStub | undefined>();
  const [left, setLeft] = useState(0);

  const scrollWidth = useMemo(() => {
    return calculateColumnWidths(props.columns || [], width - 18, ratio).reduce(
      (prev, next) => prev + next,
      0
    );
  }, [props.columns]);

  const heightRef = useRef<number>();
  const dataHeigtRef = useRef<number>();
  const dataRef = useRef<any[]>();
  useEffect(() => {
    heightRef.current = height;
    dataHeigtRef.current = dataHeight;
    dataRef.current = props.data;
  }, [height, props.data, dataHeight]);

  const handleSroll = useCallback(() => {
    const maxScrollTop =
      (dataHeigtRef.current ||
        (gridRef.current?.rowHeight || 0) * (dataRef.current?.length || 0)) -
      (heightRef.current || 0);
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
    setLeft(left);
    if (gridRef.current?.nextWorker === 0) {
      canvasRef.current!.style.display = "none";
      canvasRef2.current!.style.display = "unset";
    } else {
      canvasRef2.current!.style.display = "none";
      canvasRef.current!.style.display = "unset";
    }

    if (canvasWrapperRef.current) {
      canvasWrapperRef.current.style.transform = `translate(${left}px, ${top}px)`;
    }
  }, []);

  const gridRef = useRef<GridStub>();
  const hasScrollListenerRef = useRef(false);
  useEffect(() => {
    if (!gridRef.current && canvasRef.current) {
      const newGrid = new GridStub([canvasRef.current, canvasRef2.current!]);
      newGrid.onHeightChange = (height: number) => {
        setDataHeight(height);
      };
      gridRef.current = newGrid;
      setGrid(newGrid);
      if (!hasScrollListenerRef.current) {
        fakeScroll.current?.addEventListener("scroll", handleSroll);
        hasScrollListenerRef.current = true;
      }
    }
  }, []);

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

  const handleColumnsChange = (columns: ColumnConfig[]) => {
    props.onColumnsChange?.(columns);
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
      <TableHeader
        columns={props.columns}
        scrollLeft={left}
        onColumnsChange={handleColumnsChange}
      />
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

          <canvas
            ref={canvasRef2}
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
            height: dataHeight || (grid?.rowHeight || 0) * props.data.length,
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

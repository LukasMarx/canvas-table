import React, {
  MouseEvent,
  ReactElement,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import useResizeObserver from "use-resize-observer";
import { ColumnConfig } from "./types/ColumnConfig";
import { TableHeader } from "./components/table-header/TableHeader";
import { calculateColumnWidths, debounce } from "./utils/Util";
import { GridStub } from "./GridStub";
import { GridOptions } from "./types/Grid";
import { DeepPartial } from "./types/DeepPartial";
import "./Table.css";
import { defaultOptions } from "./DefaultOptions";
import merge from "lodash.merge";

interface TableProps {
  data: any[];
  columns?: ColumnConfig[];
  onColumnsChange?(columns: ColumnConfig[]): void;
  options?: DeepPartial<GridOptions>;
}

let ratio = 2;

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

  const options = useMemo(() => {
    if (props.options) {
      return merge(defaultOptions, props.options);
    } else {
      return JSON.parse(JSON.stringify(defaultOptions));
    }
  }, [props.options]);

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
      const newGrid = new GridStub(
        [canvasRef.current, canvasRef2.current!],
        options
      );
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
    if (options && grid) {
      grid.options = options;
    }
  }, [grid, options]);

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

  const handleTableHeaderClick = useCallback(
    (e: React.MouseEvent, column: ColumnConfig) => {
      e.preventDefault();
      e.stopPropagation();
      const newColumnConfig = JSON.parse(
        JSON.stringify(props.columns || [])
      ) as ColumnConfig[];

      newColumnConfig.forEach((col) => {
        if (col.field === column.field && col.formatter === column.formatter) {
          if (e.ctrlKey) {
            delete col.sortIndex;
            delete col.sortDirection;
          } else if (e.shiftKey) {
            if (col.sortIndex !== undefined) {
              if (col.sortDirection === "asc") {
                col.sortDirection = "desc";
              } else if (col.sortDirection === "desc" || !col.sortDirection) {
                col.sortDirection = "asc";
              }
            } else {
              let nextIndex = 0;
              newColumnConfig.forEach((col) => {
                if (col.sortIndex !== undefined && col.sortIndex >= nextIndex) {
                  nextIndex = col.sortIndex + 1;
                }
              });
              col.sortIndex = nextIndex;
              col.sortDirection = "asc";
            }
          } else {
            col.sortIndex = 0;

            if (col.sortDirection === "asc") {
              col.sortDirection = "desc";
            } else if (col.sortDirection === "desc" || !col.sortDirection) {
              col.sortDirection = "asc";
            }
          }
        } else if (!e.shiftKey) {
          delete col.sortIndex;
          delete col.sortDirection;
        }
      });
      props.onColumnsChange?.(newColumnConfig);
    },
    [props.columns, props.onColumnsChange]
  );

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
        options={options}
        onClick={handleTableHeaderClick}
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
            backgroundColor: options?.theme?.palette?.backgroundColor,
            color: options?.theme?.palette?.textColor,
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

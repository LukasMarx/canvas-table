import React, {
  createRef,
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
import { createGrid, GridStub } from "./GridStub";
import { GridOptions } from "./types/Grid";
import { DeepPartial } from "./types/DeepPartial";
import "./Table.css";
import { defaultOptions } from "./DefaultOptions";
import merge from "lodash.merge";
import { formatters } from "./formatter";

interface TableProps {
  data: any[];
  columns?: ColumnConfig[];
  onColumnsChange?(columns: ColumnConfig[]): void;
  options?: DeepPartial<GridOptions>;
  threadCount?: number;
  useSingleWorker?: boolean;
}

let ratio = 2;

export function Table(props: TableProps): ReactElement {
  const fakeScroll = useRef<HTMLDivElement>();
  const { width = 1, height = 1 } = useResizeObserver<HTMLDivElement>({
    box: "border-box",
    ref: fakeScroll.current,
  });

  const threadCounter = useMemo(() => {
    const result: number[] = [];
    for (let i = 0; i < (props.threadCount || 1); i++) {
      result.push(i);
    }
    return result;
  }, []);

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
    heightRef.current = fakeScroll.current?.clientHeight || 0;
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
      gridRef.current.scrollLeft = left;
      gridRef.current.scrollTop = top;
    }
    setLeft(left);
    if ((props.threadCount || 0) > 1) {
      canvasRefs.current.forEach((canvas: any, index: number) => {
        if (gridRef.current?.nextWorker === index) {
          canvas.current.style.display = "unset";
        } else {
          canvas.current.style.display = "none";
        }
      });
    }

    // if (canvasWrapperRef.current) {
    //   canvasWrapperRef.current.style.transform = `translate(${left}px, ${top}px)`;
    // }
  }, [props.threadCount]);

  const gridRef = useRef<GridStub>();
  const hasScrollListenerRef = useRef(false);
  const canvasRefs = useRef<any>([]);
  canvasRefs.current = threadCounter.map(
    (element, i) => canvasRefs.current[i] ?? createRef()
  );

  useEffect(() => {
    if (!gridRef.current && canvasRefs.current) {
      const newGrid = createGrid(
        canvasRefs.current.map((x: any) => x.current),
        options,
        formatters,
        props.useSingleWorker
      );
      if (newGrid) {
        newGrid.onHeightChange = (height: number) => {
          setDataHeight(height);
        };
        gridRef.current = newGrid as any;
        setGrid(newGrid as any);
        if (!hasScrollListenerRef.current) {
          fakeScroll.current?.addEventListener("scroll", handleSroll);
          hasScrollListenerRef.current = true;
        }
      } else {
        throw new Error("Grid creation failed");
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
      grid.width = (fakeScroll.current?.clientWidth || 0) * ratio;
      grid.height = (fakeScroll.current?.clientHeight || 0) * ratio;
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

  const handleColumnsChange = useCallback(
    (columns: ColumnConfig[]) => {
      props.onColumnsChange?.(columns);
    },
    [props.onColumnsChange]
  );

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
        position: "relative",
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
          style={{
            height: dataHeight || (grid?.rowHeight || 0) * props.data.length,
            width: scrollWidth,
            position: "relative",
            overflow: "hidden",
            pointerEvents: "none",
          }}
        ></div>
      </div>
      {threadCounter.map((index) => {
        return (
          <canvas
            key={index}
            ref={canvasRefs.current[index] as any}
            height={(fakeScroll.current?.clientHeight || 0) * ratio}
            width={(fakeScroll.current?.clientWidth || 0) * ratio}
            style={{
              width: fakeScroll.current?.clientWidth || 0,
              height: Math.round(fakeScroll.current?.clientHeight || 0),
              top: 48,
              pointerEvents: "all",
              position: "absolute",
            }}
            onClick={handleClick}
          />
        );
      })}
    </div>
  );
}

import throttle from "lodash.throttle";
import React, { ReactElement, useEffect, useLayoutEffect, useRef } from "react";
import { ColumnConfig } from "../../types/ColumnConfig";

interface TableHeaderResizeOverlayProps {
  absolteColumnConfig: ColumnConfig[];
  height: number;
  scrollLeft: number;
  offsetLeft: number;
  onColumnsChange?(columns: ColumnConfig[]): void;
}

export function TableHeaderResizeOverlay(
  props: TableHeaderResizeOverlayProps
): ReactElement {
  const resizeIndex = useRef<number>();
  const resizeColumn = useRef<ColumnConfig>();
  const resizeColumnLeft = useRef<number>();
  const scrollLeftRef = useRef<number>();
  const columnConfigRef = useRef<ColumnConfig[]>(props.absolteColumnConfig);

  const ref = useRef<HTMLDivElement>(null);

  const onColumnsChangeRef = useRef<typeof props.onColumnsChange>();
  const offsetLeftRef = useRef<number>();

  useLayoutEffect(() => {
    onColumnsChangeRef.current = props.onColumnsChange;
    offsetLeftRef.current = props.offsetLeft;
    columnConfigRef.current = props.absolteColumnConfig;
    scrollLeftRef.current = props.scrollLeft;
  }, [
    props.onColumnsChange,
    props.absolteColumnConfig,
    props.offsetLeft,
    props.scrollLeft,
  ]);

  const handleResizeMouseMove = useRef(
    throttle((e: MouseEvent) => {
      const relativeMousePositionX =
        e.clientX - (offsetLeftRef.current || 0) + (scrollLeftRef.current || 0);
      const difference =
        relativeMousePositionX - (resizeColumnLeft.current || 0);
      const newColumnConfig = [...(columnConfigRef.current || [])];
      newColumnConfig[resizeIndex.current!].width = difference;
      onColumnsChangeRef.current?.(newColumnConfig);
    }, 16)
  );

  const handleResizeMouseDown = useRef(
    (column: ColumnConfig, index: number) => {
      resizeIndex.current = index;
      resizeColumn.current = column;
      resizeColumnLeft.current = 0;
      let i = 0;
      for (const column of columnConfigRef.current || []) {
        if (i === index) {
          break;
        }
        resizeColumnLeft.current += column.width || 0;
        i += 1;
      }
      window.removeEventListener("mousemove", handleResizeMouseMove.current);
      window.addEventListener("mousemove", handleResizeMouseMove.current);
    }
  );

  useEffect(() => {
    window.addEventListener("mouseup", () => {
      window.removeEventListener("mousemove", handleResizeMouseMove.current);
    });
  }, []);

  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        height: props.height,
        float: "left",
        pointerEvents: "none",
        top: 0,
      }}
    >
      <div
        style={{
          position: "relative",
          height: props.height,
          float: "left",
          pointerEvents: "none",
          whiteSpace: "nowrap",
          transform: `translateX(-${props.scrollLeft}px)`,
        }}
      >
        {props.absolteColumnConfig?.map((column: any, index: number) => {
          return (
            <div
              key={column.field}
              style={{
                width: column.width,
                height: props.height,
                display: "inline-block",
                pointerEvents: "none",
                position: "relative",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  width: 5,
                  height: "100%",
                  pointerEvents: "all",
                  cursor: "ew-resize",
                }}
                onMouseDown={(e) =>
                  handleResizeMouseDown.current(column, index)
                }
                onDragStart={(e) => e.preventDefault()}
              ></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

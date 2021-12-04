import React, {
  ReactElement,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import useResizeObserver from "use-resize-observer";
import { StringFormatter } from "./StringFormatter";
import { ColumnConfig } from "./types/ColumnConfig";
import { calculateColumnWidths, throttle } from "./utils/Util";
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  useSortable,
} from "@dnd-kit/sortable";

import "./Table.css";
import { TableHeaderCell } from "./TableHeaderCell";
import { DndContext, DragEndEvent } from "@dnd-kit/core";

interface TableHeaderProps {
  columns?: ColumnConfig[];
  textColor?: string;
  backgroundColor?: string;
  scrollLeft?: number;
  onColumnsChange?(columns: ColumnConfig[]): void;
}

const ratio = 2;
const headerHeight = 48;

const stringFormatter = new StringFormatter();

export function TableHeader(props: TableHeaderProps): ReactElement {
  const outerRef = useRef<HTMLDivElement>();
  const { width = 1 } = useResizeObserver<HTMLDivElement>({
    box: "border-box",
    ref: outerRef as any,
  });
  const columnConfigRef = useRef<ColumnConfig[]>();
  const columnConfig = useMemo(() => {
    if (props.columns) {
      const columns = calculateColumnWidths(props.columns, width, ratio);
      const columnConfig = props.columns
        ? JSON.parse(JSON.stringify(props.columns))
        : [];
      columnConfig?.forEach((column: any, index: number) => {
        column.width = columns[index];
      });
      columnConfigRef.current = columnConfig;
      return columnConfig;
    }
  }, [props.columns, ratio, width]);

  const items = columnConfig?.map((col: any) => col.field);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (over && active.id !== over.id) {
        const oldIndex = items.indexOf(active.id);
        const newIndex = items.indexOf(over.id);
        const newColumnConfig = arrayMove(
          props.columns || [],
          oldIndex,
          newIndex
        );
        props.onColumnsChange?.(newColumnConfig);
      }
    },
    [props.columns, props.onColumnsChange]
  );

  const resizeIndex = useRef<number>();
  const resizeColumn = useRef<ColumnConfig>();
  const resizeColumnLeft = useRef<number>();
  const scrollLeftRef = useRef<number>();

  const onColumnsChangeRef = useRef<typeof props.onColumnsChange>();
  useLayoutEffect(() => {
    onColumnsChangeRef.current = props.onColumnsChange;
  }, [props.onColumnsChange]);
  useLayoutEffect(() => {
    scrollLeftRef.current = props.scrollLeft;
  }, [props.scrollLeft]);

  const handleResizeMouseMove = useRef(
    throttle((e: MouseEvent) => {
      const relativeMousePositionX =
        e.clientX -
        (outerRef.current?.offsetLeft || 0) +
        (scrollLeftRef.current || 0);
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
      ref={outerRef as any}
      style={{ width: "100%", height: headerHeight, position: "relative" }}
    >
      <div
        style={{
          position: "absolute",
          height: headerHeight,
          float: "left",
          top: 0,
        }}
      >
        <div
          style={{
            position: "relative",
            height: headerHeight,
            float: "left",

            whiteSpace: "nowrap",
            transform: `translateX(-${props.scrollLeft}px)`,
          }}
        >
          {columnConfig && (
            <DndContext onDragEnd={handleDragEnd}>
              <SortableContext
                items={items}
                strategy={horizontalListSortingStrategy}
              >
                {columnConfig?.map((column: any, index: number) => {
                  return (
                    <TableHeaderCell
                      key={column.field}
                      id={column.field}
                      title={column.field}
                      height={headerHeight}
                      width={column.width}
                    ></TableHeaderCell>
                  );
                })}
              </SortableContext>
            </DndContext>
          )}
        </div>
        <div
          style={{
            position: "absolute",
            height: headerHeight,
            float: "left",
            pointerEvents: "none",
            top: 0,
          }}
        >
          <div
            style={{
              position: "relative",
              height: headerHeight,
              float: "left",
              pointerEvents: "none",
              whiteSpace: "nowrap",
              transform: `translateX(-${props.scrollLeft}px)`,
            }}
          >
            {columnConfig?.map((column: any, index: number) => {
              return (
                <div
                  key={column.field}
                  style={{
                    width: column.width,
                    height: headerHeight,
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
      </div>
    </div>
  );
}

TableHeader.defaultProps = {
  textColor: "#4e4e4e",
  backgroundColor: "#fff",
};

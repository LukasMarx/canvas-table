import React, {
  ReactElement,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import useResizeObserver from 'use-resize-observer';
import { StringFormatter } from '../../formatter/StringFormatter';
import { ColumnConfig } from '../../types/ColumnConfig';
import { calculateColumnWidths } from '../../utils/Util';
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  useSortable,
} from '@dnd-kit/sortable';

import '../../Table.module.css';
import { TableHeaderCell } from './TableHeaderCell';
import {
  DndContext,
  DragEndEvent,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { DeepPartial } from '../../types/DeepPartial';
import { GridOptions } from '../../types/Grid';
import { TableHeaderResizeOverlay } from './TableHeaderResizeOverlay';

interface TableHeaderProps {
  columns?: ColumnConfig[];
  textColor?: string;
  backgroundColor?: string;
  scrollLeft?: number;
  onColumnsChange?(columns: ColumnConfig[]): void;
  onClick?(e: React.MouseEvent, column: ColumnConfig): void;
  options?: DeepPartial<GridOptions>;
  onColumnHeaderContextMenu?(
    column: ColumnConfig,
    index: number,
    e: React.MouseEvent
  ): void;
}

const ratio = 2;
const headerHeight = 48;

export function TableHeader(props: TableHeaderProps): ReactElement {
  const outerRef = useRef<HTMLDivElement>();
  const { width = 1 } = useResizeObserver<HTMLDivElement>({
    box: 'border-box',
    ref: outerRef as any,
  });
  const columnConfigRef = useRef<ColumnConfig[]>();
  const columnConfig = useMemo<ColumnConfig[]>(() => {
    if (props.columns) {
      const columns = calculateColumnWidths(props.columns, width, ratio);
      const columnConfig = props.columns
        ? JSON.parse(JSON.stringify(props.columns))
        : [];
      columnConfig?.forEach((column: any, index: number) => {
        column.width = columns[index];
      });
      columnConfig.sort((a: ColumnConfig, b: ColumnConfig) => {
        if (a.pinned && !b.pinned) {
          return -1;
        }
        if (!a.pinned && b.pinned) {
          return 1;
        }
        return 0;
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

  const scrollLeftRef = useRef<number>();

  useLayoutEffect(() => {
    scrollLeftRef.current = props.scrollLeft;
  }, [props.scrollLeft]);

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      } as any,
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        distance: 5,
      } as any,
    })
  );

  const hasMoreThanOneSortIndex = useMemo(() => {
    return (
      (props.columns?.filter((c) => c.sortIndex !== undefined).length || 0) > 1
    );
  }, [props.columns]);

  const handleContextMenu = useCallback(
    (column: ColumnConfig, index: number, e: React.MouseEvent) => {
      props.onColumnHeaderContextMenu?.(column, index, e);
    },
    []
  );

  const header = useMemo(() => {
    return (
      columnConfig && (
        <DndContext onDragEnd={handleDragEnd} sensors={sensors}>
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
                  index={index}
                  width={column.width}
                  onClick={props.onClick}
                  column={column}
                  options={props.options}
                  disabled={column.pinned}
                  hasMoreThanOneSortIndex={hasMoreThanOneSortIndex}
                  onContextMenu={handleContextMenu}
                ></TableHeaderCell>
              );
            })}
          </SortableContext>
        </DndContext>
      )
    );
  }, [columnConfig, props.onClick, sensors, handleDragEnd]);

  return (
    <div
      ref={outerRef as any}
      style={{
        width: '100%',
        height: headerHeight,
        position: 'relative',
        backgroundColor: props.options?.theme?.palette?.headerBackgroundColor,
        color: props.options?.theme?.palette?.headerTextColor,
      }}
    >
      <div
        style={{
          position: 'absolute',
          height: headerHeight,
          float: 'left',
          top: 0,
        }}
      >
        <div
          style={{
            position: 'relative',
            height: headerHeight,
            float: 'left',

            whiteSpace: 'nowrap',
            transform: `translateX(-${props.scrollLeft}px)`,
          }}
        >
          {header}
        </div>
        <TableHeaderResizeOverlay
          absolteColumnConfig={columnConfig}
          onColumnsChange={props.onColumnsChange}
          height={headerHeight}
          scrollLeft={props.scrollLeft || 0}
          offsetLeft={outerRef.current?.getBoundingClientRect().x || 0}
        />
        <div
          style={{
            position: 'absolute',
            height: headerHeight,
            float: 'left',
            pointerEvents: 'none',
            top: 0,
          }}
        >
          <div
            style={{
              position: 'relative',
              height: headerHeight,
              float: 'left',
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
              zIndex: 10000,
            }}
          >
            {columnConfig
              ?.filter((col) => col.pinned)
              .map((column: any, index: number) => {
                return (
                  <TableHeaderCell
                    index={index}
                    key={column.field}
                    id={column.field}
                    title={column.field}
                    height={headerHeight}
                    width={column.width}
                    onClick={props.onClick}
                    column={column}
                    options={props.options}
                    disabled
                    hasMoreThanOneSortIndex={hasMoreThanOneSortIndex}
                  ></TableHeaderCell>
                );
              })}
          </div>
        </div>
        <TableHeaderResizeOverlay
          absolteColumnConfig={columnConfig}
          onColumnsChange={props.onColumnsChange}
          height={headerHeight}
          scrollLeft={0}
          offsetLeft={outerRef.current?.getBoundingClientRect().x || 0}
        />
      </div>
    </div>
  );
}

TableHeader.defaultProps = {
  textColor: '#4e4e4e',
  backgroundColor: '#fff',
};

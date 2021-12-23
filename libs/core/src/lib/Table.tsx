import React, {
  createRef,
  MouseEvent,
  ReactElement,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import useResizeObserver from 'use-resize-observer';
import { ColumnConfig } from './types/ColumnConfig';
import { TableHeader } from './components/table-header/TableHeader';
import { calculateColumnWidths, objectToGroupTree } from './utils/Util';
import { createGrid, GridStub } from './GridStub';
import { GridOptions } from './types/Grid';
import { DeepPartial } from './types/DeepPartial';
import './Table.module.css';
import { defaultOptions } from './DefaultOptions';
import merge from 'lodash.merge';
import { formatters } from './formatter';
import groupArray from 'group-array';
import debounce from 'lodash.debounce';
import throttle from 'lodash.throttle';
import { RowClickEvent } from './types/Events';
import { useDragableRows } from './hooks/useDraggableRows';

interface TableProps {
  data: any[];
  columns?: ColumnConfig[];
  onColumnsChange?(columns: ColumnConfig[]): void;
  options?: DeepPartial<GridOptions>;
  threadCount?: number;
  useSingleWorker?: boolean;
  query?: string;
  onColumnHeaderContextMenu?(
    column: ColumnConfig,
    index: number,
    clickPosition: { left: number; top: number }
  ): void;
  onRowContextMenu?(
    rowData: any,
    column: ColumnConfig,
    index: number,
    clickPosition: { left: number; top: number }
  ): void;
}

let ratio = 2;

export function Table(props: TableProps): ReactElement {
  const fakeScroll = useRef<HTMLDivElement>();
  const { width = 1, height = 1 } = useResizeObserver<HTMLDivElement>({
    box: 'border-box',
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

  const [rowContextMenu, setRowContextMenu] = useState<ReactElement | null>(
    null
  );
  const [isContextMenuOpen, setIsContexMenuOpen] = useState<boolean>(false);
  const [contextMenuPosition, setContextMenuPosition] = useState<
    { left: number; top: number } | undefined
  >();

  const scrollWidth = useMemo(() => {
    return calculateColumnWidths(props.columns || [], width - 18, ratio).reduce(
      (prev, next) => prev + next,
      0
    );
  }, [props.columns]);

  const options = useMemo(() => {
    if (props.options) {
      return merge(JSON.parse(JSON.stringify(defaultOptions)), props.options);
    } else {
      return JSON.parse(JSON.stringify(defaultOptions));
    }
  }, [props.options]);

  const [divWidth, setDivWidth] = useState(0);
  useLayoutEffect(() => {
    if (fakeScroll.current?.clientWidth !== divWidth) {
      setDivWidth(fakeScroll.current?.clientWidth || 0);

      requestAnimationFrame(() => {
        if (gridRef.current) {
          gridRef.current.redraw();
        }
      });
    }
  });

  const heightRef = useRef<number>();
  const dataHeigtRef = useRef<number>();
  const dataRef = useRef<any[]>();
  useEffect(() => {
    heightRef.current = fakeScroll.current?.clientHeight || 0;
    dataHeigtRef.current = dataHeight;
    dataRef.current = props.data;
  }, [height, props.data, dataHeight]);

  const updateScrollPositionthrottled = useCallback(
    throttle((left: number, top: number) => {
      if (gridRef.current) {
        gridRef.current.blockRedraw = true;
        gridRef.current.scrollLeft = left;
        gridRef.current.scrollTop = top;
        gridRef.current.blockRedraw = false;
      }
      setLeft(left);
    }, props.options?.scrollFramerate || 16),
    [setLeft, props.options?.scrollFramerate]
  );
  const updateScrollPositionDebounced = useCallback(
    debounce((left: number, top: number) => {
      if (gridRef.current) {
        gridRef.current.blockRedraw = true;
        gridRef.current.scrollLeft = left || 0;
        gridRef.current.scrollTop = top || 0;
        gridRef.current.blockRedraw = false;
      }
      setLeft(left);
    }, 64),
    [setLeft, props.options?.scrollFramerate]
  );

  const handleSroll = useCallback(() => {
    const maxScrollTop =
      (dataHeigtRef.current ||
        (gridRef.current?.rowHeight || 0) * (dataRef.current?.length || 0)) -
      (heightRef.current || 0);
    const top = Math.max(
      (fakeScroll?.current?.scrollTop || 0) < maxScrollTop
        ? fakeScroll.current?.scrollTop || 0
        : maxScrollTop,
      0
    );

    const maxScrollLeft = scrollWidth;

    const left = Math.max(
      (fakeScroll?.current?.scrollLeft || 0) < maxScrollLeft
        ? fakeScroll.current?.scrollLeft || 0
        : maxScrollLeft,
      0
    );

    if (
      !props.threadCount ||
      (props.threadCount <= 1 && !props.useSingleWorker)
    ) {
      updateScrollPositionthrottled(left, top);
      updateScrollPositionDebounced(left, top);
    } else {
      if (gridRef.current) {
        gridRef.current.blockRedraw = true;
        gridRef.current.scrollLeft = left;
        gridRef.current.scrollTop = top;
        gridRef.current.blockRedraw = false;
      }
      setLeft(left);
    }
    if ((props.threadCount || 0) > 1) {
      canvasRefs.current.forEach((canvas: any, index: number) => {
        if (gridRef.current?.nextWorker === index) {
          canvas.current.style.display = 'unset';
        } else {
          canvas.current.style.display = 'none';
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

        gridRef.current?.addEventListener(
          'rowContextMenu',
          (e: RowClickEvent) => {
            const boundingClientRect =
              fakeScroll.current?.getBoundingClientRect();
            props.onRowContextMenu?.(e.rowData, e.column, e.columnIndex, {
              left: (boundingClientRect?.x || 0) + e.left,
              top: (boundingClientRect?.y || 0) + e.top,
            });
          }
        );

        if (!hasScrollListenerRef.current) {
          fakeScroll.current?.addEventListener('scroll', handleSroll);
          hasScrollListenerRef.current = true;
        }
      } else {
        throw new Error('Grid creation failed');
      }
    }
  }, []);

  const data = useMemo(() => {
    if (props.options?.groupBy) {
      const grouped = groupArray(
        props.data || [],
        ...(props.options?.groupBy as string[])
      );
      return objectToGroupTree(grouped);
    } else {
      return props.data || [];
    }
  }, [props.data]);

  useEffect(() => {
    if (data && grid) {
      grid.data = data;
    }
  }, [grid, data]);

  useEffect(() => {
    if (options && grid) {
      grid.options = options;
    }
  }, [grid, options]);

  useEffect(() => {
    if (grid) {
      grid.query = props.query;
    }
  }, [grid, props.query]);

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
      left: e.nativeEvent.offsetX - (fakeScroll.current?.scrollLeft || 0),
      top: e.nativeEvent.offsetY - (fakeScroll.current?.scrollTop || 0),
      shiftKey: e.shiftKey,
    }),
      {
        passive: true,
      };
  };

  const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    grid?.fireContextMenuEvent({
      left: e.nativeEvent.offsetX - (fakeScroll.current?.scrollLeft || 0),
      top: e.nativeEvent.offsetY - (fakeScroll.current?.scrollTop || 0),
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

  const handleTableHeaderContextMenu = useCallback(
    (column: ColumnConfig, index: number, e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      props.onColumnHeaderContextMenu?.(column, index, {
        left: e.clientX,
        top: e.clientY,
      });
    },
    []
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
              if (col.sortDirection === 'asc') {
                col.sortDirection = 'desc';
              } else if (col.sortDirection === 'desc' || !col.sortDirection) {
                col.sortDirection = 'asc';
              }
            } else {
              let nextIndex = 0;
              newColumnConfig.forEach((col) => {
                if (col.sortIndex !== undefined && col.sortIndex >= nextIndex) {
                  nextIndex = col.sortIndex + 1;
                }
              });
              col.sortIndex = nextIndex;
              col.sortDirection = 'asc';
            }
          } else {
            col.sortIndex = 0;

            if (col.sortDirection === 'asc') {
              col.sortDirection = 'desc';
            } else if (col.sortDirection === 'desc' || !col.sortDirection) {
              col.sortDirection = 'asc';
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

  const { handleMouseDown } = useDragableRows(gridRef, fakeScroll);

  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        overflow: 'hidden',
        boxSizing: 'border-box',
        display: 'flex',
        position: 'relative',
        flexDirection: 'column',
      }}
    >
      <TableHeader
        columns={props.columns}
        scrollLeft={left}
        onColumnsChange={handleColumnsChange}
        options={options}
        onClick={handleTableHeaderClick}
        onColumnHeaderContextMenu={handleTableHeaderContextMenu}
        tableContentWidth={divWidth}
      />
      <div
        ref={fakeScroll as any}
        style={{
          flex: 1,
          width: '100%',
          overflow: 'auto',
          position: 'relative',
        }}
        onClick={handleClick}
        onMouseDown={handleMouseDown}
        onContextMenu={handleContextMenu}
        onDragStart={(e) => e.preventDefault()}
      >
        <div
          style={{
            height: dataHeight || (grid?.rowHeight || 0) * props.data.length,
            width: scrollWidth,
            position: 'relative',
            overflow: 'hidden',
          }}
        ></div>
      </div>
      {threadCounter.map((index) => {
        return (
          <canvas
            className="canvas"
            key={index}
            ref={canvasRefs.current[index] as any}
            height={(fakeScroll.current?.clientHeight || 0) * ratio}
            width={divWidth * ratio}
            style={{
              width: divWidth,
              height: Math.round(fakeScroll.current?.clientHeight || 0),
              top: 48,
              pointerEvents: 'none',
              position: 'absolute',
            }}
          />
        );
      })}
    </div>
  );
}

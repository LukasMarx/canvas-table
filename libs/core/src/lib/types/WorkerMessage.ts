import { ColumnConfig } from './ColumnConfig';
import { GridOptions } from './Grid';

export type WorkerMessage =
  | WorkerInitMessage
  | WorkerSetDataMessage
  | WorkerSetDimensionMessage
  | WorkerSetScrollPositionMessage
  | WorkerFireOnClickMessage
  | WorkerSetQueryMessage
  | WorkerFireOnRowContextMenuMessage
  | WorkerSetOptionsMessage
  | WorkerRedrawMessage
  | WorkerSetColumnsMessage;

export interface WorkerInitMessage {
  type: 'init';
  canvas: HTMLCanvasElement;
  data?: any[];
  columns?: ColumnConfig[];
  gridOptions: GridOptions;
}

export interface WorkerSetDataMessage {
  type: 'setData';
  data: any[];
}

export interface WorkerSetColumnsMessage {
  type: 'setColumns';
  columns: any[];
}
export interface WorkerSetOptionsMessage {
  type: 'setOptions';
  options: GridOptions;
}

export interface WorkerRedrawMessage {
  type: 'redraw';
}

export interface WorkerSetDimensionMessage {
  type: 'setDimensions';
  width: number;
  height: number;
}

export interface WorkerSetScrollPositionMessage {
  type: 'setScrollPosition';
  left: number;
  top: number;
}

export interface WorkerSetQueryMessage {
  type: 'setQuery';
  query: string | undefined;
}

export interface WorkerFireOnClickMessage {
  type: 'onClick';
  left: number;
  top: number;
  shiftKey?: boolean;
}
export interface WorkerFireOnRowContextMenuMessage {
  type: 'onRowContextMenu';
  left: number;
  top: number;
}

export interface WorkerOnEventMessage {
  type: 'onEvent';
  eventType: string;
  args: any[];
}

import { GridOptions } from '../types/Grid';

export interface IFormatterParams {
  alignHorizontal?: 'left' | 'center' | 'right' | 'start' | 'end';
}
export interface IFormatterContext {
  gridOptions: GridOptions;
  query?: string;
}

export interface IFormatter<T> {
  toText(
    value: T,
    params: IFormatterParams,
    context: IFormatterContext
  ): string;
  formatTableCell(
    ctx: CanvasRenderingContext2D,
    value: T,
    top: number,
    x: number,
    width: number,
    rowHeight: number,
    params: IFormatterParams,
    context: IFormatterContext
  ): void;
}

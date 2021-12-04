export interface IFormatterParams {
  alignHorizontal?: "left" | "center" | "right" | "start" | "end";
}

export interface IFormatter<T> {
  toText(
    value: T,
    params: IFormatterParams,
    context: Record<string, any>
  ): string;
  formatTableCell(
    ctx: CanvasRenderingContext2D,
    value: T,
    top: number,
    x: number,
    width: number,
    rowHeight: number,
    params: IFormatterParams,
    context: Record<string, any>
  ): void;
}

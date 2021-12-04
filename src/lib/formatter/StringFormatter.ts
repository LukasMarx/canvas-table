import { drawTextInCell } from "./FormatterUtils";
import { IFormatter, IFormatterParams } from "./IFormatter";

export class StringFormatter implements IFormatter<string> {
  toText(
    value: string,
    params: IFormatterParams,
    context: Record<string, any>
  ) {
    return value;
  }

  formatTableCell(
    ctx: CanvasRenderingContext2D,
    value: any,
    top: number,
    x: number,
    width: number,
    rowHeight: number,
    params: IFormatterParams,
    context: Record<string, any>
  ) {
    if (value) {
      drawTextInCell(
        ctx,
        value,
        x,
        top,
        width,
        rowHeight,
        params.alignHorizontal || "left"
      );
    }
  }
}

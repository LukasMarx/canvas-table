import { drawTextInCell } from './FormatterUtils';
import { IFormatter, IFormatterContext, IFormatterParams } from './IFormatter';

export class StringFormatter implements IFormatter<string> {
  toText(
    value: string,
    params: IFormatterParams,
    context: Record<string, any>
  ) {
    return value ? value.toString() : '';
  }

  formatTableCell(
    ctx: CanvasRenderingContext2D,
    value: any,
    top: number,
    x: number,
    width: number,
    rowHeight: number,
    params: IFormatterParams,
    context: IFormatterContext
  ) {
    if (value) {
      value = value.toString();
      if (context.query && value && value.includes(context.query)) {
        const split = value.split(context.query);
        const start = ctx.measureText(split[0]);
        const width = ctx.measureText(context.query);
        let fontHeight =
          start.fontBoundingBoxAscent + start.fontBoundingBoxDescent;
        const textTop = top + (rowHeight - fontHeight) / 2;
        ctx.save();
        ctx.fillStyle = context.gridOptions.theme.palette.queryMarkerColor;
        ctx.fillRect(x + start.width + 8, textTop, width.width, fontHeight + 4);
        ctx.restore();
      }
      drawTextInCell(
        ctx,
        value,
        x,
        top,
        width,
        rowHeight,
        params.alignHorizontal || 'left'
      );
    }
  }
}

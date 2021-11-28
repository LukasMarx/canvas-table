export class StringFormatter {
  format(
    ctx: CanvasRenderingContext2D,
    value: any,
    top: number,
    x: number,
    width: number,
    rowHeight: number
  ) {
    if (value) {
      ctx.fillText(
        value.toString(),
        x + 8,
        top + (rowHeight / 2 + 6),
        width - 16
      );
    }
  }
}

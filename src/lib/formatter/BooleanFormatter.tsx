import { IFormatter, IFormatterContext, IFormatterParams } from "./IFormatter";
import { MdCheckBox, MdCheckBoxOutlineBlank } from "react-icons/md";
import ReactDOMServer from "react-dom/server";
import canvg from "canvg";

export class BooleanFormatter implements IFormatter<boolean> {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private cache = new Map<string, string>();
  constructor() {
    this.canvas = document.createElement("canvas");
    this.ctx = this.canvas.getContext("2d")!;
    this.ctx.setTransform(2, 0, 0, 2, 0.5, 0.5);
    this.ctx.canvas.width = 24 * 2;
    this.ctx.canvas.height = 24 * 2;
  }

  toText(
    value: boolean,
    params: IFormatterParams,
    context: Record<string, any>
  ) {
    return value.toString();
  }

  async formatTableCell(
    ctx: CanvasRenderingContext2D,
    value: boolean,
    top: number,
    x: number,
    width: number,
    rowHeight: number,
    params: IFormatterParams,
    context: IFormatterContext
  ) {
    if (value) {
      const key = `true${context.gridOptions.theme.palette.textColor}`;
      if (!this.cache.has(key)) {
        this.cache.set(
          key,
          ReactDOMServer.renderToString(
            <MdCheckBox
              color={context.gridOptions.theme.palette.textColor}
              width={rowHeight}
              height={rowHeight}
            />
          )
        );
      }
      console.log(this.cache.get(key));
      const v = canvg.fromString(this.ctx, this.cache.get(key)!, {
        ignoreDimensions: true,
      });
      v.resize(24, 24, true);
      v.render();
      const padding = Math.floor((rowHeight - 24) / 2);
      ctx.drawImage(this.canvas, x, top + padding, 24, 24);
    } else {
      const key = `false${context.gridOptions.theme.palette.textColor}`;
      if (!this.cache.has(key)) {
        this.cache.set(
          key,
          ReactDOMServer.renderToString(
            <MdCheckBoxOutlineBlank
              color={context.gridOptions.theme.palette.textColor}
              width={rowHeight}
              height={rowHeight}
            />
          )
        );
      }
      const v = canvg.fromString(this.ctx, this.cache.get(key)!);
      v.resize(24, 24, true);
      v.render();
      const padding = Math.floor((rowHeight - 24) / 2);
      ctx.drawImage(this.canvas, x, top + padding, 24, 24);
    }
  }
}

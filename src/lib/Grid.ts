import { BaseGrid } from "./BaseGrid";
import { StringFormatter } from "./StringFormatter";
import { ColumnConfig } from "./types/ColumnConfig";
import { RowClickEvent } from "./types/Events";
import { calculateColumnWidths, debounce, throttle } from "./utils/Util";

const stringFormatter = new StringFormatter();

const ratio = 2;

export class Grid extends BaseGrid {
  public readonly headerHeight = 48;
  constructor(
    private ctx: CanvasRenderingContext2D,
    canvasElement: HTMLCanvasElement
  ) {
    super();
    this.canvas = canvasElement;
    this.calculateColumnWidths(this.columnConfig || []);
  }

  onClick(options: { left: number; top: number; shiftKey?: boolean }) {
    this.handleClick(options);
  }

  private clearAll() {
    this.ctx.clearRect(-32, -32, this.width, this.height);
  }

  private handleClick(options: {
    left: number;
    top: number;
    shiftKey?: boolean;
  }) {
    const firstIndex = this.scrollTop / this.rowHeight;
    const rowIndex = Math.floor(firstIndex + options.top / this.rowHeight);
    const rowData = this.calculatedData?.[rowIndex].data;
    let cellIndex: number | undefined = undefined;
    let left = 0;
    this.columnConfig?.forEach((column, index) => {
      if (
        options.left > left &&
        options.left < left + this.columnWidths[index]
      ) {
        cellIndex = index;
      }
      left += this.columnWidths[index];
    });
    const columnConfig =
      cellIndex !== undefined ? this.columnConfig?.[cellIndex] : undefined;

    const args: RowClickEvent = {
      column: columnConfig!,
      columnIndex: cellIndex!,
      rowData: rowData,
      rowIndex: rowIndex,
    };
    this.fireEvent("rowClick", args);
    const key = this.buildSelectionKeys(rowData);
    if (options.shiftKey) {
      const newSelection = { ...this.selectionKeys };
      delete newSelection[key];
      this.selectionKeys = newSelection;
    } else {
      this.expandedKeys = { ...this.expandedKeys, [key]: true };
      this.selectionKeys = { ...this.selectionKeys, [key]: true };
    }
  }

  getActiveData() {
    return;
  }

  redraw() {
    if (this.blockRedraw) {
      return;
    }
    this.ctx.setTransform(ratio, 0, 0, ratio, 0.5, 0.5);
    if (this.columnConfig && this.columnWidths?.length === 0) {
      this.calculateColumnWidths(this.columnConfig || []);
    }
    if (!this.columnConfig) {
      return;
    }

    this.clearAll();

    const firstIndex = Math.floor(this.scrollTop / this.rowHeight);
    const lastIndex = firstIndex + this.height / this.rowHeight;
    const activeData = this.calculatedData?.slice(firstIndex, lastIndex + 2);

    activeData?.forEach((datapoint, index) => {
      this.drawRow(firstIndex + index, index);
    });
  }

  public calculateColumnWidths(columns: ColumnConfig[]) {
    this.columnWidths = calculateColumnWidths(columns, this.width, ratio);
  }

  drawRow(absoluteIndex: number, index: number) {
    const offsetTop = this.scrollTop % this.rowHeight;
    const y = Math.floor(index * this.rowHeight - offsetTop);

    this.ctx.beginPath();
    this.ctx.lineWidth = 1;
    if (this.selectionIndizes[absoluteIndex]) {
      this.ctx.fillStyle = this.backgroundColorSelection;
      this.ctx.fillRect(0, y, this.ctx.canvas.width, this.rowHeight);
    }
    this.ctx.fillStyle = this.backgroundColor;
    this.ctx.moveTo(0, y);
    this.ctx.strokeStyle = this.textColor;
    this.ctx.fillStyle = this.textColor;
    this.ctx.lineTo(this.width, y);
    this.ctx.closePath();
    this.ctx.stroke();
    let x = 0;
    this.columnConfig?.forEach((column, index) => {
      this.ctx.beginPath();
      this.ctx.font = "normal 14px sans-serif";
      this.drawCell(
        this.calculatedData?.[absoluteIndex]?.data?.[column.field],
        y,
        x +
          20 * (this.calculatedData?.[absoluteIndex].level || 0) -
          this.scrollLeft,
        this.columnWidths[index]
      );
      x += this.columnWidths[index];
      this.ctx.closePath();
    });
    this.ctx.stroke();
  }

  drawCell(value: any, top: any, x: number, width: number, rowHeight?: number) {
    stringFormatter.format(
      this.ctx,
      value,
      top,
      x,
      width,
      rowHeight || this.rowHeight
    );
  }
}

import { BaseGrid } from "./BaseGrid";
import { IFormatter } from "./formatter/IFormatter";
import { ColumnConfig } from "./types/ColumnConfig";
import { DeepPartial } from "./types/DeepPartial";
import { RowClickEvent } from "./types/Events";
import { GridOptions } from "./types/Grid";
import { calculateColumnWidths, debounce, throttle } from "./utils/Util";

const ratio = 2;

const emptyFormatterParams = {};

export class Grid extends BaseGrid {
  public readonly headerHeight = 48;
  public caches: HTMLCanvasElement[] = [];
  constructor(
    private ctx: CanvasRenderingContext2D,
    canvasElement: HTMLCanvasElement,
    formatters: Record<
      string,
      {
        new (): IFormatter<any>;
      }
    >,
    gridOptions: GridOptions
  ) {
    super(gridOptions);
    this.canvas = canvasElement;
    this.calculateColumnWidths(this.columnConfig || []);
    Object.entries(formatters).forEach(([key, formatter]) => {
      this.formatters[key] = new formatter();
    });
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
    const level = this.calculatedData?.[rowIndex].level;
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

    const key = this.buildSelectionKeys(rowData);
    const treeControlWidth = 25;

    // Check if clicked on TreeControl
    const offset = level * treeControlWidth;
    if (
      rowData.children &&
      options.left > 4 + offset &&
      options.left < 22 + offset
    ) {
      if (this.expandedKeys[key]) {
        const newKeys = { ...this.expandedKeys };
        delete newKeys[key];
        this.expandedKeys = newKeys;
      } else {
        this.expandedKeys = { ...this.expandedKeys, [key]: true };
      }
      return;
    }

    const args: RowClickEvent = {
      column: columnConfig!,
      columnIndex: cellIndex!,
      rowData: rowData,
      rowIndex: rowIndex,
    };
    this.fireEvent("rowClick", args);

    if (options.shiftKey) {
      const newSelection = { ...this.selectionKeys };
      delete newSelection[key];
      this.selectionKeys = newSelection;
    } else {
      this.selectionKeys = { ...this.selectionKeys, [key]: true };
    }
  }

  redraw() {
    if (this.blockRedraw) {
      return;
    }
    this.ctx.setTransform(ratio, 0, 0, ratio, 0.5, 0.5);
    this.ctx.lineWidth = 1;
    if (this.columnConfig && this.columnWidths?.length === 0) {
      this.calculateColumnWidths(this.columnConfig || []);
    }
    if (!this.columnConfig) {
      return;
    }

    this.clearAll();

    const firstIndex = Math.floor(this.scrollTop / this.rowHeight);
    const lastIndex =
      firstIndex + Math.floor(this.height / ratio / this.rowHeight);
    const activeData = this.calculatedData?.slice(firstIndex, lastIndex + 1);
    this.ctx.beginPath();
    this.ctx.strokeStyle = this.options.theme.palette.lineColor;
    activeData?.forEach((datapoint, index) => {
      const offsetTop = this.scrollTop % this.rowHeight;
      const y = Math.floor(index * this.rowHeight - offsetTop);

      this.drawRowDelimiter(y);
    });
    this.ctx.closePath();
    this.ctx.stroke();
    this.ctx.beginPath();
    activeData?.forEach((datapoint, index) => {
      const offsetTop = this.scrollTop % this.rowHeight;
      const y = Math.floor(index * this.rowHeight - offsetTop);

      this.drawRow(firstIndex + index, y);
    });
  }

  public calculateColumnWidths(columns: ColumnConfig[]) {
    this.columnWidths = calculateColumnWidths(columns, this.width, ratio);
  }

  drawRowDelimiter(y: number) {
    this.ctx.moveTo(0, y);
    this.ctx.lineWidth = 0.5;
    this.ctx.lineTo(this.width, y);
  }

  resetFont(ctx: CanvasRenderingContext2D) {
    const fontWeight = this.options?.theme?.font?.weight;
    const fontSize = this.options.theme?.font?.size + "px";
    const fontVariant = this.options.theme?.font?.variant;
    const fontStyle = this.options.theme?.font?.style;
    const fontFamiliy = this.options.theme?.font?.familiy;

    const font = `${fontStyle} ${fontVariant} ${fontWeight} ${fontSize} ${fontFamiliy}`;
    if (ctx.font !== font) {
      ctx.font = font;
    }
  }

  drawRow(absoluteIndex: number, y: number) {
    if (this.selectionIndizes[absoluteIndex]) {
      this.ctx.fillStyle = this.backgroundColorSelection;
      this.ctx.fillRect(0, y, this.ctx.canvas.width, this.rowHeight);
    }
    this.ctx.strokeStyle = this.textColor;
    this.ctx.fillStyle = this.textColor;

    const row = this.calculatedData[absoluteIndex].data;
    const level = this.calculatedData[absoluteIndex].level;
    const hasChildren = row.children && row.children.length > 0;

    let x = 0 - this.scrollLeft;
    const treeControlWidth = 25;
    const treeBranchWidth = 25;

    const paddingLeft = this.options.theme.spacing.cellPaddingLeft;
    const paddingRight = this.options.theme.spacing.cellPaddingLeft;
    if (this.options.dataTree && hasChildren) {
      this.drawTreeControl(
        this.expandedIndizes[absoluteIndex],
        paddingLeft - this.scrollLeft + level * treeControlWidth,
        y
      );
    }
    const offsetLeft =
      this.options.dataTree && hasChildren
        ? (level + 1) * treeControlWidth
        : level * treeBranchWidth;

    if (this.options.dataTree && (!hasChildren || level > 0)) {
      this.drawTreeBranch(-12 - this.scrollLeft + level * treeControlWidth, y);
    }

    this.columnConfig?.forEach((column, index) => {
      const ratioWidth = this.width / ratio;
      if (
        (x >= 0 && x <= ratioWidth) ||
        (x + this.columnWidths[index] >= 0 &&
          x + this.columnWidths[index] <= ratioWidth)
      ) {
        this.ctx.save();
        this.ctx.rect(
          index === 0 ? x + offsetLeft : x,
          y,
          index === 0
            ? this.columnWidths[index] - offsetLeft
            : this.columnWidths[index],
          this.rowHeight
        );
        this.ctx.clip();
        this.ctx.beginPath();
        this.resetFont(this.ctx);
        this.drawCell(
          this.calculatedData?.[absoluteIndex]?.data?.[column.field],
          column,
          y,
          index === 0 ? x + offsetLeft : x,
          index === 0
            ? this.columnWidths[index] - paddingRight - offsetLeft
            : this.columnWidths[index] - paddingRight
        );
        this.ctx.closePath();
        this.ctx.restore();
      }
      x += this.columnWidths[index];
    });
    this.ctx.stroke();
  }

  drawTreeControl(open: boolean, x: number, rowTop: any) {
    this.ctx.beginPath();
    const center = Math.floor(rowTop + this.rowHeight / 2);
    if (open) {
      this.ctx.moveTo(x, center);
      this.ctx.lineTo(x + 10, center);
      this.ctx.lineTo(x + 5, center + 5);
    } else {
      this.ctx.moveTo(x, center - 5);
      this.ctx.lineTo(x + 5, center);
      this.ctx.lineTo(x, center + 5);
    }

    this.ctx.fill();
    this.ctx.closePath();
  }

  drawTreeBranch(x: number, rowTop: any) {
    this.ctx.beginPath();
    this.ctx.lineWidth = 1;
    const bottom = rowTop + this.rowHeight / 2;
    this.ctx.moveTo(x, rowTop + 5);
    this.ctx.lineTo(x, bottom);
    this.ctx.lineTo(x + 5, bottom);

    this.ctx.stroke();
    this.ctx.closePath();
  }

  drawCell(
    value: any,
    column: ColumnConfig,
    top: any,
    x: number,
    width: number,
    rowHeight?: number
  ) {
    const formatter = column.formatter
      ? this.formatters[column.formatter]
      : this.formatters["default"] || this.formatters["default"];
    formatter?.formatTableCell(
      this.ctx,
      value,
      top,
      x,
      width,
      rowHeight || this.rowHeight,
      column.formatterParams || emptyFormatterParams,
      { gridOptions: this.options }
    );
  }
}

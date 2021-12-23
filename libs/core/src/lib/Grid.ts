import { BaseGrid } from './BaseGrid';
import { drawTextInCell } from './formatter/FormatterUtils';
import { IFormatter } from './formatter/IFormatter';
import { ColumnConfig } from './types/ColumnConfig';
import { RowClickEvent } from './types/Events';
import { GridOptions } from './types/Grid';
import { calculateColumnWidths } from './utils/Util';

const ratio = 2;

const emptyFormatterParams = {};

export class Grid extends BaseGrid {
  public readonly headerHeight = 48;
  private readonly treeControlWidth = 25;
  private readonly treeBranchWidth = 25;
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

  fireClickEvent(options: { left: number; top: number; shiftKey?: boolean }) {
    this.handleClick(options);
  }

  fireContextMenuEvent(options: { left: number; top: number }) {
    this.handleContextMenu(options);
  }

  private clearAll() {
    this.ctx.clearRect(-32, -32, this.width, this.height);
  }

  private getRowAtPosition(y: number) {
    const firstIndex = this.scrollTop / this.rowHeight;
    const rowIndex = Math.floor(firstIndex + y / this.rowHeight);
    const rowData = this.calculatedData?.[rowIndex].data;
    const level = this.calculatedData?.[rowIndex].level;
    return { row: rowData, index: rowIndex, level };
  }

  private getColumnAtPosition(x: number) {
    let cellIndex: number | undefined = undefined;

    let left = 0;
    this.columnConfig?.forEach((column, index) => {
      if (x > left && x < left + this.columnWidths[index]) {
        cellIndex = index;
      }
      left += this.columnWidths[index];
    });
    const columnConfig =
      cellIndex !== undefined ? this.columnConfig?.[cellIndex] : undefined;

    return { column: columnConfig, index: cellIndex };
  }

  private handleClick(options: {
    left: number;
    top: number;
    shiftKey?: boolean;
  }) {
    const {
      index: rowIndex,
      row: rowData,
      level,
    } = this.getRowAtPosition(options.top);

    const { index: cellIndex, column: columnConfig } = this.getColumnAtPosition(
      options.left
    );

    const key = this.buildSelectionKeys(rowData);
    const treeControlWidth = 25;

    // Check if clicked on TreeControl
    const offset = level * treeControlWidth;
    if (
      (this.options.dataTree &&
        rowData.children &&
        options.left > 4 + offset &&
        options.left < 22 + offset) ||
      (rowData.children && rowData.__isGroup)
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
      column: columnConfig as ColumnConfig,
      columnIndex: cellIndex !== undefined ? cellIndex : -1,
      rowData: rowData,
      rowIndex: rowIndex,
      left: options.left,
      top: options.top,
    };
    this.fireEvent('rowClick', args);

    if (options.shiftKey) {
      const newSelection = { ...this.selectionKeys };
      delete newSelection[key];
      this.selectionKeys = newSelection;
    } else {
      this.selectionKeys = { ...this.selectionKeys, [key]: true };
    }
  }

  private handleContextMenu(options: { left: number; top: number }) {
    const { index: rowIndex, row: rowData } = this.getRowAtPosition(
      options.top
    );

    const { index: cellIndex, column: columnConfig } = this.getColumnAtPosition(
      options.left
    );

    const args: RowClickEvent = {
      column: columnConfig as ColumnConfig,
      columnIndex: cellIndex !== undefined ? cellIndex : -1,
      rowData: rowData,
      rowIndex: rowIndex,
      left: options.left,
      top: options.top,
    };
    this.fireEvent('rowContextMenu', args);
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
    const activeData = this.calculatedData?.slice(firstIndex, lastIndex + 2);
    this.ctx.beginPath();
    this.ctx.strokeStyle = this.options.theme.palette.lineColor;
    const offsetTop = this.scrollTop % this.rowHeight;
    activeData?.forEach((datapoint, index) => {
      const y = Math.floor(index * this.rowHeight - offsetTop);
      this.drawRowDelimiter(y);
    });
    this.drawRowDelimiter(activeData.length * this.rowHeight - offsetTop);
    this.ctx.closePath();
    this.ctx.stroke();
    this.ctx.beginPath();
    activeData?.forEach((datapoint, index) => {
      const y = Math.floor(index * this.rowHeight - offsetTop);
      const absoluteIndex = firstIndex + index;
      console.log(this.draggedRowIndex);
      let offset = 0;
      if (this.draggedRowIndex === absoluteIndex) {
        return;
      }
      if (
        this.draggedRowIndex !== undefined &&
        this.draggedRowIndex < absoluteIndex
      ) {
        offset -= this.rowHeight;
      }
      if (this.draggedRowInsertionIndex !== undefined) {
        if (this.draggedRowInsertionIndex < absoluteIndex) {
          offset += this.rowHeight;
        }
      }

      this.drawRow(this.ctx, absoluteIndex, y + offset);
    });
    this.ctx.closePath();
    this.ctx.beginPath();
    const pinnedColumnDelimiterX = this.columnConfig.reduce((prev, current) => {
      if (current.pinned) {
        return prev + (current.width || 0);
      }
      return prev;
    }, 0);
    if (pinnedColumnDelimiterX) {
      this.drawPinnedColumnDelimiter(pinnedColumnDelimiterX);
    }
    this.ctx.stroke();
    this.ctx.closePath();
  }

  public calculateColumnWidths(columns: ColumnConfig[]) {
    this.columnWidths = calculateColumnWidths(columns, this.width, ratio);
  }

  drawRowDelimiter(y: number) {
    this.ctx.moveTo(0, y);
    this.ctx.lineWidth = 0.5;
    this.ctx.lineTo(this.width, y);
  }

  drawPinnedColumnDelimiter(x: number) {
    this.ctx.moveTo(x, 0);
    this.ctx.lineWidth = 0.5;
    this.ctx.lineTo(x, this.height);
  }

  resetFont(ctx: CanvasRenderingContext2D) {
    const fontWeight = this.options?.theme?.font?.weight;
    const fontSize = this.options.theme?.font?.size + 'px';
    const fontVariant = this.options.theme?.font?.variant;
    const fontStyle = this.options.theme?.font?.style;
    const fontFamiliy = this.options.theme?.font?.familiy;

    const font = `${fontStyle} ${fontVariant} ${fontWeight} ${fontSize} ${fontFamiliy}`;
    ctx.font = font;
  }

  drawRow(ctx: CanvasRenderingContext2D, absoluteIndex: number, y: number) {
    if (this.selectionIndizes[absoluteIndex]) {
      ctx.fillStyle = this.backgroundColorSelection;
      ctx.fillRect(0, y, ctx.canvas.width, this.rowHeight);
    } else {
      ctx.fillStyle = this.backgroundColor;
      ctx.fillRect(0, y, ctx.canvas.width, this.rowHeight);
    }
    const row = this.calculatedData[absoluteIndex].data;
    if (row.__isGroup) {
      ctx.fillStyle = this.options.theme.palette.groupHeaderBackgroundColor;
      ctx.fillRect(0, y, ctx.canvas.width, this.rowHeight);
    }
    ctx.strokeStyle = row.__isGroup
      ? this.options.theme.palette.groupHeaderTextColor
      : this.textColor;
    ctx.fillStyle = row.__isGroup
      ? this.options.theme.palette.groupHeaderTextColor
      : this.textColor;

    const level = this.calculatedData[absoluteIndex].level;
    const hasChildren = row.children && row.children.length > 0;

    const paddingLeft = this.options.theme.spacing.cellPaddingLeft;
    const paddingRight = this.options.theme.spacing.cellPaddingLeft;
    if (
      (this.options.dataTree && hasChildren) ||
      (hasChildren && row.__isGroup)
    ) {
      this.drawTreeControl(
        ctx,
        this.expandedIndizes[absoluteIndex],
        paddingLeft - this.scrollLeft + level * this.treeControlWidth,
        y
      );
    }
    const offsetLeft =
      this.options.dataTree && hasChildren
        ? (level + 1) * this.treeControlWidth
        : level * this.treeBranchWidth;

    if (this.options.dataTree && (!hasChildren || level > 0)) {
      this.drawTreeBranch(
        ctx,
        -12 - this.scrollLeft + level * this.treeControlWidth,
        y
      );
    }

    // draw a second time for frozen columns
    const { offset: pinnedColumnOffset } = this.drawFrozenColumns(
      ctx,
      row,
      y,
      offsetLeft,
      paddingRight
    );

    this.drawColumns(ctx, row, y, offsetLeft, paddingRight, pinnedColumnOffset);
  }

  private drawFrozenColumns(
    ctx: CanvasRenderingContext2D,
    row: any,
    y: number,
    offsetLeft: number,
    paddingRight: number
  ) {
    let pinnedColumnOffset = 0;
    this.resetFont(this.ctx);
    if (!row.__isGroup) {
      this.columnConfig?.forEach((column, index) => {
        if (column.pinned) {
          this.ctx.save();
          this.ctx.rect(
            index === 0 ? pinnedColumnOffset + offsetLeft : pinnedColumnOffset,
            y,
            index === 0
              ? this.columnWidths[index] - offsetLeft
              : this.columnWidths[index],
            this.rowHeight
          );
          this.ctx.clip();
          this.ctx.beginPath();
          this.drawCell(
            ctx,
            row?.[column.field],
            column,
            y,
            index === 0 ? pinnedColumnOffset + offsetLeft : pinnedColumnOffset,
            index === 0
              ? this.columnWidths[index] - paddingRight - offsetLeft
              : this.columnWidths[index] - paddingRight
          );
          this.ctx.closePath();
          this.ctx.restore();
          pinnedColumnOffset += this.columnWidths[index];
        }
      });
    }
    return {
      offset: pinnedColumnOffset,
    };
  }

  private drawColumns(
    ctx: CanvasRenderingContext2D,
    row: any,
    y: number,
    offsetLeft: number,
    paddingRight: number,
    pinnedColumnOffset: number
  ) {
    let x = 0 - this.scrollLeft + pinnedColumnOffset;
    if (row.__isGroup) {
      this.drawGroupHeader(row, this.treeControlWidth, y);
    } else {
      this.columnConfig?.forEach((column, index) => {
        if (column.pinned) {
          return;
        }
        const ratioWidth = this.width / ratio;
        if (
          (x >= 0 && x <= ratioWidth) ||
          (x + this.columnWidths[index] >= 0 &&
            x + this.columnWidths[index] <= ratioWidth)
        ) {
          ctx.save();

          let clipx = index === 0 ? x + offsetLeft : x;
          if (clipx < pinnedColumnOffset) {
            clipx = pinnedColumnOffset;
          }
          ctx.rect(
            clipx,
            y,
            index === 0
              ? this.columnWidths[index] - offsetLeft
              : this.columnWidths[index],
            this.rowHeight
          );
          ctx.clip();
          ctx.beginPath();
          this.resetFont(ctx);
          this.drawCell(
            ctx,
            row[column.field],
            column,
            y,
            index === 0 ? x + offsetLeft : x,
            index === 0
              ? this.columnWidths[index] - paddingRight - offsetLeft
              : this.columnWidths[index] - paddingRight
          );
          ctx.closePath();
          ctx.restore();
        }
        x += this.columnWidths[index];
      });
    }
  }

  private drawGroupHeader(row: any, x: number, rowTop: number) {
    this.ctx.beginPath();
    drawTextInCell(
      this.ctx,
      row.__groupValue + ` (${row.children.length})`,
      x,
      rowTop,
      10000,
      this.rowHeight,
      'left'
    );
    this.ctx.closePath();
  }

  drawTreeControl(
    ctx: CanvasRenderingContext2D,
    open: boolean,
    x: number,
    rowTop: any
  ) {
    ctx.beginPath();
    const center = Math.floor(rowTop + this.rowHeight / 2);
    if (open) {
      ctx.moveTo(x, center);
      ctx.lineTo(x + 10, center);
      ctx.lineTo(x + 5, center + 5);
    } else {
      ctx.moveTo(x, center - 5);
      ctx.lineTo(x + 5, center);
      ctx.lineTo(x, center + 5);
    }

    ctx.fill();
    ctx.closePath();
  }

  drawTreeBranch(ctx: CanvasRenderingContext2D, x: number, rowTop: any) {
    ctx.beginPath();
    ctx.lineWidth = 1;
    const bottom = rowTop + this.rowHeight / 2;
    ctx.moveTo(x, rowTop + 5);
    ctx.lineTo(x, bottom);
    ctx.lineTo(x + 5, bottom);

    ctx.stroke();
    ctx.closePath();
  }

  drawCell(
    ctx: CanvasRenderingContext2D,
    value: any,
    column: ColumnConfig,
    top: any,
    x: number,
    width: number,
    rowHeight?: number
  ) {
    const formatter = column.formatter
      ? this.formatters[column.formatter]
      : this.formatters['default'] || this.formatters['default'];
    formatter?.formatTableCell(
      ctx,
      value,
      top,
      x,
      width,
      rowHeight || this.rowHeight,
      column.formatterParams || emptyFormatterParams,
      { gridOptions: this.options, query: this.query }
    );
  }

  public startDraggingRowAtPosition(top: number) {
    const firstIndex = this.scrollTop / this.rowHeight;
    const index = top / this.rowHeight;
    this.draggedRowIndex = Math.floor(firstIndex + index);
  }

  private arraymove(array: any[], fromIndex: number, toIndex: number) {
    var element = array[fromIndex];
    array.splice(fromIndex, 1);
    array.splice(toIndex, 0, element);
  }

  public stopDraggingRow() {
    const result = [...(this.data || [])];
    if (
      this.draggedRowInsertionIndex == undefined &&
      this.draggedRowIndex == undefined
    ) {
      return;
    }

    if (!this.options.dataTree) {
      if (
        this.draggedRowInsertionIndex !== undefined &&
        this.draggedRowIndex !== undefined
      ) {
        let toIndex = this.draggedRowInsertionIndex;
        if (this.draggedRowInsertionIndex < (this.draggedRowIndex || 0)) {
          toIndex += 1;
        }
        this.arraymove(result, this.draggedRowIndex, toIndex);
      }
    } else {
      if (
        this.draggedRowInsertionIndex !== undefined &&
        this.draggedRowIndex !== undefined
      ) {
        let toIndex = this.draggedRowInsertionIndex + 1;
        // if (this.draggedRowInsertionIndex < (this.draggedRowIndex || 0)) {
        //   toIndex += 1;
        // }
        const fromData = this.calculatedData[this.draggedRowIndex];
        let toData;
        // if (this.expandedIndizes[toIndex]) {
        //   toData = this.calculatedData[toIndex + 1];
        // } else {
        // }
        toData = this.calculatedData[toIndex];
        this.calculatedData[toIndex];

        // Move from top-level to top-level
        if (
          fromData.parentIndex === undefined &&
          fromData.parentIndex === toData.parentIndex
        ) {
          this.arraymove(
            result,
            this.draggedRowIndex,
            Math.max(
              this.draggedRowInsertionIndex > (this.draggedRowIndex || 0)
                ? toIndex - 1
                : toIndex,
              0
            )
          );
        }

        // Move inside same parent
        if (
          fromData.parentIndex !== undefined &&
          fromData.parentIndex === toData.parentIndex
        ) {
          this.arraymove(
            fromData.parent.children,
            fromData.indexInParent!,
            Math.max(
              this.draggedRowInsertionIndex > (this.draggedRowIndex || 0)
                ? toData.indexInParent! - 1
                : toData.indexInParent!,
              0
            )
          );
        }

        // Move from one parent to another parent
        if (fromData.parentIndex !== toData.parentIndex) {
          (fromData.parent ? fromData.parent.children : result).splice(
            fromData.indexInParent !== undefined
              ? fromData.indexInParent
              : this.draggedRowIndex,
            1
          );
          if (
            this.expandedIndizes[toIndex] &&
            toIndex === fromData.parentIndex
          ) {
            (toData.parent ? toData.parent.children : result).splice(
              this.calculatedData[Math.max(toIndex - 1, 0)].indexInParent !==
                undefined
                ? toData.indexInParent
                : toIndex,
              0,
              fromData.data
            );
          } else {
            (toData.parent ? toData.parent.children : result).splice(
              toData.indexInParent !== undefined
                ? toData.indexInParent
                : toIndex,
              0,
              fromData.data
            );
          }
        }
      }
    }
    this.blockRedraw = true;
    this.data = result;
    this.draggedRowInsertionIndex = undefined;
    this.draggedRowIndex = undefined;
    this.onDataChange(result);
    this.blockRedraw = false;
  }

  public dragRowToPosition(top: number) {
    const firstIndex = this.scrollTop / this.rowHeight;
    const index = top / this.rowHeight;
    this.draggedRowInsertionIndex = Math.floor(firstIndex + index);
    if (this.draggedRowInsertionIndex < (this.draggedRowIndex || 0)) {
      this.draggedRowInsertionIndex -= 1;
    }
  }

  public drawRowToCanvasAtPosition(canvas: HTMLCanvasElement, top: number) {
    const firstIndex = this.scrollTop / this.rowHeight;
    const index = top / this.rowHeight;
    const context = canvas.getContext('2d')!;
    context.setTransform(ratio, 0, 0, ratio, 0.5, 0.5);
    this.drawRow(context, Math.floor(firstIndex + index), 0);
  }
}

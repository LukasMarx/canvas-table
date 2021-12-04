import { ColumnConfig } from "./types/ColumnConfig";
import { CellClickEvent, RowClickEvent } from "./types/Events";
import { v4 } from "uuid";

export class BaseGrid {
  protected canvas: any;
  private _data: any[] | undefined;
  private _rowHeight = 32;
  private _width: number = 0;
  private _height: number = 0;
  private _scrollTop = 0;
  private _scrollLeft = 0;
  private _columnConfig?: ColumnConfig[] | undefined;
  private _textColor: string = "#4e4e4e";
  private _backgroundColor: string = "#fff";
  private _backgroundColorSelection: string = "#eee";
  private _selectionKeys: Record<string, boolean> = {};
  private _selectionIndizes: Record<number, boolean> = {};
  private _selectionData: any[] = [];
  private _expandedKeys: Record<string, boolean> = {};
  private _expandedIndizes: Record<number, boolean> = {};
  private _calculatedData: { level: number; data: any }[] = [];

  private _blockRedraw = false;

  public get blockRedraw() {
    return this._blockRedraw;
  }
  public set blockRedraw(value) {
    this._blockRedraw = value;
    if (!value) {
      this.redraw();
    }
  }

  private rowMapId = 0;
  private rowMap = new WeakMap();
  private _buildSelectionKeys: (row: any) => string = (row) => {
    if (!this.rowMap.has(row)) {
      this.rowMap.set(row, ++this.rowMapId);
    }

    return this.rowMap.get(row).toString();
  };

  private listeners: Record<string, Record<string, any>> = {};

  public addEventListener(
    name: "cellClick" | "rowClick",
    callback: (e: RowClickEvent) => void
  ): string {
    if (!this.listeners[name]) {
      this.listeners[name] = {};
    }
    const id = v4();
    this.listeners[name][id] = callback;
    return id;
  }

  protected calculateSelection() {
    let index = 0;
    const selectionIndizes: Record<number, boolean> = {};
    const selectionData = [];
    for (const row of this.calculatedData || []) {
      const key = this.buildSelectionKeys(row.data);
      if (this._selectionKeys[key]) {
        selectionIndizes[index] = true;
        selectionData.push(row);
      }
      index++;
    }
    this.selectionIndizes = selectionIndizes;
    this.selectionData = selectionData;
  }

  caculateData(allData: any[], level = 0) {
    const result: any[] = [];
    const indizes: Record<number, boolean> = {};
    let index = 0;
    for (const data of allData || []) {
      result.push({ level, data });
      const key = this.buildSelectionKeys(data);
      if (this.expandedKeys[key] && data.children) {
        indizes[index] = true;
        const { rows: subResult, openIndizes } = this.caculateData(
          data.children,
          level + 1
        );
        Object.keys(openIndizes).forEach(
          (i) => (indizes[(index + parseInt(i, 10) + 1) as any] = true)
        );
        subResult.forEach((res) => result.push(res));
        index += Object.keys(data.children).length;
      }
      index++;
    }
    return { rows: result, openIndizes: indizes };
  }

  public get calculatedData(): { level: number; data: any }[] {
    return this._calculatedData;
  }
  private set calculatedData(value: { level: number; data: any }[]) {
    this._calculatedData = value;
  }

  public get expandedIndizes(): Record<number, boolean> {
    return this._expandedIndizes;
  }
  private set expandedIndizes(value: Record<number, boolean>) {
    this._expandedIndizes = value;
  }

  public get buildSelectionKeys(): (row: any) => any {
    return this._buildSelectionKeys;
  }
  public set buildSelectionKeys(value: (row: any) => any) {
    this._buildSelectionKeys = value;
    this.calculateSelection();
    this.redraw();
  }

  public get height(): number {
    return this._height;
  }
  public set height(value: number) {
    this._height = value;
    this.canvas.height = value;
    this.redraw();
  }

  public get width(): number {
    return this._width;
  }
  public set width(value: number) {
    this._width = value;
    this.canvas.width = value;
    this.calculateColumnWidths(this.columnConfig || []);
    this.redraw();
  }

  public get selectionIndizes(): Record<number, boolean> {
    return this._selectionIndizes;
  }
  private set selectionIndizes(value: Record<number, boolean>) {
    this._selectionIndizes = value;
  }

  public get selectionKeys(): Record<string, boolean> {
    return { ...this._selectionKeys };
  }
  public set selectionKeys(value: Record<string, boolean>) {
    this._selectionKeys = value;
    this.calculateSelection();
    this.redraw();
  }

  public get selectionData(): any[] {
    return this._selectionData;
  }
  private set selectionData(value: any[]) {
    this._selectionData = value;
  }

  public removeLister(name: "cellClick" | "rowClick", id: string) {
    delete this.listeners[name]?.[id];
  }

  protected fireEvent(name: "cellClick" | "rowClick", ...args: any[]) {
    for (const callback of Object.values(this.listeners[name] || [])) {
      callback.call(...args);
    }
  }

  public get backgroundColorSelection(): string {
    return this._backgroundColorSelection;
  }
  public set backgroundColorSelection(value: string) {
    this._backgroundColorSelection = value;
    this.redraw();
  }

  public get backgroundColor(): string {
    return this._backgroundColor;
  }
  public set backgroundColor(value: string) {
    this._backgroundColor = value;
    this.redraw();
  }

  public get textColor(): string {
    return this._textColor;
  }
  public set textColor(value: string) {
    this._textColor = value;
    this.redraw();
  }

  protected columnWidths: number[] = [];

  public get columnConfig(): ColumnConfig[] | undefined {
    return this._columnConfig;
  }
  public set columnConfig(value: ColumnConfig[] | undefined) {
    this._columnConfig = value;
    this.calculateColumnWidths(value || []);
    this.redraw();
  }

  public get scrollLeft() {
    return this._scrollLeft;
  }
  public set scrollLeft(value) {
    this._scrollLeft = value;
    this.redraw();
  }

  public get scrollTop() {
    return this._scrollTop;
  }
  public set scrollTop(value) {
    this._scrollTop = value;
    this.redraw();
  }

  set data(data: any[] | undefined) {
    this._data = data;
    const { openIndizes, rows } = this.caculateData(this.data || []);
    this.expandedIndizes = openIndizes;
    this.calculatedData = rows;
    this.calculateSelection();
    this.redraw();
  }

  get data(): any[] | undefined {
    return this._data;
  }

  set rowHeight(rowHeight: number) {
    this._rowHeight = rowHeight;
    this.redraw();
  }

  get rowHeight(): number {
    return this._rowHeight;
  }

  public get expandedKeys(): Record<string, boolean> {
    return this._expandedKeys;
  }
  public set expandedKeys(value: Record<string, boolean>) {
    this._expandedKeys = value;
    console.log(this.expandedKeys);
    const { openIndizes, rows } = this.caculateData(this.data || []);
    console.log(openIndizes);
    this.expandedIndizes = openIndizes;
    this.calculatedData = rows;
    this.calculateSelection();
    this.redraw();
  }

  protected calculateColumnWidths(columns: ColumnConfig[]) {}

  redraw() {}
}

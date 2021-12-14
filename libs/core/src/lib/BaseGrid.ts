import { ColumnConfig } from './types/ColumnConfig';
import { RowClickEvent } from './types/Events';
import { v4 } from 'uuid';
import { GridOptions } from './types/Grid';
import { IFormatter } from './formatter/IFormatter';
import { createNewSortInstance } from 'fast-sort';
import { get } from 'object-path';
import { execPath } from 'process';

export class BaseGrid {
  protected canvas: any;
  private _data: any[] | undefined;
  private _rowHeight = 32;
  private _width = 0;
  private _height = 0;
  private _scrollTop = 0;
  private _scrollLeft = 0;
  private _columnConfig?: ColumnConfig[] | undefined;

  private _selectionKeys: Record<string, boolean> = {};
  private _selectionIndizes: Record<number, boolean> = {};
  private _selectionData: any[] = [];
  private _expandedKeys: Record<string, boolean> = {};
  private _expandedIndizes: Record<number, boolean> = {};
  private _calculatedData: { level: number; data: any }[] = [];
  private _options: GridOptions;
  private _query: string | undefined;

  protected formatters: Record<string, IFormatter<any>> = {};
  protected fastSortScheme: any;

  private _blockRedraw = false;

  constructor(gridOptions: GridOptions) {
    this._options = gridOptions;
    this.calculateFastSortScheme();
  }

  public get rowHeight() {
    return this.options?.rowHeight || this._rowHeight;
  }

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
    name: 'cellClick' | 'rowClick' | 'rowContextMenu',
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

  calculateFastSortScheme() {
    const result = [];
    for (const column of this.columnConfig || []) {
      if (column.sortIndex !== undefined) {
        const formatter = column.formatter
          ? this.formatters[column.formatter]
          : this.formatters['default'] || this.formatters['default'];
        if (
          column.sortDirection === 'asc' ||
          column.sortDirection === undefined
        )
          result[column.sortIndex] = {
            asc: (u: any) =>
              formatter.toText(
                get(u, column.field),
                column.formatterParams || {},
                { gridOptions: this.options }
              ),
            comparer: new Intl.Collator(undefined, {
              numeric: true,
              sensitivity: 'base',
            }).compare,
          };
        if (column.sortDirection === 'desc')
          result[column.sortIndex] = {
            desc: (u: any) =>
              formatter.toText(
                get(u, column.field),
                column.formatterParams || {},
                { gridOptions: this.options }
              ),
            comparer: new Intl.Collator(undefined, {
              numeric: true,
              sensitivity: 'base',
            }).compare,
          };
      }
    }
    this.fastSortScheme = result;
  }

  private sorter = createNewSortInstance({
    comparer(a: any, b: any): number {
      if (a == null) return 1;
      if (b == null) return -1;
      if (a < b) return -1;
      if (a === b) return 0;

      return 1;
    },
  });

  sortData(allData: any[]) {
    return this.sorter(allData).by(this.fastSortScheme);
  }

  filterData(allData: any[]) {
    const expandedKeys: Record<string, boolean> = {};
    let rowCount: number = 0;
    let rows: any[] = [];
    if (this.query) {
      for (const row of allData) {
        for (const column of this.columnConfig || []) {
          const formatter = column.formatter
            ? this.formatters[column.formatter]
            : this.formatters['default'] || this.formatters['default'];
          const value = formatter.toText(
            row[column.field],
            column.formatterParams || {},
            {
              gridOptions: this.options,
            }
          );

          if (value && value.includes(this.query)) {
            rowCount += 1;
            rows.push(row);
            break;
          }
        }
        if ((this.options.dataTree || this.options.groupBy) && row.children) {
          const { rowCount: newRowCount, expandedKeys: expKeys } =
            this.filterData(row.children);
          if (newRowCount) {
            rowCount += newRowCount;
            const key = this.buildSelectionKeys(row);
            expandedKeys[key] = true;
            rows.push(row);
          }
          Object.keys(expKeys).forEach((key) => (expandedKeys[key] = true));
        }
      }
    } else {
      return { rows: allData };
    }
    return { rows, rowCount, expandedKeys };
  }

  caculateData(allData: any[], level = 0, index = 0) {
    const result: any[] = [];
    const indizes: Record<number, boolean> = {};
    const sortedData =
      level > 0
        ? this.sortData(this.filterData(allData).rows)
        : this.sortData(allData);
    for (const data of sortedData || []) {
      result.push({ level, data });
      const key = this.buildSelectionKeys(data);
      if (this.expandedKeys[key] && data.children) {
        indizes[index] = true;
        const {
          rows: subResult,
          openIndizes,
          index: newIndex,
        } = this.caculateData(data.children, level + 1, index + 1);
        Object.keys(openIndizes).forEach(
          (i) => (indizes[parseInt(i, 10) as any] = true)
        );
        subResult.forEach((res) => result.push(res));
        index = newIndex - 1;
      }
      index++;
    }
    return { rows: result, openIndizes: indizes, index };
  }

  public onHeightChange: (height: number) => void = () => {};

  public onRowContextMenu: (
    rowData: any,
    column: ColumnConfig,
    rowIndex: number
  ) => void = () => {};

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

  public removeLister(
    name: 'cellClick' | 'rowClick' | 'rowContextMenu',
    id: string
  ) {
    delete this.listeners[name]?.[id];
  }

  protected fireEvent(
    name: 'cellClick' | 'rowClick' | 'rowContextMenu',
    ...args: any[]
  ) {
    for (const callback of Object.values(this.listeners[name] || [])) {
      callback(...args);
    }
  }

  public get backgroundColorSelection(): string {
    return this.options.theme?.palette?.backgroundColorSelected;
  }

  public get backgroundColor(): string {
    return this.options.theme?.palette?.backgroundColor;
  }

  public get textColor(): string {
    return this.options.theme?.palette?.textColor;
  }

  public get textColorSelected(): string {
    return this.options.theme?.palette?.textColorSelected;
  }

  protected columnWidths: number[] = [];

  private doesRequireFullUpdate(
    oldValue?: ColumnConfig[],
    newValue?: ColumnConfig[]
  ) {
    let result = false;
    if (!oldValue) {
      return true;
    }
    oldValue?.forEach((column, index) => {
      if (column.sortDirection !== newValue?.[index]?.sortDirection) {
        result = true;
      }
      if (column.sortIndex !== newValue?.[index]?.sortIndex) {
        result = true;
      }
    });
    return result;
  }

  public get columnConfig(): ColumnConfig[] | undefined {
    return this._columnConfig;
  }

  public set columnConfig(value: ColumnConfig[] | undefined) {
    const doesRequireFullUpdate = this.doesRequireFullUpdate(
      this._columnConfig,
      value
    );
    this._columnConfig = value;
    this.calculateColumnWidths(value || []);
    if (doesRequireFullUpdate) {
      this.calculateFastSortScheme();
      const { openIndizes, rows } = this.caculateData(this.data || []);
      this.expandedIndizes = openIndizes;
      this.calculatedData = rows;
      this.calculateSelection();
    }
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
    this.onHeightChange(this.calculatedData.length * this.rowHeight);
    this.redraw();
  }

  get data(): any[] | undefined {
    return this._data;
  }

  public get options(): GridOptions {
    return this._options;
  }
  public set options(value: GridOptions) {
    this._options = value;

    const { openIndizes, rows } = this.caculateData(this.data || []);
    this.expandedIndizes = openIndizes;
    this.calculatedData = rows;
    this.calculateSelection();
    this.onHeightChange(this.calculatedData.length * this.rowHeight);
    this.redraw();
  }

  public get expandedKeys(): Record<string, boolean> {
    return this._expandedKeys;
  }
  public set expandedKeys(value: Record<string, boolean>) {
    this._expandedKeys = value;
    const { openIndizes, rows } = this.caculateData(this.data || []);
    this.expandedIndizes = openIndizes;
    this.calculatedData = rows;
    this.calculateSelection();
    this.onHeightChange(this.calculatedData.length * this.rowHeight);
    this.redraw();
  }

  public get query(): string | undefined {
    return this._query;
  }
  public set query(value: string | undefined) {
    if (this._query !== value) {
      this._query = value;
      const { rows: filteredData, expandedKeys } = this.filterData(
        this.data || []
      );
      if (expandedKeys) {
        this._expandedKeys = expandedKeys;
      }

      const { openIndizes, rows } = this.caculateData(filteredData);
      this.expandedIndizes = openIndizes;
      this.calculatedData = rows;
      this.calculateSelection();
      this.onHeightChange(this.calculatedData.length * this.rowHeight);
      this.redraw();
    }
  }

  protected calculateColumnWidths(columns: ColumnConfig[]) {}

  redraw() {}
}

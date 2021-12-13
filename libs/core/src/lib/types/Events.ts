import { ColumnConfig } from "./ColumnConfig";

export interface RowClickEvent {
  rowData: any;
  rowIndex: number;
  column: ColumnConfig;
  columnIndex: number;
  left: number;
  top: number;
}

export interface CellClickEvent {
  rowData: any;
  rowIndex: number;
  column: ColumnConfig;
  columnIndex: number;
  left: number;
  top: number;
}

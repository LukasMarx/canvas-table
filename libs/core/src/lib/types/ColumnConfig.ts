import { IFormatterParams } from "../formatter/IFormatter";

export interface ColumnConfig {
  field: string;
  formatter?: string;
  width?: number;
  formatterParams?: IFormatterParams;
  sortIndex?: number;
  sortDirection?: "asc" | "desc";
  pinned?: boolean;
}

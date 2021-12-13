import { ColumnConfig } from '../types/ColumnConfig';

export function calculateColumnWidths(
  columns: ColumnConfig[],
  width: number,
  ratio: number
): number[] {
  let distributeableSpace = width;
  let numOfRelativeColumns = 0;
  for (const column of columns) {
    if (column.width != null) {
      distributeableSpace -= column.width;
    } else {
      numOfRelativeColumns += 1;
    }
  }

  const widths = [];
  for (const column of columns) {
    if (column.width != null) {
      widths.push(Math.floor(column.width));
    } else {
      widths.push(Math.floor(distributeableSpace / numOfRelativeColumns));
    }
  }
  return widths;
}

export function objectToGroupTree(obj: Record<string, any>) {
  const result = [];
  for (const [key, value] of Object.entries(obj)) {
    let children: any[];
    if (Array.isArray(value)) {
      children = value;
    } else {
      children = objectToGroupTree(value);
    }
    result.push({
      __groupValue: key,
      __isGroup: true,
      children,
    });
  }
  return result;
}

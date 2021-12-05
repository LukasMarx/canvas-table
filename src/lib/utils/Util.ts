import { ColumnConfig } from "../types/ColumnConfig";

export function calculateColumnWidths(
  columns: ColumnConfig[],
  width: number,
  ratio: number
): number[] {
  let distributeableSpace = width;
  let numOfAbsoluteColumns = 0;
  let numOfRelativeColumns = 0;
  for (const column of columns) {
    if (column.width != null) {
      distributeableSpace -= column.width;
      numOfAbsoluteColumns += 1;
    } else {
      numOfRelativeColumns += 1;
    }
  }

  const widths = [];
  // for (const column of columns) {
  //   if (column.pinned) {
  //     if (column.width != null) {
  //       widths.push(Math.floor(column.width));
  //     } else {
  //       widths.push(Math.floor(distributeableSpace / numOfRelativeColumns));
  //     }
  //   }
  // }
  for (const column of columns) {
    if (column.width != null) {
      widths.push(Math.floor(column.width));
    } else {
      widths.push(Math.floor(distributeableSpace / numOfRelativeColumns));
    }
  }
  return widths;
}

export function throttle(callback: any, limit: number) {
  var tick = false;
  return function (...args: any) {
    if (!tick) {
      callback(...args);
      tick = true;
      setTimeout(function () {
        tick = false;
      }, limit);
    }
  };
}

export function debounce(func: any, timeout = 300) {
  let timer: number;
  return (...args: any) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.call(args);
    }, timeout);
  };
}

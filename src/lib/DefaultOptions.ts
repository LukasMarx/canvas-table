import { GridOptions } from "./types/Grid";

export const defaultOptions: GridOptions = {
  theme: {
    font: {
      familiy: "sans-serif",
      size: 14,
      weight: "normal",
      style: "normal",
      variant: "normal",
    },
    palette: {
      textColor: "#212121",
      textColorSelected: "#212121",
      backgroundColor: "#fff",
      backgroundColorSelected: "#eee",
      headerBackgroundColor: "#fff",
      headerBackgroundColorDragging: "#eee",
      headerTextColor: "#fff",
      headerTextColorDragging: "#fff",
      lineColor: "#212121",
    },
    spacing: {
      cellPaddingLeft: 8,
      cellPaddingRight: 8,
    },
  },
  rowHeight: 32,
};

export interface GridOptions {
  dataTree?: boolean;
  theme: {
    font: {
      familiy: string;
      size: number;
      style: "normal" | "italic" | "oblique";
      variant: "normal" | "small-caps";
      weight:
        | "normal"
        | "bold"
        | "bolder"
        | "lighter"
        | "100"
        | "200"
        | "300"
        | "400"
        | "500"
        | "600"
        | "700"
        | "800"
        | "900";
    };
    palette: {
      textColor: string;
      textColorSelected: string;
      backgroundColor: string;
      backgroundColorSelected: string;
      headerBackgroundColor: string;
      headerTextColor: string;
      headerBackgroundColorDragging: string;
      headerTextColorDragging: string;
      lineColor: string;
    };
    spacing: {
      cellPaddingLeft: number;
      cellPaddingRight: number;
    };
  };
  rowHeight?: number;
  groupBy?: string[];
}
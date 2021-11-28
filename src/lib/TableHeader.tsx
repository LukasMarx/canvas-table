import React, { ReactElement, useEffect, useRef } from "react";
import useResizeObserver from "use-resize-observer";
import { StringFormatter } from "./StringFormatter";
import { ColumnConfig } from "./types/ColumnConfig";
import { calculateColumnWidths } from "./utils/Util";

interface TableHeaderProps {
  columns?: ColumnConfig[];
  textColor?: string;
  backgroundColor?: string;
  scrollLeft?: number;
}

const ratio = 2;
const headerHeight = 48;

const stringFormatter = new StringFormatter();

export function TableHeader(props: TableHeaderProps): ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { ref, width = 1 } = useResizeObserver<HTMLDivElement>({
    box: "border-box",
  });

  useEffect(() => {
    if (canvasRef.current && props.columns) {
      const ctx = canvasRef.current.getContext("2d")!;
      ctx.setTransform(ratio, 0, 0, ratio, 0.5, 0.5);

      const columnWidths = calculateColumnWidths(
        props.columns,
        ctx.canvas.width,
        ratio
      );

      let x = 0 - (props.scrollLeft || 0);
      ctx.beginPath();
      ctx.fillStyle = props.backgroundColor!;
      ctx.fillRect(0, 0, ctx.canvas.width, headerHeight);
      ctx.stroke();
      ctx.beginPath();
      ctx.fillStyle = props.textColor!;
      props.columns?.forEach((column, index) => {
        ctx.font = "bold 14px sans-serif";
        stringFormatter.format(
          ctx,
          column.field,
          0,
          x,
          columnWidths[index],
          headerHeight
        );
        ctx.stroke();
        x += columnWidths[index];
      });
      ctx.closePath();
    }
  }, [props.columns, props.scrollLeft, width]);

  return (
    <div ref={ref} style={{ width: "100%", height: headerHeight }}>
      <canvas
        ref={canvasRef}
        height={headerHeight * ratio}
        width={width * ratio}
        style={{ width: width, height: headerHeight }}
      />
    </div>
  );
}

TableHeader.defaultProps = {
  textColor: "#4e4e4e",
  backgroundColor: "#fff",
};

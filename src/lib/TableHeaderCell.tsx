import React, { useCallback } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ColumnConfig } from "./types/ColumnConfig";
import { DeepPartial } from "./types/DeepPartial";
import { GridOptions } from "./types/Grid";

export function TableHeaderCell(props: {
  id: string;
  width: number;
  height: number;
  column: ColumnConfig;
  title: string;
  options?: DeepPartial<GridOptions>;
  onClick?(column: ColumnConfig): void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.id });

  const style = {
    transform: CSS.Translate.toString(transform),
    width: props.width,
    height: props.height,
    display: "inline-block",
    backgroundColor: isDragging
      ? props.options?.theme?.palette?.headerBackgroundColorDragging
      : props.options?.theme?.palette?.headerBackgroundColor,
    color: isDragging
      ? props.options?.theme?.palette?.headerTextColorDragging
      : props.options?.theme?.palette?.headerTextColor,
    zIndex: isDragging ? 10000000 : 100,
    fontSize: 14,
    fontWeight: "bold",
    transition,
  };

  const handleClick = useCallback(() => {
    props.onClick?.(props.column);
  }, [props.column, props.onClick]);

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      style={style}
      className={"column-header"}
      onClick={handleClick}
    >
      <div
        style={{
          display: "flex",
          cursor: "pointer",
          alignItems: "center",
          height: "100%",
          paddingLeft: 8,
          userSelect: "none",
        }}
      >
        <span>{props.id}</span>
      </div>
    </div>
  );
}

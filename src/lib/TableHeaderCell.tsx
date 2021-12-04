import React, { useCallback } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ColumnConfig } from "./types/ColumnConfig";

export function TableHeaderCell(props: {
  id: string;
  width: number;
  height: number;
  column: ColumnConfig;
  title: string;
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
    backgroundColor: isDragging ? "#e4e4e4" : "#fff",
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

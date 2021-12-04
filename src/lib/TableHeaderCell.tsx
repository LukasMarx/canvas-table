import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export function TableHeaderCell(props: {
  id: string;
  width: number;
  height: number;
  title: string;
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

  return (
    <div ref={setNodeRef} {...attributes} {...listeners} style={style}>
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

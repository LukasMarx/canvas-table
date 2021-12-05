import React, { useCallback } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ColumnConfig } from "../../types/ColumnConfig";
import { DeepPartial } from "../../types/DeepPartial";
import { GridOptions } from "../../types/Grid";
import locked from "../../assets/lock_black_24dp.svg";

export function TableHeaderCell(props: {
  id: string;
  width: number;
  height: number;
  column: ColumnConfig;
  title: string;
  options?: DeepPartial<GridOptions>;
  hasMoreThanOneSortIndex?: boolean;
  disabled?: boolean;
  onClick?(e: React.MouseEvent, column: ColumnConfig): void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: props.id, disabled: props.disabled });

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
    fontSize: 14,
    fontWeight: "bold",
    transition,
  };

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      props.onClick?.(e, props.column);
    },
    [props.column, props.onClick]
  );

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
          paddingRight: 8,
        }}
      >
        <span>{props.id}</span>
        <div style={{ flex: 1 }} />
        {props.column.pinned && <img src={locked} width={16} height={16} />}
        {props.column.sortIndex !== undefined &&
          (props.column.sortDirection === "asc" ||
            props.column.sortDirection === undefined) && (
            <div
              style={{
                width: 0,
                height: 0,
                borderLeft: "5px solid transparent",
                borderRight: "5px solid transparent",
                borderTop: `5px solid black`,
              }}
            />
          )}
        {props.column.sortIndex !== undefined &&
          props.column.sortDirection === "desc" && (
            <div
              style={{
                width: 0,
                height: 0,
                borderLeft: "5px solid transparent",
                borderRight: "5px solid transparent",
                borderBottom: `5px solid black`,
              }}
            />
          )}

        {props.hasMoreThanOneSortIndex &&
          props.column.sortIndex !== undefined && (
            <span style={{ marginLeft: 4 }}>{props.column.sortIndex + 1}</span>
          )}
      </div>
    </div>
  );
}

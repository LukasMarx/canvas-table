const ellipsis = "…";
const measuredCharTextCache: Record<string, number> = {};

function measureText(ctx: CanvasRenderingContext2D, value: string) {
  const key = ctx.strokeStyle + value;
  let textWidth;
  if (measuredCharTextCache[key] !== undefined) {
    textWidth = measuredCharTextCache[key];
  } else {
    textWidth = ctx.measureText(value).width;
    measuredCharTextCache[key] = textWidth;
  }
  return textWidth;
}

/** Add ellipsis if text does not fit. This is very slow... */
function fitText(
  ctx: CanvasRenderingContext2D,
  value: string,
  maxWidth: number
) {
  const textWidth = measureText(ctx, value);

  if (textWidth > maxWidth) {
    const offset = textWidth - maxWidth;
    const offsetCharWidth = ctx.measureText("W").width;
    const removeCharCount = Math.ceil(offset / offsetCharWidth) + 3;
    return value.substring(0, value.length - removeCharCount) + "...";
  } else {
    return value;
  }
}

export function drawTextInCell(
  ctx: CanvasRenderingContext2D,
  value: string,
  x: number,
  top: number,
  width: number,
  height: number,
  position: "left" | "start" | "center" | "right" | "end"
) {
  let textX = x;
  let textTop = top;
  if (position === "left" || !position) {
    if (ctx.textAlign !== "left") {
      ctx.textAlign = "left";
    }
    textX = x + 8;
    textTop = top + (height / 2 + 6);
  }
  if (position === "center") {
    if (ctx.textAlign !== "center") {
      ctx.textAlign = "center";
    }
    textX = x + Math.floor(width / 2);
    textTop = top + (height / 2 + 6);
  }
  if (position === "right") {
    if (ctx.textAlign !== "right") {
      ctx.textAlign = "right";
    }
    textX = x + width - 8;
    textTop = top + (height / 2 + 6);
  }
  ctx.fillText(value.toString(), textX, textTop);
}

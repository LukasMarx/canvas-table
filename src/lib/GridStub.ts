import { IFormatter } from "./formatter/IFormatter";
import { Grid } from "./Grid";
import { ColumnConfig } from "./types/ColumnConfig";
import { DeepPartial } from "./types/DeepPartial";
import { GridOptions } from "./types/Grid";
import { debounce, throttle } from "./utils/Util";
import Worker from "./worker/Worker?worker";

function isOffscreenCanvasSupported() {
  const canvasTest = document.createElement("canvas");
  return typeof (canvasTest as any).transferControlToOffscreen === "function";
}

export function createGrid(
  canvases: HTMLCanvasElement[],
  options: GridOptions,
  formatters?: Record<
    string,
    {
      new (): IFormatter<any>;
    }
  >,
  useSingleWorker?: boolean
) {
  var canvasTest = document.createElement("canvas");
  if (isOffscreenCanvasSupported()) {
    if (useSingleWorker || canvases.length > 1) {
      const workers: Worker[] = [];
      for (let canvas of canvases) {
        workers.push(new Worker());
      }
      return new GridStub(workers, canvases, options);
    } else if (canvases.length) {
      const ctx = canvases[0].getContext("2d")!;
      return new Grid(ctx, canvases[0], formatters || {}, options);
    }
  } else {
    const ctx = canvases[0].getContext("2d")!;
    return new Grid(ctx, canvases[0], formatters || {}, options);
  }
}

export class GridStub {
  public readonly rowHeight = 32;
  private _data: any[] | undefined;
  private _columnConfig?: ColumnConfig[] | undefined;
  private _options: GridOptions;
  private _width: number = 0;
  private _height: number = 0;
  private _left: number = 0;
  private _top: number = 0;
  private workers: Worker[] = [];

  public nextWorker = 0;

  constructor(
    workers: Worker[],
    canvases: HTMLCanvasElement[],
    options: GridOptions
  ) {
    const offscreens = canvases.map((canvas) =>
      (canvas as any).transferControlToOffscreen()
    );
    this._options = options;
    this.workers = workers;
    this.workers.forEach((worker, index) => {
      worker.addEventListener("message", (message) => {
        if (message.data === "ready") {
          worker.postMessage(
            {
              type: "init",
              canvas: offscreens[index],
              data: this.data,
              columns: this.columnConfig,
              gridOptions: this.options,
            },
            [offscreens[index] as any]
          );
        }
        if (message.data?.type === "heightChange") {
          this.onHeightChange(message.data.height);
        }
      });
    });
  }

  public get columnConfig(): ColumnConfig[] | undefined {
    return this._columnConfig;
  }
  public set columnConfig(value: ColumnConfig[] | undefined) {
    this._columnConfig = value;
    this.workers.forEach((worker) => {
      worker.postMessage({
        type: "setColumns",
        columns: value,
      });
    });
  }

  set data(data: any[] | undefined) {
    this._data = data;
    this.workers.forEach((worker) => {
      worker.postMessage({
        type: "setData",
        data: data,
      });
    });
  }

  public get options(): GridOptions {
    return this._options;
  }
  public set options(value: GridOptions) {
    this._options = value;
    this.workers.forEach((worker) => {
      worker.postMessage({
        type: "setOptions",
        options: value,
      });
    });
  }

  get data(): any[] | undefined {
    return this._data;
  }

  private sendDimensions = debounce(() => {
    this.workers.forEach((worker) => {
      worker.postMessage({
        type: "setDimensions",
        width: this.width,
        height: this.height,
      });
    });
  }, 16);

  public get height(): number {
    return this._height;
  }
  public set height(value: number) {
    this._height = value;
    this.sendDimensions();
  }

  public get width(): number {
    return this._width;
  }
  public set width(value: number) {
    this._width = value;
    this.sendDimensions();
  }

  private sendScrollPosition = throttle(() => {
    this.workers[this.nextWorker].postMessage({
      type: "setScrollPosition",
      left: this.scrollLeft,
      top: this.scrollTop,
    });

    if (this.workers.length > 1) {
      if (this.nextWorker) {
        this.nextWorker = 0;
      } else {
        this.nextWorker = 1;
      }
    } else {
      this.nextWorker = 0;
    }
  }, 16);

  private sendScrollPositionHorizontal = throttle(() => {
    this.workers[this.nextWorker].postMessage({
      type: "setScrollPosition",
      left: this.scrollLeft,
      top: this.scrollTop,
    });

    if (this.workers.length > 1) {
      if (this.nextWorker) {
        this.nextWorker = 0;
      } else {
        this.nextWorker = 1;
      }
    } else {
      this.nextWorker = 0;
    }
  }, 16);

  private sendLastScrollPosition = debounce(() => {
    this.workers.forEach((worker) => {
      worker.postMessage({
        type: "setScrollPosition",
        left: this.scrollLeft,
        top: this.scrollTop,
      });
    });
  }, 64);

  public get scrollLeft(): number {
    return this._left;
  }
  public set scrollLeft(value: number) {
    if (value !== this._left) {
      this._left = value;
      this.sendScrollPositionHorizontal();
      this.sendLastScrollPosition();
    }
  }
  public get scrollTop(): number {
    return this._top;
  }
  public set scrollTop(value: number) {
    if (value !== this._top) {
      this._top = value;
      this.sendScrollPosition();
      this.sendLastScrollPosition();
    }
  }

  public onHeightChange: (height: number) => void = () => {};

  fireClickEvent(options: { left: number; top: number; shiftKey?: boolean }) {
    this.workers.forEach((worker) => {
      worker.postMessage({
        type: "onClick",
        ...options,
      });
    });
  }
}

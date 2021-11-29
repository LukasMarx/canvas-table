import { ColumnConfig } from "./types/ColumnConfig";
import { debounce, throttle } from "./utils/Util";
import Worker from "./Worker?worker";

const worker = new Worker();

export class GridStub {
  public readonly rowHeight = 32;
  private _data: any[] | undefined;
  private _columnConfig?: ColumnConfig[] | undefined;
  private _width: number = 0;
  private _height: number = 0;
  private _left: number = 0;
  private _top: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    const offscreen = (canvas as any).transferControlToOffscreen();

    worker.addEventListener("message", (message) => {
      if (message.data === "ready") {
        worker.postMessage(
          {
            type: "init",
            canvas: offscreen,
            data: this.data,
            columns: this.columnConfig,
          },
          [offscreen as any]
        );
      }
    });
  }

  public get columnConfig(): ColumnConfig[] | undefined {
    return this._columnConfig;
  }
  public set columnConfig(value: ColumnConfig[] | undefined) {
    this._columnConfig = value;
    worker.postMessage({
      type: "setColumns",
      data: value,
    });
  }

  set data(data: any[] | undefined) {
    this._data = data;
    worker.postMessage({
      type: "setData",
      data: data,
    });
  }

  get data(): any[] | undefined {
    return this._data;
  }

  private sendDimensions = debounce(() => {
    worker.postMessage({
      type: "setDimensions",
      width: this.width,
      height: this.height,
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
    worker.postMessage({
      type: "setScrollPosition",
      left: this.left,
      top: this.top,
    });
  }, 8);

  private sendLastScrollPosition = debounce(() => {
    worker.postMessage({
      type: "setScrollPosition",
      left: this.left,
      top: this.top,
    });
  }, 16);

  public get left(): number {
    return this._left;
  }
  public set left(value: number) {
    this._left = value;
    this.sendScrollPosition();
  }
  public get top(): number {
    return this._top;
  }
  public set top(value: number) {
    this._top = value;
    this.sendScrollPosition();
    this.sendLastScrollPosition();
  }

  fireClickEvent(options: { left: number; top: number; shiftKey?: boolean }) {
    worker.postMessage({
      type: "onClick",
      ...options,
    });
  }
}

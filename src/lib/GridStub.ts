import { IFormatter } from "./formatter/IFormatter";
import { ColumnConfig } from "./types/ColumnConfig";
import { debounce, throttle } from "./utils/Util";
import Worker from "./worker/Worker?worker";

const workers = [new Worker(), new Worker()];

export class GridStub {
  public readonly rowHeight = 32;
  private _data: any[] | undefined;
  private _columnConfig?: ColumnConfig[] | undefined;
  private _width: number = 0;
  private _height: number = 0;
  private _left: number = 0;
  private _top: number = 0;

  public nextWorker = 0;

  constructor(canvases: HTMLCanvasElement[]) {
    const offscreens = canvases.map((canvas) =>
      (canvas as any).transferControlToOffscreen()
    );

    workers.forEach((worker, index) => {
      worker.addEventListener("message", (message) => {
        if (message.data === "ready") {
          worker.postMessage(
            {
              type: "init",
              canvas: offscreens[index],
              data: this.data,
              columns: this.columnConfig,
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
    workers[0].postMessage({
      type: "setColumns",
      columns: value,
    });
    workers[1].postMessage({
      type: "setColumns",
      columns: value,
    });
  }

  set data(data: any[] | undefined) {
    this._data = data;
    workers[0].postMessage({
      type: "setData",
      data: data,
    });
    workers[1].postMessage({
      type: "setData",
      data: data,
    });
  }

  get data(): any[] | undefined {
    return this._data;
  }

  private sendDimensions = debounce(() => {
    workers[0].postMessage({
      type: "setDimensions",
      width: this.width,
      height: this.height,
    });
    workers[1].postMessage({
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
    workers[this.nextWorker].postMessage({
      type: "setScrollPosition",
      left: this.left,
      top: this.top,
    });
    if (this.nextWorker) {
      this.nextWorker = 0;
    } else {
      this.nextWorker = 1;
    }
  }, 16);

  private sendScrollPositionHorizontal = throttle(() => {
    workers[this.nextWorker].postMessage({
      type: "setScrollPosition",
      left: this.left,
      top: this.top,
    });
    if (this.nextWorker) {
      this.nextWorker = 0;
    } else {
      this.nextWorker = 1;
    }
  }, 16);

  private sendLastScrollPosition = debounce(() => {
    workers[0].postMessage({
      type: "setScrollPosition",
      left: this.left,
      top: this.top,
    });
    workers[1].postMessage({
      type: "setScrollPosition",
      left: this.left,
      top: this.top,
    });
  }, 64);

  public get left(): number {
    return this._left;
  }
  public set left(value: number) {
    this._left = value;
    this.sendScrollPositionHorizontal();
    this.sendLastScrollPosition();
  }
  public get top(): number {
    return this._top;
  }
  public set top(value: number) {
    this._top = value;
    this.sendScrollPosition();
    this.sendLastScrollPosition();
  }

  public onHeightChange: (height: number) => void = () => {};

  fireClickEvent(options: { left: number; top: number; shiftKey?: boolean }) {
    workers[0].postMessage({
      type: "onClick",
      ...options,
    });
    workers[1].postMessage({
      type: "onClick",
      ...options,
    });
  }
}

/* eslint-disable no-restricted-globals */
import { IFormatter } from '../formatter/IFormatter';
import { Grid } from '../Grid';
import { WorkerMessage, WorkerOnEventMessage } from '../types/WorkerMessage';

export function initializeWorker(
  formatters: Record<
    string,
    {
      new (): IFormatter<any>;
    }
  >
) {
  let grid: Grid;
  let widthCache: number, heightCache: number;

  self.onmessage = (evt: MessageEvent<WorkerMessage>) => {
    if (evt.data) {
      if (evt.data.type === 'setScrollPosition') {
        const left = evt.data.left;
        const top = evt.data.top;

        if (grid) {
          grid.blockRedraw = true;
          grid.scrollLeft = left;
          grid.scrollTop = top;
          grid.blockRedraw = false;
        }
        return;
      }
      if (evt.data.type === 'init') {
        const canvas = evt.data.canvas;
        const ctx = canvas.getContext('2d', { alpha: true })!;
        grid = new Grid(ctx, canvas, formatters, evt.data.gridOptions);
        grid.onHeightChange = (height: number) => {
          self.postMessage({ type: 'heightChange', height: height });
        };
        grid.blockRedraw = true;
        grid.data = evt.data.data;
        grid.columnConfig = evt.data.columns;
        grid.width = widthCache;
        grid.height = heightCache;

        grid.blockRedraw = false;

        ['rowContextMenu'].forEach((eventType) => {
          grid.addEventListener(eventType as any, (e) => {
            self.postMessage({
              type: 'onEvent',
              eventType: eventType,
              args: [e],
            } as WorkerOnEventMessage);
          });
        });
        return;
      }
      if (evt.data.type === 'setColumns') {
        const columns = evt.data.columns;
        if (grid) {
          grid.columnConfig = columns;
        }
      }
      if (evt.data.type === 'setOptions') {
        const options = evt.data.options;
        if (grid) {
          grid.options = options;
        }
      }
      if (evt.data.type === 'setData') {
        const data = evt.data.data;
        if (grid) {
          grid.data = data;
        }
      }
      if (evt.data.type === 'setQuery') {
        const query = evt.data.query;
        if (grid) {
          grid.query = query;
        }
      }
      if (evt.data.type === 'onClick') {
        if (grid) {
          grid.fireClickEvent({
            left: evt.data.left,
            top: evt.data.top,
            shiftKey: evt.data.shiftKey,
          });
        }
      }
      if (evt.data.type === 'onRowContextMenu') {
        if (grid) {
          grid.fireContextMenuEvent({
            left: evt.data.left,
            top: evt.data.top,
          });
        }
      }
      if (evt.data.type === 'redraw') {
        if (grid) {
          grid.redraw();
        }
      }
      if (evt.data.type === 'setDimensions') {
        const width = evt.data.width;
        const height = evt.data.height;

        if (grid) {
          grid.blockRedraw = true;
          grid.width = width;
          grid.height = height;
          grid.blockRedraw = false;
        } else {
          widthCache = width;
          heightCache = height;
        }
      }
    }
  };

  self.postMessage('ready');
}

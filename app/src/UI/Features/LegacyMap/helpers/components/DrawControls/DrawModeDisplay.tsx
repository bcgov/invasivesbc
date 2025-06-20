import maplibregl, { IControl } from 'maplibre-gl';
import { createRoot, Root } from 'react-dom/client';
import { TargetMode } from 'UI/Features/LegacyMap/helpers/components/DrawControls/constants';

export default class DrawModeDisplay implements IControl {
  private _mode: TargetMode;
  private _map: maplibregl.Map | undefined;
  private _container: HTMLDivElement | undefined;

  private _root: Root | undefined = undefined;

  constructor(initialMode: TargetMode) {
    this._mode = initialMode;
  }

  setMode(mode: TargetMode) {
    this._mode = mode;
    this._rerender();
  }

  private _rerender() {
    if (this._root) {
      this._root.render(<>Drawing mode: {TargetMode[this._mode]}</>);
    }
  }

  onAdd(map: maplibregl.Map): HTMLElement {
    this._map = map;
    const control = document.createElement('div');
    control.style.background = 'rgba(255, 255, 255, 0.8)';
    control.style.padding = '0 5px';
    control.className = 'maplibregl-ctrl maplibregl-ctrl-group';
    control.id = 'draw-mode-display';

    this._root = createRoot(control);

    this._rerender();

    this._container = control;

    return this._container;
  }

  onRemove() {
    if (this._root) {
      this._root.unmount();
      this._root = undefined;
    }
    if (this._container?.parentNode) {
      this._container.parentNode.removeChild(this._container);
      this._container = undefined;
    }
  }
}

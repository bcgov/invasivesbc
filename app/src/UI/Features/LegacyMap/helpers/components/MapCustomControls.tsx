import { useState } from 'react';
import maplibregl, { IControl } from 'maplibre-gl';
import { createRoot, Root } from 'react-dom/client';
import editButton from '/assets/icon/edit.png';
import saveButton from '/assets/icon/save.png';
import TargetMode from 'constants/targetModes';

export class DrawModeDisplay implements IControl {
  _text: string;
  _map: maplibregl.Map | undefined;
  _container: HTMLDivElement | undefined;

  _root: Root | undefined = undefined;

  constructor(mode: TargetMode) {
    this._text = mode;
  }

  setMode(mode: TargetMode) {
    this._text = mode;
    this._rerender();
  }

  _rerender() {
    if (this._root) {
      this._root.render(<>Drawing mode: {this._text}</>);
    }
  }

  onAdd(map: maplibregl.Map): HTMLElement {
    this._map = map;
    const control = document.createElement('div');
    control.style.background = 'rgba(255, 255, 255, 0.8)';
    control.style.padding = '0 5px';
    control.className = 'maplibregl-ctrl maplibregl-ctrl-group';
    control.style.borderRadius = '4px';
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

type EditControlUIProps = {
  onEdit?: () => void;
  onSave?: () => void;
  isDisabled: boolean;
};

const EditControlUI: React.FC<EditControlUIProps> = ({ onEdit, onSave, isDisabled }) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleEditClick = () => {
    setIsEditing(true);
    onEdit?.();
  };

  const handleSaveClick = () => {
    setIsEditing(false);
    onSave?.();
  };

  return (
    <>
      {!isEditing ? (
        <button
          onClick={handleEditClick}
          disabled={isDisabled}
          className={`${isDisabled ? 'custom-edit-button disabled' : ''}`}
        >
          <img src={editButton} alt="✏️" style={{ width: 15, height: 15, marginTop: 3 }} />
        </button>
      ) : (
        <button title="Save" onClick={handleSaveClick}>
          <img src={saveButton} alt="💾" style={{ width: 15, height: 15, marginTop: 3 }} />
        </button>
      )}
    </>
  );
};

export class EditControls implements IControl {
  _container?: HTMLDivElement;
  _map?: maplibregl.Map;
  _root?: Root;
  _onEdit?: () => void;
  _onSave?: () => void;
  _isDisabled?: boolean;

  constructor(onEdit?: () => void, onSave?: () => void, isDisabled: boolean = false) {
    this._onEdit = onEdit;
    this._onSave = onSave;
    this._isDisabled = isDisabled;
  }

  setDisabled(isDisabled: boolean) {
    this._isDisabled = isDisabled;
    if (this._root && this._container) {
      this._root.render(<EditControlUI onEdit={this._onEdit} onSave={this._onSave} isDisabled={this._isDisabled} />);
    }
  }

  onAdd(map: maplibregl.Map): HTMLElement {
    this._map = map;
    const container = document.createElement('div');
    container.className = 'maplibregl-ctrl maplibregl-ctrl-group';
    container.style.background = 'rgba(255, 255, 255, 1.0)';
    container.style.marginTop = '0px';
    container.style.borderRadius = '0px 0px 4px 4px';
    container.id = 'custom-edit-tool';

    this._root = createRoot(container);
    this._root.render(
      <EditControlUI onEdit={this._onEdit} onSave={this._onSave} isDisabled={this._isDisabled ?? false} />
    );

    this._container = container;
    return container;
  }

  onRemove() {
    if (this._root) {
      this._root.unmount();
      this._root = undefined;
    }
    if (this._container?.parentNode) {
      this._container.parentNode.removeChild(this._container);
      this._container?.remove();
      this._container = undefined;
    }
  }
}

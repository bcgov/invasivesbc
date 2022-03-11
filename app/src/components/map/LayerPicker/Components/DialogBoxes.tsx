import React from 'react';
import { Button, Dialog, DialogContent, DialogTitle, Grid, IconButton, Slider, Typography } from '@mui/material';
import { MapRequestContext } from 'contexts/MapRequestsContext';
import ColorLens from '@mui/icons-material/ColorLens';
import SettingsIcon from '@mui/icons-material/Settings';
import { toolStyles } from 'components/map/Tools/Helpers/ToolStyles';
import { ColorPicker } from 'mui-color';
import { updateChild } from '../Sorting/SortLayerOrder';
import { LayersSelector } from '../LayerModeSelector';

export const ColourDialog = (props) => {
  const { child, parent } = props;
  const { layers, setLayers } = React.useContext(MapRequestContext);
  const [open, setOpen] = React.useState(false);
  const [newOpacity, setNewOpacity] = React.useState(null);
  const [newColour, setNewColour] = React.useState(null);

  /**
   * Function used to print opacity as text
   * @param value float to indicate an opacity between 0 and 1
   * @returns string value
   */
  const opacityText = (value: number) => {
    return `${value.toFixed(1)}`;
  };

  return (
    <Grid item xs={1}>
      <IconButton id="colorpicker-btn" className={toolStyles().toolBtn} onClick={() => setOpen(true)}>
        <ColorLens id="color-lens" style={{ color: child.color_code }} />
      </IconButton>
      <Dialog id="layer-settings-dialog" open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{child.name}</DialogTitle>
        {/* Opacity */}
        <DialogContent id="layer-opacity" style={{ width: 300 }}>
          <Typography id="slider-title" style={{ marginRight: 10 }}>
            Opacity
          </Typography>
          <Slider
            id="slider-control"
            defaultValue={child.opacity}
            onChangeCommitted={(event: any, opacity: number | number[]) => {
              setNewOpacity(opacity);
            }}
            getAriaValueText={opacityText}
            step={0.0001}
            min={0.0}
            max={1.0}
          />
        </DialogContent>
        {/* Color Picker */}
        {child.layer_mode !== 'wms_online' && (
          <DialogContent id="layer-colorpicker" style={{ height: 300 }}>
            <ColorPicker
              value={newColour !== null ? newColour : child.color_code}
              onChange={(e: any) => {
                setNewColour('#' + e.hex);
              }}
            />
          </DialogContent>
        )}
        <Button
          onClick={() => {
            setOpen(false);
            if (newOpacity !== null) {
              updateChild(layers, setLayers, parent.id, child.id, {
                opacity: newOpacity
              });
            }
            if (newColour !== null) {
              updateChild(layers, setLayers, parent.id, child.id, { color_code: newColour });
            }
          }}>
          Close
        </Button>
      </Dialog>
    </Grid>
  );
};

export const LayerModeDialog = (props) => {
  const { child, parent } = props;
  const [open, setOpen] = React.useState(false);

  return (
    <Grid item xs={2}>
      <IconButton id="settings-btn" onClick={() => setOpen(true)}>
        <SettingsIcon />
      </IconButton>
      <Dialog id="layermode-settings-dialog" open={open} onClose={() => setOpen(false)}>
        <DialogTitle>{child.name}</DialogTitle>
        <LayersSelector parent={parent} child={child} />
        <Button
          onClick={() => {
            setOpen(false);
          }}>
          Close
        </Button>
      </Dialog>
    </Grid>
  );
};

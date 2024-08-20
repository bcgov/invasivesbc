import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  Divider,
  FormControl,
  MenuItem,
  TextField,
  Typography
} from '@mui/material';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  DRAW_CUSTOM_LAYER,
  NEW_ALERT,
  REMOVE_CLIENT_BOUNDARY,
  REMOVE_SERVER_BOUNDARY,
  TOGGLE_CUSTOMIZE_LAYERS,
  TOGGLE_LAYER_PICKER_OPEN
} from 'state/actions';
import './CustomizeLayerDialog.css';

import KMLShapesUpload from './KMLShapesUpload';
import { useSelector } from 'utils/use_selector';
import { AlertSeverity, AlertSubjects } from 'constants/alertEnums';

const CustomizeLayerMenu = (props) => {
  enum MenuState {
    Init,
    New,
    Remove,
    Upload
  }
  enum LayerOptions {
    Draw = 'Draw',
    UploadKml = 'Upload KML/KMZ',
    WMS = 'WMS Link',
    WFS = 'WFS Link'
  }

  const dispatch = useDispatch();
  const dialogueOpen = useSelector((state) => state.Map.customizeLayersToggle);

  //menu options
  const [layerToDelete, setLayerToDelete] = useState<string>();
  const [newLayerName, setNewLayerName] = useState<string>();
  const [optionVal, setOptionVal] = useState<LayerOptions>();
  const [subMenuType, setSubMenuType] = useState<MenuState>(MenuState.Init);

  const clientBoundaries = useSelector((state) => state.Map.clientBoundaries).map((boundary) => {
    return { ...boundary, type: 'Client' };
  });

  const serverBoundaries = useSelector((state) => state.Map.serverBoundaries).map((boundary) => {
    return { ...boundary, type: 'Server' };
  });

  const customLayers = [...clientBoundaries, ...serverBoundaries];

  const handleCreateLayer = () => {
    switch (optionVal) {
      case LayerOptions.UploadKml:
        setSubMenuType(MenuState.Upload);
        break;
      case LayerOptions.Draw:
        dispatch({ type: TOGGLE_LAYER_PICKER_OPEN });
        dispatch({ type: DRAW_CUSTOM_LAYER, payload: { name: newLayerName } });
        dispatch({
          type: NEW_ALERT,
          payload: {
            content: 'Complete your layer by drawing a shape with the map tools.',
            subject: AlertSubjects.Map,
            severity: AlertSeverity.Info
          }
        });
        dispatch({ type: TOGGLE_CUSTOMIZE_LAYERS });
        cleanup();
        break;
      default:
        cleanup();
    }
  };

  const handleRemoveLayer = () => {
    const type = customLayers.filter((layer) => layer.id === layerToDelete)?.[0]?.type;
    switch (type) {
      case 'Client':
        dispatch({ type: REMOVE_CLIENT_BOUNDARY, payload: { id: layerToDelete } });
        dispatch({ type: TOGGLE_CUSTOMIZE_LAYERS });
        cleanup();
        break;
      case 'Server':
        dispatch({ type: REMOVE_SERVER_BOUNDARY, payload: { id: layerToDelete } });
        dispatch({ type: TOGGLE_CUSTOMIZE_LAYERS });
        cleanup();
        break;
    }
    cleanup();
  };

  const handleExit = () => {
    dispatch({ type: TOGGLE_CUSTOMIZE_LAYERS });
    cleanup();
  };
  // Reset states to default
  const cleanup = () => {
    setSubMenuType(MenuState.Init);
    setOptionVal(undefined);
    setLayerToDelete(undefined);
    setNewLayerName(undefined);
  };

  const onKMLDone = () => {
    dispatch({ type: TOGGLE_CUSTOMIZE_LAYERS });
    cleanup();
  };

  return (
    <Dialog open={dialogueOpen} id="customMapLayerDialog">
      <DialogTitle className="dialogTitle">Custom Map Layer Controls</DialogTitle>
      <Box className="dialogBody">
        {
          {
            [MenuState.Init]: <Typography>Customize your map by adding or removing custom layers</Typography>,
            [MenuState.New]: (
              <FormControl className="formCont">
                <TextField
                  label="Choose new layer type"
                  onChange={(e) => setOptionVal(e.target.value as LayerOptions)}
                  select
                  value={optionVal ?? ''}
                >
                  {Object.values(LayerOptions).map((option) => (
                    <MenuItem
                      disabled={[LayerOptions.WMS, LayerOptions.WFS].includes(option as LayerOptions)}
                      key={option}
                      value={option}
                    >
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Name your new layer"
                  onChange={(e) => setNewLayerName(e.target.value)}
                  value={newLayerName ?? ''}
                />
              </FormControl>
            ),
            [MenuState.Remove]: (
              <FormControl className="formCont">
                <TextField
                  label="Choose layer to remove"
                  onChange={(e) => setLayerToDelete(e.target.value)}
                  select
                  value={layerToDelete ?? ''}
                >
                  {customLayers.map((option) => (
                    <MenuItem key={'customlayermenuitem' + option.id} value={option.id}>
                      {option.title + ' - ' + option.type}
                    </MenuItem>
                  ))}
                </TextField>
              </FormControl>
            ),
            [MenuState.Upload]: (
              <KMLShapesUpload title={newLayerName} open={subMenuType === MenuState.Upload} whenDone={onKMLDone} />
            )
          }[subMenuType]
        }
      </Box>
      <Divider />
      <DialogActions>
        {
          {
            [MenuState.Init]: (
              <>
                <Button onClick={setSubMenuType.bind(this, MenuState.New)}>Add New Layer</Button>
                <Button onClick={setSubMenuType.bind(this, MenuState.Remove)}>Remove existing</Button>
              </>
            ),
            [MenuState.New]: (
              <>
                <Button onClick={handleCreateLayer} disabled={!newLayerName || !optionVal}>
                  Create
                </Button>
                <Button onClick={cleanup}>Back</Button>
              </>
            ),
            [MenuState.Remove]: (
              <>
                <Button disabled={!layerToDelete} onClick={handleRemoveLayer}>
                  Remove
                </Button>
                <Button onClick={cleanup}>Back</Button>
              </>
            )
          }[subMenuType]
        }
        <Button onClick={handleExit}>Exit</Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomizeLayerMenu;

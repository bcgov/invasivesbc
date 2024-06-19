import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField
} from '@mui/material';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  DRAW_CUSTOM_LAYER,
  REMOVE_CLIENT_BOUNDARY,
  REMOVE_SERVER_BOUNDARY,
  TOGGLE_CUSTOMIZE_LAYERS
} from 'state/actions';

import KMLShapesUpload from './KMLShapesUpload';
import { useSelector } from 'utils/use_selector';

const CustomizeLayerMenu = () => {
  const dispatch = useDispatch();

  const dialogueOpen = useSelector((state) => state.Map.customizeLayersToggle);

  //menu options
  const newLayerTypeOptions = ['Draw', 'Upload KML/KMZ', 'WMS Link', 'WFS Link'];
  const [optionVal, setOptionVal] = useState('Draw');
  const [subMenuType, setSubMenuType] = useState('Init');
  const [newLayerName, setNewLayerName] = useState('');
  const [layerToDelete, setLayerToDelete] = useState<string | null>(null);

  const clientBoundaries = useSelector((state) => state.Map.clientBoundaries).map((boundary) => {
    return { ...boundary, type: 'Client' };
  });
  const serverBoundaries = useSelector((state) => state.Map.serverBoundaries).map((boundary) => {
    return { ...boundary, type: 'Server' };
  });

  const customLayers = [...clientBoundaries, ...serverBoundaries];

  const cleanup = () => {
    setSubMenuType('Init');
    setOptionVal('Draw');
    setLayerToDelete(null);
    setNewLayerName('');
  };

  const onKMLDone = () => {
    cleanup();
    dispatch(TOGGLE_CUSTOMIZE_LAYERS());
  };

  return (
    <Dialog open={dialogueOpen}>
      <DialogTitle>Add or remove a custom layer</DialogTitle>

      <Box>
        {
          {
            New: (
              <FormControl>
                <InputLabel>New Layer type</InputLabel>
                <Select value={optionVal} onChange={(e) => setOptionVal(e.target.value)} label="Choose new Layer type">
                  {newLayerTypeOptions.map((option) => (
                    <MenuItem disabled={['WMS Link', 'WFS Link'].includes(option)} key={Math.random()} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
                <TextField
                  value={newLayerName}
                  onChange={(e) => setNewLayerName(e.target.value)}
                  label="Name your new layer"
                ></TextField>
              </FormControl>
            ),
            Remove: (
              <FormControl>
                <InputLabel>Remove Layer</InputLabel>
                <Select
                  value={layerToDelete}
                  onChange={(e) => setLayerToDelete(e.target.value)}
                  label="Choose Layer to remove"
                >
                  {customLayers.map((option) => (
                    <MenuItem key={'customlayermenuitem' + option.id} value={option.id}>
                      {option.title + ' - ' + option.type}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            ),
            Upload: <KMLShapesUpload title={newLayerName} open={subMenuType === 'Upload'} whenDone={onKMLDone} />,
            Init: <></>
          }[subMenuType]
        }
      </Box>

      <DialogActions>
        {
          {
            Init: (
              <>
                <Button
                  onClick={() => {
                    setSubMenuType('New');
                  }}
                >
                  Add new
                </Button>
                <Button
                  onClick={() => {
                    setSubMenuType('Remove');
                  }}
                >
                  Remove existing
                </Button>
              </>
            ),
            New: (
              <>
                <Button
                  onClick={() => {
                    switch (optionVal) {
                      case 'Upload KML/KMZ':
                        setSubMenuType('Upload');
                        break;
                      case 'Draw':
                        dispatch(DRAW_CUSTOM_LAYER({ name: newLayerName }));
                        dispatch(TOGGLE_CUSTOMIZE_LAYERS());
                        cleanup();
                        break;
                      default:
                        cleanup();
                    }
                  }}
                >
                  Create
                </Button>
                <Button
                  onClick={() => {
                    cleanup();
                  }}
                >
                  Back
                </Button>
              </>
            ),
            Remove: (
              <>
                <Button
                  disabled={layerToDelete === null}
                  onClick={() => {
                    if (layerToDelete == null) {
                      return;
                    }
                    const type = customLayers.filter((layer) => layer.id === layerToDelete)?.[0]?.type;

                    switch (type) {
                      case 'Client':
                        dispatch(REMOVE_CLIENT_BOUNDARY(layerToDelete));
                        dispatch(TOGGLE_CUSTOMIZE_LAYERS());
                        cleanup();
                        break;
                      case 'Server':
                        dispatch(REMOVE_SERVER_BOUNDARY(layerToDelete));
                        dispatch(TOGGLE_CUSTOMIZE_LAYERS());
                        cleanup();
                        break;
                    }
                    cleanup();
                  }}
                >
                  Remove
                </Button>
                <Button
                  onClick={() => {
                    cleanup();
                  }}
                >
                  Back
                </Button>
              </>
            )
          }[subMenuType]
        }
        <Button
          onClick={() => {
            dispatch(TOGGLE_CUSTOMIZE_LAYERS());
            cleanup();
          }}
        >
          Exit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomizeLayerMenu;

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
  TextField,
  Theme
} from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';
import { set } from 'lodash';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router-dom';
import {
  DRAW_CUSTOM_LAYER,
  REMOVE_CLIENT_BOUNDARY,
  REMOVE_SERVER_BOUNDARY,
  TOGGLE_CUSTOMIZE_LAYERS
} from 'state/actions';
import KMLShapesUpload from './KMLShapesUpload';

const useStyles = makeStyles((theme: Theme) => ({
  formContainer: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'start',
    alignItems: 'center',
    gap: 10,
    paddingBlock: 10,
    paddingInline: 8
  },
  select: {
    minWidth: 200,
    maxWidth: 400,
    width: 'auto'
  },
  syncSuccessful: {
    color: 'green'
  },
  dialogActionsBox: {
    display: 'flex',
    justifyContent: 'space-between'
  }
}));

const CustomizeLayerMenu = (props) => {
  const dispatch = useDispatch();

  const classes = useStyles();
  const history = useHistory();

  const accessRoles = useSelector((state: any) => state.Auth.accessRoles);
  const dialogueOpen = useSelector((state: any) => state.Map.customizeLayersToggle);

  //menu options
  const newLayerTypeOptions = ['Draw', 'Upload KML/KMZ', 'WMS Link', 'WFS Link'];
  const [optionVal, setOptionVal] = useState('Draw');
  const [subMenuType, setSubMenuType] = useState('Init');
  const [newLayerName, setNewLayerName] = useState('');
  const [layerToDelete, setLayerToDelete] = useState(null);

  const clientBoundaries = useSelector((state: any) => state.Map.clientBoundaries).map((boundary) => {
    return { ...boundary, type: 'Client' };
  });
  const serverBoundaries = useSelector((state: any) => state.Map.serverBoundaries).map((boundary) => {
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
    dispatch({ type: TOGGLE_CUSTOMIZE_LAYERS });
  };

  return (
    <Dialog open={dialogueOpen}>
      <DialogTitle>Add or remove a custom layer</DialogTitle>

      <Box className={classes.formContainer}>
        {
          {
            New: (
              <FormControl>
                <InputLabel>New Layer type</InputLabel>
                <Select
                  className={classes.select}
                  value={optionVal}
                  onChange={(e) => setOptionVal(e.target.value)}
                  label="Choose new Layer type">
                  {newLayerTypeOptions.map((option) => (
                    <MenuItem disabled={['WMS Link', 'WFS Link'].includes(option)} key={Math.random()} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
                <TextField
                  className={classes.select}
                  value={newLayerName}
                  onChange={(e) => setNewLayerName(e.target.value)}
                  label="Name your new layer"></TextField>
              </FormControl>
            ),
            Remove: (
              <FormControl>
                <InputLabel>Remove Layer</InputLabel>
                <Select
                  className={classes.select}
                  value={layerToDelete}
                  onChange={(e) => setLayerToDelete(e.target.value)}
                  label="Choose Layer to remove">
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

      <DialogActions className={classes.dialogActionsBox}>
        {
          {
            Init: (
              <>
                <Button
                  onClick={() => {
                    setSubMenuType('New');
                  }}>
                  Add new
                </Button>
                <Button
                  onClick={() => {
                    setSubMenuType('Remove');
                  }}>
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
                        dispatch({ type: DRAW_CUSTOM_LAYER, payload: { name: newLayerName } });
                        dispatch({ type: TOGGLE_CUSTOMIZE_LAYERS });
                        cleanup();
                        break;
                      default:
                        cleanup();
                    }
                  }}>
                  Create
                </Button>
                <Button
                  onClick={() => {
                    cleanup();
                  }}>
                  Back
                </Button>
              </>
            ),
            Remove: (
              <>
                <Button
                  disabled={layerToDelete === null}
                  onClick={() => {
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
                  }}>
                  Remove
                </Button>
                <Button
                  onClick={() => {
                    cleanup();
                  }}>
                  Back
                </Button>
              </>
            )
          }[subMenuType]
        }
        <Button
          onClick={() => {
            dispatch({ type: TOGGLE_CUSTOMIZE_LAYERS });
            cleanup();
          }}>
          Exit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CustomizeLayerMenu;

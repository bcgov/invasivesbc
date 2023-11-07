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
import { DRAW_CUSTOM_LAYER, TOGGLE_CUSTOMIZE_LAYERS } from 'state/actions';
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


  // two of each type
  const customLayers = [{ id: 1, type: 'Drawn', label: 'banana',  data: '' }, {id: 2, type: 'Drawn', label: 'apple', data: ''}, {id: 3, type: 'WMS', label: 'orange', data: ''}, {id: 4, type: 'WMS', label: 'grape', data: ''}, {id: 5, type: 'WFS', label: 'pear', data: ''}, {id: 6, type: 'WFS', label: 'peach', data: ''}];

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
                  value={optionVal}
                  onChange={(e) => setLayerToDelete(e.target.value)}
                  label="Choose Layer to remove">
                  {customLayers.map((option) => (
                    <MenuItem key={Math.random()} value={option.id}>
                      {option.label + ' - ' + option.type}
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
                    switch(optionVal) {
                    case 'Upload KML/KMZ': 
                      setSubMenuType('Upload');
                      break;
                    case  'Draw':
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
                <Button disabled={layerToDelete === null} onClick={() => {}}>
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

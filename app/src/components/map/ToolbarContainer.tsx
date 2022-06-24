import { Capacitor } from '@capacitor/core';
import React, { useEffect, useRef, useState } from 'react';
import { LayerPicker } from './LayerPicker/LayerPicker';
import { SetPointOnClick } from './Tools/ToolTypes/Data/InfoAreaDescription';
import MeasureTool from './Tools/ToolTypes/Misc/MeasureTool';
import { ZoomControl } from './Tools/ToolTypes/Misc/ZoomControl';
import JumpToActivity from './Tools/ToolTypes/Nav/JumpToActivity';
import JumpToTrip from './Tools/ToolTypes/Nav/JumpToTrip';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import L from 'leaflet';
import List from '@mui/material/List';
import makeStyles from '@mui/styles/makeStyles';
import { Theme } from '@mui/material';
import MeasureToolContainer from './Tools/ToolTypes/Misc/MeasureToolContainer';

const POSITION_CLASSES = {
  bottomleft: 'leaflet-bottom leaflet-left',
  bottomright: 'leaflet-bottom leaflet-right',
  topleft: 'leaflet-top leaflet-left',
  topright: 'leaflet-top leaflet-right'
};

const useToolbarContainerStyles = makeStyles((theme: Theme) => ({
  innerToolBarContainer: {
    maxWidth: 300,
    minWidth: 150,
    width: '100%',
    borderRadius: 8,
    boxShadow: '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)',
    transition: 'all 200ms ease',
    overflowY: 'scroll',
    maxHeight: '78vh',
    backgroundColor: theme.palette.background.default,
    '&:hover': {
      background: theme.palette.background.default
    }
  },
  toggleMenuBTN: {
    padding: 5,
    marginTop: 10,
    marginRight: 10,
    zIndex: 1500,
    width: 40,
    transition: 'all 200ms ease-in-out',
    height: 40,
    spacing: 'space-around',
    backgroundColor: theme.palette.background.default,
    '&:hover': {
      background: 'skyblue'
    }
  }
}));

export const ToolbarContainer = (props) => {
  const [measureToolContainerOpen, setMeasureToolContainerOpen] = useState(false);

  const positionClass = (props.position && POSITION_CLASSES[props.position]) || POSITION_CLASSES.topright;
  const classes = useToolbarContainerStyles();
  const [expanded, setExpanded] = useState<boolean>(false);
  const divRef = useRef();

  const handleExpand = () => {
    setExpanded((prev) => {
      return !prev;
    });
  };

  useEffect(() => {
    L.DomEvent.disableClickPropagation(divRef?.current);
    L.DomEvent.disableScrollPropagation(divRef?.current);
  });

  return (
    <>
      <div ref={divRef} key={'toolbar1'} className={positionClass + ' leaflet-control'} style={{ display: 'static' }}>
        <IconButton
          id="toolbar-drawer-button"
          onClick={() => {
            handleExpand();
          }}
          className={classes.toggleMenuBTN + ' leaflet-control'}>
          {expanded ? <CloseIcon /> : <MenuIcon />}
        </IconButton>
        <List
          ref={divRef}
          key={'toolbar2'}
          className={classes.innerToolBarContainer + ' leaflet-control'}
          style={{ transform: expanded ? 'translateX(5%)' : 'translateX(110%)' }}>
          <LayerPicker inputGeo={props.inputGeo} />
          <Divider />
          <SetPointOnClick map={props.map} />
          <MeasureTool
            setMeasureToolContainerOpen={setMeasureToolContainerOpen}
            measureToolContainerOpen={measureToolContainerOpen}
          />
          <JumpToTrip />
          {/* <NewRecord />
        <EditRecord />
        <MultiSelectOrEdit />
        <DrawButtonList /> */}

          <JumpToActivity id={props.id} />
          {props.children}
        </List>
      </div>
      <MeasureToolContainer measureToolContainerOpen={measureToolContainerOpen} />
    </>
  );
};

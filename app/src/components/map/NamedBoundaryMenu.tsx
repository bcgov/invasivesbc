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
import ExploreIcon from '@mui/icons-material/Explore';
import L from 'leaflet';
import List from '@mui/material/List';
import makeStyles from '@mui/styles/makeStyles';
import { ListItem, ListItemButton, ListItemIcon, ListItemText, Theme, Typography } from '@mui/material';
import MeasureToolContainer from './Tools/ToolTypes/Misc/MeasureToolContainer';
import TabUnselectedIcon from '@mui/icons-material/TabUnselected';
import { toolStyles } from './Tools/Helpers/ToolStyles';
import { useDataAccess } from 'hooks/useDataAccess';

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
    marginRight: 50,
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

export const NamedBoundaryMenu = (props) => {
  const dataAccess = useDataAccess();
  // style
  const toolClass = toolStyles();
  const [measureToolContainerOpen, setMeasureToolContainerOpen] = useState(false);

  const positionClass = (props.position && POSITION_CLASSES[props.position]) || POSITION_CLASSES.topright;
  const classes = useToolbarContainerStyles();
  const [expanded, setExpanded] = useState<boolean>(false);
  const divRef = useRef();
  const [boundaries, setBoundaries] = useState<Boundary[]>([]);
  const [idCount, setIdCount] = useState(0);

  const handleExpand = () => {
    setExpanded((prev) => {
      return !prev;
    });
  };

  useEffect(() => {
    L.DomEvent.disableClickPropagation(divRef?.current);
    L.DomEvent.disableScrollPropagation(divRef?.current);
    getBoundaries();
  }, []);

  const setBoundaryIdCount = (() => {
    if (boundaries && boundaries.length > 0) {
      //ensures id is not repeated on client side
      const max = Math.max(...boundaries.map(b => b.id));
      setIdCount(max + 1);
    }
  });

  useEffect(() => {
    setBoundaryIdCount();
  }, [boundaries]);

  const getBoundaries = async () => {
    const results = await dataAccess.getBoundaries();
    if (results) {
      setBoundaries(results);
    }
  };

  const createBoundary = (() => {
    const dowe = window.confirm('Create new named boundary?');
    if (dowe) {
      props.setShowDrawControls(true);
    }
  });

  const addBoundary = ((geoArray) => {
    const name = prompt('Name:');

    if (name) {
      const tempBoundary: Boundary = {
        id: idCount,
        name: name,
        geos: geoArray,
        server_id: null
      };
  
      dataAccess.addBoundary(tempBoundary);
      setBoundaries([...boundaries, tempBoundary]);
    }
  });

  useEffect(() => {
    if (props?.geometryState?.geometry?.length > 0) {
      addBoundary(props?.geometryState?.geometry);
    }
  }, [props?.geometryState?.geometry]);

  const deleteBoundary = async (id: number) => {
    await dataAccess.deleteBoundary(id);
    getBoundaries();
  }

  return (
    <>
      <div ref={divRef} key={'toolbar2'} className={positionClass + ' leaflet-control'} style={{ display: 'static' }}>
        <IconButton
          id="toolbar-drawer-button"
          onClick={() => {
            handleExpand();
          }}
          className={classes.toggleMenuBTN + ' leaflet-control'}>
          {expanded ? <CloseIcon /> : <TabUnselectedIcon />}
        </IconButton>
        <List
          ref={divRef}
          key={'toolbar2'}
          className={classes.innerToolBarContainer + ' leaflet-control'}
          style={{ transform: expanded ? 'translateX(5%)' : 'translateX(-110%)' }}>
          <Divider />
          <ListItem disableGutters>
            <ListItemButton
              onClick={createBoundary}
              ref={divRef}
              aria-label="Jump To Location"
              style={{ padding: 10, borderBottomLeftRadius: 5, borderBottomRightRadius: 5 }}>
              <ListItemIcon>
                <ExploreIcon />
              </ListItemIcon>
              <ListItemText>
                <Typography className={toolClass.Font}>New Boundary</Typography>
              </ListItemText>
            </ListItemButton>
          </ListItem>
          {boundaries.map((b, index) => (
            <JumpToTrip boundary={b} id={b.id} name={b.name} geos={b.geos} key={index} deleteBoundary={deleteBoundary}/>
          ))}
        </List>
      </div>
    </>
  );
};

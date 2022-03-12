//import classes from '*.module.css';
import {
  AppBar,
  Button,
  Dialog,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Theme,
  Slide,
  SlideProps,
  Toolbar,
  List,
  ListItem,
  Typography
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import CloseIcon from '@mui/icons-material/Close';
import DirectionsWalkIcon from '@mui/icons-material/DirectionsWalk';
import SearchIcon from '@mui/icons-material/Search';
import { Feature } from 'geojson';
import React from 'react';

const Transition = React.forwardRef<React.FC, SlideProps>((TransitionProps, ref) => {
  return <Slide direction="up" ref={ref} {...TransitionProps} />;
});

export enum contextMenuType {
  default = 'default',
  passThrough = 'passThrough'
}

interface MapContextMenuProps {
  contextMenuState: {
    state: MapContextMenuData;
    setContextMenuState: (contextMenuState: MapContextMenuData) => void;
  };
  handleClose: Function;
}

export interface MapContextMenuData {
  isOpen: boolean;
  lat?: number;
  lng?: number;
}
const useStyles = makeStyles((theme: Theme) => ({
  appBar: {
    position: 'relative'
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1
  },
  contextMenuItem: {
    textAlign: 'center',
    height: 300
  },
  contextMenuIcon: {
    fontSize: 'large',
    height: 100
  }
}));

interface MenuItemProps {
  heading: string;
  description: string;
  //icon: any;
  onSelectFunction?: Function;
}

/*
{
  "type": "Feature",
  "geometry": {
    "type": "Point",
    "coordinates": [125.6, 10.1]
  },
  "properties": {
    "name": "Dinagat Islands"
  }
}
*/

//todo: pass icon
//todo: make list a grid
const MenuItem: React.FC<MenuItemProps> = (props) => {
  const classes = useStyles();
  return (
    <ListItem
      className={classes.contextMenuItem}
      onClick={(e) => {
        props.onSelectFunction();
      }}
      button>
      <ListItemText primary={props.heading} secondary={props.description} />
    </ListItem>
  );
};

export const MapContextMenu: React.FC<MapContextMenuProps> = (props) => {
  const classes = useStyles();

  const coordinatesToGeo: any = (lat: number, lng: number) => {
    return [
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [parseFloat(lat.toFixed(6)), parseFloat(lng.toFixed(6))] //@popkinj is this ok?
        },
        properties: {
          name: 'Sasquatch Siting'
        }
      }
    ] as Feature[];
  };

  return (
    <>
      <Dialog
        fullScreen
        open={props.contextMenuState.state.isOpen}
        onClose={(e) => {
          props.handleClose();
        }}
        TransitionComponent={Transition}>
        <AppBar className={classes.appBar}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={(e) => {
                props.handleClose();
              }}
              aria-label="close">
              <CloseIcon />
            </IconButton>
            <Typography variant="h5" className={classes.title}>
              Choose something to do here: ({props.contextMenuState.state.lat}, {props.contextMenuState.state.lng})
            </Typography>
            <Button
              autoFocus
              color="inherit"
              onClick={(e) => {
                props.handleClose();
              }}>
              select
            </Button>
          </Toolbar>
        </AppBar>
        <List>
          <MenuItem
            heading="Mark a new point of interest here"
            description="Points of interest can be used to capture something that isn't already in a layer
            and isn't representative of a field activity"
            onSelectFunction={() => {
              props.contextMenuState.setContextMenuState({ ...props.contextMenuState.state, isOpen: false });
              coordinatesToGeo(props.contextMenuState.state.lng, props.contextMenuState.state.lat);
            }}
          />
          <Divider />
          <ListItem className={classes.contextMenuItem} button>
            <ListItemIcon className={classes.contextMenuIcon}>
              <SearchIcon />
            </ListItemIcon>
            <ListItemText
              primary="Find things near here."
              secondary="Use this location as a starting point for a search.  You can look for planned or past
            activities, or points of interest."
            />
          </ListItem>
          <Divider />
          <ListItem className={classes.contextMenuItem} button>
            <ListItemIcon className={classes.contextMenuIcon}>
              <DirectionsWalkIcon />
            </ListItemIcon>
            <ListItemText
              primary="Start doing something here."
              secondary="Use this location as a starting point for an activity.  It can be a planned activity,
            a plan for multiple activities, or it can just be one field activity."
            />
          </ListItem>
        </List>
      </Dialog>
    </>
  );
};

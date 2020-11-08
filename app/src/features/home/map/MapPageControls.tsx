//import classes from '*.module.css';
import {
  Dialog,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Button,
  ListItemText,
  Divider,
  Slide,
  SlideProps,
  makeStyles,
  ListItemIcon
} from '@material-ui/core';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import AddLocationIcon from '@material-ui/icons/AddLocation';
import SearchIcon from '@material-ui/icons/Search';
import DirectionsWalkIcon from '@material-ui/icons/DirectionsWalk';
import CloseIcon from '@material-ui/icons/Close';
import React from 'react';

const Transition = React.forwardRef<React.FC, SlideProps>((TransitionProps, ref) => {
  return <Slide direction="up" ref={ref} {...TransitionProps} />;
});

interface MapContextMenuProps {
  contextMenuState: MapContextMenuData;
  handleClose: Function;
}

export interface MapContextMenuData {
  isOpen: boolean;
  lat?: number;
  lng?: number;
}
const useStyles = makeStyles((theme) => ({
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

//todo: pass icon
//todo: make list a grid
const MenuItem: React.FC<MenuItemProps> = (props) => {
  const classes = useStyles();
  return (
    <ListItem className={classes.contextMenuItem} button>
      <ListItemText primary={props.heading} secondary={props.description} />
    </ListItem>
  );
};

export const MapContextMenu: React.FC<MapContextMenuProps> = (props) => {
  const classes = useStyles();
  return (
    <>
      isOpen?
      <Dialog
        fullScreen
        open={props.contextMenuState.isOpen}
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
              Choose something to do here: ({props.contextMenuState.lat}, {props.contextMenuState.lat})
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
      : <></>
    </>
  );
};

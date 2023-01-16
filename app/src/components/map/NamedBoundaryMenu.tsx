import React, {  useEffect, useRef, useState } from 'react';
import JumpToTrip from './Tools/ToolTypes/Nav/JumpToTrip';
import CloseIcon from '@mui/icons-material/Close';
import ExploreIcon from '@mui/icons-material/Explore';
import L from 'leaflet';
import makeStyles from '@mui/styles/makeStyles';
import {
  Box,
  IconButton, Divider, List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  Theme,
  Typography
} from '@mui/material';
import TabUnselectedIcon from '@mui/icons-material/TabUnselected';
import { toolStyles } from './Tools/Helpers/ToolStyles';
import { useDataAccess } from 'hooks/useDataAccess';
import { GeneralDialog, IGeneralDialog } from 'components/dialog/GeneralDialog';
import KMLShapesUpload from 'components/map-buddy-components/KMLShapesUpload';
import { useInvasivesApi } from 'hooks/useInvasivesApi';
import { useDispatch, useSelector } from 'react-redux';
import { selectConfiguration } from 'state/reducers/configuration';
import {
  USER_SETTINGS_DELETE_BOUNDARY_REQUEST,
  USER_SETTINGS_DELETE_KML_REQUEST,
  USER_SETTINGS_SET_BOUNDARIES_REQUEST
} from 'state/actions';
import { selectUserSettings } from 'state/reducers/userSettings';
import { IFlyToAndFadeItem, FlyToAndFadeItemTransitionType, useFlyToAndFadeContext } from './Tools/ToolTypes/Nav/FlyToAndFade';
import { selectMap } from 'state/reducers/map';

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
  const [rendered, setRendered] = useState(false);
  useEffect(() => {
    setRendered(true);
    return () => {
      setRendered(false);
    };
  }, []);
  const dataAccess = useDataAccess();
  const api = useInvasivesApi();
  // style
  const toolClass = toolStyles();
  const flyToContext = useFlyToAndFadeContext();
  const [measureToolContainerOpen, setMeasureToolContainerOpen] = useState(false);

  const positionClass = (props.position && POSITION_CLASSES[props.position]) || POSITION_CLASSES.topright;
  const classes = useToolbarContainerStyles();
  const [expanded, setExpanded] = useState<boolean>(false);
  const divRef = useRef();
  const [idCount, setIdCount] = useState(0);

  const dispatch = useDispatch();
  const { MOBILE } = useSelector(selectConfiguration);
  const userSettings = useSelector(selectUserSettings);
  const mapState = useSelector(selectMap);

  const [newBoundaryDialog, setNewBoundaryDialog] = useState<IGeneralDialog>({
    dialogActions: [],
    dialogOpen: false,
    dialogTitle: '',
    dialogContentText: null
  });

  const handleExpand = () => {
    setExpanded((prev) => {
      return !prev;
    });
  };

  useEffect(() => {
    if (rendered) {
      L.DomEvent.disableClickPropagation(divRef?.current);
      L.DomEvent.disableScrollPropagation(divRef?.current);
      setBoundaries();
      // updateKMLs();
    }
  }, [rendered]);

  const setBoundaryIdCount = () => {
    if (userSettings?.boundaries && userSettings?.boundaries?.length > 0) {
      //ensures id is not repeated on client side
      const max = Math.max(
        ...userSettings.boundaries.map((b) => {
          if (b.id) return b.id;
          if (b.server_id) return b.server_id;
        })
      );
      setIdCount(max + 1);
    } else {
      setIdCount(idCount + 1);
    }
  };

  useEffect(() => {
    setBoundaryIdCount();
  }, [userSettings?.boundaries]);

  const setBoundaries = async () => {
    let boundaries = [];
    const boundaryResults = await dataAccess.getBoundaries();

    if (MOBILE) {
      const boundaries = boundaryResults.map((boundary) => {
        const jsonObject = JSON.parse(boundary.json);
        return {
          id: boundary.id,
          name: jsonObject.name,
          geos: jsonObject.geos,
          server_id: null
        };
      });
    } else {
      boundaries = boundaryResults;

      //add kmls
      const KMLResults = await api.getAdminUploadGeoJSONLayers();

      if (KMLResults && KMLResults.length > 0) {
        const KMLToBoundary = KMLResults.map((kml) => {
          return {
            id: null,
            name: kml?.title,
            geos: kml?.geojson?.features,
            server_id: kml?.id
          };
        });

        boundaries.push(...KMLToBoundary);
      }
    }

    dispatch({ type: USER_SETTINGS_SET_BOUNDARIES_REQUEST, payload: { boundaries: boundaries } });
  };

  const updateKMLs = async () => {
    const KMLResults = await api.getAdminUploadGeoJSONLayers();

    let KMLToBoundary = [];
    if (KMLResults && KMLResults.length > 0) {
      KMLToBoundary = KMLResults.map((kml) => {
        return {
          id: null,
          name: kml?.title,
          geos: kml?.geojson?.features,
          server_id: kml?.id
        };
      });

      // update boundaries
      let boundaries = [];
      if (userSettings?.boundaries) boundaries.push(...userSettings?.boundaries);

      KMLToBoundary.forEach((kml) => {
        if (!boundaries.find((boundary) => boundary.server_id === kml.server_id)) {
          boundaries.push(kml);
        }
      });

      dispatch({
        type: USER_SETTINGS_SET_BOUNDARIES_REQUEST,
        payload: { boundaries: boundaries }
      });
    }
  };

  const createBoundary = () => {
    setNewBoundaryDialog({
      dialogOpen: true,
      dialogTitle: 'Create New User Boundary From KML/KMZ',
      dialogContentText: 'File size may effect speed. Lines and points will be removed.',
      dialogActions: [
        {
          actionName: 'Cancel',
          actionOnClick: async () => {
            setNewBoundaryDialog({ ...newBoundaryDialog, dialogOpen: false });
          },
          autoFocus: true
        }
      ]
    });
  };

  const addBoundary = async (geoArray) => {
    const name = prompt('Please enter a name for the boundary just created:');

    if (name) {
      const tempBoundary: Boundary = {
        id: idCount,
        name: name,
        geos: geoArray,
        server_id: null
      };
      const boundaries = [];
      if (userSettings?.boundaries) boundaries.push(...userSettings?.boundaries);
      boundaries.push(tempBoundary);

      dispatch({
        type: USER_SETTINGS_SET_BOUNDARIES_REQUEST,
        payload: { boundaries: boundaries }
      });

      // saves in local store
      await dataAccess.addBoundary(tempBoundary);
    }
  };

  useEffect(() => {
    if (props?.geometryState?.geometry?.length > 0 && !mapState?.whatsHere?.toggle) {
      addBoundary(props?.geometryState?.geometry);
    }
  }, [props?.geometryState?.geometry]);

  const deleteBoundary = async (id?: number, server_id?: number) => {
    if (id !== null) {
      dispatch({ type: USER_SETTINGS_DELETE_BOUNDARY_REQUEST, payload: { id: id } });
    }
    if (server_id !== null) {
      dispatch({ type: USER_SETTINGS_DELETE_KML_REQUEST, payload: { server_id: server_id } });
    }
  };

  const jump = (boundary) => {
    if (!boundary) {
      return;
    }

    const flyToAndFadeItem : IFlyToAndFadeItem = {
      name: 'TRIP: ' + boundary.name,
      geometries: boundary.geos,
      colour: 'red',
      transitionType: FlyToAndFadeItemTransitionType.zoomToGeometries
    }

    if (flyToAndFadeItem.geometries) {
      flyToContext.go([flyToAndFadeItem]);
    }
  }
  
  if (!rendered) return <></>;
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
          style={{ transform: expanded ? 'translateX(20%)' : 'translateX(-110%)' }}>
          <Divider />
          <ListItem key="boundaryListCreate" disableGutters>
            <ListItemButton
              onClick={createBoundary}
              ref={divRef}
              aria-label="Jump To Location"
              style={{ padding: 10, borderBottomLeftRadius: 5, borderBottomRightRadius: 5 }}>
              <ListItemIcon>
                <ExploreIcon />
              </ListItemIcon>
              <ListItemText>
                <Typography className={toolClass.Font}>Upload KML</Typography>
              </ListItemText>
            </ListItemButton>
          </ListItem>
          {userSettings?.boundaries?.map((b, index) => (
            <ListItem
            key={`boundaryListJump${index}`}
              onClick={() => {
                jump(b)}
              }>
              <JumpToTrip
                boundary={b}
                id={b.id}
                name={b.name}
                geos={b.geos}
                server_id={b.server_id}
                key={index}
                deleteBoundary={deleteBoundary}
              />
            </ListItem>
          ))}
        </List>
      </div>

      <GeneralDialog
        dialogOpen={newBoundaryDialog.dialogOpen}
        dialogTitle={newBoundaryDialog.dialogTitle}
        dialogActions={newBoundaryDialog.dialogActions}
        dialogContentText={newBoundaryDialog.dialogContentText}>
        {<KMLShapesUpload callback={updateKMLs} />}
      </GeneralDialog>
    </>
  );
};

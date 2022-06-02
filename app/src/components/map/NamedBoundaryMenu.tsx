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
import { Accordion, AccordionSummary, Box, ListItem, ListItemButton, ListItemIcon, ListItemText, MenuItem, Select, Theme, Typography } from '@mui/material';
import MeasureToolContainer from './Tools/ToolTypes/Misc/MeasureToolContainer';
import TabUnselectedIcon from '@mui/icons-material/TabUnselected';
import { toolStyles } from './Tools/Helpers/ToolStyles';
import { useDataAccess } from 'hooks/useDataAccess';
import { GeneralDialog, IGeneralDialog } from 'components/dialog/GeneralDialog';
import KMLShapesUpload from 'components/map-buddy-components/KMLShapesUpload';
import { useInvasivesApi } from 'hooks/useInvasivesApi';


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
  const api = useInvasivesApi();
  // style
  const toolClass = toolStyles();
  const [measureToolContainerOpen, setMeasureToolContainerOpen] = useState(false);

  const positionClass = (props.position && POSITION_CLASSES[props.position]) || POSITION_CLASSES.topright;
  const classes = useToolbarContainerStyles();
  const [expanded, setExpanded] = useState<boolean>(false);
  const divRef = useRef();
  const [boundaries, setBoundaries] = useState<Boundary[]>([]);
  const [KMLs, setKMLs] = useState<Boundary[]>([]);
  const [idCount, setIdCount] = useState(0);
  const [showKMLUpload, setShowKMLUpload] = useState<boolean>(false);

  const [newBoundaryDialog, setNewBoundaryDialog] = useState<IGeneralDialog>({
    dialogActions: [],
    dialogOpen: false,
    dialogTitle: '',
    dialogContentText: null
  });
  const [selectKMLDialog, setSelectKMLDialog] = useState<IGeneralDialog>({
    dialogActions: [],
    dialogOpen: false,
    dialogTitle: 'Select which KML to add: ',
    dialogContentText: null
  });

  const handleExpand = () => {
    setExpanded((prev) => {
      return !prev;
    });
  };

  useEffect(() => {
    L.DomEvent.disableClickPropagation(divRef?.current);
    L.DomEvent.disableScrollPropagation(divRef?.current);
    getBoundaries();
    getKMLs();
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
    const boundaryResults = await dataAccess.getBoundaries();
    setBoundaries(boundaryResults);
  };

  const getKMLs = async () => {
    const KMLResults = await api.getAdminUploadGeoJSONLayers();

    // map to match boundaries
    let KMLToBoundary = [];
    if (KMLResults) {
      KMLToBoundary = KMLResults.map((kml) => {
        const geos = kml.geojson.features.map((feature) => {
          return {
            "type": "Feature",
            "geometry": {
              "coordinates": feature.coordinates,
              "type": feature.type
            },
            "properties": {}
          }
        });

        return {
          id: null, //doesn't need atm (how would this interact with )
          name: kml.title,
          geos: geos,
          server_id: kml.id
        };
      });
    }

    setKMLs(KMLToBoundary);
  }

  const createBoundary = (() => {
    setShowKMLUpload(false);
    setNewBoundaryDialog({
      dialogOpen: true,
      dialogTitle: 'Create New User Boundary',
      dialogContentText: 'How would you like to create a new user boundary?',
      dialogActions: [
        {
          actionName: 'Draw Shape',
          actionOnClick: async () => {
            props.setShowDrawControls(true);

            setNewBoundaryDialog({ ...newBoundaryDialog, dialogOpen: false });
          }
        },
        {
          actionName: 'Upload KML',
          actionOnClick: async () => {
            setShowKMLUpload(true);
          }
        },
        {
          actionName: 'Select KML',
          actionOnClick: async () => {
            setSelectKMLDialog({...selectKMLDialog, dialogOpen: true, dialogActions: [
              {
                actionName: 'Cancel',
                actionOnClick: async () => {
                  setSelectKMLDialog({ ...selectKMLDialog, dialogOpen: false });
                }
              }
            ]})
          }
        },
        {
          actionName: 'Cancel',
          actionOnClick: async () => {
            setShowKMLUpload(false);
            setNewBoundaryDialog({ ...newBoundaryDialog, dialogOpen: false });
          },
          autoFocus: true
        }
      ]
    });
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
            <JumpToTrip boundary={b} id={b.id} name={b.name} geos={b.geos} server_id={b.server_id} key={index} deleteBoundary={deleteBoundary}/>
          ))}
        </List>
      </div>

      <GeneralDialog
        dialogOpen={newBoundaryDialog.dialogOpen}
        dialogTitle={newBoundaryDialog.dialogTitle}
        dialogActions={newBoundaryDialog.dialogActions}
        dialogContentText={newBoundaryDialog.dialogContentText}
      >
        {showKMLUpload &&
          <Box>
            <Typography>Shape Upload (KML/KMZ)</Typography>
            <KMLShapesUpload callback={getKMLs}/>
          </Box>
        }
      </GeneralDialog>
      <GeneralDialog
        dialogOpen={selectKMLDialog.dialogOpen}
        dialogTitle={selectKMLDialog.dialogTitle}
        dialogActions={selectKMLDialog.dialogActions}
        dialogContentText={selectKMLDialog.dialogContentText}
      >
        <Select
          // sx={{ minWidth: 150, mt: 3, mb: 3 }}
          onChange={(e) => {
            const kmlToUpload = KMLs.find((kml) => {
              return (kml.server_id === e.target.value);
            });

            const boundaryFromKML: Boundary = {
              // id: kmlToUpload.id ? kmlToUpload.id : idCount,     ***Maybe id needs a bit of rethinking when dealing with the caching
              id: idCount,
              name: kmlToUpload.name,
              geos: kmlToUpload.geos,
              server_id: kmlToUpload.server_id
            }

            dataAccess.addBoundary(boundaryFromKML);
            setBoundaries([...boundaries, boundaryFromKML]);
            setSelectKMLDialog({ ...selectKMLDialog, dialogOpen: false });
            setNewBoundaryDialog({...newBoundaryDialog, dialogOpen: false });
          }}
        >
          {KMLs.map((kml) => {
            return <MenuItem key={kml.server_id} value={kml.server_id}>{kml.name}</MenuItem>
          })}
        </Select>
      </GeneralDialog>
    </>
  );
};

import { Capacitor } from '@capacitor/core';
import { Box, Button, ListItem, ListItemIcon, ListItemText, Typography } from '@mui/material';
import ExploreIcon from '@mui/icons-material/Explore';
import { ListItemButton } from '@mui/material';
import { DatabaseContext } from 'contexts/DatabaseContext';
import { useDataAccess } from 'hooks/useDataAccess';
import L from 'leaflet';
import { FeatureGroup } from 'react-leaflet';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useMapEvent } from 'react-leaflet';
import { toolStyles } from '../../Helpers/ToolStyles';
import { FlyToAndFadeItemTransitionType, IFlyToAndFadeItem, useFlyToAndFadeContext } from './FlyToAndFade';

import CheckIcon from '@mui/icons-material/Check';
import DeleteIcon from '@mui/icons-material/Delete';
import EditTools from '../Data/EditTools';
/*

- [ ] add ui button to let user add shapes
- [ ]  shapes persist - where?
- [ ] or view existing in list
- [ ] 
*/

interface Boundary {
  id: number,
  name: string,
  geos: [],
  server_id: number
}

export const JumpToTrip = (props) => {
  // style
  const toolClass = toolStyles();

  // Is this needed? Copied from DisplayPosition
  const divRef = useRef(null);

  // DB: MOBILE ONLY!
  const databaseContext = useContext(DatabaseContext);
  const dataAccess = useDataAccess();

  const flyToContext = useFlyToAndFadeContext();

  // initial setup & events to block:
  useEffect(() => {
    L.DomEvent.disableClickPropagation(divRef?.current);
    L.DomEvent.disableScrollPropagation(divRef?.current);
    getTripGeosAndInitialPosition();
    getBoundaries();
  }, []);

  // What the button cycles through.

  const [IFlyToAndFadeItems, setIFlyToAndFadeItems] = useState<Array<IFlyToAndFadeItem>>([]);
  const [index, setIndex] = useState<number>(0);
  const [edit, setEdit] = useState(false);
  const [boundaries, setBoundaries] = useState<Boundary[]>([]);
  const [idCount, setIdCount] = useState(0);

  // map Event subcriptions:
  const map = useMapEvent('dragend', () => {
    getTripGeosAndInitialPosition();
  });

  //onclick:
  const jump = () => {
    // cycle through trips for now, later we can do a popup menu
    const next = index == IFlyToAndFadeItems.length - 1 ? 0 : index + 1;
    setIndex(next);
  };

  //
  useEffect(() => {
    if (!(IFlyToAndFadeItems.length > 0)) {
      return;
    }
    if (IFlyToAndFadeItems[index]?.geometries) {
      flyToContext.go([IFlyToAndFadeItems[index]]);
    }
  }, [index]);

  // can be replaced with a menu (later):
  const getTripGeosAndInitialPosition = async () => {
    let tripObjects;
    //mobile only
    if (Capacitor.getPlatform() === 'ios' || Capacitor.getPlatform() === 'android') {
      const queryResults = await dataAccess.getTrips();
      if (!queryResults.length) {
        return;
      }
      tripObjects = queryResults.map((rawRecord) => {
        return JSON.parse(rawRecord.json);
      });
    } else {
      tripObjects = [
        {
          id: 1,
          name: 'trip a',
          geometry: [
            {
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'Polygon',
                coordinates: [
                  [
                    [-126.826171875, 51.876490970614775],
                    [-123.70605468750001, 51.876490970614775],
                    [-123.70605468750001, 53.68369534495075],
                    [-126.826171875, 53.68369534495075],
                    [-126.826171875, 51.876490970614775]
                  ]
                ]
              }
            }
          ]
        }
      ];
    }

    let items = new Array<IFlyToAndFadeItem>();

    //add current position as bounds to zoom to
    items.push({
      name: 'Original Position',
      bounds: map.getBounds(),
      colour: 'red',
      transitionType: FlyToAndFadeItemTransitionType.zoomToBounds
    });
    //then add trips as geometries to show
    for (const trip of tripObjects.sort((a, b) => (a.id < b.id ? 1 : -1))) {
      if (trip.geometry.length > 0) {
        items.push({
          name: 'TRIP: ' + trip.name,
          geometries: trip.geometry,
          colour: 'red',
          transitionType: FlyToAndFadeItemTransitionType.zoomToGeometries
        });
      }
    }

    setIFlyToAndFadeItems([...items]);
  };

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
      const name = prompt('Name:');
      setEdit(true);

      const tempBoundary: Boundary = {
        id: idCount,
        name: name,
        geos: [],
        server_id: null
      };

      dataAccess.addBoundary(tempBoundary);
      setBoundaries([...boundaries, tempBoundary]);
    }
  });

  const deleteBoundary = async (id: number) => {
    await dataAccess.deleteBoundary(id);
    getBoundaries();
  }

  return (
    <Box>
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

      {boundaries.map((boundary, index) => (
        <ListItem
          key={index}
          onClick={() => {
            jump();
          }}
          disableGutters>
          <ListItemText>
            <Typography className={toolClass.Font}>{boundary.name}</Typography>
          </ListItemText>
          <ListItemIcon>
            <CheckIcon />
          </ListItemIcon>
          <ListItemIcon>
            <Button onClick={() => deleteBoundary(boundary.id)}>
              <DeleteIcon />
            </Button>
          </ListItemIcon>
        </ListItem>
      ))}
      {/* <ListItem
        onClick={() => {
          jump();
        }}
        disableGutters>
        <ListItemText>
          <Typography className={toolClass.Font}>Sunny infested areas</Typography>
        </ListItemText>
        <ListItemIcon>
          <CheckIcon />
        </ListItemIcon>
      </ListItem> */}
      {/* <ListItem disableGutters>
        <ListItemText>
          <Typography className={toolClass.Font}>Scenic infested areas</Typography>
        </ListItemText>
      </ListItem> */}
      {/*
        <>
          edit?
          <FeatureGroup>
            <EditTools />
          </FeatureGroup>
          : <></>
        </>
      */}
    </Box>
  );
};

export default JumpToTrip;

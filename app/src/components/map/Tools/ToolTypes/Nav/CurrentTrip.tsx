import { ListItem, ListItemIcon, ListItemText, Typography } from '@mui/material';
import ExploreIcon from '@mui/icons-material/Explore';
import { ListItemButton } from '@mui/material';
import { DatabaseContext } from 'contexts/DatabaseContext';
import { useDataAccess } from 'hooks/useDataAccess';
import L from 'leaflet';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useMapEvent } from 'react-leaflet';
import { toolStyles } from '../../Helpers/ToolStyles';
import { FlyToAndFadeItemTransitionType, IFlyToAndFadeItem, useFlyToAndFadeContext } from './FlyToAndFade';
import { useSelector } from 'react-redux';
import { selectConfiguration } from 'state/reducers/configuration';
/*

- [ ] add ui button to let user add shapes
- [ ]  shapes persist - where?
- [ ] or view existing in list
- [ ] 


*/

export const JumpToTrip = (props) => {
  const { MOBILE } = useSelector(selectConfiguration);

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
  }, []);

  // What the button cycles through.

  const [IFlyToAndFadeItems, setIFlyToAndFadeItems] = useState<Array<IFlyToAndFadeItem>>([]);
  const [index, setIndex] = useState<number>(0);

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
    if (MOBILE) {
      const queryResults = await dataAccess.getTrips();
      if (!queryResults.length) {
        return;
      }
      tripObjects = queryResults.map((rawRecord) => {
        return JSON.parse(rawRecord.json);
      });
    } else {
      return;
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

  return (
    <ListItem disableGutters>
      <ListItemButton
        ref={divRef}
        aria-label="Jump To Location"
        onClick={jump}
        style={{ padding: 10, borderBottomLeftRadius: 5, borderBottomRightRadius: 5 }}>
        <ListItemIcon>
          <ExploreIcon />
        </ListItemIcon>
        <ListItemText>
          <Typography className={toolClass.Font}></Typography>
        </ListItemText>
      </ListItemButton>
    </ListItem>
  );
};

export default JumpToTrip;

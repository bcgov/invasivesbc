import { IconButton, Typography } from '@material-ui/core';
import React, { useContext, useEffect, useState, useRef } from 'react';
import { toolStyles } from '../../Helpers/ToolStyles';
import L from 'leaflet';
import { ThemeContext } from 'contexts/themeContext';
import ExploreIcon from '@mui/icons-material/Explore';
import { Capacitor } from '@capacitor/core';
import { useDataAccess } from 'hooks/useDataAccess';
import { DatabaseContext2 } from 'contexts/DatabaseContext2';
import { useMapEvent } from 'react-leaflet';
import { FlyToAndFadeItemTransitionType, IFlyToAndFadeItem, useFlyToAndFadeContext } from './FlyToAndFade';

export const JumpToTrip = (props) => {
  // style
  const toolClass = toolStyles();
  const themeContext = useContext(ThemeContext);

  // Is this needed? Copied from DisplayPosition
  const divRef = useRef(null);

  // DB: MOBILE ONLY!
  const databaseContext = useContext(DatabaseContext2);
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
    flyToContext.go([IFlyToAndFadeItems[index]]);
  }, [index]);

  // can be replaced with a menu (later):
  const getTripGeosAndInitialPosition = async () => {
    let tripObjects;
    //mobile only
    if (Capacitor.getPlatform() === 'ios' || Capacitor.getPlatform() === 'android') {
      const queryResults = await dataAccess.getTrips(databaseContext);
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
    <>
      <IconButton
        ref={divRef}
        className={themeContext.themeType ? toolClass.toolBtnDark : toolClass.toolBtnLight}
        aria-label="Jump To Location"
        onClick={jump}
        style={{ padding: 10, borderBottomLeftRadius: 5, borderBottomRightRadius: 5 }}>
        <ExploreIcon />
        <Typography className={toolClass.Font}>Cached Trips</Typography>
      </IconButton>
    </>
  );
};

export default JumpToTrip;

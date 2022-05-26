import { Capacitor } from '@capacitor/core';
import { Button, ClickAwayListener, ListItem, ListItemIcon, ListItemText, Typography } from '@mui/material';
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
/*

- [ ] add ui button to let user add shapes
- [ ]  shapes persist - where?
- [ ] or view existing in list
- [ ] 
*/

export const JumpToTrip = (props) => {
  // style
  const toolClass = toolStyles();

  // Is this needed? Copied from DisplayPosition
  const divRef = useRef(null);

  const flyToContext = useFlyToAndFadeContext();

  // initial setup & events to block:
  useEffect(() => {
    // L.DomEvent.disableClickPropagation(divRef?.current);
    // L.DomEvent.disableScrollPropagation(divRef?.current);
    getTripGeosAndInitialPosition();
  }, []);

  const [flyToAndFadeItem, setFlyToAndFadeItem] = useState<IFlyToAndFadeItem>(null);
  const [checked, setChecked] = useState<boolean>(false);

  // map Event subcriptions:
  const map = useMapEvent('dragend', () => {
    getTripGeosAndInitialPosition();
  });

  //onclick:
  const jump = () => {
    // popup menu style
    if (!flyToAndFadeItem) {
      return;
    }

    if (flyToAndFadeItem.geometries) {
      flyToContext.go([flyToAndFadeItem]);
    }

  };

  const getTripGeosAndInitialPosition = async () => {
    const trip = await props?.boundary;

    if (!trip || !trip?.geos?.length) {
      return;
    }

    const item : IFlyToAndFadeItem = {
      name: 'TRIP: ' + trip.name,
      geometries: trip.geos,
      colour: 'red',
      transitionType: FlyToAndFadeItemTransitionType.zoomToGeometries
    };

    setFlyToAndFadeItem(item);
  };

  const unCheck = () => {
    setChecked(false);
  }


  return (
    <ClickAwayListener onClickAway={unCheck}>
      <ListItem
        onClick={() => {
          jump();
          setChecked(true);
        }}
        disableGutters>
        <ListItemText>
          <Typography className={toolClass.Font}>{props.name}</Typography>
        </ListItemText>
        <ListItemIcon>
          {checked && <CheckIcon />}
        </ListItemIcon>
        <ListItemIcon>
          <Button onClick={() => props.deleteBoundary(props.id)}>
            <DeleteIcon />
          </Button>
        </ListItemIcon>
      </ListItem>
    </ClickAwayListener>
  );
};

export default JumpToTrip;
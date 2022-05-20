import { Capacitor } from '@capacitor/core';
import { ListItemIcon, ListItemText, Typography } from '@mui/material';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import { ListItemButton } from '@mui/material';
import { DatabaseContext } from 'contexts/DatabaseContext';
import { useDataAccess } from 'hooks/useDataAccess';
import L from 'leaflet';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useMapEvent } from 'react-leaflet';
import { toolStyles } from '../../Helpers/ToolStyles';
import { FlyToAndFadeItemTransitionType, IFlyToAndFadeItem, useFlyToAndFadeContext } from './FlyToAndFade';

export const JumpToActivity = (props) => {
  // style
  const toolClass = toolStyles();

  // Is this needed? Copied from DisplayPosition
  const divRef = useRef(null);

  // DB: MOBILE ONLY!
  const databaseContext = useContext(DatabaseContext);
  const dataAccess = useDataAccess();

  const flyToContext = useFlyToAndFadeContext();

  const [readyActivityNavJump, setReadyActivityNavJump] = useState(false);

  // initial setup & events to block:
  useEffect(() => {
    if (!props.id) {
      return;
    }
    L.DomEvent.disableClickPropagation(divRef?.current);
    L.DomEvent.disableScrollPropagation(divRef?.current);
    console.log('******initial hook');
    console.log(props.id);
    getTripGeosAndInitialPosition();
  }, [props.id]);

  // What the button cycles through.

  const [IFlyToAndFadeItems, setIFlyToAndFadeItems] = useState<Array<IFlyToAndFadeItem>>([]);

  // map Event subcriptions:
  const map = useMapEvent('dragend', () => {
    if (!props.id) {
      return;
    }
    getTripGeosAndInitialPosition();
  });
  ///nfg:
  /*
  const map2 = useMapEvent((L as any).Draw.Event.CREATED, () => {
    getTripGeosAndInitialPosition();
  });
  */

  //onclick:
  const jump = () => {
    if (IFlyToAndFadeItems[0]) {
      flyToContext.go([IFlyToAndFadeItems[0]]);
    }
  };

  //

  // can be replaced with a menu (later):
  const getTripGeosAndInitialPosition = async () => {
    if (props.id !== null) {
      //mobile only
      const activityObject = await dataAccess.getActivityById(props.id, databaseContext, true);
      let items = new Array<IFlyToAndFadeItem>();

      //then add activitys as geometries to show
      if (MOBILE) {
        console.log('got to web ');
        if (activityObject.activity_payload.geometry?.length > 0) {
          items.push({
            //          name: 'Activity : ' + activity.name,
            geometries: activityObject.activity_payload.geometry,
            colour: 'red',
            transitionType: FlyToAndFadeItemTransitionType.zoomToGeometries
          });
        }
      } else {
        if (activityObject.geometry?.length > 0) {
          items.push({
            //          name: 'Activity : ' + activity.name,
            geometries: activityObject?.geometry,
            colour: 'red',
            transitionType: FlyToAndFadeItemTransitionType.zoomToGeometries
          });
        }
      }

      if (items.length > 0) {
        console.log('setting');
        setIFlyToAndFadeItems([...items]);
      }
    }
    setReadyActivityNavJump(true);
  };

  useEffect(() => {
    if (readyActivityNavJump) {
      jump();
    }
  }, [readyActivityNavJump]);

  return (
    <>
      {' '}
      {props.id && (
        <ListItemButton
          ref={divRef}
          aria-label="Jump To Location"
          onClick={jump}
          disabled={!props.id || !IFlyToAndFadeItems[0]}>
          <ListItemIcon>
            <KeyboardReturnIcon />
          </ListItemIcon>
          <ListItemText>
            <Typography className={toolClass.Font}>Show Record</Typography>
          </ListItemText>
        </ListItemButton>
      )}
    </>
  );
};

export default JumpToActivity;

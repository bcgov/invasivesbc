import { Capacitor } from '@capacitor/core';
import { IconButton, Typography } from '@material-ui/core';
import KeyboardReturnIcon from '@mui/icons-material/KeyboardReturn';
import { DatabaseContext } from 'contexts/DatabaseContext';
import { ThemeContext } from 'contexts/themeContext';
import { useDataAccess } from 'hooks/useDataAccess';
import L from 'leaflet';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useMapEvent } from 'react-leaflet';
import { toolStyles } from '../../Helpers/ToolStyles';
import { FlyToAndFadeItemTransitionType, IFlyToAndFadeItem, useFlyToAndFadeContext } from './FlyToAndFade';

export const JumpToActivity = (props) => {
  // style
  const toolClass = toolStyles();
  const themeContext = useContext(ThemeContext);

  // Is this needed? Copied from DisplayPosition
  const divRef = useRef(null);

  // DB: MOBILE ONLY!
  const databaseContext = useContext(DatabaseContext);
  const dataAccess = useDataAccess();

  const flyToContext = useFlyToAndFadeContext();

  // initial setup & events to block:
  useEffect(() => {
    if (!props.id) {
      console.log(props.id);
      return;
    }
    L.DomEvent.disableClickPropagation(divRef?.current);
    L.DomEvent.disableScrollPropagation(divRef?.current);
    getTripGeosAndInitialPosition();
  }, []);

  // What the button cycles through.

  const [IFlyToAndFadeItems, setIFlyToAndFadeItems] = useState<Array<IFlyToAndFadeItem>>([]);
  const [index, setIndex] = useState<number>(0);

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
    //mobile only
    const activityObject = await dataAccess.getActivityById(props.id, databaseContext, true);
    let items = new Array<IFlyToAndFadeItem>();

    //then add activitys as geometries to show
    if (Capacitor.getPlatform() == 'web') {
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
      setIFlyToAndFadeItems([...items]);
    }
  };

  return (
    <>
      {' '}
      {props.id && (
        <IconButton
          ref={divRef}
          className={themeContext.themeType ? toolClass.toolBtnDark : toolClass.toolBtnLight}
          aria-label="Jump To Location"
          onClick={jump}
          disabled={!props.id || !IFlyToAndFadeItems[0]}>
          <KeyboardReturnIcon />
          <Typography className={toolClass.Font}>Show Record</Typography>
        </IconButton>
      )}
    </>
  );
};

export default JumpToActivity;

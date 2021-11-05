import { IconButton } from '@material-ui/core';
import React, { useContext, useEffect, useState, useRef } from 'react';
import { toolStyles } from './Helpers/ToolBtnStyles';
import L from 'leaflet';
import { ThemeContext } from 'contexts/themeContext';
import { useDataAccess } from 'hooks/useDataAccess';
import { DatabaseContext2 } from 'contexts/DatabaseContext2';
import { Capacitor } from '@capacitor/core';
import { generateDBActivityPayload } from 'utils/addActivity';
import { useHistory } from 'react-router';
import CreateIcon from '@mui/icons-material/Create';
import { ActivitySubtype, ActivityType } from 'constants/activities';
import { AuthStateContext } from 'contexts/authStateContext';

export const NewRecord = (props) => {
  const history = useHistory();
  const { userInfo } = useContext(AuthStateContext); // style
  const toolClass = toolStyles();
  const themeContext = useContext(ThemeContext);

  // Is this needed? Copied from DisplayPosition
  const divRef = useRef(null);

  // DB: MOBILE ONLY!
  const databaseContext = useContext(DatabaseContext2);
  const dataAccess = useDataAccess();

  // initial setup & events to block:
  useEffect(() => {
    L.DomEvent.disableClickPropagation(divRef?.current);
    L.DomEvent.disableScrollPropagation(divRef?.current);
  }, []);

  // can be replaced with a menu (later):
  const createOnClick = async () => {
    //
    //mobile only
    const type = ActivityType.Observation;
    const subtype = ActivitySubtype.Observation_PlantTerrestrial;
    const dbActivity = generateDBActivityPayload({}, null, type, subtype);
    dbActivity.created_by = userInfo?.preferred_username;
    await dataAccess.createActivity(dbActivity, databaseContext);

    await dataAccess.setAppState({ activeActivity: dbActivity.activity_id }, databaseContext);
    setTimeout(() => {
      history.push({ pathname: `/home/activity` });
    }, 500);
  };

  return (
    <>
      <IconButton
        ref={divRef}
        className={themeContext.themeType ? toolClass.toolBtnDark : toolClass.toolBtnLight}
        aria-label="Create Record"
        onClick={createOnClick}>
        <CreateIcon />
      </IconButton>
    </>
  );
};

export default NewRecord;

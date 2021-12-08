import {
  Box,
  Button,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography
} from '@material-ui/core';
import AddIcon from '@mui/icons-material/Add';
import CancelPresentationIcon from '@mui/icons-material/CancelPresentation';
import { Autocomplete } from '@mui/material';
import { ActivitySubtype, ActivitySubtypeShortLabels, ActivityType } from 'constants/activities';
import { AuthStateContext } from 'contexts/authStateContext';
import { DatabaseContext } from 'contexts/DatabaseContext';
import { MapRecordsContext } from 'contexts/MapRecordsContext';
import { ThemeContext } from 'contexts/themeContext';
import { useDataAccess } from 'hooks/useDataAccess';
import L from 'leaflet';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { generateDBActivityPayload } from 'utils/addActivity';
import { toolStyles } from '../../Helpers/ToolStyles';
import { startPolygon, stopPolygon } from './ReactLeafletEditableEventHandlers';

export const DrawButtonList = (props) => {
  const divRef = useRef(null);

  // initial setup & events to block:
  useEffect(() => {
    L.DomEvent.disableClickPropagation(divRef?.current);
    L.DomEvent.disableScrollPropagation(divRef?.current);
  }, []);

  const dataAccess = useDataAccess();
  const databaseContext = useContext(DatabaseContext);
  const toolClass = toolStyles();
  const themeContext = useContext(ThemeContext);
  const history = useHistory();

  // Is this needed? Copied from DisplayPosition
  useEffect(() => {
    console.log('initial render');
  });

  const mapRecordsContext = useContext(MapRecordsContext);

  const [index, setIndex] = useState(-1);
  const [inEdit, setInEdit] = useState(false);

  const items = [
    {
      label: 'polygon_draw',
      button: (props) => {
        return (
          <IconButton
            className={toolClass.toolBtnLight}
            onClick={() => {
              if (!inEdit) {
                startPolygon(mapRecordsContext);
                setInEdit(true);
              } else {
                stopPolygon(mapRecordsContext);
                setInEdit(false);
              }
            }}>
            Polygon
          </IconButton>
        );
      }
    }
  ];
  return (
    <Grid ref={divRef} xs={12} container className={toolClass.toolBtnMultiStageMenu}>
      {items.map((i) => {
        const Btn = i.button;
        return (
          <Grid className={toolClass.toolBtnMultiStageMenuItem} item>
            <Btn />
          </Grid>
        );
      })}
    </Grid>
  );
};

export default DrawButtonList;

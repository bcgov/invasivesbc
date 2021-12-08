import { Grid, IconButton } from '@material-ui/core';
import { DatabaseContext } from 'contexts/DatabaseContext';
import { MapRecordsContext } from 'contexts/MapRecordsContext';
import { ThemeContext } from 'contexts/themeContext';
import { useDataAccess } from 'hooks/useDataAccess';
import L from 'leaflet';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { toolStyles } from '../../Helpers/ToolStyles';
import {
  startCircle,
  startPolygon,
  startPolyline,
  startRectangle,
  stopShape
} from './ReactLeafletEditableEventHandlers';

export const DrawButtonList = (props) => {
  const divRef = useRef(null);

  // initial setup & events to block:
  useEffect(() => {
    L.DomEvent.disableClickPropagation(divRef?.current);
    L.DomEvent.disableScrollPropagation(divRef?.current);
  }, []);

  const toolClass = toolStyles();
  const themeContext = useContext(ThemeContext);

  // Is this needed? Copied from DisplayPosition

  const mapRecordsContext = useContext(MapRecordsContext);

  const [index, setIndex] = useState(-1);
  const [inEdit, setInEdit] = useState(false);

  const DrawButton = (props) => {
    return (
      <IconButton className={toolClass.toolBtnLight} onClick={props.onClick}>
        {props.label}
      </IconButton>
    );
  };

  const items = [
    {
      label: 'polygon_draw',
      button: (props) => {
        return (
          <>
            <DrawButton
              onClick={() => {
                if (!inEdit) {
                  startPolygon(mapRecordsContext);
                  setInEdit(true);
                } else {
                  stopShape(mapRecordsContext);
                  setInEdit(false);
                }
              }}
              label={'Polygon'}
            />
          </>
        );
      }
    },
    {
      label: 'square_draw',
      button: (props) => {
        return (
          <DrawButton
            onClick={() => {
              if (!inEdit) {
                startRectangle(mapRecordsContext);
                setInEdit(true);
              } else {
                stopShape(mapRecordsContext);
                setInEdit(false);
              }
            }}
            label={'Square'}
          />
        );
      }
    },
    {
      label: 'circle_draw',
      button: (props) => {
        return (
          <DrawButton
            onClick={() => {
              if (!inEdit) {
                startCircle(mapRecordsContext);
                setInEdit(true);
              } else {
                stopShape(mapRecordsContext);
                setInEdit(false);
              }
            }}
            label={'Circle'}
          />
        );
      }
    },
    {
      label: 'polyline_draw',
      button: (props) => {
        return (
          <DrawButton
            onClick={() => {
              if (!inEdit) {
                startPolyline(mapRecordsContext);
                setInEdit(true);
              } else {
                stopShape(mapRecordsContext);
                setInEdit(false);
              }
            }}
            label={'PolyLine'}
          />
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

import { Grid, IconButton, Typography } from '@material-ui/core';
import { DatabaseContext } from 'contexts/DatabaseContext';
import { MapRecordsContext } from 'contexts/MapRecordsContext';
import { ThemeContext } from 'contexts/themeContext';
import { useDataAccess } from 'hooks/useDataAccess';
import L from 'leaflet';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { toolStyles } from '../../Helpers/ToolStyles';
import { Shape, startBasicShape, stopShape } from './ReactLeafletEditableEventHandlers';
import PentagonIcon from '@mui/icons-material/Pentagon';
import CircleIcon from '@mui/icons-material/Circle';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import GestureIcon from '@mui/icons-material/Gesture';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import EggAltIcon from '@mui/icons-material/EggAlt';
import AddLocationIcon from '@mui/icons-material/AddLocation';
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
    const Icn = props.icon;
    return (
      <IconButton
        disabled={props.disabled ? true : false}
        className={toolClass.toolBtnLight}
        onClick={() => {
          props.onClick();
        }}>
        <Typography className={toolClass.Font}> {props.label}</Typography>
        {props.icon ? <Icn /> : <></>}
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
                  startBasicShape(mapRecordsContext, Shape.POLYGON);
                  setInEdit(true);
                } else {
                  stopShape(mapRecordsContext);
                  setInEdit(false);
                }
              }}
              label={'Polygon'}
              icon={PentagonIcon}
            />
          </>
        );
      }
    },
    {
      label: 'rectangle_draw',
      button: (props) => {
        return (
          <DrawButton
            onClick={() => {
              if (!inEdit) {
                startBasicShape(mapRecordsContext, Shape.RECTANGLE);
                setInEdit(true);
              } else {
                stopShape(mapRecordsContext);
                setInEdit(false);
              }
            }}
            label={'Box'}
            icon={CheckBoxOutlineBlankIcon}
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
                startBasicShape(mapRecordsContext, Shape.CIRCLE_MARKER);
                setInEdit(true);
              } else {
                stopShape(mapRecordsContext);
                setInEdit(false);
              }
            }}
            label={'Circle'}
            icon={CircleIcon}
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
                startBasicShape(mapRecordsContext, Shape.POLYLINE);
                setInEdit(true);
              } else {
                stopShape(mapRecordsContext);
                setInEdit(false);
              }
            }}
            label={'Line'}
            icon={GestureIcon}
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
                startBasicShape(mapRecordsContext, Shape.POLYLINE);
                setInEdit(true);
              } else {
                stopShape(mapRecordsContext);
                setInEdit(false);
              }
            }}
            label={'Buffer Shape'}
            icon={EggAltIcon}
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
                startBasicShape(mapRecordsContext, Shape.CIRCLE_MARKER);
                setInEdit(true);
              } else {
                stopShape(mapRecordsContext);
                setInEdit(false);
              }
            }}
            label={'Circle Mark'}
            icon={FiberManualRecordIcon}
          />
        );
      }
    },
    {
      label: 'polyline_draw',
      button: (props) => {
        return (
          <DrawButton
            disabled={true}
            onClick={() => {
              if (!inEdit) {
                startBasicShape(mapRecordsContext, Shape.CIRCLE_MARKER);
                setInEdit(true);
              } else {
                stopShape(mapRecordsContext);
                setInEdit(false);
              }
            }}
            label={'Manual UTM'}
            icon={FiberManualRecordIcon}
          />
        );
      }
    },
    {
      label: 'polyline_draw',
      button: (props) => {
        return (
          <DrawButton
            disabled={true}
            onClick={() => {
              if (!inEdit) {
                startBasicShape(mapRecordsContext, Shape.CIRCLE_MARKER);
                setInEdit(true);
              } else {
                stopShape(mapRecordsContext);
                setInEdit(false);
              }
            }}
            label={'Current Location'}
            icon={AddLocationIcon}
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

import { Typography, Divider, List, ListItem, ListItemIcon, ListItemText, ListSubheader } from '@mui/material';
import { MapRecordsContext, MODES } from 'contexts/MapRecordsContext';
import L from 'leaflet';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { toolStyles } from '../../Helpers/ToolStyles';
import { Shape, startBasicShape, stopShape } from './ReactLeafletEditableEventHandlers';
import PentagonIcon from '@mui/icons-material/Pentagon';
import CircleIcon from '@mui/icons-material/Circle';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import GestureIcon from '@mui/icons-material/Gesture';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import EggAltIcon from '@mui/icons-material/EggAlt';
import AddLocationIcon from '@mui/icons-material/AddLocation';
import SaveIcon from '@mui/icons-material/Save';
import { ListItemButton } from '@mui/material';
export const DrawButtonList = (props) => {
  const divRef = useRef(null);

  // initial setup & events to block:
  useEffect(() => {
    L.DomEvent.disableClickPropagation(divRef?.current);
    L.DomEvent.disableScrollPropagation(divRef?.current);
  }, []);

  const toolClass = toolStyles();

  // Is this needed? Copied from DisplayPosition

  const mapRecordsContext = useContext(MapRecordsContext);

  const [inEdit, setInEdit] = useState(false);

  const DrawButton = (props) => {
    const Icn = props.icon;
    return (
      <ListItemButton
        disabled={props.disabled ? true : false}
        onClick={() => {
          props.onClick();
        }}>
        <ListItemIcon>{props.icon ? <Icn /> : <></>}</ListItemIcon>
        <ListItemText>
          <Typography className={toolClass.Font}> {props.label}</Typography>
        </ListItemText>
      </ListItemButton>
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
    /*  {
      label: 'circle_draw',
      button: (props) => {
        return (
          <DrawButton
            onClick={() => {
              if (!inEdit) {
                startBasicShape(mapRecordsContext, Shape.CIRCLE);
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
    },*/
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
            disabled={true}
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
    <>
      {items.length > 0 && (
        <>
          <Divider />
          <List
            ref={divRef}
            style={{ backgroundColor: 'rgba(0,0,0,0.03)' }}
            subheader={
              <ListSubheader disableSticky component="div" id="nested-list-subheader">
                Edit Geometry Options
              </ListSubheader>
            }>
            {mapRecordsContext.mode === MODES.SINGLE_ACTIVITY_EDIT ? (
              items.map((i) => {
                const Btn = i.button;
                return (
                  <ListItem disableGutters>
                    <Btn />
                  </ListItem>
                );
              })
            ) : (
              <></>
            )}
            {mapRecordsContext.mode === MODES.SINGLE_ACTIVITY_EDIT ? (
              <ListItem disableGutters>
                <ListItemButton
                  disabled={props.disabled ? true : false}
                  onClick={() => {
                    stopShape(mapRecordsContext);
                    setInEdit(false);
                  }}>
                  <ListItemIcon>
                    <SaveIcon />
                  </ListItemIcon>
                  <ListItemText>
                    <Typography className={toolClass.Font}>Done</Typography>
                  </ListItemText>
                </ListItemButton>
              </ListItem>
            ) : (
              <></>
            )}
          </List>
          <Divider />
        </>
      )}
    </>
  );
};

export default DrawButtonList;

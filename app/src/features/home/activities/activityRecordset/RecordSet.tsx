import { Delete, ExpandLess } from '@mui/icons-material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionActions,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Checkbox,
  Typography
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import makeStyles from '@mui/styles/makeStyles';
import ActivitiesList2 from 'components/activities-list/ActivitiesList2';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import LayersIcon from '@mui/icons-material/Layers';
import MapIcon from '@mui/icons-material/Map';
import { DatabaseContext } from 'contexts/DatabaseContext';
import { useDataAccess } from 'hooks/useDataAccess';
import { RecordSetContext } from '../ActivitiesPage';
import { setUncaughtExceptionCaptureCallback } from 'process';

export const RecordSet = (props) => {
  const useStyles = makeStyles((theme: any) => ({
    newActivityButtonsRow: {
      '& Button': {
        marginRight: '0.5rem',
        marginBottom: '0.5rem'
      }
    },
    syncSuccessful: {
      color: theme.palette.success.main
    },
    formControl: {},
    mainHeader: {
      backGroundColor: theme.palette.success.main,
      color: 'black',
      borderStyle: 'solid'
    }
  }));
  const classes = useStyles();
  const [expanded, setExpanded] = useState(false);
  const [mapToggle, setMapToggle] = useState(false);
  const [colour, setColour] = useState('blue');
  const colours = ['blue, green', 'red', 'white', 'brown', 'purple'];

  const recordSetContext = useContext(RecordSetContext);

  const getInitialPropertyState = (propertyName) => {
    let initial = null;
    if (
      recordSetContext.recordSetState &&
      recordSetContext.recordSetState[props.setName] &&
      recordSetContext.recordSetState[props.setName][propertyName]
    ) {
      initial = recordSetContext.recordSetState[props.setName][propertyName];
    }
    if (initial !== null) {
      switch (propertyName) {
        case 'expanded':
          setExpanded(initial);
          break;
        case 'mapToggle':
          setMapToggle(initial);
          break;
        default:
          break;
      }
    }
  };
  const updatePropertyState = (propertyName) => {
    let initial = null;
    if (
      recordSetContext.recordSetState &&
      recordSetContext.recordSetState[props.setName] &&
      recordSetContext.recordSetState[props.setName][propertyName]
    ) {
      initial = recordSetContext.recordSetState[props.setName][propertyName];
    }
    const initialStateAll = recordSetContext.recordSetState;
    const initialState = recordSetContext.recordSetState[props.setName];
    switch (propertyName) {
      case 'expanded':
        recordSetContext.setRecordSetState({
          ...initialStateAll,
          [props.setName]: { ...initialState, expanded: expanded }
        });
        break;
      case 'mapToggle':
        recordSetContext.setRecordSetState({
          ...initialStateAll,
          [props.setName]: { ...initialState, mapToggle: mapToggle }
        });
        break;
    }
  };

  const updatePropertyStates = (propertyNames: string[]) => {
    if (recordSetContext.recordSetState && recordSetContext.recordSetState[props.setName]) {
      const initialStateAll = recordSetContext.recordSetState;
      const initialState = recordSetContext.recordSetState[props.setName];
      const newState = {};
      propertyNames.forEach((propertyName) => {
        let initial = null;
        if (recordSetContext.recordSetState[props.setName][propertyName]) {
          initial = recordSetContext.recordSetState[props.setName][propertyName];
        }
        switch (propertyName) {
          case 'expanded':
            console.log('expanded');
            console.log(expanded);
            newState['expanded'] = expanded;
            break;
          case 'mapToggle':
            newState['mapToggle'] = mapToggle;
            break;
        }
      });

      recordSetContext.setRecordSetState({
        ...initialStateAll,
        [props.setName]: { ...initialState, ...newState }
      });
    }
  };

  const updateExpandedState = () => {
    let initialExpanded = false;
    if (recordSetContext.recordSetState && recordSetContext?.recordSetState[props.setName]?.expanded) {
      initialExpanded = recordSetContext.recordSetState[props.setName].expanded;
    }
    if (expanded !== initialExpanded) {
      const initialStateAll = recordSetContext.recordSetState;
      const initialState = recordSetContext.recordSetState[props.setName];
      recordSetContext.setRecordSetState({
        ...initialStateAll,
        [props.setName]: { ...initialState, expanded: expanded }
      });
    }
  };

  useEffect(() => {
    //getInitialExpandedState();
    getInitialPropertyState('expanded');
    getInitialPropertyState('mapToggle');
    /* setTimeout(() => {
      getInitialPropertyState('mapToggle');
    }, 1000);*/
  }, []);

  useEffect(() => {
    //    updateExpandedState();
    //updatePropertyState('expanded');
    updatePropertyStates(['expanded', 'mapToggle']);
    /*setTimeout(() => {
      updatePropertyState('mapToggle');
    }, 2000);*/
  }, [expanded, mapToggle]);

  const RecordSetAccordionSummary = (props) => {
    return useMemo(() => {
      return (
        <AccordionSummary>
          <Box />
          {expanded ? <ExpandLess /> : <ExpandMoreIcon />}
          <Typography sx={{ pl: 5, flexGrow: 1 }}>{props.name}</Typography>
          <Box />
          <AccordionActions sx={{ display: 'flex', justifyContent: 'end' }}>
            {props.canRemove ? (
              <Button onClick={(e) => e.stopPropagation()} variant="outlined">
                Rename
                <EditIcon
                  onClick={(e) => {
                    e.stopPropagation();
                    alert('edit name dialogue');
                  }}
                  style={{ paddingLeft: 5, fontSize: 20 }}
                />
              </Button>
            ) : (
              <></>
            )}
            <Button
              //className={classes.mainHeader}
              onClick={(e) => {
                e.stopPropagation();
                const currentIndex = colours.indexOf(colour);
                const nextIndex = (currentIndex + 1) % colours.length;
                setColour(colours[nextIndex]);
              }}
              style={{ backgroundColor: colour }}
              variant="contained">
              <ColorLensIcon />
            </Button>

            <Button onClick={(e) => e.stopPropagation()} variant="outlined">
              <LayersIcon />
              <Checkbox
                style={{ height: 15 }}
                checked={mapToggle}
                onChange={(e) => {
                  e.stopPropagation();
                  alert(!mapToggle);
                  setMapToggle((prev) => !prev);
                }}
              />
            </Button>
            {props.canRemove ? (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  if (
                    /*eslint-disable*/
                    confirm(
                      'Are you sure you want to remove this record set?  The data will persist but you will no longer have this set of filters or the map layer.'
                    )
                    /*eslint-enable*/
                  )
                    alert('TODO, remove');
                }}
                style={{ justifySelf: 'end', alignSelf: 'right' }}
                variant="outlined">
                <Delete />
              </Button>
            ) : (
              <></>
            )}
          </AccordionActions>
        </AccordionSummary>
      );
    }, [expanded, mapToggle]);
  };

  return (
    <>
      <Accordion
        onChange={(e) => {
          setExpanded((prev) => !prev);
        }}
        expanded={expanded}>
        {/*<AccordionSummary sx={{ width: '100%', display: 'flex', justifyContent: 'end' }}>*/}
        <RecordSetAccordionSummary />
        <AccordionDetails>
          {/*}          <ActivitiesList2 setName={props.setName} setSelectedRecord={props.setSelectedRecord} />*/}
        </AccordionDetails>
      </Accordion>
    </>
  );
};
export default RecordSet;

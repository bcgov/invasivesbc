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
  Grid,
  Typography
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import makeStyles from '@mui/styles/makeStyles';
import ActivitiesList2 from 'components/activities-list/NewRecordWizard';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import LayersIcon from '@mui/icons-material/Layers';
import MapIcon from '@mui/icons-material/Map';
import { DatabaseContext } from 'contexts/DatabaseContext';
import { useDataAccess } from 'hooks/useDataAccess';
import { RecordSetContext } from '../ActivitiesPage';
import { setUncaughtExceptionCaptureCallback } from 'process';
import ActivityGrid from 'components/activities-list/Tables/Plant/ActivityTable';

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
  const [recordSetName, setRecordSetName] = useState('New RecordSet');
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
        case 'colour':
          setColour(initial);
          break;
        case 'recordSetName':
          setRecordSetName(initial);
          break;
        default:
          break;
      }
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
            newState['expanded'] = expanded;
            break;
          case 'mapToggle':
            newState['mapToggle'] = mapToggle;
            break;
          case 'colour':
            newState['colour'] = colour;
            break;
          case 'recordSetName':
            newState['recordSetName'] = recordSetName;
            break;
        }
      });

      recordSetContext.setRecordSetState({
        ...initialStateAll,
        [props.setName]: { ...initialState, ...newState }
      });
    }
  };

  useEffect(() => {
    getInitialPropertyState('expanded');
    getInitialPropertyState('mapToggle');
    getInitialPropertyState('colour');
    getInitialPropertyState('recordSetName');
  }, []);

  useEffect(() => {
    updatePropertyStates(['expanded', 'mapToggle', 'colour', 'recordSetName']);
  }, [expanded, mapToggle, colour, recordSetName]);

  const RecordSetAccordionSummary = (props) => {
    return useMemo(() => {
      return (
        <AccordionSummary>
          <Box />
          {expanded ? <ExpandLess /> : <ExpandMoreIcon />}
          <Typography sx={{ pl: 5, flexGrow: 1 }}>{recordSetName}</Typography>
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
      //}, [JSON.stringify({ expanded: expanded, mapToggle: mapToggle, colour: colour, recordSetName: recordSetName })]);
    }, []); // todo - only check if number of record sets, or one of their header button or properties needs to re render
  };

  return (
    <>
      <Accordion
        onChange={(e) => {
          setExpanded((prev) => !prev);
        }}
        expanded={expanded}>
        {/*<AccordionSummary sx={{ width: '100%', display: 'flex', justifyContent: 'end' }}>*/}
        <RecordSetAccordionSummary canRemove={props.canRemove} />
        <AccordionDetails>
          <Grid sx={{ pt: 2 }} xs={12} item>
            <ActivityGrid
              setName={props.setName}
              //  formType={formType}
              // subType={subType}
              //    setSelectedRecord={props.setSelectedRecord}
              //   filtersCallBack={setFilters}
              //   initialFilters={filters}
            />
          </Grid>
          {/*} <ActivitiesList2 setName={props.setName} setSelectedRecord={props.setSelectedRecord} />*/}
        </AccordionDetails>
      </Accordion>
    </>
  );
};
export default RecordSet;

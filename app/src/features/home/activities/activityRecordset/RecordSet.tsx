import makeStyles from '@mui/styles/makeStyles';
import React, { useContext, useEffect, useState } from 'react';
import ActivityGrid from 'components/activities-list/Tables/Plant/ActivityTable';
import RecordSetAccordionSummary from './RecordSetAccordionSummary';
import { Accordion, AccordionDetails, Grid } from '@mui/material';
import { RecordSetContext } from 'contexts/recordSetContext';

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

  return (
    <>
      <Accordion
        onChange={(e) => {
          setExpanded((prev) => !prev);
        }}
        expanded={expanded}>
        {/*<AccordionSummary sx={{ width: '100%', display: 'flex', justifyContent: 'end' }}>*/}
        <RecordSetAccordionSummary
          recordSetName={recordSetName}
          setRecordSetName={setRecordSetName}
          colours={colours}
          colour={colour}
          setColour={setColour}
          mapToggle={mapToggle}
          setMapToggle={setMapToggle}
          expanded={expanded}
          canRemove={props.canRemove}
        />
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

import makeStyles from '@mui/styles/makeStyles';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import ActivityGrid from 'components/activities-list/Tables/Plant/ActivityGrid';
import RecordSetAccordionSummary from './RecordSetAccordionSummary';
import { Accordion, AccordionDetails, Grid } from '@mui/material';
import { RecordSetContext } from '../../../../contexts/recordSetContext';
import { userInfo } from 'os';
import { AuthStateContext } from 'contexts/authStateContext';
import { blue, green, red, brown, purple } from '@mui/material/colors';

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
  const [drawOrder, setDrawOrder] = useState(0);
  const [mapToggle, setMapToggle] = useState(false);
  const [color, setColor] = useState(blue[500]);
  const [recordSetType, setRecordSetType] = useState('Activity');
  const [recordSetName, setRecordSetName] = useState(null);
  const [advancedFilters, setAdvancedFilters] = useState([]);
  const colours = [blue[500], green[500], red[500], brown[500], purple[500]];
  const { userInfo, rolesUserHasAccessTo } = useContext(AuthStateContext);
  const recordSetContext = useContext(RecordSetContext);
  const { remove, recordSetState } = recordSetContext;

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
        case 'drawOrder':
          setDrawOrder(initial);
          break;
        case 'mapToggle':
          setMapToggle(initial);
          break;
        case 'color':
          setColor(initial);
          break;
        case 'recordSetType':
          setRecordSetType(initial);
          break;
        case 'recordSetName':
          setRecordSetName(initial);
          break;
        case 'advancedFilters':
          setAdvancedFilters(initial);
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
          case 'drawOrder':
            newState['drawOrder'] = drawOrder;
            break;
          case 'mapToggle':
            newState['mapToggle'] = mapToggle;
            break;
          case 'color':
            newState['color'] = color;
            break;
          case 'recordSetName':
            newState['recordSetName'] = recordSetName;
            break;
          case 'advancedFilters':
            newState['advancedFilters'] = advancedFilters;
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
    getInitialPropertyState('drawOrder');
    getInitialPropertyState('mapToggle');
    getInitialPropertyState('color');
    getInitialPropertyState('recordSetType');
    getInitialPropertyState('recordSetName');
    getInitialPropertyState('advancedFilters');
  }, []);

  useEffect(() => {
    updatePropertyStates(['expanded', 'mapToggle', 'color', 'recordSetName', 'advancedFilters', 'drawOrder']);
  }, [expanded, mapToggle, color, recordSetName, advancedFilters, drawOrder]);

  return useMemo(
    () => (
      <>
        <Accordion
          onChange={(e) => {
            setExpanded((prev) => !prev);
          }}
          expanded={expanded}>
          <RecordSetAccordionSummary
            recordSetType={recordSetType}
            recordSetName={recordSetName}
            setName={props.setName}
            setRecordSetName={setRecordSetName}
            colours={colours}
            color={color}
            setColor={setColor}
            mapToggle={mapToggle}
            setMapToggle={setMapToggle}
            drawOrder={drawOrder}
            moveUp={() => {
              setDrawOrder(drawOrder + 1);
            }}
            moveDown={() => {
              setDrawOrder(drawOrder - 1);
            }}
            expanded={expanded}
            remove={remove}
            canRemove={props.canRemove}
          />
          <AccordionDetails>
            <Grid sx={{ pt: 2 }} xs={12} item>
              <ActivityGrid
                setType={recordSetType}
                setName={props.setName}
                advancedFilters={advancedFilters}
                setAdvancedFilters={setAdvancedFilters}
                //  formType={formType}
                // subType={subType}
                setSelectedRecord={recordSetContext.setSelectedRecord}
                //   filtersCallBack={setFilters}
                //   initialFilters={filters}
              />
            </Grid>
          </AccordionDetails>
        </Accordion>
      </>
    ),
    [JSON.stringify(recordSetState?.[props.setName]), JSON.stringify(recordSetName)]
  );
};
export default RecordSet;

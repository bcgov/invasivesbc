import makeStyles from '@mui/styles/makeStyles';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import ActivityGrid from 'components/activities-list/Tables/Plant/ActivityGrid';
import RecordSetAccordionSummary from './RecordSetAccordionSummary';
import { Accordion, AccordionDetails, Button, Grid } from '@mui/material';
import { blue, green, red, brown, purple } from '@mui/material/colors';
import { selectUserSettings } from 'state/reducers/userSettings';
import { useDispatch, useSelector } from 'react-redux';
import { USER_SETTINGS_SET_RECORD_SET_REQUEST } from 'state/actions';
import { selectMap } from 'state/reducers/map';

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
  const [labelToggle, setLabelToggle] = useState(false);
  const [color, setColor] = useState('#2A81CB');
  const [recordSetType, setRecordSetType] = useState('Activity');
  const [recordSetName, setRecordSetName] = useState(null);
  const [isSelected, setIsSelected] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);
  //const colours = [blue[500], green[500], red[500], brown[500], purple[500]];
  const colours = ['#2A81CB', '#FFD326', '#CB2B3E', '#2AAD27', '#CB8427', '#CAC428', '#9C2BCB', '#7B7B7B', '#3D3D3D'];
  const userSettings = useSelector(selectUserSettings);
  const mapAndRecordsState = useSelector(selectMap);
  const dispatch = useDispatch();

  const getInitialPropertyState = (propertyName) => {
    let initial = null;
    if (
      userSettings.recordSets &&
      userSettings.recordSets[props.setName] &&
      userSettings.recordSets[props.setName][propertyName]
    ) {
      initial = userSettings.recordSets[props.setName][propertyName];
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
        case 'labelToggle':
          setLabelToggle(initial);
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
        case 'isSelected':
          setIsSelected(initial);
          break;
        case 'advancedFilters':
          setAdvancedFilters(initial);
          break;
        default:
          break;
      }
    }
    setIsInitialized(true);
  };

  const updatePropertyStates = (propertyNames: string[]) => {
    if (userSettings.recordSets && userSettings.recordSets[props.setName]) {
      const initialStateAll = userSettings.recordSets;
      const initialState = userSettings.recordSets[props.setName];
      const newState = {};
      propertyNames.forEach((propertyName) => {
        let initial = null;
        if (userSettings.recordSets[props.setName][propertyName]) {
          initial = userSettings.recordSets[props.setName][propertyName];
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
          case 'labelToggle':
            newState['labelToggle'] = labelToggle;
            break;
          case 'color':
            newState['color'] = color;
            break;
          case 'recordSetName':
            newState['recordSetName'] = recordSetName;
            break;
          case 'isSelected':
            newState['isSelected'] = isSelected;
            break;
          case 'advancedFilters':
            newState['advancedFilters'] = advancedFilters;
            break;
        }
      });

      if (
        newState['expanded'] !== initialState['expanded'] ||
        newState['drawOrder'] !== initialState['drawOrder'] ||
        newState['mapToggle'] !== initialState['mapToggle'] ||
        newState['labelToggle'] !== initialState['labelToggle'] ||
        newState['color'] !== initialState['color'] ||
        newState['recordSetName'] !== initialState['recordSetName'] ||
        newState['isSelected'] !== initialState['isSelected'] ||
        newState['advancedFilters'] !== initialState['advancedFilters']
      ) {
        dispatch({
          type: USER_SETTINGS_SET_RECORD_SET_REQUEST,
          payload: {
            updatedSet: {
              ...initialState,
              ...newState
            },
            setName: props.setName
          }
        });
      }
    }
  };

  useEffect(() => {
    getInitialPropertyState('expanded');
    getInitialPropertyState('drawOrder');
    getInitialPropertyState('mapToggle');
    getInitialPropertyState('labelToggle');
    getInitialPropertyState('color');
    getInitialPropertyState('recordSetType');
    getInitialPropertyState('recordSetName');
    getInitialPropertyState('advancedFilters');
    getInitialPropertyState('isSelected');
  }, []);

  useEffect(() => {
    if (isInitialized) {
      updatePropertyStates([
        'expanded',
        'mapToggle',
        'labelToggle',
        'color',
        'recordSetName',
        'advancedFilters',
        'drawOrder',
        'isSelected'
      ]);
    }
  }, [expanded, mapToggle, labelToggle, color, recordSetName, advancedFilters, drawOrder, isSelected]);

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
            labelToggle={labelToggle}
            setMapToggle={setMapToggle}
            setLabelToggle={setLabelToggle}
            isSelected={isSelected}
            setIsSelected={setIsSelected}
            drawOrder={drawOrder}
            moveUp={() => {
              setDrawOrder(drawOrder + 1);
            }}
            moveDown={() => {
              setDrawOrder(drawOrder - 1);
            }}
            expanded={expanded}
            // remove={remove}
            canRemove={props.canRemove}
          />
          <AccordionDetails>
            <Grid sx={{ pt: 2 }} xs={12} item>
              {!mapAndRecordsState?.layers?.[props.setName]?.loaded ? (
                <>loading</>
              ) : (
                <ActivityGrid
                  key={props.setName + 'ActivityGrid'}
                  setType={recordSetType}
                  setName={props.setName}
                  advancedFilters={advancedFilters}
                  setAdvancedFilters={setAdvancedFilters}
                  isSelected={isSelected}
                  setIsSelected={setIsSelected}
                  //  formType={formType}
                  // subType={subType}
                  //   filtersCallBack={setFilters}
                  //   initialFilters={filters}
                />
              )}
            </Grid>
          </AccordionDetails>
        </Accordion>
      </>
    ),
    [
      JSON.stringify(userSettings.recordSets?.[props.setName]),
      JSON.stringify(recordSetName),
      JSON.stringify(advancedFilters),
      !mapAndRecordsState?.layers?.[props.setName]?.loaded
    ]
  );
};
export default RecordSet;

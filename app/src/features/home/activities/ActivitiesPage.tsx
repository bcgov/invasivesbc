import { CheckBox, ClassSharp, DirtyLens, StickyNote2 } from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import { useHistory } from 'react-router';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import CropFreeIcon from '@mui/icons-material/CropFree';
import {
  Accordion,
  AccordionActions,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Container,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ToggleButton
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import MapIcon from '@mui/icons-material/Map';
import makeStyles from '@mui/styles/makeStyles';
import React, { useContext, useEffect, useState } from 'react';
import ActivitiesList2 from '../../../components/activities-list/ActivitiesList2';

import { alpha } from '@mui/material';
import appTheme from 'themes/appTheme';
import { setOptions } from 'leaflet';
import { useDataAccess } from 'hooks/useDataAccess';
import { DatabaseContext } from 'contexts/DatabaseContext';
import { ClassNames } from '@emotion/react';
import { RecordSet } from './activityRecordset/RecordSet';
import MenuOptions from './MenuOptions';
interface IStatusPageProps {
  classes?: any;
}
const flexContainer = {
  display: 'flex',
  flexDirection: 'row',
  padding: 0
};

export const RecordSetContext = React.createContext(null);

export const RecordSetProvider = (props) => {
  const [recordSetState, setRecordSetState] = useState(null);

  const dataAccess = useDataAccess();
  const getInitialState = async () => {
    const oldState = await dataAccess.getAppState();
    if (oldState?.recordSets) {
      setRecordSetState({ ...oldState.recordSets });
    } else {
      dataAccess.setAppState({ recordSets: { ['my_drafts']: {}, ['all_data']: {} } }); // set defaults here
      setRecordSetState({ ['my_drafts']: {}, ['all_data']: {} });
    }
  };

  useEffect(() => {
    getInitialState();
  }, []);

  const updateState = async () => {
    const oldState = await dataAccess.getAppState();
    const oldRecordSets = oldState?.recordSets;
    if (oldRecordSets && recordSetState && JSON.stringify(oldRecordSets) !== JSON.stringify(recordSetState)) {
      dataAccess.setAppState({ recordSets: { ...recordSetState } });
    }
  };

  useEffect(() => {
    updateState();
  }, [recordSetState]);

  if (recordSetState !== null) {
    return (
      <RecordSetContext.Provider value={{ recordSetState: recordSetState, setRecordSetState: setRecordSetState }}>
        {props.children}
      </RecordSetContext.Provider>
    );
  } else return <></>;
};

//Style:  I tried to use className: mainHeader and put css in that class but never coloured the box
const ActivitiesPage: React.FC<IStatusPageProps> = (props) => {
  const [recordSets, setRecordSets] = useState<any[]>();
  const dataAccess = useDataAccess();
  const databaseContext = useContext(DatabaseContext);
  const [selectedRecord, setSelectedRecord] = useState<any>({});
  const [options, setOptions] = useState<any>();
  const history = useHistory();

  /* set up main menu bar options: */
  useEffect(() => {
    setOptions([
      {
        name: 'Toggle Filters on Map',
        hidden: false,
        disabled: false,
        //type: optionType.toggle,
        onClick: () => {
          alert('no');
        },
        icon: (props) => {
          return (
            <>
              <FilterListIcon />
              <MapIcon />
            </>
          );
        }
      },
      {
        name: 'Current window only',
        hidden: false,
        disabled: false,
        icon: (props) => {
          return (
            <>
              <FilterListIcon />
              <CropFreeIcon />
            </>
          );
        },
        onClick: () => {
          alert('no');
        }
      },
      {
        name: 'New Record List/Layer',
        hidden: false,
        disabled: false,
        icon: PlaylistAddIcon,
        onClick: () => {
          if (recordSets && recordSets.length > 0) {
            console.log(recordSets.length);
            setRecordSets([...recordSets, { name: 'another one' }]);
          } else {
            console.log('doesnt chamge');
            setRecordSets([{ name: 'another one' }]);
          }
        }
      },
      {
        name: 'New Record',
        hidden: false,
        disabled: false,
        icon: AddIcon,
        onClick: () => {
          alert('no');
        }
      },
      {
        name: 'Open' + (selectedRecord?.description !== undefined ? selectedRecord?.description : ''),
        disabled: !(selectedRecord?.description !== undefined),
        hidden: !selectedRecord,
        onClick: async () => {
          try {
            await dataAccess.setAppState({ activeActivity: selectedRecord.id }, databaseContext);
          } catch (e) {
            console.log('unable to http ');
            console.log(e);
          }
          //return dbActivity.activity_id;
          setTimeout(() => {
            history.push({ pathname: `/home/activity` });
          }, 1000);
        }
      }
    ]);
    console.log('selected');
  }, [selectedRecord, recordSets]);

  /* grab existing record sets from localstorage or something: */
  useEffect(() => {
    console.log('TODO grab old record sets');
  }, []);

  return (
    <>
      <RecordSetProvider>
        <Box
          style={{
            position: 'absolute',
            zIndex: 9999,
            backgroundColor: '#223f75',
            width: '100%',
            padding: 8,
            bottom: 30
            //  height: '80px'
          }}>
          <MenuOptions
            sx={{
              flexWrap: 'wrap',
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'start'
            }}
            listSX={{ width: 'auto' }}
            options={options}
          />
        </Box>

        <Container maxWidth={false} style={{ maxHeight: '100%' }} className={props.classes.container}>
          <Grid container xs={12} height="50px" display="flex" justifyContent="left">
            <Grid sx={{ pb: 15 }} xs={12} item>
              <RecordSet
                canRemove={false}
                setSelectedRecord={setSelectedRecord}
                setName={'my_drafts'}
                name={'My Drafts'}
              />
              <RecordSet
                canRemove={false}
                setSelectedRecord={setSelectedRecord}
                setName={'all_data'}
                name={'All Data'}
              />
              {recordSets && recordSets.length > 0 ? (
                recordSets.map((r, i) => {
                  return (
                    <RecordSet
                      key={i}
                      canRemove={true}
                      setName={r.name}
                      setSelectedRecord={setSelectedRecord}
                      name={r.name}
                    />
                  );
                })
              ) : (
                <></>
              )}
            </Grid>
            <Grid sx={{ pb: 15 }} xs={12} item></Grid>
          </Grid>
        </Container>
      </RecordSetProvider>
    </>
  );
};

export default ActivitiesPage;

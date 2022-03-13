import AddIcon from '@mui/icons-material/Add';
import { useHistory } from 'react-router';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import CropFreeIcon from '@mui/icons-material/CropFree';
import { Box, Container, Grid, InputLabel, ListItem } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import MapIcon from '@mui/icons-material/Map';
import makeStyles from '@mui/styles/makeStyles';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import ActivitiesList2 from '../../../components/activities-list/ActivitiesList2';

import { useDataAccess } from 'hooks/useDataAccess';
import { DatabaseContext } from 'contexts/DatabaseContext';
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
      const defaults = {
        recordSets: { ['1']: { recordSetName: 'My Drafts' }, ['2']: { recordSetName: 'All Data' } }
      };
      dataAccess.setAppState({ ...defaults });
      setRecordSetState({ ...defaults });
    }
  };

  const add = () => {
    setRecordSetState({
      ...recordSetState,
      [JSON.stringify(Object.keys(recordSetState).length + 1)]: { recordSetName: 'New Record Set' }
    });
  };

  useEffect(() => {
    getInitialState();
  }, []);

  const updateState = async () => {
    const oldState = await dataAccess.getAppState();
    console.log('****');
    console.dir(oldState);
    const oldRecordSets = oldState?.recordSets;
    if (oldRecordSets && recordSetState && JSON.stringify(oldRecordSets) !== JSON.stringify(recordSetState)) {
      dataAccess.setAppState({ recordSets: { ...recordSetState } });
    }
  };

  useEffect(() => {
    updateState();
  }, [JSON.stringify(recordSetState)]);
  //  }, []);

  if (recordSetState !== null) {
    return (
      <RecordSetContext.Provider
        value={{ recordSetState: recordSetState, setRecordSetState: setRecordSetState, add: add }}>
        {props.children}
      </RecordSetContext.Provider>
    );
  } else return <></>;
};

const RecordSetRenderer = (props) => {
  const cntxt = useContext(RecordSetContext);

  return useMemo(() => {
    console.log('RECORDSETRENDERERj');
    console.log(cntxt.recordSetState);
    return (
      <>
        {Object.keys(cntxt.recordSetState).map((recordSetName, index) => {
          console.log(['1', '2'].includes(recordSetName));
          return (
            <RecordSet
              key={index}
              canRemove={['1', '2'].includes(recordSetName) ? false : true}
              setName={recordSetName}
            />
          );
        })}
      </>
    );
    //}, [JSON.stringify(cntxt.recordSetState)]);
  }, []);
};

//Style:  I tried to use className: mainHeader and put css in that class but never coloured the box
const ActivitiesPage: React.FC<IStatusPageProps> = (props) => {
  const dataAccess = useDataAccess();
  const history = useHistory();

  const PageContainer = (props) => {
    const [selectedRecord, setSelectedRecord] = useState<any>({});
    const recordStateContext = useContext(RecordSetContext);
    const [options, setOptions] = useState<any>();

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
            recordStateContext.add();
            /*if (recordSets && recordSets.length > 0) {
            console.log(recordSets.length);
            setRecordSets([...recordSets, { [JSON.stringify(recordSets.length + 1)]: 'another one' }]);
          } else {
            console.log('doesnt chamge');
            setRecordSets([{ name: 'another one' }]);*/
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
              await dataAccess.setAppState({ activeActivity: selectedRecord.id });
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
    }, []);
    return useMemo(() => {
      /* set up main menu bar options: */
      return (
        <>
          <Box
            style={{
              position: 'absolute',
              zIndex: 9999,
              backgroundColor: '#223f75',
              width: '100%',
              padding: 8,
              bottom: 30,
              height: '80px'
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

          <Container maxWidth={false} style={{ maxHeight: '100%' }} className={props.originalActivityPageClassName}>
            <Grid container xs={12} height="50px" display="flex" justifyContent="left">
              <Grid sx={{ pb: 15 }} xs={12} item>
                <RecordSetRenderer />
              </Grid>
              <Grid sx={{ pb: 15 }} xs={12} item></Grid>
            </Grid>
          </Container>
        </>
      );
    }, [JSON.stringify(options)]);
    //    }, []);
  };

  console.log('*****main activiies page rerendering');
  return (
    <Box sx={{ height: '100%' }}>
      <RecordSetProvider>
        <PageContainer originalActivityPageClassName={props.classes.container} />;
      </RecordSetProvider>
    </Box>
  );
};

export default ActivitiesPage;

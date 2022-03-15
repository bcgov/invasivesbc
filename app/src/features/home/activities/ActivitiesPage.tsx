import AddIcon from '@mui/icons-material/Add';
import { useHistory } from 'react-router';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import CropFreeIcon from '@mui/icons-material/CropFree';
import { Box, Container, Grid, InputLabel, ListItem } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import MapIcon from '@mui/icons-material/Map';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { IWarningDialog, WarningDialog } from 'components/dialog/WarningDialog';

import { useDataAccess } from 'hooks/useDataAccess';
import { RecordSet } from './activityRecordset/RecordSet';
import MenuOptions from './MenuOptions';
import NewRecordWizard from 'components/activities-list/NewRecordWizard';

// not sure what we're using this for?
interface IStatusPageProps {
  classes?: any;
}
const flexContainer = {
  display: 'flex',
  flexDirection: 'row',
  padding: 0
};

// Where state is managed for all the sets of records, updates localstorage as it happens.
// Everything that uses this context needs a memo that adequately checks dependencies, and none of them
// should call useState setters in their parents. Thats where the render loops are coming from in the Layer Picker etc.
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
    const oldRecordSets = oldState?.recordSets;
    if (oldRecordSets && recordSetState && JSON.stringify(oldRecordSets) !== JSON.stringify(recordSetState)) {
      dataAccess.setAppState({ recordSets: { ...recordSetState } });
    }
  };

  useEffect(() => {
    updateState();
  }, [JSON.stringify(recordSetState)]);

  if (recordSetState !== null) {
    return (
      <RecordSetContext.Provider
        value={{ recordSetState: recordSetState, setRecordSetState: setRecordSetState, add: add }}>
        {props.children}
      </RecordSetContext.Provider>
    );
  } else return <></>;
};

// https://stackoverflow.com/a/60325899
const RecordSetRenderer = (props) => {
  const cntxt = useContext(RecordSetContext);

  const RecordSetMemo = React.memo((props: any) => (
    <RecordSet key={props.key} canRemove={props.canRemove} setName={props.setName} />
  ));
  // do database fetching here, before RecordSetContext.value.map, & useCallback

  const [sets, setSets] = useState(null);

  useEffect(() => {
    if (cntxt.recordSetState) {
      console.log('TRUE');
      setSets(Object.keys(cntxt.recordSetState).sort());
    }
    console.dir(sets);
  }, [cntxt.recordSetState]);

  return useMemo(() => {
    return (
      <>
        {sets ? (
          //Object.keys(sets).map((recordSetName, index) => {
          sets.map((recordSetName, index) => {
            console.log(['1', '2'].includes(recordSetName));
            return (
              <RecordSet
                key={index}
                canRemove={['1', '2'].includes(recordSetName) ? false : true}
                setName={recordSetName}
              />
            );
          })
        ) : (
          <></>
        )}
      </>
    );
    //}, [JSON.stringify(cntxt.recordSetState)]);
  }, [sets]);
};

const ActivitiesPage: React.FC<IStatusPageProps> = (props) => {
  const dataAccess = useDataAccess();
  const history = useHistory();

  // main page component - moved everything in here so it could be wrapped in a context local to this page.
  const PageContainer = (props) => {
    // record to act on and context for all children dealing with record sets, types, and filters
    const [selectedRecord, setSelectedRecord] = useState<any>({});
    const recordStateContext = useContext(RecordSetContext);
    const [warningDialog, setWarningDialog] = useState<IWarningDialog>({
      dialogActions: [],
      dialogOpen: false,
      dialogTitle: '',
      dialogContentText: null
    });

    // the menu at the bottom:
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
          }
        },
        {
          name: 'New Record',
          hidden: false,
          disabled: false,
          icon: AddIcon,
          onClick: () => {
            setWarningDialog({
              dialogOpen: true,
              dialogTitle: 'New Record',
              dialogContentText: 'Choose a record type',
              dialogActions: [
                {
                  actionName: 'Cancel',
                  actionOnClick: async () => {
                    setWarningDialog({ ...warningDialog, dialogOpen: false });
                  }
                },
                {
                  actionName: 'Select and Create',
                  usesChildren: true,
                  children: <NewRecordWizard />,
                  actionOnClick: async () => {},
                  autoFocus: true
                }
              ]
            });
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

          {/*the main list of record sets:*/}
          <Container maxWidth={false} style={{ maxHeight: '100%' }} className={props.originalActivityPageClassName}>
            <Grid container xs={12} height="50px" display="flex" justifyContent="left">
              <Grid sx={{ pb: 15 }} xs={12} item>
                {props.children}
              </Grid>
              <Grid sx={{ pb: 15 }} xs={12} item></Grid>
            </Grid>
          </Container>
          <WarningDialog
            dialogOpen={warningDialog.dialogOpen}
            dialogTitle={warningDialog.dialogTitle}
            dialogActions={warningDialog.dialogActions}
            dialogContentText={warningDialog.dialogContentText}
          />
        </>
      );
      //  }, [JSON.stringify(options)]);
    }, [options, warningDialog]);
  };

  const MemoPageContainer = React.memo(PageContainer);

  return (
    <Box sx={{ height: '100%' }}>
      <RecordSetProvider>
        <MemoPageContainer originalActivityPageClassName={props.classes.container}>
          <RecordSetRenderer />
        </MemoPageContainer>
      </RecordSetProvider>
    </Box>
  );
};

export default ActivitiesPage;

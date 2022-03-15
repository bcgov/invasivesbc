import AddIcon from '@mui/icons-material/Add';
import { useHistory } from 'react-router';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import CropFreeIcon from '@mui/icons-material/CropFree';
import { Box, Container, Grid } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import MapIcon from '@mui/icons-material/Map';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { IWarningDialog, WarningDialog } from 'components/dialog/WarningDialog';

import { useDataAccess } from 'hooks/useDataAccess';
import MenuOptions from './MenuOptions';
import { RecordSetRenderer } from './activityRecordset/RecordSetRenderer';
import { RecordSetContext, RecordSetProvider } from 'contexts/recordSetContext';
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
    }, [recordStateContext.recordSetState.length]);

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
      //nfg: }, [JSON.stringify(options)]);
      //nfg: }, [options, warningDialog, recordStateContext.length]);
      //nfg: }, [options, warningDialog, recordStateContext.recordSetState.length]);
    }, [options, warningDialog, recordStateContext.recordSetState.length]);
  };

  const MemoPageContainer = React.memo(PageContainer);

  return (
    <Box sx={{ height: '100%' }}>
      <RecordSetProvider>
        {/*}        <MemoPageContainer originalActivityPageClassName={props.classes.container}>
          <RecordSetRenderer />
            </MemoPageContainer>*/}
        <PageContainer originalActivityPageClassName={props.classes.container}>
          <RecordSetRenderer />
        </PageContainer>
      </RecordSetProvider>
    </Box>
  );
};

export default ActivitiesPage;

import AddIcon from '@mui/icons-material/Add';
import { useHistory } from 'react-router';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import CropFreeIcon from '@mui/icons-material/CropFree';
import { Box, Container, Grid } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import MapIcon from '@mui/icons-material/Map';
import React, { useContext, useEffect, useMemo, useState } from 'react';

import { useDataAccess } from 'hooks/useDataAccess';
import MenuOptions from './MenuOptions';
import { RecordSetRenderer } from './activityRecordset/RecordSetRenderer';
import { RecordSetContext, RecordSetProvider } from '../../../contexts/recordSetContext';
import NewRecordDialog, { INewRecordDialog } from 'components/activities-list/Tables/NewRecordDialog';

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
    const recordStateContext = useContext(RecordSetContext);

    const handleNewRecordDialogClose = () => {
      setNewRecordDialog((prev) => ({ ...prev, dialogOpen: false }));
    };

    const [newRecordDialog, setNewRecordDialog] = useState<INewRecordDialog>({
      dialogOpen: false,
      handleDialogClose: handleNewRecordDialogClose
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
            setNewRecordDialog((prev) => ({ ...prev, dialogOpen: true }));
          }
        },
        {
          name:
            'Open' +
            (recordStateContext.selectedRecord?.description !== undefined
              ? recordStateContext.selectedRecord?.description
              : ''),
          disabled: !(recordStateContext.selectedRecord?.description !== undefined),
          hidden: !recordStateContext.selectedRecord,
          onClick: async () => {
            try {
              await dataAccess.setAppState({ activeActivity: recordStateContext?.selectedRecord?.id });
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
    }, [recordStateContext.recordSetState.length, recordStateContext?.selectedRecord?.id]);

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
          <NewRecordDialog
            dialogOpen={newRecordDialog.dialogOpen}
            handleDialogClose={newRecordDialog.handleDialogClose}
          />
        </>
      );
    }, [options, newRecordDialog, recordStateContext.recordSetState.length, recordStateContext?.selectedRecord]);
  };
  return (
    <Box sx={{ height: '100%' }}>
      <RecordSetProvider>
        <PageContainer originalActivityPageClassName={props.classes.container}>
          <RecordSetRenderer />
        </PageContainer>
      </RecordSetProvider>
    </Box>
  );
};

export default ActivitiesPage;

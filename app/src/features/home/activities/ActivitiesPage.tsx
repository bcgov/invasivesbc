import AddIcon from '@mui/icons-material/Add';
import { useHistory } from 'react-router';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import CropFreeIcon from '@mui/icons-material/CropFree';
import { Box, Button, Container, Theme } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import MapIcon from '@mui/icons-material/Map';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import { useDataAccess } from 'hooks/useDataAccess';
import MenuOptions from './MenuOptions';
import { RecordSetRenderer } from './activityRecordset/RecordSetRenderer';
import { RecordSetContext, RecordSetProvider } from '../../../contexts/recordSetContext';
import NewRecordDialog, { INewRecordDialog } from 'components/activities-list/Tables/NewRecordDialog';
import MapContainer from 'components/map/MapContainer';
import { MapRecordsContextProvider } from 'contexts/MapRecordsContext';
import makeStyles from '@mui/styles/makeStyles';
import { RecordSetLayersRenderer } from 'components/map/LayerLoaderHelpers/RecordSetLayersRenderer';
import { IGeneralDialog, GeneralDialog } from '../../../components/dialog/GeneralDialog';

// not sure what we're using this for?
interface IStatusPageProps {
  classes?: any;
}

const useStyles = makeStyles((theme: Theme) => ({
  pageContainer: {
    height: '100%',
    width: '100%',
    display: 'flex',
    oberflow: 'hidden',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    gap: 0,
    padding: 0
  },
  toggleButtonContainer: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    position: 'relative',
    height: 0,
    transform: 'translateY(-100%)',
    zIndex: 1000
  },
  toggleButton: {
    position: 'absolute',
    top: '-37px',
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    background: theme.palette.background.default,
    boxShadow: 'none',
    '&:hover': {
      background: 'skyblue'
    }
  },
  mapContainer: {
    flex: 1,
    transition: 'height 0.3s ease-in-out'
  },
  recordSetContainer: { flex: 1 },
  map: {
    height: '100%',
    width: '100%',
    zIndex: 0
  }
}));

const ActivitiesPage: React.FC<IStatusPageProps> = (props) => {
  const classes = useStyles();

  return (
    <RecordSetProvider>
      <PageContainer originalActivityPageClassName={classes.pageContainer} />
    </RecordSetProvider>
  );
};

// main page component - moved everything in here so it could be wrapped in a context local to this page.
const PageContainer = (props) => {
  const dataAccess = useDataAccess();
  const history = useHistory();
  const recordStateContext = useContext(RecordSetContext);
  const [geometry, setGeometry] = useState<any[]>([]);
  const [showDrawControls, setShowDrawControls] = useState<boolean>(false);
  const classes = useStyles();
  const [recordsExpanded, setRecordsExpanded] = useState(false);
  const [width, setWidth] = React.useState(window.innerWidth);
  const [height, setHeight] = React.useState(window.innerHeight);

  const updateWidth = () => {
    setWidth(window.innerWidth);
  };

  const updateHeight = () => {
    setHeight(window.innerHeight);
  };

  const handleNewRecordDialogClose = () => {
    setNewRecordDialog((prev) => ({ ...prev, dialogOpen: false }));
  };

  const [newRecordDialog, setNewRecordDialog] = useState<INewRecordDialog>({
    dialogOpen: false,
    handleDialogClose: handleNewRecordDialogClose
  });

  const [newLayerDialog, setNewLayerDialog] = useState<IGeneralDialog>({
    dialogActions: [],
    dialogOpen: false,
    dialogTitle: '',
    dialogContentText: null
  });

  useEffect(() => {
    const updateDimensions = () => {
      updateWidth();
      // updateHeight();
    };
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateWidth);
  });

  // the menu at the bottom:
  const [options, setOptions] = useState<any>();
  useEffect(() => {
    setOptions([
      {
        name: 'Current window only',
        hidden: false,
        disabled: false,
        icon: (props) => {
          return (
            <>
              <FilterListIcon />
              <MapIcon />
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
          setNewLayerDialog({
            dialogOpen: true,
            dialogTitle: 'Create New Record List/Layer',
            dialogContentText: 'Would you like to create the layer with IAPP records or activites?',
            dialogActions: [
              {
                actionName: 'IAPP',
                actionOnClick: async () => {
                  setNewLayerDialog({ ...newLayerDialog, dialogOpen: false });
                  recordStateContext.add('POI');
                }
              },
              {
                actionName: 'Activity',
                actionOnClick: async () => {
                  setNewLayerDialog({ ...newLayerDialog, dialogOpen: false });
                  recordStateContext.add('Activity');
                },
                autoFocus: true
              }
            ]
          });
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
          'Open ' +
          (recordStateContext.selectedRecord?.description !== undefined &&
            recordStateContext.selectedRecord?.description),
        disabled: recordStateContext.selectedRecord?.description === undefined,
        hidden: !recordStateContext.selectedRecord,
        onClick: async () => {
          try {
            await dataAccess.setAppState({ activeActivity: recordStateContext?.selectedRecord?.id });
          } catch (e) {
            console.log('unable to http ');
            console.log(e);
          }
          setTimeout(() => {
            if (recordStateContext?.selectedRecord?.isIAPP) {
              history.push({ pathname: `/home/iapp/${recordStateContext?.selectedRecord?.id}` });
            } else {
              history.push({ pathname: `/home/activity` });
            }
          }, 1000);
        }
      }
    ]);
  }, [recordStateContext?.recordSetState?.length, recordStateContext?.selectedRecord?.id]);

  /* set up main menu bar options: */
  return (
    <>
      {/*the main list of record sets:*/}
      <Box
        style={{
          height: recordsExpanded ? 'calc(100% - 400px)' : '91.5%'
        }}>
        <MapRecordsContextProvider>
          <MapContainer
            classes={classes}
            showDrawControls={showDrawControls}
            setShowDrawControls={setShowDrawControls}
            showBoundaryMenu={true}
            center={[55, -128]}
            zoom={5}
            mapId={'mainMap'}
            geometryState={{ geometry, setGeometry }}>
            <RecordSetLayersRenderer />
          </MapContainer>
        </MapRecordsContextProvider>
      </Box>
      <Box>
        <Box className={classes.toggleButtonContainer}>
          <Button
            id="show-records-tab"
            className={classes.toggleButton}
            color={'warning'}
            onClick={(e) => {
              e.stopPropagation();
              setRecordsExpanded((prev) => !prev);
            }}
            variant={'contained'}
            endIcon={
              <ArrowDropUpIcon
                style={{
                  transition: 'transform 200ms ease-in-out',
                  transform: recordsExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
                }}
              />
            }>
            Show Records
          </Button>
        </Box>
        <MenuOptions
          sx={{
            backgroundColor: '#223f75',
            width: '100%',
            padding: '5px',
            height: 'auto',
            flexWrap: 'wrap',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'start'
          }}
          listSX={{ width: 'auto' }}
          options={options}
        />
        {useMemo(
          () => (
            <RecordSetRenderer />
          ),
          [recordStateContext?.recordSetState?.length, recordStateContext?.selectedRecord]
        )}
      </Box>
      <NewRecordDialog dialogOpen={newRecordDialog.dialogOpen} handleDialogClose={newRecordDialog.handleDialogClose} />
      <GeneralDialog
        dialogOpen={newLayerDialog.dialogOpen}
        dialogTitle={newLayerDialog.dialogTitle}
        dialogActions={newLayerDialog.dialogActions}
        dialogContentText={newLayerDialog.dialogContentText}
      />
    </>
  );
};

export default ActivitiesPage;

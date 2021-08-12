import {
  Box,
  Button,
  Checkbox,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  makeStyles,
  Paper,
  SvgIcon,
  Theme,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel
} from '@material-ui/core';
import { Add, DeleteForever, Sync } from '@material-ui/icons';
import clsx from 'clsx';
import {
  ActivitySubtype,
  ActivitySyncStatus,
  ActivityType,
  ActivityTypeIcon,
  FormValidationStatus,
  ActivitySubtypeShortLabels
} from 'constants/activities';
import { DocType } from 'constants/database';
import { DatabaseChangesContext } from 'contexts/DatabaseChangesContext';
import { DatabaseContext } from 'contexts/DatabaseContext';
import { useInvasivesApi } from 'hooks/useInvasivesApi';
import React, { useContext, useEffect, useState, useCallback } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import { useHistory } from 'react-router-dom';
import 'styles/spinners.scss';
import { notifyError, notifySuccess, notifyWarning } from 'utils/NotificationUtils';
import ActivityListDate from './ActivityListDate';
import { getErrorMessages } from 'utils/errorHandling';
import { addNewActivityToDB } from 'utils/addActivity';
import WarningDialog from 'components/common/WarningDialog';
import {
  MyObservationsTable,
  MyTreatmentsTable,
  MyMonitoringTable,
  MyAnimalActivitiesTable,
  MyTransectsTable,
  ReviewActivitiesTable,
  MyAdditionalBiocontrolActivitiesTable,
  MyPastActivitiesTable
} from 'components/common/RecordTables';
import { DatabaseContext2, query, QueryType } from 'contexts/DatabaseContext2';
import { useDataAccess } from 'hooks/useDataAccess';
import { Capacitor } from '@capacitor/core';

const useStyles = makeStyles((theme: Theme) => ({
  newActivityButtonsRow: {
    '& Button': {
      marginRight: '0.5rem',
      marginBottom: '0.5rem'
    }
  },
  syncSuccessful: {
    color: theme.palette.success.main
  },
  syncFailed: {
    color: theme.palette.error.main
  },
  activitiyListItem: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: '0.5rem',
    marginBottom: '0.5rem',
    border: '1px solid',
    borderColor: theme.palette.grey[300],
    borderRadius: '6px'
  },
  activityListItem_Grid: {
    flexDirection: 'row',
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column'
    }
  },
  activitiyListItem_Typography: {
    [theme.breakpoints.down('sm')]: {
      display: 'inline',
      marginRight: '1rem'
    }
  },
  formControl: {
    marginRight: 20,
    minWidth: 150
  }
}));

interface IActivityListItem {
  isDisabled?: boolean;
  activity: any;
}

const ActivityListItem: React.FC<IActivityListItem> = (props) => {
  const classes = useStyles();

  const databaseContext = useContext(DatabaseContext);
  const invasivesApi = useInvasivesApi();
  const [species, setSpecies] = useState(null);

  useEffect(() => {
    getSpeciesFromActivity();
  }, []);

  /*
    Function to get the species for a given activity and set it in state
    for usage and display in the activities grid
  */
  const getSpeciesFromActivity = async () => {
    /*
      Temporarily only enabled for plant terrestrial observation subtype
    */
    if (props.activity.activitySubtype !== 'Activity_Observation_PlantTerrestrial') {
      return;
    }

    const speciesCode = props.activity.formData?.activity_subtype_data?.invasive_plant_code;

    if (speciesCode) {
      const codeResults = await invasivesApi.getSpeciesDetails([speciesCode]);

      setSpecies(codeResults[0].code_description);
    }
  };

  const toggleActivitySyncReadyStatus = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    event.stopPropagation();

    // Must save the value because the database call is async, and the event object will be destroyed before it runs.
    const isChecked = event.target.checked;

    databaseContext.database.upsert(props.activity._id, (activity) => {
      return { ...activity, sync: { ...activity.sync, ready: isChecked } };
    });
  };

  const isDisabled = props.isDisabled || props.activity.sync.status === ActivitySyncStatus.SAVE_SUCCESSFUL;

  return (
    <Grid className={classes.activityListItem_Grid} container spacing={2}>
      <Divider flexItem={true} orientation="vertical" />
      <Grid item md={2}>
        <Box overflow="hidden" textOverflow="ellipsis" title={props.activity.activitySubtype.split('_')[2]}>
          <Typography className={classes.activitiyListItem_Typography}>Subtype</Typography>
          {props.activity.activitySubtype.split('_')[2]}
        </Box>
      </Grid>
      {species && (
        <>
          <Divider flexItem={true} orientation="vertical" />
          <Grid item md={2}>
            <Box overflow="hidden" textOverflow="ellipsis" title={species}>
              <Typography className={classes.activitiyListItem_Typography}>Species</Typography>
              {species}
            </Box>
          </Grid>
        </>
      )}
      <Divider flexItem={true} orientation="vertical" />
      <Grid item md={1}>
        <Typography variant="h6" className={classes.activitiyListItem_Typography}>
          Form Status
        </Typography>
        {props.activity.formStatus}
      </Grid>
      <Divider flexItem={true} orientation="vertical" />
      <Grid item md={species ? 1 : 2}>
        <Typography className={classes.activitiyListItem_Typography}>Save Status</Typography>
        {props.activity.sync.status}
      </Grid>
      <ActivityListDate classes={classes} activity={props.activity} />
      <Divider flexItem={true} orientation="vertical" />
      <Grid item md={species ? 1 : 2}>
        <Typography className={classes.activitiyListItem_Typography}>Reviewed</Typography>
        <Checkbox
          disabled={isDisabled}
          checked={props.activity.sync.ready}
          onChange={(event) => toggleActivitySyncReadyStatus(event)}
          onClick={(event) => event.stopPropagation()}
        />
      </Grid>
    </Grid>
  );
};

interface IActivityList {
  classes?: any;
  isDisabled?: boolean;
  activityType: ActivityType;
  workflowFunction: string;
}

// TODO change any to a type that defines the overall items being displayed
// const ActivityList: React.FC<IActivityList> = (props) => {
//   const classes = useStyles();

//   const history = useHistory();

//   const databaseContext = useContext(DatabaseContext);
//   const databaseContext2 = useContext(DatabaseContext2);
//   const databaseChangesContext = useContext(DatabaseChangesContext);
//   const dataAccess = useDataAccess();
//   const [docs, setDocs] = useState<any[]>([]);
//   const [docToDelete, setDocToDelete] = useState(null);
//   const [isWarningDialogOpen, setIsWarningDialogOpen] = useState(false);

//   const updateActivityList = useCallback(async () => {
//     if (Capacitor.getPlatform() === 'web') {
//       const activityResult = await databaseContext.database.find({
//         selector: { docType: DocType.ACTIVITY, activityType: props.activityType },
//         use_index: 'activitiesIndex'
//       });
//       setDocs([...activityResult.docs]);
//     } else {
//       const activityResult = dataAccess.getActivities({}, databaseContext2, true);
//       console.dir(activityResult);
//     }
//   }, [databaseContext.database, databaseContext2, props.activityType]);

//   useEffect(() => {
//     const updateComponent = () => {
//       updateActivityList();
//     };

//     updateComponent();
//   }, [databaseChangesContext, updateActivityList]);

//   const removeActivity = async (activity: PouchDB.Core.RemoveDocument) => {
//     databaseContext.database.remove(activity);
//   };

//   const setActiveActivityAndNavigateToActivityPage = async (doc: any) => {
//     /*j await databaseContext.database.upsert(DocType.APPSTATE, (appStateDoc) => {
//       return { ...appStateDoc, activeActivity: doc._id };
//     });*/
//     console.log('PRINTING doc');
//     console.log(JSON.stringify(doc));
//     await dataAccess.setAppState({ activeActivity: doc._id }, databaseContext2);
//     alert(JSON.stringify(doc));
//     if (doc.activityType === 'Observation') {
//       history.push({
//         pathname: `/home/activity`,
//         search: '?observation=' + doc._id,
//         state: { observation: doc._id }
//       });
//     } else {
//       history.push('/home/activity');
//     }
//   };

//   // Sort activities to show most recently updated activities at top of list
//   const sortedActivities = docs.sort((a, b): any => {
//     return new Date(b.dateUpdated).valueOf() - new Date(a.dateUpdated).valueOf();
//   });

//   return (
//     <List>
//       {sortedActivities.map((doc) => {
//         const isDisabled = props.isDisabled || doc.sync.status === ActivitySyncStatus.SAVE_SUCCESSFUL;

//         if (
//           !doc.activitySubtype.includes(props.workflowFunction) &&
//           !['Transect', 'Dispersal', 'Collection'].includes(doc.activityType)
//         ) {
//           return null;
//         }

//         return (
//           <Paper key={doc._id}>
//             <ListItem
//               button
//               className={classes.activitiyListItem}
//               onClick={() => setActiveActivityAndNavigateToActivityPage(doc)}>
//               <ListItemIcon>
//                 <SvgIcon
//                   fontSize="large"
//                   className={clsx(
//                     (doc.sync.status === ActivitySyncStatus.SAVE_SUCCESSFUL && classes.syncSuccessful) ||
//                       (doc.sync.status === ActivitySyncStatus.SAVE_FAILED && classes.syncFailed)
//                   )}
//                   component={ActivityTypeIcon[props.activityType]}
//                 />
//               </ListItemIcon>
//               <ActivityListItem isDisabled={props.isDisabled} activity={doc} />
//               <ListItemSecondaryAction>
//                 <IconButton
//                   disabled={isDisabled}
//                   onClick={() => {
//                     setDocToDelete(doc);
//                     setIsWarningDialogOpen(true);
//                   }}>
//                   <DeleteForever />
//                 </IconButton>
//               </ListItemSecondaryAction>
//             </ListItem>
//             <WarningDialog
//               isOpen={isWarningDialogOpen}
//               handleDisagree={() => setIsWarningDialogOpen(false)}
//               handleAgree={async () => {
//                 await removeActivity(docToDelete);
//                 setIsWarningDialogOpen(false);
//               }}
//               heading="Delete Activity?"
//               message="Are you sure you would like to delete this activity? Once deleted, this activity cannot be recovered"
//             />
//           </Paper>
//         );
//       })}
//     </List>
//   );
// };

const ActivitiesList: React.FC = () => {
  const classes = useStyles();

  const databaseContext = useContext(DatabaseContext);
  const databaseContext2 = useContext(DatabaseContext2);
  const invasivesApi = useInvasivesApi();
  const { keycloak } = useKeycloak();
  useEffect(() => {
    const userId = async () => {
      const userInfo: any = keycloak
        ? keycloak?.userInfo
        : await query({ type: QueryType.DOC_TYPE_AND_ID, docType: DocType.KEYCLOAK, ID: '1' }, databaseContext2);
      return userInfo?.preferred_username;
    };
    if (!userId) throw "Keycloak error: can not get current user's username";
  }, []);

  const [syncing, setSyncing] = useState(false);
  const [isDisabled, setIsDisable] = useState(false);
  const [workflowFunction, setWorkflowFunction] = useState('Plant');

  // const syncActivities = async () => {
  //   setIsDisable(true);
  //   setSyncing(true);

  //   // fetch all activity documents that are ready to sync
  //   const activityResult = await databaseContext.database.find({
  //     selector: {
  //       docType: DocType.ACTIVITY,
  //       formStatus: FormValidationStatus.VALID,
  //       'sync.ready': true,
  //       'sync.status': { $ne: ActivitySyncStatus.SAVE_SUCCESSFUL }
  //     },
  //     use_index: 'formStatusIndex'
  //   });

  //   let errorMessages = [];

  //   // sync each activity one-by-one
  //   for (const activity of activityResult.docs) {
  //     try {
  //       await invasivesApi.createActivity({
  //         activity_id: activity.activityId,
  //         created_timestamp: activity.dateCreated,
  //         activity_type: activity.activityType,
  //         activity_subtype: activity.activitySubtype,
  //         geometry: activity.geometry,
  //         media:
  //           activity.photos &&
  //           activity.photos.map((photo) => {
  //             return { file_name: photo.filepath, encoded_file: photo.dataUrl, description: photo.description };
  //           }),
  //         form_data: activity.formData
  //       });

  //       notifySuccess(databaseContext, `Syncing ${activity.activitySubtype.split('_')[2]} activity has succeeded.`);

  //       await databaseContext.database.upsert(activity._id, (activityDoc) => {
  //         return {
  //           ...activityDoc,
  //           sync: { ...activityDoc.sync, status: ActivitySyncStatus.SAVE_SUCCESSFUL, error: null }
  //         };
  //       });
  //     } catch (error) {
  //       notifyError(databaseContext, JSON.stringify(error));
  //       alert(JSON.stringify(error));
  //       const errorMessage = getErrorMessages(error.response.status, 'formSync');

  //       errorMessages.push(`Syncing ${activity.activitySubtype.split('_')[2]} activity has failed: ${errorMessage}`);

  //       await databaseContext.database.upsert(activity._id, (activityDoc) => {
  //         return {
  //           ...activityDoc,
  //           sync: { ...activityDoc.sync, status: ActivitySyncStatus.SAVE_FAILED, error: error.message }
  //         };
  //       });
  //     }
  //   }

  //   errorMessages.forEach((err: string) => {
  //     notifyError(databaseContext, err);
  //   });

  //   setSyncing(false);
  //   setIsDisable(false);
  // };

  const handleWorkflowFunctionChange = (event: any) => {
    setWorkflowFunction(event.target.value);
  };

  return (
    <>
      <Box>
        <Box mb={3} display="flex" justifyContent="space-between">
          <FormControl variant="outlined" className={classes.formControl}>
            <InputLabel>Workflow Functions</InputLabel>
            <Select value={workflowFunction} onChange={handleWorkflowFunctionChange} label="Select Form Type">
              <MenuItem value="Plant">Plant</MenuItem>
              <MenuItem value="Animal">Animal</MenuItem>
              <MenuItem value="Review">Review</MenuItem>
              <MenuItem value="Past Activities">Past Activities</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box>
          {workflowFunction === 'Plant' && (
            <Box>
              <MyObservationsTable />
              {/* <MyTreatmentsTable />
              <MyMonitoringTable />
              <MyTransectsTable />
              <MyAdditionalBiocontrolActivitiesTable /> */}
            </Box>
          )}
          {workflowFunction === 'Animal' && (
            <Box>
              <MyAnimalActivitiesTable />
            </Box>
          )}
          {workflowFunction === 'Review' && (
            <Box>
              <ReviewActivitiesTable />
            </Box>
          )}
          {workflowFunction === 'Past Activities' && (
            <Box>
              <MyPastActivitiesTable />
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
};

export default ActivitiesList;

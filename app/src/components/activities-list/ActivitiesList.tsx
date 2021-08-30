import {
  Box,
  Checkbox,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  makeStyles,
  MenuItem,
  Select,
  Theme,
  Typography
} from '@material-ui/core';
import { ActivitySyncStatus, ActivityType } from 'constants/activities';
import { DocType } from 'constants/database';
import { DatabaseContext } from '../../contexts/DatabaseContext';
import { useInvasivesApi } from '../../hooks/useInvasivesApi';
import React, { useContext, useEffect, useState } from 'react';
import { useKeycloak } from '@react-keycloak/web';
import '../../styles/spinners.scss';
import ActivityListDate from './ActivityListDate';
import {
  MyAdditionalBiocontrolActivitiesTable,
  MyAnimalActivitiesTable,
  MyFREPTable,
  MyMonitoringTable,
  MyObservationsTable,
  MyPastActivitiesTable,
  MyTransectsTable,
  MyTreatmentsTable,
  ReviewActivitiesTable
} from '../../components/common/RecordTables';
import { DatabaseContext2, query, QueryType } from '../../contexts/DatabaseContext2';
import BatchUpload from '../../components/batch-upload/BatchUpload';

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

const ActivitiesList: React.FC = () => {
  const classes = useStyles();

  const databaseContext = useContext(DatabaseContext2);
  const { keycloak } = useKeycloak();
  useEffect(() => {
    const userId = async () => {
      const userInfo: any = keycloak
        ? keycloak?.userInfo
        : await query({ type: QueryType.DOC_TYPE_AND_ID, docType: DocType.KEYCLOAK, ID: '1' }, databaseContext);
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
              <MenuItem value="FREP">FREP</MenuItem>
              <MenuItem value="Review">Review</MenuItem>
              <MenuItem value="Past Activities">Past Activities</MenuItem>
              <MenuItem value="Batch Upload">Batch Upload</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box>
          {workflowFunction === 'Plant' && (
            <Box>
              <MyObservationsTable />
              <MyTreatmentsTable />
              <MyMonitoringTable />
              <MyTransectsTable />
              <MyAdditionalBiocontrolActivitiesTable />
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
          {workflowFunction === 'FREP' && (
            <Box>
              <MyFREPTable />
            </Box>
          )}
          {workflowFunction === 'Past Activities' && (
            <Box>
              <MyPastActivitiesTable />
            </Box>
          )}
          {workflowFunction === 'Batch Upload' && (
            <Box>
              <BatchUpload />
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
};

export default ActivitiesList;

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';

import makeStyles from '@mui/styles/makeStyles';
import { useKeycloak } from '@react-keycloak/web';
import { ActivitySyncStatus, ActivityType } from 'constants/activities';
import { DocType } from 'constants/database';
import React, { useContext, useEffect, useState } from 'react';
import BatchUpload from '../../components/batch-upload/BatchUpload';
import {
  MyAnimalActivitiesTable,
  MyAnimalMonitoringTable,
  MyAnimalTreatmentsTable,
  MyBiocontrolTable,
  MyFREPTable,
  MyObservationsTable,
  MyPastActivitiesTable,
  MyPlantMonitoringTable,
  MyPlantTreatmentsTable,
  ReviewActivitiesTable
} from '../../components/common/RecordTables';
import { DatabaseContext, query, QueryType } from '../../contexts/DatabaseContext';
import Sync from '@mui/icons-material/Sync';
import { IonAlert } from '@ionic/react';
import { Capacitor } from '@capacitor/core';
import { useDataAccess } from 'hooks/useDataAccess';
import { NetworkContext } from 'contexts/NetworkContext';
import { useInvasivesApi } from 'hooks/useInvasivesApi';
import ActivityListDate from './ActivityListDate';
import { PointsOfInterestTable } from 'components/common/IAPPRecordTables';

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

  const invasivesApi = useInvasivesApi();
  const [species, setSpecies] = useState(null);

  useEffect(() => {
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

    getSpeciesFromActivity();
  }, [
    invasivesApi,
    props.activity.activitySubtype,
    props.activity.formData?.activity_subtype_data?.invasive_plant_code
  ]);

  const toggleActivitySyncReadyStatus = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    event.stopPropagation();
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

const ActivitiesList: React.FC<IActivityList> = () => {
  const classes = useStyles();
  const dataAccess = useDataAccess();

  // let hasPlantAccess = false;
  // let hasAnimalAccess = false;

  const databaseContext = useContext(DatabaseContext);
  const { keycloak } = useKeycloak();
  // let accessLevel = GetUserAccessLevel();
  // if (accessLevel.hasPlantAccess) {
  //   hasPlantAccess = true;
  // }
  // if (accessLevel.hasAnimalAccess) {
  //   hasAnimalAccess = true;
  // }
  useEffect(() => {
    const userId = async () => {
      const userInfo: any = keycloak
        ? keycloak?.userInfo
        : await databaseContext.asyncQueue({
            asyncTask: () => {
              return query({ type: QueryType.DOC_TYPE_AND_ID, docType: DocType.KEYCLOAK, ID: '1' }, databaseContext);
            }
          });

      return userInfo?.preferred_username;
    };
    if (!userId) throw new Error("Keycloak error: can not get current user's username");
  }, [databaseContext, keycloak]);

  const [workflowFunction, setWorkflowFunction] = useState('Plant');
  const [showAlert, setShowAlert] = useState(false);
  const networkContext = useContext(NetworkContext);

  const syncCachedActivities = async () => {
    try {
      await dataAccess.syncCachedRecords();
    } catch (e) {
      console.log('Error syncing cached records: ', e);
    }
  };

  const showPrompt = () => {
    setShowAlert(true);
  };

  const isMobile = () => {
    return Capacitor.getPlatform() !== 'web';
  };

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
      <IonAlert
        isOpen={showAlert}
        onDidDismiss={() => setShowAlert(false)}
        header={'Are you sure?'}
        message={'If you choose to sync your cached records, you will no longer be able to edit them.'}
        buttons={[
          {
            text: 'Cancel',
            role: 'cancel',
            cssClass: 'secondary',
            handler: () => {}
          },
          {
            text: 'Okay',
            handler: () => {
              syncCachedActivities();
            }
          }
        ]}
      />
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
              <MenuItem value="IAPP Data">IAPP Data</MenuItem>
            </Select>
          </FormControl>
          {isMobile() && networkContext.connected && (
            <Button onClick={showPrompt} key="sync" color="primary" variant="outlined" startIcon={<Sync />}>
              Sync Cached Records
            </Button>
          )}
        </Box>
        <Box>
          {workflowFunction === 'Plant' && (
            <Box>
              <MyObservationsTable />
              <MyPlantTreatmentsTable />
              <MyBiocontrolTable />
              <MyPlantMonitoringTable />
              {/* <MyTransectsTable /> TODO: Re-enable when transects back online */}
            </Box>
          )}
          {workflowFunction === 'Animal' && (
            <Box>
              <MyAnimalActivitiesTable />
              <MyAnimalTreatmentsTable />
              <MyAnimalMonitoringTable />
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
          {workflowFunction === 'IAPP Data' && (
            <Box>
              <PointsOfInterestTable />
            </Box>
          )}
        </Box>
      </Box>
    </>
  );
};

export default ActivitiesList;

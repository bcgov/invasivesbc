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
  FormValidationStatus
} from 'constants/activities';
import { DocType } from 'constants/database';
import { DatabaseChangesContext } from 'contexts/DatabaseChangesContext';
import { DatabaseContext } from 'contexts/DatabaseContext';
import { useInvasivesApi } from 'hooks/useInvasivesApi';
import React, { useContext, useEffect, useState, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import 'styles/spinners.scss';
import { notifyError, notifySuccess, notifyWarning } from 'utils/NotificationUtils';
import ActivityListDate from './ActivityListDate';
import { getErrorMessages } from 'utils/errorHandling';
import { addNewActivityToDB } from 'utils/addActivity';

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

  const isDisabled = props.isDisabled || props.activity.sync.status === ActivitySyncStatus.SYNC_SUCCESSFUL;

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
        <Typography className={classes.activitiyListItem_Typography}>Sync Status</Typography>
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
const ActivityList: React.FC<IActivityList> = (props) => {
  const classes = useStyles();

  const history = useHistory();

  const databaseContext = useContext(DatabaseContext);
  const databaseChangesContext = useContext(DatabaseChangesContext);

  const [docs, setDocs] = useState<any[]>([]);

  const updateActivityList = useCallback(async () => {
    const activityResult = await databaseContext.database.find({
      selector: { docType: DocType.ACTIVITY, activityType: props.activityType }
    });

    setDocs([...activityResult.docs]);
  }, [databaseContext.database, props.activityType]);

  useEffect(() => {
    const updateComponent = () => {
      updateActivityList();
    };

    updateComponent();
  }, [databaseChangesContext, updateActivityList]);

  const removeActivity = async (activity: PouchDB.Core.RemoveDocument) => {
    databaseContext.database.remove(activity);
  };

  const setActiveActivityAndNavigateToActivityPage = async (doc: any) => {
    await databaseContext.database.upsert(DocType.APPSTATE, (appStateDoc) => {
      return { ...appStateDoc, activeActivity: doc._id };
    });

    if (doc.activityType === 'Observation') {
      history.push({
        pathname: `/home/activity/observation`,
        search: '?observation=' + doc._id,
        state: { observation: doc._id }
      });
    } else {
      history.push('/home/activity');
    }
  };

  // Sort activities to show most recently updated activities at top of list
  const sortedActivities = docs.sort((a, b): any => {
    return new Date(b.dateUpdated).valueOf() - new Date(a.dateUpdated).valueOf();
  });

  return (
    <List>
      {sortedActivities.map((doc) => {
        const isDisabled = props.isDisabled || doc.sync.status === ActivitySyncStatus.SYNC_SUCCESSFUL;

        if (
          !doc.activitySubtype.includes(props.workflowFunction) &&
          !['Transect', 'Dispersal'].includes(doc.activityType)
        ) {
          return null;
        }

        return (
          <Paper key={doc._id}>
            <ListItem
              button
              className={classes.activitiyListItem}
              onClick={() => setActiveActivityAndNavigateToActivityPage(doc)}>
              <ListItemIcon>
                <SvgIcon
                  fontSize="large"
                  className={clsx(
                    (doc.sync.status === ActivitySyncStatus.SYNC_SUCCESSFUL && classes.syncSuccessful) ||
                      (doc.sync.status === ActivitySyncStatus.SYNC_FAILED && classes.syncFailed)
                  )}
                  component={ActivityTypeIcon[props.activityType]}
                />
              </ListItemIcon>
              <ActivityListItem isDisabled={props.isDisabled} activity={doc} />
              <ListItemSecondaryAction>
                <IconButton disabled={isDisabled} onClick={() => removeActivity(doc)}>
                  <DeleteForever />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          </Paper>
        );
      })}
    </List>
  );
};

const ActivitiesList: React.FC = () => {
  const classes = useStyles();

  const databaseContext = useContext(DatabaseContext);

  const invasivesApi = useInvasivesApi();

  const [syncing, setSyncing] = useState(false);
  const [isDisabled, setIsDisable] = useState(false);
  const [workflowFunction, setWorkflowFunction] = useState('Plant');

  const specialFunctions = [
    { label: 'Fire Monitoring', type: ActivitySubtype.Transect_FireMonitoring },
    { label: 'Invasive Plant Density Transects', type: ActivitySubtype.Transect_InvasivePlantDensity },
    { label: 'Vegetation Transect (Full Vegetation)', type: ActivitySubtype.Transect_FullVegetation },
    { label: 'Vegetation Transect (Lumped Species)', type: ActivitySubtype.Transect_LumpedSpeciesVegetation },
    { label: 'Biocontrol Efficacy', type: ActivitySubtype.Transect_BiocontrolEfficacy }
  ];

  const syncActivities = async () => {
    setIsDisable(true);
    setSyncing(true);

    // fetch all activity documents that are ready to sync
    const activityResult = await databaseContext.database.find({
      selector: {
        docType: DocType.ACTIVITY,
        formStatus: FormValidationStatus.VALID,
        'sync.ready': true,
        'sync.status': { $ne: ActivitySyncStatus.SYNC_SUCCESSFUL }
      }
    });

    let errorMessages = [];

    // sync each activity one-by-one
    for (const activity of activityResult.docs) {
      try {
        await invasivesApi.createActivity({
          activity_id: activity.activityId,
          created_timestamp: activity.dateCreated,
          activity_type: activity.activityType,
          activity_subtype: activity.activitySubtype,
          geometry: activity.geometry,
          media:
            activity.photos &&
            activity.photos.map((photo) => {
              return { file_name: photo.filepath, encoded_file: photo.dataUrl };
            }),
          form_data: activity.formData
        });

        notifySuccess(databaseContext, `Syncing ${activity.activitySubtype.split('_')[2]} activity has succeeded.`);

        await databaseContext.database.upsert(activity._id, (activityDoc) => {
          return {
            ...activityDoc,
            sync: { ...activityDoc.sync, status: ActivitySyncStatus.SYNC_SUCCESSFUL, error: null }
          };
        });
      } catch (error) {
        const errorMessage = getErrorMessages(error.response.status, 'formSync');

        errorMessages.push(`Syncing ${activity.activitySubtype.split('_')[2]} activity has failed: ${errorMessage}`);

        await databaseContext.database.upsert(activity._id, (activityDoc) => {
          return {
            ...activityDoc,
            sync: { ...activityDoc.sync, status: ActivitySyncStatus.SYNC_FAILED, error: error.message }
          };
        });
      }
    }

    errorMessages.forEach((err: string) => {
      notifyError(databaseContext, err);
    });

    setSyncing(false);
    setIsDisable(false);
  };

  const handleWorkflowFunctionChange = (event: any) => {
    setWorkflowFunction(event.target.value);
  };

  return (
    <>
      <Box>
        <Box mb={3} display="flex" justifyContent="space-between">
          <FormControl variant="outlined" className={classes.formControl}>
            <InputLabel>Workflow Functions</InputLabel>
            <Select value={workflowFunction} onChange={handleWorkflowFunctionChange} label="Select Workflow Function">
              <MenuItem value="Plant">Plant</MenuItem>
              <MenuItem value="Animal">Animal</MenuItem>
              <MenuItem value="Special">Special</MenuItem>
            </Select>
          </FormControl>
          <Button
            disabled={isDisabled}
            variant="contained"
            color="primary"
            startIcon={<Sync className={clsx(syncing && 'rotating')} />}
            onClick={() => syncActivities()}>
            Sync Activities
          </Button>
        </Box>
        <Box>
          {workflowFunction !== 'Special' && (
            <Box>
              <Box>
                {workflowFunction === 'Plant' && <Typography variant="h5">Observations</Typography>}
                {workflowFunction === 'Animal' && <Typography variant="h5">Activities</Typography>}
              </Box>
              <Box className={classes.newActivityButtonsRow}>
                {workflowFunction === 'Plant' && (
                  <>
                    <Button
                      disabled={isDisabled}
                      variant="contained"
                      startIcon={<Add />}
                      onClick={() =>
                        addNewActivityToDB(
                          databaseContext,
                          ActivityType.Observation,
                          ActivitySubtype.Observation_PlantTerrestrial
                        )
                      }>
                      Plant Terrestrial
                    </Button>
                    <Button
                      disabled={isDisabled}
                      variant="contained"
                      startIcon={<Add />}
                      onClick={() =>
                        addNewActivityToDB(
                          databaseContext,
                          ActivityType.Observation,
                          ActivitySubtype.Observation_PlantAquatic
                        )
                      }>
                      Plant Aquatic
                    </Button>
                  </>
                )}

                <ActivityList
                  workflowFunction={workflowFunction}
                  isDisabled={isDisabled}
                  activityType={ActivityType.Observation}
                />
              </Box>

              <Box className={classes.newActivityButtonsRow}>
                {workflowFunction === 'Animal' && (
                  <>
                    <Button
                      disabled={isDisabled}
                      variant="contained"
                      startIcon={<Add />}
                      onClick={() =>
                        addNewActivityToDB(
                          databaseContext,
                          ActivityType.AnimalActivity,
                          ActivitySubtype.Activity_AnimalTerrestrial
                        )
                      }>
                      Animal Terrestrial
                    </Button>
                    <Button
                      disabled={isDisabled}
                      variant="contained"
                      startIcon={<Add />}
                      onClick={() =>
                        addNewActivityToDB(
                          databaseContext,
                          ActivityType.AnimalActivity,
                          ActivitySubtype.Activity_AnimalAquatic
                        )
                      }>
                      Animal Aquatic
                    </Button>
                  </>
                )}

                <ActivityList
                  workflowFunction={workflowFunction}
                  isDisabled={isDisabled}
                  activityType={ActivityType.AnimalActivity}
                />
              </Box>
            </Box>
          )}
          {workflowFunction !== 'Special' && workflowFunction !== 'Animal' && (
            <Box>
              <Box>
                <Typography variant="h5">Treatments</Typography>
              </Box>
              <Box className={classes.newActivityButtonsRow}>
                <ActivityList
                  workflowFunction={workflowFunction}
                  isDisabled={isDisabled}
                  activityType={ActivityType.Treatment}
                />
              </Box>
            </Box>
          )}
          {workflowFunction !== 'Special' && workflowFunction !== 'Animal' && (
            <Box>
              <Box>
                <Typography variant="h5">Efficacy Monitorings</Typography>
              </Box>
              <ActivityList
                workflowFunction={workflowFunction}
                isDisabled={isDisabled}
                activityType={ActivityType.Monitoring}
              />
            </Box>
          )}
          {workflowFunction === 'Special' && (
            <>
              <Box>
                <Box>
                  <Typography variant="h5">Transects</Typography>
                </Box>
                <Box className={classes.newActivityButtonsRow}>
                  {specialFunctions.map((item) => (
                    <Button
                      key={item.label}
                      disabled={isDisabled}
                      variant="contained"
                      startIcon={<Add />}
                      onClick={() => {
                        addNewActivityToDB(databaseContext, ActivityType.Transect, item.type);
                      }}>
                      {item.label}
                    </Button>
                  ))}
                </Box>

                <ActivityList
                  workflowFunction={workflowFunction}
                  isDisabled={isDisabled}
                  activityType={ActivityType.Transect}
                />
              </Box>
              <br />
              <Box>
                <Box>
                  <Typography variant="h5">Dispersals</Typography>
                </Box>
                <Box className={classes.newActivityButtonsRow}>
                  <Button
                    disabled={isDisabled}
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => {
                      addNewActivityToDB(
                        databaseContext,
                        ActivityType.Dispersal,
                        ActivitySubtype.Activity_BiologicalDispersal
                      );
                    }}>
                    Biological Dispersal
                  </Button>
                </Box>

                <ActivityList
                  workflowFunction={workflowFunction}
                  isDisabled={isDisabled}
                  activityType={ActivityType.Dispersal}
                />
              </Box>
              <br />
              <Box>
                <Box>
                  <Typography variant="h5">Development/Testing</Typography>
                </Box>
                <Box className={classes.newActivityButtonsRow}>
                  <Button
                    disabled={isDisabled}
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => notifyError(databaseContext, 'An error message!')}>
                    Simulate Error
                  </Button>
                  <Button
                    disabled={isDisabled}
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => notifySuccess(databaseContext, 'A Success message!')}>
                    Simulate Success
                  </Button>
                  <Button
                    disabled={isDisabled}
                    variant="contained"
                    startIcon={<Add />}
                    onClick={() => notifyWarning(databaseContext, 'A Warning message!')}>
                    Simulate Warning
                  </Button>
                </Box>
              </Box>
            </>
          )}
        </Box>
      </Box>
    </>
  );
};

export default ActivitiesList;

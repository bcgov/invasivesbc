import {
  Box,
  Button,
  ButtonGroup,
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
  Typography
} from '@material-ui/core';
import { Add, DeleteForever, Sync } from '@material-ui/icons';
import clsx from 'clsx';
import {
  ActivityStatus,
  ActivitySyncStatus,
  ActivityParentType,
  ActivityType,
  ActivityParentTypeIcon
} from 'constants/activities';
import { DocType } from 'constants/database';
import { MediumDateFormat } from 'constants/misc';
import { DatabaseContext } from 'contexts/DatabaseContext';
import { useInvasivesApi } from 'hooks/useInvasivesApi';
import moment from 'moment';
import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Subscription } from 'rxjs';
import 'styles/spinners.scss';
import { notifyError, notifySuccess, notifyWarning, triggerError } from 'utils/NotificationUtils';
import { v4 as uuidv4 } from 'uuid';

const useStyles = makeStyles((theme: Theme) => ({
  activitiesContent: {},
  activityList: {},
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
  actionsBar: {
    display: 'flex',
    flexDirection: 'row-reverse',
    marginBottom: '2rem'
  }
}));

interface IActivityListItem {
  disable?: boolean;
  activity: any;
}

const ActivityListItem: React.FC<IActivityListItem> = (props) => {
  const classes = useStyles();

  const databaseContext = useContext(DatabaseContext);

  const toggleActivitySyncReadyStatus = (event: React.ChangeEvent<HTMLInputElement>) => {
    event.preventDefault();
    event.stopPropagation();

    // Must save the value because the database call is async, and the event object will be destroyed before it runs.
    const isChecked = event.target.checked;

    databaseContext.database.upsert(props.activity._id, (activity) => {
      return { ...activity, sync: { ...activity.sync, ready: isChecked } };
    });
  };

  const isDisabled = props.disable || props.activity.sync.status === ActivitySyncStatus.SYNC_SUCCESSFUL;

  return (
    <Grid className={classes.activityListItem_Grid} container spacing={2}>
      <Divider flexItem={true} orientation="vertical" />
      <Grid item md={2}>
        <Box overflow="hidden" textOverflow="ellipsis" title={props.activity.activityType.split('_')[2]}>
          <Typography className={classes.activitiyListItem_Typography}>Type</Typography>
          {props.activity.activityType.split('_')[2]}
        </Box>
      </Grid>
      <Divider flexItem={true} orientation="vertical" />
      <Grid item md={2}>
        <Typography className={classes.activitiyListItem_Typography}>Status</Typography>
        {props.activity.status}
      </Grid>
      <Divider flexItem={true} orientation="vertical" />
      <Grid item md={2}>
        <Typography className={classes.activitiyListItem_Typography}>Sync Status</Typography>
        {props.activity.sync.status}
      </Grid>
      <Divider flexItem={true} orientation="vertical" />
      <Grid item md={2}>
        <Typography className={classes.activitiyListItem_Typography}>Created</Typography>
        {moment(props.activity.dateCreated).format(MediumDateFormat)}
      </Grid>
      <Divider flexItem={true} orientation="vertical" />
      <Grid item md={2}>
        <Typography className={classes.activitiyListItem_Typography}>Last Updated</Typography>
        {(props.activity.dateUpdated && moment(props.activity.dateUpdated).format(MediumDateFormat)) || 'n/a'}
      </Grid>
      <Divider flexItem={true} orientation="vertical" />
      <Grid item md={1}>
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
  disable?: boolean;
  activityParentType: ActivityParentType;
}

// TODO change any to a type that defines the overall items being displayed
const ActivityList: React.FC<IActivityList> = (props) => {
  const classes = useStyles();

  const history = useHistory();

  const databaseContext = useContext(DatabaseContext);

  const [docs, setDocs] = useState<any[]>([]);

  const updateActivityList = async () => {
    const activityDocs = await databaseContext.database.find({
      selector: { activityParentType: props.activityParentType }
    });

    setDocs([...activityDocs.docs]);
  };

  useEffect(() => {
    const updateComponent = (): Subscription => {
      // initial update
      updateActivityList();

      // subscribe to changes and update list on emit
      const subscription = databaseContext.changes.subscribe(() => {
        updateActivityList();
      });

      // return subscription for use in cleanup
      return subscription;
    };

    const subscription = updateComponent();

    return () => {
      if (!subscription) {
        return;
      }

      // unsubscribe on cleanup
      subscription.unsubscribe();
    };
  }, [databaseContext]);

  const removeActivity = async (activity: PouchDB.Core.RemoveDocument) => {
    databaseContext.database.remove(activity);
  };

  const setActiveActivityAndNavigateToActivityPage = async (doc: any) => {
    await databaseContext.database.upsert('AppState', (appStateDoc) => {
      return { ...appStateDoc, activeActivity: doc._id };
    });

    history.push(`/home/activity`);
  };

  return (
    <List className={classes.activityList}>
      {docs.map((doc) => {
        const isDisabled = props.disable || doc.sync.status === ActivitySyncStatus.SYNC_SUCCESSFUL;

        return (
          <Paper elevation={1} key={doc._id}>
            <ListItem
              button
              // disabled={isDisabled}
              className={classes.activitiyListItem}
              onClick={() => setActiveActivityAndNavigateToActivityPage(doc)}>
              <ListItemIcon>
                <SvgIcon
                  fontSize="large"
                  className={clsx(
                    (doc.sync.status === ActivitySyncStatus.SYNC_SUCCESSFUL && classes.syncSuccessful) ||
                      (doc.sync.status === ActivitySyncStatus.SYNC_FAILED && classes.syncFailed)
                  )}
                  component={ActivityParentTypeIcon[props.activityParentType]}
                />
              </ListItemIcon>
              <ActivityListItem disable={props.disable} activity={doc} />
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

const ActivitiesList: React.FC = (props) => {
  const classes = useStyles();

  const databaseContext = useContext(DatabaseContext);

  const invasivesApi = useInvasivesApi();

  const [syncing, setSyncing] = useState(false);
  const [isDisabled, setIsDisable] = useState(false);

  const syncActivities = async () => {
    setIsDisable(true);
    setSyncing(true);

    // fetch all activity documents that are ready to sync
    const results = await databaseContext.database.find({
      selector: {
        docType: DocType.ACTIVITY,
        'sync.ready': true,
        'sync.status': { $ne: ActivitySyncStatus.SYNC_SUCCESSFUL }
      }
    });

    // save each activity one-by-one
    for (const activity of results.docs) {
      try {
        const response = await invasivesApi.createActivity({
          activity_type: activity.activityParentType,
          activity_subtype: activity.activityType,
          geometry: activity.geometry,
          media: [],
          form_data: activity.formData
        });

        await databaseContext.database.upsert(activity._id, (activityDoc) => {
          return {
            ...activityDoc,
            sync: { ...activityDoc.sync, status: ActivitySyncStatus.SYNC_SUCCESSFUL, error: null }
          };
        });
      } catch (error) {
        await databaseContext.database.upsert(activity._id, (activityDoc) => {
          return {
            ...activityDoc,
            sync: { ...activityDoc.sync, status: ActivitySyncStatus.SYNC_FAILED, error: error.message }
          };
        });
      }
    }

    setSyncing(false);
    setIsDisable(false);
  };

  const addNewActivity = async (activityParentType: ActivityParentType, activityType: ActivityType) => {
    await databaseContext.database.put({
      _id: uuidv4(),
      docType: DocType.ACTIVITY,
      activityParentType: activityParentType,
      activityType: activityType,
      status: ActivityStatus.NEW,
      sync: {
        ready: false,
        status: ActivitySyncStatus.NOT_SYNCED,
        error: null
      },
      dateCreated: new Date(),
      dateUpated: null,
      formData: null
    });
  };

  return (
    <>
      <div>
        <div className={classes.actionsBar}>
          <Button
            disabled={isDisabled}
            variant="contained"
            startIcon={<Sync className={clsx(syncing && 'rotating')} />}
            onClick={() => syncActivities()}>
            Sync Activities
          </Button>
        </div>
        <div className={classes.activitiesContent}>
          <div>
            <div>
              <Typography variant="h5">Observations</Typography>
            </div>
            <div className={classes.newActivityButtonsRow}>
              <Button
                disabled={isDisabled}
                variant="contained"
                startIcon={<Add />}
                onClick={() =>
                  addNewActivity(ActivityParentType.Observation, ActivityType.Observation_PlantTerrestial)
                }>
                Plant Terrestrial
              </Button>
              <Button
                disabled={isDisabled}
                variant="contained"
                startIcon={<Add />}
                onClick={() => addNewActivity(ActivityParentType.Observation, ActivityType.Observation_PlantAquatic)}>
                Plant Aquatic
              </Button>

              <Button
                disabled={isDisabled}
                variant="contained"
                startIcon={<Add />}
                onClick={() =>
                  addNewActivity(ActivityParentType.Observation, ActivityType.Observation_AnimalTerrestrial)
                }>
                Animal Terrestrial
              </Button>
              <Button
                disabled={isDisabled}
                variant="contained"
                startIcon={<Add />}
                onClick={() => addNewActivity(ActivityParentType.Observation, ActivityType.Observation_AnimalAquatic)}>
                Animal Aquatic
              </Button>

              <ActivityList disable={isDisabled} activityParentType={ActivityParentType.Observation} />
            </div>
          </div>
          <div>
            <div>
              <Typography variant="h5">Treatments</Typography>
            </div>
            <div className={classes.newActivityButtonsRow}>
              <Button
                disabled={isDisabled}
                variant="contained"
                startIcon={<Add />}
                onClick={() => addNewActivity(ActivityParentType.Treatment, ActivityType.Treatment_ChemicalPlant)}>
                Plant Chemical
              </Button>
              <Button
                disabled={isDisabled}
                variant="contained"
                startIcon={<Add />}
                onClick={() => addNewActivity(ActivityParentType.Treatment, ActivityType.Treatment_MechanicalPlant)}>
                Plant Mechanical
              </Button>
              <Button
                disabled={isDisabled}
                variant="contained"
                startIcon={<Add />}
                onClick={() => addNewActivity(ActivityParentType.Treatment, ActivityType.Treatment_BiologicalPlant)}>
                Plant Biological
              </Button>
              <Button
                disabled={isDisabled}
                variant="contained"
                startIcon={<Add />}
                onClick={() =>
                  addNewActivity(ActivityParentType.Treatment, ActivityType.Treatment_BiologicalDispersalPlant)
                }>
                Plant Biological Dispersal
              </Button>

              <Button
                disabled={isDisabled}
                variant="contained"
                startIcon={<Add />}
                onClick={() =>
                  addNewActivity(ActivityParentType.Treatment, ActivityType.Treatment_MechanicalTerrestrialAnimal)
                }>
                Animal Terrestrial Mechanical
              </Button>
              <Button
                disabled={isDisabled}
                variant="contained"
                startIcon={<Add />}
                onClick={() =>
                  addNewActivity(ActivityParentType.Treatment, ActivityType.Treatment_ChemicalTerrestrialAnimal)
                }>
                Animal Terrestrial Chemical
              </Button>
              <Button
                disabled={isDisabled}
                variant="contained"
                startIcon={<Add />}
                onClick={() =>
                  addNewActivity(ActivityParentType.Treatment, ActivityType.Treatment_BiologicalTerrestrialAnimal)
                }>
                Animal Terrestrial Biological
              </Button>

              <ActivityList disable={isDisabled} activityParentType={ActivityParentType.Treatment} />
            </div>
          </div>
          <div>
            <div>
              <Typography variant="h5">Monitorings</Typography>
            </div>
            <div className={classes.newActivityButtonsRow}>
              <Button
                disabled={isDisabled}
                variant="contained"
                startIcon={<Add />}
                onClick={() =>
                  addNewActivity(ActivityParentType.Monitoring, ActivityType.Monitoring_ChemicalTerrestrialAquaticPlant)
                }>
                Plant Terrestrial/Aquatic Chemical
              </Button>
              <Button
                disabled={isDisabled}
                variant="contained"
                startIcon={<Add />}
                onClick={() =>
                  addNewActivity(
                    ActivityParentType.Monitoring,
                    ActivityType.Monitoring_MechanicalTerrestrialAquaticPlant
                  )
                }>
                Plant Terrestrial/Aquatic Mechanical
              </Button>
              <Button
                disabled={isDisabled}
                variant="contained"
                startIcon={<Add />}
                onClick={() =>
                  addNewActivity(ActivityParentType.Monitoring, ActivityType.Monitoring_BiologicalTerrestrialPlant)
                }>
                Plant Terrestrial Biological
              </Button>

              <Button
                disabled={isDisabled}
                variant="contained"
                startIcon={<Add />}
                onClick={() =>
                  addNewActivity(ActivityParentType.Monitoring, ActivityType.Monitoring_MechanicalTerrestrialAnimal)
                }>
                Animal Terrestrial Mechanical
              </Button>
              <Button
                disabled={isDisabled}
                variant="contained"
                startIcon={<Add />}
                onClick={() =>
                  addNewActivity(ActivityParentType.Monitoring, ActivityType.Monitoring_ChemicalTerrestrialAnimal)
                }>
                Animal Terrestrial Chemical
              </Button>
              <Button
                disabled={isDisabled}
                variant="contained"
                startIcon={<Add />}
                onClick={() =>
                  addNewActivity(ActivityParentType.Monitoring, ActivityType.Monitoring_BiologicalTerrestrialAnimal)
                }>
                Animal Terrestrial Biological
              </Button>

              <ActivityList disable={isDisabled} activityParentType={ActivityParentType.Monitoring} />
            </div>
          </div>
          <div>
            <div>
              <Typography variant="h5">Development/Testing</Typography>
            </div>
            <div className={classes.newActivityButtonsRow}>
              <Button
                disabled={isDisabled}
                variant="contained"
                startIcon={<Add />}
                onClick={() => triggerError(databaseContext)}>
                Simulate Error
              </Button>
              <Button
                disabled={isDisabled}
                variant="contained"
                startIcon={<Add />}
                onClick={() => notifySuccess(databaseContext, 'hooray!')}>
                Simulate Success
              </Button>
              <Button
                disabled={isDisabled}
                variant="contained"
                startIcon={<Add />}
                onClick={() => notifyWarning(databaseContext, 'better watch it')}>
                Simulate Warning
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ActivitiesList;

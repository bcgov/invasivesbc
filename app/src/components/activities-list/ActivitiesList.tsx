import {
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
  Typography
} from '@material-ui/core';
import { Add, DeleteForever, Sync } from '@material-ui/icons';
import clsx from 'clsx';
import { ActivityStatus, ActivitySyncStatus, ActivityType, ActivityTypeIcon } from 'constants/activities';
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

  return (
    <Grid className={classes.activityListItem_Grid} container spacing={2}>
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
      <Grid item md={2}>
        <Typography className={classes.activitiyListItem_Typography}>Ready to Sync?</Typography>
        <Checkbox
          disabled={props.disable}
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
  type: ActivityType;
}

// TODO change any to a type that defines the overall items being displayed
const ActivityList: React.FC<IActivityList> = (props) => {
  const classes = useStyles();

  const history = useHistory();

  const databaseContext = useContext(DatabaseContext);

  const [docs, setDocs] = useState<any[]>([]);

  const updateActivityList = async () => {
    const activityDocs = await databaseContext.database.find({
      selector: { type: props.type }
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
        return (
          <Paper elevation={1} key={doc._id}>
            <ListItem
              button
              disabled={props.disable}
              className={classes.activitiyListItem}
              onClick={() => setActiveActivityAndNavigateToActivityPage(doc)}>
              <ListItemIcon>
                <SvgIcon
                  fontSize="large"
                  className={clsx(
                    (doc.sync.status === ActivitySyncStatus.SYNC_SUCCESSFUL && classes.syncSuccessful) ||
                      (doc.sync.status === ActivitySyncStatus.SYNC_FAILED && classes.syncFailed)
                  )}
                  component={ActivityTypeIcon[props.type]}
                />
              </ListItemIcon>
              <ActivityListItem disable={props.disable} activity={doc} />
              <ListItemSecondaryAction>
                <IconButton
                  disabled={props.disable || doc.sync.status === ActivitySyncStatus.SYNC_SUCCESSFUL}
                  onClick={() => removeActivity(doc)}>
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
  const [disable, setDisable] = useState(false);

  const syncActivities = async () => {
    setDisable(true);
    setSyncing(true);

    // fetch all activity documents that are ready to sync
    const results = await databaseContext.database.find({
      selector: { docType: DocType.ACTIVITY, 'sync.ready': true }
    });

    // save each activity one-by-one
    for (const activity of results.docs) {
      try {
        const response = await invasivesApi.createActivity(activity.formData);
        console.log('sync response', response);
        await databaseContext.database.upsert(activity._id, (activityDoc) => {
          return {
            ...activityDoc,
            sync: { ...activityDoc.sync, status: ActivitySyncStatus.SYNC_SUCCESSFUL, error: null }
          };
        });
      } catch (error) {
        console.log('sync error', error);
        await databaseContext.database.upsert(activity._id, (activityDoc) => {
          return {
            ...activityDoc,
            sync: { ...activityDoc.sync, status: ActivitySyncStatus.SYNC_FAILED, error: error.message }
          };
        });
      }
    }

    setSyncing(false);
    setDisable(false);
  };

  const addNewActivity = async (activityType: ActivityType) => {
    await databaseContext.database.put({
      _id: uuidv4(),
      docType: DocType.ACTIVITY,
      type: activityType,
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
            disabled={disable}
            variant="contained"
            startIcon={<Sync className={clsx(syncing && 'rotating')} />}
            onClick={() => syncActivities()}>
            Sync Activities
          </Button>
        </div>
        <div className={classes.activitiesContent}>
          <div>
            <Button
              disabled={disable}
              variant="contained"
              startIcon={<Add />}
              onClick={() => addNewActivity(ActivityType.OBSERVATION)}>
              Add New Observation
            </Button>
            <ActivityList disable={disable} type={ActivityType.OBSERVATION} />
          </div>
          <div>
            <Button
              disabled={disable}
              variant="contained"
              startIcon={<Add />}
              onClick={() => addNewActivity(ActivityType.TREATMENT)}>
              Add New Treatment
            </Button>
            <ActivityList disable={disable} type={ActivityType.TREATMENT} />
          </div>
          <div>
            <Button
              disabled={disable}
              variant="contained"
              startIcon={<Add />}
              onClick={() => addNewActivity(ActivityType.MONITORING)}>
              Add New Monitoring
            </Button>
            <ActivityList disable={disable} type={ActivityType.MONITORING} />
          </div>
          <div>
            <Button
              disabled={disable}
              variant="contained"
              startIcon={<Add />}
              onClick={() => triggerError(databaseContext)}>
              Simulate Error
            </Button>
            <Button
              disabled={disable}
              variant="contained"
              startIcon={<Add />}
              onClick={() => notifySuccess(databaseContext, 'hooray!')}>
              Simulate Success
            </Button>
            <Button
              disabled={disable}
              variant="contained"
              startIcon={<Add />}
              onClick={() => notifyWarning(databaseContext, 'better watch it')}>
              Simulate Warning
            </Button>

            <ActivityList disable={disable} type={ActivityType.MONITORING} />
          </div>
        </div>
      </div>
    </>
  );
};

export default ActivitiesList;

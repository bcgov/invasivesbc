import {
  Button,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  makeStyles,
  SvgIcon,
  Theme
} from '@material-ui/core';
import { Add, DeleteForever } from '@material-ui/icons';
import { useInvasivesApi } from 'api/api';
import { ActivityType, ActivityTypeIcon } from 'constants/activities';
import { MediumDateFormat } from 'constants/misc';
import { DatabaseContext } from 'contexts/DatabaseContext';
import moment from 'moment';
import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Subscription } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

const useStyles = makeStyles((theme: Theme) => ({
  activityList: {},
  activitiyListItem: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: '0.5rem',
    marginBottom: '0.5rem',
    border: '1px solid',
    borderColor: theme.palette.grey[300],
    borderRadius: '6px'
  },
  activitiyListCol: {
    flex: '1'
  }
}));

interface IActivityListItem {
  doc: any;
}

const ActivityListItem: React.FC<IActivityListItem> = (props) => {
  const classes = useStyles();

  return (
    <Grid container direction="row" spacing={2}>
      <Divider flexItem={true} orientation="vertical" />
      <Grid item>Status: {props.doc.status}</Grid>
      <Divider flexItem={true} orientation="vertical" />
      <Grid item>Created: {moment(props.doc.dateCreated).format(MediumDateFormat)}</Grid>
      <Divider flexItem={true} orientation="vertical" />
      <Grid item>
        Edited: {(props.doc.dateUpdated && moment(props.doc.dateUpdated).format(MediumDateFormat)) || 'n/a'}
      </Grid>
      <Divider flexItem={true} orientation="vertical" />
    </Grid>
  );
};

interface IActivityList {
  classes?: any;
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
      if (!databaseContext.database) {
        // database not ready
        return;
      }

      // initial update
      updateActivityList();

      // subscribe to future updates
      if (!databaseContext.changes) {
        // changes observable not ready
        return;
      }

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

  const removeActivity = async (doc: PouchDB.Core.RemoveDocument) => {
    databaseContext.database.remove(doc);
  };

  const setActiveActivityAndNavigateToActivityPage = async (doc: any) => {
    await databaseContext.database.upsert('AppState', (appStateDoc) => {
      return { ...appStateDoc, activeActivity: doc._id };
    });

    history.push(`/home/activity`);
  };

    const api = useInvasivesApi();


  return (
    <List className={classes.activityList}>
      {docs.map((doc) => {
        return (
          <ListItem
            button
            key={doc._id}
            className={classes.activitiyListItem}
            onClick={() => setActiveActivityAndNavigateToActivityPage(doc)}>
            <ListItemIcon>
              <SvgIcon component={ActivityTypeIcon[props.type]} />
            </ListItemIcon>
            <ActivityListItem doc={doc} />
            <ListItemSecondaryAction>
              <IconButton onClick={() => removeActivity(doc)}>
                <DeleteForever />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        );
      })}
    </List>
  );
};

const ActivitiesList: React.FC = (props) => {
  const databaseContext = useContext(DatabaseContext);

  const addNewError = async () => {
    await databaseContext.database.put({
      _id: uuidv4(),
      docType: "error",
      errorText: "Some error text",
      errorAcknowledged: false,
      dateCreated: new Date()
    });
    console.log('added a new error')
  }

  const triggerError = async() => {
    try {
      throw Error("crash the app!")
    } catch (error) {
      addNewError()
    }
  }

  const addNewActivity = async (activityType: ActivityType) => {
    await databaseContext.database.put({
      _id: uuidv4(),
      type: activityType,
      status: 'new',
      sync: {
        status: false,
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
        <Button variant="contained" startIcon={<Add />} onClick={() => addNewActivity(ActivityType.OBSERVATION)}>
          Add New Observation
        </Button>
        <ActivityList type={ActivityType.OBSERVATION} />
      </div>
      <div>
        <Button variant="contained" startIcon={<Add />} onClick={() => addNewActivity(ActivityType.TREATMENT)}>
          Add New Treatment
        </Button>
        <ActivityList type={ActivityType.TREATMENT} />
      </div>
      <div>
        <Button variant="contained" startIcon={<Add />} onClick={() => triggerError()}>
          Add New Monitoring
        </Button>
        <ActivityList type={ActivityType.MONITORING} />
      </div>
    </>
  );
};

export default ActivitiesList;

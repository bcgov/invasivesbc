import {
  Button,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemSecondaryAction,
  ListItemText,
  makeStyles,
  SvgIcon
} from '@material-ui/core';
import { Add, DeleteForever } from '@material-ui/icons';
import { useInvasivesApi } from 'api/api';
import { ActivityType, ActivityTypeIcon } from 'constants/activities';
import { DatabaseContext } from 'contexts/DatabaseContext';
import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Subscription } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

const useStyles = makeStyles((theme) => ({
  activitiyListItem: {
    display: 'flex',
    flexDirection: 'column'
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
      <Grid item>{props.doc.title}</Grid>
      <Divider flexItem={true} orientation="vertical" />
      <Grid item>{props.doc.url}</Grid>
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
    <List>
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
            <ListItemText>
              <ActivityListItem doc={doc} />
            </ListItemText>
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
      dateUpated: null
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

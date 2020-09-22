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
import { ActivityType, ActivityTypeIcon } from 'constants/activities';
import { DatabaseChangesContext } from 'contexts/DatabaseChangesContext';
import { DatabaseContext } from 'contexts/DatabaseContext';
import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
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

  const database = useContext(DatabaseContext);
  const databaseChanges = useContext(DatabaseChangesContext);
  const [databaseChangesSubscription, setDatabaseChangesSubscription] = useState(null);

  const [docs, setDocs] = useState<any[]>([]);

  const updateActivityList = async () => {
    const activityDocs = await database.find({
      selector: { type: props.type }
    });

    setDocs([...activityDocs.docs]);
  };

  useEffect(() => {
    const subscribeToDatabaseChanges = () => {
      if (!database) {
        return;
      }

      // initial update
      updateActivityList();

      // subscribe to changes and update on changes
      const subscription = databaseChanges.subscribe(() => {
        updateActivityList();
      });

      // store subscription
      setDatabaseChangesSubscription(subscription);
    };

    subscribeToDatabaseChanges();

    return () => {
      if (!databaseChangesSubscription) {
        return;
      }

      // unsubscribe on component cleanup
      databaseChangesSubscription.unsubscribe();
    };
  }, [databaseChanges]);

  const removeActivity = async (doc: PouchDB.Core.RemoveDocument) => {
    database.remove(doc);
  };

  const setActiveAAndNavigateToActivity = async (doc: any) => {
    await database.upsert('AppState', (appStateDoc) => {
      console.log(appStateDoc);
      return { ...appStateDoc, activeActivity: doc._id };
    });

    history.push(`/home/activity/${doc._id}`);
  };

  return (
    <List>
      {docs.map((doc) => {
        return (
          <ListItem
            button
            key={doc._id}
            className={classes.activitiyListItem}
            onClick={() => setActiveAAndNavigateToActivity(doc)}>
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
  const database = useContext(DatabaseContext);

  const addNewActivity = async (activityType: ActivityType) => {
    await database.put({
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
        <Button variant="contained" startIcon={<Add />} onClick={() => addNewActivity(ActivityType.MONITORING)}>
          Add New Monitoring
        </Button>
        <ActivityList type={ActivityType.MONITORING} />
      </div>
    </>
  );
};

export default ActivitiesList;

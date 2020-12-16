import {
  Divider,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  makeStyles,
  Paper,
  SvgIcon,
  Theme,
  Typography,
  Button,
  Box
} from '@material-ui/core';
import { Add } from '@material-ui/icons';
import { ActivityTypeIcon } from 'constants/activities';
import { DocType } from 'constants/database';
import { DatabaseChangesContext } from 'contexts/DatabaseChangesContext';
import { DatabaseContext } from 'contexts/DatabaseContext';
import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import ActivityListItem from './ActivityListItem';
import ActivityListDate from './ActivityListDate';

const useStyles = makeStyles((theme: Theme) => ({
  activitiesContent: {},
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
  activityListItem_Grid: {
    flexWrap: 'nowrap',
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
  }
}));

interface IReferenceActivityListItem {
  isDisabled?: boolean;
  activity: any;
}

const ReferenceActivityListItem: React.FC<IReferenceActivityListItem> = (props) => {
  const classes = useStyles();

  return (
    <Grid className={classes.activityListItem_Grid} container spacing={2}>
      <Divider flexItem={true} orientation="vertical" />
      <ActivityListItem activity={props.activity} classes={classes} />
      <ActivityListDate classes={classes} activity={props.activity} />
      {props.activity.activityType === 'Treatment' && (
        <>
          <Divider flexItem={true} orientation="vertical" />
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              size="small"
              startIcon={<Add />}
              onClick={(e) => {
                e.stopPropagation();
              }}>
              Create Monitoring
            </Button>
          </Grid>
        </>
      )}
    </Grid>
  );
};

interface IReferenceActivityListComponent {
  doc: any;
  isDisabled?: boolean;
}

const ReferenceActivityListComponent: React.FC<IReferenceActivityListComponent> = (props) => {
  const classes = useStyles();
  const history = useHistory();
  const { doc, isDisabled } = props;

  const navigateToActivityPage = async (doc: any) => {
    history.push(`/home/references/activity/${doc._id}`);
  };

  return (
    <Paper key={doc._id}>
      <ListItem button className={classes.activitiyListItem} onClick={() => navigateToActivityPage(doc)}>
        <ListItemIcon>
          <SvgIcon fontSize="large" component={ActivityTypeIcon[doc.activityType]} />
        </ListItemIcon>
        <ReferenceActivityListItem isDisabled={isDisabled} activity={doc} />
      </ListItem>
    </Paper>
  );
};

interface IReferenceActivityList {
  isDisabled?: boolean;
}

// TODO change any to a type that defines the overall items being displayed
const ReferenceActivityList: React.FC<IReferenceActivityList> = (props) => {
  const classes = useStyles();
  const databaseContext = useContext(DatabaseContext);
  const databaseChangesContext = useContext(DatabaseChangesContext);

  const [docs, setDocs] = useState<any[]>([]);

  const updateActivityList = async () => {
    const activityResult = await databaseContext.database.find({
      selector: { docType: DocType.REFERENCE_ACTIVITY }
    });

    setDocs([...activityResult.docs]);
  };

  useEffect(() => {
    const updateComponent = () => {
      updateActivityList();
    };

    updateComponent();
  }, [databaseChangesContext]);

  const observations = docs.filter(doc => doc.activityType === 'Observation');
  const treatments = docs.filter(doc => doc.activityType === 'Treatment');
  const monitorings = docs.filter(doc => doc.activityType === 'Monitoring');

  return (
    <List className={classes.activityList}>
      {observations.length > 0 && (
        <Box>
          <Typography variant="h5">Observations</Typography>
        </Box>
      )}
      {observations.map((doc) => (
        <ReferenceActivityListComponent key={doc._id} doc={doc} isDisabled={props.isDisabled} />
      ))}
      {treatments.length > 0 && (
        <Box>
          <br />
          <Typography variant="h5">Treatments</Typography>
        </Box>
      )}
      {treatments.map((doc) => (
        <ReferenceActivityListComponent key={doc._id} doc={doc} isDisabled={props.isDisabled} />
      ))}
      {monitorings.length > 0 && (
        <Box>
          <br />
          <Typography variant="h5">Monitorings</Typography>
        </Box>
      )}
      {monitorings.map((doc) => (
        <ReferenceActivityListComponent key={doc._id} doc={doc} isDisabled={props.isDisabled} />
      ))}
    </List>
  );
};

const ReferenceActivitiesList: React.FC = () => {
  const classes = useStyles();

  return (
    <>
      <div className={classes.activitiesContent}>
        <div>
          <Typography variant="h4">Reference Activities</Typography>
        </div>
        <br />
        <div>
          <ReferenceActivityList isDisabled={true} />
        </div>
      </div>
    </>
  );
};

export default ReferenceActivitiesList;

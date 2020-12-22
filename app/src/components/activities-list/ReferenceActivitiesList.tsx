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
import { ActivitySubtype, ActivityType, ActivityTypeIcon } from 'constants/activities';
import { DocType } from 'constants/database';
import { DatabaseChangesContext } from 'contexts/DatabaseChangesContext';
import { DatabaseContext } from 'contexts/DatabaseContext';
import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import ActivityListItem from './ActivityListItem';
import ActivityListDate from './ActivityListDate';
import { addActivityToDB } from 'utils/addActivity';

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

/**
 *
 * @param {ActivitySubtype} treatmentSubtype The treatment subtype for which to get the associated monitoring subtype
 */
const calculateMonitoringSubtypeByTreatmentSubtype = (treatmentSubtype: ActivitySubtype): ActivitySubtype => {
  /*
    Note: There is no explicit subtype for biological dispersal plant monitoring
    If this needs to be present, it needs to be created and defined in API spec
  */
  let monitoringSubtype: ActivitySubtype;

  if (treatmentSubtype.includes('ChemicalPlant')) {
    monitoringSubtype = ActivitySubtype.Monitoring_ChemicalTerrestrialAquaticPlant;
  } else if (treatmentSubtype.includes('MechanicalPlant')) {
    monitoringSubtype = ActivitySubtype.Monitoring_MechanicalTerrestrialAquaticPlant;
  } else if (treatmentSubtype.includes('BiologicalPlant') || treatmentSubtype.includes('BiologicalDispersalPlant')) {
    monitoringSubtype = ActivitySubtype.Monitoring_BiologicalTerrestrialPlant;
  } else {
    monitoringSubtype = ActivitySubtype[`Monitoring_${treatmentSubtype.split('_')[2]}`];
  }

  return monitoringSubtype;
};

interface IReferenceActivityListItem {
  activity: any;
  databaseContext: any;
  setOnReferencesListPage: Function;
}

const ReferenceActivityListItem: React.FC<IReferenceActivityListItem> = (props) => {
  const classes = useStyles();
  const history = useHistory();
  const { activity, databaseContext, setOnReferencesListPage } = props;

  const setActiveActivityAndNavigateToActivityPage = async (doc: any) => {
    await databaseContext.database.upsert(DocType.APPSTATE, (appStateDoc) => {
      return { ...appStateDoc, activeActivity: doc._id };
    });

    history.push(`/home/activity`);
  };

  return (
    <Grid className={classes.activityListItem_Grid} container spacing={2}>
      <Divider flexItem={true} orientation="vertical" />
      <ActivityListItem activity={activity} classes={classes} />
      <ActivityListDate classes={classes} activity={activity} />
      {activity.activityType === 'Treatment' && (
        <>
          <Divider flexItem={true} orientation="vertical" />
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              size="small"
              startIcon={<Add />}
              onClick={async (e) => {
                e.stopPropagation();
                const addedActivity = await addActivityToDB(
                  databaseContext,
                  ActivityType.Monitoring,
                  calculateMonitoringSubtypeByTreatmentSubtype(activity.activitySubtype),
                  activity
                );
                setActiveActivityAndNavigateToActivityPage(addedActivity);
                setOnReferencesListPage(false);
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
  databaseContext: any;
  setOnReferencesListPage: Function;
}

const ReferenceActivityListComponent: React.FC<IReferenceActivityListComponent> = (props) => {
  const classes = useStyles();
  const history = useHistory();
  const { doc, databaseContext, setOnReferencesListPage } = props;

  const navigateToActivityPage = async (activity: any) => {
    history.push(`/home/references/activity/${activity._id}`);
  };

  return (
    <Paper key={doc._id}>
      <ListItem button className={classes.activitiyListItem} onClick={() => navigateToActivityPage(doc)}>
        <ListItemIcon>
          <SvgIcon fontSize="large" component={ActivityTypeIcon[doc.activityType]} />
        </ListItemIcon>
        <ReferenceActivityListItem
          setOnReferencesListPage={setOnReferencesListPage}
          databaseContext={databaseContext}
          activity={doc}
        />
      </ListItem>
    </Paper>
  );
};

const ReferenceActivityList: React.FC = () => {
  const classes = useStyles();

  const databaseContext = useContext(DatabaseContext);
  const databaseChangesContext = useContext(DatabaseChangesContext);
  const [onReferencesListPage, setOnReferencesListPage] = useState(true);

  const [docs, setDocs] = useState<any[]>([]);

  const updateActivityList = async () => {
    const activityResult = await databaseContext.database.find({
      selector: { docType: DocType.REFERENCE_ACTIVITY }
    });

    setDocs([...activityResult.docs]);
  };

  useEffect(() => {
    const updateComponent = () => {
      // Used to fix react state update unmounted component error
      if (onReferencesListPage) {
        updateActivityList();
      }
    };

    updateComponent();
  }, [databaseChangesContext]);

  const observations = docs.filter((doc) => doc.activityType === 'Observation');
  const treatments = docs.filter((doc) => doc.activityType === 'Treatment');
  const monitorings = docs.filter((doc) => doc.activityType === 'Monitoring');

  return (
    <List className={classes.activityList}>
      {observations.length > 0 && (
        <Box>
          <Typography variant="h5">Observations</Typography>
        </Box>
      )}
      {observations.map((doc) => (
        <ReferenceActivityListComponent
          setOnReferencesListPage={setOnReferencesListPage}
          databaseContext={databaseContext}
          key={doc._id}
          doc={doc}
        />
      ))}
      {treatments.length > 0 && (
        <Box>
          <br />
          <Typography variant="h5">Treatments</Typography>
        </Box>
      )}
      {treatments.map((doc) => (
        <ReferenceActivityListComponent
          setOnReferencesListPage={setOnReferencesListPage}
          databaseContext={databaseContext}
          key={doc._id}
          doc={doc}
        />
      ))}
      {monitorings.length > 0 && (
        <Box>
          <br />
          <Typography variant="h5">Monitorings</Typography>
        </Box>
      )}
      {monitorings.map((doc) => (
        <ReferenceActivityListComponent
          setOnReferencesListPage={setOnReferencesListPage}
          databaseContext={databaseContext}
          key={doc._id}
          doc={doc}
        />
      ))}
    </List>
  );
};

const ReferenceActivitiesList: React.FC = () => {
  const classes = useStyles();

  return (
    <>
      <div className={classes.activitiesContent}>
        <Typography variant="h4">Reference Activities</Typography>
        <br />
        <ReferenceActivityList />
      </div>
    </>
  );
};

export default ReferenceActivitiesList;

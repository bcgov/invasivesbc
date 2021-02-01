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
  Box,
  Checkbox,
  Container,
  FormControl,
  MenuItem,
  Select,
  InputLabel
} from '@material-ui/core';
import { Add } from '@material-ui/icons';
import { ActivitySubtype, ActivityType, ActivityTypeIcon } from 'constants/activities';
import { DocType } from 'constants/database';
import { DatabaseChangesContext } from 'contexts/DatabaseChangesContext';
import { DatabaseContext } from 'contexts/DatabaseContext';
import React, { useContext, useEffect, useState, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import ActivityListItem from './ActivityListItem';
import ActivityListDate from './ActivityListDate';
import { notifyError } from 'utils/NotificationUtils';
import { addLinkedActivityToDB } from 'utils/addActivity';
import MapContainer from 'components/map/MapContainer';
import { Feature } from 'geojson';
import { MapContextMenuData } from 'features/home/map/MapContextMenu';

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
  },
  formControl: {
    minWidth: 180
  },
  map: {
    height: '500px',
    width: '100%'
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
  } else if (treatmentSubtype.includes('BiologicalPlant')) {
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
                const addedActivity = await addLinkedActivityToDB(
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
  selectedObservations?: any;
  setSelectedObservations?: Function;
}

const ReferenceActivityListComponent: React.FC<IReferenceActivityListComponent> = (props) => {
  const classes = useStyles();
  const history = useHistory();
  const { doc, databaseContext, setOnReferencesListPage, selectedObservations, setSelectedObservations } = props;

  // Determine which observation records have been selected
  const isChecked = selectedObservations?.some((obs: any) => obs.id === doc._id);

  const navigateToActivityPage = async (activity: any) => {
    history.push(`/home/references/activity/${activity._id}`);
  };

  return (
    <Paper key={doc._id}>
      <ListItem button className={classes.activitiyListItem} onClick={() => navigateToActivityPage(doc)}>
        {/* For observations, allow ability to select one or more and start the create treatment flow */}
        {doc.activityType === 'Observation' && (
          <Checkbox
            checked={isChecked}
            onChange={() => {
              setSelectedObservations(
                isChecked
                  ? selectedObservations.filter((obs: any) => obs.id !== doc._id)
                  : [{ id: doc._id, subtype: doc.activitySubtype }, ...selectedObservations]
              );
            }}
            onClick={(event) => event.stopPropagation()}
          />
        )}
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

interface IReferenceActivityList {
  docs: any;
  databaseContext: any;
  setOnReferencesListPage: Function;
}

const ReferenceActivityList: React.FC<IReferenceActivityList> = (props) => {
  const { docs, databaseContext, setOnReferencesListPage } = props;

  const classes = useStyles();
  const history = useHistory();

  const [selectedObservations, setSelectedObservations] = useState([]);

  const observations = docs.filter((doc: any) => doc.activityType === 'Observation');
  const treatments = docs.filter((doc: any) => doc.activityType === 'Treatment');
  const monitorings = docs.filter((doc: any) => doc.activityType === 'Monitoring');

  /*
    Function to determine if all selected observation records are
    of the same subtype. For example: Cannot create a treatment if you select a plant
    and an animal observation, and most probably will not go treat a terrestrial
    and aquatic observation in a single treatment as those are different areas
  */
  const validateSelectedObservationTypes = () => {
    return selectedObservations.every((a, _, [b]) => a.subtype === b.subtype);
  };

  /*
    If all the selected observation records are valid, navigate to the create
    activity flow to enable the creation of a treatment record
  */
  const navigateToCreateActivityPage = () => {
    const selectedObservationIds = selectedObservations.map((obs: any) => obs.id);

    history.push({
      pathname: `/home/activity/treatment`,
      search: '?observations=' + selectedObservationIds.join(','),
      state: { observations: selectedObservationIds }
    });
  };

  return (
    <List className={classes.activityList}>
      {observations.length > 0 && (
        <Box mb={3} display="flex" justifyContent="space-between">
          <Typography variant="h5">Observations</Typography>
          <Button
            variant="contained"
            color="primary"
            disabled={!selectedObservations.length}
            onClick={() => {
              if (!validateSelectedObservationTypes()) {
                notifyError(
                  databaseContext,
                  `You have selected activities of different subtypes.
                  Please make sure they are all of the same subtype.`
                );
                return;
              }

              navigateToCreateActivityPage();
            }}>
            Create Treatment
          </Button>
        </Box>
      )}
      {observations.map((doc) => (
        <ReferenceActivityListComponent
          selectedObservations={selectedObservations}
          setSelectedObservations={setSelectedObservations}
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
  const databaseContext = useContext(DatabaseContext);
  const databaseChangesContext = useContext(DatabaseChangesContext);

  const [geometry, setGeometry] = useState<Feature[]>([]);
  const [interactiveGeometry, setInteractiveGeometry] = useState([]);
  const [extent, setExtent] = useState(null);
  const [docs, setDocs] = useState<any[]>([]);
  const [onReferencesListPage, setOnReferencesListPage] = useState(true);

  const initialContextMenuState: MapContextMenuData = { isOpen: false, lat: 0, lng: 0 };
  const [contextMenuState, setContextMenuState] = useState(initialContextMenuState);
  const [mapActivityType, setMapActivityType] = useState("All");

  /*
    Fetch activities from database and save them in state
    Also, call a helper function to save map geometries
  */
  const updateActivityList = useCallback(async () => {
    const activityResult = await databaseContext.database.find({
      selector: { docType: DocType.REFERENCE_ACTIVITY }
    });

    setDocs([...activityResult.docs]);
  }, [databaseContext.database]);

  /*
    On render, update the list of activities (fetch them and set in state)
  */
  useEffect(() => {
    const updateComponent = () => {
      // Used to fix react state update unmounted component error
      if (onReferencesListPage) {
        updateActivityList();
      }
    };

    updateComponent();
  }, [databaseChangesContext, onReferencesListPage, updateActivityList]);

  /*
    When the selected map activity type changes, filter the docs by the type
    and store the associated geometries only
  */
  useEffect(() => {
    const mapGeos = [];

    docs.forEach((doc: any) => {
      if (doc.activityType === mapActivityType || mapActivityType === 'All') {
        mapGeos.push(getInteractiveGeoData(doc));
      }
    });

    setInteractiveGeometry([...mapGeos]);
  }, [mapActivityType]);

  /*
    Store info regarding the geometry for each activity
  */
  useEffect(() => {
    const saveMapGeos = () => {
      const mapGeos = [];

      docs.forEach((doc: any) => {
        mapGeos.push(getInteractiveGeoData(doc));
      });

      setInteractiveGeometry([...mapGeos]);
    };

    saveMapGeos();
  }, [docs]);

  /*
    Function to set the chosen map activity type in state
  */
  const handleMapActivityChange = (event: any) => {
    setMapActivityType(event.target.value);
  };

  const ActivityPopup = (name: string) => {
    return '<div>' + name + '</div>';
  };

  const getInteractiveGeoData = (doc: any) => {
    return {
      recordDocID: doc._id,
      geometry: doc.geometry,
      color: getGeoColor(doc.activityType),
      description: `${doc.activityType}: ${doc._id}`,
      popUpComponent: ActivityPopup,
      onClickCallback: () => {}
    }
  };

  const getGeoColor = (activityType: string) => {
    let color = 'rgb(51, 136, 255)';

    if (activityType === 'Treatment') {
      color = 'FFA500';
    } else if (activityType === 'Monitoring') {
      color = 'red';
    }

    return color;
  };

  return (
    <Container className={classes.activitiesContent}>
      <Box mb={3} display="flex" justifyContent="space-between">
        <Typography variant="h4">Cached Activities</Typography>
        <FormControl variant="outlined" className={classes.formControl}>
          <InputLabel>Map Activity Type</InputLabel>
          <Select value={mapActivityType} onChange={handleMapActivityChange} label="Select Map Activity Type">
            <MenuItem value="All">All</MenuItem>
            <MenuItem value={ActivityType.Observation}>Observation</MenuItem>
            <MenuItem value={ActivityType.Treatment}>Treatment</MenuItem>
            <MenuItem value={ActivityType.Monitoring}>Monitoring</MenuItem>
          </Select>
        </FormControl>
      </Box>
      {interactiveGeometry.length > 0 && (
        <Paper>
          <MapContainer
            classes={classes}
            mapId="references_page_map_container"
            geometryState={{ geometry, setGeometry }}
            interactiveGeometryState={{ interactiveGeometry, setInteractiveGeometry }}
            extentState={{ extent, setExtent }}
            contextMenuState={{ state: contextMenuState, setContextMenuState }}
          />
        </Paper>
      )}
      {!interactiveGeometry.length && (
        <Typography>No activities available of the selected type.</Typography>
      )}
      <br />
      <ReferenceActivityList
        docs={docs}
        databaseContext={databaseContext}
        setOnReferencesListPage={setOnReferencesListPage}
      />
    </Container>
  );
};

export default ReferenceActivitiesList;

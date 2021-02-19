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
import { Add, Check } from '@material-ui/icons';
import { ActivitySubtype, ActivityType, ActivityTypeIcon } from 'constants/activities';
import { DocType } from 'constants/database';
import { DatabaseContext } from 'contexts/DatabaseContext';
import React, { useContext, useEffect, useState, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { useInvasivesApi } from 'hooks/useInvasivesApi';
import {
  ICreateMetabaseQuery
} from 'interfaces/useInvasivesApi-interfaces';
import ActivityListItem from './ActivityListItem';
import ActivityListDate from './ActivityListDate';
import { notifySuccess, notifyError } from 'utils/NotificationUtils';
import { addLinkedActivityToDB } from 'utils/addActivity';
import MapContainer from 'components/map/MapContainer';
import { Feature } from 'geojson';
import { MapContextMenuData } from 'features/home/map/MapContextMenu';
import booleanIntersects from '@turf/boolean-intersects';

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
    height: 500,
    width: '100%',
    zIndex: 0
  },
  metabaseAddButton: {
    marginLeft: 10,
    marginRight: 10
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
  setActiveDoc: Function;
}

const ReferenceActivityListItem: React.FC<IReferenceActivityListItem> = (props) => {
  const classes = useStyles();
  const history = useHistory();
  const { activity, databaseContext, setActiveDoc } = props;

  const setActiveActivityAndNavigateToActivityPage = async (doc: any) => {
    await databaseContext.database.upsert(DocType.APPSTATE, (appStateDoc: any) => {
      return { ...appStateDoc, activeActivity: doc._id };
    });

    history.push(`/home/activity`);
  };

  return (
    <Grid
      className={classes.activityListItem_Grid}
      container
      spacing={2}
      onMouseEnter={() => setActiveDoc(activity)}
      onMouseLeave={() => setActiveDoc(null)}>
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
  selectedObservations?: any;
  setSelectedObservations?: Function;
  setActiveDoc: Function;
}

const ReferenceActivityListComponent: React.FC<IReferenceActivityListComponent> = (props) => {
  const classes = useStyles();
  const history = useHistory();
  const { doc, databaseContext, selectedObservations, setSelectedObservations, setActiveDoc } = props;

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
        <ReferenceActivityListItem setActiveDoc={setActiveDoc} databaseContext={databaseContext} activity={doc} />
      </ListItem>
    </Paper>
  );
};

interface IReferenceActivityList {
  docs: any;
  databaseContext: any;
  setActiveDoc: Function;
  selectedObservations: Array<any>;
  setSelectedObservations: Function;
}

const ReferenceActivityList: React.FC<IReferenceActivityList> = (props) => {
  const { docs, databaseContext, setActiveDoc } = props;

  const classes = useStyles();
  const history = useHistory();
  const invasivesApi = useInvasivesApi();
  const [lastCreatedMetabaseQuery, setLastCreatedMetabaseQuery] = useState([]);

  const {selectedObservations, setSelectedObservations} = props;

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

  const selectedIds = selectedObservations.map((activity) => '' + activity.id);

  const createMetabaseQuery = async () => {
    await setLastCreatedMetabaseQuery(selectedIds);
    const queryCreate: ICreateMetabaseQuery = {
      // name: 'Test Metabase Query',
      // description: 'Testing testing',
      // point_of_interest_ids: [],
      activity_ids: selectedIds
    };
    try {
      let response = await invasivesApi.createMetabaseQuery(queryCreate);
      if (response?.activity_query_id && response?.activity_query_name)
        notifySuccess(databaseContext, `Created a new Metabase Query, with name "${response.activity_query_name}" and ID ${response.activity_query_id}`);
      else throw response;
    } catch (error) {
      notifyError(databaseContext, 'Unable to create new Metabase Query.  There may an issue with your connection to the Metabase API: ' + error);
      await setLastCreatedMetabaseQuery([]);
    }
  };

  const metabaseQuerySubmitted = JSON.stringify(lastCreatedMetabaseQuery) == JSON.stringify(selectedIds);

  return (
    <List className={classes.activityList}>
      {observations.length > 0 && (
        <Box mb={3} display="flex" justifyContent="space-between">
          <Typography variant="h5">Observations</Typography>
          <Box display="flex" justifyContent="space-between">
            <Button
              variant="contained"
              color="primary"
              className={classes.metabaseAddButton}
              disabled={!selectedObservations.length || metabaseQuerySubmitted}
              startIcon={selectedObservations.length && metabaseQuerySubmitted ? <Check /> : undefined}
              onClick={async (e) => {
                e.stopPropagation();
                await createMetabaseQuery();
              }}>
              Create Metabase Query
            </Button>
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
        </Box>
      )}
      {observations.map((doc) => (
        <ReferenceActivityListComponent
          selectedObservations={selectedObservations}
          setSelectedObservations={setSelectedObservations}
          databaseContext={databaseContext}
          key={doc._id}
          doc={doc}
          setActiveDoc={setActiveDoc}
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
          setActiveDoc={setActiveDoc}
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
          setActiveDoc={setActiveDoc}
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

  const [activeDoc, setActiveDoc] = useState(null);
  const [geometry, setGeometry] = useState<Feature[]>([]);
  const [interactiveGeometry, setInteractiveGeometry] = useState([]);
  const [extent, setExtent] = useState(null);
  const [docs, setDocs] = useState<any[]>([]);
  const [selectedActivities, setSelectedActivities] = useState([]);

  const initialContextMenuState: MapContextMenuData = { isOpen: false, lat: 0, lng: 0 };
  const [contextMenuState, setContextMenuState] = useState(initialContextMenuState);
  const [mapActivityType, setMapActivityType] = useState('All');

  const geoColors = {
    Observation: '#0BD2F0',
    Treatment: '#F99F04',
    Monitoring: '#BCA0DC'
  };

  /*
    Fetch activities from database and save them in state
    Also, call a helper function to save map geometries
  */
  const updateActivityList = useCallback(async () => {
    const activityResult = await databaseContext.database.find({
      selector: { docType: DocType.REFERENCE_ACTIVITY }
    });

    storeInteractiveGeoInfo(activityResult.docs);
    setDocs([...activityResult.docs]);
  }, [databaseContext.database]);

  /*
    When the selected map activity type changes, filter the docs by the type
    and store the associated geometries only
  */
  useEffect(() => {
    storeInteractiveGeoInfo(docs);
  }, [mapActivityType]);

  /*
    Store the interactive geometry info in state
  */
  const storeInteractiveGeoInfo = (activities: any) => {
    const mapGeos = getUpdatedGeoInfo(activities);

    setInteractiveGeometry([...mapGeos]);
  };

  /*
    On geometry change (user drawn), find out which activities are
    selected on the map container. If geometry is deleted, reset all activities
  */
  useEffect(() => {
    const docIdsWithinArea = [];

    if (geometry.length) {
      interactiveGeometry.forEach((iGeo: any) => {
        if (booleanIntersects(iGeo.geometry[0], geometry[0])) {
          docIdsWithinArea.push(iGeo.recordDocID);
        }
      });

      updateDocList(docIdsWithinArea);
    } else {
      updateActivityList();
    }
  }, [geometry]);

  /*
    When the active activity changes (on hover), change the color of the activity
    When the activity is no longer being hovered over, reset the geo color
  */
  useEffect(() => {
    if (!geometry.length) {
      return;
    }

    let updatedInteractiveGeos = [...interactiveGeometry];

    if (!activeDoc) {
      updatedInteractiveGeos = updatedInteractiveGeos.map((geo: any) => {
        geo.color = geoColors[geo.recordType];

        return geo;
      });

      setInteractiveGeometry(updatedInteractiveGeos);

      return;
    }

    updatedInteractiveGeos = updatedInteractiveGeos.map((geo: any) => {
      if (geo.recordDocID === activeDoc.activity_id) {
        geo.color = '#9E1A1A';
      }

      return geo;
    });

    setInteractiveGeometry(updatedInteractiveGeos);
  }, [activeDoc]);

  /*
    When an activity is selected in the list, change the color of the activity in geo
    Also change all callbacks, since the map will not sense state updates by itself
  */
  useEffect(() => {
    let updatedInteractiveGeos = [...interactiveGeometry];

    updatedInteractiveGeos = updatedInteractiveGeos.map((geo: any) => {
      const allButThis = selectedActivities.filter((activity) => geo.recordDocID !== activity.id);
      if (selectedActivities.length > allButThis.length) {
        geo.color = '#9E1A1A';
        geo.onClickCallback = () => {
          setSelectedActivities(allButThis);
        }
      } else {
        geo.color = geoColors[geo.recordType];
        geo.onClickCallback = () => {
          setSelectedActivities([...selectedActivities, {
            id: geo.recordDocID,
            subtype: geo.recordSubtype
          }]);
        }
      }

      return geo;
    });

    setInteractiveGeometry(updatedInteractiveGeos);
  }, [selectedActivities, setSelectedActivities]);

  /*
    Get updated interactive geometries based on the activities/selected map activity type
  */
  const getUpdatedGeoInfo = (documents: any) => {
    const mapGeos = [];

    documents.forEach((doc: any) => {
      if (doc.activityType === mapActivityType || mapActivityType === 'All') {
        mapGeos.push(getInteractiveGeoData(doc));
      }
    });

    return mapGeos;
  };

  /*
    Filter out activities within a drawn geometry polygon on the map
  */
  const updateDocList = (docIdsWithinArea: any[]) => {
    setDocs(docs.filter((doc: any) => docIdsWithinArea.some((docId: any) => docId === doc._id)));
  };

  /*
    Function to set the chosen map activity type in state
  */
  const handleMapActivityChange = (event: any) => {
    setMapActivityType(event.target.value);
  };

  /*
    Function to generate interactive geometry data object
  */
  const getInteractiveGeoData = (doc: any) => {

    return {
      recordDocID: doc._id,
      recordType: doc.activityType,
      recordSubtype: doc.activitySubtype,
      geometry: doc.geometry,
      color: geoColors[doc.activityType],
      description: `${doc.activityType}: ${doc._id}`,
      popUpComponent: ActivityPopup,
      onClickCallback: () => {setSelectedActivities([{
        id: doc._id,
        subtype: doc.activitySubtype  // TODO subtype?
      }])}
    };
  };

  /*
    What is displayed in the popup on click of a geo on the map
  */
  const ActivityPopup = (name: string) => {
    return '<div>' + name + '</div>';
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
      {!interactiveGeometry.length && <Typography>No activities available of the selected type.</Typography>}
      <br />
      <ReferenceActivityList
        docs={docs}
        databaseContext={databaseContext}
        setActiveDoc={setActiveDoc}
        selectedObservations={selectedActivities}
        setSelectedObservations={setSelectedActivities}
      />
    </Container>
  );
};

export default ReferenceActivitiesList;

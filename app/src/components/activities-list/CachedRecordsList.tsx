import { Box, Button, Container, List, Paper, Theme, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { Check } from '@mui/icons-material';
import booleanIntersects from '@turf/boolean-intersects';
import { Feature } from 'geojson';
import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { sanitizeRecord } from 'utils/addActivity';
import {
  ObservationsTable,
  PlantMonitoringTable,
  PlantTreatmentsTable,
  PointsOfInterestTable
} from '../../components/common/RecordTables';
import { DatabaseContext } from '../../contexts/DatabaseContext';
import { MapContextMenuData } from '../../features/home/map/MapContextMenu';
import { useDataAccess } from '../../hooks/useDataAccess';
import { useInvasivesApi } from '../../hooks/useInvasivesApi';
import { ICreateMetabaseQuery } from '../../interfaces/useInvasivesApi-interfaces';
import MapContainer, { getZIndex } from '../map/MapContainer';

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

const geoColors = {
  Observation: '#0BD2F0',
  Treatment: '#F99F04',
  Monitoring: '#BCA0DC',
  reference_point_of_interest: '#0BD2F0',
  selected_record: '#9E1A1A'
};

const CachedRecordsList: React.FC = (props) => {
  const classes = useStyles();
  const databaseContext2 = useContext(DatabaseContext);
  // data access WIP
  const invasivesApi = useInvasivesApi();
  const dataAccess = useDataAccess();

  const [geometry, setGeometry] = useState<Feature[]>([]);
  const [interactiveGeometry, setInteractiveGeometry] = useState([]);
  const [extent, setExtent] = useState(null);
  const [stateDocs, setDocs] = useState<any[]>([]);
  const docs = useMemo(() => stateDocs, [stateDocs?.length]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [metabaseQuerySubmitted, setMetabaseQuerySubmitted] = useState(false);

  const initialContextMenuState: MapContextMenuData = { isOpen: false, lat: 0, lng: 0 };
  const [contextMenuState, setContextMenuState] = useState(initialContextMenuState);

  /* Select or unselect a single doc */
  //NOSONAR
  const toggleDocSelected = useCallback((doc) => {
    const toggleSelectedFunction = (key) => (prevSelected) => {
      const wasPrevSelected = prevSelected.indexOf(key) !== -1;
      const getSelected = (inputPrevSelected, inputKey) => {
        return inputPrevSelected.filter((id) => id !== inputKey);
      };
      const newSelected = wasPrevSelected ? getSelected(prevSelected, key) : [...prevSelected, key];
      setInteractiveGeometry((prevGeos) => {
        return prevGeos.map((geo) => {
          if (geo._id === key) {
            geo.color = wasPrevSelected ? geoColors[geo.recordType] : geoColors.selected_record;
          }
          return geo;
        });
      });
      return newSelected;
    };

    if (doc.docType === 'reference_point_of_interest') {
      setSelectedPOIs(toggleSelectedFunction(doc._id));
    }
    switch (doc.activityType) {
      case 'Observation':
        setSelectedObservations(toggleSelectedFunction(doc._id));
        break;
      case 'Treatment':
        setSelectedTreatments(toggleSelectedFunction(doc._id));
        break;
      case 'Monitoring':
        setSelectedMonitorings(toggleSelectedFunction(doc._id));
        break;
    }
  }, []);

  /*
    Fetch activities from database and save them in state
    Also, call a helper function to save map geometries
  */
  const updateRecordList = useCallback(async () => {
    setLoading(true);
    try {
      const records = await dataAccess.getActivities(
        { activity_type: ['Observation', 'Treatment', 'Monitoring'] },
        databaseContext2,
        true, //force cache
        true //read reference_activity table instead of activity
      );
      const pois = await getPointsOfInterest();
      setPointsOfInterest(pois);

      const newDocs = records.rows
        ?.map((doc) => doc && sanitizeRecord(doc))
        .filter(
          (doc) => (doc.point_of_interest_id || doc.activity_id) && !doc.deleted_timestamp // reduncancy for safety
        );
      setDocs([...newDocs]);
      const mapGeos = [];
      newDocs.forEach((doc: any) => {
        /*
        What is displayed in the popup on click of a geo on the map
      */
        const ActivityPopup = (name: string) => {
          return `<div>${name}</div>`;
        };
        const description =
          doc.docType === 'reference_point_of_interest'
            ? `IAPP Point of Interest: ${doc.point_of_interest_id}`
            : `${doc.activityType}: ${doc._id}}`;
        mapGeos.push({
          _id: doc._id,
          recordDocID: doc._id,
          recordType: doc.activityType || doc.docType,
          recordSubtype: doc.activitySubtype,
          geometry: doc.geometry ? doc.geometry : null,
          color: geoColors[doc.activityType || doc.docType],
          description: description,
          popUpComponent: ActivityPopup,
          zIndex: getZIndex(doc),
          onClickCallback: () => {
            toggleDocSelected(doc);
          }
        });
      });
      setInteractiveGeometry([...mapGeos]);
    } catch (e) {
      console.dir(e);
      const errorString = JSON.stringify(e);
      setErrorMsg(errorString);
      console.log('error getting data');
    }
    setLoading(false);
  }, [toggleDocSelected]);

  /*
    On geometry change (user drawn), find out which activities are
    selected on the map container. If geometry is deleted, reset all activities
  */
  useEffect(() => {
    const docIdsWithinArea = [];
    if (geometry?.length) {
      interactiveGeometry.forEach((iGeo: any) => {
        if (iGeo.geometry !== null) {
          if (booleanIntersects(iGeo.geometry[0], geometry[0])) {
            docIdsWithinArea.push(iGeo.recordDocID);
          }
        }
      });
      // Filter out records within a drawn geometry polygon on the map
      const newDocs = docs.filter((doc: any) => docIdsWithinArea.some((docId: any) => docId === doc._id));
      setDocs(newDocs);
    } else {
      updateRecordList();
    }
  }, [geometry?.length]);

  const observations = useMemo(
    () => docs.filter((doc: any) => doc.activityType === 'Observation' || doc.activity_type === 'Observation'),
    [docs]
  );
  const [selectedObservations, setSelectedObservations] = useState([]);

  const treatments = useMemo(
    () => docs.filter((doc: any) => doc.activityType === 'Treatment' || doc.activity_type === 'Treatment'),
    [docs]
  );
  const [selectedTreatments, setSelectedTreatments] = useState([]);

  const monitorings = useMemo(
    () => docs.filter((doc: any) => doc.activityType === 'Monitoring' || doc.activity_type === 'Monitoring'),
    [docs]
  );
  const [selectedMonitorings, setSelectedMonitorings] = useState([]);

  const getPointsOfInterest = async () => {
    return dataAccess.getPointsOfInterest({ page: 1, limit: 1000, online: true });
  };

  const [pointsOfInterest, setPointsOfInterest] = useState([]);
  const [selectedPOIs, setSelectedPOIs] = useState([]);

  const createMetabaseQuery = async (event, selectedActivities, selectedPoints) => {
    setMetabaseQuerySubmitted(true);
    const queryCreate: ICreateMetabaseQuery = {
      activity_ids: selectedActivities,
      point_of_interest_ids: selectedPoints
    };
    try {
      const response = await invasivesApi.createMetabaseQuery(queryCreate);
      if (response?.activity_query_id && response?.activity_query_name) {
      } else {
        throw response;
      }
    } catch (error) {
      setMetabaseQuerySubmitted(false);
    }
  };

  useEffect(() => {
    setMetabaseQuerySubmitted(false);
  }, [selectedObservations.length, selectedTreatments.length, setSelectedMonitorings.length, selectedPOIs.length]);

  const totalSelected =
    selectedObservations.length + selectedTreatments.length + selectedMonitorings.length + selectedPOIs.length;

  const setSelectedGeneralized = (setSelectedFunction) => (newSelected) => {
    setSelectedFunction((prevSelected) => {
      setInteractiveGeometry((prevGeos) =>
        prevGeos.map((geo) => {
          if (prevSelected.indexOf(geo._id) !== newSelected.indexOf(geo._id)) {
            const isSelected = newSelected.indexOf(geo._id) !== -1;
            geo.color = isSelected ? geoColors.selected_record : geoColors[geo.recordType];
          }
          return geo;
        })
      );
      return newSelected;
    });
  };

  return (
    <Container className={classes.activitiesContent}>
      <Box mb={3} display="flex" justifyContent="space-between">
        <Typography variant="h4">Cached Activities</Typography>
        {docs.length > 0 && !loading && (
          <Box display="flex" justifyContent="space-between">
            <Button
              variant="contained"
              color="primary"
              className={classes.metabaseAddButton}
              disabled={!totalSelected || metabaseQuerySubmitted}
              startIcon={totalSelected && metabaseQuerySubmitted ? <Check /> : undefined}
              onClick={(event) =>
                createMetabaseQuery(
                  event,
                  [...selectedObservations, ...selectedTreatments, ...selectedMonitorings],
                  selectedPOIs
                )
              }>
              Create Metabase Query
            </Button>
          </Box>
        )}
      </Box>
      {docs.length > 0 && !loading && (
        <Paper style={{ height: 500 }}>
          <MapContainer
            classes={classes}
            mapId="references_page_map_container"
            geometryState={{ geometry, setGeometry }}
            //interactiveGeometryState={{ interactiveGeometry, setInteractiveGeometry }}
            extentState={{ extent, setExtent }}
            showDrawControls={true}
            contextMenuState={{ state: contextMenuState, setContextMenuState }}
          />
        </Paper>
      )}
      {loading && <Typography>Loading...</Typography>}
      {!loading && !interactiveGeometry?.length && !errorMsg !== null ? (
        <Typography>
          No cached records to display. Widen your selected area or fetch more on the Plan My Trip page.
        </Typography>
      ) : null}
      {!loading && errorMsg ? <Typography>Error getting cached data: {errorMsg}</Typography> : null}
      <br />
      {interactiveGeometry.length > 0 && !loading && (
        <List className={classes.activityList}>
          <ObservationsTable
            rows={observations}
            selected={selectedObservations}
            setSelected={setSelectedGeneralized(setSelectedObservations)}
            referenceData={true}
          />
          <PlantTreatmentsTable
            rows={treatments}
            selected={selectedTreatments}
            setSelected={setSelectedGeneralized(setSelectedTreatments)}
            referenceData={true}
          />
          <PlantMonitoringTable
            rows={monitorings}
            selected={selectedMonitorings}
            setSelected={setSelectedGeneralized(setSelectedMonitorings)}
            referenceData={true}
          />
          <PointsOfInterestTable
            rows={pointsOfInterest}
            selected={selectedPOIs}
            setSelected={setSelectedGeneralized(setSelectedPOIs)}
            referenceData={true}
          />
        </List>
      )}
    </Container>
  );
};

export default CachedRecordsList;

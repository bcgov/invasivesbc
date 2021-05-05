import { List, makeStyles, Paper, Theme, Typography, Button, Box, Container } from '@material-ui/core';
import { Check } from '@material-ui/icons';
import { ActivitySubtype, ActivityType } from 'constants/activities';
import { DocType } from 'constants/database';
import { DatabaseContext } from 'contexts/DatabaseContext';
import React, { useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import { useInvasivesApi } from 'hooks/useInvasivesApi';
import { ICreateMetabaseQuery } from 'interfaces/useInvasivesApi-interfaces';
import { notifySuccess, notifyError } from 'utils/NotificationUtils';
import { addLinkedActivityToDB } from 'utils/addActivity';
import MapContainer, { getZIndex } from 'components/map/MapContainer';
import RecordTable from 'components/common/RecordTable';
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

const activityStandardMapping = (doc) => ({
  ...doc,
  ...doc?.formData?.activity_data,
  ...doc?.formData?.activity_subtype_data,
  activity_id: doc.activity_id, // NOTE: activity_subtype_data.activity_id is overwriting this incorrectly
  jurisdiction_code: doc?.formData?.activity_data?.jurisdictions?.reduce(
    (output, jurisdiction) => [...output, jurisdiction.jurisdiction_code, '(', jurisdiction.percent_covered + '%', ')'],
    []
  ),
  created_timestamp: doc?.created_timestamp?.substring(0, 10),
  latitude: parseFloat(doc?.formData?.activity_data?.latitude).toFixed(6),
  longitude: parseFloat(doc?.formData?.activity_data?.longitude).toFixed(6)
});

const getSelectedKeys = (rows, selected) =>
  rows.filter((doc: any) => selected.includes(doc._id)).map((doc) => doc._id) || [];

const geoColors = {
  Observation: '#0BD2F0',
  Treatment: '#F99F04',
  Monitoring: '#BCA0DC',
  reference_point_of_interest: '#0BD2F0',
  selected_record: '#9E1A1A'
};

interface ICachedRecordsTable {
  rows: Array<any>;
  selected: Array<any>;
  setSelected: any;
  databaseContext?: any;
}

export const ObservationsTable: React.FC<ICachedRecordsTable> = (props) => {
  const history = useHistory();

  const { selected, setSelected, rows } = props;
  return useMemo(() => {
    return (
      <RecordTable
        tableName="Observations"
        tableSchemaType={[
          'Activity',
          'Observation',
          'Observation_PlantTerrestrial',
          'Observation_PlantAquatic',
          'ObservationPlantTerrestrialData',
          'Jurisdictions'
        ]}
        startingOrderBy="activity_id"
        startingOrder="desc"
        enableSelection
        selected={selected}
        setSelected={setSelected}
        headers={[
          'activity_id',
          {
            id: 'activity_subtype',
            valueMap: {
              Activity_Observation_PlantTerrestrial: 'Terrestrial Plant',
              Activity_Observation_PlantTerrestial: 'Terrestrial Plant', // TODO remove when our data isn't awful
              Activity_Observation_PlantAquatic: 'Aquatic Plant'
            }
          },
          {
            id: 'created_timestamp',
            title: 'Created Date'
          },
          'biogeoclimatic_zones',
          {
            id: 'elevation',
            type: 'number'
          },
          {
            id: 'flnro_districts',
            title: 'FLNRO Districs'
          },
          'ownership',
          'regional_districts',
          'invasive_species_agency_code',
          'jurisdiction_code',
          {
            id: 'latitude',
            title: 'Latitude',
            type: 'number'
          },
          {
            id: 'longitude',
            title: 'Longitude',
            type: 'number'
          },
          {
            id: 'reported_area',
            title: 'Area (m\u00B2)',
            type: 'number'
          },
          'access_description',
          'general_comment'
        ]}
        rows={rows}
        actions={{
          delete: {
            enabled: false
          },
          create_treatment: {
            key: 'create_treatment',
            enabled: true,
            action: (selectedRows) => {
              const ids = selectedRows.map((row: any) => row['activity_id']);
              history.push({
                pathname: `/home/activity/treatment`,
                search: '?observations=' + ids.join(','),
                state: { observations: ids }
              });
            },
            label: 'Create Treatment',
            bulkAction: true,
            rowAction: false,
            displayInvalid: 'error',
            invalidError: 'All selected activities must be of the same SubType to create a Treatment',
            /*
              Function to determine if all selected observation records are
              of the same subtype. For example: Cannot create a treatment if you select a plant
              and an animal observation, and most probably will not go treat a terrestrial
              and aquatic observation in a single treatment as those are different areas
            */
            bulkCondition: (selectedRows) => selectedRows.every((a, _, [b]) => a.subtype === b.subtype)
          }
        }}
      />
    );
  }, [rows?.length, selected?.length]);
};

export const TreatmentsTable: React.FC<ICachedRecordsTable> = (props) => {
  const history = useHistory();

  const { selected, setSelected, rows, databaseContext } = props;
  return useMemo(() => {
    return (
      <RecordTable
        tableName="Treatments"
        tableSchemaType={[
          'Activity',
          'Treatment',
          'Treatment_ChemicalPlant',
          'Treatment_MechanicalPlant',
          'Treatment_BiologicalPlant'
        ]}
        startingOrderBy="activity_id"
        startingOrder="desc"
        enableSelection
        selected={selected}
        setSelected={setSelected}
        headers={[
          'activity_id',
          {
            id: 'activity_subtype',
            valueMap: {
              Activity_Treatment_ChemicalPlant: 'Chemical Plant',
              Activity_Treatment_MechanicalPlant: 'Mechanical Plant',
              Activity_Treatment_BiologicalPlant: 'Biological Plant'
            }
          },
          {
            id: 'created_timestamp',
            title: 'Created Date'
          },
          'invasive_plant_code',
          'invasive_species_agency_code',
          'chemical_method_code',
          {
            id: 'reported_area',
            title: 'Area (m\u00B2)'
          },
          {
            id: 'latitude',
            title: 'Latitude',
            type: 'number'
          },
          {
            id: 'longitude',
            title: 'Longitude',
            type: 'number'
          },
          'elevation'
        ]}
        rows={rows}
        dropdown={(row) => (
          <RecordTable
            key={row._id}
            startingOrderBy="activity_id"
            startingOrder="desc"
            tableSchemaType={[
              'Activity',
              'Treatment',
              'Treatment_ChemicalPlant',
              'Treatment_MechanicalPlant',
              'Treatment_BiologicalPlant',
              'Jurisdictions'
            ]}
            headers={[
              'jurisdiction_code',
              'biogeoclimatic_zones',
              {
                id: 'flnro_districts',
                title: 'FLNRO Districts'
              },
              'ownership',
              'regional_districts',
              'access_description',
              'general_comment'
            ]}
            rows={[row]}
            pagination={false}
          />
        )}
        actions={{
          delete: {
            enabled: false
          },
          create_monitoring: {
            key: 'create_monitoring',
            enabled: true,
            label: 'Create Monitoring',
            bulkAction: false,
            rowAction: true,
            displayInvalid: 'hidden',
            rowCondition: (row) => row.activityType === 'Treatment',
            action: async (selectedRows) => {
              if (selectedRows.length !== 1)
                // action is for creating a single monitoring from a given row
                // NOTE: might want to extend this into a multi-row monitoring action later
                return;
              const activity = selectedRows[0];

              const addedActivity = await addLinkedActivityToDB(
                databaseContext,
                ActivityType.Monitoring,
                calculateMonitoringSubtypeByTreatmentSubtype(activity.activitySubtype),
                activity
              );
              await databaseContext.database.upsert(DocType.APPSTATE, (appStateDoc: any) => {
                return { ...appStateDoc, activeActivity: addedActivity._id };
              });

              history.push(`/home/activity`);
            }
          }
        }}
      />
    );
  }, [rows?.length, selected?.length]);
};

export const MonitoringTable: React.FC<ICachedRecordsTable> = (props) => {
  const { selected, setSelected, rows } = props;
  return useMemo(() => {
    return (
      <RecordTable
        tableName="Monitoring"
        tableSchemaType={[
          'Activity',
          'Monitoring',
          'Monitoring_ChemicalTerrestrialAquaticPlant',
          'Monitoring_MechanicalTerrestrialAquaticPlant',
          'Monitoring_BiologicalTerrestrialPlant'
        ]}
        startingOrderBy="monitoring_id"
        startingOrder="desc"
        enableSelection
        selected={selected}
        setSelected={setSelected}
        headers={[
          'activity_id',
          {
            id: 'activity_subtype',
            valueMap: {
              Activity_Monitoring_ChemicalPlant: 'Chemical Plant',
              Activity_Monitoring_MechanicalPlant: 'Mechanical Plant',
              Activity_Monitoring_BiologicalPlant: 'Biological Plant'
            }
          },
          {
            id: 'created_timestamp',
            title: 'Created Date'
          },
          'invasive_plant_code',
          'invasive_species_agency_code',
          {
            id: 'reported_area',
            title: 'Area (m\u00B2)'
          },
          {
            id: 'latitude',
            title: 'Latitude',
            type: 'number'
          },
          {
            id: 'longitude',
            title: 'Longitude',
            type: 'number'
          },
          'elevation'
        ]}
        rows={rows}
        actions={{
          delete: {
            enabled: false
          }
        }}
      />
    );
  }, [rows?.length, selected?.length]);
};

export const PointsOfInterestTable: React.FC<ICachedRecordsTable> = (props) => {
  const { selected, setSelected, rows } = props;
  return useMemo(() => {
    return (
      <RecordTable
        tableName="Points of Interest"
        tableSchemaType={['Point_Of_Interest', 'IAPP_Site', 'Jurisdictions']}
        startingOrderBy="site_id"
        startingOrder="desc"
        enableSelection
        selected={selected}
        setSelected={setSelected}
        headers={[
          {
            id: 'site_id',
            type: 'number'
          },
          {
            id: 'created_date_on_device',
            title: 'Created Date'
          },
          'jurisdiction_code',
          'elevation',
          'slope_code',
          'aspect_code',
          'soil_texture_code',
          {
            id: 'latitude',
            title: 'Latitude',
            type: 'number'
          },
          {
            id: 'longitude',
            title: 'Longitude',
            type: 'number'
          },
          'access_description',
          'general_comment'
        ]}
        rows={rows}
        actions={{
          delete: {
            enabled: false
          },
          edit: {
            enabled: false
          }
        }}
      />
    );
  }, [rows?.length, selected?.length]);
};

const CachedRecordsList: React.FC = (props) => {
  const classes = useStyles();
  const databaseContext = useContext(DatabaseContext);
  const invasivesApi = useInvasivesApi();

  const [geometry, setGeometry] = useState<Feature[]>([]);
  const [interactiveGeometry, setInteractiveGeometry] = useState([]);
  const [extent, setExtent] = useState(null);
  const [stateDocs, setDocs] = useState<any[]>([]);
  const docs = useMemo(() => stateDocs, [stateDocs?.length]);
  const [loading, setLoading] = useState(true);
  const [metabaseQuerySubmitted, setMetabaseQuerySubmitted] = useState(false);

  const initialContextMenuState: MapContextMenuData = { isOpen: false, lat: 0, lng: 0 };
  const [contextMenuState, setContextMenuState] = useState(initialContextMenuState);

  /* Select or unselect a single doc */
  const toggleDocSelected = useCallback((doc) => {
    const toggleSelectedFunction = (key) => (prevSelected) => {
      const wasPrevSelected = prevSelected.indexOf(key) !== -1;
      const newSelected = wasPrevSelected ? prevSelected.filter((id) => id !== key) : [...prevSelected, key];
      setInteractiveGeometry((prevGeos) => {
        return prevGeos.map((geo) => {
          if (geo._id === key) geo.color = wasPrevSelected ? geoColors[geo.recordType] : geoColors.selected_record;
          return geo;
        });
      });
      return newSelected;
    };

    if (doc.docType === 'reference_point_of_interest')
      setSelectedPOIs(toggleSelectedFunction(doc._id));
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
    const result = await databaseContext.database.allDocs({ include_docs: true });
    const newDocs = result?.rows
      ?.map((doc) => doc.doc)
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
        return '<div>' + name + '</div>';
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
        geometry: doc.geometry,
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
        if (booleanIntersects(iGeo.geometry[0], geometry[0])) {
          docIdsWithinArea.push(iGeo.recordDocID);
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
    () => docs.filter((doc: any) => doc.activityType === 'Observation').map(activityStandardMapping),
    [docs]
  );
  const [selectedObservations, setSelectedObservations] = useState([]);

  const treatments = useMemo(
    () => docs.filter((doc: any) => doc.activityType === 'Treatment').map(activityStandardMapping),
    [docs]
  );
  const [selectedTreatments, setSelectedTreatments] = useState([]);

  const monitorings = useMemo(
    () => docs.filter((doc: any) => doc.activityType === 'Monitoring').map(activityStandardMapping),
    [docs]
  );
  const [selectedMonitorings, setSelectedMonitorings] = useState([]);

  const pointsOfInterest = useMemo(() => {
    return docs
      .filter((doc: any) => doc.docType === 'reference_point_of_interest')
      .map((doc) => ({
        ...doc,
        ...doc?.formData?.point_of_interest_data,
        ...doc?.formData?.point_of_interest_type_data,
        jurisdiction_code: doc?.formData?.surveys?.[0]?.jurisdictions?.reduce(
          (output, jurisdiction) => [
            ...output,
            jurisdiction.jurisdiction_code,
            '(',
            (jurisdiction.percent_covered ? jurisdiction.percent_covered : 100) + '%',
            ')'
          ],
          []
        ),
        latitude: parseFloat(doc?.point_of_interest_payload?.geometry[0]?.geometry?.coordinates[1]).toFixed(6),
        longitude: parseFloat(doc?.point_of_interest_payload?.geometry[0]?.geometry?.coordinates[0]).toFixed(6)
      }));
  }, [docs]);
  const [selectedPOIs, setSelectedPOIs] = useState([]);

  const createMetabaseQuery = async (event, selectedActivities, selectedPoints) => {
    await setMetabaseQuerySubmitted(true);
    const queryCreate: ICreateMetabaseQuery = {
      activity_ids: selectedActivities,
      point_of_interest_ids: selectedPoints
    };
    try {
      let response = await invasivesApi.createMetabaseQuery(queryCreate);
      if (response?.activity_query_id && response?.activity_query_name)
        notifySuccess(
          databaseContext,
          `Created a new Metabase Query, with name "${response.activity_query_name}" and ID ${response.activity_query_id}`
        );
      else throw response;
    } catch (error) {
      notifyError(
        databaseContext,
        'Unable to create new Metabase Query.  There may an issue with your connection to the Metabase API: ' + error
      );
      await setMetabaseQuerySubmitted(false);
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
        <Paper>
          <MapContainer
            classes={classes}
            mapId="references_page_map_container"
            geometryState={{ geometry, setGeometry }}
            interactiveGeometryState={{ interactiveGeometry, setInteractiveGeometry }}
            extentState={{ extent, setExtent }}
            showDrawControls={true}
            contextMenuState={{ state: contextMenuState, setContextMenuState }}
          />
        </Paper>
      )}
      {loading && <Typography>Loading...</Typography>}
      {!loading && !interactiveGeometry?.length && (
        <Typography>
          No cached records to display. Widen your selected area or fetch more on the Plan My Trip page.
        </Typography>
      )}
      <br />
      {interactiveGeometry.length > 0 && !loading && (
        <List className={classes.activityList}>
          <ObservationsTable
            rows={observations}
            selected={selectedObservations}
            setSelected={setSelectedGeneralized(setSelectedObservations)}
          />
          <TreatmentsTable
            rows={treatments}
            selected={selectedTreatments}
            setSelected={setSelectedGeneralized(setSelectedTreatments)}
          />
          <MonitoringTable
            rows={monitorings}
            selected={selectedMonitorings}
            setSelected={setSelectedGeneralized(setSelectedMonitorings)}
          />
          <PointsOfInterestTable
            rows={pointsOfInterest}
            selected={selectedPOIs}
            setSelected={setSelectedGeneralized(setSelectedPOIs)}
            databaseContext={databaseContext}
          />
        </List>
      )}
    </Container>
  );
};

export default CachedRecordsList;

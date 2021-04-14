import { List, makeStyles, Paper, Theme, Typography, Button, Box, Container } from '@material-ui/core';
import { Check } from '@material-ui/icons';
import { ActivitySubtype, ActivityType } from 'constants/activities';
import { DocType } from 'constants/database';
import { DatabaseContext } from 'contexts/DatabaseContext';
import React, { useContext, useEffect, useState, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { useInvasivesApi } from 'hooks/useInvasivesApi';
import { ICreateMetabaseQuery } from 'interfaces/useInvasivesApi-interfaces';
import { notifySuccess, notifyError } from 'utils/NotificationUtils';
import { addLinkedActivityToDB } from 'utils/addActivity';
import MapContainer from 'components/map/MapContainer';
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

interface ICachedRecords {
  docs: any;
  databaseContext: any;
  setActiveDoc: Function;
  selected: Array<any>;
  setSelected: Function;
  setLastCreatedMetabaseQuery: Function;
}

const CachedRecords: React.FC<ICachedRecords> = (props) => {
  const { docs, databaseContext } = props;

  const classes = useStyles();
  const history = useHistory();

  const { selected, setSelected } = props;

  const observations = docs.filter((doc: any) => doc.activityType === 'Observation');
  const selectedObservations = observations.filter((doc: any) => selected.includes(doc._id)).map((doc) => doc._id);
  const setSelectedObservations = (newSelected) =>
    setSelected([...newSelected, ...selectedTreatments, ...selectedMonitorings, ...selectedPOIs]);

  const treatments = docs.filter((doc: any) => doc.activityType === 'Treatment');
  const selectedTreatments = treatments.filter((doc: any) => selected.includes(doc._id)).map((doc) => doc._id);
  const setSelectedTreatments = (newSelected) =>
    setSelected([...selectedObservations, ...newSelected, ...selectedMonitorings, ...selectedPOIs]);

  const monitorings = docs.filter((doc: any) => doc.activityType === 'Monitoring');
  const selectedMonitorings = monitorings.filter((doc: any) => selected.includes(doc._id)).map((doc) => doc._id);
  const setSelectedMonitorings = (newSelected) =>
    setSelected([...selectedObservations, ...selectedTreatments, ...newSelected, ...selectedPOIs]);

  const pointsOfInterest = docs.filter((doc: any) => doc.docType === 'reference_point_of_interest');
  const selectedPOIs = pointsOfInterest.filter((doc: any) => selected.includes(doc._id)).map((doc) => doc._id);
  const setSelectedPOIs = (newSelected) =>
    setSelected([...selectedObservations, ...selectedTreatments, ...selectedMonitorings, ...newSelected]);

  const activityStandardMapping = (doc) => ({
    ...doc,
    ...doc?.formData?.activity_data,
    ...doc?.formData?.activity_subtype_data,
    activity_id: doc.activity_id, // NOTE: activity_subtype_data.activity_id is overwriting this incorrectly
    jurisdictions: doc?.formData?.activity_data?.jurisdictions?.reduce((output, jurisdiction) => [
      ...output,
      jurisdiction.jurisdiction_code,
      jurisdiction.percent_covered + '%'
    ], []),
    created_timestamp: doc?.created_timestamp?.substring(0,10),
    latitude: parseFloat(doc?.formData?.activity_data?.latitude).toFixed(6),
    longitude: parseFloat(doc?.formData?.activity_data?.longitude).toFixed(6)
  });

  return (
    <List className={classes.activityList}>
      <RecordTable
        tableName="Observations"
        tableSchemaType={[
          "Activity",
          "Observation",
          "Observation_PlantTerrestrial",
          "Observation_PlantAquatic",
          "ObservationPlantTerrestrialData"
        ]}
        startingOrderBy="activity_id"
        startingOrder="desc"
        enableSelection
        selected={selectedObservations}
        setSelected={setSelectedObservations}
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
          {
            id: 'jurisdictions',
            title: 'Jurisdictions'
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
          {
            id: 'reported_area',
            title: 'Area (m\u00B2)'
          },
          'access_description',
          'general_comment'
        ]}
        rows={!observations?.length ? [] : observations.map(activityStandardMapping)}
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
      <RecordTable
        tableName="Treatments"
        tableSchemaType={[
          "Activity",
          "Treatment",
          "Treatment_ChemicalPlant",
          "Treatment_MechanicalPlant",
          "Treatment_BiologicalPlant"
        ]}
        startingOrderBy="activity_id"
        startingOrder="desc"
        enableSelection
        selected={selectedTreatments}
        setSelected={setSelectedTreatments}
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
        rows={!treatments?.length ? [] : treatments.map(activityStandardMapping)}
        dropdown={(row) => (
          <>
            <RecordTable
              startingOrderBy="activity_id"
              startingOrder="desc"
              tableSchemaType={[
                "Activity",
                "Treatment",
                "Treatment_ChemicalPlant",
                "Treatment_MechanicalPlant",
                "Treatment_BiologicalPlant"
              ]}
              headers={[
                'jurisdictions',
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
          </>
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
      <RecordTable
        tableName="Monitoring"
        tableSchemaType={[
          "Activity",
          "Monitoring",
          "Monitoring_ChemicalTerrestrialAquaticPlant",
          "Monitoring_MechanicalTerrestrialAquaticPlant",
          "Monitoring_BiologicalTerrestrialPlant"
        ]}
        startingOrderBy="monitoring_id"
        startingOrder="desc"
        enableSelection
        selected={selectedMonitorings}
        setSelected={setSelectedMonitorings}
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
        rows={!monitorings?.length ? [] : monitorings.map(activityStandardMapping)}
        actions={{
          delete: {
            enabled: false
          }
        }}
      />
      <RecordTable
        tableName="Points of Interest"
        tableSchemaType={[
          "Point_Of_Interest",
          "IAPP_Site"
        ]}
        startingOrderBy="site_id"
        startingOrder="desc"
        enableSelection
        selected={selectedPOIs}
        setSelected={setSelectedPOIs}
        headers={[
          {
            id: 'site_id',
            type: 'number'
          },
          {
            id: 'created_date_on_device',
            title: 'Created Date'
          },
          'jurisdictions',
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
        rows={
          !pointsOfInterest?.length
            ? []
            : pointsOfInterest.map((doc) => ({
                ...doc,
                ...doc?.formData?.point_of_interest_data,
                ...doc?.formData?.point_of_interest_type_data,
                jurisdictions: doc?.formData?.surveys?.[0]?.jurisdictions
                  ? doc?.formData?.surveys?.[0]?.jurisdictions
                      .map((jur) => jur.jurisdiction_code + ' (' + jur.percent_covered + '%)')
                      .join(', ')
                  : '',
                latitude: parseFloat(doc?.point_of_interest_payload?.geometry[0]?.geometry?.coordinates[1]).toFixed(6),
                longitude: parseFloat(doc?.point_of_interest_payload?.geometry[0]?.geometry?.coordinates[0]).toFixed(6)
              }))
        }
        actions={{
          delete: {
            enabled: false
          },
          edit: {
            enabled: false
          }
        }}
      />
    </List>
  );
};

const CachedRecordsList: React.FC = () => {
  const classes = useStyles();
  const databaseContext = useContext(DatabaseContext);
  const invasivesApi = useInvasivesApi();

  const [activeDoc, setActiveDoc] = useState(null);
  const [geometry, setGeometry] = useState<Feature[]>([]);
  const [interactiveGeometry, setInteractiveGeometry] = useState([]);
  const [extent, setExtent] = useState(null);
  const [docs, setDocs] = useState<any[]>([]);
  const [selected, setSelected] = useState([]);
  const [lastCreatedMetabaseQuery, setLastCreatedMetabaseQuery] = useState([]);

  const initialContextMenuState: MapContextMenuData = { isOpen: false, lat: 0, lng: 0 };
  const [contextMenuState, setContextMenuState] = useState(initialContextMenuState);

  const geoColors = {
    Observation: '#0BD2F0',
    Treatment: '#F99F04',
    Monitoring: '#BCA0DC',
    reference_point_of_interest: '#0BD2F0',
    selected_record: '#9E1A1A'
  };

  /*
    Fetch activities from database and save them in state
    Also, call a helper function to save map geometries
  */
  const updateRecordList = useCallback(async () => {
    const result = await databaseContext.database.find({
      selector: {
        $or: [{ deleted_timestamp: { $exists: false } }, { deleted_timestamp: { $type: 'null' } }]
      }
    });
    const activitiesAndPOIs = result?.docs?.filter(
      (doc) => (doc.point_of_interest_id || doc.activity_id) && !doc.deleted_timestamp // reduncancy for safety
    );

    storeInteractiveGeoInfo(activitiesAndPOIs);
    setDocs([...activitiesAndPOIs]);
  }, [databaseContext.database]);

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
      updateRecordList();
    }
  }, [geometry]);

  /*
    When a record is selected in the list, change the color of the record in geo
    Also change all callbacks, since the map will not sense state updates by itself
  */
  useEffect(() => {
    let updatedInteractiveGeos = [...interactiveGeometry];

    updatedInteractiveGeos = updatedInteractiveGeos.map((geo: any) => {
      const allButThis = selected.filter((id) => geo.recordDocID !== id);
      if (selected.length > allButThis.length) {
        geo.color = geoColors.selected_record;
        geo.onClickCallback = () => {
          setSelected(allButThis);
        };
      } else {
        geo.color = geoColors[geo.recordType];
        geo.onClickCallback = () => {
          setSelected([...selected, geo.recordDocID]);
        };
      }

      return geo;
    });

    setInteractiveGeometry(updatedInteractiveGeos);
  }, [selected, setSelected]);

  /*
    Get updated interactive geometries based on the activities/selected map record type
  */
  const getUpdatedGeoInfo = (documents: any) => {
    const mapGeos = [];

    documents.forEach((doc: any) => mapGeos.push(getInteractiveGeoData(doc)));

    return mapGeos;
  };

  /*
    Filter out records within a drawn geometry polygon on the map
  */
  const updateDocList = (docIdsWithinArea: any[]) => {
    setDocs(docs.filter((doc: any) => docIdsWithinArea.some((docId: any) => docId === doc._id)));
  };

  /*
    Function to generate interactive geometry data object
  */
  const getInteractiveGeoData = (doc: any) => {
    /*
      What is displayed in the popup on click of a geo on the map
    */
    const ActivityPopup = (name: string) => {
      return '<div>' + name + '</div>';
    };
    const description =
      doc.docType === 'reference_point_of_interest'
        ? `IAPP Point of Interest: ${doc.point_of_interest_id}`
        : `${doc.activityType}: ${doc._id}`;
    return {
      recordDocID: doc._id,
      recordType: doc.activityType || doc.docType,
      recordSubtype: doc.activitySubtype,
      geometry: doc.geometry,
      color: geoColors[doc.activityType || doc.docType],
      description: description,
      popUpComponent: ActivityPopup,
      onClickCallback: () => {
        setSelected([doc._id]);
      }
    };
  };

  const createMetabaseQuery = async () => {
    await setLastCreatedMetabaseQuery(selected);
    const queryCreate: ICreateMetabaseQuery = {
      point_of_interest_ids: selected.filter((id) => !isNaN(id)),
      activity_ids: selected.filter((id) => isNaN(id))
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
      await setLastCreatedMetabaseQuery([]);
    }
  };

  const metabaseQuerySubmitted = JSON.stringify(lastCreatedMetabaseQuery) == JSON.stringify(selected);

  return (
    <Container className={classes.activitiesContent}>
      <Box mb={3} display="flex" justifyContent="space-between">
        <Typography variant="h4">Cached Activities</Typography>
        <Box display="flex" justifyContent="space-between">
          <Button
            variant="contained"
            color="primary"
            className={classes.metabaseAddButton}
            disabled={!selected.length || metabaseQuerySubmitted}
            startIcon={selected.length && metabaseQuerySubmitted ? <Check /> : undefined}
            onClick={() => createMetabaseQuery()}>
            Create Metabase Query
          </Button>
        </Box>
      </Box>
      {interactiveGeometry.length > 0 && (
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
      {!interactiveGeometry.length && <Typography>No activities available of the selected type.</Typography>}
      <br />
      <CachedRecords
        docs={docs}
        databaseContext={databaseContext}
        setActiveDoc={setActiveDoc}
        selected={selected}
        setSelected={setSelected}
        setLastCreatedMetabaseQuery={setLastCreatedMetabaseQuery}
      />
    </Container>
  );
};

export default CachedRecordsList;

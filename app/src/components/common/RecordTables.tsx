import { List, makeStyles, Paper, Theme, Typography, Button, Box, Container } from '@material-ui/core';
import { Check } from '@material-ui/icons';
import { ActivitySubtype, ActivityType } from 'constants/activities';
import { DocType, DEFAULT_PAGE_SIZE } from 'constants/database';
import { DatabaseContext } from 'contexts/DatabaseContext';
import React, { useContext, useEffect, useState, useCallback, useMemo, InputHTMLAttributes } from 'react';
import { useHistory } from 'react-router-dom';
import { useInvasivesApi } from 'hooks/useInvasivesApi';
import { ICreateMetabaseQuery } from 'interfaces/useInvasivesApi-interfaces';
import { notifySuccess, notifyError } from 'utils/NotificationUtils';
import { addLinkedActivityToDB } from 'utils/addActivity';
import MapContainer, { getZIndex } from 'components/map/MapContainer';
import RecordTable, { IRecordTable } from 'components/common/RecordTable';
import { Feature } from 'geojson';
import { MapContextMenuData } from 'features/home/map/MapContextMenu';
import booleanIntersects from '@turf/boolean-intersects';

export const activityStandardMapping = (doc) => ({
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

export const poiStandardMapping = (doc) => ({
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
  longitude: parseFloat(doc?.point_of_interest_payload?.geometry[0]?.geometry?.coordinates[0]).toFixed(6),
});


export const poiStandardDBMapping = (doc) => ({
  ...doc,
  ...doc.point_of_interest_payload?.form_data?.point_of_interest_data,
  ...doc.point_of_interest_payload?.form_data?.point_of_interest_type_data,
  jurisdiction_code: doc.point_of_interest_payload?.form_data?.surveys?.[0]?.jurisdictions?.reduce(
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
  longitude: parseFloat(doc?.point_of_interest_payload?.geometry[0]?.geometry?.coordinates[0]).toFixed(6),
  // pulling these from plan my trip:
  _id: 'POI' + doc.point_of_interest_id,
  docType: DocType.REFERENCE_POINT_OF_INTEREST,
  //trip_IDs: doc?.trip_IDs ? [...doc.trip_IDs, props.trip_ID] : [props.trip_ID],
  formData: doc.point_of_interest_payload.form_data,
  pointOfInterestType: doc.point_of_interest_type,
  pointOfInterestSubtype: doc.point_of_interest_subtype,
  geometry: [...doc.point_of_interest_payload.geometry],
});

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

export const ObservationsTable: React.FC<IRecordTable> = (props) => {
  const history = useHistory();
  const { selected, setSelected, actions } = props;
  const rows = props.rows.map(activityStandardMapping);
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
          'Jurisdiction'
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
          ...actions,
          delete: {
            enabled: false,
            ...actions?.delete
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
            bulkCondition: (selectedRows) => selectedRows.every((a, _, [b]) => a.subtype === b.subtype),
            ...props.actions?.create_treatment
          }
        }}
      />
    );
  }, [rows?.length, selected?.length, JSON.stringify(actions)]);
};

export const TreatmentsTable: React.FC<IRecordTable> = (props) => {
  const history = useHistory();
  const databaseContext = useContext(DatabaseContext);

  const { selected, setSelected } = props;
  const rows = props.rows.map(activityStandardMapping);
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
              'Jurisdiction'
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

export const MonitoringTable: React.FC<IRecordTable> = (props) => {
  const { selected, setSelected } = props;
  const rows = props.rows.map(activityStandardMapping);
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

export const PointsOfInterestTable: React.FC<IRecordTable> = (props) => {
  const { selected, setSelected } = props;
  const invasivesApi = useInvasivesApi();
  return useMemo(() => {
    return (
      <RecordTable
        tableName="Points of Interest"
        tableSchemaType={['Point_Of_Interest', 'IAPP_Site', 'Jurisdiction']}
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
          'site_elevation',
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
        rows={async ({page, rowsPerPage, order}) => {
          // Fetches fresh from the API (web).  TODO fetch from SQLite
          let dbPageSize = DEFAULT_PAGE_SIZE;
          if (dbPageSize - ((page * rowsPerPage) % dbPageSize) < 3 * rowsPerPage) // if page is right near the db page limit
            dbPageSize = (page * rowsPerPage) % dbPageSize; // set the limit to the current row count instead
          const result = await invasivesApi.getPointsOfInterest({
            page: Math.floor(page * rowsPerPage / dbPageSize),
            limit: dbPageSize,
            order: order
          });
          return {
            rows: result.rows.map(poiStandardDBMapping),
            count: result.count
          };
        }}
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
  }, [selected?.length]);
};

export const IAPPSurveyTable: React.FC<IRecordTable> = (props) => {
  const { selected, setSelected, rows } = props;
  return useMemo(() => {
    return (
      <RecordTable
        tableName={'Survey Details'}
        keyField="survey_id"
        startingOrderBy="survey_id"
        startingOrder="desc"
        tableSchemaType={['IAPP_Survey']}
        actions={false}
        headers={[
          {
            id: 'survey_id',
            type: 'number'
          },
          'invasive_plant_code',
          'common_name',
          'genus',
          'survey_date',
          'invasive_species_agency_code',
          'reported_area',
          {
            id: 'invasive_plant_density_code',
            align: 'center',
            title: 'Density'
          },
          {
            id: 'invasive_plant_distribution_code',
            align: 'center',
            title: 'Distribution'
          },
          'general_comment'
        ]}
        rows={
          !rows?.length
            ? []
            : rows.map((row) => ({
                ...row,
                density: row.density + (row.density ? ' (' + row.invasive_plant_density_code + ')' : ''),
                distribution:
                  row.distribution + (row.distribution ? ' (' + row.invasive_plant_distribution_code + ')' : '')
              }))
        }
      />
    );
  }, [rows?.length, selected?.length]);
};

export const IAPPMonitoringTable: React.FC<IRecordTable> = (props) => {
  const { rows } = props;
  return useMemo(() => {
    return (
      <RecordTable
        tableName="Monitoring"
        startExpanded={true}
        startingOrderBy="monitoring_id"
        startingOrder="desc"
        keyField="monitoring_id"
        tableSchemaType={['IAPP_Monitoring']}
        actions={false}
        headers={[
          {
            id: 'monitoring_id',
            type: 'number'
          },
          'monitoring_date',
          'invasive_species_agency_code',
          'efficacy_code',
          {
            id: 'project_code_label',
            title: 'Project Code'
          },
          'general_comment'
        ]}
        rows={
          !rows.length
            ? []
            : rows.map((monitor, j) => ({
              ...monitor,
              project_code_label: monitor.project_code[0].description
            }))
        }
      />
    );
  }, [rows?.length]);
};

export const IAPPMechanicalTreatmentsTable: React.FC<IRecordTable> = (props) => {
  const { rows } = props;
  return useMemo(() => {
    return (
      <RecordTable
        tableName="Mechanical Treatments and Efficacy Monitoring"
        startExpanded={false}
        keyField="treatment_id"
        startingOrderBy="treatment_id"
        startingOrder="desc"
        tableSchemaType={['IAPP_Treatment', 'IAPP_Mechanical_Treatment']}
        actions={false}
        headers={[
          {
            id: 'treatment_id',
            type: 'number'
          },
          {
            id: 'common_name',
            title: 'Species (Common Name)'
          },
          'treatment_date',
          'invasive_species_agency_code',
          'reported_area',
          'mechanical_method_code',
          {
            id: 'project_code_label',
            title: 'Project Code'
          },
          'general_comment'
        ]}
        rows={
          !rows.length
            ? []
            : rows.map((row) => ({
                ...row,
                project_code_label: row.project_code[0].description
              }))
        }
        dropdown={(row) =>
          !row.monitoring?.length ? undefined : (
            <IAPPMonitoringTable rows={row.monitoring} />
          )
        }
      />
    );
  }, [rows?.length]);
};

export const IAPPChemicalTreatmentsTable: React.FC<IRecordTable> = (props) => {
  const { rows } = props;
  return useMemo(() => {
    return (
      <RecordTable
        tableName="Chemical Treatments and Efficacy Monitoring"
        startExpanded={false}
        keyField="treatment_id"
        startingOrderBy="treatment_id"
        startingOrder="desc"
        tableSchemaType={['IAPP_Treatment', 'IAPP_Chemical_Treatment']}
        actions={false}
        headers={[
          {
            id: 'treatment_id',
            type: 'number'
          },
          {
            id: 'common_name',
            title: 'Species (Common Name)'
          },
          'treatment_date',
          'invasive_species_agency_code',
          'reported_area',
          'chemical_method_code',
          {
            id: 'project_code_label',
            title: 'Project Code'
          },
          'general_comment'
        ]}
        rows={
          !rows.length
            ? []
            : rows.map((row) => ({
                ...row,
                project_code_label: row.project_code[0].description
              }))
        }
        dropdown={(row) => (
          <React.Fragment key={row.treatment_id + '_expanded'}>
            <RecordTable
              startExpanded={true}
              keyField="treatment_id"
              actions={false}
              tableSchemaType={['IAPP_Treatment', 'IAPP_Chemical_Treatment', 'Herbicide']}
              headers={[
                'liquid_herbicide_code',
                'herbicide_description',
                'application_rate',
                'herbicide_amount',
                'dilution',
                'mix_delivery_rate',
                {
                  id: 'mix_delivery_rate',
                  title: 'Mix Delivery Rate'
                }
              ]}
              rows={[row]} // singleton expanded table
              enableFiltering={false}
            />
            <RecordTable
              startExpanded={true}
              keyField="treatment_id"
              actions={false}
              tableSchemaType={['IAPP_Treatment', 'IAPP_Chemical_Treatment', 'Herbicide']}
              headers={[
                'pmp_confirmation_number',
                'pmra_reg_number',
                'pup_number',
                'service_license_number',
                'treatment_time',
                'temperature',
                'humidity',
                'wind_speed',
                'wind_direction',
                'wind_direction_code'
              ]}
              rows={[row]} // singleton expanded table
              enableFiltering={false}
            />
            {row.monitoring.length > 0 && <IAPPMonitoringTable rows={row.monitoring} />}
          </React.Fragment>
        )}
      />
    );
  }, [rows?.length]);
};

export const IAPPBiologicalTreatmentsTable: React.FC<IRecordTable> = (props) => {
  const { rows } = props;
  return useMemo(() => {
    return (
      <RecordTable
        tableName="Biological Treatments and Efficacy Monitoring"
        startExpanded={false}
        keyField="treatment_id"
        startingOrderBy="treatment_id"
        startingOrder="desc"
        tableSchemaType={['IAPP_Treatment', 'IAPP_Biological_Treatment']}
        actions={false}
        headers={[
          {
            id: 'treatment_id',
            type: 'number'
          },
          {
            id: 'common_name',
            title: 'Species (Common Name)'
          },
          'treatment_date',
          'collection_date',
          'invasive_species_agency_code',
          'classified_area_code',
          'biological_agent_code',
          'bioagent_source',
          'biological_agent_stage_code',
          'agent_source',
          'release_quantity',
          {
            id: 'project_code_label',
            title: 'Project Code'
          },
          'general_comment'
        ]}
        rows={
          !rows.length
            ? []
            : rows.map((row) => ({
                ...row,
                project_code_label: row.project_code[0].description
              }))
        }
        dropdown={(row) =>
          !row.monitoring?.length ? undefined : (
            <IAPPBiologicalTreatmentsMonitoringTable rows={row.monitoring}/>
          )
        }
      />
    );
  }, [rows?.length]);
};

export const IAPPBiologicalDispersalsTable: React.FC<IRecordTable> = (props) => {
  const { rows } = props;
  return useMemo(() => {
    return (
      <RecordTable
        tableName="Biological Dispersals"
        startExpanded={false}
        keyField="biological_id"
        startingOrderBy="biological_id"
        startingOrder="desc"
        tableSchemaType={['IAPP_Biological_Dispersal']}
        actions={false}
        headers={[
          {
            id: 'monitoring_id',
            type: 'number'
          },
          {
            id: 'common_name',
            title: 'Species (Common)'
          },
          'monitoring_date',
          {
            id: 'project_code_label',
            title: 'Project Code'
          },
          'plant_count',
          'agent_count',
          'count_duration',
          'biological_agent_code',
          'foliar_feeding_damage_ind',
          'root_feeding_damage_ind',
          'seed_feeding_damage_ind',
          'oviposition_marks_ind',
          'eggs_present_ind',
          'pupae_present_ind',
          'adults_present_ind',
          'tunnels_present_ind',
          'general_comment'
        ]}
        rows={
          !rows.length
            ? []
            : rows.map((row) => ({
                ...row,
                project_code_label: row.project_code[0].description
              }))
        }
      />
    );
  }, [rows?.length]);
};

export const IAPPBiologicalTreatmentsMonitoringTable: React.FC<IRecordTable> = (props) => {
  const { rows } = props;
  return useMemo(() => {
    return (
      <RecordTable
        tableName="Monitoring"
        startExpanded={true}
        startingOrderBy="monitoring_id"
        startingOrder="desc"
        keyField="monitoring_id"
        tableSchemaType={['IAPP_Monitoring', 'Monitoring_BiologicalTerrestrialPlant', 'IAPP_Biological_Monitoring']}
        actions={false}
        headers={[
          {
            id: 'monitoring_id',
            type: 'number'
          },
          'monitoring_date',
          'plant_count',
          'agent_count',
          'count_duration',
          'agent_destroyed_ind',
          'legacy_presence_ind',
          'foliar_feeding_damage_ind',
          'root_feeding_damage_ind',
          'seed_feeding_damage_ind',
          'oviposition_marks_ind',
          'eggs_present_ind',
          'larvae_present_ind',
          'pupae_present_ind',
          'adults_present_ind',
          'tunnels_present_ind',
          {
            id: 'project_code_label',
            title: 'Project Code'
          },
          'general_comment'
        ]}
        rows={
          !rows.length
            ? []
            : rows.map((monitor, j) => ({
                ...monitor,
                project_code_label: monitor.project_code[0].description
              }))
        }
      />
    );
  }, [rows?.length]);
};

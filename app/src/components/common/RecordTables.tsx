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

const poiStandardMapping = (doc) => ({
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

interface IRecordsTable {
  rows: Array<any>;
  selected?: Array<any>;
  setSelected?: any;
  databaseContext?: any;
}

export const ObservationsTable: React.FC<IRecordsTable> = (props) => {
  const history = useHistory();
  const { selected, setSelected } = props;
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
        rows={props.rows.map(activityStandardMapping)}
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

export const TreatmentsTable: React.FC<IRecordsTable> = (props) => {
  const history = useHistory();

  const { selected, setSelected, databaseContext } = props;
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

export const MonitoringTable: React.FC<IRecordsTable> = (props) => {
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

export const PointsOfInterestTable: React.FC<IRecordsTable> = (props) => {
  const { selected, setSelected } = props;
  const rows = props.rows.map(poiStandardMapping);
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

export const IAPPSurveyTable: React.FC<IRecordsTable> = (props) => {
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
            title: 'Survey ID',
            type: 'number'
          },
          {
            id: 'common_name',
            title: 'Common Name'
          },
          {
            id: 'species',
            title: 'Species'
          },
          {
            id: 'genus',
            title: 'Genus'
          },
          {
            id: 'survey_date',
            title: 'Survey Date'
          },
          {
            id: 'invasive_species_agency_code',
            title: 'Agency'
          },
          {
            id: 'reported_area',
            title: 'Area (m\u00B2)',
            type: 'number'
          },
          {
            id: 'density',
            align: 'center',
            title: 'Density'
          },
          {
            id: 'distribution',
            align: 'center',
            title: 'Distribution'
          },
          {
            id: 'general_comment',
            title: 'Comments'
          }
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

export const IAPPMonitoringTable: React.FC<IRecordsTable> = (props) => {
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
            title: 'Monitoring ID',
            type: 'number'
          },
          {
            id: 'monitoring_date',
            title: 'Monitoring Date'
          },
          {
            id: 'invasive_species_agency_code',
            title: 'Agency'
          },
          {
            id: 'efficacy_percent',
            title: 'Efficacy',
            type: 'number'
          },
          {
            id: 'project_code_label',
            title: 'Project Code'
          },
          {
            id: 'general_comment',
            title: 'Comments'
          }
        ]}
        rows={
          !rows.length
            ? []
            : rows.map((monitor, j) => ({
              ...monitor,
              project_code_title: monitor.project_code[0].description
            }))
        }
      />
    );
  }, [rows?.length]);
};

export const IAPPMechanicalTreatmentsTable: React.FC<IRecordsTable> = (props) => {
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
            title: 'Treatment ID',
            type: 'number'
          },
          {
            id: 'common_name',
            title: 'Species (Common)'
          },
          {
            id: 'treatment_date',
            title: 'Treatment Date'
          },
          {
            id: 'invasive_species_agency_code',
            title: 'Agency'
          },
          {
            id: 'reported_area',
            title: 'Reported Area (m\u00B2)',
            type: 'number'
          },
          {
            id: 'mechanical_method_code_label', // custom
            title: 'Mech Method'
          },
          {
            id: 'project_code_label',
            title: 'Project Code'
          },
          {
            id: 'general_comment',
            title: 'Comments'
          }
        ]}
        rows={
          !rows.length
            ? []
            : rows.map((row) => ({
                ...row,
                mechanical_method_code_title: '(' + row.mechanical_method_code + ') ' + row.mechanical_method,
                project_code_title: row.project_code[0].description
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

export const IAPPChemicalTreatmentsTable: React.FC<IRecordsTable> = (props) => {
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
            title: 'Treatment ID',
            type: 'number'
          },
          {
            id: 'common_name',
            title: 'Species (Common)'
          },
          {
            id: 'treatment_date',
            title: 'Treatment Date'
          },
          {
            id: 'invasive_species_agency_code',
            title: 'Agency'
          },
          {
            id: 'reported_area',
            title: 'Reported Area (m\u00B2)',
            type: 'number'
          },
          {
            id: 'chemical_method', // custom
            title: 'Method'
          },
          {
            id: 'project_code_label',
            title: 'Project Code'
          },
          {
            id: 'general_comment',
            title: 'Comments'
          }
        ]}
        rows={
          !rows.length
            ? []
            : rows.map((row) => ({
                ...row,
                project_code_title: row.project_code[0].description
              }))
        }
        dropdown={(row) => (
          <React.Fragment key={row.treatment_id + '_expanded'}>
            <RecordTable
              startExpanded={true}
              keyField="treatment_id"
              actions={false}
              headers={[
                {
                  id: 'pmp_confirmation_number',
                  title: 'PMP Confirmation #'
                },
                {
                  id: 'herbicide_description',
                  title: 'Herbicide'
                },
                {
                  id: 'pmra_reg_number',
                  title: 'PMRA Reg #'
                },
                {
                  id: 'temperature',
                  title: 'Temperature',
                  type: 'number'
                },
                {
                  id: 'humidity',
                  title: 'Humidity'
                },
                {
                  id: 'wind_speed',
                  title: 'Wind Velocity',
                  type: 'number'
                },
                {
                  id: 'wind_direction',
                  title: 'Wind Direction'
                },
                {
                  id: 'application_rate',
                  title: 'Application Rate'
                },
                {
                  id: 'herbicide_amount',
                  title: 'Amount Used',
                  type: 'number'
                },
                {
                  id: 'dilution',
                  title: 'Dilution Rate'
                },
                {
                  id: 'mix_delivery_rate',
                  title: 'Mix Delivery Rate'
                }
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

export const IAPPBiologicalTreatmentsTable: React.FC<IRecordsTable> = (props) => {
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
            title: 'Treatment ID',
            type: 'number'
          },
          {
            id: 'common_name',
            title: 'Species (Common)'
          },
          {
            id: 'treatment_date',
            title: 'Treatment Date'
          },
          {
            id: 'collection_date',
            title: 'Collection Date'
          },
          {
            id: 'bioagent_source',
            title: 'Bioagent Source'
          },
          {
            id: 'invasive_species_agency_code',
            title: 'Agency'
          },
          {
            id: 'stage_larva_ind',
            title: 'Larvae?'
          },
          {
            id: 'stage_egg_ind',
            title: 'Eggs?'
          },
          {
            id: 'stage_pupa_ind',
            title: 'Pupae?'
          },
          {
            id: 'stage_other_ind',
            title: 'Other?'
          },
          {
            id: 'release_quantity',
            title: 'Release Quantity'
          },
          {
            id: 'area_classification_code',
            title: 'Area Classification Code'
          },
          {
            id: 'biological_agent_code',
            title: 'Biological Agent Code'
          },
          {
            id: 'project_code_label',
            title: 'Project Code'
          },
          {
            id: 'general_comment',
            title: 'Comments'
          }
        ]}
        rows={
          !rows.length
            ? []
            : rows.map((row) => ({
                ...row,
                project_code_title: row.project_code[0].description
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

export const IAPPBiologicalDispersalsTable: React.FC<IRecordsTable> = (props) => {
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
            id: 'treatment_id',
            title: 'Treatment ID',
            type: 'number'
          },
          {
            id: 'common_name',
            title: 'Species (Common)'
          },
          {
            id: 'monitoring_date',
            title: 'Inspection Date'
          },
          {
            id: 'project_code_label',
            title: 'Project Code'
          },
          {
            id: 'plant_count',
            title: 'Plant Count',
            type: 'number'
          },
          {
            id: 'agent_count',
            title: 'Agent Count',
            type: 'number'
          },
          {
            id: 'count_duration',
            title: 'Count Duration'
          },
          {
            id: 'biological_agent_code',
            title: 'Agent Code'
          },
          {
            id: 'foliar_feeding_damage_ind',
            title: 'Foliar Feeding Damage?'
          },
          {
            id: 'root_feeding_damage_ind',
            title: 'Root Feeding Damage?'
          },
          {
            id: 'seed_feeding_damage_ind',
            title: 'Seed Feeding Damage?'
          },
          {
            id: 'oviposition_marks_ind',
            title: 'Oviposition Marks?'
          },
          {
            id: 'eggs_present_ind',
            title: 'Eggs?'
          },
          {
            id: 'pupae_present_ind',
            title: 'Pupae?'
          },
          {
            id: 'adults_present_ind',
            title: 'Adults?'
          },
          {
            id: 'tunnels_present_ind',
            title: 'Tunnels?'
          },
          {
            id: 'general_comment',
            title: 'Comments'
          }
        ]}
        rows={
          !rows.length
            ? []
            : rows.map((row) => ({
                ...row,
                project_code_title: row.project_code[0].description
              }))
        }
      />
    );
  }, [rows?.length]);
};

export const IAPPBiologicalTreatmentsMonitoringTable: React.FC<IRecordsTable> = (props) => {
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
            title: 'Monitoring ID',
            type: 'number'
          },
          {
            id: 'monitoring_date',
            title: 'Monitoring Date'
          },
          {
            id: 'plant_count',
            title: 'Plant Count',
            type: 'number'
          },
          {
            id: 'agent_count',
            title: 'Agent Count',
            type: 'number'
          },
          {
            id: 'count_duration',
            title: 'Count Duration'
          },
          {
            id: 'agent_destroyed_ind',
            title: 'Agent Destroyed?'
          },
          {
            id: 'legacy_presence_ind',
            title: 'Legacy Presence?'
          },
          {
            id: 'foliar_feeding_damage_ind',
            title: 'Foliar Feeding Damage?'
          },
          {
            id: 'root_feeding_damage_ind',
            title: 'Root Feeding Damage?'
          },
          {
            id: 'seed_feeding_damage_ind',
            title: 'Seed Feeding Damage?'
          },
          {
            id: 'oviposition_marks_ind',
            title: 'Oviposition Marks?'
          },
          {
            id: 'eggs_present_ind',
            title: 'Eggs Present?'
          },
          {
            id: 'larvae_present_ind',
            title: 'Larvae Present?'
          },
          {
            id: 'pupae_present_ind',
            title: 'Pupae Present?'
          },
          {
            id: 'adults_present_ind',
            title: 'Adults Present?'
          },
          {
            id: 'tunnels_present_ind',
            title: 'Tunnels Present?'
          },
          {
            id: 'project_code_label',
            title: 'Project Code'
          },
          {
            id: 'general_comment',
            title: 'Comments'
          }
        ]}
        rows={
          !rows.length
            ? []
            : rows.map((monitor, j) => ({
                ...monitor,
                project_code_title: monitor.project_code[0].description
              }))
        }
      />
    );
  }, [rows?.length]);
};

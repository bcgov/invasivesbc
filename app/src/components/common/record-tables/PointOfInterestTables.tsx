import RecordTable, { IRecordTable } from 'components/common/RecordTable';
import { DEFAULT_PAGE_SIZE, DocType } from 'constants/database';
import { DatabaseContext2 } from '../../../contexts/DatabaseContext2';
import { useDataAccess } from 'hooks/useDataAccess';
import React, { useContext, useMemo } from 'react';
import { arrayWrap } from 'utils/addActivity';
import { IAPPSite } from 'components/points-of-interest/IAPP/IAPP-Site';

// poiStandardMapping: similar intent to activityStandardMapping, flattens keys and converts them to easily printable formats
// Warning: this is probably a likely cause for errors, as it's mapping to doc / camelCase format.
// recommended changing this to use snake_case and sanitize inputs before/after instead to use the same formatting.
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
  invasive_plant_code: doc?.species_positive, // cheating here to be able to use the schema mapping
  // pulling these from plan my trip:
  _id: 'POI' + doc.point_of_interest_id,
  docType: DocType.REFERENCE_POINT_OF_INTEREST,
  //trip_IDs: doc?.trip_IDs ? [...doc.trip_IDs, props.trip_ID] : [props.trip_ID],
  formData: doc.point_of_interest_payload?.form_data,
  pointOfInterestType: doc.point_of_interest_type,
  pointOfInterestSubtype: doc.point_of_interest_subtype,
  geometry: [...doc.point_of_interest_payload.geometry],
  project_code_label: doc.project_code?.[0]?.description
});

/* POINT OF INTEREST TABLES 
NOTES:  These are pretty simple table definitions, and dont (yet) have an automated pagination fetch of rows for each type.
(e.g. it would be cool to have a table of just all the IAPP sites with Monitoring data)
In order to do that though we would need a smarter search on the API side (both web and mobile)
so the current use of these tables is strictly to overwrite the "rows" field with the appropriate array of data,
which is what is done in IAPP-Site.tsx currently.
*/

// general table which others pull from
export const PointsOfInterestTable: React.FC<IRecordTable> = (props) => {
  const { tableSchemaType, ...otherProps } = props;
  const dataAccess = useDataAccess();
  const databaseContext = useContext(DatabaseContext2);
  return useMemo(() => {
    return (
      <RecordTable
        tableName="Points of Interest"
        tableSchemaType={[
          'Point_Of_Interest',
          'IAPP_Site',
          'Jurisdiction',
          'IAPP_Survey',
          ...arrayWrap(tableSchemaType)
        ]}
        startingOrderBy="site_id"
        startingOrder="desc"
        enableSelection
        headers={[
          {
            id: 'site_id',
            type: 'number'
          },
          'date_created',
          {
            id: 'invasive_plant_code',
            title: 'Species Surveyed'
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
        rows={async ({ page, rowsPerPage, order }) => {
          // Fetches fresh from the API (web).  TODO fetch from SQLite
          let dbPageSize = DEFAULT_PAGE_SIZE;
          if (dbPageSize - ((page * rowsPerPage) % dbPageSize) < 3 * rowsPerPage)
            // if page is right near the db page limit
            dbPageSize = (page * rowsPerPage) % dbPageSize; // set the limit to the current row count instead
          const result = await dataAccess.getPointsOfInterest(
            {
              page: Math.floor((page * rowsPerPage) / dbPageSize),
              limit: dbPageSize,
              order: order
            },
            databaseContext
          );
          return {
            rows: result.rows.map(poiStandardDBMapping),
            count: result.count
          };
        }}
        {...otherProps}
      />
    );
  }, [props.rows?.length, props.selected?.length, JSON.stringify(props.actions)]);
};

// helper class with common functionality:
export const IAPPTable: React.FC<IRecordTable> = (props) => (
  <RecordTable
    enableSelection={false}
    hideEmpty
    actions={false}
    startExpanded={false}
    startingOrder="desc"
    tableSchemaType={['Point_Of_Interest', 'IAPP_Site', 'Jurisdiction']}
    {...props}
  />
);

export const IAPPSitesTable: React.FC<IRecordTable> = (props) => (
  <PointsOfInterestTable
    tableName="IAPP Points of Interest"
    startingOrderBy="site_id"
    enableSelection={false}
    actions={false}
    startExpanded
    dropdown={(row) => <IAPPSite record={row} />}
    {...props}
  />
);

export const IAPPSurveyTable: React.FC<IRecordTable> = (props) => (
  <IAPPTable
    tableName={'Survey Details'}
    keyField="survey_id"
    startingOrderBy="survey_id"
    tableSchemaType={['IAPP_Survey']}
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
    {...props}
  />
);

export const IAPPMonitoringTable: React.FC<IRecordTable> = (props) => (
  <IAPPTable
    tableName="Monitoring"
    startingOrderBy="monitoring_id"
    keyField="monitoring_id"
    tableSchemaType={['IAPP_Monitoring']}
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
    {...props}
  />
);

export const IAPPMechanicalTreatmentsTable: React.FC<IRecordTable> = (props) => (
  <IAPPTable
    tableName="Mechanical Treatments and Efficacy Monitoring"
    keyField="treatment_id"
    startingOrderBy="treatment_id"
    tableSchemaType={['IAPP_Treatment', 'IAPP_Mechanical_Treatment']}
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
    dropdown={(row) => row.monitoring?.length && <IAPPMonitoringTable startExpanded rows={row.monitoring} />}
    {...props}
  />
);

export const IAPPChemicalTreatmentsTable: React.FC<IRecordTable> = (props) => (
  <IAPPTable
    tableName="Chemical Treatments and Efficacy Monitoring"
    keyField="treatment_id"
    startingOrderBy="treatment_id"
    tableSchemaType={['IAPP_Treatment', 'IAPP_Chemical_Treatment']}
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
    // Note:  this dropdown makes a good case for an "overflow" function which
    // automatically passes fields into dropdown when the table is too wide
    dropdown={(row) => (
      <React.Fragment key={row.treatment_id + '_expanded'}>
        <IAPPTable
          startExpanded
          keyField="treatment_id"
          {...props}
          tableSchemaType={['IAPP_Treatment', 'IAPP_Chemical_Treatment', 'Herbicide']}
          headers={[
            'liquid_herbicide_code',
            'herbicide_description',
            'application_rate',
            'herbicide_amount',
            'dilution',
            {
              id: 'mix_delivery_rate',
              title: 'Mix Delivery Rate'
            }
          ]}
          rows={[row]} // singleton expanded table
          enableFiltering={false}
        />
        <IAPPTable
          startExpanded
          keyField="treatment_id"
          {...props}
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
        />
        {row.monitoring.length > 0 && <IAPPMonitoringTable rows={row.monitoring} />}
      </React.Fragment>
    )}
    {...props}
  />
);

export const IAPPBiologicalTreatmentsTable: React.FC<IRecordTable> = (props) => (
  <IAPPTable
    tableName="Biological Treatments and Efficacy Monitoring"
    keyField="treatment_id"
    startingOrderBy="treatment_id"
    tableSchemaType={['IAPP_Treatment', 'IAPP_Biological_Treatment']}
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
    dropdown={(row) =>
      !row.monitoring?.length ? undefined : (
        <IAPPBiologicalTreatmentsMonitoringTable startExpanded rows={row.monitoring} />
      )
    }
    {...props}
  />
);

export const IAPPBiologicalDispersalsTable: React.FC<IRecordTable> = (props) => (
  <IAPPTable
    tableName="Biological Dispersals"
    keyField="biological_dispersal_id"
    startingOrderBy="biological_dispersal_id"
    tableSchemaType={['IAPP_Biological_Dispersal']}
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
    {...props}
  />
);

export const IAPPBiologicalTreatmentsMonitoringTable: React.FC<IRecordTable> = (props) => (
  <IAPPTable
    tableName="Monitoring"
    startExpanded
    startingOrderBy="monitoring_id"
    keyField="monitoring_id"
    tableSchemaType={['IAPP_Monitoring', 'Monitoring_BiologicalTerrestrialPlant', 'IAPP_Biological_Monitoring']}
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
    {...props}
  />
);

export default {
  PointsOfInterestTable,
  IAPPTable,
  IAPPSitesTable,
  IAPPSurveyTable,
  IAPPMechanicalTreatmentsTable,
  IAPPChemicalTreatmentsTable,
  IAPPBiologicalTreatmentsTable,
  IAPPMonitoringTable,
  IAPPBiologicalTreatmentsMonitoringTable,
  IAPPBiologicalDispersalsTable
};

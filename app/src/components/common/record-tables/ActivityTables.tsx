import RecordTable, { IRecordTable } from 'components/common/RecordTable';
import { ActivitySubtype, ActivitySubtypeShortLabels, ReviewStatus } from 'constants/activities';
import { DEFAULT_PAGE_SIZE } from 'constants/database';
import { DatabaseContext2 } from '../../../contexts/DatabaseContext2';
import { useDataAccess } from 'hooks/useDataAccess';
import { useActions } from 'hooks/useActions';
import React, { useContext, useMemo } from 'react';
import { arrayWrap, uniqueArray, sanitizeRecord, getShortActivityID } from 'utils/addActivity';

export const PAGE_FETCH_BUFFER = 3; // fetches 3 pages before and after the current page of a Record Table (where page size is the current rowsPerPage)

// activityStandardMapping: flattens certain fields deep within an activity so they're accessible at the root level as header/column fields.
// Also maps the content of those to more easily-displayed formats, e.g. mapping arrays of jurisdiction objects to a single array
// future iterations might want to just use deeper keys in the header (e.g. "activity_payload.form_data.activity_data.latitude") instead of flattening here
export const activityStandardMapping = (doc) => {
  const record = sanitizeRecord(doc);
  const flattened = {
    ...record.activity_payload,
    ...record.activity_payload?.form_data?.activity_data,
    ...record.activity_payload?.form_data?.activity_type_data,
    ...record.activity_payload?.form_data?.activity_subtype_data,
    ...record
  };

  return {
    ...flattened,
    short_id: getShortActivityID(flattened),
    activity_id: flattened.activity_id, // NOTE: activity_subtype_data.activity_id is overwriting this incorrectly
    jurisdiction_code: flattened.jurisdictions?.reduce(
      (output, jurisdiction) =>
        jurisdiction && [...output, jurisdiction.jurisdiction_code, '(', jurisdiction.percent_covered + '%', ')'],
      []
    ),
    invasive_plant_code: doc.species_positive, // array
    date_created: flattened.created_timestamp?.substring(0, 10) + ' ' + flattened.date_created?.substring(11, 19),
    latitude: flattened.latitude && parseFloat(flattened.latitude).toFixed(6),
    longitude: flattened.longitude && parseFloat(flattened.longitude).toFixed(6),
    review_status_rendered:
      flattened.review_status === ReviewStatus.APPROVED || flattened.review_status === ReviewStatus.DISAPPROVED
        ? flattened.review_status + ' by ' + flattened.reviewed_by + ' at ' + flattened.reviewed_at
        : flattened.review_status
  };
};

// defaultActivitiesFetch: builds a fetch function for a given RecordTable type
// which will then be called by the table's pagination to fetch from the DB appropriately
// Future development should add geometry and filters search controls here so that a RecordTable can be passed
// those to do the search itself.  Alternatively, if a paraent component handles those, it will need to re-implement the paging function in here
export const defaultActivitiesFetch = ({
  databaseContext,
  dataAccess,
  activitySubtypes = [],
  created_by = undefined,
  review_status = [],
  linked_id = undefined
}) => async ({
  page,
  rowsPerPage,
  order
}: {
  page: number;
  rowsPerPage: number;
  order: string[];
}): Promise<{ rows: any[]; count: number }> => {
  // Fetches fresh from the API
  let dbPageSize = DEFAULT_PAGE_SIZE;
  if (dbPageSize - ((page * rowsPerPage) % dbPageSize) < PAGE_FETCH_BUFFER * rowsPerPage)
    // if page is right near the db page limit
    dbPageSize = (page * rowsPerPage) % dbPageSize; // set the limit to the current row count instead
  const types = uniqueArray(arrayWrap(activitySubtypes).map((subtype: string) => String(subtype).split('_')[1]));
  const result = await dataAccess.getActivities(
    {
      page: Math.floor((page * rowsPerPage) / dbPageSize),
      limit: dbPageSize,
      order: order,
      // search_feature: geometry
      activity_type: types,
      activity_subtype: arrayWrap(activitySubtypes),
      // filters: not implemented yet
      // startDate, endDate can be filters
      created_by: created_by, // my_keycloak_id
      review_status: review_status,
      linked_id: linked_id
    },
    databaseContext,
    true
  );
  return {
    rows: result?.rows?.map(activityStandardMapping) || [],
    count: parseInt(result?.count) || 0
  };
};

export interface IActivitiesTable extends IRecordTable {
  workflow?: string;
  activitySubtypes?: any[];
  created_by?: string;
  review_status?: string[];
}

export const activitesDefaultHeaders = [
  {
    id: 'short_id',
    title: 'Activity ID'
  },
  'activity_type',
  {
    id: 'activity_subtype',
    valueMap: { ...ActivitySubtypeShortLabels }
  },
  'date_created',
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
  {
    id: 'activity_id',
    title: 'Full ID'
  },
  'access_description',
  'general_comment'
];

export const ActivitiesTable: React.FC<IActivitiesTable> = (props) => {
  const dataAccess = useDataAccess();
  const databaseContext = useContext(DatabaseContext2);

  const {
    actions,
    activitySubtypes,
    created_by,
    enableSelection = true,
    keyField = 'activity_id',
    review_status = [ReviewStatus.APPROVED, ReviewStatus.PREAPPROVED],
    tableSchemaType,
    ...otherProps
  } = props;

  const defaultActions = useActions(props);

  let rows = props.rows;
  if (Array.isArray(rows)) rows = rows.map(activityStandardMapping);
  if (typeof rows === 'undefined') {
    rows = defaultActivitiesFetch({
      databaseContext,
      dataAccess,
      activitySubtypes: arrayWrap(activitySubtypes),
      created_by,
      review_status
    });
  }

  return useMemo(
    () => (
      <RecordTable
        tableName="Activities"
        tableSchemaType={['Activity', 'Jurisdiction', ...arrayWrap(tableSchemaType)]}
        startingOrderBy="activity_id"
        startingOrder="desc"
        startExpanded
        headers={activitesDefaultHeaders} // overwritten by props.headers if present
        actions={actions === false ? false : defaultActions}
        {...{ enableSelection, rows, keyField }}
        {...otherProps}
      />
    ),
    [rows?.length, props.selected?.length, JSON.stringify(actions)]
  );
};

export const AnimalActivitiesTable: React.FC<IActivitiesTable> = (props) => {
  const { tableSchemaType, ...otherProps } = props;
  return (
    <ActivitiesTable
      tableName="Animal Activities"
      activitySubtypes={[ActivitySubtype.Activity_AnimalTerrestrial, ActivitySubtype.Activity_AnimalAquatic]}
      tableSchemaType={[
        'Observation',
        'Activity_AnimalTerrestrial',
        'Activity_AnimalAquatic',
        ...arrayWrap(tableSchemaType)
      ]}
      {...otherProps}
    />
  );
};

export const ObservationsTable: React.FC<IActivitiesTable> = (props) => {
  const { tableSchemaType, headers = [], ...otherProps } = props;
  return useMemo(() => {
    return (
      <ActivitiesTable
        tableName="Observations"
        activitySubtypes={[ActivitySubtype.Observation_PlantTerrestrial, ActivitySubtype.Observation_PlantAquatic]}
        tableSchemaType={[
          'Observation',
          'Observation_PlantTerrestrial',
          'Observation_PlantAquatic',
          'ObservationPlantTerrestrialData',
          ...arrayWrap(tableSchemaType)
        ]}
        headers={[...headers, ...activitesDefaultHeaders]}
        {...otherProps}
      />
    );
  }, [props.rows?.length, props.selected?.length]);
};

export const TreatmentsTable: React.FC<IActivitiesTable> = (props) => {
  const databaseContext = useContext(DatabaseContext2);
  const dataAccess = useDataAccess();
  const { tableSchemaType, headers = [], ...otherProps } = props;
  return useMemo(() => {
    return (
      <ActivitiesTable
        tableName="Treatments"
        activitySubtypes={[
          ActivitySubtype.Treatment_ChemicalPlant,
          ActivitySubtype.Treatment_ChemicalPlantAquatic,
          ActivitySubtype.Treatment_MechanicalPlant,
          ActivitySubtype.Treatment_MechanicalPlantAquatic,
          ActivitySubtype.Treatment_BiologicalPlant
        ]}
        tableSchemaType={[
          'Treatment',
          'Treatment_ChemicalPlant',
          'Treatment_ChemicalPlantAquatic',
          'Treatment_MechanicalPlant',
          'Treatment_MechanicalPlantAquatic',
          'Treatment_BiologicalPlant',
          ...arrayWrap(tableSchemaType)
        ]}
        headers={[
          ...headers,
          {
            id: 'short_id',
            title: 'Activity ID'
          },
          {
            id: 'activity_subtype',
            valueMap: { ...ActivitySubtypeShortLabels }
          },
          'date_created',
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
          'elevation',
          {
            id: 'activity_id',
            title: 'Full ID'
          }
        ]}
        dropdown={(row) => (
          <>
            <ActivitiesTable
              tableName=""
              key={row._id}
              tableSchemaType={[
                'Treatment',
                'Treatment_ChemicalPlant',
                'Treatment_MechanicalPlant',
                'Treatment_MechanicalPlantAquatic',
                'Treatment_BiologicalPlant',
                ...arrayWrap(tableSchemaType)
              ]}
              enableSelection={false}
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
              actions={false}
            />

            <MonitoringTable
              tableName="Linked Monitoring"
              key={row._id + '_monitoring'}
              rows={defaultActivitiesFetch({
                databaseContext,
                dataAccess,
                linked_id: row._id
              })}
              hideEmpty
              actions={false}
              enableSelection={false}
            />
          </>
        )}
        {...otherProps}
      />
    );
  }, [props.rows?.length, props.selected?.length]);
};

export const MonitoringTable: React.FC<IActivitiesTable> = (props) => {
  const { tableSchemaType, headers = [], ...otherProps } = props;
  return useMemo(() => {
    return (
      <ActivitiesTable
        tableName="Treatment Monitoring"
        activitySubtypes={[
          ActivitySubtype.Monitoring_ChemicalTerrestrialAquaticPlant,
          ActivitySubtype.Monitoring_MechanicalTerrestrialAquaticPlant,
          ActivitySubtype.Monitoring_BiologicalTerrestrialPlant,
          ActivitySubtype.Monitoring_BiologicalDispersal
        ]}
        tableSchemaType={[
          'Monitoring',
          'Monitoring_ChemicalTerrestrialAquaticPlant',
          'Monitoring_MechanicalTerrestrialAquaticPlant',
          'Monitoring_BiologicalTerrestrialPlant',
          'Monitoring_BiologicalDispersal',
          ...arrayWrap(tableSchemaType)
        ]}
        headers={[
          ...headers,
          {
            id: 'short_id',
            title: 'Activity ID'
          },
          {
            id: 'activity_subtype',
            valueMap: { ...ActivitySubtypeShortLabels }
          },
          'date_created',
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
          'elevation',
          {
            id: 'activity_id',
            title: 'Full ID'
          }
        ]}
        {...otherProps}
      />
    );
  }, [props.rows?.length, props.selected?.length]);
};

export const TransectsTable: React.FC<IActivitiesTable> = (props) => {
  const { headers, ...otherProps } = props;
  return (
    <ActivitiesTable
      tableName="Transects"
      activitySubtypes={[
        ActivitySubtype.Transect_Vegetation,
        ActivitySubtype.Transect_FireMonitoring,
        ActivitySubtype.Transect_BiocontrolEfficacy
      ]}
      headers={[...headers, ...activitesDefaultHeaders]}
      {...otherProps}
    />
  );
};

export const BiocontrolTable: React.FC<IActivitiesTable> = (props) => {
  const { tableSchemaType, actions, headers = [], ...otherProps } = props;
  return useMemo(() => {
    return (
      <ActivitiesTable
        tableName="Biological Control"
        activitySubtypes={[ActivitySubtype.Collection_Biocontrol]}
        tableSchemaType={['Collection', 'Collection_Biocontrol', ...arrayWrap(tableSchemaType)]}
        headers={[
          ...headers,
          {
            id: 'short_id',
            title: 'Activity ID'
          },
          {
            id: 'activity_subtype',
            valueMap: {
              ...ActivitySubtypeShortLabels
            }
          },
          'date_created',
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
          {
            id: 'activity_id',
            title: 'Full ID'
          }
        ]}
        dropdown={(row) => (
          <ActivitiesTable
            tableName=""
            key={row._id}
            tableSchemaType={['Collection', 'Collection_Biocontrol', ...arrayWrap(tableSchemaType)]}
            enableSelection={false}
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
            actions={false}
          />
        )}
        {...otherProps}
      />
    );
  }, [props.rows?.length, props.selected?.length, JSON.stringify(actions)]);
};

export default {
  ActivitiesTable,
  AnimalActivitiesTable,
  ObservationsTable,
  TreatmentsTable,
  MonitoringTable,
  TransectsTable,
  BiocontrolTable
};

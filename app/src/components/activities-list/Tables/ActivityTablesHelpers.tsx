import { ActivitySubtypeShortLabels } from 'constants/activities';

export interface ActivityRow {
  activity_id: string;
  short_id: string;
  type: string;
  sub_type: string;
  date_modified: string;
  created_by: string;
  received_timestamp: string;
  jurisdiction: string[];
  species_positive: string[];
  species_negative: string[];
  // agency: string;
  regional_invasive_species_organization_areas: string;
  regional_districts: string;
  biogeoclimatic_zones: string;
  elevation: string;
}

export const activites_default_headers = [
  {
    key: 'short_id',
    name: 'Activity ID'
  },
  {
    key: 'type',
    name: 'Activity Type'
  },
  {
    key: 'activity_subtype',
    name: 'Activity Sub Type'
  },
  {
    key: 'date_modified',
    name: 'Date Modified'
  },
  {
    key: 'reported_area',
    name: 'Area (m\u00B2)'
  },
  {
    key: 'latitude',
    name: 'Latitude'
  },
  {
    key: 'longitude',
    name: 'Longitude'
  },
  { key: 'created_by', name: 'Created By' },
  {
    key: 'received_timestamp',
    name: 'Received Timestamp'
  },
  {
    key: 'jurisdiction',
    name: 'Jurisdiction'
  },
  {
    key: 'species_positive',
    name: 'Species Positive'
  },
  {
    key: 'species_negative',
    name: 'Species Negative'
  },
  // {
  //   key: 'agency',
  //   name: 'Agency'
  // },
  {
    key: 'regional_invasive_species_organization_areas',
    name: 'Regional Invasive Species Organization Areas'
  },
  {
    key: 'regional_districts',
    name: 'Regional Districts'
  },
  {
    key: 'biogeoclimatic_zones',
    name: 'Bio Geo Climatic Zones'
  }
];

export const mapActivitiesToDataGridRows = (activities) => {
  console.log('ActivityTablesHelpers 86', activities);
  if (!activities) {
    return [];
  }
  if (activities.code) {
    return [];
  }

  return activities?.rows?.map((activity, index) => {
    return {
      // id: index,
      short_id: activity?.activity_payload?.short_id,
      type: activity?.activity_payload?.activity_type,
      activity_type: activity?.activity_payload?.activity_type,
      activity_subtype: ActivitySubtypeShortLabels[activity?.activity_payload?.activity_subtype],
      date_modified: new Date(activity?.activity_payload?.created_timestamp).toString(),
      reported_area: activity?.activity_payload?.form_data?.activity_data?.reported_area,
      latitude: activity?.activity_payload?.form_data?.activity_data?.latitude,
      longitude: activity?.activity_payload?.form_data?.activity_data?.longitude,
      activity_id: activity?.activity_id,
      created_by: activity?.created_by,
      received_timestamp: new Date(activity?.activity_payload?.received_timestamp).toString(),
      jurisdiction: activity?.activity_payload?.jurisdiction,
      species_positive: activity?.activity_payload?.species_positive,
      species_negative: activity?.activity_payload?.species_negative,
      //  agency: activity.,
      regional_invasive_species_organization_areas:
        activity?.activity_payload?.regional_invasive_species_organization_areas,
      regional_districts: activity?.activity_payload?.regional_districts,
      biogeoclimatic_zones: activity?.activity_payload?.biogeoclimatic_zones
    };
  });
};

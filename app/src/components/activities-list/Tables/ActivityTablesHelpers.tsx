import { ActivitySubtypeShortLabels } from 'constants/activities';

export interface ActivityRow {
  activity_id: string;
  short_id: string;
  type: string;
  sub_type: string;
  received_timestamp: string;
  jurisdiction: string[];
  species_positive: string[];
  species_negative: string[];
  species_treated: string[];
  created_by: string;
  updated_by: string;
  agency: string;
  regional_invasive_species_organization_areas: string;
  regional_districts: string;
  biogeoclimatic_zones: string;
  elevation: string;
  // date_modified: string; // Not on csv from crystals outline
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
  {
    key: 'species_treated',
    name: 'Species Treated'
  },
  { key: 'created_by', name: 'Created By' },
  { key: 'updated_by', name: 'Updated By' },
  {
    key: 'agency',
    name: 'Agency'
  },
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
  },
  {
    key: 'elevation',
    name: 'Elevation'
  }
  // {  // Not on csv from crystals outline
  //   key: 'reported_area',
  //   name: 'Area (m\u00B2)'
  // },
  // {  // Not on csv from crystals outline
  //   key: 'latitude',
  //   name: 'Latitude'
  // },
  // {  // Not on csv from crystals outline
  //   key: 'longitude',
  //   name: 'Longitude'
  // },

  // { // Not on csv from crystals outline
  //   key: 'date_modified',
  //   name: 'Date Modified'
  // }
];

export const mapActivitiesToDataGridRows = (activities) => {
  if (!activities || activities.count === undefined) {
    return [];
  }
  if (activities.code) {
    return [];
  }

  return activities?.rows?.map((activity, index) => {
    return {
      // id: index,
      activity_id: activity?.activity_id,
      short_id: activity?.activity_payload?.short_id,
      type: activity?.activity_payload?.activity_type,
      activity_type: activity?.activity_payload?.activity_type,
      activity_subtype: ActivitySubtypeShortLabels[activity?.activity_payload?.activity_subtype],
      received_timestamp: new Date(activity?.activity_payload?.received_timestamp).toString(),
      jurisdiction: activity?.activity_payload?.jurisdiction,
      species_positive: activity?.activity_payload?.species_positive,
      species_negative: activity?.activity_payload?.species_negative,
      species_treated: activity?.activity_payload?.species_treated,
      created_by: activity?.created_by,
      updated_by: activity?.updated_by,
      agency: activity?.activity_payload?.form_data?.activity_data?.invasive_species_agency_code, // Not in payload atm
      regional_invasive_species_organization_areas: activity?.regional_invasive_species_organization_areas,
      regional_districts: activity?.activity_payload?.regional_districts,
      biogeoclimatic_zones: activity?.activity_payload?.biogeoclimatic_zones,
      elevation: activity?.elevation
      // date_modified: new Date(activity?.activity_payload?.created_timestamp).toString(),
      // reported_area: activity?.activity_payload?.form_data?.activity_data?.reported_area,
      // latitude: activity?.activity_payload?.form_data?.activity_data?.latitude,
      // longitude: activity?.activity_payload?.form_data?.activity_data?.longitude,
    };
  });
};

import { ActivitySubtypeShortLabels } from 'constants/activities';
import { Capacitor } from '@capacitor/core';
import { useDataAccess } from 'hooks/useDataAccess';
export interface ActivityRow {
  activity_id: string;
  short_id: string;
  type: string;
  sub_type: string;
  received_timestamp: string;
  jurisdiction: string[];
  species_positive: string[];
  species_negative: string[];
  created_by: string;
  agency: string;
  regional_invasive_species_organization_areas: string;
  regional_districts: string;
  biogeoclimatic_zones: string;
  elevation: string;
  status?: string;
  // date_modified: string; // Not on csv from crystals outline
}

const headers = [
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
  { key: 'created_by', name: 'Created By' },
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
];

if (Capacitor.getPlatform() !== 'web') {
  headers.push({
    key: 'status',
    name: 'Status'
  });
}

export const activites_default_headers = headers;

const checkIfActivityCached = async (activityId: string, dataAccess: any) => {
  console.log('checking if activity ' + activityId + ' is cached');
  const cached = await dataAccess.getCachedActivityByID(activityId);
  console.log('Cached: ' + cached);
  return cached ? 'Cached' : 'Not Cached';
};

export const MapActivitiesToDataGridRows = (activities, dataAccess: any) => {
  if (!activities || activities.count === undefined) {
    return [];
  }
  if (activities.code) {
    return [];
  }

  return activities?.rows?.map((activity, index) => {
    let columns: any = {
      activity_id: activity?.activity_id,
      short_id: activity?.activity_payload?.short_id,
      type: activity?.activity_payload?.activity_type,
      activity_type: activity?.activity_payload?.activity_type,
      activity_subtype: ActivitySubtypeShortLabels[activity?.activity_payload?.activity_subtype],
      received_timestamp: new Date(activity?.activity_payload?.received_timestamp).toString(),
      jurisdiction: activity?.activity_payload?.jurisdiction,
      species_positive: activity?.activity_payload?.species_positive,
      species_negative: activity?.activity_payload?.species_negative,
      created_by: activity?.created_by,
      agency: null,
      regional_invasive_species_organization_areas:
        activity?.activity_payload?.regional_invasive_species_organization_areas,
      regional_districts: activity?.activity_payload?.regional_districts,
      biogeoclimatic_zones: activity?.activity_payload?.biogeoclimatic_zones,
      elevation: activity?.elevation
    };
    if (Capacitor.getPlatform() !== 'web') {
      // append status to columns
      columns = {
        ...columns,
        status: checkIfActivityCached(activity?.activity_id, dataAccess)
      };
    }

    return columns;
  });
};

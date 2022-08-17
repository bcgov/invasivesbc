import { ActivitySubtypeShortLabels } from 'constants/activities';
import { useDataAccess } from 'hooks/useDataAccess';
import { useSelector } from 'react-redux';
import { selectConfiguration } from 'state/reducers/configuration';
import React, { useEffect, useMemo } from 'react';
export interface ActivityRow {
  activity_id: string; // activity_incoming_data.activity_id
  short_id: string; // activity_incoming_data.activity_payload.short_id
  type: string; // activity_incoming_data.activity_type
  subtype: string; // activity_incoming_data.activity_subtype
  received_timestamp: string; // activity_incoming_data.received_timestamp
  jurisdiction: string[]; // activity_incoming_data.jurisdiction
  species_positive: string[]; // activity_incoming_data.species_positive ***
  species_negative: string[]; // activity_incoming_data.species_negative ***
  species_treated: string[];
  created_by: string; // activity_incoming_data.created_by
  updated_by: string;
  agency: string; // activity_incoming_data.activity_payload.form_data.activity_data.invasive_species_agency_code
  regional_invasive_species_organization_areas: string; // activity_incoming_data.activity_payload.regional_invasive_species_organization_areas
  regional_districts: string; // activity_payload.regional_districts
  biogeoclimatic_zones: string; // activity_payload.biogeoclimatic_zones
  elevation: string; // activity_payload.form_data.activity_data.elevation
}

export const ActivitiesDefaultHeaders = () => {
  const { MOBILE } = useSelector(selectConfiguration);

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
      key: 'subtype',
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
  ];
  if (MOBILE) {
    headers.unshift({
      key: 'cached',
      name: 'Cached?'
    });
  } else {
    console.log('NOT PUSHING STATUS HEADER');
  }
  return headers;
};

export const MapActivitiesToDataGridRows = (activities, MOBILE, cachedActivities?) => {
  const checkIfActivityCached = (activityId: string) => {
    if (!cachedActivities) {
      return false;
    }
    const activityIds = cachedActivities.map((activity) => activity.id);
    return activityIds?.includes(activityId);
  };

  if (cachedActivities) {
    console.log('Cached Activity IDs: ', cachedActivities);
  }

  console.log('Activities: ', activities);

  if (!activities || activities.count === undefined) {
    return [];
  }
  if (activities.code) {
    return [];
  }

  return activities?.rows?.map((activity, index) => {
    let columns: any = {
      // id: index,
      activity_id: activity?.activity_id,
      short_id: activity?.activity_payload?.short_id,
      type: activity?.activity_payload?.activity_type,
      subtype: ActivitySubtypeShortLabels[activity?.activity_payload?.activity_subtype],
      received_timestamp: new Date(activity?.received_timestamp).toString(),
      jurisdiction: activity?.jurisdiction_display,
      species_positive: activity?.species_positive_full,
      species_negative: activity?.species_negative_full,
      species_treated: activity?.species_treated_full,
      created_by: activity?.created_by,
      updated_by: activity?.updated_by,
      agency: activity?.agency,
      regional_invasive_species_organization_areas: activity?.regional_invasive_species_organization_areas,
      regional_districts: activity?.regional_districts,
      biogeoclimatic_zones: activity?.biogeoclimatic_zones,
      elevation: activity?.elevation
      // date_modified: new Date(activity?.activity_payload?.created_timestamp).toString(),
      // reported_area: activity?.activity_payload?.form_data?.activity_data?.reported_area,
      // latitude: activity?.activity_payload?.form_data?.activity_data?.latitude,
      // longitude: activity?.activity_payload?.form_data?.activity_data?.longitude,
    };

    if (MOBILE) {
      // append status to columns
      console.log('WE ON MOBILE');
      columns = {
        ...columns,
        status: checkIfActivityCached(activity?.activity_id)
      };
    }

    return columns;
  });
};

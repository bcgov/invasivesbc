import { useSelector } from 'react-redux';
import { selectConfiguration } from 'state/reducers/configuration';
import React from 'react';
import { ActivitySubtypeShortLabels } from 'sharedAPI';

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
  agency: string;
  regional_invasive_species_organization_areas: string;
  regional_districts: string;
  biogeoclimatic_zones: string;
  elevation: string;
  status: string;
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
      key: 'project_code',
      name: 'Project Code'
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
      key: 'status',
      name: 'Status'
    });
  } else {
    //console.log('NOT PUSHING STATUS HEADER');
  }
  return headers;
};

export const MapActivitiesToDataGridRows = (activities, MOBILE, cachedActivities?) => {
  const checkIfActivityCached = (activityId: string) => {
    if (!cachedActivities) {
      //console.log('No cached activities');
      return false;
    }
    const activityIds = cachedActivities.map((activity) => activity.id);
    const includes = activityIds.includes(activityId) ? 'Cached' : 'Not Cached';
    return includes;
  };

  if (cachedActivities) {
    //console.log('Cached Activity IDs: ', cachedActivities);
  }

  //console.log('Activities: ', activities);

  if (!activities || !activities.length){
    return [];
  }

  return activities?.map((activity, index) => {
    const getArrayString = (inputArray: [], subProp?) =>
    {
      let output = ''
      if(subProp)
      {

        inputArray.map((item) => {output += ', ' + item?.[subProp]})
      }
      else
      {
        inputArray.map((item) => {output += ', ' + item})
      }
      return output
    }

    let columns: any = {
      // id: index,
      activity_id: activity?.activity_id,
      short_id: activity?.activity_payload?.short_id,
      type: activity?.activity_payload?.activity_type,
      subtype: ActivitySubtypeShortLabels[activity?.activity_payload?.activity_subtype],
      received_timestamp: new Date(activity?.received_timestamp).toString(),
      project_code: getArrayString(activity?.activity_payload?.form_data?.activity_data?.project_code,'description'),
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
      columns = {
        ...columns,
        status: checkIfActivityCached(activity?.activity_id)
      };
    }
    return columns;
  });
};

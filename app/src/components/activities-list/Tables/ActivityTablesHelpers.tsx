import {useSelector} from 'react-redux';
import {selectConfiguration} from 'state/reducers/configuration';
import React from 'react';
import {ActivitySubtypeShortLabels} from 'sharedAPI';

export interface ActivityRow {
  activity_id: string; // activity_incoming_data.activity_id
  short_id: string; // activity_incoming_data.activity_payload.short_id
  type: string; // activity_incoming_data.activity_type
  subtype: string; // activity_incoming_data.activity_subtype
  received_timestamp: string; // activity_incoming_data.received_timestamp
  jurisdiction: string[]; // activity_incoming_data.jurisdiction
  species_positive: string[]; // activity_incoming_data.species_positive ***
  species_negative: string[]; // activity_incoming_data.species_negative ***
  has_current_positive: boolean;
  current_positive: string;
  has_current_negative: boolean;
  current_negative: string;
  species_treated: string[];
  created_by: string; // activity_incoming_data.created_by
  updated_by: string;
  agency: string;
  regional_invasive_species_organization_areas: string;
  regional_districts: string;
  biogeoclimatic_zones: string;
  elevation: string;
  status: string;
  batch_id: string;
}

export const ActivitiesDefaultHeaders = () => {
  const {MOBILE} = useSelector(selectConfiguration);

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
      key: 'activity_date',
      name: 'Activity Date'
    },
    {
      key: 'date_edited',
      name: 'Date Edited'
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
      name: 'All Positive'
    },
    {
      key: 'species_negative',
      name: 'All Negative'
    },
    {
      key: 'has_current_positive',
      name: 'Has Current Positive'
    },
    {
      key: 'current_positive',
      name: 'Current Positive Species'
    },
    {
      key: 'has_current_negative',
      name: 'Has Current Negative'
    },
    {
      key: 'current_negative',
      name: 'Current Negative Species'
    },
    {
      key: 'species_treated',
      name: 'Species Treated'
    },
    {key: 'created_by', name: 'Created By'},
    {key: 'updated_by', name: 'Updated By'},
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
    },
    {
      key: 'batch_id',
      name: 'Batch ID'
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

  if (!activities || !activities.length) {
    return [];
  }

  return activities?.map((activity, index) => {
    const getArrayString = (inputArray: [], subProp?) => {
      let output = ''
      if (subProp) {
        inputArray.map((item, index) => {
          if (item?.[subProp]) {
            output += item?.[subProp];
            if (index < inputArray.length - 1) output += ', ';
          }
        })
      } else {
        inputArray.map((item) => {
          output += ', ' + item
        })
      }
      return output
    }

    let columns: any = {
      // id: index,
      activity_id: activity?.activity_id,
      short_id: activity?.activity_payload?.short_id,
      type: activity?.activity_payload?.activity_type,
      subtype: ActivitySubtypeShortLabels[activity?.activity_payload?.activity_subtype],
      activity_date: new Date(activity?.activity_payload?.form_data?.activity_data?.activity_date_time).toString(),
      date_edited: new Date(activity?.received_timestamp).toString(),
      project_code: getArrayString(Array.isArray(activity?.activity_payload?.form_data?.activity_data?.project_code) ? activity?.activity_payload?.form_data?.activity_data?.project_code : [], 'description'),
      jurisdiction: activity?.jurisdiction_display,
      species_positive: activity?.species_positive_full,
      species_negative: activity?.species_negative_full,
      has_current_positive: activity?.has_current_positive ? 'Yes' : 'No',
      current_positive: activity?.current_positive_species,
      has_current_negative: activity?.has_current_negative ? 'Yes' : 'No',
      current_negative: activity?.current_negative_species,
      species_treated: activity?.species_treated_full,
      created_by: activity?.created_by,
      updated_by: activity?.updated_by,
      agency: activity?.agency,
      regional_invasive_species_organization_areas: activity?.regional_invasive_species_organization_areas,
      regional_districts: activity?.regional_districts,
      biogeoclimatic_zones: activity?.biogeoclimatic_zones,
      elevation: activity?.elevation,
      batch_id: activity?.batch_id
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

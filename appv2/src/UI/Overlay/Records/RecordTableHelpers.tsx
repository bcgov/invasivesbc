import { ActivitySubtypeShortLabels } from 'sharedAPI/src/constants';

export const getUnnestedFieldsForActivity = (activity) => {
  const getArrayString = (inputArray: [], subProp?) => {
    let output = '';
    if (subProp) {
      inputArray.map((item, index) => {
        if (item?.[subProp]) {
          output += item?.[subProp];
          if (index < inputArray.length - 1) output += ', ';
        }
      });
    } else {
      inputArray.map((item) => {
        output += ', ' + item;
      });
    }
    return output;
  };

  // needs to be consistent with API column names
  let columns: any = {
    activity_id: activity?.activity_id,
    short_id: activity?.short_id,
    activity_type: activity?.activity_type,
    activity_subtype: ActivitySubtypeShortLabels[activity?.activity_payload?.activity_subtype],
    activity_date: new Date(activity?.activity_payload?.form_data?.activity_data?.activity_date_time || null)
      .toISOString()
      .substring(0, 10),
    project_code: getArrayString(
      Array.isArray(activity?.activity_payload?.form_data?.activity_data?.project_code)
        ? activity?.activity_payload?.form_data?.activity_data?.project_code
        : [],
      'description'
    ),
    jurisdiction_display: activity?.jurisdiction_display,
    invasive_plant: activity?.invasive_plant,
    species_positive_full: activity?.species_positive_full,
    species_negative_full: activity?.species_negative_full,
    has_current_positive: activity?.has_current_positive ? 'Yes' : 'No',
    current_positive_species: activity?.current_positive_species,
    has_current_negative: activity?.has_current_negative ? 'Yes' : 'No',
    current_negative_species: activity?.current_negative_species,
    species_treated_full: activity?.species_treated_full,
    species_biocontrol_full: activity?.species_biocontrol_full,
    created_by: activity?.created_by,
    updated_by: activity?.updated_by,
    agency: activity?.agency,
    regional_invasive_species_organization_areas: activity?.regional_invasive_species_organization_areas,
    regional_districts: activity?.regional_districts,
    invasive_plant_management_areas: activity?.invasive_plant_management_areas,
    biogeoclimatic_zones: activity?.biogeoclimatic_zones,
    elevation: activity?.elevation,
    batch_id: activity?.batch_id,
    geometry: activity?.activity_payload?.geometry
    // date_modified: new Date(activity?.activity_payload?.created_timestamp).toString(),
    // reported_area: activity?.activity_payload?.form_data?.activity_data?.reported_area,
    // latitude: activity?.activity_payload?.form_data?.activity_data?.latitude,
    // longitude: activity?.activity_payload?.form_data?.activity_data?.longitude,
  };

  return JSON.parse(JSON.stringify(columns));
};

export const getUnnestedFieldsForIAPP = (record) => {
  let columns: any = {
    site_id: record.site_id,
    site_paper_file_id: record.site_paper_file_id,
    jurisdictions_flattened: record.jurisdictions_flattened,
    min_survey: new Date(record.min_survey).toISOString().substring(0, 10),
    all_species_on_site: record.all_species_on_site,
    max_survey: new Date(record.max_survey).toISOString().substring(0, 10),
    agencies: record.agencies,
    biological_agent: record.biological_agent,
    has_biological_treatments: record.has_biological_treatments ? 'Yes' : 'No',
    has_chemical_treatments: record.has_chemical_treatments ? 'Yes' : 'No',
    has_mechanical_treatments: record.has_mechanical_treatments ? 'Yes' : 'No',
    has_biological_dispersals: record.has_biological_dispersals ? 'Yes' : 'No',
    monitored: record.monitored,
    regional_district: record.regional_district,
    regional_invasive_species_organization: record.regional_invasive_species_organization,
    invasive_plant_management_area: record.invasive_plant_management_area,
    geometry: record.geojson
  };

  return JSON.parse(JSON.stringify(columns));
};

export const activityColumnsToDisplay = [
  {
    key: 'short_id',
    name: 'Activity ID',
    displayWidget: 'div'
  },
  {
    key: 'activity_type',
    name: 'Activity Type'
  },
  {
    key: 'activity_subtype',
    name: 'Activity Sub Type'
  },
  {
    key: 'activity_date',
    name: 'Activity Date'
  },
  {
    key: 'project_code',
    name: 'Project Code'
  },
  {
    key: 'jurisdiction_display',
    name: 'Jurisdiction'
  },
  {
    key: 'invasive_plant',
    name: 'Invasive Plant'
  },
  {
    key: 'species_positive_full',
    name: 'All Positive'
  },
  {
    key: 'species_negative_full',
    name: 'All Negative'
  },
  {
    key: 'has_current_positive',
    name: 'Has Current Positive'
  },
  {
    key: 'current_positive_species',
    name: 'Current Positive Species'
  },
  {
    key: 'has_current_negative',
    name: 'Has Current Negative'
  },
  {
    key: 'current_negative_species',
    name: 'Current Negative Species'
  },
  {
    key: 'species_treated_full',
    name: 'Species Treated'
  },
  {
    key: 'species_biocontrol_full',
    name: 'Biocontrol Species'
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
    key: 'invasive_plant_management_areas',
    name: 'Invasive Plant Management Areas'
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

export const iappColumnsToDisplay = [
  {
    key: 'site_id',
    name: 'Site ID'
  },
  {
    key: 'site_paper_file_id',
    name: 'Site Paper File ID'
  },
  {
    key: 'jurisdictions_flattened',
    name: 'Jurisdictions'
  },
  {
    key: 'min_survey',
    name: 'Site Create Date'
  },
  {
    key: 'all_species_on_site',
    name: 'Invasive Plants'
  },
  {
    key: 'biological_agent',
    name: 'Biological Agent'
  },
  {
    key: 'max_survey',
    name: 'Last Surveyed Date'
  },
  {
    key: 'agencies',
    name: 'Agencies'
  },
  {
    key: 'has_biological_treatments',
    name: 'Biocontrol Release'
  },
  {
    key: 'has_chemical_treatments',
    name: 'Chemical Treatment'
  },
  {
    key: 'has_mechanical_treatments',
    name: 'Mechanical Treatment'
  },
  {
    key: 'has_biological_dispersals',
    name: 'Biocontrol Dispersal'
  },
  {
    key: 'monitored',
    name: 'Monitored'
  },
  {
    key: 'regional_district',
    name: 'Regional District'
  },
  {
    key: 'regional_invasive_species_organization',
    name: 'Regional Invasive Species Organization'
  },
  {
    key: 'invasive_plant_management_area',
    name: 'Invasive Plant Management Area'
  }
];

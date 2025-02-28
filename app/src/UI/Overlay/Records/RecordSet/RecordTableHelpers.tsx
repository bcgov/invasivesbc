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
  const root = activity.hasOwnProperty('activity_payload') ? activity.activity_payload : activity;
  const columns: any = {
    activity_id: activity?.activity_id,
    short_id: activity?.short_id,
    activity_type: activity?.activity_type,
    activity_subtype: ActivitySubtypeShortLabels[root?.activity_subtype ?? activity?.activity_subtype],
    activity_date: new Date(
      root?.form_data?.activity_data?.activity_date_time ?? root?.form_data?.activity_data?.activity_date_time ?? null
    )
      .toISOString()
      .substring(0, 10),
    project_code: getArrayString(
      Array.isArray(root?.form_data?.activity_data?.project_code) ? root?.form_data?.activity_data?.project_code : [],
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
    geometry: root?.geometry
    // date_modified: new Date(root?.created_timestamp).toString(),
    // reported_area: root?.form_data?.activity_data?.reported_area,
    // latitude: root?.form_data?.activity_data?.latitude,
    // longitude: root?.form_data?.activity_data?.longitude,
  };

  return JSON.parse(JSON.stringify(columns));
};

export const getUnnestedFieldsForIAPP = (record) => {
  const columns: any = {
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
  { key: 'short_id', name: 'Activity ID', displayWidget: 'div', hide: false },
  { key: 'activity_type', name: 'Activity Type', hide: false },
  { key: 'activity_subtype', name: 'Activity Sub Type', hide: false },
  { key: 'activity_date', name: 'Activity Date', hide: false },
  { key: 'project_code', name: 'Project Code', hide: false },
  { key: 'jurisdiction_display', name: 'Jurisdiction', hide: false },
  { key: 'invasive_plant', name: 'Invasive Plant', hide: false },
  { key: 'species_positive_full', name: 'All Positive', hide: false },
  { key: 'species_negative_full', name: 'All Negative', hide: false },
  { key: 'has_current_positive', name: 'Has Current Positive', hide: false },
  { key: 'current_positive_species', name: 'Current Positive Species', hide: false },
  { key: 'has_current_negative', name: 'Has Current Negative', hide: false },
  { key: 'current_negative_species', name: 'Current Negative Species', hide: false },
  { key: 'species_treated_full', name: 'Species Treated', hide: false },
  { key: 'species_biocontrol_full', name: 'Biocontrol Species', hide: false },
  { key: 'created_by', name: 'Created By', hide: false },
  { key: 'updated_by', name: 'Updated By', hide: false },
  { key: 'agency', name: 'Agency', hide: false },
  {
    key: 'regional_invasive_species_organization_areas',
    name: 'Regional Invasive Species Organization Areas',
    hide: false
  },
  { key: 'regional_districts', name: 'Regional Districts', hide: false },
  { key: 'invasive_plant_management_areas', name: 'Invasive Plant Management Areas', hide: false },
  { key: 'biogeoclimatic_zones', name: 'Bio Geo Climatic Zones', hide: false },
  { key: 'elevation', name: 'Elevation', hide: false },
  { key: 'batch_id', name: 'Batch ID', hide: false }
].sort((a, b) => a.name.localeCompare(b.name));

export const iappColumnsToDisplay = [
  { key: 'site_id', name: 'Site ID', hide: false },
  { key: 'site_paper_file_id', name: 'Site Paper File ID', hide: false },
  { key: 'jurisdictions_flattened', name: 'Jurisdictions', hide: false },
  { key: 'min_survey', name: 'Site Create Date', hide: false },
  { key: 'all_species_on_site', name: 'Invasive Plants', hide: false },
  { key: 'biological_agent', name: 'Biological Agent', hide: false },
  { key: 'max_survey', name: 'Last Surveyed Date', hide: false },
  { key: 'agencies', name: 'Agencies', hide: false },
  { key: 'has_biological_treatments', name: 'Biocontrol Release', hide: false },
  { key: 'has_chemical_treatments', name: 'Chemical Treatment', hide: false },
  { key: 'has_mechanical_treatments', name: 'Mechanical Treatment', hide: false },
  { key: 'has_biological_dispersals', name: 'Biocontrol Dispersal', hide: false },
  { key: 'monitored', name: 'Monitored', hide: false },
  { key: 'regional_district', name: 'Regional District', hide: false },
  { key: 'regional_invasive_species_organization', name: 'Regional Invasive Species Organization', hide: false },
  { key: 'invasive_plant_management_area', name: 'Invasive Plant Management Area', hide: false }
].sort((a, b) => a.name.localeCompare(b.name));

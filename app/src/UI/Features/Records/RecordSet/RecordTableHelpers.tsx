import IActivityTableRow from 'interfaces/TableRows/IActivityTableRow';
import IIappTableRow from 'interfaces/TableRows/IIappTableRow';

export const getUnnestedFieldsForActivity = (activity): IActivityTableRow => {
  // needs to be consistent with API column names
  const columns = {
    activity_id: activity?.activity_id,
    short_id: activity?.short_id,
    activity_type: activity?.activity_type,
    activity_subtype: activity?.activity_subtype,
    activity_date: activity?.activity_date,
    project_code: activity.project_code,
    jurisdiction_display: activity?.jurisdiction_display,
    invasive_plant: activity?.invasive_plant,
    species_positive_full: activity?.species_positive_full,
    species_negative_full: activity?.species_negative_full,
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
    geom: activity?.geom
  };

  return structuredClone(columns) as IActivityTableRow;
};

export const getUnnestedFieldsForIAPP = (record): IIappTableRow => {
  const columns = {
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
];

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
];

export const offlineActivityColumnsToDisplay = [
  { key: 'short_id', name: 'Activity ID', displayWidget: 'div', hide: false },
  { key: 'type', name: 'Activity Type', hide: false },
  { key: 'subtype', name: 'Activity Sub Type', hide: false },
  { key: 'date', name: 'Activity Date', hide: false },
  { key: 'area_m', name: 'Area (m²)', hide: false },
  { key: 'jurisdictions', name: 'Jurisdiction', hide: false },
  { key: 'invasive_plants', name: 'Invasive Plant(s)', hide: false },
  { key: 'created_by', name: 'Created By', hide: false },
  { key: 'funding_agencies', name: 'Funding Agencies', hide: false },
  { key: 'status', name: 'Status', hide: false }
];

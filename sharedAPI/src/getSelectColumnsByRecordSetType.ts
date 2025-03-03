const getSelectColumnsByRecordSetType = (recordSetType: any) => {
  let columns: string[] = [];
  if (recordSetType === 'Activity') {
    columns = [
      'activity_id',
      'short_id',
      'activity_type',
      'activity_subtype',
      'project_code',
      'jurisdiction_display',
      'invasive_plant',
      'species_positive_full',
      'species_negative_full',
      'has_current_positive',
      'has_current_negative',
      'current_positive_species',
      'current_negative_species',
      'species_treated_full',
      'species_biocontrol_full',
      'created_by',
      'updated_by',
      'agency',
      'regional_invasive_species_organization_areas',
      'regional_districts',
      'invasive_plant_management_areas',
      'biogeoclimatic_zones',
      'elevation',
      'batch_id',
      'geom'
    ];
  } else {
    columns = [
      'site_id',
      'site_paper_file_id',
      'jurisdictions_flattened',
      'min_survey',
      'all_species_on_site',
      'max_survey',
      'agencies',
      'biological_agent',
      'has_biological_treatments',
      'has_chemical_treatments',
      'has_mechanical_treatments',
      'has_biological_dispersals',
      'monitored',
      'regional_district',
      'regional_invasive_species_organization',
      'invasive_plant_management_area',
      'geojson'
    ];
  }
  return columns;
};

export default getSelectColumnsByRecordSetType;

import { Feature } from 'maplibre-gl';
import { ActivitySubtype, ActivityType } from 'sharedAPI';

interface IActivityTableRow {
  activity_id: string;
  short_id: string;
  activity_type: ActivityType;
  activity_subtype: ActivitySubtype;
  activity_date: Date;
  project_code: string;
  jurisdiction_display: string;
  invasive_plant: string;
  species_positive_full: string;
  species_negative_full: string;
  has_current_positive: string;
  current_positive_species: string;
  has_current_negative: string;
  current_negative_species: string;
  species_treated_full: string;
  species_biocontrol_full: string;
  created_by: string;
  updated_by: string;
  agency: string;
  regional_invasive_species_organization_areas: string;
  regional_districts: string;
  invasive_plant_management_areas: string;
  biogeoclimatic_zones: string;
  elevation: string;
  batch_id: string;
  geometry: Feature | Feature[];
}

export default IActivityTableRow;

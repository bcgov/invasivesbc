import { GeoJSON } from 'geojson';

interface IIappTableRow {
  site_id: number | string;
  site_paper_file_id: string;
  jurisdictions_flattened: string;
  min_survey: Date;
  all_species_on_site: string;
  max_survey: Date;
  agencies: string;
  biological_agent: string;
  has_biological_treatments: string;
  has_chemical_treatments: string;
  has_mechanical_treatments: string;
  has_biological_dispersals: string;
  monitored: string;
  regional_district: string;
  regional_invasive_species_organization: string;
  invasive_plant_management_area: string;
  geometry: GeoJSON;
}
export default IIappTableRow;

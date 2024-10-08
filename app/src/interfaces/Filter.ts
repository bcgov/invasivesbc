import { FeatureCollection } from 'geojson';
import { ActivityStatus } from 'sharedAPI';

interface Filter {
  created_by?: string;
  form_status?: ActivityStatus;
  grid_filters?: any[];
  search_feature?: FeatureCollection;
  search_feature_server_id?: string;
  filterField?: string;
  jurisdiction?: string[];
  speciesPositive?: string[];
  speciesNegative?: string[];
  isIAPP?: boolean;
  page?: number;
  limit?: number;
  order?: any[];
}

export default Filter;

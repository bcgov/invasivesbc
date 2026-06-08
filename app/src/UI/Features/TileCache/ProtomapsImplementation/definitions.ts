import * as geojson from 'geojson';

type MapRecord = {
  id: number;
  minimum_zoom: number;
  maximum_zoom: number;
  file_name: string;
  trip_name: string | null;
  file_size: string;
  raster: boolean;
  updated: Date;
  bounds: GeoJSON.Polygon;
  centroid: GeoJSON.Point;
  download_link: string;
};

type MapRecordComplete = MapRecord & {};

type MapGenerationEstimateRequest = {
  bounds: geojson.Polygon | undefined;
  minimum_zoom: number;
  maximum_zoom: number;
};
type MapGenerationCommonResponse = {
  total_tile_count: number;
  area_km2: number;
  minimum_zoom: number;
  maximum_zoom: number;
  bounds: geojson.Polygon;
  tile_definition_source_name: string;
  trip_name: string;
};

type MapGenerationEstimateResponse = MapGenerationCommonResponse & {
  estimated_final_size: number;
  estimated_download_time_best_case: number;
  estimated_download_time_worst_case: number;
  is_size_valid: boolean;
};

type MapGenerationExecutionResponse = MapGenerationCommonResponse & {
  id: number;
  status: string;
};

type MapGenerationRequest = MapGenerationEstimateRequest & {};

type MapGenerationRequestMonitoringResponse = MapGenerationExecutionResponse & {
  status: 'PENDING' | 'PROCESSING' | 'FAILED' | 'COMPLETED';
  tile_definition_source_name: string;
  total_tile_count: number;
  intermediate_results?: {
    tiles_downloaded: number;
    tiles_remaining: number;
    cache_hits: number;
    cache_misses: number;
    status_information: string;
  };
  generation_record: MapRecord;
};

export type {
  MapGenerationEstimateRequest,
  MapRecord,
  MapRecordComplete,
  MapGenerationEstimateResponse,
  MapGenerationExecutionResponse,
  MapGenerationCommonResponse,
  MapGenerationRequest,
  MapGenerationRequestMonitoringResponse
};

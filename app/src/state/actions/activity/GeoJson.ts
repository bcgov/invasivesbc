import { createAction } from '@reduxjs/toolkit';
import {
  ACTIVITIES_GEOJSON_GET_REQUEST,
  ACTIVITIES_GEOJSON_GET_ONLINE,
  ACTIVITIES_GEOJSON_GET_SUCCESS,
  ACTIVITIES_GEOJSON_REFETCH_ONLINE
} from '../../actions';
import Filter from 'interfaces/Filter';

class GeoJson {
  static readonly get = createAction<Filter>(ACTIVITIES_GEOJSON_GET_REQUEST);
  static readonly getSuccess = createAction(ACTIVITIES_GEOJSON_GET_SUCCESS);
  static readonly getOnline = createAction(ACTIVITIES_GEOJSON_GET_ONLINE);
  static readonly refetchOnline = createAction(ACTIVITIES_GEOJSON_REFETCH_ONLINE);
}
export default GeoJson;

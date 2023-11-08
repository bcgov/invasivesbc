import { TurnLeft } from '@mui/icons-material';
import { put, select, take } from 'redux-saga/effects';
import intersect from '@turf/intersect';

import {
  ACTIVITIES_GEOJSON_GET_OFFLINE,
  ACTIVITIES_GEOJSON_GET_ONLINE,
  ACTIVITIES_GET_IDS_FOR_RECORDSET_OFFLINE,
  ACTIVITIES_GET_IDS_FOR_RECORDSET_ONLINE,
  ACTIVITIES_TABLE_ROWS_GET_FAILURE,
  ACTIVITIES_TABLE_ROWS_GET_ONLINE,
  ACTIVITY_GET_INITIAL_STATE_FAILURE,
  IAPP_GEOJSON_GET_ONLINE,
  IAPP_GET_IDS_FOR_RECORDSET_ONLINE,
  IAPP_TABLE_ROWS_GET_ONLINE,
  MAP_WHATS_HERE_INIT_GET_ACTIVITY_IDS_FETCHED,
  MAP_WHATS_HERE_INIT_GET_POI_IDS_FETCHED,
  WHATS_HERE_ACTIVITY_ROWS_REQUEST,
  WHATS_HERE_IAPP_ROWS_REQUEST,
  WHATS_HERE_PAGE_POI
} from 'state/actions';
import { selectMap } from 'state/reducers/map';
import { booleanPointInPolygon, multiPolygon, point, polygon } from '@turf/turf';
import { selectUserSettings } from 'state/reducers/userSettings';
import { getSearchCriteriaFromFilters } from 'util/miscYankedFromComponents';

export function* handle_ACTIVITIES_GEOJSON_GET_REQUEST(action) {
  try {
    // if mobile or web
    if (true) {
      yield put({
        type: ACTIVITIES_GEOJSON_GET_ONLINE,
        payload: {
          recordSetID: action.payload.recordSetID,
          activitiesFilterCriteria: action.payload.activitiesFilterCriteria,
          layerState: action.payload.layerState
        }
      });
    }
    if (false) {
      yield put({ type: ACTIVITIES_GEOJSON_GET_OFFLINE, payload: { activityID: action.payload.activityID } });
    }
  } catch (e) {
    console.error(e);
    yield put({ type: ACTIVITY_GET_INITIAL_STATE_FAILURE });
  }
}

export function* handle_IAPP_GEOJSON_GET_REQUEST(action) {
  try {
    // if mobile or web
    if (true) {
      yield put({
        type: IAPP_GEOJSON_GET_ONLINE,
        payload: {
          ...action.payload
        }
      });
    }
    if (false) {
      yield put({ type: ACTIVITIES_GEOJSON_GET_OFFLINE, payload: { activityID: action.payload.activityID } });
    }
  } catch (e) {
    console.error(e);
    yield put({ type: ACTIVITY_GET_INITIAL_STATE_FAILURE });
  }
}

export function* handle_ACTIVITIES_GET_IDS_FOR_RECORDSET_REQUEST(action) {
  const currentState = yield select(selectUserSettings);
  const mapState = yield select(selectMap);
  let filterObject = getRecordFilterObjectFromStateForAPI(action.payload.recordSetID, currentState);
  //filterObject.page = action.payload.page ? action.payload.page : mapState.recordTables?.[action.payload.recordSetID]?.page;
  filterObject.limit = 200000;
  filterObject.selectColumns = ['activity_id'];

  try {
    // if mobile or web
    if (true) {
      yield put({
        type: ACTIVITIES_GET_IDS_FOR_RECORDSET_ONLINE,
        payload: {
          filterObj: filterObject,
          recordSetID: action.payload.recordSetID
        }
      });
    }
    if (false) {
      yield put({ type: ACTIVITIES_GET_IDS_FOR_RECORDSET_OFFLINE, payload: { activityID: action.payload.activityID } });
    }
  } catch (e) {
    console.error(e);
    yield put({ type: ACTIVITY_GET_INITIAL_STATE_FAILURE });
  }
}

export function* handle_IAPP_GET_IDS_FOR_RECORDSET_REQUEST(action) {
  try {
    const currentState = yield select(selectUserSettings);
    const mapState = yield select(selectMap);
    let filterObject = getRecordFilterObjectFromStateForAPI(action.payload.recordSetID, currentState);
    //filterObject.page = action.payload.page ? action.payload.page : mapState.recordTables?.[action.payload.recordSetID]?.page;
    filterObject.limit = 200000;
    filterObject.selectColumns = ['site_id'];
    // if mobile or web
    if (true) {
      yield put({
        type: IAPP_GET_IDS_FOR_RECORDSET_ONLINE,
        payload: {
          filterObj: filterObject,
          recordSetID: action.payload.recordSetID
        }
      });
    }
    if (false) {
      yield put({ type: ACTIVITIES_GEOJSON_GET_OFFLINE, payload: { activityID: action.payload.activityID } });
    }
  } catch (e) {
    console.error(e);
    yield put({ type: ACTIVITY_GET_INITIAL_STATE_FAILURE });
  }
}

export const getRecordFilterObjectFromStateForAPI = (recordSetID, recordSetsState, clientBoundaries) => {
  const getFilterWithDrawnShape = (filterID) => {
    return clientBoundaries.filter((filter) => {
      return filter.id === filterID;
    })?.[0];
  };
  const recordSet = JSON.parse(JSON.stringify(recordSetsState.recordSets?.[recordSetID]));
  const recordSetType = recordSetsState?.recordSets?.[recordSetID]?.recordSetType;
  const sortColumns = recordSet?.sortColumns;
  const tableFilters = recordSet?.tableFilters;
  let spatialFilters = recordSet?.spatialFilters || []
  spatialFilters?.map((filter) => {
    filter.filterType !== 'spatialFilterDrawn' ? filter : { ...filter, geojson: getFilterWithDrawnShape(filter.id) };
  });
  const selectColumns = recordSet?.selectColumns
    ? recordSet?.selectColumns
    : getSelectColumnsByRecordSetType(recordSetType);

  return {
    recordSetType: recordSetType,
    sortColumns: sortColumns,
    tableFilters: tableFilters,
    spatialFilters: spatialFilters,
    selectColumns: selectColumns
  } as any;
};

export function* handle_ACTIVITIES_TABLE_ROWS_GET_REQUEST(action) {
  try {
    // new filter object:
    const currentState = yield select(selectUserSettings);
    const mapState = yield select(selectMap);
    let filterObject = getRecordFilterObjectFromStateForAPI(action.payload.recordSetID, currentState, mapState?.clientBoundaries);
    filterObject.page = action.payload.page
      ? action.payload.page
      : mapState.recordTables?.[action.payload.recordSetID]?.page;
    filterObject.limit = action.payload.limit
      ? action.payload.limit
      : mapState.recordTables?.[action.payload.recordSetID]?.limit;

    if (true) {
      yield put({
        type: ACTIVITIES_TABLE_ROWS_GET_ONLINE,
        payload: {
          filterObj: filterObject,
          recordSetID: action.payload.recordSetID
        }
      });
    }
    if (false) {
      yield put({ type: ACTIVITIES_GEOJSON_GET_OFFLINE, payload: { activityID: action.payload.activityID } });
    }
  } catch (e) {
    console.error(e);
    yield put({ type: ACTIVITIES_TABLE_ROWS_GET_FAILURE });
  }
}

export function* handle_IAPP_TABLE_ROWS_GET_REQUEST(action) {
  try {
    const currentState = yield select(selectUserSettings);
    const mapState = yield select(selectMap);
    let filterObject = getRecordFilterObjectFromStateForAPI(action.payload.recordSetID, currentState, mapState?.clientBoundaries);
    filterObject.page = action.payload.page
      ? action.payload.page
      : mapState.recordTables?.[action.payload.recordSetID]?.page;
    filterObject.limit = action.payload.limit
      ? action.payload.limit
      : mapState.recordTables?.[action.payload.recordSetID]?.limit;
    // if mobile or web
    if (true) {
      yield put({
        type: IAPP_TABLE_ROWS_GET_ONLINE,
        payload: {
          filterObj: filterObject,
          recordSetID: action.payload.recordSetID
        }
      });
    }
    if (false) {
      yield put({ type: ACTIVITIES_GEOJSON_GET_OFFLINE, payload: { activityID: action.payload.activityID } });
    }
  } catch (e) {
    console.error(e);
    yield put({ type: ACTIVITY_GET_INITIAL_STATE_FAILURE });
  }
}

function largePush(src, dest) {
  const len = src.length;
  for (let i = 0; i < len; i++) {
    dest.push(src[i]);
  }
}

export function* handle_MAP_WHATS_HERE_INIT_GET_POI(action) {
  const currentMapState = yield select(selectMap);

  const featuresFilteredByUserShape = currentMapState.IAPPGeoJSON.features.filter((feature) => {
    // IAPP will always be a points
    const pointToCheck = point(feature.geometry.coordinates);
    const polygonToCheck = polygon(currentMapState?.whatsHere?.feature?.geometry.coordinates);
    return booleanPointInPolygon(pointToCheck, polygonToCheck);
  });

  const featureFilteredIDS = featuresFilteredByUserShape.map((feature) => {
    return feature.properties.site_id;
  });

  let unfilteredRecordSetIDs = [];

  Object.keys(currentMapState?.layers).map((id) => {
    if (currentMapState.layers?.[id].type === 'POI' && currentMapState.layers?.[id].layerState.mapToggle) {
      largePush(currentMapState?.layers?.[id]?.IDList, unfilteredRecordSetIDs);
    }
  });

  const recordSetFilteredIDs = unfilteredRecordSetIDs.filter((id) => {
    return featureFilteredIDS.includes(id);
  });

  // Filter duplicates
  const recordSetUniqueFilteredIDs = Array.from(new Set(recordSetFilteredIDs));

  yield put({ type: MAP_WHATS_HERE_INIT_GET_POI_IDS_FETCHED, payload: { IDs: recordSetUniqueFilteredIDs } });
  yield put({ type: WHATS_HERE_IAPP_ROWS_REQUEST, payload: { page: 0 } });
}

export function* handle_MAP_WHATS_HERE_INIT_GET_ACTIVITY(action) {
  const currentMapState = yield select(selectMap);

  const featuresFilteredByUserShape = currentMapState?.activitiesGeoJSON?.features?.filter((feature) => {
    // activities can have points and polygons, lines are considered polygons
    const boundaryPolygon = polygon(currentMapState?.whatsHere?.feature?.geometry.coordinates);
    switch (feature?.geometry?.type) {
      case 'Point':
        const featurePoint = point(feature.geometry.coordinates);
        return booleanPointInPolygon(featurePoint, boundaryPolygon);
      case 'Polygon':
        const featurePolygon = polygon(feature.geometry.coordinates);
        return intersect(featurePolygon, boundaryPolygon);
      case 'MultiPolygon':
        const amultiPolygon = multiPolygon(feature.geometry.coordinates);
        return intersect(amultiPolygon, boundaryPolygon);
      default:
        return false;
    }
  });

  const featureFilteredIDS = featuresFilteredByUserShape.map((feature) => {
    return feature.properties.id;
  });

  let unfilteredRecordSetIDs = [];
  Object.keys(currentMapState?.layers).map((id) => {
    if (currentMapState.layers?.[id].type === 'Activity' && currentMapState.layers?.[id].layerState.mapToggle) {
      unfilteredRecordSetIDs.push(...currentMapState?.layers?.[id]?.IDList);
    }
  });

  const recordSetFilteredIDs = unfilteredRecordSetIDs.filter((id) => {
    return featureFilteredIDS.includes(id);
  });

  // Filter duplicates
  const recordSetUniqueFilteredIDs = Array.from(new Set(recordSetFilteredIDs));

  yield put({ type: MAP_WHATS_HERE_INIT_GET_ACTIVITY_IDS_FETCHED, payload: { IDs: recordSetUniqueFilteredIDs } });
  yield put({ type: WHATS_HERE_ACTIVITY_ROWS_REQUEST, payload: { page: 0 } });
}

function getSelectColumnsByRecordSetType(recordSetType: any) {
  //throw new Error('Function not implemented.');
  let columns = [];
  if (recordSetType === 'Activity') {
    columns = [
      'activity_id',
      'short_id',
      'activity_type',
      'activity_subtype',
      'project_code',
      'jurisdiction_display',
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
}

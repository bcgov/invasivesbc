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
import { booleanPointInPolygon, point, polygon } from '@turf/turf';

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
  try {
    // if mobile or web
    if (true) {
      yield put({
        type: ACTIVITIES_GET_IDS_FOR_RECORDSET_ONLINE,
        payload: {
          ...action.payload
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
    // if mobile or web
    if (true) {
      yield put({
        type: IAPP_GET_IDS_FOR_RECORDSET_ONLINE,
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

export function* handle_ACTIVITIES_TABLE_ROWS_GET_REQUEST(action) {
  try {
    // if mobile or web
    if (true) {
      yield put({
        type: ACTIVITIES_TABLE_ROWS_GET_ONLINE,
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
    yield put({ type: ACTIVITIES_TABLE_ROWS_GET_FAILURE });
  }
}

export function* handle_IAPP_TABLE_ROWS_GET_REQUEST(action) {
  try {
    // if mobile or web
    if (true) {
      yield put({
        type: IAPP_TABLE_ROWS_GET_ONLINE,
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

function largePush(src, dest){
  const len = src.length
  for(let i = 0; i < len; i++){
      dest.push(src[i])
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
      largePush(currentMapState?.layers?.[id]?.IDList, unfilteredRecordSetIDs)
    }
  });


  const recordSetFilteredIDs = unfilteredRecordSetIDs.filter((id) => {
    return featureFilteredIDS.includes(id);
  });

  // Filter duplicates
  const recordSetUniqueFilteredIDs = Array.from(new Set(recordSetFilteredIDs));
  
  yield put({ type: MAP_WHATS_HERE_INIT_GET_POI_IDS_FETCHED, payload: { IDs: recordSetUniqueFilteredIDs } });
  yield put({ type: WHATS_HERE_IAPP_ROWS_REQUEST, payload: { page: 0} });
}

export function* handle_MAP_WHATS_HERE_INIT_GET_ACTIVITY(action) {
  const currentMapState = yield select(selectMap);

  const featuresFilteredByUserShape = currentMapState?.activitiesGeoJSON?.features?.filter((feature) => {
    // activities can have points and polygons, lines are considered polygons
    const boundaryPolygon = polygon(currentMapState?.whatsHere?.feature?.geometry.coordinates);
    switch(feature?.geometry?.type) {
      case "Point":
        const featurePoint = point(feature.geometry.coordinates);
        return booleanPointInPolygon(featurePoint, boundaryPolygon);
      case "Polygon":
        const featurePolygon = polygon(feature.geometry.coordinates);
        return intersect(featurePolygon, boundaryPolygon);
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
  yield put({ type: WHATS_HERE_ACTIVITY_ROWS_REQUEST, payload: { page: 0} });
}
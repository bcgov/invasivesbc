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

export function* handle_MAP_WHATS_HERE_INIT_GET_POI(action) {
  const currentMapState = yield select(selectMap);

  const featuresFilteredByUserShape = currentMapState.IAPPGeoJSON.features.filter((feature) => {
    // IAPP will always be a points
    const pointToCheck = point(feature.geometry.coordinates);
    const polygonToCheck = polygon(currentMapState?.whatsHere?.feature?.geometry.coordinates);
    return booleanPointInPolygon(pointToCheck, polygonToCheck);
  });

  console.log('featuresFilteredByUserShape', featuresFilteredByUserShape?.length);
  const featureFilteredIDS = featuresFilteredByUserShape.map((feature) => {
    return feature.properties.site_id;
  });

  console.log('featureFilteredIDS', featureFilteredIDS?.length);

  let unfilteredRecordSetIDs = [];
  Object.keys(currentMapState.layers).map((id) => {
    if (currentMapState.layers?.[id].type === 'POI' && currentMapState.layers?.[id].layerState.mapToggle) {
      unfilteredRecordSetIDs.push(...currentMapState?.layers?.[id]?.IDList);
    }
  });

  console.log('unfilteredRecordSetIDs', unfilteredRecordSetIDs?.length);

  const recordSetFilteredIDs = unfilteredRecordSetIDs.filter((id) => {
    return featureFilteredIDS.includes(id);
  });

  console.log('recordSetFilteredIDs', recordSetFilteredIDs?.length);

  // online/offline agnostic paging
  yield put({ type: WHATS_HERE_IAPP_ROWS_REQUEST, payload: { IDs: recordSetFilteredIDs } });
  while (currentMapState?.whatsHere?.toggle) {
    const currentMapState = yield select(selectMap);
    if (!currentMapState?.whatsHere?.toggle) {
      return;
    }
    // get slice here
    const pageAction = yield take(WHATS_HERE_PAGE_POI); // maybe need to do takeAny and look for toggle
    const page = pageAction.payload.page || 0;
    const limit = pageAction.payload.limit || 0;
    const subset = [];
    yield put({ type: WHATS_HERE_IAPP_ROWS_REQUEST, payload: { IDs: subset } });
  }
}

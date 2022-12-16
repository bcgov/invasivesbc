import {
  all,
  call,
  delay,
  put,
  select,
  throttle,
  take,
  takeEvery,
  takeLatest,
  actionChannel
} from 'redux-saga/effects';
import Keycloak from 'keycloak-js';
import {
  USER_SETTINGS_SET_RECORD_SET_SUCCESS,
  ACTIVITIES_GEOJSON_GET_REQUEST,
  ACTIVITIES_GEOJSON_GET_SUCCESS,
  ACTIVITIES_GEOJSON_GET_ONLINE,
  USER_SETTINGS_GET_INITIAL_STATE_SUCCESS,
  IAPP_GEOJSON_GET_REQUEST,
  IAPP_GEOJSON_GET_ONLINE,
  IAPP_TABLE_ROWS_GET_REQUEST,
  IAPP_TABLE_ROWS_GET_ONLINE,
  IAPP_TABLE_ROWS_GET_SUCCESS,
  IAPP_RECORDSET_ID_LIST_GET_SUCCESS,
  IAPP_GEOJSON_GET_SUCCESS,
  IAPP_INIT_LAYER_STATE_REQUEST,
  MAP_INIT_REQUEST,
  IAPP_GET_IDS_FOR_RECORDSET_REQUEST,
  IAPP_GET_IDS_FOR_RECORDSET_SUCCESS,
  IAPP_GET_IDS_FOR_RECORDSET_ONLINE,
  LAYER_STATE_UPDATE,
  ACTIVITIES_GET_IDS_FOR_RECORDSET_ONLINE,
  ACTIVITIES_GET_IDS_FOR_RECORDSET_REQUEST,
  ACTIVITIES_GET_IDS_FOR_RECORDSET_SUCCESS,
  FILTER_STATE_UPDATE,
  ACTIVITIES_TABLE_ROWS_GET_REQUEST,
  ACTIVITIES_TABLE_ROWS_GET_ONLINE,
  PAGE_OR_LIMIT_UPDATE,
  SORT_COLUMN_STATE_UPDATE,
  USER_SETTINGS_REMOVE_RECORD_SET_SUCCESS,
  MAP_DELETE_LAYER_AND_TABLE,
  MAP_TOGGLE_TRACKING,
  MAP_SET_COORDS
} from '../actions';
import { AppConfig } from '../config';
import { selectConfiguration } from '../reducers/configuration';
import {
  handle_ACTIVITIES_GEOJSON_GET_REQUEST,
  handle_ACTIVITIES_GET_IDS_FOR_RECORDSET_REQUEST,
  handle_ACTIVITIES_TABLE_ROWS_GET_REQUEST,
  handle_IAPP_GEOJSON_GET_REQUEST,
  handle_IAPP_GET_IDS_FOR_RECORDSET_REQUEST,
  handle_IAPP_TABLE_ROWS_GET_REQUEST
} from './map/dataAccess';
import {
  handle_ACTIVITIES_GEOJSON_GET_ONLINE,
  handle_ACTIVITIES_GET_IDS_FOR_RECORDSET_ONLINE,
  handle_ACTIVITIES_TABLE_ROWS_GET_ONLINE,
  handle_IAPP_GEOJSON_GET_ONLINE,
  handle_IAPP_GET_IDS_FOR_RECORDSET_ONLINE,
  handle_IAPP_TABLE_ROWS_GET_ONLINE
} from './map/online';
import { getSearchCriteriaFromFilters } from 'components/activities-list/Tables/Plant/ActivityGrid';
import { selectAuth } from 'state/reducers/auth';
import { selectMap } from 'state/reducers/map';
import { selectUserSettings } from 'state/reducers/userSettings';
import { ActivityStatus } from 'constants/activities';
import userSettingsSaga from './userSettings';
import userSettings from './userSettings';
import { InvasivesAPI_Call } from 'hooks/useInvasivesApi';
import L from 'leaflet';
import { Geolocation } from '@capacitor/geolocation';
import { channel } from 'redux-saga';
function* handle_ACTIVITY_DEBUG(action) {
  console.log('halp');
}
function* handle_USER_SETTINGS_SET_RECORD_SET_SUCCESS(action) {
  //recordSets.filter(recordSetName
  /* export const getSearchCriteriaFromFilters = (
    advancedFilterRows: any,
    rolesUserHasAccessTo: any,
    recordSets: any,
    setName: string,
    isIAPP: boolean,
    gridFilters: any,
    page: number,
    limit: number,
    sortColumns: readonly SortColumn[]
  ) => {*/

  const authState = yield select(selectAuth);
  const mapState = yield select(selectMap);
  const sets = {};
  sets[action.payload.updatedSetName] = { ...action.payload.updatedSet };
  const filterCriteria = yield getSearchCriteriaFromFilters(
    action.payload.updatedSet.advancedFilterRows,
    authState.accessRoles,
    sets,
    action.payload.updatedSetName,
    action.payload.updatedSet.recordSetType === 'POI' ? true : false,
    action.payload.updatedSet.gridFilters,
    0,
    200000
  );

  const layerState = {
    color: action.payload.updatedSet.color,
    drawOrder: action.payload.updatedSet.drawOrder,
    mapToggle: action.payload.updatedSet.mapToggle,
    labelToggle: action.payload.updatedSet.labelToggle
  };

  const newFilterState = {
    advancedFilters: [...action.payload.updatedSet.advancedFilters],
    gridFilters: { ...action.payload.updatedSet.gridFilters },
    searchBoundary: { ...action.payload.updatedSet.searchBoundary },
    serverSearchBoundary: { ...action.payload.updatedSet.searchBoundary?.server_id }
  };

  const testStateEqual = (a, b) => {
    return a.color === b.color && a.drawOrder === b.drawOrder && a.mapToggle === b.mapToggle;
  };
  function arraysEqual(a, b) {
    if (a === b) return true;
    if (a == null || b == null) return false;
    if (a.length !== b.length) return false;

    // If you don't care about the order of the elements inside
    // the array, you should sort both arrays here.
    // Please note that calling sort on an array will modify that array.
    // you might want to clone your array first.

    for (var i = 0; i < a.length; ++i) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

  const compareObjects = (a, b) => {
    if (a && !b) {
      return false;
    }
    if (b && !a) {
      return false;
    }
    for (const p in a) {
      switch (typeof a[p]) {
        case 'string':
          if (a[p] !== b[p]) {
            return false;
          }
          break;
        case 'boolean':
          if (a[p] !== b[p]) {
            return false;
          }
          break;
        case 'number':
          if (a[p] !== b[p]) {
            return false;
          }
          break;
        default:
          if (!arraysEqual(a[p], b[p])) {
            return false;
          } else {
            if (!compareObjects(a[p], b[p])) {
              return false;
            }
          }
      }
    }
    for (const p in b) {
      switch (typeof b[p]) {
        case 'string':
          if (a[p] !== b[p]) {
            return false;
          }
          break;
        case 'boolean':
          if (a[p] !== b[p]) {
            return false;
          }
          break;
        case 'number':
          if (a[p] !== b[p]) {
            return false;
          }
          break;
        default:
          if (!arraysEqual(a[p], b[p])) {
            return false;
          } else {
            if (!compareObjects(b[p], a[p])) {
              return false;
            }
          }
      }
    }
    return true;
  };

  if (!compareObjects(mapState?.layers?.[action.payload.updatedSetName]?.layerState, layerState)) {
    yield put({
      type: LAYER_STATE_UPDATE,
      payload: {
        [action.payload.updatedSetName]: {
          layerState: { ...layerState },
          type: action.payload.updatedSet.recordSetType
        }
      }
    });
  }

  if (
    !compareObjects(mapState?.layers?.[action.payload.updatedSetName]?.filters, newFilterState)
    //|| !mapState?.recordTables?.[action.payload.updatedSetName]
  ) {
    yield put({
      type: FILTER_STATE_UPDATE,
      payload: {
        [action.payload.updatedSetName]: {
          filters: { ...newFilterState },
          type: action.payload.updatedSet.recordSetType
        }
      }
    });
  }
}

function* handle_USER_SETTINGS_GET_INITIAL_STATE_SUCCESS(action) {
  yield put({ type: MAP_INIT_REQUEST, payload: {} });
}

function* handle_MAP_INIT_REQUEST(action) {
  const authState = yield select(selectAuth);
  const sets = {};
  // sets['2'] = action.payload.recordSets[2];
  // sets['3'] = action.payload.recordSets[3];
  const filterCriteria = yield getSearchCriteriaFromFilters(
    [],
    //    action.payload.recordSets[2].advancedFilterRows,
    authState.accessRoles,
    sets,
    '2',
    false,
    [],
    //action.payload.recordSets[2].gridFilters,
    0,
    999
  );

  const IAPP_filter = yield getSearchCriteriaFromFilters(
    [],
    //action.payload.recordSets[3].advancedFilterRows,
    authState.accessRoles,
    sets,
    '3',
    true,
    [],
    //action.payload.recordSets[3].gridFilters,
    0,
    100
  );

  yield put({
    type: ACTIVITIES_GEOJSON_GET_REQUEST,
    payload: {
      // recordSetID: '2',
      activitiesFilterCriteria: filterCriteria
      // layerState: layerState
    }
  });

  yield take(ACTIVITIES_GEOJSON_GET_SUCCESS);

  yield put({
    type: IAPP_GEOJSON_GET_REQUEST,
    payload: {
      //   recordSetID: '3',
      IAPPFilterCriteria: { ...IAPP_filter, limit: 200000 }
      //   layerState: IAPPlayerState
    }
  });

  yield take(IAPP_GEOJSON_GET_SUCCESS);

  const oldAppState = JSON.parse(localStorage.getItem('appstate-invasivesbc'));
  const defaultRecordSet = {
    ['1']: {
      recordSetType: 'Activity',
      recordSetName: 'My Drafts',
      advancedFilters: [
        {
          filterField: 'created_by',
          filterValue: authState.username,
          filterKey: 'created_by' + authState.username
        },
        {
          filterField: 'record_status',
          filterValue: ActivityStatus.DRAFT,
          filterKey: 'record_status' + ActivityStatus.DRAFT
        }
      ]
    },
    ['2']: {
      recordSetType: 'Activity',
      recordSetName: 'All InvasivesBC Activities',
      drawOrder: 1,
      advancedFilters: []
    },
    ['3']: {
      recordSetType: 'POI',
      recordSetName: 'All IAPP Records',
      color: '#21f34f',
      drawOrder: 2,
      advancedFilters: []
    }
  };
  const recordSets = oldAppState?.recordSets ? oldAppState.recordSets : defaultRecordSet;

  const serverShapesServerResponse = yield InvasivesAPI_Call('GET', '/admin-defined-shapes');
  console.dir(serverShapesServerResponse);
  const shapes = serverShapesServerResponse.data.result;

  let newMapState = {};
  for (const rs in recordSets) {
    newMapState[rs] = {};
    let newLayerState = {};
    newLayerState = {
      color: recordSets[rs].color,
      mapToggle: recordSets[rs].mapToggle,
      labelToggle: recordSets[rs].labelToggle,
      drawOrder: recordSets[rs].drawOrder
    };
    newMapState[rs].layerState = {
      ...newLayerState
    };

    //grab shapes from server here
    // grab shapes from sqlite here
    let newFilters = {};
    const serverPatchedSearchBoundary = shapes.filter((s) => {
      return s.id === recordSets[rs].searchBoundary?.server_id;
    })[0];
    const searchBoundaryUpdatedWithShapeFromServer = serverPatchedSearchBoundary?.goes
      ? { ...recordSets[rs].searchBoundary, geos: [...serverPatchedSearchBoundary.geos.features] }
      : { ...recordSets[rs].searchBoundary };

    newFilters = {
      advancedFilters: recordSets[rs].advancedFilters,
      gridFilters: recordSets[rs].gridFilters,
      searchBoundary: searchBoundaryUpdatedWithShapeFromServer,
      serverSearchBoundary: recordSets[rs].searchBoundary?.server_id
    };
    newMapState[rs].filters = {
      ...newFilters
    };

    const newLayer = {
      layerState: { ...newLayerState },
      filters: { ...newFilters },
      type: recordSets[rs].recordSetType,
      loaded: false
    };

    newMapState[rs] = { ...newLayer };
  }

  yield put({
    type: LAYER_STATE_UPDATE,
    payload: { ...newMapState }
  });

  yield put({
    type: FILTER_STATE_UPDATE,
    payload: { ...newMapState }
  });
}

function* handle_FILTER_STATE_UPDATE(action) {
  const authState = yield select(selectAuth);
  const settingsState = yield select(selectUserSettings);
  const recordSets = JSON.parse(JSON.stringify(settingsState.recordSets));
  for (const x in action.payload) {
    if (action.payload[x].type === 'POI') {
      const IAPP_filter = getSearchCriteriaFromFilters(
        action.payload?.[x]?.filters?.advancedFilters,
        authState.accessRoles,
        recordSets,
        x,
        true,
        action.payload[x].filters.gridFilters,
        0,
        200000
      );
      yield put({
        type: IAPP_GET_IDS_FOR_RECORDSET_REQUEST,
        payload: {
          recordSetID: x,
          IAPPFilterCriteria: { ...IAPP_filter, site_id_only: true }
        }
      });
    } else {
      const activityFilter = getSearchCriteriaFromFilters(
        action.payload?.[x]?.filters?.advancedFilters,
        authState.accessRoles,
        recordSets,
        x,
        false,
        action.payload?.[x]?.filters?.gridFilters,
        0,
        200000
      );
      yield put({
        type: ACTIVITIES_GET_IDS_FOR_RECORDSET_REQUEST,
        payload: {
          recordSetID: x,
          ActivityFilterCriteria: { ...activityFilter, activity_id_only: true }
        }
      });
    }
  }
}

function* handle_ACTIVITIES_GET_IDS_FOR_RECORDSET_SUCCESS(action) {
  const authState = yield select(selectAuth);
  const recordSetsState = yield select(selectUserSettings);
  const mapState = yield select(selectMap);
  const recordSetID = action.payload.recordSetID;
  const recordSet = JSON.parse(JSON.stringify(recordSetsState.recordSets?.[recordSetID]));
  const isOpen = recordSet.expanded;

  if (!isOpen) {
    return;
  }

  const filters = getSearchCriteriaFromFilters(
    recordSet.advancedFilters,
    authState.accessRoles,
    recordSetsState.recordSets,
    recordSetID,
    false,
    recordSet.gridFilters,
    0,
    20,
    mapState?.layers?.[recordSetID]?.filters?.sortColumns
  );

  //trigger get
  yield put({
    type: ACTIVITIES_TABLE_ROWS_GET_REQUEST,
    payload: { recordSetID: recordSetID, ActivityFilterCriteria: filters }
  });
}

function* handle_IAPP_GET_IDS_FOR_RECORDSET_SUCCESS(action) {
  const authState = yield select(selectAuth);
  const recordSetsState = yield select(selectUserSettings);
  const mapState = yield select(selectMap);
  const recordSetID = action.payload.recordSetID;
  const recordSet = JSON.parse(JSON.stringify(recordSetsState.recordSets?.[recordSetID]));
  const isOpen = recordSet.expanded;

  if (!isOpen) {
    return;
  }

  console.log('here!');
  console.dir(recordSet);
  const filters = getSearchCriteriaFromFilters(
    recordSet.advancedFilters,
    authState.accessRoles,
    recordSetsState.recordSets,
    recordSetID,
    true,
    recordSet.gridFilters,
    0,
    20,
    mapState?.layers?.[recordSetID]?.filters?.sortColumns
  );

  //trigger get
  yield put({ type: IAPP_TABLE_ROWS_GET_REQUEST, payload: { recordSetID: recordSetID, IAPPFilterCriteria: filters } });
}

function* handle_PAGE_OR_LIMIT_UPDATE(action) {
  const authState = yield select(selectAuth);
  const recordSetsState = yield select(selectUserSettings);
  const mapState = yield select(selectMap);
  const recordSetID = action.payload.recordSetID;
  const recordSet = JSON.parse(JSON.stringify(recordSetsState.recordSets?.[recordSetID]));
  const type = recordSetsState.recordSets?.[recordSetID]?.recordSetType;

  const filters = getSearchCriteriaFromFilters(
    recordSet.advancedFilters,
    authState.accessRoles,
    recordSetsState.recordSets,
    recordSetID,
    type === 'POI' ? true : false,
    recordSet.gridFilters,
    action.payload.page,
    action.payload.limit,
    mapState?.layers?.[recordSetID]?.filters?.sortColumns
  );

  if (type === 'POI') {
    yield put({
      type: IAPP_TABLE_ROWS_GET_REQUEST,
      payload: {
        recordSetID: recordSetID,
        IAPPFilterCriteria: filters
      }
    });
  } else {
    yield put({
      type: ACTIVITIES_TABLE_ROWS_GET_REQUEST,
      payload: {
        recordSetID: recordSetID,
        ActivityFilterCriteria: filters
      }
    });
  }
}

function* handle_SORT_COLUMN_STATE_UPDATE(action) {
  const mapState = yield select(selectMap);
  const filters = mapState?.layers?.[action.payload.id]?.filters;
  const newFilterState = {
    advancedFilters: [...filters.advancedFilters],
    gridFilters: { ...filters.gridFilters },
    searchBoundary: { ...filters.searchBoundary },
    sortColumns: action.payload.sortColumns
  };
  yield put({
    type: FILTER_STATE_UPDATE,
    payload: {
      [action.payload.id]: {
        filters: { ...newFilterState },
        type: mapState?.layers?.[action.payload.id]?.type
      }
    }
  });
}

function* handle_USER_SETTINGS_REMOVE_RECORD_SET_SUCCESS(action) {
  yield put({ type: MAP_DELETE_LAYER_AND_TABLE, payload: { recordSetID: action.payload.deletedID } });
}

function* handle_MAP_DELETE_LAYER(action) {
  yield put({ type: MAP_DELETE_LAYER_AND_TABLE, payload: { ...action.payload } });
}

function* handle_MAP_TOGGLE_TRACKING(action) {
  const state = yield select(selectMap);

  if (!state.positionTracking) {
    return;
  }

  const coordChannel = channel();

  const callback = async (position) => {
    try {
      if (!position) {
        return;
      } else {
        coordChannel.put({
          type: MAP_SET_COORDS,
          payload: {
            position: {
              coords: {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                accuracy: position.coords.accuracy,
                heading: position.coords.heading
              }
            }
          }
        });
      }
    } catch (e) {
      console.log(JSON.stringify(e));
    }
  };

  const options = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 500
  };
  const watchID = yield Geolocation.watchPosition(options, callback);

  while (state.positionTracking) {
    const action = yield take(coordChannel);
    yield put(action);
  }
  Geolocation.clearWatch(watchID);
}

function* activitiesPageSaga() {
  yield all([
    takeEvery(USER_SETTINGS_GET_INITIAL_STATE_SUCCESS, handle_USER_SETTINGS_GET_INITIAL_STATE_SUCCESS),
    takeEvery(USER_SETTINGS_SET_RECORD_SET_SUCCESS, handle_USER_SETTINGS_SET_RECORD_SET_SUCCESS),
    takeEvery(USER_SETTINGS_REMOVE_RECORD_SET_SUCCESS, handle_USER_SETTINGS_REMOVE_RECORD_SET_SUCCESS),
    takeEvery(MAP_INIT_REQUEST, handle_MAP_INIT_REQUEST),
    takeEvery(MAP_TOGGLE_TRACKING, handle_MAP_TOGGLE_TRACKING),
    takeEvery(ACTIVITIES_GEOJSON_GET_REQUEST, handle_ACTIVITIES_GEOJSON_GET_REQUEST),
    takeEvery(IAPP_GEOJSON_GET_REQUEST, handle_IAPP_GEOJSON_GET_REQUEST),
    takeEvery(ACTIVITIES_GET_IDS_FOR_RECORDSET_REQUEST, handle_ACTIVITIES_GET_IDS_FOR_RECORDSET_REQUEST),
    takeEvery(ACTIVITIES_GET_IDS_FOR_RECORDSET_ONLINE, handle_ACTIVITIES_GET_IDS_FOR_RECORDSET_ONLINE),
    takeEvery(IAPP_GET_IDS_FOR_RECORDSET_REQUEST, handle_IAPP_GET_IDS_FOR_RECORDSET_REQUEST),
    takeEvery(IAPP_GET_IDS_FOR_RECORDSET_ONLINE, handle_IAPP_GET_IDS_FOR_RECORDSET_ONLINE),
    takeEvery(FILTER_STATE_UPDATE, handle_FILTER_STATE_UPDATE),
    takeEvery(ACTIVITIES_GET_IDS_FOR_RECORDSET_SUCCESS, handle_ACTIVITIES_GET_IDS_FOR_RECORDSET_SUCCESS),
    takeEvery(IAPP_GET_IDS_FOR_RECORDSET_SUCCESS, handle_IAPP_GET_IDS_FOR_RECORDSET_SUCCESS),
    takeEvery(ACTIVITIES_TABLE_ROWS_GET_REQUEST, handle_ACTIVITIES_TABLE_ROWS_GET_REQUEST),
    takeEvery(ACTIVITIES_TABLE_ROWS_GET_ONLINE, handle_ACTIVITIES_TABLE_ROWS_GET_ONLINE),
    takeEvery(IAPP_TABLE_ROWS_GET_REQUEST, handle_IAPP_TABLE_ROWS_GET_REQUEST),
    takeEvery(IAPP_TABLE_ROWS_GET_ONLINE, handle_IAPP_TABLE_ROWS_GET_ONLINE),
    takeEvery(IAPP_GEOJSON_GET_ONLINE, handle_IAPP_GEOJSON_GET_ONLINE),
    takeEvery(ACTIVITIES_GEOJSON_GET_ONLINE, handle_ACTIVITIES_GEOJSON_GET_ONLINE),
    takeEvery(PAGE_OR_LIMIT_UPDATE, handle_PAGE_OR_LIMIT_UPDATE),
    takeEvery(SORT_COLUMN_STATE_UPDATE, handle_SORT_COLUMN_STATE_UPDATE)
    // takeEvery(IAPP_TABLE_ROWS_GET_SUCCESS, handle_IAPP_TABLE_ROWS_GET_SUCCESS),
    // takeEvery(IAPP_INIT_LAYER_STATE_REQUEST, handle_IAPP_INIT_LAYER_STATE_REQUEST),
  ]);
}

export default activitiesPageSaga;

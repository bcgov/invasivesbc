import { Geolocation } from '@capacitor/geolocation';
import * as turf from '@turf/turf';
import { InvasivesAPI_Call } from 'hooks/useInvasivesApi';
import { channel } from 'redux-saga';
import { all, call, debounce, fork, put, select, take, takeEvery, takeLatest } from 'redux-saga/effects';
import { selectAuth } from 'state/reducers/auth';
import { ACTIVITY_GEOJSON_SOURCE_KEYS, selectMap } from 'state/reducers/map';
import { selectUserSettings } from 'state/reducers/userSettings';
import { getSearchCriteriaFromFilters } from '../../util/miscYankedFromComponents';
import {
  ACTIVITIES_GEOJSON_GET_ONLINE,
  ACTIVITIES_GEOJSON_GET_REQUEST,
  ACTIVITIES_GEOJSON_GET_SUCCESS,
  ACTIVITIES_GEOJSON_REFETCH_ONLINE,
  ACTIVITIES_GET_IDS_FOR_RECORDSET_ONLINE,
  ACTIVITIES_GET_IDS_FOR_RECORDSET_REQUEST,
  ACTIVITIES_GET_IDS_FOR_RECORDSET_SUCCESS,
  ACTIVITIES_TABLE_ROWS_GET_ONLINE,
  ACTIVITIES_TABLE_ROWS_GET_REQUEST,
  ACTIVITY_UPDATE_GEO_REQUEST,
  CUSTOM_LAYER_DRAWN,
  DRAW_CUSTOM_LAYER,
  FILTER_PREP_FOR_VECTOR_ENDPOINT,
  FILTERS_PREPPED_FOR_VECTOR_ENDPOINT,
  IAPP_EXTENT_FILTER_REQUEST,
  IAPP_EXTENT_FILTER_SUCCESS,
  IAPP_GEOJSON_GET_ONLINE,
  IAPP_GEOJSON_GET_REQUEST,
  IAPP_GEOJSON_GET_SUCCESS,
  IAPP_GET_IDS_FOR_RECORDSET_ONLINE,
  IAPP_GET_IDS_FOR_RECORDSET_REQUEST,
  IAPP_GET_IDS_FOR_RECORDSET_SUCCESS,
  IAPP_TABLE_ROWS_GET_ONLINE,
  IAPP_TABLE_ROWS_GET_REQUEST,
  INIT_SERVER_BOUNDARIES_GET,
  MAP_INIT_FOR_RECORDSET,
  MAP_INIT_REQUEST,
  MAP_LABEL_EXTENT_FILTER_REQUEST,
  MAP_LABEL_EXTENT_FILTER_SUCCESS,
  MAP_ON_SHAPE_CREATE,
  MAP_ON_SHAPE_UPDATE,
  MAP_SET_COORDS,
  MAP_TOGGLE_PANNED,
  MAP_TOGGLE_TRACKING,
  MAP_WHATS_HERE_FEATURE,
  MAP_WHATS_HERE_INIT_GET_ACTIVITY,
  MAP_WHATS_HERE_INIT_GET_POI,
  PAGE_OR_LIMIT_UPDATE,
  RECORD_SET_TO_EXCEL_FAILURE,
  RECORD_SET_TO_EXCEL_REQUEST,
  RECORD_SET_TO_EXCEL_SUCCESS,
  RECORDSET_CLEAR_FILTERS,
  RECORDSET_REMOVE_FILTER,
  RECORDSET_UPDATE_FILTER,
  REFETCH_SERVER_BOUNDARIES,
  REMOVE_CLIENT_BOUNDARY,
  REMOVE_SERVER_BOUNDARY,
  SET_CURRENT_OPEN_SET,
  TOGGLE_PANEL,
  URL_CHANGE,
  USER_SETTINGS_ADD_RECORD_SET,
  USER_SETTINGS_DELETE_KML_REQUEST,
  USER_SETTINGS_GET_INITIAL_STATE_SUCCESS,
  WHATS_HERE_ACTIVITY_ROWS_REQUEST,
  WHATS_HERE_ACTIVITY_ROWS_SUCCESS,
  WHATS_HERE_IAPP_ROWS_REQUEST,
  WHATS_HERE_IAPP_ROWS_SUCCESS,
  WHATS_HERE_PAGE_ACTIVITY,
  WHATS_HERE_PAGE_POI,
  WHATS_HERE_SORT_FILTER_UPDATE
} from '../actions';
import {
  getRecordFilterObjectFromStateForAPI,
  handle_ACTIVITIES_GEOJSON_GET_REQUEST,
  handle_ACTIVITIES_GET_IDS_FOR_RECORDSET_REQUEST,
  handle_ACTIVITIES_TABLE_ROWS_GET_REQUEST,
  handle_IAPP_GEOJSON_GET_REQUEST,
  handle_IAPP_GET_IDS_FOR_RECORDSET_REQUEST,
  handle_IAPP_TABLE_ROWS_GET_REQUEST,
  handle_MAP_WHATS_HERE_INIT_GET_ACTIVITY,
  handle_MAP_WHATS_HERE_INIT_GET_POI,
  handle_PREP_FILTERS_FOR_VECTOR_ENDPOINT
} from './map/dataAccess';
import {
  handle_ACTIVITIES_GEOJSON_GET_ONLINE,
  handle_ACTIVITIES_GEOJSON_REFETCH_ONLINE,
  handle_ACTIVITIES_GET_IDS_FOR_RECORDSET_ONLINE,
  handle_ACTIVITIES_TABLE_ROWS_GET_ONLINE,
  handle_IAPP_GEOJSON_GET_ONLINE,
  handle_IAPP_GET_IDS_FOR_RECORDSET_ONLINE,
  handle_IAPP_TABLE_ROWS_GET_ONLINE
} from './map/online';

function* handle_ACTIVITY_DEBUG(action) {
  console.log('halp');
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
    sets,
    '2',
    false,
    [],
    //action.payload.recordSets[2].gridFilters,
    0,
    100000
  );

  const IAPP_filter = yield getSearchCriteriaFromFilters(
    [],
    //action.payload.recordSets[3].advancedFilterRows,
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

  //  yield take(ACTIVITIES_GEOJSON_GET_SUCCESS);

  yield put({
    type: IAPP_GEOJSON_GET_REQUEST,
    payload: {
      //   recordSetID: '3',
      IAPPFilterCriteria: { ...IAPP_filter, limit: 200000 }
      //   layerState: IAPPlayerState
    }
  });

  yield call(refetchServerBoundaries);
  yield put({ type: MAP_INIT_FOR_RECORDSET });
}

function* refetchServerBoundaries() {
  const serverShapesServerResponse = yield InvasivesAPI_Call('GET', '/admin-defined-shapes/');
  const shapes = serverShapesServerResponse.data.result;
  yield put({ type: INIT_SERVER_BOUNDARIES_GET, payload: { data: shapes } });
}

function* getPOIIDsOnline(feature, filterCriteria) {}

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

  let counter = 0;
  while (state.positionTracking) {
    if (counter === 0) {
      yield put({ type: MAP_TOGGLE_PANNED, payload: { target: 'me' } });
    }
    const currentMapState = yield select(selectMap);
    if (!currentMapState.positionTracking) {
      return;
    }
    const action = yield take(coordChannel);
    yield put(action);
    counter++;
  }
  Geolocation.clearWatch(watchID);
}

function* handle_WHATS_HERE_FEATURE(action) {
  var mapState = yield select(selectMap);
  if (!mapState.activitiesGeoJSONDict) {
    yield take(ACTIVITIES_GEOJSON_GET_SUCCESS);
  }
  mapState = yield select(selectMap);
  if (!mapState.IAPPGeoJSONDict) {
    yield take(IAPP_GEOJSON_GET_SUCCESS);
  }

  var layersLoading = true;
  while (layersLoading) {
    mapState = yield select(selectMap);

    var toggledOnActivityLayers = mapState.layers.filter((layer) => {
      return layer.layerState.mapToggle && layer.type === 'Activity';
    });

    var activityLayersLoading = toggledOnActivityLayers.filter((layer) => {
      return layer.loading;
    });

    var toggledOnIAPPLayers = mapState.layers.filter((layer) => {
      return layer.layerState.mapToggle && layer.type === 'IAPP';
    });

    var IAPPLayersLoading = toggledOnIAPPLayers.filter((layer) => {
      return layer.loading;
    });

    if (activityLayersLoading.length === 0 && IAPPLayersLoading.length === 0) {
      layersLoading = false;
    } else {
      var actionsToTake = [];
      if (activityLayersLoading.length > 0) {
        actionsToTake.push(
          activityLayersLoading.map((layer) => {
            return ACTIVITIES_GET_IDS_FOR_RECORDSET_SUCCESS;
          })
        );
      }
      if (IAPPLayersLoading.length > 0) {
        actionsToTake.push(
          IAPPLayersLoading.map((layer) => {
            return IAPP_GET_IDS_FOR_RECORDSET_SUCCESS;
          })
        );
      }
      yield all(actionsToTake.map((action) => take(action)));
    }
  }

  yield put({ type: MAP_WHATS_HERE_INIT_GET_POI });
  yield put({ type: MAP_WHATS_HERE_INIT_GET_ACTIVITY });
}

function* whatsHereSaga() {
  yield all([
    takeEvery(MAP_WHATS_HERE_INIT_GET_POI, handle_MAP_WHATS_HERE_INIT_GET_POI),
    takeEvery(MAP_WHATS_HERE_INIT_GET_ACTIVITY, handle_MAP_WHATS_HERE_INIT_GET_ACTIVITY),
    takeEvery(MAP_WHATS_HERE_FEATURE, handle_WHATS_HERE_FEATURE)
  ]);
}

function* handle_WHATS_HERE_IAPP_ROWS_REQUEST(action) {
  try {
    const mapState = yield select(selectMap);
    const startRecord =
      mapState?.whatsHere?.IAPPLimit * (mapState?.whatsHere?.IAPPPage + 1) - mapState?.whatsHere?.IAPPLimit;
    const endRecord = mapState?.whatsHere?.IAPPLimit * (mapState?.whatsHere?.IAPPPage + 1);
    const sorted = mapState?.whatsHere?.IAPPIDs.map((site_id) => mapState?.IAPPGeoJSONDict[site_id]).sort((a, b) => {
      if (mapState?.whatsHere?.IAPPSortDirection === 'desc') {
        return a?.properties[mapState?.whatsHere?.IAPPSortField] > b?.properties[mapState?.whatsHere?.IAPPSortField]
          ? 1
          : -1;
      } else {
        return a?.properties[mapState?.whatsHere?.IAPPSortField] < b?.properties[mapState?.whatsHere?.IAPPSortField]
          ? 1
          : -1;
      }
    });
    /*const slice = mapState?.whatsHere?.ActivityIDs?.slice(startRecord, endRecord);
     */
    const sliceWithData = sorted.slice(startRecord, endRecord);

    const mappedToWhatsHereColumns = sliceWithData.map((iappRecord) => {
      return {
        id: iappRecord?.properties.site_id,
        site_id: iappRecord?.properties.site_id,
        jurisdiction_code: iappRecord?.properties.jurisdictions,
        species_code: iappRecord?.properties.species_on_site,
        earliest_survey: iappRecord?.properties.earliest_survey,
        geometry: iappRecord?.geometry,
        reported_area: iappRecord?.properties.reported_area
      };
    });

    yield put({
      type: WHATS_HERE_IAPP_ROWS_SUCCESS,
      payload: { data: mappedToWhatsHereColumns }
    });
  } catch (e) {
    console.error(e);
  }
}

function* handle_WHATS_HERE_PAGE_POI(action) {
  // WHATS_HERE_IAPP_ROWS_REQUEST
  yield put({ type: WHATS_HERE_IAPP_ROWS_REQUEST });
}

function* handle_WHATS_HERE_ACTIVITY_ROWS_REQUEST(action) {
  try {
    const mapState = yield select(selectMap);
    const startRecord =
      mapState?.whatsHere?.ActivityLimit * (mapState?.whatsHere?.ActivityPage + 1) - mapState?.whatsHere?.ActivityLimit;
    const endRecord = mapState?.whatsHere?.ActivityLimit * (mapState?.whatsHere?.ActivityPage + 1);

    const sorted = mapState?.whatsHere?.ActivityIDs.map((id) => {
      for (const source of ACTIVITY_GEOJSON_SOURCE_KEYS) {
        if (mapState.activitiesGeoJSONDict[source] !== undefined) {
          if (mapState.activitiesGeoJSONDict[source][id]) {
            return mapState.activitiesGeoJSONDict[source][id];
          }
        }
      }
      return null;
    }).sort((a, b) => {
      if (mapState?.whatsHere?.ActivitySortDirection === 'desc') {
        return a?.properties[mapState?.whatsHere?.ActivitySortField] >
          b?.properties[mapState?.whatsHere?.ActivitySortField]
          ? 1
          : -1;
      } else {
        return a?.properties[mapState?.whatsHere?.ActivitySortField] <
          b?.properties[mapState?.whatsHere?.ActivitySortField]
          ? 1
          : -1;
      }
    });
    /*const slice = mapState?.whatsHere?.ActivityIDs?.slice(startRecord, endRecord);
     */
    const sliceWithData = sorted.slice(startRecord, endRecord);
    const mappedToWhatsHereColumns = sliceWithData.map((activityRecord) => {
      const jurisdiction_code = [];
      activityRecord?.properties?.jurisdiction?.forEach((item) => {
        jurisdiction_code.push(item.jurisdiction_code + ' (' + item.percent_covered + '%)');
      });

      const species_code = [];
      switch (activityRecord?.properties?.type) {
        case 'Observation':
          activityRecord?.properties?.species_positive?.forEach((s) => {
            if (s !== null) species_code.push(s);
          });
          activityRecord?.properties?.species_negative?.forEach((s) => {
            if (s !== null) species_code.push(s);
          });
          break;
        case 'Biocontrol':
        case 'Treatment':
          if (
            activityRecord?.properties.species_treated &&
            activityRecord?.properties.species_treated.length > 0 &&
            activityRecord?.properties.species_treated[0] !== null
          ) {
            const treatmentTemp = activityRecord?.properties.species_treated;
            if (treatmentTemp) {
              treatmentTemp.forEach((s) => {
                species_code.push(s);
              });
            }
          }
          break;
        case 'Monitoring':
          if (
            activityRecord?.properties.species_treated &&
            activityRecord?.properties.species_treated.length > 0 &&
            activityRecord?.properties.species_treated[0] !== null
          ) {
            const monitoringTemp = activityRecord?.properties.species_treated;
            if (monitoringTemp) {
              monitoringTemp.forEach((s) => {
                species_code.push(s);
              });
            }
          }
          break;
      }

      return {
        id: activityRecord?.properties?.id,
        short_id: activityRecord?.properties?.short_id,
        activity_type: activityRecord?.properties?.type,
        reported_area: activityRecord?.properties?.reported_area ? activityRecord?.properties?.reported_area : 0,
        created: activityRecord?.properties?.created,
        jurisdiction_code: jurisdiction_code,
        species_code: species_code,
        geometry: activityRecord?.geometry
      };
    });

    yield put({
      type: WHATS_HERE_ACTIVITY_ROWS_SUCCESS,
      payload: { data: mappedToWhatsHereColumns }
    });
  } catch (e) {
    console.error(e);
  }
}

function* handle_WHATS_HERE_PAGE_ACTIVITY(action) {
  yield put({ type: WHATS_HERE_ACTIVITY_ROWS_REQUEST });
}

function* handle_RECORD_SET_TO_EXCEL_REQUEST(action) {
  const userSettings = yield select(selectUserSettings);
  const set = userSettings?.recordSets?.[action.payload.id];
  const clientBoundaries = yield select((state) => state.Map.clientBoundaries);
  try {
    let rows = [];
    let networkReturn;
    let conditionallyUnnestedURL;
    if (set.recordSetType === 'IAPP') {
      const currentState = yield select((state) => state.UserSettings);

      let filterObject = getRecordFilterObjectFromStateForAPI(action.payload.id, currentState, clientBoundaries);
      //filterObject.page = action.payload.page ? action.payload.page : mapState.recordTables?.[action.payload.recordSetID]?.page;
      filterObject.limit = 200000;
      filterObject.isCSV = true;
      filterObject.CSVType = action.payload.CSVType;

      const networkReturn = yield InvasivesAPI_Call('POST', `/api/v2/iapp/`, {
        filterObjects: [filterObject]
      });

      conditionallyUnnestedURL = networkReturn?.data?.result ? networkReturn.data.result : networkReturn?.data;
    } else {
      const currentState = yield select((state) => state.UserSettings);

      let filterObject = getRecordFilterObjectFromStateForAPI(action.payload.id, currentState, clientBoundaries);
      //filterObject.page = action.payload.page ? action.payload.page : mapState.recordTables?.[action.payload.recordSetID]?.page;
      filterObject.limit = 200000;
      filterObject.isCSV = true;
      filterObject.CSVType = action.payload.CSVType;

      const networkReturn = yield InvasivesAPI_Call('POST', `/api/v2/activities/`, {
        filterObjects: [filterObject]
      });

      conditionallyUnnestedURL = networkReturn?.data?.result ? networkReturn.data.result : networkReturn?.data;
    }
    yield put({
      type: RECORD_SET_TO_EXCEL_SUCCESS,
      payload: {
        link: conditionallyUnnestedURL,
        id: action.payload.id
      }
    });
  } catch (e) {
    console.error(e);
    yield put({
      type: RECORD_SET_TO_EXCEL_FAILURE
    });
  }
}

function* handle_WHATS_HERE_SORT_FILTER_UPDATE(action) {
  switch (action.payload.recordType) {
    case 'IAPP':
      yield put({ type: WHATS_HERE_IAPP_ROWS_REQUEST });
      break;
    default:
      yield put({ type: WHATS_HERE_ACTIVITY_ROWS_REQUEST });
      break;
  }
}

function* handle_MAP_LABEL_EXTENT_FILTER_REQUEST(action) {
  // const mapState = yield select(selectMap);
  // const layers = mapState.layers;

  const bbox = [action.payload.minX, action.payload.minY, action.payload.maxX, action.payload.maxY];
  const bounds = turf.bboxPolygon(bbox as any);

  yield put({
    type: MAP_LABEL_EXTENT_FILTER_SUCCESS,
    payload: {
      bounds: bounds
    }
  });

  // let labels = [];

  // // filter
  // Object.keys(layers).forEach((key) => {
  //   const layer = layers[key];
  //   if (layer.layerState.labelToggle) {
  //     let points;
  //     if (layer.type === 'Activity') {
  //       const pointsInLayer = mapState?.activitiesGeoJSON?.features
  //         .filter((row) => {
  //           return layer?.IDList?.includes(row.properties.id) && row.geometry;
  //         })
  //         .map((row) => {
  //           let computedCenter = null;
  //           try {
  //             if (row?.geometry != null) {
  //               computedCenter = turf.center(row.geometry).geometry;
  //             }
  //           } catch (e) {
  //             console.dir(row.geometry);
  //             console.error(e);
  //           }
  //           return { ...row, geometry: computedCenter };
  //         });

  //       points = { type: 'FeatureCollection', features: pointsInLayer };
  //     } else {
  //     }
  //     const ptsWithin = turf.pointsWithinPolygon(points, bounds);
  //     console.log(ptsWithin);
  //     labels.push({ id: key, features: ptsWithin });
  //   }
  // });
}

function* handle_IAPP_EXTENT_FILTER_REQUEST(action) {
  const bbox = [action.payload.minX, action.payload.minY, action.payload.maxX, action.payload.maxY];
  const bounds = turf.bboxPolygon(bbox as any);

  yield put({
    type: IAPP_EXTENT_FILTER_SUCCESS,
    payload: {
      bounds: bounds
    }
  });
}

function* handle_URL_CHANGE(action) {
  const url = action.payload.url;
  const isRecordSet = url.split(':')?.[0]?.includes('/Records/List/Local');
  if (isRecordSet) {
    const id = url.split(':')[1].split('/')[0];
    yield put({
      type: SET_CURRENT_OPEN_SET,
      payload: {
        set: id
      }
    });

    let recordSetsState = yield select(selectUserSettings);
    let recordSetType = recordSetsState.recordSets?.[id]?.recordSetType;
    if (recordSetType === undefined) {
      yield take(USER_SETTINGS_GET_INITIAL_STATE_SUCCESS);
      recordSetsState = yield select(selectUserSettings);
      recordSetType = recordSetsState.recordSets?.[id]?.recordSetType;
    }
    console.log('%crecordSetType:, ' + recordSetType, 'color: #00ff00');
    const mapState = yield select(selectMap);
    const page = mapState.recordTables?.[id]?.page || 0;
    const limit = mapState.recordTables?.[id]?.limit || 20;

    if (recordSetType === 'Activity') {
      yield put({
        type: ACTIVITIES_TABLE_ROWS_GET_REQUEST,
        payload: {
          recordSetID: id,
          tableFiltersHash: recordSetsState.recordSets?.[id]?.tableFiltersHash,
          page: page,
          limit: limit
        }
      });
    } else {
      yield put({
        type: IAPP_TABLE_ROWS_GET_REQUEST,
        payload: {
          recordSetID: id,
          tableFiltersHash: recordSetsState.recordSets?.[id]?.tableFiltersHash,
          page: page,
          limit: limit
        }
      });
    }
  }
}

function* handle_UserFilterChange(action) {
  const recordSetsState = yield select(selectUserSettings);
  const map = yield select(selectMap);
  const currentSet = map?.currentOpenSet;
  const recordSetType = recordSetsState.recordSets?.[action.payload.setID]?.recordSetType;

  if (
    recordSetsState.recordSets?.[action.payload.setID]?.tableFiltersHash !==
    recordSetsState.recordSets?.[action.payload.setID]?.tableFiltersPreviousHash
  )
    if (recordSetType === 'Activity') {
      if (currentSet === action.payload.setID)
        yield put({
          type: ACTIVITIES_TABLE_ROWS_GET_REQUEST,
          payload: {
            recordSetID: action.payload.setID,
            tableFiltersHash: recordSetsState.recordSets?.[action.payload.setID]?.tableFiltersHash,
            page: 0,
            limit: 20
          }
        });
      if (map.MapMode === 'VECTOR_ENDPOINT') {
        yield put({
          type: FILTER_PREP_FOR_VECTOR_ENDPOINT,
          payload: {
            recordSetID: action.payload.setID,
            tableFiltersHash: recordSetsState.recordSets?.[action.payload.setID]?.tableFiltersHash
          }
        });
      } else {
        yield put({
          type: ACTIVITIES_GET_IDS_FOR_RECORDSET_REQUEST,
          payload: {
            recordSetID: action.payload.setID,
            tableFiltersHash: recordSetsState.recordSets?.[action.payload.setID]?.tableFiltersHash
          }
        });
      }
    } else {
      if (currentSet === action.payload.setID)
        yield put({
          type: IAPP_TABLE_ROWS_GET_REQUEST,
          payload: {
            recordSetID: action.payload.setID,
            tableFiltersHash: recordSetsState.recordSets?.[action.payload.setID]?.tableFiltersHash,
            page: 0,
            limit: 20
          }
        });
      yield put({
        type: IAPP_GET_IDS_FOR_RECORDSET_REQUEST,
        payload: {
          recordSetID: action.payload.setID,
          tableFiltersHash: recordSetsState.recordSets?.[action.payload.setID]?.tableFiltersHash
        }
      });
    }
}

function* handle_PAGE_OR_LIMIT_UPDATE(action) {
  const recordSetsState = yield select(selectUserSettings);
  const recordSetType = recordSetsState.recordSets?.[action.payload.setID]?.recordSetType;
  const mapState = yield select(selectMap);

  const page = action.payload.page ? action.payload.page : mapState.recordTables?.[action.payload.recordSetID]?.page;
  const limit = action.payload.limit
    ? action.payload.limit
    : mapState.recordTables?.[action.payload.recordSetID]?.limit;

  if (recordSetType === 'Activity') {
    yield put({
      type: ACTIVITIES_TABLE_ROWS_GET_REQUEST,
      payload: {
        recordSetID: action.payload.setID,
        tableFiltersHash: recordSetsState.recordSets?.[action.payload.setID]?.tableFiltersHash,
        page: page,
        limit: limit
      }
    });
  } else {
    yield put({
      type: IAPP_TABLE_ROWS_GET_REQUEST,
      payload: {
        recordSetID: action.payload.setID,
        tableFiltersHash: recordSetsState.recordSets?.[action.payload.setID]?.tableFiltersHash,
        page: page,
        limit: limit
      }
    });
  }
}

function* handle_MAP_INIT_FOR_RECORDSETS(action) {
  const userSettingsState = yield select(selectUserSettings);
  const recordSets = Object.keys(userSettingsState.recordSets);
  const mapMode = yield select((state) => state.Map.MapMode);

  // current layers
  const layers = yield select((state) => state.Map.layers);
  const layerIDs = layers.map((layer) => layer.recordSetID);

  // current but unintialized:
  const currentUninitializedLayers = layers
    .filter((layer) => !layer?.IDList)
    .map((layer) => {
      return { recordSetID: layer.recordSetID, recordSetType: layer.type };
    });

  // in record set but not in layers
  const newLayerIDs = recordSets.filter((recordSet) => !layerIDs.includes(recordSet));
  const newUninitializedLayers = newLayerIDs.map((layer) => {
    return { recordSetID: layer, recordSetType: userSettingsState.recordSets[layer].recordSetType };
  });

  // combined:
  const allUninitializedLayers = [...currentUninitializedLayers, ...newUninitializedLayers];

  let actionsToPut = [];
  allUninitializedLayers.map((layer) => {
    if (layer.recordSetType === 'Activity') {
      if(mapMode === 'VECTOR_ENDPOINT') {
      actionsToPut.push({
        type: FILTER_PREP_FOR_VECTOR_ENDPOINT,
        payload: { recordSetID: layer.recordSetID, tableFiltersHash: 'init' }
      });
    }
    else {
      actionsToPut.push({
        type: ACTIVITIES_GET_IDS_FOR_RECORDSET_REQUEST,
        payload: { recordSetID: layer.recordSetID, tableFiltersHash: 'init' }
      });

    }
    } else {
      actionsToPut.push({
        type: IAPP_GET_IDS_FOR_RECORDSET_REQUEST,
        payload: { recordSetID: layer.recordSetID, tableFiltersHash: 'init' }
      });
    }
  });
  yield all(actionsToPut.map((action) => put(action)));
}

function* handle_REMOVE_CLIENT_BOUNDARY(action) {
  // save changes in local storage
  yield persistClientBoundaries(action);

  // remove from record sets applied
  const state = yield select(selectUserSettings);
  const recordSets = state?.recordSets;
  const recordSetIDs = Object.keys(recordSets);
  const recordSetsWithIDs = recordSetIDs.map((recordSetID) => {
    return { ...recordSets[recordSetID], recordSetID: recordSetID };
  });

  const filteredSets = recordSetsWithIDs.filter((set) => {
    return set?.tableFilters?.filter((filter) => {
      return filter?.filter === action?.payload?.id;
    });
  });

  const actions = filteredSets.map((filteredSet) => {
    const filter = filteredSet?.tableFilters.filter((filter) => {
      return filter.filter === action.payload.id;
    })?.[0];
    const actionObject = {
      type: RECORDSET_REMOVE_FILTER,
      payload: {
        filterID: filter?.id,
        filterType: 'tableFilter',
        setID: filteredSet.recordSetID
      }
    };
    return actionObject;
  });

  yield all(
    actions.map((action) => {
      console.dir(action);
      if (action.payload.filterID) {
        console.log('wat');
        console.dir(action);
        return put(action);
      }
    })
  );
}

function* persistClientBoundaries(action) {
  const state = yield select(selectMap);

  console.dir(state.clientBoundaries);

  localStorage.setItem('CLIENT_BOUNDARIES', JSON.stringify(state.clientBoundaries));
}

function* handle_REMOVE_SERVER_BOUNDARY(action) {
  yield put({ type: USER_SETTINGS_DELETE_KML_REQUEST, payload: { server_id: action.payload.id } });
}

function* handle_DRAW_CUSTOM_LAYER(action) {
  const panelState = yield select((state) => state.AppMode.panelOpen);
  if (panelState) {
    yield put({ type: TOGGLE_PANEL });
  }
}

function* handle_CUSTOM_LAYER_DRAWN(actions) {
  const panelState = yield select((state) => state.AppMode.panelOpen);
  if (!panelState) {
    yield put({ type: TOGGLE_PANEL });
  }
}

function* handle_USER_SETTINGS_SET_RECORD_SET_SUCCESS(action) {
  console.dir(action.payload);
}

function* handle_MAP_ON_SHAPE_CREATE(action) {
  const appModeUrl = yield select((state: any) => state.AppMode.url);
  const whatsHereToggle = yield select((state: any) => state.Map.whatsHere.toggle);
  let newGeo = null;
  if (action?.payload?.geometry?.type === 'LineString') {
    let width = null;
    while (typeof width !== 'number') {
      try {
        width = Number(prompt('Enter width in m for line to be buffered: '));
      } catch (e) {
        alert('Not a number');
      }
    }
    newGeo = turf.buffer(action.payload.geometry, width / 1000);
  }

  if (appModeUrl && /Activity/.test(appModeUrl) && !whatsHereToggle) {
    yield put({ type: ACTIVITY_UPDATE_GEO_REQUEST, payload: { geometry: [newGeo ? newGeo : action.payload] } });
  }
}
function* handle_MAP_ON_SHAPE_UPDATE(action) {
  const appModeUrl = yield select((state: any) => state.AppMode.url);
  const whatsHereToggle = yield select((state: any) => state.Map.whatsHere.toggle);

  if (appModeUrl && /Activity/.test(appModeUrl) && !whatsHereToggle) {
    yield put({ type: ACTIVITY_UPDATE_GEO_REQUEST, payload: { geometry: [action.payload] } });
  }
}

function* activitiesPageSaga() {
  //  yield fork(leafletWhosEditing);
  yield all([
    fork(whatsHereSaga),
    debounce(500, RECORDSET_UPDATE_FILTER, handle_UserFilterChange),
    takeEvery(RECORDSET_CLEAR_FILTERS, handle_UserFilterChange),
    takeEvery(RECORDSET_REMOVE_FILTER, handle_UserFilterChange),

    takeEvery(REMOVE_CLIENT_BOUNDARY, handle_REMOVE_CLIENT_BOUNDARY),

    // handle hiding and showing the panel when drawing boundaries:
    takeEvery(DRAW_CUSTOM_LAYER, handle_DRAW_CUSTOM_LAYER),
    takeEvery(CUSTOM_LAYER_DRAWN, handle_CUSTOM_LAYER_DRAWN),

    takeEvery(REFETCH_SERVER_BOUNDARIES, refetchServerBoundaries),

    takeEvery(USER_SETTINGS_ADD_RECORD_SET, handle_MAP_INIT_FOR_RECORDSETS),
    takeEvery(REMOVE_SERVER_BOUNDARY, handle_REMOVE_SERVER_BOUNDARY),
    takeEvery(PAGE_OR_LIMIT_UPDATE, handle_PAGE_OR_LIMIT_UPDATE),
    takeEvery(USER_SETTINGS_GET_INITIAL_STATE_SUCCESS, handle_USER_SETTINGS_GET_INITIAL_STATE_SUCCESS),
    takeEvery(MAP_INIT_REQUEST, handle_MAP_INIT_REQUEST),
    takeEvery(MAP_INIT_FOR_RECORDSET, handle_MAP_INIT_FOR_RECORDSETS),
    takeEvery(MAP_TOGGLE_TRACKING, handle_MAP_TOGGLE_TRACKING),
    takeEvery(ACTIVITIES_GEOJSON_GET_REQUEST, handle_ACTIVITIES_GEOJSON_GET_REQUEST),
    takeEvery(ACTIVITIES_GEOJSON_REFETCH_ONLINE, handle_ACTIVITIES_GEOJSON_REFETCH_ONLINE),
    takeEvery(IAPP_GEOJSON_GET_REQUEST, handle_IAPP_GEOJSON_GET_REQUEST),
    takeEvery(FILTER_PREP_FOR_VECTOR_ENDPOINT, handle_PREP_FILTERS_FOR_VECTOR_ENDPOINT),
    takeEvery(ACTIVITIES_GET_IDS_FOR_RECORDSET_REQUEST, handle_ACTIVITIES_GET_IDS_FOR_RECORDSET_REQUEST),
    takeEvery(ACTIVITIES_GET_IDS_FOR_RECORDSET_ONLINE, handle_ACTIVITIES_GET_IDS_FOR_RECORDSET_ONLINE),
    takeEvery(IAPP_GET_IDS_FOR_RECORDSET_REQUEST, handle_IAPP_GET_IDS_FOR_RECORDSET_REQUEST),
    takeEvery(IAPP_GET_IDS_FOR_RECORDSET_ONLINE, handle_IAPP_GET_IDS_FOR_RECORDSET_ONLINE),
    takeLatest(ACTIVITIES_TABLE_ROWS_GET_REQUEST, handle_ACTIVITIES_TABLE_ROWS_GET_REQUEST),
    takeEvery(ACTIVITIES_TABLE_ROWS_GET_ONLINE, handle_ACTIVITIES_TABLE_ROWS_GET_ONLINE),
    takeEvery(IAPP_TABLE_ROWS_GET_REQUEST, handle_IAPP_TABLE_ROWS_GET_REQUEST),
    takeEvery(IAPP_TABLE_ROWS_GET_ONLINE, handle_IAPP_TABLE_ROWS_GET_ONLINE),
    takeEvery(IAPP_GEOJSON_GET_ONLINE, handle_IAPP_GEOJSON_GET_ONLINE),
    takeEvery(ACTIVITIES_GEOJSON_GET_ONLINE, handle_ACTIVITIES_GEOJSON_GET_ONLINE),
    //    takeEvery(PAGE_OR_LIMIT_UPDATE, handle_PAGE_OR_LIMIT_UPDATE),
    takeEvery(WHATS_HERE_IAPP_ROWS_REQUEST, handle_WHATS_HERE_IAPP_ROWS_REQUEST),
    takeEvery(WHATS_HERE_PAGE_POI, handle_WHATS_HERE_PAGE_POI),
    takeEvery(WHATS_HERE_SORT_FILTER_UPDATE, handle_WHATS_HERE_SORT_FILTER_UPDATE),
    takeEvery(WHATS_HERE_PAGE_ACTIVITY, handle_WHATS_HERE_PAGE_ACTIVITY),
    takeEvery(WHATS_HERE_ACTIVITY_ROWS_REQUEST, handle_WHATS_HERE_ACTIVITY_ROWS_REQUEST),
    takeEvery(RECORD_SET_TO_EXCEL_REQUEST, handle_RECORD_SET_TO_EXCEL_REQUEST),
    takeEvery(MAP_LABEL_EXTENT_FILTER_REQUEST, handle_MAP_LABEL_EXTENT_FILTER_REQUEST),
    takeEvery(IAPP_EXTENT_FILTER_REQUEST, handle_IAPP_EXTENT_FILTER_REQUEST),
    takeEvery(URL_CHANGE, handle_URL_CHANGE),
    takeEvery(CUSTOM_LAYER_DRAWN, persistClientBoundaries),
    takeEvery(MAP_ON_SHAPE_CREATE, handle_MAP_ON_SHAPE_CREATE),
    takeEvery(MAP_ON_SHAPE_UPDATE, handle_MAP_ON_SHAPE_UPDATE)
  ]);
}

export default activitiesPageSaga;

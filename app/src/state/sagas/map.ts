import { Geolocation } from '@capacitor/geolocation';
import * as turf from '@turf/turf';
import { AnyAction, channel } from 'redux-saga';
import { all, call, debounce, fork, put, select, take, takeEvery, takeLatest } from 'redux-saga/effects';
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
  MAP_TOGGLE_GEOJSON_CACHE,
  MAP_TOGGLE_PANNED,
  MAP_TOGGLE_TRACKING,
  MAP_WHATS_HERE_FEATURE,
  MAP_WHATS_HERE_INIT_GET_ACTIVITY,
  MAP_WHATS_HERE_INIT_GET_POI,
  PAGE_OR_LIMIT_CHANGE,
  RECORD_SET_TO_EXCEL_FAILURE,
  RECORD_SET_TO_EXCEL_REQUEST,
  RECORD_SET_TO_EXCEL_SUCCESS,
  RECORDSET_CLEAR_FILTERS,
  RECORDSET_REMOVE_FILTER,
  RECORDSET_SET_SORT,
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
  WHATS_HERE_SERVER_FILTERED_IDS_FETCHED,
  WHATS_HERE_SORT_FILTER_UPDATE
} from 'state/actions';
import { getSearchCriteriaFromFilters } from 'utils/miscYankedFromComponents';
import { selectUserSettings } from 'state/reducers/userSettings';
import { ACTIVITY_GEOJSON_SOURCE_KEYS, selectMap } from 'state/reducers/map';
import { InvasivesAPI_Call } from 'hooks/useInvasivesApi';

function* handle_USER_SETTINGS_GET_INITIAL_STATE_SUCCESS() {
  yield put(MAP_INIT_REQUEST());
}

function* handle_MAP_INIT_REQUEST() {
  const mapState = yield select(selectMap);
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

  if (mapState.MapMode !== 'VECTOR_ENDPOINT') {
    yield put(
      ACTIVITIES_GEOJSON_GET_REQUEST({
        // recordSetID: '2',
        activitiesFilterCriteria: filterCriteria
        // layerState: layerState
      })
    );

    //  yield take(ACTIVITIES_GEOJSON_GET_SUCCESS.type);

    yield put(
      IAPP_GEOJSON_GET_REQUEST({
        //   recordSetID: '3',
        IAPPFilterCriteria: { ...IAPP_filter, limit: 200000 }
        //   layerState: IAPPlayerState
      })
    );
  }

  yield call(refetchServerBoundaries);
  yield put(MAP_INIT_FOR_RECORDSET());
}

function* refetchServerBoundaries() {
  const serverShapesServerResponse = yield InvasivesAPI_Call('GET', '/admin-defined-shapes/');
  const shapes = serverShapesServerResponse.data.result;
  yield put(INIT_SERVER_BOUNDARIES_GET({ data: shapes }));
}

function* handle_MAP_TOGGLE_TRACKING() {
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
      yield put(MAP_TOGGLE_PANNED({ target: 'me' }));
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
  let mapState = yield select(selectMap);

  let layersLoading = true;
  while (layersLoading) {
    mapState = yield select(selectMap);

    const toggledOnActivityLayers = mapState.layers.filter((layer) => {
      return layer.layerState.mapToggle && layer.type === 'Activity';
    });

    const activityLayersLoading = toggledOnActivityLayers.filter((layer) => {
      return layer.loading;
    });

    const toggledOnIAPPLayers = mapState.layers.filter((layer) => {
      return layer.layerState.mapToggle && layer.type === 'IAPP';
    });

    const IAPPLayersLoading = toggledOnIAPPLayers.filter((layer) => {
      return layer.loading;
    });

    if (activityLayersLoading.length === 0 && IAPPLayersLoading.length === 0) {
      layersLoading = false;
    } else {
      const actionsToTake: AnyAction[] = [];
      if (activityLayersLoading.length > 0) {
        actionsToTake.push(
          activityLayersLoading.map(() => {
            return ACTIVITIES_GET_IDS_FOR_RECORDSET_SUCCESS();
          })
        );
      }
      if (IAPPLayersLoading.length > 0) {
        actionsToTake.push(
          IAPPLayersLoading.map(() => {
            return IAPP_GET_IDS_FOR_RECORDSET_SUCCESS();
          })
        );
      }
      yield all(actionsToTake.map((action) => take(action.type)));
    }
  }
  if (mapState.MapMode === 'VECTOR_ENDPOINT') {
    // get all the toggled on recordsets

    const activitiesfilterObj = {
      selectColumns: ['activity_id'],
      tableFilters: [
        {
          id: '0.81778552637744651712083357942',
          filterType: 'spatialFilterDrawn',
          operator: 'CONTAINED IN',
          filter: '0.652479498272151712093656568',
          geojson: action.payload.feature
        }
      ],
      limit: 200000
    };

    const activitiesNetworkReturn = yield InvasivesAPI_Call('POST', `/api/v2/activities/`, {
      filterObjects: [activitiesfilterObj]
    });

    let activitiesServerIDList = [];
    if (activitiesNetworkReturn.data.result || activitiesNetworkReturn.data?.data?.result) {
      const list = activitiesNetworkReturn.data?.data?.result
        ? activitiesNetworkReturn.data?.data?.result
        : activitiesNetworkReturn.data?.result;
      activitiesServerIDList = list.map((row) => {
        return row.activity_id;
      });
    }

    const iappfilterObj = {
      selectColumns: ['site_id'],
      tableFilters: [
        {
          id: '0.81778552637744651712083357942',
          filterType: 'spatialFilterDrawn',
          operator: 'CONTAINED IN',
          filter: '0.652479498272151712093656568',
          geojson: action.payload.feature
        }
      ],
      limit: 200000
    };

    const iappNetworkReturn = yield InvasivesAPI_Call('POST', `/api/v2/iapp/`, {
      filterObjects: [iappfilterObj]
    });

    let iappServerIDList = [];

    if (iappNetworkReturn.data.result || iappNetworkReturn.data?.data?.result) {
      const list = iappNetworkReturn.data?.data?.result
        ? iappNetworkReturn.data?.data?.result
        : iappNetworkReturn.data?.result;
      iappServerIDList = list.map((row) => {
        return row.site_id;
      });
    }

    yield put(WHATS_HERE_SERVER_FILTERED_IDS_FETCHED({ activities: activitiesServerIDList, iapp: iappServerIDList }));
  }

  if (!(mapState.MapMode === 'VECTOR_ENDPOINT')) {
    if (!mapState.activitiesGeoJSONDict) {
      yield take(ACTIVITIES_GEOJSON_GET_SUCCESS.type);
    }
    mapState = yield select(selectMap);
    if (!mapState.IAPPGeoJSONDict) {
      yield take(IAPP_GEOJSON_GET_SUCCESS.type);
    }

    yield put(MAP_WHATS_HERE_INIT_GET_ACTIVITY());
    yield put(MAP_WHATS_HERE_INIT_GET_POI());
  }
}

function* whatsHereSaga() {
  yield all([
    takeEvery(MAP_WHATS_HERE_INIT_GET_POI.type, handle_MAP_WHATS_HERE_INIT_GET_POI),
    takeEvery(MAP_WHATS_HERE_INIT_GET_ACTIVITY.type, handle_MAP_WHATS_HERE_INIT_GET_ACTIVITY),
    takeEvery(MAP_WHATS_HERE_FEATURE.type, handle_WHATS_HERE_FEATURE)
  ]);
}

function* handle_WHATS_HERE_IAPP_ROWS_REQUEST() {
  const mapState = yield select(selectMap);
  if (mapState.MapMode === 'VECTOR_ENDPOINT') {
    const startRecord =
      mapState?.whatsHere?.IAPPLimit * (mapState?.whatsHere?.IAPPPage + 1) - mapState?.whatsHere?.IAPPLimit;
    const endRecord = mapState?.whatsHere?.IAPPLimit * (mapState?.whatsHere?.IAPPPage + 1);
    const slicedIDs = mapState.whatsHere.IAPPIDs.slice(startRecord, endRecord);

    const filterObject = {
      selectColumns: ['site_id', 'jurisdictions_flattened', 'map_symbol', 'min_survey', 'reported_area', 'geojson'],
      limit: 200000,
      ids_to_filter: slicedIDs
    };

    if (slicedIDs.length === 0) {
      yield put(WHATS_HERE_IAPP_ROWS_SUCCESS({ data: [] }));
      return;
    }

    const networkReturn = yield InvasivesAPI_Call('POST', `/api/v2/iapp/`, {
      filterObjects: [filterObject]
    });

    const mappedToWhatsHereColumns = networkReturn.data.result.map((iappRecord) => {
      return {
        id: iappRecord.site_id,
        site_id: iappRecord.site_id,
        jurisdiction_code: iappRecord.jurisdictions_flattened,
        species_code: iappRecord.map_symbol,
        earliest_survey: new Date(iappRecord.min_survey).toDateString(),
        geometry: iappRecord.geojson
      };
    });

    yield put(WHATS_HERE_IAPP_ROWS_SUCCESS({ data: mappedToWhatsHereColumns }));
  }
  if (!(mapState.MapMode === 'VECTOR_ENDPOINT')) {
    try {
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

      yield put(WHATS_HERE_IAPP_ROWS_SUCCESS({ data: mappedToWhatsHereColumns }));
    } catch (e) {
      console.error(e);
    }
  }
}

function* handle_WHATS_HERE_PAGE_POI() {
  yield put(WHATS_HERE_IAPP_ROWS_REQUEST());
}

function* handle_WHATS_HERE_ACTIVITY_ROWS_REQUEST() {
  const mapState = yield select(selectMap);
  if (mapState.MapMode === 'VECTOR_ENDPOINT') {
    const startRecord =
      mapState?.whatsHere?.ActivityLimit * (mapState?.whatsHere?.ActivityPage + 1) - mapState?.whatsHere?.ActivityLimit;
    const endRecord = mapState?.whatsHere?.ActivityLimit * (mapState?.whatsHere?.ActivityPage + 1);
    const slicedIDs = mapState.whatsHere.ActivityIDs.slice(startRecord, endRecord);

    const filterObject = {
      selectColumns: [
        'activity_id',
        'short_id',
        'activity_payload',
        'activity_type',
        'jurisdiction_display',
        'map_symbol'
      ],
      limit: 200000,
      ids_to_filter: slicedIDs
    };
    if (slicedIDs.length === 0) {
      yield put(WHATS_HERE_ACTIVITY_ROWS_SUCCESS({ data: [] }));
      return;
    }

    const networkReturn = yield InvasivesAPI_Call('POST', `/api/v2/activities/`, {
      filterObjects: [filterObject]
    });

    const mappedToWhatsHereColumns = networkReturn.data.result.map((activityRecord) => {
      return {
        id: activityRecord.activity_id,
        short_id: activityRecord.short_id,
        activity_type: activityRecord.activity_type,
        jurisdiction_code: activityRecord.jurisdiction_display,
        species_code: activityRecord.map_symbol,
        reported_area: activityRecord.activity_payload.form_data.activity_data.reported_area,
        geometry: activityRecord.activity_payload.geometry?.[0],
        created: new Date(activityRecord.activity_payload.form_data.activity_data.activity_date_time).toDateString()
      };
    });

    yield put(WHATS_HERE_ACTIVITY_ROWS_SUCCESS({ data: mappedToWhatsHereColumns }));
  }

  if (!(mapState.MapMode === 'VECTOR_ENDPOINT')) {
    try {
      const mapState = yield select(selectMap);
      const startRecord =
        mapState?.whatsHere?.ActivityLimit * (mapState?.whatsHere?.ActivityPage + 1) -
        mapState?.whatsHere?.ActivityLimit;
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

      yield put(WHATS_HERE_ACTIVITY_ROWS_SUCCESS({ data: mappedToWhatsHereColumns }));
    } catch (e) {
      console.error(e);
    }
  }
}

function* handle_WHATS_HERE_PAGE_ACTIVITY() {
  yield put(WHATS_HERE_ACTIVITY_ROWS_REQUEST());
}

function* handle_RECORD_SET_TO_EXCEL_REQUEST(action) {
  const userSettings = yield select(selectUserSettings);
  const set = userSettings?.recordSets?.[action.payload.id];
  const clientBoundaries = yield select((state) => state.Map.clientBoundaries);
  try {
    let conditionallyUnnestedURL;
    if (set.recordSetType === 'IAPP') {
      const currentState = yield select((state) => state.UserSettings);

      const filterObject = getRecordFilterObjectFromStateForAPI(action.payload.id, currentState, clientBoundaries);
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

      const filterObject = getRecordFilterObjectFromStateForAPI(action.payload.id, currentState, clientBoundaries);
      //filterObject.page = action.payload.page ? action.payload.page : mapState.recordTables?.[action.payload.recordSetID]?.page;
      filterObject.limit = 200000;
      filterObject.isCSV = true;
      filterObject.CSVType = action.payload.CSVType;

      const networkReturn = yield InvasivesAPI_Call('POST', `/api/v2/activities/`, {
        filterObjects: [filterObject]
      });

      conditionallyUnnestedURL = networkReturn?.data?.result ? networkReturn.data.result : networkReturn?.data;
    }
    yield put(
      RECORD_SET_TO_EXCEL_SUCCESS({
        link: conditionallyUnnestedURL,
        id: action.payload.id
      })
    );
  } catch (e) {
    console.error(e);
    yield put(RECORD_SET_TO_EXCEL_FAILURE());
  }
}

function* handle_WHATS_HERE_SORT_FILTER_UPDATE(action) {
  switch (action.payload.recordType) {
    case 'IAPP':
      yield put(WHATS_HERE_IAPP_ROWS_REQUEST());
      break;
    default:
      yield put(WHATS_HERE_ACTIVITY_ROWS_REQUEST());
      break;
  }
}

function* handle_MAP_LABEL_EXTENT_FILTER_REQUEST(action) {
  // const mapState = yield select(selectMap);
  // const layers = mapState.layers;

  const bbox = [action.payload.minX, action.payload.minY, action.payload.maxX, action.payload.maxY];
  const bounds = turf.bboxPolygon(bbox as any);

  yield put(
    MAP_LABEL_EXTENT_FILTER_SUCCESS({
      bounds: bounds
    })
  );

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

  yield put(
    IAPP_EXTENT_FILTER_SUCCESS({
      bounds: bounds
    })
  );
}

function* handle_URL_CHANGE(action) {
  const url = action.payload.url;
  const isRecordSet = url.split(':')?.[0]?.includes('/Records/List/Local');
  if (isRecordSet) {
    const id = url.split(':')[1].split('/')[0];
    yield put(
      SET_CURRENT_OPEN_SET({
        set: id
      })
    );

    let recordSetsState = yield select(selectUserSettings);
    let recordSetType = recordSetsState.recordSets?.[id]?.recordSetType;
    if (recordSetType === undefined) {
      yield take(USER_SETTINGS_GET_INITIAL_STATE_SUCCESS.type);
      recordSetsState = yield select(selectUserSettings);
      recordSetType = recordSetsState.recordSets?.[id]?.recordSetType;
    }
    console.log('%crecordSetType:, ' + recordSetType, 'color: #00ff00');
    const mapState = yield select(selectMap);
    const page = mapState.recordTables?.[id]?.page || 0;
    const limit = mapState.recordTables?.[id]?.limit || 20;

    if (recordSetType === 'Activity') {
      yield put(
        ACTIVITIES_TABLE_ROWS_GET_REQUEST({
          recordSetID: id,
          tableFiltersHash: recordSetsState.recordSets?.[id]?.tableFiltersHash,
          page: page,
          limit: limit
        })
      );
    } else {
      yield put(
        IAPP_TABLE_ROWS_GET_REQUEST({
          recordSetID: id,
          tableFiltersHash: recordSetsState.recordSets?.[id]?.tableFiltersHash,
          page: page,
          limit: limit
        })
      );
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
    if (map.MapMode === 'VECTOR_ENDPOINT') {
      yield put(
        FILTER_PREP_FOR_VECTOR_ENDPOINT({
          recordSetID: action.payload.setID,
          tableFiltersHash: recordSetsState.recordSets?.[action.payload.setID]?.tableFiltersHash
        })
      );
    }
  if (recordSetType === 'Activity') {
    if (currentSet === action.payload.setID)
      yield put(
        ACTIVITIES_TABLE_ROWS_GET_REQUEST({
          recordSetID: action.payload.setID,
          tableFiltersHash: recordSetsState.recordSets?.[action.payload.setID]?.tableFiltersHash,
          page: 0,
          limit: 20
        })
      );
    yield put(
      ACTIVITIES_GET_IDS_FOR_RECORDSET_REQUEST({
        recordSetID: action.payload.setID,
        tableFiltersHash: recordSetsState.recordSets?.[action.payload.setID]?.tableFiltersHash
      })
    );
  } else {
    if (currentSet === action.payload.setID)
      yield put(
        IAPP_TABLE_ROWS_GET_REQUEST({
          recordSetID: action.payload.setID,
          tableFiltersHash: recordSetsState.recordSets?.[action.payload.setID]?.tableFiltersHash,
          page: 0,
          limit: 20
        })
      );
    yield put(
      IAPP_GET_IDS_FOR_RECORDSET_REQUEST({
        recordSetID: action.payload.setID,
        tableFiltersHash: recordSetsState.recordSets?.[action.payload.setID]?.tableFiltersHash
      })
    );
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
    yield put(
      ACTIVITIES_TABLE_ROWS_GET_REQUEST({
        recordSetID: action.payload.setID,
        tableFiltersHash: recordSetsState.recordSets?.[action.payload.setID]?.tableFiltersHash,
        page: page,
        limit: limit
      })
    );
  } else {
    yield put(
      IAPP_TABLE_ROWS_GET_REQUEST({
        recordSetID: action.payload.setID,
        tableFiltersHash: recordSetsState.recordSets?.[action.payload.setID]?.tableFiltersHash,
        page: page,
        limit: limit
      })
    );
  }
}

function* handle_MAP_INIT_FOR_RECORDSETS() {
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

  const actionsToPut = [];
  allUninitializedLayers.map((layer) => {
    if (mapMode === 'VECTOR_ENDPOINT') {
      actionsToPut.push(FILTER_PREP_FOR_VECTOR_ENDPOINT({ recordSetID: layer.recordSetID, tableFiltersHash: 'init' }));
    }
    if (layer.recordSetType === 'Activity') {
      actionsToPut.push(
        ACTIVITIES_GET_IDS_FOR_RECORDSET_REQUEST({
          recordSetID: layer.recordSetID,
          tableFiltersHash: 'init'
        })
      );
    } else {
      actionsToPut.push(
        IAPP_GET_IDS_FOR_RECORDSET_REQUEST({
          recordSetID: layer.recordSetID,
          tableFiltersHash: 'init'
        })
      );
    }
  });
  yield all(actionsToPut.map((action) => put(action)));
}

function* handle_REMOVE_CLIENT_BOUNDARY(action) {
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
    const actionObject = RECORDSET_REMOVE_FILTER({
      filterID: filter?.id,
      filterType: 'tableFilter',
      setID: filteredSet.recordSetID
    });
    return actionObject;
  });

  yield all(
    actions.map((action) => {
      console.dir(action);
      if (action.payload.filterID) {
        return put(action);
      }
    })
  );
}

function* handle_REMOVE_SERVER_BOUNDARY(action) {
  yield put(USER_SETTINGS_DELETE_KML_REQUEST({ server_id: action.payload.id }));
}

function* handle_DRAW_CUSTOM_LAYER() {
  const panelState = yield select((state) => state.AppMode.panelOpen);
  if (panelState) {
    yield put(TOGGLE_PANEL());
  }
}

function* handle_CUSTOM_LAYER_DRAWN() {
  const panelState = yield select((state) => state.AppMode.panelOpen);
  if (!panelState) {
    yield put(TOGGLE_PANEL());
  }
}

function* handle_MAP_ON_SHAPE_CREATE(action) {
  const appModeUrl = yield select((state: any) => state.AppMode.url);
  const whatsHereToggle = yield select((state: any) => state.Map.whatsHere.toggle);
  let newGeo = null;
  if (action?.payload?.geometry?.type === 'LineString') {
    let width: null | number = null;
    while (typeof width !== 'number') {
      try {
        const raw = prompt('Enter width in m for line to be buffered: ');
        width = Number(raw);
        if (typeof raw === 'object') {
          return;
        }
      } catch (e) {
        alert('Not a number');
      }
    }
    newGeo = turf.buffer(action.payload.geometry, width / 1000);
  }

  if (appModeUrl && /Activity/.test(appModeUrl) && !whatsHereToggle) {
    yield put(ACTIVITY_UPDATE_GEO_REQUEST({ geometry: [newGeo ? newGeo : action.payload] }));
  }
}

function* handle_MAP_ON_SHAPE_UPDATE(action) {
  const appModeUrl = yield select((state: any) => state.AppMode.url);
  const whatsHereToggle = yield select((state: any) => state.Map.whatsHere.toggle);

  if (appModeUrl && /Activity/.test(appModeUrl) && !whatsHereToggle) {
    yield put(ACTIVITY_UPDATE_GEO_REQUEST({ geometry: [action.payload] }));
  }
}

function* handle_MAP_TOGGLE_GEOJSON_CACHE() {
  location.reload();
}

function* handle_WHATS_HERE_SERVER_FILTERED_IDS_FETCHED() {
  yield put(WHATS_HERE_IAPP_ROWS_REQUEST());
  yield put(WHATS_HERE_ACTIVITY_ROWS_REQUEST());
}

function* handle_RECORDSET_SET_SORT(action) {
  const userSettingsState = yield select(selectUserSettings);
  const recordSetType = userSettingsState.recordSets?.[action.payload.setID]?.recordSetType;
  const tableFiltersHash = userSettingsState.recordSets?.[action.payload.setID]?.tableFiltersHash;
  if (recordSetType === 'Activity') {
    yield put(
      ACTIVITIES_TABLE_ROWS_GET_REQUEST({
        recordSetID: action.payload.setID,
        limit: 20,
        page: 0,
        tableFiltersHash: tableFiltersHash
      })
    );
  } else {
    yield put(
      IAPP_TABLE_ROWS_GET_REQUEST({
        recordSetID: action.payload.setID,
        limit: 20,
        page: 0,
        tableFiltersHash: tableFiltersHash
      })
    );
  }
}

function* activitiesPageSaga() {
  //  yield fork(leafletWhosEditing);
  yield all([
    fork(whatsHereSaga),
    debounce(500, RECORDSET_UPDATE_FILTER, handle_UserFilterChange),
    takeEvery(RECORDSET_CLEAR_FILTERS.type, handle_UserFilterChange),
    takeEvery(RECORDSET_REMOVE_FILTER.type, handle_UserFilterChange),

    takeEvery(REMOVE_CLIENT_BOUNDARY.type, handle_REMOVE_CLIENT_BOUNDARY),

    takeEvery(RECORDSET_SET_SORT.type, handle_RECORDSET_SET_SORT),

    // handle hiding and showing the panel when drawing boundaries:
    takeEvery(DRAW_CUSTOM_LAYER.type, handle_DRAW_CUSTOM_LAYER),
    takeEvery(CUSTOM_LAYER_DRAWN.type, handle_CUSTOM_LAYER_DRAWN),

    takeEvery(REFETCH_SERVER_BOUNDARIES.type, refetchServerBoundaries),
    takeEvery(WHATS_HERE_SERVER_FILTERED_IDS_FETCHED.type, handle_WHATS_HERE_SERVER_FILTERED_IDS_FETCHED),

    takeEvery(USER_SETTINGS_ADD_RECORD_SET.type, handle_MAP_INIT_FOR_RECORDSETS),
    takeEvery(REMOVE_SERVER_BOUNDARY.type, handle_REMOVE_SERVER_BOUNDARY),
    takeEvery(PAGE_OR_LIMIT_CHANGE.type, handle_PAGE_OR_LIMIT_UPDATE),
    takeEvery(MAP_TOGGLE_GEOJSON_CACHE.type, handle_MAP_TOGGLE_GEOJSON_CACHE),
    takeEvery(USER_SETTINGS_GET_INITIAL_STATE_SUCCESS.type, handle_USER_SETTINGS_GET_INITIAL_STATE_SUCCESS),
    takeEvery(MAP_INIT_REQUEST.type, handle_MAP_INIT_REQUEST),
    takeEvery(MAP_INIT_FOR_RECORDSET.type, handle_MAP_INIT_FOR_RECORDSETS),
    takeEvery(MAP_TOGGLE_TRACKING.type, handle_MAP_TOGGLE_TRACKING),
    takeEvery(ACTIVITIES_GEOJSON_GET_REQUEST.type, handle_ACTIVITIES_GEOJSON_GET_REQUEST),
    takeEvery(ACTIVITIES_GEOJSON_REFETCH_ONLINE.type, handle_ACTIVITIES_GEOJSON_REFETCH_ONLINE),
    takeEvery(IAPP_GEOJSON_GET_REQUEST.type, handle_IAPP_GEOJSON_GET_REQUEST),
    takeEvery(FILTER_PREP_FOR_VECTOR_ENDPOINT.type, handle_PREP_FILTERS_FOR_VECTOR_ENDPOINT),
    takeEvery(ACTIVITIES_GET_IDS_FOR_RECORDSET_REQUEST.type, handle_ACTIVITIES_GET_IDS_FOR_RECORDSET_REQUEST),
    takeEvery(ACTIVITIES_GET_IDS_FOR_RECORDSET_ONLINE.type, handle_ACTIVITIES_GET_IDS_FOR_RECORDSET_ONLINE),
    takeEvery(IAPP_GET_IDS_FOR_RECORDSET_REQUEST.type, handle_IAPP_GET_IDS_FOR_RECORDSET_REQUEST),
    takeEvery(IAPP_GET_IDS_FOR_RECORDSET_ONLINE.type, handle_IAPP_GET_IDS_FOR_RECORDSET_ONLINE),
    takeLatest(ACTIVITIES_TABLE_ROWS_GET_REQUEST, handle_ACTIVITIES_TABLE_ROWS_GET_REQUEST),
    takeEvery(ACTIVITIES_TABLE_ROWS_GET_ONLINE.type, handle_ACTIVITIES_TABLE_ROWS_GET_ONLINE),
    takeEvery(IAPP_TABLE_ROWS_GET_REQUEST.type, handle_IAPP_TABLE_ROWS_GET_REQUEST),
    takeEvery(IAPP_TABLE_ROWS_GET_ONLINE.type, handle_IAPP_TABLE_ROWS_GET_ONLINE),
    takeEvery(IAPP_GEOJSON_GET_ONLINE.type, handle_IAPP_GEOJSON_GET_ONLINE),
    takeEvery(ACTIVITIES_GEOJSON_GET_ONLINE.type, handle_ACTIVITIES_GEOJSON_GET_ONLINE),
    //    takeEvery(PAGE_OR_LIMIT_UPDATE.type, handle_PAGE_OR_LIMIT_UPDATE),
    takeEvery(WHATS_HERE_IAPP_ROWS_REQUEST.type, handle_WHATS_HERE_IAPP_ROWS_REQUEST),
    takeEvery(WHATS_HERE_PAGE_POI.type, handle_WHATS_HERE_PAGE_POI),
    takeEvery(WHATS_HERE_SORT_FILTER_UPDATE.type, handle_WHATS_HERE_SORT_FILTER_UPDATE),
    takeEvery(WHATS_HERE_PAGE_ACTIVITY.type, handle_WHATS_HERE_PAGE_ACTIVITY),
    takeEvery(WHATS_HERE_ACTIVITY_ROWS_REQUEST.type, handle_WHATS_HERE_ACTIVITY_ROWS_REQUEST),
    takeEvery(RECORD_SET_TO_EXCEL_REQUEST.type, handle_RECORD_SET_TO_EXCEL_REQUEST),
    takeEvery(MAP_LABEL_EXTENT_FILTER_REQUEST.type, handle_MAP_LABEL_EXTENT_FILTER_REQUEST),
    takeEvery(IAPP_EXTENT_FILTER_REQUEST.type, handle_IAPP_EXTENT_FILTER_REQUEST),
    takeEvery(URL_CHANGE.type, handle_URL_CHANGE),
    takeEvery(MAP_ON_SHAPE_CREATE.type, handle_MAP_ON_SHAPE_CREATE),
    takeEvery(MAP_ON_SHAPE_UPDATE.type, handle_MAP_ON_SHAPE_UPDATE)
  ]);
}

export default activitiesPageSaga;

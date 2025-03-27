import { put, select, take } from 'redux-saga/effects';
import intersect from '@turf/intersect';

import { booleanPointInPolygon, multiPolygon, point, polygon } from '@turf/turf';
import {
  ACTIVITIES_GEOJSON_GET_ONLINE,
  ACTIVITIES_GEOJSON_GET_SUCCESS,
  ACTIVITY_GET_INITIAL_STATE_FAILURE,
  FILTERS_PREPPED_FOR_VECTOR_ENDPOINT,
  IAPP_GEOJSON_GET_ONLINE,
  IAPP_GEOJSON_GET_SUCCESS
} from 'state/actions';
import { ACTIVITY_GEOJSON_SOURCE_KEYS, selectMap } from 'state/reducers/map';
import WhatsHere from 'state/actions/whatsHere/WhatsHere';
import { RecordSetType, UserRecordSet, RecordSetId } from 'interfaces/UserRecordSet';
import { MOBILE } from 'state/build-time-config';
import { RecordCacheServiceFactory } from 'utils/record-cache/context';
import GeoShapes from 'constants/geoShapes';
import { selectNetworkConnected } from 'state/reducers/network';
import { selectUserSettings } from 'state/reducers/userSettings';
import getSelectColumnsByRecordSetType from 'sharedAPI/src/getSelectColumnsByRecordSetType';
import { PayloadAction } from '@reduxjs/toolkit';
import IappActions, { IappTableRowRequest } from 'state/actions/activity/Iapp';
import Activity, { ActivityTableRowGetRequest, IGetIdsForRecordset } from 'state/actions/activity/Activity';
import { getIappIdsForRecordsetFromCache } from './online';

export function* handle_ACTIVITIES_GEOJSON_GET_REQUEST(action) {
  try {
    // if mobile or web
    yield put({
      type: ACTIVITIES_GEOJSON_GET_ONLINE,
      payload: {
        recordSetID: action.payload.recordSetID,
        activitiesFilterCriteria: action.payload.activitiesFilterCriteria
      }
    });
  } catch (e) {
    console.error(e);
    yield put({ type: ACTIVITY_GET_INITIAL_STATE_FAILURE });
  }
}

export function* handle_IAPP_GEOJSON_GET_REQUEST(action) {
  try {
    // if mobile or web
    yield put({
      type: IAPP_GEOJSON_GET_ONLINE,
      payload: {
        ...action.payload
      }
    });
  } catch (e) {
    console.error(e);
    yield put({ type: ACTIVITY_GET_INITIAL_STATE_FAILURE });
  }
}

export function* handle_PREP_FILTERS_FOR_VECTOR_ENDPOINT(action) {
  try {
    const currentState = yield select((state) => state?.UserSettings);
    const clientBoundaries = yield select((state) => state.Map?.clientBoundaries);
    const recordset: UserRecordSet = currentState.recordSets[action.payload.recordSetID];
    const filterObject = getRecordFilterObjectFromStateForAPI(
      action.payload.recordSetID,
      currentState,
      clientBoundaries
    );

    // abort if already a stale hash
    const mapState = yield select((state) => state.Map);
    const tableFiltersHash = mapState?.layers?.filter((layer) => {
      return layer?.recordSetID === action.payload.recordSetID;
    })?.[0]?.tableFiltersHash;

    if (!tableFiltersHash === action.payload.tableFiltersHash) {
      return;
    }

    const payload = {
      filterObject: filterObject,
      recordSetID: action.payload.recordSetID,
      tableFiltersHash: action.payload.tableFiltersHash,
      recordSetType: recordset.recordSetType
    };

    yield put({ type: FILTERS_PREPPED_FOR_VECTOR_ENDPOINT, payload });
  } catch (e) {
    console.error(e);
    throw e;
  }
}

export function* handle_ACTIVITIES_GET_IDS_FOR_RECORDSET_REQUEST(action: PayloadAction<IGetIdsForRecordset>) {
  const currentState = yield select((state) => state.UserSettings);
  const clientBoundaries = yield select((state) => state.Map?.clientBoundaries);
  const filterObject = getRecordFilterObjectFromStateForAPI(action.payload.recordSetID, currentState, clientBoundaries);
  const workingOffline = yield select((state) => state.Auth.workingOffline);
  const connected = yield select((state) => state.Network.connected);
  filterObject.limit = 200000;
  filterObject.selectColumns = ['activity_id'];

  try {
    // offline activities
    if (action.payload.recordSetID === RecordSetId.OfflineActivities) {
      yield put(
        Activity.Offline.getIdsForRecordset({
          filterObj: filterObject,
          recordSetID: action.payload.recordSetID,
          tableFiltersHash: action.payload.tableFiltersHash
        })
      );
      return;
    }

    // if mobile or web
    if (connected && !workingOffline) {
      yield put(
        Activity.getIdsForRecordsetOnline({
          filterObj: filterObject,
          recordSetID: action.payload.recordSetID,
          tableFiltersHash: action.payload.tableFiltersHash
        })
      );
    } else {
      yield getIdsForRecordsetFromCache(action.payload);
    }
  } catch (e) {
    console.error(e);
    yield put({ type: ACTIVITY_GET_INITIAL_STATE_FAILURE });
  }
}

export function* getIdsForRecordsetFromCache(action: IGetIdsForRecordset) {
  const service = yield RecordCacheServiceFactory.getPlatformInstance();
  if (service.isCached(action.recordSetID)) {
    const ids = yield service.getIdList(action.recordSetID);
    yield put(
      Activity.getIdsForRecordsetSuccess({
        recordSetID: action.recordSetID,
        IDList: ids ?? [],
        tableFiltersHash: action.tableFiltersHash
      })
    );
  }
}
export function* handle_IAPP_GET_IDS_FOR_RECORDSET_REQUEST(action) {
  try {
    const currentState = yield select((state) => state.UserSettings);
    const clientBoundaries = yield select((state) => state.Map?.clientBoundaries);
    const workingOffline = yield select((state) => state.Auth.workingOffline);
    const connected = yield select((state) => state.Network.connected);
    const filterObject = getRecordFilterObjectFromStateForAPI(
      action.payload.recordSetID,
      currentState,
      clientBoundaries
    );
    filterObject.limit = 200000;
    filterObject.selectColumns = ['site_id'];
    if (connected && !workingOffline) {
      // if mobile or web
      yield put(
        IappActions.getIdsForRecordsetOnline({
          filterObj: filterObject,
          recordSetID: action.payload.recordSetID,
          tableFiltersHash: action.payload.tableFiltersHash
        })
      );
    } else {
      yield getIappIdsForRecordsetFromCache(action.payload);
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
    })?.[0]?.geojson;
  };
  const recordSet = JSON.parse(JSON.stringify(recordSetsState.recordSets?.[recordSetID]));
  const recordSetType = JSON.parse(JSON.stringify(recordSetsState?.recordSets?.[recordSetID]?.recordSetType));
  const sortColumn = recordSet?.sortColumn;
  const sortOrder = recordSet?.sortOrder;
  const tableFilters = recordSet?.tableFilters;
  let modifiedTableFilters = tableFilters?.map((filter) => {
    return filter.filterType !== 'spatialFilterDrawn'
      ? filter
      : { ...filter, geojson: getFilterWithDrawnShape(filter.filter) };
  });

  if (!modifiedTableFilters) {
    modifiedTableFilters = [];
  }

  const selectColumns = recordSet?.selectColumns
    ? recordSet?.selectColumns
    : getSelectColumnsByRecordSetType(recordSetType);

  return {
    recordSetType: recordSetType,
    sortColumn: sortColumn,
    sortOrder: sortOrder,
    tableFilters: modifiedTableFilters,
    selectColumns: selectColumns
  } as any;
};

export function* handle_ACTIVITIES_TABLE_GET_ROWS(action: PayloadAction<ActivityTableRowGetRequest>) {
  try {
    const currentState = yield select(selectUserSettings);
    const connected = yield select(selectNetworkConnected);
    const mapState = yield select(selectMap);
    const { recordSetID, page, limit, tableFiltersHash } = action.payload;
    const userMobileOffline = MOBILE && !connected;

    const filterObject = getRecordFilterObjectFromStateForAPI(recordSetID, currentState, mapState?.clientBoundaries);
    filterObject.page = page;
    filterObject.limit = limit;

    if (mapState?.recordTables?.[recordSetID]?.tableFiltersHash !== tableFiltersHash) {
      console.warn('Stale tableRow request (tableFiltersHash mismatch), aborting');
      return;
    }
    if (
      mapState?.recordTables?.[recordSetID]?.page !== page ||
      mapState?.recordTables?.[recordSetID]?.limit !== limit
    ) {
      console.warn('Stale tableRow request (page or limit mismatch), aborting');
      return;
    }

    // user online: fetch from DB or offline recordset: activities fetched from persisted store
    if (!userMobileOffline || recordSetID === RecordSetId.OfflineActivities) {
      yield put(
        Activity.getRowsRequest({
          filterObj: filterObject,
          recordSetID: recordSetID,
          tableFiltersHash: tableFiltersHash,
          page: page,
          limit: limit
        })
      );
    } else {
      // user offline: fetch from cache
      yield getRowsFromCachedRecordset(action.payload);
    }
  } catch (e) {
    console.error(e);
  }
}

export function* getRowsFromCachedRecordset(req: ActivityTableRowGetRequest) {
  try {
    const { recordSetID, page, limit, tableFiltersHash } = req;
    const service = yield RecordCacheServiceFactory.getPlatformInstance();
    const recordSetIdList = yield service.getIdList(recordSetID);
    const records = yield service.getPaginatedCachedActivityRecords(recordSetIdList, page, limit);

    yield put(
      Activity.getRowsSuccess({
        recordSetID: recordSetID,
        rows: records,
        tableFiltersHash: tableFiltersHash,
        page: page,
        limit: limit
      })
    );
  } catch (ex) {
    console.error(ex);
  }
}

export function* handle_IAPP_TABLE_ROWS_GET_REQUEST(action: PayloadAction<IappTableRowRequest>) {
  try {
    const currentState = yield select(selectUserSettings);
    const connected = yield select(selectNetworkConnected);
    const mapState = yield select(selectMap);
    const { recordSetID, page, limit, tableFiltersHash } = action.payload;
    const userMobileOffline = MOBILE && !connected;

    const filterObject = getRecordFilterObjectFromStateForAPI(recordSetID, currentState, mapState?.clientBoundaries);
    filterObject.page = page;
    filterObject.limit = limit;

    if (mapState?.recordTables?.[recordSetID]?.tableFiltersHash !== tableFiltersHash) {
      console.warn('Stale tableRow request (tableFiltersHash mismatch), aborting');
      return;
    }
    if (
      mapState?.recordTables?.[recordSetID]?.page !== page ||
      mapState?.recordTables?.[recordSetID]?.limit !== limit
    ) {
      console.warn('Stale tableRow request (page or limit mismatch), aborting');
      return;
    }
    if (userMobileOffline) {
      yield getIappRowsFromCache(action.payload);
    } else {
      yield put(
        IappActions.getRowsRequest({
          filterObj: filterObject,
          recordSetID: recordSetID,
          tableFiltersHash: tableFiltersHash,
          page: page,
          limit: limit
        })
      );
    }
  } catch (e) {
    console.error(e);
    yield put({ type: ACTIVITY_GET_INITIAL_STATE_FAILURE });
  }
}
export function* getIappRowsFromCache(payload: IappTableRowRequest) {
  try {
    const { recordSetID, page, limit, tableFiltersHash } = payload;
    const service = yield RecordCacheServiceFactory.getPlatformInstance();
    const recordSetIdList = yield service.getIdList(recordSetID.toString()) ?? [];
    const records = yield service.getPaginatedCachedIappRecords(recordSetIdList, page, limit);

    yield put(
      IappActions.getRowsSuccess({
        recordSetID: recordSetID,
        rows: records,
        tableFiltersHash: tableFiltersHash,
        page: page,
        limit: limit
      })
    );
  } catch (ex) {
    console.error(ex);
  }
}

function largePush(src, dest) {
  const len = src.length;
  for (let i = 0; i < len; i++) {
    dest.push(src[i]);
  }
}

export function* handle_MAP_WHATS_HERE_INIT_GET_POI() {
  const currentMapState = yield select((state) => state.Map);

  const featuresFilteredByUserShape = Object.values(currentMapState?.IAPPGeoJSONDict)?.filter((feature: any) => {
    // IAPP will always be points
    const pointToCheck = point(feature.geometry.coordinates);
    const polygonToCheck = polygon(currentMapState?.whatsHere?.feature?.geometry.coordinates);
    return booleanPointInPolygon(pointToCheck, polygonToCheck);
  });

  const featureFilteredIDS = featuresFilteredByUserShape.map((feature: any) => {
    return feature.properties.site_id;
  });

  const unfilteredRecordSetIDs = [];

  currentMapState?.layers.map((layer) => {
    if (layer?.type === RecordSetType.IAPP && layer?.layerState.mapToggle) {
      largePush(layer?.IDList, unfilteredRecordSetIDs);
    }
  });

  const recordSetFilteredIDs = unfilteredRecordSetIDs.filter((id) => {
    return featureFilteredIDS.includes(id);
  });

  // Filter duplicates
  const recordSetUniqueFilteredIDs = Array.from(new Set(recordSetFilteredIDs));

  yield put(WhatsHere.map_init_get_poi_ids_fetched(recordSetUniqueFilteredIDs));
  yield put(WhatsHere.iapp_rows_request());
}

export function* handle_MAP_WHATS_HERE_INIT_GET_ACTIVITY(action) {
  let currentMapState = yield select((state) => state.Map);

  if (!currentMapState?.activitiesGeoJSONDict || !currentMapState?.IAPPGeoJSONDict) {
    yield take(ACTIVITIES_GEOJSON_GET_SUCCESS);
    yield take(IAPP_GEOJSON_GET_SUCCESS);
  }

  currentMapState = yield select(selectMap);
  const featuresFilteredByShape: Record<string, any> = [];

  for (const source of ACTIVITY_GEOJSON_SOURCE_KEYS) {
    if (!currentMapState?.activitiesGeoJSONDict?.hasOwnProperty(source)) continue;

    const current = currentMapState?.activitiesGeoJSONDict[source];
    if (current == undefined) continue;

    featuresFilteredByShape.push(
      ...Object.values(current)?.filter((feature: any) => {
        const boundaryPolygon = polygon(currentMapState?.whatsHere?.feature?.geometry.coordinates);
        switch (feature?.geometry?.type) {
          case GeoShapes.Point:
            const featurePoint = point(feature.geometry.coordinates);
            return booleanPointInPolygon(featurePoint, boundaryPolygon);
          case GeoShapes.Polygon:
            const featurePolygon = polygon(feature.geometry.coordinates);
            return intersect(featurePolygon, boundaryPolygon);
          case GeoShapes.MultiPolygon:
            const amultiPolygon = multiPolygon(feature.geometry.coordinates);
            return intersect(amultiPolygon, boundaryPolygon);
          default:
            return false;
        }
      })
    );
  }

  const featureFilteredIDS = featuresFilteredByShape.map((feature: any) => {
    return feature.properties.id;
  });

  const unfilteredRecordSetIDs: string[] = [];
  currentMapState?.layers?.map((layer) => {
    if (layer?.type === 'Activity' && layer?.layerState.mapToggle) {
      unfilteredRecordSetIDs.push(...layer?.IDList);
    }
  });

  const recordSetFilteredIDs = unfilteredRecordSetIDs.filter((id) => {
    return featureFilteredIDS.includes(id);
  });

  // Filter duplicates
  const recordSetUniqueFilteredIDs = Array.from(new Set(recordSetFilteredIDs));

  yield put(WhatsHere.map_init_get_activity_ids_fetched(recordSetUniqueFilteredIDs));
  yield put(WhatsHere.activity_rows_request());
}

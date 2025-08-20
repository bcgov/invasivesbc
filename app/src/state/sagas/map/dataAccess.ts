import { put, select } from 'redux-saga/effects';
import getSelectColumnsByRecordSetType from 'sharedAPI/src/getSelectColumnsByRecordSetType';
import { PayloadAction } from '@reduxjs/toolkit';
import { selectMap } from 'state/reducers/map';
import WhatsHere from 'state/actions/whatsHere/WhatsHere';
import { RecordSetId, RecordSetType, UserRecordSet } from 'interfaces/UserRecordSet';
import { buildTimeConfig } from 'state/configuration/build-time-config';
import { RecordCacheServiceFactory } from 'utils/record-cache/context';
import { selectNetworkConnected } from 'state/reducers/network';
import { selectUserSettings } from 'state/reducers/userSettings';
import IappActions, { IappTableRowRequest } from 'state/actions/activity/Iapp';
import Activity, { ActivityTableRowGetRequest, IGetIdsForRecordset } from 'state/actions/activity/Activity';
import { IQueryParams } from 'utils/record-cache';
import AppActions, { IPrepFilter } from 'state/actions/appActions/appActions';

export function* handle_PREP_FILTERS_FOR_VECTOR_ENDPOINT(action: PayloadAction<IPrepFilter>) {
  const { recordSetID, tableFiltersHash } = action.payload;
  try {
    const currentState = yield select((state) => state?.UserSettings);
    const recordset: UserRecordSet = currentState.recordSets[recordSetID];
    const filterObject = getRecordFilterObjectFromStateForAPI(recordSetID, currentState);
    if (filterObject == null) {
      console.warn('filterObject returned by getRecordFilterObjectFromStateForAPI is null, probable data error');
    }

    // abort if already a stale hash
    const mapState = yield select((state) => state.Map);
    const tableHash = mapState?.layers?.filter((layer) => {
      return layer?.recordSetID === recordSetID;
    })?.[0]?.tableFiltersHash;

    if (tableHash && tableHash !== tableFiltersHash) {
      return;
    }

    yield put(
      AppActions.vectorFiltersPrepped({
        filterObject: filterObject,
        recordSetID: recordSetID,
        tableFiltersHash: tableFiltersHash,
        recordSetType: recordset.recordSetType
      })
    );
  } catch (e) {
    console.error(e);
    throw e;
  }
}

export function* handle_ACTIVITIES_GET_IDS_FOR_RECORDSET_REQUEST(action: PayloadAction<IGetIdsForRecordset>) {
  const currentState = yield select((state) => state.UserSettings);
  const filterObject = getRecordFilterObjectFromStateForAPI(action.payload.recordSetID, currentState);
  const workingOffline = yield select((state) => state.Auth.workingOffline);
  const connected = yield select((state) => state.Network.connected);
  if (filterObject == null) {
    return;
  }
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
  }
}

export function* getIdsForRecordsetFromCache(action: IGetIdsForRecordset) {
  try {
    const service = yield RecordCacheServiceFactory.getPlatformInstance();
    if (yield service.isCached(action.recordSetID)) {
      const userSettingsState = yield select(selectUserSettings);
      const filters = getRecordFilterObjectFromStateForAPI(action.recordSetID, userSettingsState);

      if (filters == null) {
        console.warn('null filterObject returned by getRecordFilterObjectFromStateForAPI, probable data error');
      }

      const queryObj: IQueryParams = {
        tableFilters: filters.tableFilters,
        recordSetType: filters.recordSetType,
        ids_to_filter: filters?.ids_to_filter,
        selectColumns: ['id'],
        limit: 1000000 // Override 50k limit of query tool since known size is small.
      };
      const ids = yield service.query(queryObj);
      yield put(
        Activity.getIdsForRecordsetSuccess({
          recordSetID: action.recordSetID,
          idList: ids.map((record) => record.id) ?? [],
          tableFiltersHash: action.tableFiltersHash
        })
      );
    }
  } catch (ex) {
    console.error(ex);
  }
}

export function* handle_IAPP_GET_IDS_FOR_RECORDSET_REQUEST(action) {
  try {
    const currentState = yield select((state) => state.UserSettings);
    const workingOffline = yield select((state) => state.Auth.workingOffline);
    const connected = yield select((state) => state.Network.connected);
    const filterObject = getRecordFilterObjectFromStateForAPI(action.payload.recordSetID, currentState);
    if (filterObject == null) {
      return;
    }
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
      yield getIdsForRecordsetFromCache(action.payload);
    }
  } catch (e) {
    console.error(e);
  }
}

export const getRecordFilterObjectFromStateForAPI = (recordSetID, recordSetsState) => {
  try {
    const recordSet = JSON.parse(JSON.stringify(recordSetsState.recordSets?.[recordSetID]));
    const recordSetType = JSON.parse(JSON.stringify(recordSetsState?.recordSets?.[recordSetID]?.recordSetType));
    const sortColumn = recordSet?.sortColumn;
    const sortOrder = recordSet?.sortOrder;
    const tableFilters = recordSet?.tableFilters;
    const selectColumns = recordSet?.selectColumns ?? getSelectColumnsByRecordSetType(recordSetType);

    return {
      recordSetType: recordSetType,
      ids_to_filter: recordSet?.ids_to_filter,
      sortColumn: sortColumn,
      sortOrder: sortOrder,
      tableFilters: tableFilters,
      selectColumns: selectColumns
    } as any;
  } catch (_e) {
    return null;
  }
};

export function* handle_ACTIVITIES_TABLE_GET_ROWS(action: PayloadAction<ActivityTableRowGetRequest>) {
  try {
    const currentState = yield select(selectUserSettings);
    const connected = yield select(selectNetworkConnected);
    const mapState = yield select(selectMap);
    const { recordSetID, page, limit, tableFiltersHash } = action.payload;
    const userMobileOffline = buildTimeConfig.MOBILE && !connected;

    const filterObject = getRecordFilterObjectFromStateForAPI(recordSetID, currentState);
    if (filterObject == null) {
      console.warn('filterObject returned by getRecordFilterObjectFromStateForAPI is null, probable data error');
    } else {
      filterObject.page = page;
      filterObject.limit = limit;
    }
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
    const userSettingsState = yield select(selectUserSettings);
    const filters = getRecordFilterObjectFromStateForAPI(recordSetID, userSettingsState);
    const service = yield RecordCacheServiceFactory.getPlatformInstance();

    if (filters == null) {
      console.warn('filterObject returned by getRecordFilterObjectFromStateForAPI is null, probable data error');
    }

    const queryObj: IQueryParams = {
      limit: limit,
      page: page,
      tableFilters: filters?.tableFilters,
      ids_to_filter: filters?.ids_to_filter,
      recordSetType: filters?.recordSetType,
      selectColumns: ['data'],
      sort: { by: filters.sortColumn, order: filters.sortOrder }
    };
    const records = yield service.query(queryObj);
    yield put(
      Activity.getRowsSuccess({
        recordSetID: recordSetID,
        rows: records.map((r) => r.data),
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
    const userMobileOffline = buildTimeConfig.MOBILE && !connected;

    const filterObject = getRecordFilterObjectFromStateForAPI(recordSetID, currentState);
    if (filterObject == null) {
      console.warn('filterObject returned by getRecordFilterObjectFromStateForAPI is null, probable data error');
    } else {
      filterObject.page = page;
      filterObject.limit = limit;
    }

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
  }
}

export function* getIappRowsFromCache(payload: IappTableRowRequest) {
  try {
    const { recordSetID, page, limit, tableFiltersHash } = payload;
    const userSettingsState = yield select(selectUserSettings);
    const filters = getRecordFilterObjectFromStateForAPI(recordSetID, userSettingsState);
    if (filters == null) {
      console.warn('filterObject returned by getRecordFilterObjectFromStateForAPI is null, probable data error');
    }
    const service = yield RecordCacheServiceFactory.getPlatformInstance();
    const queryObj: IQueryParams = {
      limit: limit,
      page: page,
      tableFilters: filters?.tableFilters,
      ids_to_filter: filters?.ids_to_filter,
      recordSetType: filters?.recordSetType,
      selectColumns: ['table_data'],
      sort: {
        by: filters?.sortColumn,
        order: filters?.sortOrder
      }
    };

    const records = yield service.query(queryObj);
    yield put(
      IappActions.getRowsSuccess({
        recordSetID: recordSetID,
        rows: records.map((r) => r?.table_data),
        tableFiltersHash: tableFiltersHash,
        page: page,
        limit: limit
      })
    );
  } catch (ex) {
    console.error(ex);
  }
}

export function* handle_MAP_WHATS_HERE_INIT_GET_ACTIVITY() {
  const currentMapState = yield select(selectMap);
  const featuresFilteredByShape: Record<PropertyKey, any> = [];

  const featureFilteredIDS = featuresFilteredByShape.map((feature: any) => {
    return feature.properties.id;
  });

  const unfilteredRecordSetIDs: string[] = [];
  currentMapState?.layers?.forEach((layer) => {
    if (layer?.type === RecordSetType.Activity && layer?.layerState.mapToggle) {
      unfilteredRecordSetIDs.push(...(layer?.IDList || []));
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

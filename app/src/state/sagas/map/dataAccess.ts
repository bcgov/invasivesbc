import { put, select, take } from 'redux-saga/effects';
import intersect from '@turf/intersect';

import {
  ACTIVITIES_GEOJSON_GET_OFFLINE,
  ACTIVITIES_GEOJSON_GET_ONLINE,
  ACTIVITIES_GEOJSON_GET_SUCCESS,
  ACTIVITIES_GET_IDS_FOR_RECORDSET_OFFLINE,
  ACTIVITIES_GET_IDS_FOR_RECORDSET_ONLINE,
  ACTIVITIES_TABLE_ROWS_GET_FAILURE,
  ACTIVITIES_TABLE_ROWS_GET_ONLINE,
  ACTIVITY_GET_INITIAL_STATE_FAILURE,
  EXPORT_CONFIG_LOAD_REQUEST,
  EXPORT_CONFIG_LOAD_SUCCESS,
  FILTERS_PREPPED_FOR_VECTOR_ENDPOINT,
  IAPP_GEOJSON_GET_ONLINE,
  IAPP_GEOJSON_GET_SUCCESS,
  IAPP_GET_IDS_FOR_RECORDSET_ONLINE,
  IAPP_TABLE_ROWS_GET_ONLINE,
  MAP_WHATS_HERE_INIT_GET_ACTIVITY_IDS_FETCHED,
  MAP_WHATS_HERE_INIT_GET_POI_IDS_FETCHED,
  WHATS_HERE_ACTIVITY_ROWS_REQUEST,
  WHATS_HERE_IAPP_ROWS_REQUEST,
  WHATS_HERE_PAGE_POI
} from 'state/actions';
import { ACTIVITY_GEOJSON_SOURCE_KEYS, selectMap } from 'state/reducers/map';
import { booleanPointInPolygon, multiPolygon, point, polygon } from '@turf/turf';
import { selectUserSettings } from 'state/reducers/userSettings';

export function* handle_ACTIVITIES_GEOJSON_GET_REQUEST(action) {
  try {
    // if mobile or web
    if (true) {
      yield put({
        type: ACTIVITIES_GEOJSON_GET_ONLINE,
        payload: {
          recordSetID: action.payload.recordSetID,
          activitiesFilterCriteria: action.payload.activitiesFilterCriteria
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


export function* handle_PREP_FILTERS_FOR_VECTOR_ENDPOINT(action) {

  const currentState = yield select((state) => state.UserSettings );
  const clientBoundaries = yield select((state) => state.Map?.clientBoundaries );
  let filterObject = getRecordFilterObjectFromStateForAPI(
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

  yield put({type: FILTERS_PREPPED_FOR_VECTOR_ENDPOINT, payload: {
    filterObject: filterObject,
    recordSetID: action.payload.recordSetID,
    tableFiltersHash: action.payload.tableFiltersHash,
    recordSetType: action.payload.recordSetType
  }})


  //filterObject.page = action.payload.page ? action.payload.page : mapState.recordTables?.[action.payload.recordSetID]?.page;
//  filterObject.limit = 200000;
 // filterObject.selectColumns = ['activity_id'];
}

export function* handle_ACTIVITIES_GET_IDS_FOR_RECORDSET_REQUEST(action) {
  const currentState = yield select((state) => state.UserSettings );
  const clientBoundaries = yield select((state) => state.Map?.clientBoundaries );
  let filterObject = getRecordFilterObjectFromStateForAPI(
    action.payload.recordSetID,
    currentState,
    clientBoundaries
  );
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
          recordSetID: action.payload.recordSetID,
          tableFiltersHash: action.payload.tableFiltersHash
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
  const currentState = yield select((state) => state.UserSettings );
  const clientBoundaries = yield select((state) => state.Map?.clientBoundaries );
    let filterObject = getRecordFilterObjectFromStateForAPI(
      action.payload.recordSetID,
      currentState,
      clientBoundaries
    );
    //filterObject.page = action.payload.page ? action.payload.page : mapState.recordTables?.[action.payload.recordSetID]?.page;
    filterObject.limit = 200000;
    filterObject.selectColumns = ['site_id'];

    // if mobile or web
    if (true) {
      yield put({
        type: IAPP_GET_IDS_FOR_RECORDSET_ONLINE,
        payload: {
          filterObj: filterObject,
          recordSetID: action.payload.recordSetID,
          tableFiltersHash: action.payload.tableFiltersHash
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
    })?.[0]?.geojson;
  };
  const recordSet = JSON.parse(JSON.stringify(recordSetsState.recordSets?.[recordSetID]));
  const recordSetType = JSON.parse(JSON.stringify(recordSetsState?.recordSets?.[recordSetID]?.recordSetType))
  const sortColumn = recordSet?.sortColumn;
  const sortOrder = recordSet?.sortOrder;
  const tableFilters = recordSet?.tableFilters;
  let modifiedTableFilters = tableFilters?.map((filter) => {
    return filter.filterType !== 'spatialFilterDrawn'
      ? filter
      : { ...filter, geojson: getFilterWithDrawnShape(filter.filter) };
  });
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

export function* handle_ACTIVITIES_TABLE_ROWS_GET_REQUEST(action) {
  try {
    // new filter object:
  const currentState = yield select((state) => state.UserSettings );
    const mapState = yield select((state) => state.Map );
    let filterObject = getRecordFilterObjectFromStateForAPI(
      action.payload.recordSetID,
      currentState,
      mapState?.clientBoundaries
    );
    filterObject.page = action.payload.page;
    filterObject.limit = action.payload.limit;

    if (mapState?.recordTables?.[action.payload.recordSetID]?.tableFiltersHash !== action.payload.tableFiltersHash) {
      console.log('Stale tableRow request (tableFiltersHash mismatch), aborting');
      return;
    }
    if (
      mapState?.recordTables?.[action.payload.recordSetID]?.page !== action.payload.page ||
      mapState?.recordTables?.[action.payload.recordSetID]?.limit !== action.payload.limit
    ) {
      console.log('Stale tableRow request (page or limit mismatch), aborting');
      return;
    }

    if (true) {
      yield put({
        type: ACTIVITIES_TABLE_ROWS_GET_ONLINE,
        payload: {
          filterObj: filterObject,
          recordSetID: action.payload.recordSetID,
          tableFiltersHash: action.payload.tableFiltersHash,
          page: action.payload.page,
          limit: action.payload.limit
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
    const currentState = yield select((state) => state.UserSettings );
    const mapState = yield select((state) => state.Map );
    let filterObject = getRecordFilterObjectFromStateForAPI(
      action.payload.recordSetID,
      currentState,
      mapState?.clientBoundaries
    );
    filterObject.page = action.payload.page;
    filterObject.limit = action.payload.limit;

    if (mapState?.recordTables?.[action.payload.recordSetID]?.tableFiltersHash !== action.payload.tableFiltersHash) {
      console.log('Stale tableRow request (tableFiltersHash mismatch), aborting');
      return;
    }
    if (
      mapState?.recordTables?.[action.payload.recordSetID]?.page !== action.payload.page ||
      mapState?.recordTables?.[action.payload.recordSetID]?.limit !== action.payload.limit
    ) {
      console.log('Stale tableRow request (page or limit mismatch), aborting');
      return;
    }
    if (true) {
      yield put({
        type: IAPP_TABLE_ROWS_GET_ONLINE,
        payload: {
          filterObj: filterObject,
          recordSetID: action.payload.recordSetID,
          tableFiltersHash: action.payload.tableFiltersHash,
          page: action.payload.page,
          limit: action.payload.limit
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
  const currentMapState = yield select((state) => state.Map);

  const featuresFilteredByUserShape = Object.values(currentMapState?.IAPPGeoJSONDict)?.filter((feature: any) => {
    // IAPP will always be a points
    const pointToCheck = point(feature.geometry.coordinates);
    const polygonToCheck = polygon(currentMapState?.whatsHere?.feature?.geometry.coordinates);
    return booleanPointInPolygon(pointToCheck, polygonToCheck);
  });

  const featureFilteredIDS = featuresFilteredByUserShape.map((feature: any) => {
    return feature.properties.site_id;
  });

  let unfilteredRecordSetIDs = [];

  currentMapState?.layers.map((layer) => {
    if (layer?.type === 'IAPP' && layer?.layerState.mapToggle) {
      largePush(layer?.IDList, unfilteredRecordSetIDs);
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
  let currentMapState = yield select((state) => state.Map);

  if (!currentMapState?.activitiesGeoJSONDict || !currentMapState?.IAPPGeoJSONDict) {
    yield take(ACTIVITIES_GEOJSON_GET_SUCCESS);
    yield take(IAPP_GEOJSON_GET_SUCCESS);
  }

  currentMapState = yield select(selectMap);
  const featuresFilteredByShape = [];

  for (const source of ACTIVITY_GEOJSON_SOURCE_KEYS) {
    if (!currentMapState?.activitiesGeoJSONDict?.hasOwnProperty(source)) continue;

    const current = currentMapState?.activitiesGeoJSONDict[source];
    if (current == undefined) continue;

    featuresFilteredByShape.push(
      ...Object.values(current)?.filter((feature: any) => {
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
      })
    );
  }

  const featureFilteredIDS = featuresFilteredByShape.map((feature: any) => {
    return feature.properties.id;
  });

  let unfilteredRecordSetIDs = [];
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
      'invasive_plant',
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

import { all, call, delay, put, select, throttle, take, takeEvery, takeLatest } from 'redux-saga/effects';
import Keycloak from 'keycloak-js';
import {
  USER_SETTINGS_SET_RECORD_SET_SUCCESS,
  ACTIVITIES_GEOJSON_GET_REQUEST,
  ACTIVITIES_TABLE_ROW_GET_REQUEST,
  ACTIVITIES_GEOJSON_GET_SUCCESS,
  ACTIVITIES_TABLE_ROW_GET_SUCCESS,
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
  FILTER_STATE_UPDATE
} from '../actions';
import { AppConfig } from '../config';
import { selectConfiguration } from '../reducers/configuration';
import {
  handle_ACTIVITIES_GEOJSON_GET_REQUEST,
  handle_ACTIVITIES_GET_IDS_FOR_RECORDSET_REQUEST,
  handle_IAPP_GEOJSON_GET_REQUEST,
  handle_IAPP_GET_IDS_FOR_RECORDSET_REQUEST,
  handle_IAPP_TABLE_ROWS_GET_REQUEST
} from './map/dataAccess';
import {
  handle_ACTIVITIES_GEOJSON_GET_ONLINE,
  handle_ACTIVITIES_GET_IDS_FOR_RECORDSET_ONLINE,
  handle_IAPP_GEOJSON_GET_ONLINE,
  handle_IAPP_GET_IDS_FOR_RECORDSET_ONLINE,
  handle_IAPP_TABLE_ROWS_GET_ONLINE
} from './map/online';
import { getSearchCriteriaFromFilters } from 'components/activities-list/Tables/Plant/ActivityGrid';
import { selectAuth } from 'state/reducers/auth';
import { selectMap } from 'state/reducers/map';
import { selectUserSettings } from 'state/reducers/userSettings';
import { ActivityStatus } from 'constants/activities';

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
  sets[action.payload.updatedSetName] = action.payload.updatedSet;
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
    mapToggle: action.payload.updatedSet.mapToggle
  };

  const newFilterState = {
    advancedFilters: action.payload.updatedSet.advancedFilters,
    gridFilters: action.payload.updatedSet.gridFilters
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
  console.log(JSON.stringify(a))
  console.log(JSON.stringify(b))
  if(a && !b)
  {
    return false
  }
  if(b && !a)
  {
    return false;
  }
    for (const p in a) {
      switch(typeof a[p])
      {
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
       default:
        if(!arraysEqual(a[p], b[p]))
        {
            return false;
        }
        else
        {
          if(!compareObjects(a[p], b[p]))
          {
            return false;
          }
        }
      }
    }
    return true;
  };

  if (!compareObjects(mapState[action.payload.updatedSetName]?.layerState, layerState)) {
    yield put({
      type: LAYER_STATE_UPDATE,
      payload: {
        [action.payload.updatedSetName]: {
          layerState: layerState
        }
      }
    });
  }

  if (!compareObjects(mapState[action.payload.updatedSetName].filters, newFilterState)) {
      yield put({ type: FILTER_STATE_UPDATE, payload: { [action.payload.updatedSetName]: { filters: newFilterState, type: 'POI' }} });
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

  /*
  const layerState = {
    color: action.payload.recordSets[2].color,
    drawOrder: action.payload.recordSets[2].drawOrder,
    enabled: true
  };

  const IAPPlayerState = {
    color: action.payload.recordSets[3].color,
    drawOrder: action.payload.recordSets[3].drawOrder,
    enabled: true
  };
  */

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

  let newMapState = {};
  for (const rs in recordSets) {
    newMapState[rs] = {};
    newMapState[rs].layerState = {
      color: recordSets[rs].color,
      mapToggle: recordSets[rs].mapToggle,
      drawOrder: recordSets[rs].drawOrder
    };

    newMapState[rs].filters = {
      advancedFilters: recordSets[rs].advancedFilters,
      gridFilters: recordSets[rs].gridFilters
    };

    newMapState[rs].type = recordSets[rs].recordSetType;
  }

  yield put({
    type: LAYER_STATE_UPDATE,
    payload: { ...newMapState }
  });

  yield put({
    type: FILTER_STATE_UPDATE,
    payload: { ...newMapState }
  })

  for (const rs in recordSets) {
    const recordSet = recordSets[rs];
    if (recordSets[rs].recordSetType === 'POI') {
      const IAPP_filter = getSearchCriteriaFromFilters(
        recordSet.advancedFilters,
        authState.accessRoles,
        sets,
        recordSet,
        true,
        recordSet.gridFilters,
        0,
        200000
      );

      yield put({
        type: IAPP_GET_IDS_FOR_RECORDSET_REQUEST,
        payload: {
          recordSetID: rs,
          IAPPFilterCriteria: { ...IAPP_filter, site_id_only: true }
        }
      });
      yield take(IAPP_GET_IDS_FOR_RECORDSET_SUCCESS);
    } else {
      const activity_filter = getSearchCriteriaFromFilters(
        recordSet.advancedFilters,
        authState.accessRoles,
        sets,
        recordSet,
        false,
        recordSet.gridFilters,
        0,
        200000
      );

      yield put({
        type: ACTIVITIES_GET_IDS_FOR_RECORDSET_REQUEST,
        payload: {
          recordSetID: rs,
          ActivityFilterCriteria: { ...activity_filter, activity_id_only: true }
        }
      });
      yield take(ACTIVITIES_GET_IDS_FOR_RECORDSET_SUCCESS);

    }
  }
}

function* handle_IAPP_TABLE_ROWS_GET_SUCCESS(action) {
  const IDList = action.payload.IAPPTableRows.map((row) => {
    return row.site_id;
  });

  yield put({
    type: IAPP_RECORDSET_ID_LIST_GET_SUCCESS,
    payload: { recordSetID: action.payload.recordSetID, ids: IDList }
  });
}

function* handle_FILTER_STATE_UPDATE(action) {
  const authState = yield select(selectAuth);
  for(const x in action.payload)
  {
    if(action.payload[x].type === 'POI')
    {
      const IAPP_filter = getSearchCriteriaFromFilters(
        action.payload[x].advancedFilters,
        authState.accessRoles,
        [],
        x,
        true,
        action.payload[x].gridFilters,
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

    }
    else
    {
      const activityFilter = getSearchCriteriaFromFilters(
        action.payload[x].advancedFilters,
        authState.accessRoles,
        [],
        x,
        true,
        action.payload[x].gridFilters,
        0,
        200000
      ); 

    }


  }
}


function* activitiesPageSaga() {
  yield all([
    takeEvery(USER_SETTINGS_GET_INITIAL_STATE_SUCCESS, handle_USER_SETTINGS_GET_INITIAL_STATE_SUCCESS),
    takeEvery(USER_SETTINGS_SET_RECORD_SET_SUCCESS, handle_USER_SETTINGS_SET_RECORD_SET_SUCCESS),
    takeEvery(MAP_INIT_REQUEST, handle_MAP_INIT_REQUEST),
    takeEvery(ACTIVITIES_GEOJSON_GET_REQUEST, handle_ACTIVITIES_GEOJSON_GET_REQUEST),
    takeEvery(IAPP_GEOJSON_GET_REQUEST, handle_IAPP_GEOJSON_GET_REQUEST),
    takeEvery(ACTIVITIES_GET_IDS_FOR_RECORDSET_REQUEST, handle_ACTIVITIES_GET_IDS_FOR_RECORDSET_REQUEST),
    takeEvery(ACTIVITIES_GET_IDS_FOR_RECORDSET_ONLINE, handle_ACTIVITIES_GET_IDS_FOR_RECORDSET_ONLINE),
    takeEvery(IAPP_GET_IDS_FOR_RECORDSET_REQUEST, handle_IAPP_GET_IDS_FOR_RECORDSET_REQUEST),
    takeEvery(IAPP_GET_IDS_FOR_RECORDSET_ONLINE, handle_IAPP_GET_IDS_FOR_RECORDSET_ONLINE),
    takeEvery(FILTER_STATE_UPDATE, handle_FILTER_STATE_UPDATE),
    takeEvery(IAPP_TABLE_ROWS_GET_REQUEST, handle_IAPP_TABLE_ROWS_GET_REQUEST),
    takeEvery(IAPP_TABLE_ROWS_GET_ONLINE, handle_IAPP_TABLE_ROWS_GET_ONLINE),
    takeEvery(IAPP_GEOJSON_GET_ONLINE, handle_IAPP_GEOJSON_GET_ONLINE),
    takeEvery(ACTIVITIES_GEOJSON_GET_ONLINE, handle_ACTIVITIES_GEOJSON_GET_ONLINE),
    takeEvery(IAPP_TABLE_ROWS_GET_SUCCESS, handle_IAPP_TABLE_ROWS_GET_SUCCESS),
    // takeEvery(IAPP_INIT_LAYER_STATE_REQUEST, handle_IAPP_INIT_LAYER_STATE_REQUEST),
    takeEvery(ACTIVITIES_TABLE_ROW_GET_REQUEST, () => console.log('ACTIVITY_LINK_RECORD_REQUEST'))
  ]);
}

export default activitiesPageSaga;

import { createNextState } from '@reduxjs/toolkit';
import { Md5 } from 'ts-md5';
import { Draft } from 'immer';
import {
  CLOSE_NEW_RECORD_MENU,
  GET_API_DOC_SUCCESS,
  IAPP_GET_SUCCESS,
  OPEN_NEW_RECORD_MENU,
  RECORDSET_ADD_FILTER,
  RECORDSET_CLEAR_FILTERS,
  RECORDSET_SET_SORT
} from '../actions';

import { AppConfig } from '../config';
import { CURRENT_MIGRATION_VERSION, MIGRATION_VERSION_KEY } from 'constants/offline_state_version';
import { UserRecordCacheStatus, UserRecordSet } from 'interfaces/UserRecordSet';
import UserSettings from 'state/actions/userSettings/UserSettings';
import Boundary from 'interfaces/Boundary';
import WhatsHere from 'state/actions/whatsHere/WhatsHere';
import Activity from 'state/actions/activity/Activity';
import RecordCache from 'state/actions/cache/RecordCache';

export function getUuid() {
  return Math.random() + Date.now().toString();
}

export interface UserSettingsState {
  [MIGRATION_VERSION_KEY]: number;

  initialized: boolean;
  error: boolean;

  activeActivity: string | null;
  activeActivityDescription: string | null;
  activeIAPP: string | null;
  apiDocsWithViewOptions: object | null;
  apiDocsWithSelectOptions: object | null;

  mapCenter: [number, number];
  newRecordDialogState: any;

  recordSets: {
    [key: number | string]: UserRecordSet;
  };
  recordsExpanded: boolean;

  boundaries: Boundary[];
  layerPickerIsAccordion: boolean;
  darkTheme: boolean;
}

const initialState: UserSettingsState = {
  [MIGRATION_VERSION_KEY]: CURRENT_MIGRATION_VERSION,

  activeActivity: null,
  activeActivityDescription: null,
  activeIAPP: null,

  apiDocsWithSelectOptions: null,
  apiDocsWithViewOptions: null,
  layerPickerIsAccordion: false,
  boundaries: [],
  error: false,
  recordSets: {},
  recordsExpanded: false,
  initialized: false,
  darkTheme: false,
  mapCenter: [55, -128],
  newRecordDialogState: {
    recordCategory: '',
    recordType: '',
    recordSubtype: ''
  }
};

function createUserSettingsReducer(configuration: AppConfig): (UserSettingsState, AnyAction) => UserSettingsState {
  return (state = initialState, action) => {
    return createNextState(state, (draftState: Draft<UserSettingsState>) => {
      if (UserSettings.toggleRecordExpandSuccess.match(action)) {
        draftState.recordsExpanded = !draftState.recordsExpanded;
      } else if (UserSettings.Activity.setActiveActivityIdSuccess.match(action)) {
        draftState.activeActivity = action.payload;
        draftState.activeActivityDescription = action.payload;
      } else if (UserSettings.Boundaries.setSuccess.match(action)) {
        draftState.boundaries = action.payload;
      } else if (UserSettings.KML.deleteSuccess.match(action)) {
        draftState.boundaries = draftState.boundaries?.filter(
          (boundary: Boundary) => boundary.server_id !== action.payload
        );
      } else if (UserSettings.setNewRecordDialogueStateSuccess.match(action)) {
        draftState.newRecordDialogState = action.payload;
      } else if (UserSettings.Boundaries.removeFromSetSuccess.match(action)) {
        draftState.recordSets = { ...action.payload };
      } else if (UserSettings.Boundaries.addToSetSuccess.match(action)) {
        draftState.recordSets = { ...action.payload };
      } else if (UserSettings.Boundaries.deleteSuccess.match(action)) {
        draftState.boundaries = draftState.boundaries.filter((boundary: Boundary) => boundary.id !== action.payload.id);
      } else if (UserSettings.IAPP.setActiveSuccess.match(action)) {
        draftState.activeIAPP = action.payload;
      } else if (UserSettings.InitState.getSuccess.match(action)) {
        draftState.recordSets = { ...action.payload.recordSets };
      } else if (UserSettings.Map.setCenterSuccess.match(action)) {
        draftState.mapCenter = action.payload as [number, number];
      } else if (UserSettings.RecordSet.add.match(action)) {
        draftState.recordSets[Date.now()] = action.payload;
      } else if (UserSettings.RecordSet.remove.match(action)) {
        delete draftState.recordSets[action.payload];
      } else if (UserSettings.RecordSet.set.match(action)) {
        Object.keys(action.payload.updatedSet).forEach((key) => {
          draftState.recordSets[action.payload.setName][key] = action.payload.updatedSet[key];
        });
      } else if (UserSettings.RecordSet.updateFilter.match(action)) {
        draftState.recordSets[action.payload.setID].tableFilters ??= [];

        const index = draftState.recordSets[action.payload.setID]?.tableFilters.findIndex(
          (filter) => filter.id === action.payload.filterID
        );
        if (index !== -1) {
          if (action.payload.filterType) {
            draftState.recordSets[action.payload.setID].tableFilters[index].filterType = action.payload.filterType;
          }
        }
        if (
          action.payload.filterType === 'spatialFilterDrawn' ||
          action.payload.filterType === 'spatialFilterUploaded'
        ) {
          delete draftState.recordSets[action.payload.setID].tableFilters[index].field;
          if (!action.payload.operator) {
            draftState.recordSets[action.payload.setID].tableFilters[index].operator = 'CONTAINED IN';
          }
          if (!action.payload.filter) {
            delete draftState.recordSets[action.payload.setID].tableFilters[index].filter;
          }
        }

        if (action.payload.field) {
          const index = draftState.recordSets[action.payload.setID]?.tableFilters.findIndex(
            (filter) => filter.id === action.payload.filterID
          );
          if (index !== -1)
            draftState.recordSets[action.payload.setID].tableFilters[index].field = action.payload.field;
        }

        if (action.payload.operator) {
          const index = draftState.recordSets[action.payload.setID]?.tableFilters.findIndex(
            (filter) => filter.id === action.payload.filterID
          );
          if (index !== -1)
            draftState.recordSets[action.payload.setID].tableFilters[index].operator = action.payload.operator;
        }
        if (action.payload.operator2) {
          const index = draftState.recordSets[action.payload.setID]?.tableFilters.findIndex(
            (filter) => filter.id === action.payload.filterID
          );
          if (index !== -1)
            draftState.recordSets[action.payload.setID].tableFilters[index].operator2 = action.payload.operator2;
        }

        //re used for spatial filters
        if (action.payload.filter !== undefined) {
          const index = draftState.recordSets[action.payload.setID]?.tableFilters.findIndex(
            (filter) => filter.id === action.payload.filterID
          );
          if (index !== -1) {
            draftState.recordSets[action.payload.setID].tableFilters[index].filter = action.payload.filter;
          }
        }

        const tableFiltersNotBlank = draftState.recordSets[action.payload.setID]?.tableFilters.filter(
          (filter) => filter.filter !== ''
        );

        draftState.recordSets[action.payload.setID].tableFiltersPreviousHash =
          draftState.recordSets[action.payload.setID]?.tableFiltersHash;
        draftState.recordSets[action.payload.setID].tableFiltersHash = Md5.hashStr(
          JSON.stringify(tableFiltersNotBlank)
        );
      } else if (UserSettings.RecordSet.removeFilter.match(action)) {
        const index = draftState.recordSets[action.payload.setID]?.tableFilters.findIndex(
          (filter) => filter.id === action.payload.filterID
        );
        draftState.recordSets[action.payload.setID]?.tableFilters.splice(index, 1);

        draftState.recordSets[action.payload.setID].tableFiltersPreviousHash =
          draftState.recordSets[action.payload.setID]?.tableFiltersHash;

        const tableFiltersNotBlank = draftState.recordSets[action.payload.setID]?.tableFilters.filter(
          (filter) => filter.filter !== ''
        );

        draftState.recordSets[action.payload.setID].tableFiltersHash = Md5.hashStr(
          JSON.stringify(tableFiltersNotBlank)
        );
      } else if (UserSettings.toggleLayerPickerAccordion.match(action)) {
        draftState.layerPickerIsAccordion = !draftState.layerPickerIsAccordion;
      } else if (WhatsHere.toggle.match(action)) {
        draftState.recordsExpanded = action.payload ? false : draftState.recordsExpanded;
      } else if (RecordCache.requestCaching.pending.match(action)) {
        draftState.recordSets[action.meta.arg.setId].cacheMetadata = {
          status: UserRecordCacheStatus.DOWNLOADING
        };
      } else if (RecordCache.requestCaching.rejected.match(action)) {
        draftState.recordSets[action.meta.arg.setId].cacheMetadata = {
          status: UserRecordCacheStatus.ERROR
        };
      } else if (RecordCache.requestCaching.fulfilled.match(action)) {
        draftState.recordSets[action.meta.arg.setId].cacheMetadata = {
          status: UserRecordCacheStatus.CACHED,
          idList: action.payload.cachedIds
        };
      } else if (RecordCache.deleteCache.pending.match(action)) {
        draftState.recordSets[action.meta.arg.setId].cacheMetadata = {
          status: UserRecordCacheStatus.DELETING
        };
      } else if (RecordCache.deleteCache.rejected.match(action)) {
        draftState.recordSets[action.meta.arg.setId].cacheMetadata = {
          status: UserRecordCacheStatus.ERROR
        };
      } else if (RecordCache.deleteCache.fulfilled.match(action)) {
        draftState.recordSets[action.meta.arg.setId].cacheMetadata = {
          status: UserRecordCacheStatus.NOT_CACHED
        };
      } else if (UserSettings.RecordSet.syncCacheStatusWithCacheService.fulfilled.match(action)) {
        const cacheStatus = action.payload;
        for (const cachedSet of cacheStatus) {
          if (draftState.recordSets[cachedSet.setId]) {
            draftState.recordSets[cachedSet.setId].cacheMetadata = {
              status: UserRecordCacheStatus.CACHED,
              idList: draftState.recordSets[cachedSet.setId].cacheMetadata.idList ?? []
            };
          }
        }
      } else if (Activity.deleteSuccess.match(action)) {
        draftState.activeActivity = null;
        draftState.activeActivityDescription = null;
      } else if (Activity.get.match(action)) {
        draftState.activeActivity = action.payload;
      } else {
        switch (action.type) {
          case GET_API_DOC_SUCCESS: {
            draftState.apiDocsWithViewOptions = action.payload.apiDocsWithViewOptions;
            draftState.apiDocsWithSelectOptions = action.payload.apiDocsWithSelectOptions;
            break;
          }
          case OPEN_NEW_RECORD_MENU: {
            draftState.newRecordDialogueOpen = true;
            break;
          }
          case CLOSE_NEW_RECORD_MENU: {
            draftState.newRecordDialogueOpen = false;
            break;
          }
          case IAPP_GET_SUCCESS: {
            draftState.activeIAPP = action.payload.iapp?.site_id;
            break;
          }
          case RECORDSET_ADD_FILTER: {
            switch (action.payload.filterType) {
              case 'tableFilter':
                if (!draftState.recordSets[action.payload.setID]?.tableFilters) {
                  draftState.recordSets[action.payload.setID].tableFilters = [];
                }
                draftState.recordSets[action.payload.setID]?.tableFilters.push({
                  id: getUuid(),
                  field: action.payload.field,
                  filterType: action.payload.filterType,
                  operator: action.payload.operator ? action.payload.operator : 'CONTAINS',
                  operator2: action.payload.operator2 ? action.payload.operator2 : 'AND',
                  filter: action.payload.filter ? action.payload.filter : ''
                });
                break;
              default:
                break;
            }
            break;
          }
          case RECORDSET_SET_SORT: {
            //if the sort column is the same as the current sort column, toggle the sort order
            // if its already desc, remove the sort column and order

            // handle no sort order:
            if (
              !draftState.recordSets[action.payload.setID].sortOrder ||
              draftState.recordSets[action.payload.setID].sortColumn !== action.payload.sortColumn
            ) {
              draftState.recordSets[action.payload.setID].sortOrder = 'ASC';
              draftState.recordSets[action.payload.setID].sortColumn = action.payload.sortColumn;
            }

            // handle toggle to desc:
            else if (
              draftState.recordSets[action.payload.setID].sortOrder === 'ASC' &&
              draftState.recordSets[action.payload.setID].sortColumn === action.payload.sortColumn
            ) {
              draftState.recordSets[action.payload.setID].sortOrder = 'DESC';
            }

            // handle toggle off:
            else {
              delete draftState.recordSets[action.payload.setID].sortOrder;
              delete draftState.recordSets[action.payload.setID].sortColumn;
            }

            break;
          }
          case RECORDSET_CLEAR_FILTERS: {
            if (!(action.payload.setID === '1')) {
              draftState.recordSets[action.payload.setID].tableFilters = [];
            } else {
              draftState.recordSets[action.payload.setID].tableFilters = [
                {
                  id: '1',
                  field: 'form_status',
                  filterType: 'tableFilter',
                  filter: 'Draft',
                  operator1: 'CONTAINS',
                  operator2: 'AND'
                }
              ];
            }
            // clear sort:
            delete draftState.recordSets[action.payload.setID].sortOrder;
            delete draftState.recordSets[action.payload.setID].sortColumn;
            break;
          }
          default:
            break;
        }
      }
    }) as unknown as UserSettingsState;
  };
}

const selectUserSettings: (state) => UserSettingsState = (state) => state.UserSettings;

export { createUserSettingsReducer, selectUserSettings };

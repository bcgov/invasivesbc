import { createNextState, nanoid } from '@reduxjs/toolkit';
import { Draft } from 'immer';
import FormActions from 'state/actions/activity/FormActions';
import { AppConfig } from 'state/configuration/runtime-config';
import { CURRENT_MIGRATION_VERSION, MIGRATION_VERSION_KEY } from 'constants/offline_state_version';
import { RecordSetId, RecordSetType, UserRecordCacheStatus, UserRecordSet } from 'interfaces/UserRecordSet';
import UserSettings from 'state/actions/userSettings/UserSettings';
import Boundary from 'interfaces/Boundary';
import WhatsHere from 'state/actions/whatsHere/WhatsHere';
import Activity from 'state/actions/activity/Activity';
import RecordCache from 'state/actions/cache/RecordCache';
import IappActions from 'state/actions/activity/Iapp';
import { CacheDownloadMode } from 'utils/record-cache';
import { APIDocs } from 'state/actions/userSettings/APIDocs';
import { activityColumnsToDisplay, iappColumnsToDisplay } from 'UI/Features/Records/RecordSet/RecordTableHelpers';
import defaultRecordSets from 'constants/defaultRecordSets';
import { EFilterType } from 'state/actions/userSettings/RecordSet';
import PlanMyTrip from 'state/actions/planMyTrip/PlanMyTrip';

interface UserSettingsState {
  [MIGRATION_VERSION_KEY]: number;

  initialized: boolean;
  error: boolean;

  activeActivity: string | null;
  activeActivityDescription: string | null;
  activeIAPP: string | null;
  apiDocsWithViewOptions: object | null;
  apiDocsWithSelectOptions: object | null;

  mapCenter: [number, number];

  preferredBasemap: string | undefined;
  preferredOverlayLayers: string[];

  newRecordDialogueState: {
    viewLayout: 'new' | 'duplicate';
    open: boolean;
  };
  recordSets: Record<PropertyKey, UserRecordSet>;
  recordsExpanded: boolean;

  boundaries: Boundary[];
  layerPickerIsAccordion: boolean;
  darkTheme: boolean;
  tableColumns: {
    [RecordSetType.IAPP]: Array<{ key: string; name: string; displayWidget?: string; hide: boolean }>;
    [RecordSetType.Activity]: Array<{ key: string; name: string; displayWidget?: string; hide: boolean }>;
  };
  offlineDocs: { displayName: string; apiDocsWithViewOptions: object; apiDocsWithSelectOptions: object }[];
}

const initialState: UserSettingsState = {
  [MIGRATION_VERSION_KEY]: CURRENT_MIGRATION_VERSION,

  activeActivity: null,
  activeActivityDescription: null,
  activeIAPP: null,

  preferredBasemap: undefined,
  preferredOverlayLayers: [],

  apiDocsWithSelectOptions: null,
  apiDocsWithViewOptions: null,
  layerPickerIsAccordion: false,
  boundaries: [],
  error: false,
  recordSets: { ...(defaultRecordSets as Record<PropertyKey, UserRecordSet>) },
  recordsExpanded: false,
  newRecordDialogueState: {
    viewLayout: 'new',
    open: false
  },
  initialized: false,
  darkTheme: false,
  mapCenter: [55, -128],
  tableColumns: {
    [RecordSetType.Activity]: activityColumnsToDisplay,
    [RecordSetType.IAPP]: iappColumnsToDisplay
  },
  offlineDocs: []
};

function createUserSettingsReducer(_configuration: AppConfig) {
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
      } else if (UserSettings.Map.setPreferredBasemap.match(action)) {
        draftState.preferredBasemap = action.payload;
      } else if (UserSettings.Map.setPreferredOverlayLayers.match(action)) {
        draftState.preferredOverlayLayers = action.payload;
      } else if (UserSettings.Map.addPreferredOverlayLayer.match(action)) {
        if (!draftState.preferredOverlayLayers.includes(action.payload)) {
          draftState.preferredOverlayLayers.push(action.payload);
        }
      } else if (UserSettings.Map.removePreferredOverlayLayer.match(action)) {
        if (draftState.preferredOverlayLayers.includes(action.payload)) {
          draftState.preferredOverlayLayers.splice(draftState.preferredOverlayLayers.indexOf(action.payload), 1);
        }
      } else if (UserSettings.Map.togglePreferredOverlayLayer.match(action)) {
        let mode: 'add' | 'remove' = 'add';

        if (action.payload.active !== undefined) {
          // explicitly set
          if (action.payload.active) {
            mode = 'add';
          } else if (!action.payload.active) {
            mode = 'remove';
          }
        } else {
          if (draftState.preferredOverlayLayers.includes(action.payload.layerName)) {
            // it was present, remove it
            mode = 'remove';
          } else {
            // not present, add it
            mode = 'add';
          }
        }

        if (mode === 'add') {
          if (!draftState.preferredOverlayLayers.includes(action.payload.layerName)) {
            draftState.preferredOverlayLayers.push(action.payload.layerName);
          }
        } else if (mode === 'remove') {
          if (draftState.preferredOverlayLayers.includes(action.payload.layerName)) {
            draftState.preferredOverlayLayers.splice(
              draftState.preferredOverlayLayers.indexOf(action.payload.layerName),
              1
            );
          }
        }
      } else if (UserSettings.RecordSet.add.match(action) || PlanMyTrip.Recordset.create.match(action)) {
        draftState.recordSets[action.payload.id] ??= action.payload;
      } else if (UserSettings.SiteLists.createRecordsetsFromSiteList.match(action)) {
        const { activityIds, iappIds, name } = action.payload;
        if (activityIds.length > 0) {
          const activityRecord = UserSettings.RecordSet.createDefaultRecordset(RecordSetType.Activity);
          activityRecord.ids_to_filter = activityIds;
          activityRecord.recordSetName = `${name} - Activity`;
          draftState.recordSets[activityRecord.id] = activityRecord;
        }
        if (iappIds.length > 0) {
          const iappRecord = UserSettings.RecordSet.createDefaultRecordset(RecordSetType.IAPP);
          iappRecord.recordSetName = `${name} - IAPP`;
          iappRecord.ids_to_filter = iappIds;
          draftState.recordSets[iappRecord.id] = iappRecord;
        }
      } else if (UserSettings.RecordSet.requestRemoval.fulfilled.match(action)) {
        delete draftState.recordSets[action.payload];
      } else if (UserSettings.RecordSet.set.match(action)) {
        Object.keys(action.payload.updatedSet).forEach((key) => {
          draftState.recordSets[action.payload.setName][key] = action.payload.updatedSet[key];
        });
      } else if (UserSettings.RecordSet.updateFilter.match(action)) {
        const { setID, filterType, filterID, geojson } = action.payload;
        const recordSet = draftState.recordSets[setID];
        const tableFilter = recordSet?.tableFilters.find((filter) => filter.id === filterID);
        if (!tableFilter) return;

        Object.keys(action.payload).forEach((key) => {
          if (tableFilter[key] != undefined) {
            tableFilter[key] = action.payload[key];
          }
        });
        if (filterType === EFilterType.Drawn) {
          tableFilter.field = '';
          tableFilter.operator ??= 'CONTAINED IN';
          tableFilter.filter ??= '';
          tableFilter.geojson = geojson;
        }
      } else if (UserSettings.RecordSet.removeFilter.match(action)) {
        const { setID, filterID } = action.payload;
        const index = draftState.recordSets[setID]?.tableFilters.findIndex((filter) => filter.id === filterID);
        draftState.recordSets[action.payload.setID]?.tableFilters.splice(index, 1);
      } else if (UserSettings.RecordSet.updateTableFiltersHash.match(action)) {
        const { setID, tableFiltersHash } = action.payload;
        draftState.recordSets[setID].tableFiltersPreviousHash = draftState.recordSets[setID].tableFiltersHash;
        draftState.recordSets[setID].tableFiltersHash = tableFiltersHash;
      } else if (UserSettings.RecordSet.toggleRecordColumn.match(action)) {
        const { recordType, key } = action.payload;
        const index = draftState.tableColumns[recordType].findIndex((item) => item.key === key);
        draftState.tableColumns[recordType][index].hide = !draftState.tableColumns[recordType][index].hide;
        draftState.tableColumns[recordType] = [...draftState.tableColumns[recordType]];
      } else if (UserSettings.RecordSet.toggleAllRecordColumns.match(action)) {
        const { recordType, hide } = action.payload;
        draftState.tableColumns[recordType] = draftState.tableColumns[recordType].map((row) => {
          row.hide = hide;
          return row;
        });
      } else if (UserSettings.toggleLayerPickerAccordion.match(action)) {
        draftState.layerPickerIsAccordion = !draftState.layerPickerIsAccordion;
      } else if (WhatsHere.toggle.match(action)) {
        draftState.recordsExpanded = action.payload ? false : draftState.recordsExpanded;
      } else if (RecordCache.requestCaching.pending.match(action)) {
        draftState.recordSets[action.meta.arg.setId].cacheMetadataStatus = UserRecordCacheStatus.QUEUED;
      } else if (RecordCache.startDownload.match(action)) {
        draftState.recordSets[action.payload].cacheMetadataStatus = UserRecordCacheStatus.DOWNLOADING;
      } else if (
        RecordCache.requestCaching.rejected.match(action) ||
        RecordCache.deleteCache.rejected.match(action) ||
        RecordCache.pauseDownload.rejected.match(action)
      ) {
        draftState.recordSets[action.meta.arg.setId].cacheMetadataStatus = UserRecordCacheStatus.ERROR;
      } else if (RecordCache.requestCaching.fulfilled.match(action)) {
        draftState.recordSets[action.meta.arg.setId].cacheMetadataStatus = action.payload.status;
      } else if (RecordCache.deleteCache.pending.match(action) || RecordCache.stopDownload.pending.match(action)) {
        draftState.recordSets[action.meta.arg.setId].cacheMetadataStatus = UserRecordCacheStatus.DELETING;
      } else if (RecordCache.deleteCache.fulfilled.match(action)) {
        draftState.recordSets[action.meta.arg.setId].cacheMetadataStatus = UserRecordCacheStatus.NOT_CACHED;
        draftState.recordSets[action.meta.arg.setId].cacheDownloadProgress = {
          setId: '',
          message: '',
          downloadMode: CacheDownloadMode.DEFAULT,
          pausedActivityIdx: -1,
          normalizedProgress: 0,
          totalActivities: 0,
          processedActivities: 0
        };
      } else if (RecordCache.pauseDownload.pending.match(action)) {
        draftState.recordSets[action.meta.arg.setId].cacheMetadataStatus = UserRecordCacheStatus.PAUSED;
      } else if (RecordCache.downloadProgressEvent.match(action)) {
        if (action.payload.normalizedProgress == 1 || action.payload.downloadMode === CacheDownloadMode.ABORT) {
          draftState.recordSets[action.payload.setId].cacheDownloadProgress = {
            setId: '',
            message: '',
            downloadMode: CacheDownloadMode.DEFAULT,
            pausedActivityIdx: -1,
            normalizedProgress: 0,
            totalActivities: 0,
            processedActivities: 0
          };
        } else {
          draftState.recordSets[action.payload.setId].cacheDownloadProgress = action.payload;
        }
      } else if (Activity.deleteSuccess.match(action)) {
        draftState.activeActivity = null;
        draftState.activeActivityDescription = null;
      } else if (Activity.get.match(action)) {
        draftState.activeActivity = action.payload;
      } else if (IappActions.getSuccess.match(action)) {
        draftState.activeIAPP = action.payload?.iapp?.site_id;
      } else if (
        Activity.Offline.getIdsForRecordsetSuccess.match(action) ||
        WhatsHere.getIdsForRecordsetSuccess.match(action)
      ) {
        const { recordSetID, idList } = action.payload;
        draftState.recordSets[recordSetID].idList = idList;
      } else if (UserSettings.RecordSet.addFilter.match(action)) {
        const { filterType, setID, field, operator, operator2, filter, hidden } = action.payload;
        draftState.recordSets[setID].tableFilters ??= [];
        draftState.recordSets[setID]?.tableFilters.push({
          id: nanoid(),
          field: field ?? '',
          filterType: filterType!,
          operator: operator ?? 'CONTAINS',
          operator2: operator2 ?? 'AND',
          filter: filter ?? '',
          hidden
        });
      } else if (UserSettings.RecordSet.clearFilters.match(action)) {
        if (action.payload.setID === RecordSetId.Drafts) {
          draftState.recordSets[action.payload.setID].tableFilters = [
            {
              id: '1',
              field: 'form_status',
              filterType: EFilterType.Table,
              filter: 'Draft',
              operator: 'CONTAINS',
              operator2: 'AND',
              hidden: true
            }
          ];
        } else {
          draftState.recordSets[action.payload.setID].tableFilters = [];
        }
        // clear sort:
        delete draftState.recordSets[action.payload.setID].sortOrder;
        delete draftState.recordSets[action.payload.setID].sortColumn;
      } else if (APIDocs.set.match(action)) {
        draftState.apiDocsWithViewOptions = action.payload.apiDocsWithViewOptions;
        draftState.apiDocsWithSelectOptions = action.payload.apiDocsWithSelectOptions;
      } else if (APIDocs.load.match(action)) {
        const found = draftState.offlineDocs.find((o) => o.displayName === action.payload.displayName);
        if (found) {
          draftState.apiDocsWithSelectOptions = found.apiDocsWithSelectOptions;
          draftState.apiDocsWithViewOptions = found.apiDocsWithViewOptions;
        }
      } else if (APIDocs.save.match(action)) {
        const found = draftState.offlineDocs.find((o) => o.displayName === action.payload.displayName);
        if (draftState.apiDocsWithViewOptions && draftState.apiDocsWithSelectOptions) {
          if (found) {
            found.apiDocsWithViewOptions = draftState.apiDocsWithViewOptions;
            found.apiDocsWithSelectOptions = draftState.apiDocsWithSelectOptions;
          } else {
            draftState.offlineDocs.push({
              apiDocsWithViewOptions: draftState.apiDocsWithViewOptions,
              apiDocsWithSelectOptions: draftState.apiDocsWithSelectOptions,
              displayName: action.payload.displayName
            });
          }
        }
      } else if (APIDocs.forgetSaved.match(action)) {
        const foundIndex = draftState.offlineDocs.findIndex((o) => o.displayName === action.payload.displayName);
        if (foundIndex != -1) {
          draftState.offlineDocs.splice(foundIndex, 1);
        }
      } else if (Activity.copySuccess.match(action)) {
        draftState.newRecordDialogueState = {
          open: true,
          viewLayout: 'duplicate'
        };
      } else if (UserSettings.openNewRecordDialogue.match(action)) {
        draftState.newRecordDialogueState = { open: true, viewLayout: 'new' };
      } else if (UserSettings.closeNewRecordDialogue.match(action) || FormActions.createNewForm.match(action)) {
        draftState.newRecordDialogueState.open = false;
      } else if (UserSettings.RecordSet.setSort.match(action)) {
        // if the sort column is the same as the current sort column, toggle the sort order
        // if its already desc, remove the sort column and order
        const currRecordset = draftState.recordSets?.[action.payload.setID];

        if (!currRecordset?.sortOrder || currRecordset?.sortColumn !== action.payload.sortColumn) {
          // handle no sort order:
          draftState.recordSets[action.payload.setID].sortOrder = 'ASC';
          draftState.recordSets[action.payload.setID].sortColumn = action.payload.sortColumn;
        } else if (currRecordset?.sortOrder === 'ASC' && currRecordset?.sortColumn === action.payload.sortColumn) {
          // handle toggle to desc:
          draftState.recordSets[action.payload.setID].sortOrder = 'DESC';
        } else {
          // handle toggle off:
          delete draftState.recordSets[action.payload.setID].sortOrder;
          delete draftState.recordSets[action.payload.setID].sortColumn;
        }
      }
    }) as unknown as UserSettingsState;
  };
}

const selectUserSettings: (state) => UserSettingsState = (state) => state.UserSettings;

export { createUserSettingsReducer, selectUserSettings };
export type { UserSettingsState };

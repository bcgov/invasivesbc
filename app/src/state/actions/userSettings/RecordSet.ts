import { createAction, createAsyncThunk, nanoid } from '@reduxjs/toolkit';
import RecordCache from '../cache/RecordCache';
import { RECORD_COLOURS } from 'constants/colors';
import { RecordSetType, UserRecordCacheStatus, UserRecordSet } from 'interfaces/UserRecordSet';
import { MOBILE } from 'state/build-time-config';
import { RootState } from 'state/reducers/rootReducer';
import { RecordCacheServiceFactory } from 'utils/record-cache/context';
import { CacheDownloadMode } from 'utils/record-cache';

export interface IUpdateFilter extends Partial<IFilter> {
  setID: string | number;
  filterID: string | number;
}

export interface IRemoveFilter {
  filterType: string;
  setID: string | number;
  filterID: string | number;
}
export interface IFilter {
  id: string;
  field: string;
  filterType: string;
  filter: string;
  operator: string;
  operator2: string;
}
export interface IAddFilter extends Partial<IFilter> {
  setID: string | number;
}
class RecordSet {
  private static readonly PREFIX = `UserSettings/RecordSet`;

  static readonly add = createAction(`${this.PREFIX}/add`, (type: RecordSetType) => ({
    payload: this.createDefaultRecordset(type)
  }));
  static readonly remove = createAction<string>(`${this.PREFIX}/remove`);
  static readonly set = createAction(
    `${this.PREFIX}/set`,
    <K extends keyof UserRecordSet>(updatedSet: Partial<Record<K, UserRecordSet[K]>>, setName: string) => ({
      payload: {
        updatedSet,
        setName
      }
    })
  );
  static readonly setSelected = createAction<string | null>(`${this.PREFIX}/setSelected`);
  static readonly cycleColourById = createAction<string>(`${this.PREFIX}/rotateColour`);
  static readonly toggleVisibility = createAction<string>(`${this.PREFIX}/toggleVisibility`);
  static readonly toggleLabelVisibility = createAction<string>(`${this.PREFIX}/toggleLabelVisibility`);

  static readonly syncCacheStatusWithCacheService = createAsyncThunk(
    `${this.PREFIX}/syncCacheStatusWithCacheService`,
    async () => {
      const service = await RecordCacheServiceFactory.getPlatformInstance();
      if (!service) {
        throw Error('no record cache service is available');
      }

      const cachedSets = await service.listRepositories();

      // these will be passed to the reducer, which can then mark the record sets as cached
      return cachedSets.map((set) => {
        return { setId: set.setId };
      });
    }
  );

  static readonly requestRemoval = createAsyncThunk(
    `${this.PREFIX}/requestRemoval`,
    async (spec: { setId: string }, thunkAPI) => {
      const state = thunkAPI.getState() as RootState;
      const { recordSets } = state.UserSettings;
      if (
        MOBILE &&
        [UserRecordCacheStatus.CACHED, UserRecordCacheStatus.DOWNLOADING, UserRecordCacheStatus.QUEUED].includes(
          recordSets[spec.setId].cacheMetadataStatus
        )
      ) {
        const deletionResult = await thunkAPI.dispatch(RecordCache.deleteCache(spec));
        if (RecordCache.deleteCache.rejected.match(deletionResult)) {
          throw Error('Cache failed to delete');
        }
      }
      return spec.setId;
    }
  );

  static readonly addFilter = createAction<IAddFilter>(`${this.PREFIX}/addFilter`);
  static readonly clearFilters = createAction<{ setID: number | string }>(`${this.PREFIX}/clearFilters`);
  static readonly updateFilter = createAction<IUpdateFilter>(`${this.PREFIX}/updateFilter`);
  static readonly removeFilter = createAction<IRemoveFilter>(`${this.PREFIX}/removeFilter`);
  static readonly hideFilters = createAction(`${this.PREFIX}/hideFilters`);

  private static readonly createDefaultRecordset = (type: RecordSetType): UserRecordSet => ({
    tableFilters: [],
    id: nanoid(),
    color: RECORD_COLOURS[0],
    drawOrder: 0,
    expanded: false,
    isSelected: false,
    mapToggle: false,
    recordSetName: '',
    recordSetType: type,
    labelToggle: false,
    searchBoundary: {
      geos: [],
      id: 0,
      name: '',
      server_id: 0
    },
    cacheMetadataStatus: UserRecordCacheStatus.NOT_CACHED,
    cacheDownloadProgress: {
      setId: '',
      message: '',
      downloadMode: CacheDownloadMode.DEFAULT,
      pausedActivityIdx: -1,
      normalizedProgress: 0,
      totalActivities: 0,
      processedActivities: 0
    }
  });
}

export default RecordSet;

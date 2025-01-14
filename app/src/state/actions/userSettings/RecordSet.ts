import { createAction, createAsyncThunk, nanoid } from '@reduxjs/toolkit';
import { RECORD_COLOURS } from 'constants/colors';
import { RecordSetType, UserRecordCacheStatus, UserRecordSet } from 'interfaces/UserRecordSet';
import { MOBILE } from 'state/build-time-config';
import { RootState } from 'state/reducers/rootReducer';
import { RecordCacheServiceFactory } from 'utils/record-cache/context';
import RecordCache from '../cache/RecordCache';

export interface IUpdateFilter {
  setID: string | number;
  filterID: string | number;
  field?: string;
  filterType?: string;
  filter?: string;
  operator?: string;
  operator2?: string;
}

export interface IRemoveFilter {
  filterType: string;
  setID: string | number;
  filterID: string | number;
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
        [UserRecordCacheStatus.CACHED, UserRecordCacheStatus.DOWNLOADING].includes(
          recordSets[spec.setId]?.cacheMetadata?.status
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

  static readonly updateFilter = createAction<IUpdateFilter>(`${this.PREFIX}/updateFilter`);
  static readonly removeFilter = createAction<IRemoveFilter>(`${this.PREFIX}/removeFilter`);

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
    cacheMetadata: {
      status: UserRecordCacheStatus.NOT_CACHED
    }
  });
}

export default RecordSet;

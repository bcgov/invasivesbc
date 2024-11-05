import { createAction, createAsyncThunk, nanoid } from '@reduxjs/toolkit';
import { RECORD_COLOURS } from 'constants/colors';
import Boundary from 'interfaces/Boundary';
import { RecordSetType, UserRecordCacheStatus, UserRecordSet } from 'interfaces/UserRecordSet';
import { INewRecordDialogState } from 'UI/Overlay/Records/NewRecordDialog';
import { RecordCacheServiceFactory } from 'utils/record-cache/context';

class Boundaries {
  private static readonly PREFIX = `UserSettings/Boundaries`;

  static readonly set = createAction(`${this.PREFIX}/set`);
  static readonly setSuccess = createAction<Boundary[]>(`${this.PREFIX}/setSuccess`);
  static readonly setFailure = createAction(`${this.PREFIX}/setFailure`);
  static readonly delete = createAction(`${this.PREFIX}/delete`);
  static readonly deleteSuccess = createAction<Boundary>(`${this.PREFIX}/deleteSuccess`);
  static readonly addToSet = createAction<RecordSet>(`${this.PREFIX}/addToSet`);
  static readonly addToSetSuccess = createAction<{ [key: string]: RecordSet }>(`${this.PREFIX}/addToSetSuccess`);
  static readonly addToSetFailure = createAction(`${this.PREFIX}/addToSetFailure`);
  static readonly removeFromSet = createAction(`${this.PREFIX}/removeFromSet`);
  static readonly removeFromSetSuccess = createAction<{ [key: string]: RecordSet }>(
    `${this.PREFIX}/removeFromSetSuccess`
  );
  static readonly removeFromSetFailure = createAction(`${this.PREFIX}/removeFromSetFailure`);
}

class KML {
  private static readonly PREFIX = `UserSettings/Kml`;

  static readonly delete = createAction<string>(`${this.PREFIX}/delete`);
  static readonly deleteSuccess = createAction<string>(`${this.PREFIX}/deleteSuccess`);
  static readonly deleteFailure = createAction<string>(`${this.PREFIX}/deleteFailure`);
}

class InitState {
  private static readonly PREFIX = `UserSettings/InitState`;

  static readonly get = createAction(`${this.PREFIX}/get`);
  static readonly getSuccess = createAction(`${this.PREFIX}/getSuccess`, (recordSets: UserRecordSet) => ({
    payload: {
      recordSets
    }
  }));
}

class IAPP {
  private static readonly PREFIX = `UserSettings/IAPP`;

  static readonly setActive = createAction<string>(`${this.PREFIX}/setActive`);
  static readonly setActiveSuccess = createAction<string | null>(`${this.PREFIX}/setActiveSuccess`);
}

class Activity {
  private static readonly PREFIX = 'UserSettings/Activity';

  static readonly setActiveActivityId = createAction<string>(`${this.PREFIX}/setActiveActivityId`);
  static readonly setActiveActivityIdSuccess = createAction<string>(`${this.PREFIX}/setActiveActivityIdSuccess`);
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

      const cachedSets = await service.listCachedSets();

      // these will be passed to the reducer, which can then mark the record sets as cached
      return cachedSets.map((set) => {
        return { setId: set.setId };
      });
    }
  );

  private static readonly createDefaultRecordset = (type: RecordSetType): UserRecordSet => ({
    tableFilters: null,
    id: nanoid(),
    color: RECORD_COLOURS[0],
    drawOrder: 0,
    expanded: false,
    isSelected: false,
    mapToggle: false,
    recordSetName: `New Recordset - ` + type,
    recordSetType: type,
    labelToggle: false,
    searchBoundary: {
      geos: [],
      id: 0,
      name: ``,
      server_id: 0
    },
    cacheMetadata: {
      status: type == 'Activity' ? UserRecordCacheStatus.NOT_CACHED : UserRecordCacheStatus.NOT_ELIGIBLE
    }
  });
}

class Map {
  private static readonly PREFIX = `UserSettings/Map`;

  static readonly setCenter = createAction<number[]>(`${this.PREFIX}/setCenter`);
  static readonly setCenterSuccess = createAction<number[]>(`${this.PREFIX}/setCenterSuccess`);
  static readonly setCenterFailure = createAction(`${this.PREFIX}/setCenterFailure`);
}

class UserSettings {
  private static readonly PREFIX = `UserSettings`;

  static readonly Boundaries = Boundaries;
  static readonly KML = KML;
  static readonly InitState = InitState;
  static readonly IAPP = IAPP;
  static readonly Activity = Activity;
  static readonly RecordSet = RecordSet;
  static readonly Map = Map;
  static readonly toggleRecordExpand = createAction(`${this.PREFIX}/toggleRecordExpand`);
  static readonly toggleRecordExpandSuccess = createAction(`${this.PREFIX}/toggleRecordExpandSuccess`);
  static readonly setNewRecordDialogueState = createAction<INewRecordDialogState>(
    `${this.PREFIX}/setNewRecordDialogueState`
  );
  static readonly setNewRecordDialogueStateSuccess = createAction<INewRecordDialogState>(
    `${this.PREFIX}/setNewRecordDialogueStateSuccess`
  );
  static readonly toggleLayerPickerAccordion = createAction(`${this.PREFIX}/toggleLayerPickerAccordion`);
}

export default UserSettings;

import { createAction } from '@reduxjs/toolkit';
import { Feature, GeoJSON } from 'geojson';
import RecordSet from './RecordSet';
import Boundary from 'interfaces/Boundary';
import { RecordSetType, UserRecordSet } from 'interfaces/UserRecordSet';
import { MapRecordsetLayerFilterCategory } from 'state/reducers/map';

interface IHoverRecordset {
  recordType: RecordSetType;
  id: string | number;
  geom?: GeoJSON;
  quickPan?: boolean; // Map should pan to this site when update occurs
  readableIdentifier?: string; // Readable ID Format. e.g. Short ID or Site ID
}

interface IMarkLocation {
  feature: Feature;
  readableIdentifier?: string;
}

interface ICreateRecordsetsFromSiteList {
  activityIds: Array<string>;
  iappIds: Array<string>;
  name: string;
}

class Boundaries {
  private static readonly PREFIX = `UserSettings/Boundaries`;

  static readonly set = createAction(`${this.PREFIX}/set`);
  static readonly setSuccess = createAction<Boundary[]>(`${this.PREFIX}/setSuccess`);
  static readonly setFailure = createAction(`${this.PREFIX}/setFailure`);
  static readonly delete = createAction(`${this.PREFIX}/delete`);
  static readonly deleteSuccess = createAction<Boundary>(`${this.PREFIX}/deleteSuccess`);
  static readonly addToSet = createAction<RecordSet>(`${this.PREFIX}/addToSet`);
  static readonly addToSetSuccess = createAction<{ [key: PropertyKey]: UserRecordSet }>(
    `${this.PREFIX}/addToSetSuccess`
  );
  static readonly addToSetFailure = createAction(`${this.PREFIX}/addToSetFailure`);
  static readonly removeFromSet = createAction(`${this.PREFIX}/removeFromSet`);
  static readonly removeFromSetSuccess = createAction<{ [key: PropertyKey]: UserRecordSet }>(
    `${this.PREFIX}/removeFromSetSuccess`
  );
  static readonly removeFromSetFailure = createAction(`${this.PREFIX}/removeFromSetFailure`);

  static readonly drawCustomLayer = createAction<Feature>(`${this.PREFIX}/drawCustomLayer`);
  static readonly drawCustomLayerRequest = createAction<string>(`${this.PREFIX}/drawCustomLayerRequest`);
  static readonly removeCustomLayer = createAction<string>(`${this.PREFIX}/removeCustomLayer`);
  static readonly toggleCustomLayer = createAction(`${this.PREFIX}/toggleCustomLayer`, (id: string, on?: boolean) => ({
    payload: { id, on }
  }));
}

class KML {
  private static readonly PREFIX = `UserSettings/Kml`;

  static readonly delete = createAction<string>(`${this.PREFIX}/delete`);
  static readonly deleteSuccess = createAction<string>(`${this.PREFIX}/deleteSuccess`);
  static readonly deleteFailure = createAction<string>(`${this.PREFIX}/deleteFailure`);
  static readonly toggle = createAction(`${this.PREFIX}/toggle`, (id: string, on?: boolean) => ({
    payload: { id, on }
  }));
}

class InitState {
  private static readonly PREFIX = `UserSettings/InitState`;

  static readonly get = createAction<{ offlineAPIDocsDisplayName?: string } | undefined>(`${this.PREFIX}/get`);
  static readonly getSuccess = createAction(
    `${this.PREFIX}/getSuccess`,
    (recordSets: { [key: PropertyKey]: UserRecordSet }) => ({
      payload: {
        recordSets
      }
    })
  );
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

class Map {
  private static readonly PREFIX = `UserSettings/Map`;

  static readonly setPreferredBasemap = createAction<string>(`${this.PREFIX}/setPreferredBasemap`);
  static readonly setPreferredOverlayLayers = createAction<string[]>(`${this.PREFIX}/setPreferredOverlayLayers`);
  static readonly addPreferredOverlayLayer = createAction<string>(`${this.PREFIX}/addPreferredOverlayLayer`);
  static readonly removePreferredOverlayLayer = createAction<string>(`${this.PREFIX}/removePreferredOverlayLayer`);
  static readonly togglePreferredOverlayLayer = createAction<{
    layerName: string;
    active?: boolean;
  }>(`${this.PREFIX}/togglePreferredOverlayLayer`);

  static readonly setCenter = createAction<number[]>(`${this.PREFIX}/setCenter`);
  static readonly setCenterSuccess = createAction<number[]>(`${this.PREFIX}/setCenterSuccess`);

  static readonly setHoveredRecordset = createAction<IHoverRecordset>(`${this.PREFIX}/setHoveredRecordset`);
  static readonly markCoordinate = createAction<IMarkLocation>(`${this.PREFIX}/markCoordinate`);
  static readonly toggleGlobalMapFilter = createAction<MapRecordsetLayerFilterCategory>(
    `${this.PREFIX}/toggleGlobalMapFilter`
  );
}

class SiteLists {
  private static readonly PREFIX = 'UserSettings/SiteLists';

  static readonly createRecordsetsFromSiteList = createAction<ICreateRecordsetsFromSiteList>(
    `${this.PREFIX}/createRecordsetsFromSiteList`
  );
}

class UserSettings {
  private static readonly PREFIX = `UserSettings`;
  static readonly Activity = Activity;
  static readonly Boundaries = Boundaries;
  static readonly IAPP = IAPP;
  static readonly InitState = InitState;
  static readonly KML = KML;
  static readonly Map = Map;
  static readonly RecordSet = RecordSet;
  static readonly SiteLists = SiteLists;
  static readonly toggleRecordExpand = createAction(`${this.PREFIX}/toggleRecordExpand`);
  static readonly toggleRecordExpandSuccess = createAction(`${this.PREFIX}/toggleRecordExpandSuccess`);
  static readonly toggleLayerPickerAccordion = createAction(`${this.PREFIX}/toggleLayerPickerAccordion`);
  static readonly openNewRecordDialogue = createAction(`${this.PREFIX}/openNewRecordDialog`);
  static readonly closeNewRecordDialogue = createAction(`${this.PREFIX}/closeNewRecordDialog`);
}

export default UserSettings;

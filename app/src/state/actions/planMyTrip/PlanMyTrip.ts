import { createAction, createAsyncThunk, nanoid } from '@reduxjs/toolkit';
import { Feature, GeoJSON } from 'geojson';
import { EFilterType } from 'state/actions/userSettings/RecordSet';
import UserSettings from 'state/actions/userSettings/UserSettings';
import RecordCache from 'state/actions/cache/RecordCache';
import TileCache from 'state/actions/cache/TileCache';
import WellCache from 'state/actions/cache/WellCache';
import { RootState } from 'state/reducers/rootReducer';
import { RepositoryBoundingBoxSpec } from 'utils/tile-cache';
import { PlanMyTripCacheServiceFactory } from 'utils/plan-my-trip-cache/context';
import { IPlanMyTripCacheStatus, IPlanMyTripCacheStatuses } from 'utils/plan-my-trip-cache';
import { RecordSetType } from 'interfaces/UserRecordSet';

/**
 * @desc Parameters for a user planning their trip
 * @property { boolean } [ activities ] include download for Activity records
 * @property { boolean } [ iapp ] include download for IAPP records
 * @property { string } name non-unique user friendly identifier
 * @property { boolean } [ wellData ] include Well Data for area.
 * @property { boolean } [ wmsLayers ] include currently toggled WMS layers in dataset.
 * @property { number } [ zoom ] Zoom level for caching Map tile data
 */
interface ICreateMyTrip {
  activities?: boolean;
  iapp?: boolean;
  name: string;
  zoom?: number;
  wellData?: boolean;
  wmsLayers?: boolean;
}

/**
 * @property { keyof IPlanMyTripCacheStatuses } cache subcache being modified.
 * @property { string } id Trip's Identifier
 */
interface IModifySubCache {
  cache: keyof IPlanMyTripCacheStatuses;
  id: string;
}

class PmtRecordset {
  private static readonly PREFIX = 'PlanMyTrip/PmtRecordset';
  public static readonly IAPP_PRE = 'iapp-'; // Prefix for IAPP Recordsets
  public static readonly ACTIVITY_PRE = 'act-'; // Prefix for Activity Recordsets

  /**
   * @desc Creates a new recordset with ID matching the created Trip, applies spatial Filter matching Trip
   *
   *  ### IMPORTANT ###
   *     - Since IAPP and activity records share a parent object, Ids are prepended with their record type.
   *     - The end of the 'create' Lifecycle starts the 'download' lifecycle
   *       The workflow was required due to the order of operations
   *            - Create the new recordset with shape filter applied
   *            - Request list of IDs matching parameters from API
   *            - Begin download of recordset now that Ids are populated
   */
  public static readonly create = createAction(
    `${this.PREFIX}/create`,
    (spec: { tripId: string; recordSetType: RecordSetType; recordName: string; geojson: GeoJSON }) => {
      const newRecordId = (() => {
        if (spec.recordSetType === RecordSetType.Activity) {
          return this.ACTIVITY_PRE + spec.tripId;
        } else if (spec.recordSetType === RecordSetType.IAPP) {
          return this.IAPP_PRE + spec.tripId;
        }
        return '';
      })();
      const recordset = UserSettings.RecordSet.createDefaultRecordset(spec.recordSetType, newRecordId);

      recordset.recordSetName = `${spec.recordName} - ${spec.recordSetType}`;
      // Set the initial TableFilter to contain the shape used when creating the Trip.
      recordset.tableFilters = [
        {
          id: spec.tripId,
          field: '',
          filterType: EFilterType.Drawn,
          geojson: {
            id: spec.tripId,
            type: 'Feature',
            properties: {
              description: spec.recordName
            },
            geometry: spec.geojson
          } as Feature,
          operator: 'CONTAINS',
          operator2: 'AND',
          filter: spec.tripId
        }
      ];
      return { payload: recordset };
    }
  );

  /**
   * @desc Starts Download for Recordset, updates Trips cache status at completion of thunk
   */
  public static readonly download = createAsyncThunk(`${this.PREFIX}/download`, async (setId: string, { dispatch }) => {
    const tripId = setId.replace(this.ACTIVITY_PRE, '').replace(this.IAPP_PRE, '');
    const cache: keyof IPlanMyTripCacheStatuses = (() => {
      if (setId.startsWith(this.IAPP_PRE)) {
        return 'iappRecordset';
      }
      return 'activityRecordset';
    })();

    await PlanMyTrip.setSubcacheStatus(tripId, cache, IPlanMyTripCacheStatus.IN_PROGRESS);
    const response = await dispatch(RecordCache.requestCaching({ setId }));
    const newStatus = PlanMyTrip.convertActionToCacheStatus(response?.meta?.requestStatus, 'add');
    await PlanMyTrip.setSubcacheStatus(tripId, cache, newStatus);
  });

  /**
   * @desc Clears Cache for Recordset from storage, updates Trip data,
   */
  public static readonly delete = createAsyncThunk(
    `${this.PREFIX}/delete`,
    async (spec: { setId: string; tripId: string }, { dispatch, getState }) => {
      const setType: keyof IPlanMyTripCacheStatuses = (() => {
        if (spec.setId.startsWith(this.ACTIVITY_PRE)) {
          return 'activityRecordset';
        }
        return 'iappRecordset';
      })();
      const currState = getState() as RootState;
      // Check record exists (User may have manually deleted this at earlier point)
      if (!currState.UserSettings.recordSets?.[spec.setId]) return;

      await PlanMyTrip.setSubcacheStatus(spec.tripId, setType, IPlanMyTripCacheStatus.DELETING);
      const response = await dispatch(RecordCache.deleteCache({ setId: spec.setId }));
      const newStatus = PlanMyTrip.convertActionToCacheStatus(response?.meta?.requestStatus, 'remove');
      await PlanMyTrip.setSubcacheStatus(spec.tripId, setType, newStatus);
      if (newStatus === IPlanMyTripCacheStatus.NOT_CACHED) {
        dispatch(UserSettings.RecordSet.requestRemoval({ setId: spec.setId }));
      }
    }
  );
}

class PmtWells {
  private static readonly PREFIX = 'PlanMyTrip/PmtWellData';
  /**
   * @desc Starts Download Request for SubCache
   */
  public static readonly download = createAsyncThunk(
    `${this.PREFIX}/download`,
    async (spec: { tripId: string; bounds: RepositoryBoundingBoxSpec }, { dispatch }) => {
      await PlanMyTrip.setSubcacheStatus(spec.tripId, 'wellData', IPlanMyTripCacheStatus.IN_PROGRESS);
      const response = await dispatch(WellCache.requestCaching({ id: spec.tripId, bounds: spec.bounds }));
      const newStatus = PlanMyTrip.convertActionToCacheStatus(response?.meta?.requestStatus, 'add');
      await PlanMyTrip.setSubcacheStatus(spec.tripId, 'wellData', newStatus);
    }
  );

  public static readonly delete = createAsyncThunk(`${this.PREFIX}/delete`, async (tripId: string, { dispatch }) => {
    await PlanMyTrip.setSubcacheStatus(tripId, 'wellData', IPlanMyTripCacheStatus.DELETING);
    const response = await dispatch(WellCache.deleteRepository(tripId));
    const newStatus = PlanMyTrip.convertActionToCacheStatus(response?.meta?.requestStatus, 'remove');
    await PlanMyTrip.setSubcacheStatus(tripId, 'wellData', newStatus);
  });
}
class PmtMaps {
  private static readonly PREFIX = 'PlanMyTrip/PmtMaps';

  /**
   * @desc DRY Handler for Starting a Map Tile Download
   */
  public static readonly download = createAsyncThunk(
    `${this.PREFIX}/download`,
    async (
      spec: {
        description: string;
        id: string;
        bounds: RepositoryBoundingBoxSpec;
        maxZoom: number;
      },
      { dispatch }
    ) => {
      await PlanMyTrip.setSubcacheStatus(spec.id, 'mapTiles', IPlanMyTripCacheStatus.IN_PROGRESS);
      const response = await dispatch(
        TileCache.requestCaching({
          description: spec.description,
          id: spec.id,
          bounds: spec.bounds,
          maxZoom: spec.maxZoom
        })
      );
      const newStatus = PlanMyTrip.convertActionToCacheStatus(response?.meta?.requestStatus, 'add');
      await PlanMyTrip.setSubcacheStatus(spec.id, 'mapTiles', newStatus);
    }
  );

  public static readonly delete = createAsyncThunk(`${this.PREFIX}/delete`, async (setId: string, { dispatch }) => {
    await PlanMyTrip.setSubcacheStatus(setId, 'mapTiles', IPlanMyTripCacheStatus.IN_PROGRESS);
    const response = await dispatch(TileCache.deleteRepository(setId));
    const newStatus = PlanMyTrip.convertActionToCacheStatus(response?.meta?.requestStatus, 'remove');
    await PlanMyTrip.setSubcacheStatus(setId, 'mapTiles', newStatus);
  });
}

class PlanMyTrip {
  static readonly PREFIX = 'PlanMyTrip';
  static readonly ON_SUCCESS = 'fulfilled';
  static readonly TRIP_ID_PREFIX = 'pmt-';

  public static readonly Recordset = PmtRecordset;
  public static readonly Wells = PmtWells;
  public static readonly Maps = PmtMaps;

  /**
   * @desc Remove drawn shape from Redux state.
   */
  static readonly clearShape = createAction(`${this.PREFIX}/clearShape`);
  /**
   * @desc Set Currently Drawn shape to Redux state.
   */
  static readonly setShape = createAction<{ geometry: GeoJSON }>(`${this.PREFIX}/setShape`);

  /**
   * @desc Update Trips Cache status for a given subset of data
   * @param {string} trip ID of Trip.
   * @param {keyof IPlanMyTripCacheStatus } cache subcache being modified.
   * @param {IPlanMyTripCacheStatus} status New Status.
   */
  public static readonly setSubcacheStatus = async (
    trip: string,
    cache: keyof IPlanMyTripCacheStatuses,
    status: IPlanMyTripCacheStatus
  ) => {
    const service = await PlanMyTripCacheServiceFactory.getPlatformInstance();
    await service.updateSubCacheStatus(trip, cache, status);
  };

  /**
   * @desc Calls the caching mechanisms synchronously to avoid overloading our concurrent calls.
   *       Creates and uses a common ID to track all sub-caches during the delete.
   * @param { ICreateMyTrip } spec Trip details with boolean flags for datasets requested.
   */
  static readonly create = createAsyncThunk(
    `${this.PREFIX}/create`,
    async (spec: ICreateMyTrip, { dispatch, getState }) => {
      const state: RootState = getState() as RootState;
      const bounds = state.TileCache?.drawnShapeBounds;
      const geojson = state.PlanMyTrip?.drawnShape;
      if (!bounds || !geojson) {
        throw Error('Cannot create this trip - no shape data available.');
      }
      const tripId = `${this.TRIP_ID_PREFIX}${nanoid()}`;
      const service = await PlanMyTripCacheServiceFactory.getPlatformInstance();

      // Define initial cache statuses
      const getInitStatus = (condition: boolean) =>
        condition ? IPlanMyTripCacheStatus.IN_PROGRESS : IPlanMyTripCacheStatus.NOT_CACHED;

      // Init Repository
      await service.download({
        id: tripId,
        name: spec.name,
        zoomLevel: spec?.zoom,
        geojson: geojson,
        cacheStatuses: {
          mapTiles: getInitStatus(spec.zoom != undefined),
          wellData: getInitStatus(!!spec?.wellData),
          wmsLayer: getInitStatus(!!spec?.wmsLayers),
          iappRecordset: getInitStatus(!!spec?.iapp),
          activityRecordset: getInitStatus(!!spec?.activities)
        }
      });

      if (spec?.iapp) {
        dispatch(
          PlanMyTrip.Recordset.create({
            tripId: tripId,
            recordSetType: RecordSetType.IAPP,
            recordName: spec.name,
            geojson: geojson
          })
        );
      }
      if (spec?.activities) {
        dispatch(
          PlanMyTrip.Recordset.create({
            tripId: tripId,
            recordSetType: RecordSetType.Activity,
            recordName: spec.name,
            geojson: geojson
          })
        );
      }
      if (spec?.wellData) {
        await dispatch(PlanMyTrip.Wells.download({ bounds: bounds, tripId }));
      }
      if (spec?.zoom != undefined) {
        await dispatch(
          PlanMyTrip.Maps.download({
            description: spec.name,
            id: tripId,
            bounds: bounds,
            maxZoom: spec.zoom
          })
        );
      }
    }
  );

  public static readonly removeSubCache = createAsyncThunk(
    `${this.PREFIX}/removeSubCache`,
    async (spec: IModifySubCache, { dispatch }) => {
      const service = await PlanMyTripCacheServiceFactory.getPlatformInstance();
      const repo = await service.getRepository(spec.id);
      if (!repo || repo?.cacheStatuses[spec.cache] === IPlanMyTripCacheStatus.NOT_CACHED) return;
      switch (spec.cache) {
        case 'mapTiles':
          await dispatch(this.Maps.delete(spec.id));
          break;
        case 'wellData':
          await dispatch(this.Wells.delete(spec.id));
          break;
        case 'activityRecordset':
          await dispatch(this.Recordset.delete({ setId: PmtRecordset.ACTIVITY_PRE + spec.id, tripId: spec.id }));
          break;
        case 'iappRecordset':
          await dispatch(this.Recordset.delete({ setId: PmtRecordset.IAPP_PRE + spec.id, tripId: spec.id }));
      }
    }
  );

  /**
   * @desc Delete all subcaches for a trip. If operation is successful, delete the trip.
   */
  static readonly delete = createAsyncThunk(`${this.PREFIX}/delete`, async (id: string, { dispatch }) => {
    const subcaches: Array<keyof IPlanMyTripCacheStatuses> = [
      'activityRecordset',
      'iappRecordset',
      'mapTiles',
      'wellData',
      'wmsLayer'
    ];
    let deleteSucceeded = true;
    for (const cache of subcaches) {
      // run deletes synchronously to avoid transaction within transaction error (vs Promise.all)
      const res = await dispatch(this.removeSubCache({ id, cache }));
      if (res?.meta?.requestStatus !== 'fulfilled') {
        deleteSucceeded = false;
      }
    }
    if (deleteSucceeded) {
      const service = await PlanMyTripCacheServiceFactory.getPlatformInstance();
      await service.deleteRepository(id);
    }
  });

  /**
   * @desc Converts Redux state for thunk into action based on if addition or subtraction
   * @param { string } status New status
   * @param { string } diff addition or removal
   * @returns
   */
  public static readonly convertActionToCacheStatus = (
    status: 'fulfilled' | 'rejected' | null,
    diff: 'add' | 'remove'
  ): IPlanMyTripCacheStatus => {
    if (status === 'fulfilled' && diff === 'add') {
      return IPlanMyTripCacheStatus.CACHED;
    } else if (status === 'fulfilled' && diff === 'remove') {
      return IPlanMyTripCacheStatus.NOT_CACHED;
    }
    return IPlanMyTripCacheStatus.FAILED;
  };
}

export default PlanMyTrip;
export type { ICreateMyTrip, IModifySubCache };

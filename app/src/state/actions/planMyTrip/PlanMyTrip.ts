import { createAction, createAsyncThunk, nanoid } from '@reduxjs/toolkit';
import { Feature, GeoJSON } from 'geojson';
import { bbox, bboxPolygon } from '@turf/turf';
import { EFilterType } from 'state/actions/userSettings/RecordSet';
import UserSettings from 'state/actions/userSettings/UserSettings';
import RecordCache from 'state/actions/cache/RecordCache';
import WellCache from 'state/actions/cache/WellCache';
import { RootState } from 'state/reducers/rootReducer';
import { PlanMyTripCacheServiceFactory } from 'utils/plan-my-trip-cache/context';
import { IPlanMyTripCacheStatus, IPlanMyTripCacheStatuses } from 'utils/plan-my-trip-cache';
import { RecordSetType } from 'interfaces/UserRecordSet';
import Alerts from 'state/actions/alerts/Alerts';
import tripAlertMessages from 'constants/alerts/tripAlerts';
import OfflineProtomaps from 'state/actions/cache/OfflineProtomaps';

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

type tripIdentifier = string;

/**
 * @property { keyof IPlanMyTripCacheStatuses } cache subcache being modified.
 * @property { tripIdentifier } id Trip's Identifier
 */
interface IModifySubCache {
  cache: keyof IPlanMyTripCacheStatuses;
  id: tripIdentifier;
}

class PmtRecordset {
  public static readonly PREFIX = 'PlanMyTrip/PmtRecordset';
  public static readonly IAPP_PRE = 'iapp-'; // Prefix for IAPP Recordsets
  public static readonly ACTIVITY_PRE = 'act-'; // Prefix for Activity Recordsets

  /**
   * @desc Creates a new recordset with ID matching the created Trip, applies spatial Filter matching Trip
   *
   *  ### IMPORTANT ###
   *     - Since IAPP and activity records share a parent object (recordSets), Ids are prefixed with their record type.
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
  public static readonly download = createAsyncThunk(
    `${this.PREFIX}/download`,
    async (setId: string, { dispatch, getState, rejectWithValue }) => {
      const state = getState() as RootState;
      const recordsetIds = state.UserSettings.recordSets?.[setId]?.idList?.length;
      if (recordsetIds > 0) {
        await dispatch(RecordCache.requestCaching({ setId }));
      } else {
        dispatch(UserSettings.RecordSet.requestRemoval({ setId }));
        return rejectWithValue({ reason: IPlanMyTripCacheStatus.NO_DATA });
      }
    }
  );

  /**
   * @desc Clears Cache for Recordset from storage, updates Trip data,
   */
  public static readonly delete = createAsyncThunk(
    `${this.PREFIX}/delete`,
    async (spec: { setId: string; tripId: string }, { dispatch, getState }) => {
      const currState = getState() as RootState;
      // Check record exists (User may have manually deleted this at earlier point)
      if (!currState.UserSettings.recordSets?.[spec.setId]) return;

      const response = await dispatch(RecordCache.deleteCache({ setId: spec.setId }));
      if (response?.meta?.requestStatus === 'fulfilled') {
        dispatch(UserSettings.RecordSet.requestRemoval({ setId: spec.setId }));
      }
    }
  );
}

class PlanMyTrip {
  static readonly PREFIX = 'PlanMyTrip';
  static readonly ON_SUCCESS = 'fulfilled';
  static readonly TRIP_ID_PREFIX = 'pmt-';

  public static readonly Recordset = PmtRecordset;

  /** @desc Used to tell the map we are on a page where we might want to draw a rectangle*/
  public static readonly setPlanMyTripDrawMode = createAction<boolean>(`${this.PREFIX}/setPlanMyTripDrawMode`);

  /** @desc Update lastUpdate state forcing reload */
  public static readonly refresh = createAction(`${this.PREFIX}/refresh`);

  /** @desc Remove drawn shape from Redux state. */
  static readonly clearShape = createAction(`${this.PREFIX}/clearShape`);

  /** @desc Set Currently Drawn shape to Redux state. */
  static readonly setShape = createAction<{ geometry: GeoJSON }>(`${this.PREFIX}/setShape`);

  /**
   * @desc Calls the caching mechanisms synchronously to avoid overloading our concurrent calls.
   *       Creates and uses a common ID to track all sub-caches during the delete.
   * @param { ICreateMyTrip } spec Trip details with boolean flags for datasets requested.
   */
  static readonly create = createAsyncThunk(
    `${this.PREFIX}/create`,
    async (spec: ICreateMyTrip, { dispatch, getState }) => {
      const state: RootState = getState() as RootState;
      const geojson = state.PlanMyTrip?.drawnShape;
      if (!geojson) {
        throw Error('Cannot create this trip - no shape data available.');
      }
      const tripId: tripIdentifier = `${this.TRIP_ID_PREFIX}${nanoid()}`;
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
      dispatch(Alerts.create(tripAlertMessages.submitted));
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
      if (spec?.wellData && geojson) {
        dispatch(WellCache.requestCaching({ id: tripId, bounds: bbox(geojson) }));
      }
      if (spec?.zoom != undefined && geojson) {
        dispatch(
          OfflineProtomaps.mapGeneration({
            tripId: tripId,
            request: {
              trip_name: spec.name,
              maximum_zoom: spec.zoom,
              minimum_zoom: 0,
              bounds: bboxPolygon(bbox(geojson)).geometry
            }
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
      if (!repo) return;
      switch (spec.cache) {
        // @todo
        // case 'mapTiles':
        //   await dispatch(TileCache.deleteRepository(spec.id));
        //   break;
        case 'wellData':
          await dispatch(WellCache.deleteRepository(spec.id));
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
    dispatch(PlanMyTrip.refresh());
  });
}

export default PlanMyTrip;
export type { ICreateMyTrip, IModifySubCache, tripIdentifier };

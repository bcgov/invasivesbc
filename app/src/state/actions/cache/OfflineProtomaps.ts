import { createAction, createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from 'state/reducers/rootReducer';
import {
  MapGenerationExecutionResponse,
  MapGenerationRequest,
  MapGenerationRequestMonitoringResponse,
  MapRecord
} from 'UI/Features/TileCache/ProtomapsImplementation/definitions';
import { getCurrentJWT } from 'state/sagas/auth/auth';
import { tripIdentifier } from 'state/actions/planMyTrip/PlanMyTrip';
import OfflineMaps, { DownloadRequestCallbackParams } from 'utils/offline-protomaps/capacitor';
import { PlanMyTripCacheServiceFactory } from 'utils/plan-my-trip-cache/context';
import { MapGenerationRequestWithProgress } from 'UI/Features/TileCache/ProtomapsImplementation/ProtomapsList';
import { IPlanMyTripCacheStatus } from 'utils/plan-my-trip-cache';

const plugin = OfflineMaps;

class OfflineProtomaps {
  public static readonly PREFIX = 'OfflineProtomaps';

  static readonly mapGeneration = createAsyncThunk(
    `${this.PREFIX}/mapGeneration`,
    async (spec: { request: MapGenerationRequest; tripId: tripIdentifier }, { getState }) => {
      const state: RootState = getState() as RootState;

      const generationResult = await fetch(`${state.Configuration.current.runtime.NORMALIZED_API_BASE}/maps/requests`, {
        headers: {
          Authorization: await getCurrentJWT(),
          'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify(spec.request)
      });

      if (generationResult.status !== 200) {
        throw new Error(`Unexpected status code ${generationResult.status}`);
      }

      const generationResponse: MapGenerationExecutionResponse = await generationResult.json();
      // now we should have an id we can poll to follow the progress of map generation

      let finished = false;

      while (!finished) {
        await new Promise((resolve) => setTimeout(resolve, 10000));
        const monitoringResult = await fetch(
          `${state.Configuration.current.runtime.NORMALIZED_API_BASE}/maps/requests/${generationResponse.id}`,
          {
            headers: {
              Authorization: await getCurrentJWT(),
              'Content-Type': 'application/json'
            },
            method: 'GET'
          }
        );

        if (monitoringResult.status !== 200) {
          throw new Error(`Unexpected status code ${monitoringResult.status}`);
        }
        const monitorResultBody: MapGenerationRequestMonitoringResponse = await monitoringResult.json();
        if (monitorResultBody.status === 'COMPLETED' || monitorResultBody.status === 'FAILED') {
          finished = true;
          return {
            tripId: spec.tripId,
            generationRecord: monitorResultBody.generation_record
          };
        }
      }
    }
  );

  static readonly remove = createAsyncThunk(`${this.PREFIX}/remove`, async (spec: { name: string }, { dispatch }) => {
    await plugin.delete({ type: 'rasters', name: spec.name });
    dispatch(OfflineProtomaps.refreshList());
  });

  static readonly install = createAsyncThunk(
    `${this.PREFIX}/install`,
    async (spec: { generationRecordId: number }, { getState, dispatch }) => {
      const state: RootState = getState() as RootState;

      const response = await fetch(
        `${state.Configuration.current.runtime.NORMALIZED_API_BASE}/maps/records/${spec.generationRecordId}`,
        {
          headers: {
            Authorization: await getCurrentJWT(),
            'Content-Type': 'application/json'
          },
          method: 'GET'
        }
      );

      if (response.status !== 200) {
        throw new Error(`Unexpected status code ${response.status}`);
      }

      const generationRecord: MapRecord = await response.json();

      if (generationRecord.trip_name) {
        dispatch(OfflineProtomaps.installRequested(generationRecord.trip_name));
      }

      await plugin.requestDownload(
        {
          name: generationRecord.trip_name !== null ? generationRecord.trip_name : generationRecord.file_name,
          format: 'pmtiles',
          url: generationRecord.download_link,
          type: 'raster',
          metadata: JSON.stringify({
            tripId: generationRecord.trip_name,
            tripName: generationRecord.trip_name,
            generationRecord: generationRecord
          })
        },
        (spec: DownloadRequestCallbackParams | null) => {
          if (spec && spec.status == 'success') {
            // download is done
            if (generationRecord.trip_name) {
              dispatch(OfflineProtomaps.installCompleted(generationRecord.trip_name));
            }
            dispatch(OfflineProtomaps.refreshList());
            dispatch(OfflineProtomaps.syncTripService());
          }
          if (spec && spec.status == 'downloading' && spec.percent !== undefined && generationRecord.trip_name) {
            dispatch(
              OfflineProtomaps.installProgress({
                tripName: generationRecord.trip_name,
                percent: spec.percent
              })
            );
          }
        }
      );
    }
  );

  static readonly installRequested = createAction<string>(`${this.PREFIX}/installRequested`);
  static readonly installCompleted = createAction<string>(`${this.PREFIX}/installCompleted`);
  static readonly installProgress = createAction<{ percent: number; tripName: string }>(
    `${this.PREFIX}/installProgress`
  );

  static readonly refreshList = createAsyncThunk(`${this.PREFIX}/refreshList`, async () => {
    return await OfflineMaps.listDownloads({});
  });

  static readonly syncTripService = createAsyncThunk(`${this.PREFIX}/syncTrips`, async (_, { getState }) => {
    // a brute-force approach to synchronizing the PlanMyTrip service with the actual state of things

    // read the actual cache status from the plugin and the map generation statuses from the server and then make pmt understand

    const tripService = await PlanMyTripCacheServiceFactory.getPlatformInstance();
    const installedMapsList = await OfflineMaps.listDownloads({});
    const state: RootState = getState() as RootState;

    const result = {
      installed: []
    } as {
      installed: string[];
    };

    const serverMapList = await (async () => {
      const response = await fetch(
        `${state.Configuration.current.runtime.NORMALIZED_API_BASE}/maps/requests/offline_maps_page_list`,
        {
          headers: {
            Authorization: await getCurrentJWT(),
            'Content-Type': 'application/json'
          },
          method: 'GET'
        }
      );

      if (response.status !== 200) {
        throw new Error(`Unexpected status code ${response.status}`);
      }

      return (await response.json()) as MapGenerationRequestWithProgress[];
    })();

    const actualTrips = await tripService.listRepositories();

    for (const tripDetails of actualTrips) {
      const isAlreadyInstalled = installedMapsList.rasters.some((m) => m.name === tripDetails.name);

      const isInProgress = serverMapList
        .filter((m) => ['PENDING', 'PROCESSING', 'STALE'].includes(m.status))
        .some((m) => m.trip_name === tripDetails.name);
      const isReadyToInstall = serverMapList
        .filter((m) => ['COMPLETED'].includes(m.status))
        .some((m) => m.trip_name === tripDetails.name);
      const isInErrorState = serverMapList
        .filter((m) => ['FAILED', 'EXPIRED'].includes(m.status))
        .some((m) => m.trip_name === tripDetails.name);

      let desiredStatus: IPlanMyTripCacheStatus = tripDetails.cacheStatuses.mapTiles;

      if (isAlreadyInstalled) {
        desiredStatus = IPlanMyTripCacheStatus.CACHED;
        result.installed.push(tripDetails.id);
      } else if (isInProgress) {
        desiredStatus = IPlanMyTripCacheStatus.IN_PROGRESS;
      } else if (isInErrorState) {
        desiredStatus = IPlanMyTripCacheStatus.FAILED;
      } else if (isReadyToInstall) {
        desiredStatus = IPlanMyTripCacheStatus.NOT_CACHED;
      }

      if (desiredStatus !== tripDetails.cacheStatuses.mapTiles) {
        await tripService.updateSubCacheStatus(tripDetails.id, 'mapTiles', desiredStatus);
      }
    }
    return result;
  });
}

export default OfflineProtomaps;

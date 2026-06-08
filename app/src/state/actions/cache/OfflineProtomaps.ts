import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from 'state/reducers/rootReducer';
import {
  MapGenerationExecutionResponse,
  MapGenerationRequest,
  MapGenerationRequestMonitoringResponse,
  MapRecord
} from 'UI/Features/TileCache/ProtomapsImplementation/definitions';
import { getCurrentJWT } from 'state/sagas/auth/auth';
import { tripIdentifier } from 'state/actions/planMyTrip/PlanMyTrip';
import OfflineMaps from 'utils/offline-protomaps/capacitor';

const plugin = OfflineMaps;

class OfflineProtomaps {
  public static readonly PREFIX = 'OfflineProtomaps';

  static readonly mapGeneration = createAsyncThunk(
    `${this.PREFIX}/mapGeneration`,
    async (spec: { request: MapGenerationRequest; tripId: tripIdentifier }, { getState, dispatch }) => {
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
          await plugin.requestDownload(
            {
              name: spec.request.trip_name,
              format: 'pmtiles',
              url: monitorResultBody.generation_record.download_link,
              type: 'raster',
              metadata: JSON.stringify({
                tripId: spec.request.trip_name,
                tripName: spec.request.trip_name,
                generationRecord: monitorResultBody.generation_record
              })
            },
            () => {
              // download is done
              dispatch(OfflineProtomaps.refreshList());
            }
          );
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
        () => {
          // download is done
          dispatch(OfflineProtomaps.refreshList());
        }
      );
    }
  );

  static readonly refreshList = createAsyncThunk(`${this.PREFIX}/refreshList`, async () => {
    return await OfflineMaps.listDownloads({});
  });
}

export default OfflineProtomaps;

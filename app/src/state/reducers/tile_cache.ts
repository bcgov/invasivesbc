import { createNextState } from '@reduxjs/toolkit';
import { Draft } from 'immer';
import { ProgressCallbackParameters, RepositoryMetadata, RepositoryStatus } from 'utils/tile-cache';
import TileCache from 'state/actions/cache/TileCache';
import {
  MapDefinitionEligibilityPredicatesBuilder,
  MapSourceAndLayerDefinition
} from 'UI/Map2/helpers/layer-definitions';

interface TileCacheState {
  mapSpecifications: MapSourceAndLayerDefinition[];
  repositories: RepositoryMetadata[];
  downloadProgress: Record<string, ProgressCallbackParameters>;
  loading: boolean;
}

const initialState: TileCacheState = {
  mapSpecifications: [],
  repositories: [],
  downloadProgress: {},
  loading: false
};

function buildMapSpecificationFromRepositoryMetadata(spec: RepositoryMetadata): MapSourceAndLayerDefinition {
  return {
    name: spec.id,
    displayName: spec.description,
    icon: 'OfflineSatellite',
    tooltip: `${spec.id} - ${spec.description} - ${spec.status}`,
    predicates: new MapDefinitionEligibilityPredicatesBuilder().mobileOnly().build(),
    source: {
      type: 'raster',
      tiles: [`baked://${spec.id}/{z}/{x}/{y}`],
      tileSize: 256,
      attribution: 'Powered by ESRI',
      maxzoom: spec.maxZoom
    },
    layers: [
      {
        id: `cached-${spec.id}`,
        type: 'raster',
        source: spec.id,
        minzoom: 0
      }
    ]
  };
}

function createTileCacheReducer() {
  return (state = initialState, action: unknown) => {
    return createNextState(state, (draft: Draft<TileCacheState>): void => {
      if (TileCache.downloadProgressEvent.match(action)) {
        if (action.payload.normalizedProgress == 1 || action.payload.aborted) {
          // completed or aborted
          if (Object.prototype.hasOwnProperty.call(draft.downloadProgress, action.payload.repository)) {
            delete draft.downloadProgress[action.payload.repository];
          }
        } else {
          draft.downloadProgress[action.payload.repository] = action.payload;
        }
      }

      if (TileCache.repositoryList.pending.match(action)) {
        draft.loading = true;
      } else if (TileCache.repositoryList.fulfilled.match(action)) {
        draft.loading = false;
        draft.repositories = action.payload;
        // @ts-ignore
        draft.mapSpecifications = action.payload
          .filter((m) => m.status == RepositoryStatus.READY)
          .map((m) => {
            return buildMapSpecificationFromRepositoryMetadata(m);
          });
      } else if (TileCache.repositoryList.rejected.match(action)) {
        draft.loading = false;
        draft.repositories = [];
      }

      if (TileCache.requestCaching.pending.match(action)) {
        draft.loading = true;
      } else if (TileCache.requestCaching.fulfilled.match(action)) {
        draft.loading = false;
        draft.repositories = action.payload;
        // @ts-ignore
        draft.mapSpecifications = action.payload
          .filter((m) => m.status == RepositoryStatus.READY)
          .map((m) => {
            return buildMapSpecificationFromRepositoryMetadata(m);
          });
      } else if (TileCache.requestCaching.rejected.match(action)) {
        draft.loading = false;
      }

      if (TileCache.deleteRepository.pending.match(action)) {
        draft.loading = true;
      } else if (TileCache.deleteRepository.fulfilled.match(action)) {
        draft.loading = false;
        draft.repositories = action.payload;
        // @ts-ignore
        draft.mapSpecifications = action.payload
          .filter((m) => m.status == RepositoryStatus.READY)
          .map((m) => {
            return buildMapSpecificationFromRepositoryMetadata(m);
          });
      } else if (TileCache.deleteRepository.rejected.match(action)) {
        draft.loading = false;
      }
    });
  };
}

export { createTileCacheReducer };

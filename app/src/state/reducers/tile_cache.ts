import { createNextState } from '@reduxjs/toolkit';
import { Draft } from 'immer';
import { bbox } from '@turf/turf';
import { ProgressCallbackParameters, RepositoryMetadata, RepositoryStatus } from 'utils/tile-cache';
import TileCache from 'state/actions/cache/TileCache';
import {
  MapDefinitionEligibilityPredicatesBuilder,
  MapSourceAndLayerDefinition,
  MapSourceAndLayerDefinitionMode
} from 'UI/Map2/helpers/layer-definitions';

interface TileCacheState {
  mapSpecifications: MapSourceAndLayerDefinition[];
  repositories: RepositoryMetadata[];
  downloadProgress: Record<string, ProgressCallbackParameters>;
  drawnShapeBounds: {
    minLatitude: number;
    minLongitude: number;
    maxLatitude: number;
    maxLongitude: number;
  } | null;
  loading: boolean;
}

const initialState: TileCacheState = {
  mapSpecifications: [],
  repositories: [],
  downloadProgress: {},
  loading: false,
  drawnShapeBounds: null
};

function buildMapSpecificationFromRepositoryMetadata(spec: RepositoryMetadata): MapSourceAndLayerDefinition[] {
  return [
    {
      name: `bounds-${spec.id}`,
      displayName: spec.description,
      icon: 'N/A',
      mode: MapSourceAndLayerDefinitionMode.BASEMAP,
      tooltip: ``,
      predicates: new MapDefinitionEligibilityPredicatesBuilder().directlySelectable(false).build(),
      source: {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [spec.bounds.minLatitude, spec.bounds.minLongitude],
                [spec.bounds.minLatitude, spec.bounds.maxLongitude],
                [spec.bounds.maxLatitude, spec.bounds.maxLongitude],
                [spec.bounds.maxLatitude, spec.bounds.minLongitude],
                [spec.bounds.minLatitude, spec.bounds.minLongitude]
              ]
            ]
          },
          properties: {
            name: `bounds-${spec.id}`
          }
        }
      },
      layers: []
    },
    {
      name: spec.id,
      displayName: spec.description,
      icon: 'OfflineSatellite',
      mode: MapSourceAndLayerDefinitionMode.OVERLAY,
      tooltip: `${spec.id} - ${spec.description} - ${spec.status}`,
      predicates: new MapDefinitionEligibilityPredicatesBuilder().mobileOnly().requiresNetwork(false).build(),
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
          minzoom: 0,
          layout: {
            visibility: 'visible'
          }
        },
        {
          id: `bounds-${spec.id}`,
          type: 'line',
          layout: {
            'line-join': 'miter',
            'line-cap': 'butt',
            visibility: 'visible'
          },
          paint: {
            'line-color': '#f00',
            'line-width': 20
          },
          source: `bounds-${spec.id}`,
          minzoom: 0
        }
      ]
    }
  ];
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
          .flatMap((m) => {
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
          .flatMap((m) => {
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
          .flatMap((m) => {
            return buildMapSpecificationFromRepositoryMetadata(m);
          });
      } else if (TileCache.deleteRepository.rejected.match(action)) {
        draft.loading = false;
      }

      if (TileCache.setTileCacheShape.match(action)) {
        try {
          const [minX, minY, maxX, maxY] = bbox(action.payload.geometry);
          draft.drawnShapeBounds = {
            minLatitude: minY,
            maxLatitude: maxY,
            minLongitude: minX,
            maxLongitude: maxX
          };
        } catch (e) {
          console.error(e);
          draft.drawnShapeBounds = null;
        }
      } else if (TileCache.clearTileCacheShape.match(action)) {
        draft.drawnShapeBounds = null;
      }
    });
  };
}

export { createTileCacheReducer };

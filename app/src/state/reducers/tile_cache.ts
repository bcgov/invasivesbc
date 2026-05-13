import { createNextState } from '@reduxjs/toolkit';
import { Draft } from 'immer';
import { bbox } from '@turf/turf';
import { SourceSpecification } from 'maplibre-gl/dist/maplibre-gl-dev';
import { RepositoryMetadata, RepositoryStatus, TileCacheProgressCallbackParameters } from 'utils/tile-cache';
import TileCache from 'state/actions/cache/TileCache';
import {
  InvasivesMapLayerDefinition,
  MapDefinitionEligibilityPredicatesBuilder
} from 'UI/Features/LegacyMap/helpers/functional/layer-definitions/types';

interface TileCacheState {
  mapSpecifications: InvasivesMapLayerDefinition[];
  sources: { [_: string]: SourceSpecification };
  repositories: RepositoryMetadata[];
  downloadProgress: Record<string, TileCacheProgressCallbackParameters>;
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
  sources: {},
  repositories: [],
  downloadProgress: {},
  loading: false,
  drawnShapeBounds: null
};

function buildMapSpecificationFromRepositoryMetadata(spec: RepositoryMetadata): {
  definitions: InvasivesMapLayerDefinition[];
  sources: { [_: string]: SourceSpecification };
} {
  return {
    sources: {
      [`bounds-${spec.id}`]: {
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
      [spec.id]: {
        type: 'raster',
        tiles: [`baked://${spec.id}/{z}/{x}/{y}`],
        tileSize: 256,
        attribution: 'Powered by ESRI',
        maxzoom: spec.maxZoom
      }
    },
    definitions: [
      {
        name: `bounds-${spec.id}`,
        displayName: spec.description,
        icon: 'N/A',
        mode: 'overlay',
        selectionMode: 'offline-layers',
        tooltip: ``,
        predicates: new MapDefinitionEligibilityPredicatesBuilder().directlySelectable(false).build(),
        layers: []
      },
      {
        name: spec.id,
        displayName: spec.description,
        icon: 'OfflineSatellite',
        mode: 'overlay',
        selectionMode: 'offline-layers',
        tooltip: `${spec.id} - ${spec.description} - ${spec.status}`,
        predicates: new MapDefinitionEligibilityPredicatesBuilder().mobileOnly().requiresNetwork(false).build(),

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
    ]
  };
}

function buildCompleteMapSpecificationFromRepositoryMetadataArray(list: RepositoryMetadata[]): {
  definitions: InvasivesMapLayerDefinition[];
  sources: { [_: string]: SourceSpecification };
} {
  return list
    .filter((m) => m.status == RepositoryStatus.READY)
    .flatMap((m) => buildMapSpecificationFromRepositoryMetadata(m))
    .reduce(
      (previousValue, currentValue) => {
        return {
          sources: { ...previousValue.sources, ...currentValue.sources },
          definitions: [...previousValue.definitions, ...currentValue.definitions]
        };
      },
      { sources: {}, definitions: [] }
    );
}

function createTileCacheReducer() {
  return (state = initialState, action: unknown) => {
    return createNextState(state, (draft: Draft<TileCacheState>): void => {
      if (TileCache.downloadProgressEvent.match(action)) {
        if (action.payload.normalizedProgress >= 1 || action.payload.aborted) {
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
        const { definitions, sources } = buildCompleteMapSpecificationFromRepositoryMetadataArray(action.payload);
        //@ts-expect-error TS has trouble with type inference here
        draft.mapSpecifications = definitions;
        draft.sources = sources;
      } else if (TileCache.repositoryList.rejected.match(action)) {
        draft.loading = false;
        draft.repositories = [];
      }

      if (TileCache.requestCaching.pending.match(action)) {
        draft.loading = true;
      } else if (TileCache.requestCaching.fulfilled.match(action)) {
        draft.loading = false;
        draft.repositories = action.payload;
        const { definitions, sources } = buildCompleteMapSpecificationFromRepositoryMetadataArray(action.payload);
        draft.mapSpecifications = definitions;
        draft.sources = sources;
      } else if (TileCache.requestCaching.rejected.match(action)) {
        draft.loading = false;
      }

      if (TileCache.deleteRepository.pending.match(action)) {
        draft.loading = true;
        if (Object.prototype.hasOwnProperty.call(draft.downloadProgress, action.meta.arg)) {
          delete draft.downloadProgress[action.meta.arg];
        }
      } else if (TileCache.deleteRepository.fulfilled.match(action)) {
        draft.loading = false;
        draft.repositories = action.payload;
        const { definitions, sources } = buildCompleteMapSpecificationFromRepositoryMetadataArray(action.payload);
        draft.mapSpecifications = definitions;
        draft.sources = sources;
      } else if (TileCache.deleteRepository.rejected.match(action)) {
        draft.loading = false;
      }

      if (TileCache.updateDescription.pending.match(action)) {
        draft.loading = true;
      } else if (TileCache.updateDescription.fulfilled.match(action)) {
        draft.loading = false;
        draft.repositories = action.payload;
        const { definitions, sources } = buildCompleteMapSpecificationFromRepositoryMetadataArray(action.payload);
        draft.mapSpecifications = definitions;
        draft.sources = sources;
      } else if (TileCache.updateDescription.rejected.match(action)) {
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

import { createNextState } from '@reduxjs/toolkit';
import { SourceSpecification } from 'maplibre-gl';
import { tripIdentifier } from 'state/actions/planMyTrip/PlanMyTrip';
import OfflineProtomaps from 'state/actions/cache/OfflineProtomaps';
import {
  InvasivesMapLayerDefinition,
  LAYER_Z_FOREGROUND,
  LAYER_Z_MID,
  MapDefinitionEligibilityPredicatesBuilder
} from 'UI/Features/LegacyMap/helpers/functional/layer-definitions/types';
import { MapRecord } from 'UI/Features/TileCache/ProtomapsImplementation/definitions';

type SavedProtomapDefinition = {
  generationRecord: MapRecord;
  tripId: tripIdentifier;
  tripName: string | null;
};

interface ProtomapsState {
  loading: boolean;
  definitions: SavedProtomapDefinition[];
  mapLayers: InvasivesMapLayerDefinition[];
  mapSources: { [key: string]: SourceSpecification };
}

const initialState: ProtomapsState = {
  loading: false,
  definitions: [],
  mapLayers: [],
  mapSources: {}
};

function mapGenerationRecordToUsableMapDefinitions(def: SavedProtomapDefinition) {
  const sourceDefinitions: { [key: string]: SourceSpecification } = {
    [`pmtiles-${def.tripId}`]: {
      type: 'raster',
      url: `pmtiles://rasters/${def.tripId}.pmtiles`,
      attribution: 'Powered by ESRI',
      minzoom: def.generationRecord.minimum_zoom,
      maxzoom: def.generationRecord.maximum_zoom
    },
    [`bounds-${def.tripId}`]: {
      type: 'geojson',
      data: def.generationRecord.bounds
    }
  };

  const layerDefinition: InvasivesMapLayerDefinition = {
    name: def.tripId,
    selectionMode: 'offline-layers',
    displayName: `Plan My Trip - ${def.tripId}`,
    mode: 'overlay',
    icon: 'Cached',
    tooltip: `Plan My Trip Saved Map - ${def.tripId}`,
    predicates: new MapDefinitionEligibilityPredicatesBuilder()
      .mobileOnly(true)
      .requiresNetwork(false)
      .requiresAuthentication(false)
      .requiresFeature('CACHE_TILES')
      .requiresDebug(false)
      .directlySelectable(true)
      .build(),
    layers: [
      {
        id: `raster-${def.tripId}`,
        type: 'raster',
        source: `pmtiles-${def.tripId}`,
        paint: {
          'raster-opacity': 1.0
        },
        stackLayer: LAYER_Z_MID
      },
      {
        id: `bounds-${def.tripId}`,
        type: 'line',
        source: `bounds-${def.tripId}`,
        paint: {
          'line-color': '#00ff00',
          'line-width': 3
        },
        minzoom: 0,
        maxzoom: 24,
        stackLayer: LAYER_Z_FOREGROUND
      }
    ]
  };

  return {
    layers: [layerDefinition],
    sources: sourceDefinitions
  };
}

function createProtomapsReducer(): (OfflineActivityState, AnyAction) => ProtomapsState {
  return (state: ProtomapsState = initialState, action) => {
    return createNextState(state, (draftState) => {
      if (OfflineProtomaps.mapGeneration.pending.match(action)) {
        draftState.loading = true;
      } else if (OfflineProtomaps.mapGeneration.rejected.match(action)) {
        draftState.loading = false;
      } else if (OfflineProtomaps.mapGeneration.fulfilled.match(action)) {
        draftState.loading = false;
      } else if (OfflineProtomaps.refreshList.fulfilled.match(action)) {
        const { rasters } = action.payload;

        draftState.mapLayers = [];
        draftState.mapSources = {};
        draftState.definitions = [];

        for (const r of rasters) {
          try {
            const def = JSON.parse(r.metadata) as SavedProtomapDefinition;
            draftState.definitions.push(def);
            const { sources, layers } = mapGenerationRecordToUsableMapDefinitions(def);
            draftState.mapLayers = [...draftState.mapLayers, ...layers];
            Object.entries(sources).forEach(([k, v]) => {
              //@ts-expect-error typescript has difficulty here
              draftState.mapSources[k] = v;
            });
          } catch (_) {
            console.error('unable to parse record (old data?)');
          }
        }
      }
    });
  };
}

const selectProtomaps = (state) => state.Protomaps;

export { selectProtomaps, createProtomapsReducer };
export type { SavedProtomapDefinition };

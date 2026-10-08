import { MapLibreMap } from 'maplibre-gl';
import { LAYER_Z_FOREGROUND } from 'UI/Features/LegacyMap/helpers/functional/layer-definitions/types';

/**
 * @desc Invisible Layer for capturing click actions.
 */
const CLICKABLE_LAYER = 'zoi-fill';
const SOURCE = 'zones-of-interest';
const OUTLINE_LAYER = 'zoi-outline';
const BORDER_LAYER = 'zoi-border';
const SELECTED_LAYER = 'zoi-selected';
const ALL_LAYERS = [SELECTED_LAYER, OUTLINE_LAYER, BORDER_LAYER, CLICKABLE_LAYER];

const selectionFilter = (ids: Set<string>): any => ['in', ['get', 'public_id'], ['literal', Array.from(ids)]];

const addZoneLayers = (map: MapLibreMap, selected: Set<string>) => {
  try {
    if (!map.getStyle()) return;

    if (!map.getSource(SOURCE)) {
      map.addSource(SOURCE, {
        type: 'vector',
        tiles: ['apiv2:///ninja/tiles/zone/{z}/{x}/{y}'],
        minzoom: 10
      });
    }

    if (!map.getLayer(CLICKABLE_LAYER)) {
      map.addLayer(
        {
          id: CLICKABLE_LAYER,
          type: 'fill',
          source: SOURCE,
          'source-layer': 'data',
          paint: { 'fill-color': 'white', 'fill-outline-color': 'white', 'fill-opacity': 0 }
        },
        LAYER_Z_FOREGROUND
      );
    }
    if (!map.getLayer(BORDER_LAYER)) {
      map.addLayer(
        {
          id: BORDER_LAYER,
          type: 'line',
          source: SOURCE,
          'source-layer': 'data',
          paint: { 'line-color': 'black', 'line-width': 3, 'line-opacity': 0.2 }
        },
        LAYER_Z_FOREGROUND
      );
    }
    if (!map.getLayer(OUTLINE_LAYER)) {
      map.addLayer(
        {
          id: OUTLINE_LAYER,
          type: 'line',
          source: SOURCE,
          'source-layer': 'data',
          paint: { 'line-color': '#00FFFF', 'line-width': 1, 'line-opacity': 0.35 }
        },
        LAYER_Z_FOREGROUND
      );
    }
    if (!map.getLayer(SELECTED_LAYER)) {
      map.addLayer(
        {
          id: SELECTED_LAYER,
          type: 'fill',
          source: SOURCE,
          'source-layer': 'data',
          filter: selectionFilter(selected),
          paint: { 'fill-color': 'white', 'fill-opacity': 0.4 }
        },
        LAYER_Z_FOREGROUND
      );
    }
  } catch (err) {
    console.warn('MapZoneSearch: failed to add layers', err);
  }
};

const removeZoneLayers = (map: MapLibreMap) => {
  try {
    if (!map.getStyle()) return;
    ALL_LAYERS.forEach((l) => {
      if (map.getLayer(l)) map.removeLayer(l);
    });
    if (map.getSource(SOURCE)) map.removeSource(SOURCE);
  } catch (e) {
    // Map may be mid-teardown, nothing useful left to do
    console.warn('[MapZoneSearch]: failed to remove layer(s)', e);
  }
};

export {
  CLICKABLE_LAYER,
  SOURCE,
  OUTLINE_LAYER,
  BORDER_LAYER,
  SELECTED_LAYER,
  ALL_LAYERS,
  addZoneLayers,
  removeZoneLayers,
  selectionFilter
};

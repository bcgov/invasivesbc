import { ImageSearch } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import HoverTooltip from 'UI/Reusable/HoverTooltip/HoverTooltip';
import { MapContext } from '../helpers/components/MapContext';
import { FeatureGated } from 'UI/Reusable/Predicates/FeatureGated';
import type { MapGeoJSONFeature, Map as MapLibreMap, MapMouseEvent, MapTouchEvent } from 'maplibre-gl';
import { LAYER_Z_FOREGROUND } from '../helpers/functional/layer-definitions/types';
import { useNavigate } from 'react-router';

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

const MapZoneSearch = () => {
  const map = useContext(MapContext) as MapLibreMap | null;
  if (!map) throw Error('MapContext was not provided');
  const navigate = useNavigate();

  const [active, setActive] = useState<boolean>(false);
  const [selectedZones, setSelectedZones] = useState<Set<string>>(new Set());

  const selectedRef = useRef(selectedZones);
  selectedRef.current = selectedZones;

  const handleClick = useCallback(
    (e: MapMouseEvent | MapTouchEvent) => {
      if (!map || !map.getLayer(CLICKABLE_LAYER)) return;
      let features: Array<MapGeoJSONFeature>;
      try {
        features = map.queryRenderedFeatures(e.point, { layers: [CLICKABLE_LAYER] });
      } catch (err) {
        console.warn('[MapZoneSearch]: queryRenderedFeatures failed', err);
        return;
      }
      const ids = new Set<string>();
      features.forEach((f) => {
        const id = f?.properties?.public_id;
        if (id) ids.add(id);
      });
      if (ids.size === 0) return;

      setSelectedZones((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => (next.has(id) ? next.delete(id) : next.add(id)));
        return next;
      });
    },
    [map]
  );

  /** add setup/teardown based on active. */
  useEffect(() => {
    if (!map || !active) return;

    const onStyleLoad = () => addZoneLayers(map, selectedRef.current);
    const setPointer = () => (map.getCanvas().style.cursor = 'pointer');
    const clearPointer = () => (map.getCanvas().style.cursor = '');

    addZoneLayers(map, selectedRef.current);
    map.on('style.load', onStyleLoad);
    map.on('click', handleClick);
    map.on('mousemove', clearPointer);
    map.on('mouseenter', CLICKABLE_LAYER, setPointer);
    map.on('mouseleave', CLICKABLE_LAYER, clearPointer);

    return () => {
      map.off('style.load', onStyleLoad);
      map.off('click', handleClick);
      map.off('mousemove', clearPointer);
      map.off('mouseenter', CLICKABLE_LAYER, setPointer);
      map.off('mouseleave', CLICKABLE_LAYER, clearPointer);
      try {
        clearPointer();
      } catch {
        /* map already removed */
      }
      removeZoneLayers(map);
    };
  }, [map, active, handleClick]);

  /**
   * Reflect selection on the map
   */
  useEffect(() => {
    if (!map || !active) return;
    try {
      if (map.getLayer(SELECTED_LAYER)) map.setFilter(SELECTED_LAYER, selectionFilter(selectedZones));
    } catch (err) {
      console.warn('MapZoneSearch: failed to update selection', err);
    }
  }, [map, active, selectedZones]);

  useEffect(() => {
    if (!active) {
      const selected = Array.from(selectedZones).join(',');
      if (selected) {
        navigate(`/summary?zone=${selected}`);
      }
      setSelectedZones((prev) => (prev.size ? new Set() : prev));
    }
  }, [active]);

  if (!map) return null;

  return (
    <FeatureGated requires="ZONES_OF_INTEREST">
      <div className={active ? 'map-btn-selected' : 'map-btn'}>
        <HoverTooltip tooltipText="Search one or more zones for a summary of what's inside">
          <IconButton className={'button'} onClick={() => setActive((prev) => !prev)}>
            <ImageSearch />
          </IconButton>
        </HoverTooltip>
      </div>
    </FeatureGated>
  );
};

export default MapZoneSearch;

import { ImageSearch } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import HoverTooltip from 'UI/Reusable/HoverTooltip/HoverTooltip';
import { MapContext } from '../../helpers/components/MapContext';
import { FeatureGated } from 'UI/Reusable/Predicates/FeatureGated';
import type { MapGeoJSONFeature, Map as MapLibreMap, MapMouseEvent, MapTouchEvent } from 'maplibre-gl';
import { useNavigate } from 'react-router';
import { CLICKABLE_LAYER, SELECTED_LAYER, addZoneLayers, removeZoneLayers, selectionFilter } from './definitions';

/**
 * @desc Feature to Render the Zone Hexagon Grid onto the Map, Allowing User to select Zones of Interest
 */
const MapZoneSearch = () => {
  const map = useContext(MapContext) as MapLibreMap | null;
  if (!map) throw Error('MapContext was not provided');
  const navigate = useNavigate();

  const [featureActive, setFeatureActive] = useState<boolean>(false);
  const [selectedZones, setSelectedZones] = useState<Set<string>>(new Set());

  const selectedRef = useRef(selectedZones);
  selectedRef.current = selectedZones;

  /**
   * @desc When User selects a Hexagon on the grid, Add or Remove the ID from the Set
   */
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

  /** add setup/teardown based on "active" state. */
  useEffect(() => {
    if (!map || !featureActive) return;

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
  }, [map, featureActive, handleClick]);

  /**
   * Update the Selected Layer to reflect on the Users Selection
   */
  useEffect(() => {
    if (!map || !featureActive) return;
    try {
      if (map.getLayer(SELECTED_LAYER)) {
        map.setFilter(SELECTED_LAYER, selectionFilter(selectedZones));
      }
    } catch (err) {
      console.warn('MapZoneSearch: failed to update selection', err);
    }
  }, [map, featureActive, selectedZones]);

  useEffect(() => {
    if (!featureActive) {
      const selected = Array.from(selectedZones).join(',');
      if (selected) {
        navigate(`/summary?zone=${selected}`);
      }
      setSelectedZones((prev) => (prev.size ? new Set() : prev));
    }
  }, [featureActive]);

  if (!map) return null;
  return (
    <FeatureGated requires="ZONES_OF_INTEREST">
      <div className={featureActive ? 'map-btn-selected' : 'map-btn'}>
        <HoverTooltip tooltipText="Search one or more zones for a summary of what's inside">
          <IconButton className={'button'} onClick={() => setFeatureActive((prev) => !prev)}>
            <ImageSearch />
          </IconButton>
        </HoverTooltip>
      </div>
    </FeatureGated>
  );
};

export default MapZoneSearch;

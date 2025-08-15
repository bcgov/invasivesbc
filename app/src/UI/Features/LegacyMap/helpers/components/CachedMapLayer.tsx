import { useContext, useEffect, useMemo } from 'react';
import { MapContext } from './MapContext';
import { FillLayerSpecification, GeoJSONSource, SymbolLayerSpecification } from 'maplibre-gl';
import VECTOR_MAP_FONT_FACE from 'constants/vectorMapFontFace';
import { useSelector } from 'utils/use_selector';
import bboxToPolygon from 'utils/bboxToPolygon';
import { LAYER_Z_FOREGROUND } from 'UI/Features/LegacyMap/helpers/functional/layer-definitions/types';

type PropTypes = {
  mapReady: boolean;
};

const CachedMapLayer = ({ mapReady }: PropTypes) => {
  const map = useContext(MapContext);

  const MAP_ID = 'cached-tiles-source';
  const LAYER_DEFINITION: FillLayerSpecification = {
    id: `fill-${MAP_ID}`,
    type: 'fill',
    source: MAP_ID,
    paint: {
      'fill-color': 'orange',
      'fill-opacity': 0.4
    }
  };
  const LABEL_DEFINITION: SymbolLayerSpecification = {
    id: `label-${MAP_ID}`,
    source: MAP_ID,
    type: 'symbol',
    layout: {
      'text-field': ['format', ['get', 'description']],
      'text-font': ['literal', [VECTOR_MAP_FONT_FACE]],
      'text-offset': [0, 0.6],
      'text-anchor': 'top',
      visibility: 'visible'
    },
    paint: {
      'text-color': 'black',
      'text-halo-color': 'white',
      'text-halo-width': 1,
      'text-halo-blur': 1
    }
  };

  const setup = () => {
    map?.addSource(MAP_ID, {
      type: 'geojson',
      data: {
        type: 'FeatureCollection',
        features: data
      }
    });
    map?.addLayer(LABEL_DEFINITION, LAYER_Z_FOREGROUND);
    map?.addLayer(LAYER_DEFINITION, LAYER_Z_FOREGROUND);
  };

  const teardown = () => {
    if (!map?.getSource(MAP_ID) || !mapReady) return;
    try {
      const allLayersOnMap = map.getLayersOrder();
      const cachedMapLayers = allLayersOnMap.filter((layer) => layer.includes(MAP_ID));
      cachedMapLayers.forEach((layer) => {
        try {
          map.removeLayer(layer);
        } catch (e) {
          console.error('Failed to remove Offline Tile layer', e);
        }
      });
      map.removeSource(MAP_ID);
    } catch (e) {
      console.error('Failed to remove Offline Tile Source', e);
    }
  };

  const repositories = useSelector((state) => state.TileCache?.repositories);
  const url = useSelector((state) => state.AppMode.url);

  // Rebuild Dataset when repository state updates
  const data = useMemo(() => {
    return (
      repositories?.map(({ bounds, description }) => {
        const shape = bboxToPolygon(bounds);
        shape.properties = { description };
        return shape;
      }) ?? []
    );
  }, [repositories]);

  const userOnPlanMyTripPage = useMemo(() => !!url?.includes('/ManageTrips'), [url]);

  // Update layer data on change instead of destroying/recreating each time there's an update
  useEffect(() => {
    if (!map || !mapReady) return;
    const source = map.getSource(MAP_ID) as GeoJSONSource;
    if (!source) return;
    source.setData({
      type: 'FeatureCollection',
      features: data
    });
  }, [data]);

  useEffect(() => {
    if (!map || !mapReady) return;
    setup();
    return () => teardown();
  }, [mapReady]);

  // Toggle Layer Visibility
  useEffect(() => {
    if (!map || !mapReady) return;
    const visibility = userOnPlanMyTripPage ? 'visible' : 'none';
    map.setLayoutProperty(`label-${MAP_ID}`, 'visibility', visibility);
    map.setLayoutProperty(`fill-${MAP_ID}`, 'visibility', visibility);
  }, [userOnPlanMyTripPage]);

  return null;
};
export default CachedMapLayer;

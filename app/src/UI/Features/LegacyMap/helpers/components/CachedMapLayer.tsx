import { useContext, useEffect, useState, Fragment } from 'react';
import { MapContext } from './MapContext';
import { FillLayerSpecification, GeoJSONSource, SymbolLayerSpecification } from 'maplibre-gl';
import VECTOR_MAP_FONT_FACE from 'constants/vectorMapFontFace';
import { useSelector } from 'utils/use_selector';
import bboxToPolygon from 'utils/bboxToPolygon';
import { Feature, Polygon } from 'geojson';
import { LAYER_Z_FOREGROUND, LAYER_Z_MID } from '../functional/layer-definitions';

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
    map?.addLayer(LAYER_DEFINITION, LAYER_Z_MID);
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

  const [data, setData] = useState<Array<Feature<Polygon>>>([]);
  const [userOnOfflineTilePage, setUserOnOfflineTilePage] = useState<boolean>(false);

  // Rebuild Dataset when repository state updates
  useEffect(() => {
    const features =
      repositories?.map(({ bounds, description }) => {
        const shape = bboxToPolygon(bounds);
        shape.properties = { description };
        return shape;
      }) ?? [];
    setData(features);
  }, [repositories]);

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

  useEffect(() => {
    setUserOnOfflineTilePage(!!url?.includes('/OfflineTiles'));
  }, [url]);

  // Toggle Layer Visibility
  useEffect(() => {
    if (!map || !mapReady) return;
    const visibility = userOnOfflineTilePage ? 'visible' : 'none';
    map.setLayoutProperty(`label-${MAP_ID}`, 'visibility', visibility);
    map.setLayoutProperty(`fill-${MAP_ID}`, 'visibility', visibility);
  }, [userOnOfflineTilePage]);

  return Fragment;
};
export default CachedMapLayer;

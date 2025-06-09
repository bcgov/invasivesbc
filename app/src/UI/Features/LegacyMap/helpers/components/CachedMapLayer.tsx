import { useContext, useEffect, useState } from 'react';
import { MapContext } from './MapContext';
import { FillLayerSpecification, GeoJSONSourceSpecification, SymbolLayerSpecification } from 'maplibre-gl';
import VECTOR_MAP_FONT_FACE from 'constants/vectorMapFontFace';
import { useSelector } from 'utils/use_selector';
import bboxToPolygon from 'utils/bboxToPolygon';
import { Feature, Polygon } from 'geojson';
import { LAYER_Z_FOREGROUND, LAYER_Z_MID } from '../functional/layer-definitions';

type PropTypes = {
  mapReady: boolean;
};
const CachedMapLayer = ({ mapReady }: PropTypes) => {
  const MAP_ID = 'cached-tiles-source';
  const map = useContext(MapContext);

  const createShapeLayerDefinition = (): FillLayerSpecification => ({
    id: `fill-${MAP_ID}`,
    type: 'fill',
    source: MAP_ID,
    paint: {
      'fill-color': 'orange',
      'fill-opacity': 0.4
    }
  });

  const createLabelLayerDefinition = (): SymbolLayerSpecification => ({
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
  });

  const setup = () => {
    if (!map) return;
    map.addSource(MAP_ID, createSourceDefinition());
    map.addLayer(createLabelLayerDefinition(), LAYER_Z_FOREGROUND);
    map.addLayer(createShapeLayerDefinition(), LAYER_Z_MID);
  };
  const tearDown = () => {
    if (!map) return;
    const allLayersOnMap = map.getLayersOrder();
    const cachedMapLayers = allLayersOnMap.filter((layer) => layer.includes(MAP_ID));
    cachedMapLayers.forEach((layer) => {
      try {
        map.removeLayer(layer);
      } catch (e) {
        console.error(e);
      }
    });
    try {
      map.removeSource(MAP_ID);
    } catch (e) {
      console.error(e);
    }
  };
  const createSourceDefinition = (): GeoJSONSourceSpecification => ({
    type: 'geojson',
    data: {
      type: 'FeatureCollection',
      features: data
    }
  });

  const repositories = useSelector((state) => state.TileCache?.repositories);
  const url = useSelector((state) => state.AppMode.url);
  const [data, setData] = useState<Array<Feature<Polygon>>>([]);
  const [onTilePage, setOnTilePage] = useState<boolean>(false);
  useEffect(() => {
    setOnTilePage(!!url?.includes('/OfflineTiles'));
  }, [url]);
  useEffect(() => {
    if (!mapReady || !map || !repositories) return;
    tearDown();
    setup();
  }, [data, mapReady]);

  useEffect(() => {
    if (!map) return;
    const visibility = onTilePage ? 'visible' : 'none';
    map.setLayoutProperty(`label-${MAP_ID}`, 'visibility', visibility);
    map.setLayoutProperty(`fill-${MAP_ID}`, 'visibility', visibility);
  }, [onTilePage]);
  useEffect(() => {
    const features =
      repositories?.map((repo) => {
        const shape = bboxToPolygon(repo.bounds);
        shape.properties = { description: repo.description };
        return shape;
      }) ?? [];
    setData(features);
  }, [repositories]);

  return null;
};
export default CachedMapLayer;

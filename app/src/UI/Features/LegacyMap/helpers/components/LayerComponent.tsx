import { useContext, useEffect } from 'react';
import { MapContext } from 'UI/Features/LegacyMap/helpers/components/MapContext';
import { LayerSpecification } from 'maplibre-gl/dist/maplibre-gl-dev';
import {
  hasStackingOrder,
  LayerSpecificationWithStackingOrder
} from 'UI/Features/LegacyMap/helpers/functional/layer-definitions/types';

type LayerComponentProps = {
  mapReady: boolean;
  id: string;
  layer: LayerSpecification | LayerSpecificationWithStackingOrder;
};

const LayerComponent = ({ mapReady, id, layer }: LayerComponentProps) => {
  const map = useContext(MapContext);

  useEffect(() => {
    if (!map || !mapReady) return;

    if (hasStackingOrder(layer)) {
      map.addLayer(layer, layer.stackLayer);
    } else {
      map.addLayer(layer);
    }

    return () => {
      if (map.getLayersOrder().includes(id)) {
        map.removeLayer(id);
      }
    };
  }, [map, mapReady]);

  return null;
};

export { LayerComponent };

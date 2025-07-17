import { useContext, useEffect } from 'react';
import { MapContext } from 'UI/Features/LegacyMap/helpers/components/MapContext';
import { LayerSpecificationWithStackingOrder } from 'UI/Features/LegacyMap/helpers/functional/layers-hook';
import { LayerSpecification } from 'maplibre-gl';

type LayerComponentProps = {
  mapReady: boolean;
  id: string;
  layer: LayerSpecification | LayerSpecificationWithStackingOrder;
};

function hasStackingOrder(
  layer: LayerSpecificationWithStackingOrder | LayerSpecification
): layer is LayerSpecificationWithStackingOrder {
  return (layer as LayerSpecificationWithStackingOrder).stackLayer !== undefined;
}

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

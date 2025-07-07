import { useContext, useEffect } from 'react';
import { MapContext } from 'UI/Features/LegacyMap/helpers/components/MapContext';
import { LayerSpecificationWithStackingOrder } from 'UI/Features/LegacyMap/helpers/functional/layers-hook';

type LayerComponentProps = {
  mapReady: boolean;
  id: string;
  layer: LayerSpecificationWithStackingOrder;
};

const LayerComponent = ({ mapReady, id, layer }: LayerComponentProps) => {
  const map = useContext(MapContext);

  useEffect(() => {
    if (!map || !mapReady) return;

    console.dir(layer, layer.stackLayer);
    map.addLayer(layer, layer.stackLayer);

    return () => {
      map.removeLayer(id);
    };
  }, [map, mapReady]);

  return null;
};

export { LayerComponent };

import { useContext, useEffect } from 'react';
import { MapContext } from 'UI/Features/LegacyMap/helpers/components/MapContext';
import { LayerSpecification } from 'maplibre-gl';

type LayerComponentProps = {
  mapReady: boolean;
  id: string;
  layer: LayerSpecification;
};

const LayerComponent = ({ mapReady, id, layer }: LayerComponentProps) => {
  const map = useContext(MapContext);

  useEffect(() => {
    if (!map || !mapReady) return;

    map.addLayer(layer);
    return () => {
      map.removeLayer(id);
    };
  }, [map, mapReady]);

  return null;
};

export { LayerComponent };

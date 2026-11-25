import { useContext, useEffect } from 'react';
import { SourceSpecification } from 'maplibre-gl/dist/maplibre-gl-dev';
import { MapContext } from 'UI/Features/LegacyMap/helpers/components/MapContext';

type SourceComponentProps = {
  mapReady: boolean;
  id: string;
  source: SourceSpecification;
};

const SourceComponent = ({ mapReady, id, source }: SourceComponentProps) => {
  const map = useContext(MapContext);

  useEffect(() => {
    if (!map || !mapReady) return;
    map.addSource(id, source);
  }, [map, mapReady]);

  return null;
};

export { SourceComponent };

import { useContext, useEffect } from 'react';
import { MapContext } from 'UI/Features/LegacyMap/helpers/components/MapContext';
import { SourceSpecification } from 'maplibre-gl';

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

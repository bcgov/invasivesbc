import { PropsWithChildren, useContext, useEffect } from 'react';
import { MapContext } from 'UI/Features/LegacyMap/helpers/components/MapContext';
import { SourceSpecification } from 'maplibre-gl';

type SourceComponentProps = {
  mapReady: boolean;
  id: string;
  source: SourceSpecification;
};

const SourceComponent = ({ mapReady, id, source, children }: SourceComponentProps & PropsWithChildren) => {
  const map = useContext(MapContext);

  useEffect(() => {
    if (!map || !mapReady) return;

    map.addSource(id, source);
    return () => {
      map.removeSource(id);
    };
  }, [map, mapReady]);

  return children;
};

export { SourceComponent };

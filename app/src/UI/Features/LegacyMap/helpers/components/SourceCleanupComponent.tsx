import { useContext, useEffect } from 'react';
import { MapContext } from 'UI/Features/LegacyMap/helpers/components/MapContext';

type SourceCleanupComponentProps = {
  mapReady: boolean;
  id: string;
};

const SourceCleanupComponent = ({ mapReady, id }: SourceCleanupComponentProps) => {
  const map = useContext(MapContext);

  useEffect(() => {
    if (!map || !mapReady) return;

    return () => {
      if (map !== null) {
        if (map.getSource(id) !== undefined) {
          map.removeSource(id);
        }
      }
    };
  }, [map, mapReady]);

  return null;
};

export { SourceCleanupComponent };

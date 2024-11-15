import { MlVectorTileLayer } from '@mapcomponents/react-maplibre';
import { useSelector } from 'react-redux';

export const RecordSetLayers = (props) => {
  const layersInStore = useSelector((state: any) => state.Map.layers);
  const { API_BASE } = useSelector((state: any) => state.Configuration.current.API_BASE);


  return (
    <>
      {layersInStore.map((layer) => {
        if (layer.type !== 'Activity') return;

        if(!layer.filterObject)
            return;

        return (
          <MlVectorTileLayer
            layerId={'recordSetLayer' + layer.recordSetID}
            layers={[
              {
                id: 'recordSetLayer' + layer.recordSetID,
                type: 'fill',

                //source: 'recordSetLayer' + layer.id,
                'source-layer': 'recordSetLayer' + layer.recordSetID,
                layout: {
                  visibility: layer?.layerState?.mapToggle ? 'visible' : 'none'
                },
                paint: { 'fill-color': '#0905f5', 'fill-opacity': 1.0 },
                maxzoom: 24
              }
            ]}
            url={`${API_BASE}/api/vectors/activities/{z}/{x}/{y}?filterObject=${encodeURI(JSON.stringify(layer.filterObject))}`}
          />
        );
      })}
    </>
  );
};

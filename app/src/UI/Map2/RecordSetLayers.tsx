import { MlVectorTileLayer, useAddProtocol } from '@mapcomponents/react-maplibre';
import { useSelector } from 'react-redux';

export const RecordSetLayers = (props) => {
  const layersInStore = useSelector((state: any) => state.Map.layers);
  const  API_BASE  = useSelector((state: any) => state.Configuration.current.API_BASE);

  return (
    <>
      {layersInStore.map((layer) => {
        if (layer.type !== 'Activity') return;

        if(!layer.filterObject)
            return;


        const layerIDName = 'recordSetLayer' + layer.recordSetID 

        return (
            <>
          <MlVectorTileLayer
            mapId='map'
            layerId={layerIDName + 'points'}
            layers={[
              {
                id:layerIDName + 'points', 
                type: 'circle',
                source: layerIDName + 'points',
                'source-layer': 'data',
                layout: {
                  //visibility: layer?.layerState?.mapToggle ? 'visible' : 'none'
                  visibility: 'visible'
                },
                paint: { 'circle-color': 'white', 'circle-opacity': 1.0 },
              },
            ]}
              sourceOptions={{
                type: 'vector',
                minzoom: 0,
                tiles: [`${API_BASE}/api/vectors/activities/{z}/{x}/{y}?filterObject=${encodeURI(JSON.stringify(layer.filterObject))}`]
              }}
            

            //url={`mbtiles://${API_BASE}/api/vectors/activities/{z}/{x}/{y}?filterObject=${encodeURI(JSON.stringify(layer.filterObject))}`}
            //url={`${API_BASE}/api/vectors/activities/{z}/{x}/{y}?filterObject=${encodeURI(JSON.stringify(layer.filterObject))}`}
          />
          <MlVectorTileLayer
            mapId='map'
            layerId={layerIDName + 'poly'}
            layers={[
             {
                id: layerIDName + 'poly',
                type: 'line',
                source: layerIDName + 'poly',
                'source-layer': 'data',
                /*layout: {
                  visibility: 'visible'
                },*/
                //paint: { 'fill-outline-color': '#0905f5', 'fill-color': '#0905f5', 'fill-opacity': 1.0 },
                paint: { 'line-color': '#0905f5', "line-opacity": 1.0, "line-width": 10},
              },
            ]}
              sourceOptions={{
                type: 'vector',
                tiles: [`${API_BASE}/api/vectors/activities/{z}/{x}/{y}?filterObject=${encodeURI(JSON.stringify(layer.filterObject))}`],
                minzoom: 0 
              }}
            ///url={`mbtiles://${API_BASE}/api/vectors/activities/{z}/{x}/{y}?filterObject=${encodeURI(JSON.stringify(layer.filterObject))}`}
            //url={`${API_BASE}/api/vectors/activities/{z}/{x}/{y}?filterObject=${encodeURI(JSON.stringify(layer.filterObject))}`}
          />
          </>
        );
      })}
    </>
  );
};

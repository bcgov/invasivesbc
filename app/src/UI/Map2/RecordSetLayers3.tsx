import {Source, Layer} from 'react-map-gl/maplibre';
import { useSelector } from 'react-redux';

export const RecordSetLayers = () => {
    const layersInStore = useSelector((state: any) => state.Map.layers);
    const API_BASE = useSelector((state: any) => state.Configuration.current.API_BASE);

    return (
        <>
        {/* <Source
            id="van"
            type='vector'
            tiles={[
                'http://localhost:8080/data/vancouver/{z}/{x}/{y}.pbf'
                // `${API_BASE}/api/vectors/activities/{z}/{x}/{y}?filterObject=${encodeURI(JSON.stringify(layer.filterObject))}`
            ]}
         
        >
            <Layer
                id="van-layer"
                type='fill'
                source="van"
                source-layer='vancouver-layer'
                paint={{ 'fill-color': 'orange', 'fill-opacity': 1.0 }}
                layout={{visibility: 'visible' }}
                maxzoom={24}
                minzoom={0}
            />
        </Source> */}
        {
            layersInStore.map((layer)=>{
                if (layer.type !== 'Activity') return;
                if (!layer.filterObject) return;
                
                console.log(layer.filterObject);
                
                const source = layer.recordSetID + 'source' + 'points';
                const layerIDName ='recordset-layer-' + layer.recordSetID + '-hash-' + layer.tableFiltersHash

                const url = `${API_BASE}/api/vectors/activities/{z}/{x}/{y}?filterObject=${encodeURI(JSON.stringify(layer.filterObject))}`;
                <Source
                    id={source}
                    key={layerIDName+ 'points'} 
                    type='vector'
                    url={`mbtiles://${API_BASE}/api/vectors/activities/{z}/{x}/{y}?filterObject=${encodeURI(JSON.stringify(layer.filterObject))}`}
                    
                    // tiles={[
                    //     url
                    // ]}
                 
                >
                    <Layer
                        id={layer.recordSetID + 'layer' + 'points'}
                        key={layerIDName+ 'points'+'layer'} 
                        type='circle'
                        source={source}
                        source-layer='data'
                        paint={{ 'circle-color': 'orange', 'circle-opacity': 1.0 }}
                        layout={{visibility: 'visible' }}
                        maxzoom={12}
                        minzoom={0}
                        
                    />
                </Source>
            })
        }
        </>
    )
}
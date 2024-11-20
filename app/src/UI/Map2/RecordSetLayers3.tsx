import {Source, Layer} from 'react-map-gl/maplibre';
import { useSelector } from 'react-redux';

const getPaintBySchemeOrColor = (layer: any) => {
    const FALLBACK_COLOR = 'orange'
    if (layer?.layerState?.colorScheme) {
      return [
        'match',
        ['get', 'activity_subtype'],
        'Activity_Biocontrol_Collection',
        layer.layerState.colorScheme['Activity_Biocontrol_Collection'] || FALLBACK_COLOR,
        'Activity_Biocontrol_Release',
        layer.layerState.colorScheme['Activity_Biocontrol_Release'] || FALLBACK_COLOR,
        'Activity_Monitoring_BiocontrolDispersal_TerrestrialPlant',
        layer.layerState.colorScheme['Activity_Monitoring_BiocontrolDispersal_TerrestrialPlant'] || FALLBACK_COLOR,
        'Activity_Monitoring_BiocontrolRelease_TerrestrialPlant',
        layer.layerState.colorScheme['Activity_Monitoring_BiocontrolRelease_TerrestrialPlant'] || FALLBACK_COLOR,
        'Activity_Monitoring_ChemicalTerrestrialAquaticPlant',
        layer.layerState.colorScheme['Activity_Monitoring_ChemicalTerrestrialAquaticPlant'] || FALLBACK_COLOR,
        'Activity_Monitoring_MechanicalTerrestrialAquaticPlant',
        layer.layerState.colorScheme['Activity_Monitoring_MechanicalTerrestrialAquaticPlant'] || FALLBACK_COLOR,
        'Activity_Observation_PlantAquatic',
        layer.layerState.colorScheme['Activity_Observation_PlantAquatic'] || FALLBACK_COLOR,
        'Activity_Observation_PlantTerrestrial',
        layer.layerState.colorScheme['Activity_Observation_PlantTerrestrial'] || FALLBACK_COLOR,
        'Activity_Treatment_ChemicalPlantAquatic',
        layer.layerState.colorScheme['Activity_Treatment_ChemicalPlantAquatic'] || FALLBACK_COLOR,
        'Activity_Treatment_ChemicalPlantTerrestrial',
        layer.layerState.colorScheme['Activity_Treatment_ChemicalPlantTerrestrial'] || FALLBACK_COLOR,
        'Activity_Treatment_MechanicalPlantAquatic',
        layer.layerState.colorScheme['Activity_Treatment_MechanicalPlantAquatic'] || FALLBACK_COLOR,
        'Activity_Treatment_MechanicalPlantTerrestrial',
        layer.layerState.colorScheme['Activity_Treatment_MechanicalPlantTerrestrial'] || FALLBACK_COLOR,
        layer.layerState.color || FALLBACK_COLOR
      ];
    } else {
      return layer?.layerState?.color || FALLBACK_COLOR;
    }
  };
export const RecordSetLayers = () => {
    const layersInStore = useSelector((state: any) => state.Map.layers);
    const API_BASE = useSelector((state: any) => state.Configuration.current.API_BASE);

    return (
        <>
        {
            layersInStore.map((layer)=>{
                if (layer.type !== 'Activity') return;
                if (!layer.filterObject) return;
                
                const source = layer.recordSetID + 'source' + 'points';
                const layerIDName ='recordset-layer-' + layer.recordSetID + '-hash-' + layer.tableFiltersHash

                const url = `${API_BASE}/api/vectors/activities/{z}/{x}/{y}?filterObject=${encodeURI(JSON.stringify(layer.filterObject))}`;
                return <Source
                    id={source}
                    key={layerIDName+ 'points'} 
                    type='vector'
                    ///tiles={[`mbtiles://${API_BASE}/api/vectors/activities/{z}/{x}/{y}?filterObject=${encodeURI(JSON.stringify(layer.filterObject))}`]}
                    
                     tiles={[
                         url
                     ]}
                 
                >
                    <Layer
                        id={layer.recordSetID + 'layer' + 'points'}
                        key={layerIDName+ 'points'+'layer'} 
                        type='circle'
                        source={source}
                        source-layer='data'
                        paint={{ 'circle-color': 'orange', 'circle-opacity': 1.0 }}
                        layout={{visibility: 'visible' }}
                        //maxzoom={12}
                        minzoom={0}
                        
                    />
                    <Layer
                        id={layer.recordSetID + 'layer' + 'poly'}
                        key={layerIDName+ 'polygon'+'layer'} 
                        type='fill'
                        source={source}
                        source-layer='data'
                        paint={{ 'fill-color': getPaintBySchemeOrColor(layer), 'fill-opacity': 1.0 }}
                        layout={{visibility: 'visible' }}
                        minzoom={12}
                        
                    />
                </Source>
            })
        }
        </>
    )
}
import { MlVectorTileLayer, useAddProtocol } from '@mapcomponents/react-maplibre';
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

export const RecordSetLayers = (props) => {
  const layersInStore = useSelector((state: any) => state.Map.layers);
  const API_BASE = useSelector((state: any) => state.Configuration.current.API_BASE);

  return (
    <>
      {layersInStore.map((layer) => {
        if (layer.type !== 'Activity') return;

        if (!layer.filterObject) return;
        
        const layerIDName ='recordset-layer-' + layer.recordSetID + '-hash-' + layer.tableFiltersHash

        const colour = getPaintBySchemeOrColor(layer)
        console.log('*** color', colour)

        return (
          <>
            <MlVectorTileLayer
              // key={JSON.stringify(layer.filterObject)+ 'points'}
              key={layerIDName+ 'points'} 
              mapId="map"
              layerId={layerIDName + 'points'}
              layers={[
                {
                  id: layerIDName + 'points',
                  type: 'circle',
                  source: layerIDName + 'points',
                  'source-layer': 'data',
                  layout: {
                    visibility: layer?.layerState?.mapToggle ? 'visible' : 'none'
                    //visibility: layer
                  },
                  paint: { 'circle-color':  getPaintBySchemeOrColor(layer), 'circle-opacity': 1.0 },
                  maxzoom: 12,
                  minzoom: 0
                }
              ]}
              sourceOptions={{
                type: 'vector',
                tiles: [
                  `${API_BASE}/api/vectors/activities/{z}/{x}/{y}?filterObject=${encodeURI(JSON.stringify(layer.filterObject))}`
                ]
              }}

              //url={`mbtiles://${API_BASE}/api/vectors/activities/{z}/{x}/{y}?filterObject=${encodeURI(JSON.stringify(layer.filterObject))}`}
              //url={`${API_BASE}/api/vectors/activities/{z}/{x}/{y}?filterObject=${encodeURI(JSON.stringify(layer.filterObject))}`}
            />
            <MlVectorTileLayer
              // key={JSON.stringify(layer.filterObject)+ 'poly'}
              key={layerIDName+ 'poly'}
              mapId="map"
              layerId={layerIDName + 'poly'}
              layers={[
                {
                  id: layerIDName + 'poly',
                  type: 'fill',
                  source: layerIDName + 'poly',
                  'source-layer': 'data',
                  layout: {
                    //visibility: 'visible'
                    visibility: layer?.layerState?.mapToggle ? 'visible' : 'none'
                  },
                  paint: { 'fill-outline-color': getPaintBySchemeOrColor(layer), 'fill-color': getPaintBySchemeOrColor(layer), 'fill-opacity': 0.5 },
                  minzoom: 12,
                  maxzoom: 24
                  // paint: { 'line-color': '#0905f5', "line-opacity": 1.0, "line-width": 10},
                }
              ]}
              sourceOptions={{
                type: 'vector',
                tiles: [
                  `${API_BASE}/api/vectors/activities/{z}/{x}/{y}?filterObject=${encodeURI(JSON.stringify(layer.filterObject))}`
                ]
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

import React, { useContext, useMemo } from 'react';
import { IChildLayer, IParentLayer, MapRequestContext } from 'contexts/MapRequestsContext';
import { DataBCLayer } from '../LayerLoaderHelpers/DataBCRenderLayer';

const TerrestrialLayers = (props) => {
  const { layers } = useContext(MapRequestContext);

  const terrestial_layers: IParentLayer = layers[4];
  //--------------- terrestial_layers ---------------
  const digital_road_atlas: IChildLayer = layers[4].children[0];
  const city_names: IChildLayer = layers[4].children[0];

  return (
    <>
      {useMemo(
        () => (
          <DataBCLayer
            enabled={digital_road_atlas.enabled}
            opacity={digital_road_atlas.opacity}
            bcgw_code={digital_road_atlas.bcgw_code}
            layer_mode={digital_road_atlas.layer_mode}
            dataBCAcceptsGeometry={digital_road_atlas.dataBCAcceptsGeometry}
            simplifyPercentage={digital_road_atlas.simplifyPercentage}
            inputGeo={props.inputGeo}
            color_code={digital_road_atlas.color_code}
            zIndex={terrestial_layers.zIndex + digital_road_atlas.zIndex}
          />
        ),
        [digital_road_atlas, props.inputGeo, terrestial_layers]
      )}

      {useMemo(
        () => (
          <DataBCLayer
            enabled={city_names.enabled}
            opacity={city_names.opacity}
            bcgw_code={city_names.bcgw_code}
            layer_mode={city_names.layer_mode}
            dataBCAcceptsGeometry={city_names.dataBCAcceptsGeometry}
            simplifyPercentage={city_names.simplifyPercentage}
            inputGeo={props.inputGeo}
            color_code={city_names.color_code}
            zIndex={terrestial_layers.zIndex + city_names.zIndex}
          />
        ),
        [city_names, props.inputGeo, terrestial_layers]
      )}
    </>
  );
};

export default TerrestrialLayers;

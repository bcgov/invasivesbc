import React, { useContext, useMemo } from 'react';
import { IChildLayer, IParentLayer, MapRequestContext } from 'contexts/MapRequestsContext';
import { DataBCLayer } from '../LayerLoaderHelpers/DataBCRenderLayer';
import { IndependentLayer } from '../LayerLoaderHelpers/IndependentRenderLayers';

const AdminBoundriesLayers = (props) => {
  const { layers } = useContext(MapRequestContext);

  //--------------- parent layer ---------------
  const administrative_boundaries: IParentLayer = layers[2];
  //--------------- administrative_boundaries ---------------
  const regional_districts: IChildLayer = layers[2].children[0];
  const municipality_boundaries: IChildLayer = layers[2].children[1];
  const first_nations_treaty_lands: IChildLayer = layers[2].children[2];
  const jurisdiction_layer: IChildLayer = layers[2].children[3];
  const riso_boundaries: IChildLayer = layers[2].children[4];

  return (
    <>
      {useMemo(
        () => (
          <DataBCLayer
            enabled={regional_districts.enabled}
            opacity={regional_districts.opacity}
            bcgw_code={regional_districts.bcgw_code}
            layer_mode={regional_districts.layer_mode}
            dataBCAcceptsGeometry={regional_districts.dataBCAcceptsGeometry}
            simplifyPercentage={regional_districts.simplifyPercentage}
            inputGeo={props.inputGeo}
            color_code={regional_districts.color_code}
            zIndex={administrative_boundaries.zIndex + regional_districts.zIndex}
          />
        ),
        [regional_districts, props.inputGeo, administrative_boundaries.zIndex]
      )}

      {useMemo(
        () => (
          <DataBCLayer
            enabled={municipality_boundaries.enabled}
            opacity={municipality_boundaries.opacity}
            bcgw_code={municipality_boundaries.bcgw_code}
            layer_mode={municipality_boundaries.layer_mode}
            dataBCAcceptsGeometry={municipality_boundaries.dataBCAcceptsGeometry}
            simplifyPercentage={municipality_boundaries.simplifyPercentage}
            inputGeo={props.inputGeo}
            color_code={municipality_boundaries.color_code}
            zIndex={administrative_boundaries.zIndex + municipality_boundaries.zIndex}
          />
        ),
        [municipality_boundaries, props.inputGeo, administrative_boundaries.zIndex]
      )}

      {useMemo(
        () => (
          <DataBCLayer
            enabled={first_nations_treaty_lands.enabled}
            opacity={first_nations_treaty_lands.opacity}
            bcgw_code={first_nations_treaty_lands.bcgw_code}
            layer_mode={first_nations_treaty_lands.layer_mode}
            dataBCAcceptsGeometry={first_nations_treaty_lands.dataBCAcceptsGeometry}
            simplifyPercentage={first_nations_treaty_lands.simplifyPercentage}
            inputGeo={props.inputGeo}
            color_code={first_nations_treaty_lands.color_code}
            zIndex={administrative_boundaries.zIndex + first_nations_treaty_lands.zIndex}
          />
        ),
        [first_nations_treaty_lands, props.inputGeo, administrative_boundaries.zIndex]
      )}

      {useMemo(
        () => (
          <IndependentLayer
            enabled={jurisdiction_layer.enabled}
            opacity={jurisdiction_layer.opacity}
            bcgw_code={jurisdiction_layer.bcgw_code}
            layer_mode={jurisdiction_layer.layer_mode}
            layer_code={jurisdiction_layer.layer_code}
            dataBCAcceptsGeometry={jurisdiction_layer.dataBCAcceptsGeometry}
            simplifyPercentage={jurisdiction_layer.simplifyPercentage}
            inputGeo={props.inputGeo}
            color_code={jurisdiction_layer.color_code}
            zIndex={administrative_boundaries.zIndex + jurisdiction_layer.zIndex}
          />
        ),
        [jurisdiction_layer, props.inputGeo, administrative_boundaries.zIndex]
      )}

      {useMemo(
        () => (
          <IndependentLayer
            enabled={riso_boundaries.enabled}
            opacity={riso_boundaries.opacity}
            bcgw_code={riso_boundaries.bcgw_code}
            layer_mode={riso_boundaries.layer_mode}
            layer_code={riso_boundaries.layer_code}
            dataBCAcceptsGeometry={riso_boundaries.dataBCAcceptsGeometry}
            simplifyPercentage={riso_boundaries.simplifyPercentage}
            inputGeo={props.inputGeo}
            color_code={riso_boundaries.color_code}
            zIndex={administrative_boundaries.zIndex + riso_boundaries.zIndex}
          />
        ),
        [riso_boundaries, props.inputGeo, administrative_boundaries.zIndex]
      )}
    </>
  );
};

export default AdminBoundriesLayers;

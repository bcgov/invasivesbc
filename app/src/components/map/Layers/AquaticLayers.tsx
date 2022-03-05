import React, { useContext, useMemo } from 'react';
import { IChildLayer, IParentLayer, MapRequestContext } from 'contexts/MapRequestsContext';
import { DataBCLayer } from '../LayerLoaderHelpers/DataBCRenderLayer';

const AquaticLayers = (props) => {
  const { layers } = useContext(MapRequestContext);

  //--------------- parent layer ---------------
  const aquatic_layers_and_wells: IParentLayer = layers[3];
  //--------------- aquatic_layers_and_wells ---------------
  const bc_major_watersheds: IChildLayer = layers[3].children[0];
  const freshwater_atlas_rivers: IChildLayer = layers[3].children[1];
  const freshwater_lakes: IChildLayer = layers[3].children[2];
  const freshwater_atlas_stream_network: IChildLayer = layers[3].children[3];
  const water_licenses_drinking_water: IChildLayer = layers[3].children[4];
  const water_rights_licenses: IChildLayer = layers[3].children[5];
  const water_wells: IChildLayer = layers[3].children[6];

  return (
    <>
      {useMemo(
        () => (
          <DataBCLayer
            enabled={bc_major_watersheds.enabled}
            opacity={bc_major_watersheds.opacity}
            bcgw_code={bc_major_watersheds.bcgw_code}
            layer_mode={bc_major_watersheds.layer_mode}
            dataBCAcceptsGeometry={bc_major_watersheds.dataBCAcceptsGeometry}
            simplifyPercentage={bc_major_watersheds.simplifyPercentage}
            inputGeo={props.inputGeo}
            color_code={bc_major_watersheds.color_code}
            zIndex={aquatic_layers_and_wells.zIndex + bc_major_watersheds.zIndex}
          />
        ),
        [bc_major_watersheds, aquatic_layers_and_wells.zIndex, props.inputGeo]
      )}

      {useMemo(
        () => (
          <DataBCLayer
            enabled={freshwater_atlas_rivers.enabled}
            opacity={freshwater_atlas_rivers.opacity}
            bcgw_code={freshwater_atlas_rivers.bcgw_code}
            layer_mode={freshwater_atlas_rivers.layer_mode}
            dataBCAcceptsGeometry={freshwater_atlas_rivers.dataBCAcceptsGeometry}
            simplifyPercentage={freshwater_atlas_rivers.simplifyPercentage}
            inputGeo={props.inputGeo}
            color_code={freshwater_atlas_rivers.color_code}
            zIndex={aquatic_layers_and_wells.zIndex + freshwater_atlas_rivers.zIndex}
          />
        ),
        [freshwater_atlas_rivers, aquatic_layers_and_wells.zIndex, props.inputGeo]
      )}

      {useMemo(
        () => (
          <DataBCLayer
            enabled={freshwater_lakes.enabled}
            opacity={freshwater_lakes.opacity}
            bcgw_code={freshwater_lakes.bcgw_code}
            layer_mode={freshwater_lakes.layer_mode}
            dataBCAcceptsGeometry={freshwater_lakes.dataBCAcceptsGeometry}
            simplifyPercentage={freshwater_lakes.simplifyPercentage}
            inputGeo={props.inputGeo}
            color_code={freshwater_lakes.color_code}
            zIndex={aquatic_layers_and_wells.zIndex + freshwater_lakes.zIndex}
          />
        ),
        [freshwater_lakes, aquatic_layers_and_wells.zIndex, props.inputGeo]
      )}

      {useMemo(
        () => (
          <DataBCLayer
            enabled={freshwater_atlas_stream_network.enabled}
            opacity={freshwater_atlas_stream_network.opacity}
            bcgw_code={freshwater_atlas_stream_network.bcgw_code}
            layer_mode={freshwater_atlas_stream_network.layer_mode}
            dataBCAcceptsGeometry={freshwater_atlas_stream_network.dataBCAcceptsGeometry}
            simplifyPercentage={freshwater_atlas_stream_network.simplifyPercentage}
            inputGeo={props.inputGeo}
            color_code={freshwater_atlas_stream_network.color_code}
            zIndex={aquatic_layers_and_wells.zIndex + freshwater_atlas_stream_network.zIndex}
          />
        ),
        [freshwater_atlas_stream_network, aquatic_layers_and_wells.zIndex, props.inputGeo]
      )}

      {useMemo(
        () => (
          <DataBCLayer
            enabled={water_licenses_drinking_water.enabled}
            opacity={water_licenses_drinking_water.opacity}
            bcgw_code={water_licenses_drinking_water.bcgw_code}
            layer_mode={water_licenses_drinking_water.layer_mode}
            dataBCAcceptsGeometry={water_licenses_drinking_water.dataBCAcceptsGeometry}
            simplifyPercentage={water_licenses_drinking_water.simplifyPercentage}
            inputGeo={props.inputGeo}
            color_code={water_licenses_drinking_water.color_code}
            zIndex={aquatic_layers_and_wells.zIndex + water_licenses_drinking_water.zIndex}
          />
        ),
        [water_licenses_drinking_water, aquatic_layers_and_wells.zIndex, props.inputGeo]
      )}

      {useMemo(
        () => (
          <DataBCLayer
            enabled={water_rights_licenses.enabled}
            opacity={water_rights_licenses.opacity}
            bcgw_code={water_rights_licenses.bcgw_code}
            layer_mode={water_rights_licenses.layer_mode}
            dataBCAcceptsGeometry={water_rights_licenses.dataBCAcceptsGeometry}
            simplifyPercentage={water_rights_licenses.simplifyPercentage}
            inputGeo={props.inputGeo}
            color_code={water_rights_licenses.color_code}
            zIndex={aquatic_layers_and_wells.zIndex + water_rights_licenses.zIndex}
          />
        ),
        [water_rights_licenses, aquatic_layers_and_wells.zIndex, props.inputGeo]
      )}

      {useMemo(
        () => (
          <DataBCLayer
            enabled={water_wells.enabled}
            opacity={water_wells.opacity}
            bcgw_code={water_wells.bcgw_code}
            layer_mode={water_wells.layer_mode}
            dataBCAcceptsGeometry={water_wells.dataBCAcceptsGeometry}
            simplifyPercentage={water_wells.simplifyPercentage}
            inputGeo={props.inputGeo}
            color_code={water_wells.color_code}
            zIndex={aquatic_layers_and_wells.zIndex + water_wells.zIndex}
          />
        ),
        [water_wells, aquatic_layers_and_wells.zIndex, props.inputGeo]
      )}
    </>
  );
};

export default AquaticLayers;

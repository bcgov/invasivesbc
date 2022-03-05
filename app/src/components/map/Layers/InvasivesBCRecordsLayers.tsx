import React, { useContext, useMemo } from 'react';
import { IChildLayer, IParentLayer, MapRequestContext } from 'contexts/MapRequestsContext';
import { IndependentLayer } from '../LayerLoaderHelpers/IndependentRenderLayers';

const InvasivesBCRecordsLayers = (props) => {
  const { layers } = useContext(MapRequestContext);
  //--------------- parent layer ---------------
  const invasivesbc_records: IParentLayer = layers[0];
  //--------------- invasivesbc_records ---------------
  const terrestrial_plant_observation: IChildLayer = layers[0].children[0];
  const aquatic_plant_observation: IChildLayer = layers[0].children[1];
  const terrestrial_plant_chemical_treatment: IChildLayer = layers[0].children[2];
  const aquatic_plant_chemical_treatment: IChildLayer = layers[0].children[3];
  const terrestrial_plant_mechanical_treatment: IChildLayer = layers[0].children[4];
  const aquatic_plant_mechanical_treatment: IChildLayer = layers[0].children[5];
  const plant_chemical_monitoring: IChildLayer = layers[0].children[6];
  const plant_mechanical_monitoring: IChildLayer = layers[0].children[7];
  const biocontrol_collection: IChildLayer = layers[0].children[8];
  const biocontrol_release: IChildLayer = layers[0].children[9];
  const biocontrol_dispersal_monitoring: IChildLayer = layers[0].children[10];
  const biocontrol_release_monitoring: IChildLayer = layers[0].children[11];

  return (
    <>
      {useMemo(
        () => (
          <IndependentLayer
            enabled={terrestrial_plant_observation.enabled}
            opacity={terrestrial_plant_observation.opacity}
            layer_code={terrestrial_plant_observation.layer_code}
            bcgw_code={terrestrial_plant_observation.bcgw_code}
            activity_subtype={terrestrial_plant_observation.activity_subtype}
            poi_type={terrestrial_plant_observation.poi_type}
            layer_mode={terrestrial_plant_observation.layer_mode}
            inputGeo={props.inputGeo}
            color_code={terrestrial_plant_observation.color_code}
            zIndex={invasivesbc_records.zIndex + terrestrial_plant_observation.zIndex}
          />
        ),
        [terrestrial_plant_observation, invasivesbc_records.zIndex, props.inputGeo]
      )}

      {useMemo(
        () => (
          <IndependentLayer
            enabled={aquatic_plant_observation.enabled}
            opacity={aquatic_plant_observation.opacity}
            layer_code={aquatic_plant_observation.layer_code}
            bcgw_code={aquatic_plant_observation.bcgw_code}
            activity_subtype={aquatic_plant_observation.activity_subtype}
            poi_type={aquatic_plant_observation.poi_type}
            layer_mode={aquatic_plant_observation.layer_mode}
            inputGeo={props.inputGeo}
            color_code={aquatic_plant_observation.color_code}
            zIndex={invasivesbc_records.zIndex + aquatic_plant_observation.zIndex}
          />
        ),
        [aquatic_plant_observation, invasivesbc_records.zIndex, props.inputGeo]
      )}

      {useMemo(
        () => (
          <IndependentLayer
            enabled={terrestrial_plant_chemical_treatment.enabled}
            opacity={terrestrial_plant_chemical_treatment.opacity}
            layer_code={terrestrial_plant_chemical_treatment.layer_code}
            bcgw_code={terrestrial_plant_chemical_treatment.bcgw_code}
            activity_subtype={terrestrial_plant_chemical_treatment.activity_subtype}
            poi_type={terrestrial_plant_chemical_treatment.poi_type}
            layer_mode={terrestrial_plant_chemical_treatment.layer_mode}
            inputGeo={props.inputGeo}
            color_code={terrestrial_plant_chemical_treatment.color_code}
            zIndex={invasivesbc_records.zIndex + terrestrial_plant_chemical_treatment.zIndex}
          />
        ),
        [terrestrial_plant_chemical_treatment, invasivesbc_records.zIndex, props.inputGeo]
      )}

      {useMemo(
        () => (
          <IndependentLayer
            enabled={aquatic_plant_chemical_treatment.enabled}
            opacity={aquatic_plant_chemical_treatment.opacity}
            layer_code={aquatic_plant_chemical_treatment.layer_code}
            bcgw_code={aquatic_plant_chemical_treatment.bcgw_code}
            activity_subtype={aquatic_plant_chemical_treatment.activity_subtype}
            poi_type={aquatic_plant_chemical_treatment.poi_type}
            layer_mode={aquatic_plant_chemical_treatment.layer_mode}
            inputGeo={props.inputGeo}
            color_code={aquatic_plant_chemical_treatment.color_code}
            zIndex={invasivesbc_records.zIndex + aquatic_plant_chemical_treatment.zIndex}
          />
        ),
        [aquatic_plant_chemical_treatment, invasivesbc_records.zIndex, props.inputGeo]
      )}

      {useMemo(
        () => (
          <IndependentLayer
            enabled={terrestrial_plant_mechanical_treatment.enabled}
            opacity={terrestrial_plant_mechanical_treatment.opacity}
            layer_code={terrestrial_plant_mechanical_treatment.layer_code}
            bcgw_code={terrestrial_plant_mechanical_treatment.bcgw_code}
            activity_subtype={terrestrial_plant_mechanical_treatment.activity_subtype}
            poi_type={terrestrial_plant_mechanical_treatment.poi_type}
            layer_mode={terrestrial_plant_mechanical_treatment.layer_mode}
            inputGeo={props.inputGeo}
            color_code={terrestrial_plant_mechanical_treatment.color_code}
            zIndex={invasivesbc_records.zIndex + terrestrial_plant_mechanical_treatment.zIndex}
          />
        ),
        [terrestrial_plant_mechanical_treatment, invasivesbc_records.zIndex, props.inputGeo]
      )}

      {useMemo(
        () => (
          <IndependentLayer
            enabled={aquatic_plant_mechanical_treatment.enabled}
            opacity={aquatic_plant_mechanical_treatment.opacity}
            layer_code={aquatic_plant_mechanical_treatment.layer_code}
            bcgw_code={aquatic_plant_mechanical_treatment.bcgw_code}
            activity_subtype={aquatic_plant_mechanical_treatment.activity_subtype}
            poi_type={aquatic_plant_mechanical_treatment.poi_type}
            layer_mode={aquatic_plant_mechanical_treatment.layer_mode}
            inputGeo={props.inputGeo}
            color_code={aquatic_plant_mechanical_treatment.color_code}
            zIndex={invasivesbc_records.zIndex + aquatic_plant_mechanical_treatment.zIndex}
          />
        ),
        [aquatic_plant_mechanical_treatment, invasivesbc_records.zIndex, props.inputGeo]
      )}

      {useMemo(
        () => (
          <IndependentLayer
            enabled={plant_chemical_monitoring.enabled}
            opacity={plant_chemical_monitoring.opacity}
            layer_code={plant_chemical_monitoring.layer_code}
            bcgw_code={plant_chemical_monitoring.bcgw_code}
            activity_subtype={plant_chemical_monitoring.activity_subtype}
            poi_type={plant_chemical_monitoring.poi_type}
            layer_mode={plant_chemical_monitoring.layer_mode}
            inputGeo={props.inputGeo}
            color_code={plant_chemical_monitoring.color_code}
            zIndex={invasivesbc_records.zIndex + plant_chemical_monitoring.zIndex}
          />
        ),
        [plant_chemical_monitoring, invasivesbc_records.zIndex, props.inputGeo]
      )}

      {useMemo(
        () => (
          <IndependentLayer
            enabled={plant_mechanical_monitoring.enabled}
            opacity={plant_mechanical_monitoring.opacity}
            layer_code={plant_mechanical_monitoring.layer_code}
            bcgw_code={plant_mechanical_monitoring.bcgw_code}
            activity_subtype={plant_mechanical_monitoring.activity_subtype}
            poi_type={plant_mechanical_monitoring.poi_type}
            layer_mode={plant_mechanical_monitoring.layer_mode}
            inputGeo={props.inputGeo}
            color_code={plant_mechanical_monitoring.color_code}
            zIndex={invasivesbc_records.zIndex + plant_mechanical_monitoring.zIndex}
          />
        ),
        [plant_mechanical_monitoring, invasivesbc_records.zIndex, props.inputGeo]
      )}

      {useMemo(
        () => (
          <IndependentLayer
            enabled={biocontrol_collection.enabled}
            opacity={biocontrol_collection.opacity}
            layer_code={biocontrol_collection.layer_code}
            bcgw_code={biocontrol_collection.bcgw_code}
            activity_subtype={biocontrol_collection.activity_subtype}
            poi_type={biocontrol_collection.poi_type}
            layer_mode={biocontrol_collection.layer_mode}
            inputGeo={props.inputGeo}
            color_code={biocontrol_collection.color_code}
            zIndex={invasivesbc_records.zIndex + biocontrol_collection.zIndex}
          />
        ),
        [biocontrol_collection, invasivesbc_records.zIndex, props.inputGeo]
      )}

      {useMemo(
        () => (
          <IndependentLayer
            enabled={biocontrol_release.enabled}
            opacity={biocontrol_release.opacity}
            layer_code={biocontrol_release.layer_code}
            bcgw_code={biocontrol_release.bcgw_code}
            activity_subtype={biocontrol_release.activity_subtype}
            poi_type={biocontrol_release.poi_type}
            layer_mode={biocontrol_release.layer_mode}
            inputGeo={props.inputGeo}
            color_code={biocontrol_release.color_code}
            zIndex={invasivesbc_records.zIndex + biocontrol_release.zIndex}
          />
        ),
        [biocontrol_release, invasivesbc_records.zIndex, props.inputGeo]
      )}

      {useMemo(
        () => (
          <IndependentLayer
            enabled={biocontrol_dispersal_monitoring.enabled}
            opacity={biocontrol_dispersal_monitoring.opacity}
            layer_code={biocontrol_dispersal_monitoring.layer_code}
            bcgw_code={biocontrol_dispersal_monitoring.bcgw_code}
            activity_subtype={biocontrol_dispersal_monitoring.activity_subtype}
            poi_type={biocontrol_dispersal_monitoring.poi_type}
            layer_mode={biocontrol_dispersal_monitoring.layer_mode}
            inputGeo={props.inputGeo}
            color_code={biocontrol_dispersal_monitoring.color_code}
            zIndex={invasivesbc_records.zIndex + biocontrol_dispersal_monitoring.zIndex}
          />
        ),
        [biocontrol_dispersal_monitoring, invasivesbc_records.zIndex, props.inputGeo]
      )}

      {useMemo(
        () => (
          <IndependentLayer
            enabled={biocontrol_release_monitoring.enabled}
            opacity={biocontrol_release_monitoring.opacity}
            layer_code={biocontrol_release_monitoring.layer_code}
            bcgw_code={biocontrol_release_monitoring.bcgw_code}
            activity_subtype={biocontrol_release_monitoring.activity_subtype}
            poi_type={biocontrol_release_monitoring.poi_type}
            layer_mode={biocontrol_release_monitoring.layer_mode}
            inputGeo={props.inputGeo}
            color_code={biocontrol_release_monitoring.color_code}
            zIndex={invasivesbc_records.zIndex + biocontrol_release_monitoring.zIndex}
          />
        ),
        [biocontrol_release_monitoring, invasivesbc_records.zIndex, props.inputGeo]
      )}
    </>
  );
};

export default InvasivesBCRecordsLayers;

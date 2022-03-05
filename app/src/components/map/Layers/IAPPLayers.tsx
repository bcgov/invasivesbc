import React, { useContext, useMemo } from 'react';
import { IChildLayer, IParentLayer, MapRequestContext } from 'contexts/MapRequestsContext';
import { IndependentLayer } from '../LayerLoaderHelpers/IndependentRenderLayers';

const IAPPLayers = (props) => {
  const { layers } = useContext(MapRequestContext);

  //--------------- parent layer ---------------
  const iapp_records: IParentLayer = layers[1];
  //--------------- iapp_records ---------------
  const iapp_sites: IChildLayer = layers[1].children[0];
  const iapp_surveys: IChildLayer = layers[1].children[1];
  const iapp_chemical_treatment: IChildLayer = layers[1].children[2];
  const iapp_mechanical_treatment: IChildLayer = layers[1].children[3];
  const iapp_monitoring_records: IChildLayer = layers[1].children[4];
  const iapp_biocontrol_release: IChildLayer = layers[1].children[5];
  const iapp_biocontrol_dispersal: IChildLayer = layers[1].children[6];
  const iapp_biocontrol_monitoring: IChildLayer = layers[1].children[7];

  return (
    <>
      {useMemo(
        () => (
          <IndependentLayer
            enabled={iapp_sites.enabled}
            opacity={iapp_sites.opacity}
            layer_code={iapp_sites.layer_code}
            bcgw_code={iapp_sites.bcgw_code}
            activity_subtype={iapp_sites.activity_subtype}
            poi_type={iapp_sites.poi_type}
            layer_mode={iapp_sites.layer_mode}
            inputGeo={props.inputGeo}
            color_code={iapp_sites.color_code}
            zIndex={iapp_records.zIndex + iapp_sites.zIndex}
          />
        ),
        [iapp_sites, iapp_records.zIndex, props.inputGeo]
      )}

      {useMemo(
        () => (
          <IndependentLayer
            enabled={iapp_surveys.enabled}
            opacity={iapp_surveys.opacity}
            layer_code={iapp_surveys.layer_code}
            bcgw_code={iapp_surveys.bcgw_code}
            activity_subtype={iapp_surveys.activity_subtype}
            poi_type={iapp_surveys.poi_type}
            layer_mode={iapp_surveys.layer_mode}
            inputGeo={props.inputGeo}
            color_code={iapp_surveys.color_code}
            zIndex={iapp_records.zIndex + iapp_surveys.zIndex}
          />
        ),
        [iapp_surveys, iapp_records.zIndex, props.inputGeo]
      )}

      {useMemo(
        () => (
          <IndependentLayer
            enabled={iapp_chemical_treatment.enabled}
            opacity={iapp_chemical_treatment.opacity}
            layer_code={iapp_chemical_treatment.layer_code}
            bcgw_code={iapp_chemical_treatment.bcgw_code}
            activity_subtype={iapp_chemical_treatment.activity_subtype}
            poi_type={iapp_chemical_treatment.poi_type}
            layer_mode={iapp_chemical_treatment.layer_mode}
            inputGeo={props.inputGeo}
            color_code={iapp_chemical_treatment.color_code}
            zIndex={iapp_records.zIndex + iapp_chemical_treatment.zIndex}
          />
        ),
        [iapp_chemical_treatment, iapp_records.zIndex, props.inputGeo]
      )}

      {useMemo(
        () => (
          <IndependentLayer
            enabled={iapp_mechanical_treatment.enabled}
            opacity={iapp_mechanical_treatment.opacity}
            layer_code={iapp_mechanical_treatment.layer_code}
            bcgw_code={iapp_mechanical_treatment.bcgw_code}
            activity_subtype={iapp_mechanical_treatment.activity_subtype}
            poi_type={iapp_mechanical_treatment.poi_type}
            layer_mode={iapp_mechanical_treatment.layer_mode}
            inputGeo={props.inputGeo}
            color_code={iapp_mechanical_treatment.color_code}
            zIndex={iapp_records.zIndex + iapp_mechanical_treatment.zIndex}
          />
        ),
        [iapp_mechanical_treatment, iapp_records.zIndex, props.inputGeo]
      )}

      {useMemo(
        () => (
          <IndependentLayer
            enabled={iapp_monitoring_records.enabled}
            opacity={iapp_monitoring_records.opacity}
            layer_code={iapp_monitoring_records.layer_code}
            bcgw_code={iapp_monitoring_records.bcgw_code}
            activity_subtype={iapp_monitoring_records.activity_subtype}
            poi_type={iapp_monitoring_records.poi_type}
            layer_mode={iapp_monitoring_records.layer_mode}
            inputGeo={props.inputGeo}
            color_code={iapp_monitoring_records.color_code}
            zIndex={iapp_records.zIndex + iapp_monitoring_records.zIndex}
          />
        ),
        [iapp_monitoring_records, iapp_records.zIndex, props.inputGeo]
      )}

      {useMemo(
        () => (
          <IndependentLayer
            enabled={iapp_biocontrol_release.enabled}
            opacity={iapp_biocontrol_release.opacity}
            layer_code={iapp_biocontrol_release.layer_code}
            bcgw_code={iapp_biocontrol_release.bcgw_code}
            activity_subtype={iapp_biocontrol_release.activity_subtype}
            poi_type={iapp_biocontrol_release.poi_type}
            layer_mode={iapp_biocontrol_release.layer_mode}
            inputGeo={props.inputGeo}
            color_code={iapp_biocontrol_release.color_code}
            zIndex={iapp_records.zIndex + iapp_biocontrol_release.zIndex}
          />
        ),
        [iapp_biocontrol_release, iapp_records.zIndex, props.inputGeo]
      )}

      {useMemo(
        () => (
          <IndependentLayer
            enabled={iapp_biocontrol_dispersal.enabled}
            opacity={iapp_biocontrol_dispersal.opacity}
            layer_code={iapp_biocontrol_dispersal.layer_code}
            bcgw_code={iapp_biocontrol_dispersal.bcgw_code}
            activity_subtype={iapp_biocontrol_dispersal.activity_subtype}
            poi_type={iapp_biocontrol_dispersal.poi_type}
            layer_mode={iapp_biocontrol_dispersal.layer_mode}
            inputGeo={props.inputGeo}
            color_code={iapp_biocontrol_dispersal.color_code}
            zIndex={iapp_records.zIndex + iapp_biocontrol_dispersal.zIndex}
          />
        ),
        [iapp_biocontrol_dispersal, iapp_records.zIndex, props.inputGeo]
      )}

      {useMemo(
        () => (
          <IndependentLayer
            enabled={iapp_biocontrol_monitoring.enabled}
            opacity={iapp_biocontrol_monitoring.opacity}
            layer_code={iapp_biocontrol_monitoring.layer_code}
            bcgw_code={iapp_biocontrol_monitoring.bcgw_code}
            activity_subtype={iapp_biocontrol_monitoring.activity_subtype}
            poi_type={iapp_biocontrol_monitoring.poi_type}
            layer_mode={iapp_biocontrol_monitoring.layer_mode}
            inputGeo={props.inputGeo}
            color_code={iapp_biocontrol_monitoring.color_code}
            zIndex={iapp_records.zIndex + iapp_biocontrol_monitoring.zIndex}
          />
        ),
        [iapp_biocontrol_monitoring, iapp_records.zIndex, props.inputGeo]
      )}
    </>
  );
};

export default IAPPLayers;

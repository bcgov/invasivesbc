import { LatLngBoundsExpression, LatLngExpression, rectangle } from 'leaflet';
import React from 'react';
import { Circle, FeatureGroup, LayerGroup, LayersControl, Marker, Popup, Rectangle, WMSTileLayer } from 'react-leaflet';
import { DataBCLayer, LayerMode } from './LayerLoaderHelpers/DataBCRenderLayer';
import 'leaflet/dist/leaflet.css';
import { JurisdictionsLayer } from './LayerLoaderHelpers/JurisdictionsLayer';
import { ControlWithHooks } from './Tools/ToolTypes/Data/CustomLeafletPickerControl';
import { selectMap } from 'state/reducers/map';
import { useSelector } from 'react-redux';

export const LayerPickerBasic = (props) => {
  const mapState = useSelector(selectMap);
  const center: LatLngExpression = [51.505, -0.09];
  const rectangle: LatLngBoundsExpression = [
    [51.49, -0.08],
    [51.5, -0.06]
  ];

  const layers = {
    'Regional Districts': { layerCode: 'WHSE_LEGAL_ADMIN_BOUNDARIES.ABMS_REGIONAL_DISTRICTS_SP' }
  };

  return (
    <LayersControl position="topright">
      <LayersControl.Overlay checked={mapState?.simplePickerLayers?.['Regional Districts']} name="Regional Districts">
        <LayerGroup>
          <DataBCLayer
            enabled={true}
            transparent={true}
            layer_mode={LayerMode.WMSOnline}
            bcgw_code={layers['Regional Districts'].layerCode}
            opacity={0.3}
            zIndex={3501}
          />
        </LayerGroup>
      </LayersControl.Overlay>
      <LayersControl.Overlay checked={false} name="BC Parks">
        <LayerGroup>
          <DataBCLayer
            enabled={true}
            transparent={true}
            layer_mode={LayerMode.WMSOnline}
            bcgw_code="WHSE_TANTALIS.TA_PARK_ECORES_PA_SVW"
            opacity={0.3}
            zIndex={3514}
          />
        </LayerGroup>
      </LayersControl.Overlay>
      <LayersControl.Overlay checked={false} name="Municipality Boundaries">
        <LayerGroup>
          <DataBCLayer
            enabled={true}
            transparent={true}
            layer_mode={LayerMode.WMSOnline}
            bcgw_code="WHSE_LEGAL_ADMIN_BOUNDARIES.ABMS_MUNICIPALITIES_SP"
            opacity={0.3}
            zIndex={3502}
          />
        </LayerGroup>
      </LayersControl.Overlay>
      <LayersControl.Overlay checked={false} name="BC Major Watersheds">
        <LayerGroup>
          <DataBCLayer
            enabled={true}
            transparent={true}
            layer_mode={LayerMode.WMSOnline}
            bcgw_code="WHSE_BASEMAPPING.BC_MAJOR_WATERSHEDS"
            opacity={0.3}
            zIndex={3504}
          />
        </LayerGroup>
      </LayersControl.Overlay>
      <LayersControl.Overlay checked={false} name="Freshwater Atlas Rivers">
        <LayerGroup>
          <DataBCLayer
            enabled={true}
            transparent={true}
            layer_mode={LayerMode.WMSOnline}
            bcgw_code="WHSE_BASEMAPPING.FWA_RIVERS_POLY"
            opacity={0.3}
            zIndex={3505}
          />
        </LayerGroup>
      </LayersControl.Overlay>

      <LayersControl.Overlay checked={false} name="Freshwater Lakes">
        <LayerGroup>
          <DataBCLayer
            enabled={true}
            transparent={true}
            layer_mode={LayerMode.WMSOnline}
            bcgw_code="WHSE_LAND_AND_NATURAL_RESOURCE.EAUBC_LAKES_SP"
            opacity={0.3}
            zIndex={3507}
          />
        </LayerGroup>
      </LayersControl.Overlay>
      <LayersControl.Overlay checked={false} name="Freshwater Atlas Stream Network">
        <LayerGroup>
          <DataBCLayer
            enabled={true}
            transparent={true}
            layer_mode={LayerMode.WMSOnline}
            bcgw_code="WHSE_BASEMAPPING.FWA_STREAM_NETWORKS_SP"
            opacity={0.3}
            zIndex={3508}
          />
        </LayerGroup>
      </LayersControl.Overlay>

      <LayersControl.Overlay checked={false} name="Water Licenses Drinking Water">
        <LayerGroup>
          <DataBCLayer
            enabled={true}
            transparent={true}
            layer_mode={LayerMode.WMSOnline}
            bcgw_code="WHSE_WATER_MANAGEMENT.WLS_BC_POD_DRINKNG_SOURCES_SP"
            opacity={0.3}
            zIndex={3509}
          />
        </LayerGroup>
      </LayersControl.Overlay>

      <LayersControl.Overlay checked={false} name="Water Rights Licenses">
        <LayerGroup>
          <DataBCLayer
            enabled={true}
            transparent={true}
            layer_mode={LayerMode.WMSOnline}
            bcgw_code="WHSE_WATER_MANAGEMENT.WLS_WATER_RIGHTS_LICENCES_SV"
            opacity={0.3}
            zIndex={3510}
          />
        </LayerGroup>
      </LayersControl.Overlay>

      <LayersControl.Overlay checked={false} name="Water Wells">
        <LayerGroup>
          <DataBCLayer
            enabled={true}
            transparent={true}
            layer_mode={LayerMode.WMSOnline}
            bcgw_code="WHSE_WATER_MANAGEMENT.GW_WATER_WELLS_WRBC_SVW"
            opacity={0.3}
            zIndex={3511}
          />
        </LayerGroup>
      </LayersControl.Overlay>

      <LayersControl.Overlay checked={true} name="Digital Road Atlas (DRA) - Master Partially-Attributed Roads">
        <LayerGroup>
          <DataBCLayer
            enabled={true}
            transparent={true}
            layer_mode={LayerMode.WMSOnline}
            bcgw_code="WHSE_BASEMAPPING.DRA_DGTL_ROAD_ATLAS_MPAR_SP"
            opacity={0.3}
            zIndex={3512}
          />
        </LayerGroup>
      </LayersControl.Overlay>

      <LayersControl.Overlay checked={true} name="MOTI RFI">
        <LayerGroup>
          <DataBCLayer
            enabled={true}
            transparent={true}
            layer_mode={LayerMode.WMSOnline}
            bcgw_code="WHSE_IMAGERY_AND_BASE_MAPS.MOT_ROAD_FEATURES_INVNTRY_SP"
            opacity={1.0}
            zIndex={3513}
          />
        </LayerGroup>
      </LayersControl.Overlay>
    </LayersControl>
  );
};

import { circleMarker, LatLngBoundsExpression, LatLngExpression } from 'leaflet';
import React from 'react';
import {
  GeoJSON,
  Circle,
  FeatureGroup,
  LayerGroup,
  LayersControl,
  Marker,
  Popup,
  Rectangle,
  WMSTileLayer
} from 'react-leaflet';
import { DataBCLayer, LayerMode } from './DataBCRenderLayer';
import 'leaflet/dist/leaflet.css';
import LayersIcon from '@mui/icons-material/Layers';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@mui/material';
import Control from './CustomMapControl';
import SettingsIcon from '@mui/icons-material/Settings';
import { TOGGLE_CUSTOMIZE_LAYERS } from 'state/actions';

export const LayerPickerBasic = (props) => {
  const simplePickerLayers = useSelector((state: any) => state.Map.simplePickerLayers);
  const center: LatLngExpression = [51.505, -0.09];
  const serverBoundariesToDisplay = useSelector((state: any) => state.Map.serverBoundaries);
  const clientBoundariesToDisplay = useSelector((state: any) => state.Map.clientBoundaries);
  const rectangle: LatLngBoundsExpression = [
    [51.49, -0.08],
    [51.5, -0.06]
];
const dispatch = useDispatch();

  const layers = {
    'Regional Districts': { layerCode: 'WHSE_LEGAL_ADMIN_BOUNDARIES.ABMS_REGIONAL_DISTRICTS_SP' }
  };

  return (
    <LayersControl position="topright">
      {simplePickerLayers
        ? Object.keys(simplePickerLayers).map((layer, i) => {
            return (
              <LayersControl.Overlay key={'overlay' + i}checked={simplePickerLayers?.[layer]} name={layer}>
                <LayerGroup>
                  <DataBCLayer
                    key={'databc' + i}
                    enabled={true}
                    transparent={true}
                    layer_mode={LayerMode.WMSOnline}
                    bcgw_code={layers[layer].layerCode}
                    opacity={0.3}
                    zIndex={3501}
                  />
                </LayerGroup>
              </LayersControl.Overlay>
            );
          })
        : null}
      <LayersControl.Overlay key={'overlay' + 'a'} checked={simplePickerLayers?.['Regional Districts']} name="Regional Districts">
        <LayerGroup>
          <DataBCLayer
                    key={'databc' + 'a'}
            enabled={true}
            transparent={true}
            layer_mode={LayerMode.WMSOnline}
            bcgw_code={'WHSE_FOREST_VEGETATION.VEG_CONSOLIDATED_CUT_BLOCKS_SP'}
            opacity={0.3}
            zIndex={9501}
          />
        </LayerGroup>
      </LayersControl.Overlay>
      <LayersControl.Overlay key={'overlay' + 'b'} checked={simplePickerLayers?.['Regional Districts']} name="Regional Districts">
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
      <LayersControl.Overlay key={'overlay' + 'c'}  checked={false} name="BC Parks">
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
      <LayersControl.Overlay key={'overlay' + 'd'}  checked={false} name="Conservancy Areas">
        <LayerGroup>
          <DataBCLayer
            enabled={true}
            transparent={true}
            layer_mode={LayerMode.WMSOnline}
            bcgw_code="WHSE_TANTALIS.TA_CONSERVANCY_AREAS_SVW"
            opacity={0.3}
            zIndex={3515}
          />
        </LayerGroup>
      </LayersControl.Overlay>
      <LayersControl.Overlay key={'overlay' + 'e'}  checked={false} name="Municipality Boundaries">
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
      <LayersControl.Overlay key={'overlay' + 'f'}  checked={false} name="BC Major Watersheds">
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
      <LayersControl.Overlay key={'overlay' + 'g'}  checked={false} name="Freshwater Atlas Rivers">
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

      <LayersControl.Overlay key={'overlay' + 'h'}  checked={false} name="Freshwater Lakes">
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
      <LayersControl.Overlay key={'overlay' + 'i'}  checked={false} name="Freshwater Atlas Stream Network">
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

      <LayersControl.Overlay key={'overlay' + 'j'}  checked={false} name="Water Licenses Drinking Water">
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

      <LayersControl.Overlay key={'overlay' + 'k'}  checked={false} name="Water Rights Licenses">
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

      <LayersControl.Overlay key={'overlay' + 'l'}  checked={false} name="Water Wells">
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

      <LayersControl.Overlay key={'overlay' + 'm'}  checked={true} name="Digital Road Atlas (DRA) - Master Partially-Attributed Roads">
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

      <LayersControl.Overlay key={'overlay' + 'n'}  checked={true} name="MOTI RFI">
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
      {serverBoundariesToDisplay?.map((boundary, i) => {
        return (
          <LayersControl.Overlay key={'overlayserverboundaries' + i}  checked={true} name={'KML/KMZ: ' + boundary.title}>
            <LayerGroup>
              <GeoJSON data={boundary.geojson} 
              pointToLayer={(feature, latlng) => {
                return circleMarker(latlng, {
                  radius: 2
                });
              }}/>
            </LayerGroup>
          </LayersControl.Overlay>
        );
      })}
      {clientBoundariesToDisplay?.map((boundary, i) => {
        return (
          <LayersControl.Overlay key={'clientboundaries' + i} checked={true} name={'Drawn locally' + boundary.title}>
            <LayerGroup>
              <GeoJSON data={boundary.geojson} />
            </LayerGroup>
          </LayersControl.Overlay>
        );
      })}

      {props.children}
      <Control position="topright">
      </Control>
    </LayersControl>
  );
};

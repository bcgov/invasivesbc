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
  WMSTileLayer,
  useMap
} from 'react-leaflet';
import { DataBCLayer, LayerMode } from './DataBCRenderLayer';
import 'leaflet/dist/leaflet.css';
import LayersIcon from '@mui/icons-material/Layers';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from '@mui/material';
import Control from './CustomMapControl';
import SettingsIcon from '@mui/icons-material/Settings';
import { SAVE_LAYER_LOCALSTORAGE, TOGGLE_CUSTOMIZE_LAYERS} from 'state/actions';

export const LayerPickerBasic = (props) => {
  const center: LatLngExpression = [51.505, -0.09];
  const simplePickerLayers = useSelector((state: any) => state.Map.simplePickerLayers2);
  const serverBoundariesToDisplay = useSelector((state: any) => state.Map.serverBoundaries);
  const clientBoundariesToDisplay = useSelector((state: any) => state.Map.clientBoundaries);
  const rectangle: LatLngBoundsExpression = [
    [51.49, -0.08],
    [51.5, -0.06]
];
const dispatch = useDispatch();
const map = useMap();

map.on('overlayadd', (event) => {
  dispatch({
    type: SAVE_LAYER_LOCALSTORAGE,
    payload: {
      name: event.name,
      checked: true
    }
  });
})
map.on('overlayremove', (event) => {
  dispatch({
    type: SAVE_LAYER_LOCALSTORAGE,
    payload: {
      name: event.name,
      checked: false
    }
  });
})

  const layers = {
    'Regional Districts': {
      layerCode: 'WHSE_LEGAL_ADMIN_BOUNDARIES.ABMS_REGIONAL_DISTRICTS_SP',
      zIndex: 3501 },
    'BC Parks': {
      layerCode: 'WHSE_TANTALIS.TA_PARK_ECORES_PA_SVW',
      zIndex: 3514 },
    'Conservancy Areas': {
      layerCode: 'WHSE_TANTALIS.TA_CONSERVANCY_AREAS_SVW',
      zIndex: 3515 },
    'Municipality Boundaries': {
      layerCode: 'WHSE_LEGAL_ADMIN_BOUNDARIES.ABMS_MUNICIPALITIES_SP',
      zIndex: 3502 },
    'BC Major Watersheds': {
      layerCode: 'WHSE_BASEMAPPING.BC_MAJOR_WATERSHEDS',
      zIndex: 3504 },
    'Freshwater Atlas Rivers': {
      layerCode: 'WHSE_BASEMAPPING.FWA_RIVERS_POLY',
      zIndex: 3505 },
    'Freshwater Lakes': {
      layerCode: 'WHSE_LAND_AND_NATURAL_RESOURCE.EAUBC_LAKES_SP',
      zIndex: 3507 },
    'Freshwater Atlas Stream Network': {
      layerCode: 'WHSE_BASEMAPPING.FWA_STREAM_NETWORKS_SP',
      zIndex: 3508 },
    'Water Licenses Drinking Water': {
      layerCode: 'WHSE_WATER_MANAGEMENT.WLS_BC_POD_DRINKNG_SOURCES_SP',
      zIndex: 3509 },
    'Water Rights Licenses': {
      layerCode: 'WHSE_WATER_MANAGEMENT.WLS_WATER_RIGHTS_LICENCES_SV',
      zIndex: 3510 },
    'Water Wells': {
      layerCode: 'WHSE_WATER_MANAGEMENT.GW_WATER_WELLS_WRBC_SVW',
      zIndex: 3511 },
    'Digital Road Atlas (DRA) - Master Partially-Attributed Roads': {
      layerCode: 'WHSE_BASEMAPPING.DRA_DGTL_ROAD_ATLAS_MPAR_SP',
      zIndex: 3512 },
    'MOTI RFI': {
      layerCode: 'WHSE_IMAGERY_AND_BASE_MAPS.MOT_ROAD_FEATURES_INVNTRY_SP',
      zIndex: 3513 },
  };

  return (
    <LayersControl position="topright">
      {simplePickerLayers
        ? (simplePickerLayers).map((layer, i) => {
            return (
              <LayersControl.Overlay checked={layer?.checked} name={layer?.title}>
                <LayerGroup>
                  <DataBCLayer
                    key={'databc' + i}
                    enabled={true}
                    transparent={true}
                    layer_mode={LayerMode.WMSOnline}
                    bcgw_code={layers[layer?.title]?.layerCode}
                    opacity={layer?.title === 'MOTI RFI' ? 1.0 : 0.3}
                    zIndex={layers[layer?.title]?.zIndex}
                  />
                </LayerGroup>
              </LayersControl.Overlay>
            );
          })
        : null}
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
        <Button
          sx={{ maxWidth: '15px' }}
          variant="contained"
          onClick={() => {
            dispatch({type: TOGGLE_CUSTOMIZE_LAYERS })
          }}>
          <LayersIcon sx={{ width: '15px' }} />
          <SettingsIcon sx={{ width: '15px' }} />
        </Button>
      </Control>
    </LayersControl>
  );
};

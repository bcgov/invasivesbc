import { LatLngBoundsExpression, LatLngExpression, rectangle } from 'leaflet';
import React from 'react';
import { Circle, FeatureGroup, LayerGroup, LayersControl, Marker, Popup, Rectangle, WMSTileLayer } from 'react-leaflet';
import { DataBCLayer, LayerMode } from './LayerLoaderHelpers/DataBCRenderLayer';
import 'leaflet/dist/leaflet.css';

export const LayerPickerBasic = (props) => {
  const center: LatLngExpression = [51.505, -0.09];
  const rectangle: LatLngBoundsExpression = [
    [51.49, -0.08],
    [51.5, -0.06]
  ];

  return (
    <LayersControl position="topright">
      <LayersControl.Overlay checked={true} name="Regional Disctricts">
        <LayerGroup>
          <DataBCLayer
            enabled={true}
            layer_mode={LayerMode.WMSOnline}
            bcgw_code="WHSE_LEGAL_ADMIN_BOUNDARIES.ABMS_REGIONAL_DISTRICTS_SP"
            opacity={0.5}
            zIndex={3501}
          />
        </LayerGroup>
      </LayersControl.Overlay>
      <LayersControl.Overlay checked name="Layer group with circles">
        <LayerGroup>
          <Circle center={center} pathOptions={{ fillColor: 'blue' }} radius={200} />
          <Circle center={center} pathOptions={{ fillColor: 'red' }} radius={100} stroke={false} />
          <LayerGroup>
            <Circle center={[51.51, -0.08]} pathOptions={{ color: 'green', fillColor: 'green' }} radius={100} />
          </LayerGroup>
        </LayerGroup>
      </LayersControl.Overlay>
      <LayersControl.Overlay name="Feature group">
        <FeatureGroup pathOptions={{ color: 'purple' }}>
          <Popup>Popup in FeatureGroup</Popup>
          <Circle center={[51.51, -0.06]} radius={200} />
          <Rectangle bounds={rectangle} />
        </FeatureGroup>
      </LayersControl.Overlay>
    </LayersControl>
  );
};

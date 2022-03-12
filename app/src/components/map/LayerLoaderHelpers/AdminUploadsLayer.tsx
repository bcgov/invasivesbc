import React from 'react';
import L from 'leaflet';
import { createLayerComponent } from '@react-leaflet/core';

const createAdminLayerComponent = (props, context) => {
  const { geoJSON } = props;
  return {
    instance: L.geoJSON(geoJSON, {
      onEachFeature: (feature, layer) => {
        if (feature.properties && feature.properties.id) {
          layer.bindPopup(`ID: ${feature.properties.id}`);
        }
      }
    }),
    context
  };
};

const updateAdminLayerComponent = (instance, props, previousProps) => {};

const AdminLayerComponent = createLayerComponent(createAdminLayerComponent, updateAdminLayerComponent);

export const AdminUploadsLayer = (props) => {
  const geoJSON = props.geoJSON;

  return <>{geoJSON && <AdminLayerComponent geoJSON={geoJSON} />}</>;
};

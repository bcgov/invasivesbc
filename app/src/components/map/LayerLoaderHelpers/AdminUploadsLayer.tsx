import {useDataAccess} from 'hooks/useDataAccess';
import React, {useEffect, useState} from 'react';
import L from 'leaflet';
import {createLayerComponent} from '@react-leaflet/core';
import {useInvasivesApi} from "../../../hooks/useInvasivesApi";

const createAdminLayerComponent = (props, context) => {
  const {geoJSON} = props;
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

const updateAdminLayerComponent = (instance, props, previousProps) => {
};

const AdminLayerComponent = createLayerComponent(createAdminLayerComponent, updateAdminLayerComponent);

export const AdminUploadsLayer = (props) => {
  const [geoJSON, setGeoJSON] = useState(null);
  const api = useInvasivesApi();

  useEffect(() => {
    api.getAdminUploadGeoJSONLayer().then(data => {
      setGeoJSON(data);
    });
  }, []);

  return <>{geoJSON && <AdminLayerComponent geoJSON={geoJSON} />}</>;
};

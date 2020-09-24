import React, { useEffect } from 'react';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet.locatecontrol'
import 'leaflet.locatecontrol/dist/L.Control.Locate.css'
import 'leaflet.locatecontrol/dist/L.Control.Locate.mapbox.css'
import './MapContainer.css';

interface IMapContainerProps {
  classes?: any;
}

const MapContainer: React.FC<IMapContainerProps> = (props) => {
  const renderMap = () => {
    console.log('Map componentDidMount!');

    var map = L.map('map', { zoomControl: false }).setView([55, -128], 10);
    // On init setup

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const options = {
      icon: 'blah',
      flyTo: true
    };

    L.control.locate(options).addTo(map);

    const esriBase = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 24,
        maxNativeZoom: 17
      }
    );

    const bcBase = L.tileLayer(
      'https://maps.gov.bc.ca/arcgis/rest/services/province/roads_wm/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 24
      }
    ).addTo(map);

    var drawnItems = new L.FeatureGroup();

    map.addLayer(drawnItems);

    var drawControl = new L.Control.Draw({
      position: 'topright',
      draw: {
        marker: false,
        circle: true
      },
      edit: {
        featureGroup: drawnItems
        // remove: true,
        // edit: true
      }
    });

    map.addControl(drawControl);

    const baseLayers = {
      'Esri Imagery': esriBase,
      'BC Government': bcBase
    };

    L.control.layers(baseLayers).addTo(map);

    setTimeout(function () {
      map.invalidateSize();
      map.setView([55, -128], 10);
    }, 1000);

    map.on('draw:created', (feature) => {
      console.log(feature.layer.toGeoJSON());
      drawnItems.addLayer(feature.layer);
    });

    map.on('draw:drawvertex', function (layerGroup) {
      console.log(layerGroup);
    });

    map.on('draw:drawstart', function (layerGroup) {
      drawnItems.clearLayers(); // Clear previous shape
    });

    map.on('draw:drawstop', function (layerGroup) {
      console.log('stopped');
      console.log(layerGroup);
    });

    map.on('draw:deleted', function () {
      console.log('deleted');
    });

    map.on('draw:editstart', function () {
      console.log('editstart');
    });

    map.on('draw:editmove', function () {
      console.log('editmove');
    });

    map.on('draw:editresize', function () {
      console.log('editresize');
    });

    map.on('draw:editvertex', function () {
      console.log('editvertex');
    });

    map.on('draw:editstop', function () {
      console.log('editstop');
    });

    map.on('draw:deletestart', function () {
      console.log('deletestart');
    });

    map.on('draw:deletestop', function () {
      console.log('deletestop');
    });
  };

  useEffect(() => renderMap(), []);

  return <div id="map" className={props.classes.map} />;
};

export default MapContainer;

// import React, { useEffect } from 'react';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet.locatecontrol';
import 'leaflet.locatecontrol/dist/L.Control.Locate.css';
import 'leaflet.locatecontrol/dist/L.Control.Locate.mapbox.css';
import './MapContainer.css';
import { DatabaseContext } from 'contexts/DatabaseContext';
import React, { useContext, useEffect, useState } from 'react';
// import * as PouchDB from 'pouchdb';
// import 'leaflet.tilelayer.pouchdbcached';


// console.log('PouchDB',PouchDB);

interface IMapContainerProps {
  classes?: any;
  activity?: any;
}


const MapContainer: React.FC<IMapContainerProps> = (props) => {

  const databaseContext = useContext(DatabaseContext);

  const renderMap = () => {
    console.log('Map componentDidMount!');


    var map = L.map('map', { zoomControl: false }).setView([55, -128], 10);
    // On init setup

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    const options = {
      icon: 'bullseye',
      flyTo: true,
      iconElementTag: 'div'
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
        maxZoom: 24,
        useCache: true,
        cacheMaxAge: 1.72e8 // 48 hours
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

    // Add any previous drawn feature
    databaseContext.database.get('1234')
      .then((doc) => {
        const style = {
          "color": "#ff7800",
          "weight": 5,
          "opacity": 0.65
        };

        const layer = L.geoJSON(doc,style);
        console.log(layer);
        drawnItems.addLayer(layer);
        console.log(doc);
      });


    map.on('draw:created', (feature) => {
      drawnItems.addLayer(feature.layer);

      var layer = feature.layer.toGeoJSON();
      layer._id = '1234';
      databaseContext.database.put(layer);
    });

    map.on('draw:drawvertex', function (layerGroup) {
      console.log('drawvertex',layerGroup);
    });

    map.on('draw:drawstart', function () {
      drawnItems.clearLayers(); // Clear previous shape
    });

    map.on('draw:drawstop', function (layerGroup) {
      console.log('stopped');
    });

    map.on('draw:deleted', function () {
      console.log('deleted');
      databaseContext.database.get('1234')
        .then((doc) => {
          databaseContext.database.remove(doc);
          console.log(doc)
        });
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

    map.on('draw:editstop', function (layerGroup) {
      console.log('editstop');
      console.log('layerGroup',layerGroup)
    });

    map.on('draw:deletestart', function () {
      console.log('deletestart');
    });

    map.on('draw:deletestop', function () {
      console.log('deletestop');
    });
  };

  useEffect(() => {
    if (!databaseContext.database) {
      // database not ready
      return;
    }

    renderMap();
  }, [databaseContext]);

  return <div id="map" className={props.classes.map} />;
};

export default MapContainer;

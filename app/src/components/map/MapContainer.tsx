import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet.locatecontrol';
import 'leaflet.locatecontrol/dist/L.Control.Locate.css';
import 'leaflet.locatecontrol/dist/L.Control.Locate.mapbox.css';
import './MapContainer.css';
import { DatabaseContext } from 'contexts/DatabaseContext';
import React, { useState, useContext, useEffect } from 'react';



import {
  ActivityStatus,
} from 'constants/activities'

interface IMapContainerProps {
  classes?: any;
  activity?: any;
}


const MapContainer: React.FC<IMapContainerProps> = (props) => {

  const databaseContext = useContext(DatabaseContext);

  const [geo, setGeo] = useState(null)

  const saveGeo = async (doc: any, geoJSON: any) => {
    await databaseContext.database.upsert(doc._id, (activityDoc) => {
      return { ...activityDoc, geometry: [geoJSON], status: ActivityStatus.EDITED, dateUpdated: new Date() };
    });
  };

  useEffect(() => {
    if(geo && props)
    {
      saveGeo(props.activity, geo)
    }
  },[geo])

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
        featureGroup: drawnItems,
        remove: true,
        edit: true
      }
    });

    map.addControl(drawControl);

    const baseLayers = {
      'Esri Imagery': esriBase,
      'BC Government': bcBase
    };

    L.control.layers(baseLayers).addTo(map);

    //load last poly
    if(props.activity && props.activity.geometry)
    {
        const style = {
          "color": "#ff7800",
           "weight": 5,
           "opacity": 0.65
        };
 
        L.geoJSON(props.activity.geometry,{
          style: style,
          onEachFeature: function (_: any,layer: any) {
            drawnItems.addLayer(layer);
          }
        });
    }



    map.on('draw:created', (feature) => {
      let aGeo = feature.layer.toGeoJSON()
      setGeo(aGeo)
      drawnItems.addLayer(feature.layer);
    });


    map.on('draw:drawstart', function () {
      drawnItems.clearLayers(); // Clear previous shape
      setGeo(null)
    });

    map.on('draw:editstop', async function (layerGroup) {
      const feature = drawnItems?.toGeoJSON()?.features[0];
      if (feature) {
          setGeo(feature)
      }
    });

    map.on('draw:deleted', function () {
      console.log('deleted');
      setGeo(null)
    });

    /*
    map.on('draw:editstart', function (event) {
      console.log('editstart',event);
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

    map.on('draw:drawvertex', function (layerGroup) {
      console.log('drawvertex',layerGroup);
    });

    map.on('draw:drawstop', function (layerGroup) {
      console.log('stopped');
    });

    map.on('draw:deletestart', function () {
      console.log('deletestart');
    });

    map.on('draw:deletestop', function () {
      console.log('deletestop');
    });
    */
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

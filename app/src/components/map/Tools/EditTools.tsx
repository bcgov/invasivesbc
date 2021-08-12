import { useEffect, useRef, useState } from 'react';
import { LeafletContextInterface, useLeafletContext } from '@react-leaflet/core';
import { useMapEvent } from 'react-leaflet';
import * as turf from '@turf/turf';
import L from 'leaflet';
import React from 'react';

const EditTools = (props) => {
  // This should get the 'FeatureGroup' connected to the tools
  const context = useLeafletContext() as LeafletContextInterface;
  const [geoKeys, setGeoKeys] = useState({});
  const [currentEditingLayer, setCurrentEditingLayer] = useState(null);
  const drawRef = useRef();
  console.dir(props.geometryState.geometry);

  // Put new feature into the FeatureGroup
  const onDrawCreate = (e: any) => {
    context.layerContainer.addLayer(e.layer);
    //console.log(context.map)
    let aGeo = e.layer.toGeoJSON();
    if (e.layerType === 'circle') {
      aGeo = { ...aGeo, properties: { ...aGeo.properties, radius: e.layer.getRadius() } };
    }

    aGeo = convertLineStringToPoly(aGeo);
    // Drawing one geo wipes all others
    let newState = [];
    newState = props.geometryState.geometry ? [...props.geometryState.geometry] : newState;
    newState = aGeo ? [...newState, aGeo] : newState;
    props.geometryState.setGeometry([...newState]);
    (context.layerContainer as any).clearLayers();
  };
  const onEditStop = (e: any) => {
    //console.log(e);
    //console.dir((context.layerContainer as any).toGeoJSON());
    //console.dir((context.layerContainer as any).getLayers());

    let updatedGeoJSON = [];
    (context.layerContainer as any).eachLayer((layer) => {
      console.dir(layer);
      let aGeo = layer.toGeoJSON();
      if (layer.feature.properties.radius) {
        aGeo = { ...aGeo, properties: { ...aGeo.properties, radius: layer._mRadius } };
      } else if (e.layerType === 'rectangle') {
        //aGeo = { ...aGeo, properties: { ...aGeo.properties, isRectangle: true } };
      }
      aGeo = convertLineStringToPoly(aGeo);

      updatedGeoJSON.push(aGeo);
    });

    console.dir(updatedGeoJSON);
    //console.dir(e.layer.getRadius());
  };

  // Grab the map object
  let map = useMapEvent('draw:created' as any, onDrawCreate);

  let mapDrawStart = useMapEvent('draw:drawstart' as any, () => {
    (context.layerContainer as any).clearLayers();
  });
  let mapDrawDeleted = useMapEvent('draw:deleted' as any, () => {
    props.geometryState.setGeometry([]);
  });
  let mapEditSave = useMapEvent('draw:edited' as any, onEditStop);

  const convertLineStringToPoly = (aGeo: any) => {
    if (aGeo.geometry.type === 'LineString') {
      const buffer = prompt('Enter buffer width (total) in meters', '1');
      const buffered = turf.buffer(aGeo.geometry, parseInt(buffer, 10) / 1000, { units: 'kilometers', steps: 1 });
      const result = turf.featureCollection([buffered, aGeo.geometry]);

      return { ...aGeo, geometry: result.features[0].geometry };
    }

    return aGeo;
  };

  const setGeometryMapBounds = () => {
    if (
      props.geometryState?.geometry?.length &&
      !(props.geometryState?.geometry[0].geometry.type === 'Point' && !props.geometryState?.geometry[0].radius)
    ) {
      const allGeosFeatureCollection = {
        type: 'FeatureCollection',
        features: [...props.geometryState.geometry]
      };
      const bboxCoords = turf.bbox(allGeosFeatureCollection);

      map.fitBounds([
        [bboxCoords[1], bboxCoords[0]],
        [bboxCoords[3], bboxCoords[2]]
      ]);
    }
  };

  const updateMapOnGeometryChange = () => {
    // upload from geometrystate props
    // updates drawnItems with the latest geo changes, attempting to only draw new geos and delete no-longer-present ones
    const newGeoKeys = { ...geoKeys };
    //console.dir(props.geometryState);

    if (props.geometryState) {
      // For each geometry, add a new layer to the drawn features
      props.geometryState.geometry.forEach((collection) => {
        const style = {
          weight: 4,
          opacity: 0.65
        };

        const markerStyle = {
          radius: 10,
          weight: 4,
          stroke: true
        };

        L.geoJSON(collection, {
          style,
          pointToLayer: (feature: any, latLng: any) => {
            if (feature.properties.radius) {
              return L.circle(latLng, { radius: feature.properties.radius });
            } else {
              return L.circleMarker(latLng, markerStyle);
            }
          },
          onEachFeature: (feature: any, layer: any) => {
            context.layerContainer.addLayer(layer);
          }
        });
      });
    }
    if (props.interactiveGeometryState?.interactiveGeometry) {
      props.interactiveGeometryState.interactiveGeometry.forEach((interactObj) => {
        const key = interactObj.recordDocID || interactObj._id;
        if (newGeoKeys[key] && newGeoKeys[key].hash === JSON.stringify(interactObj) && newGeoKeys[key] !== true) {
          // old unchanged geo, no need to redraw
          newGeoKeys[key] = {
            ...newGeoKeys[key],
            updated: false
          };
          return;
        }

        // else prepare new Geo for drawing:
        const style = {
          color: interactObj.color,
          weight: 4,
          opacity: 0.65
        };

        const markerStyle = {
          radius: 10,
          weight: 4,
          stroke: true
        };

        const geo = L.geoJSON(interactObj.geometry, {
          // Note: the result of this isn't actually used, it seems?
          style,
          pointToLayer: (feature: any, latLng: any) => {
            if (feature.properties.radius) {
              return L.circle(latLng, { radius: feature.properties.radius });
            } else {
              return L.circleMarker(latLng, markerStyle);
            }
          },
          onEachFeature: (feature: any, layer: any) => {
            const content = interactObj.popUpComponent(interactObj.description);
            layer.on('click', () => {
              // Fires on click of single feature

              // Formulate a table containing all attributes
              let table = '<table><tr><th>Attribute</th><th>Value</th></tr>';
              Object.keys(feature.properties).forEach((f) => {
                if (f !== 'uploadedSpatial') {
                  table += `<tr><td>${f}</td><td>${feature.properties[f]}</td></tr>`;
                }
              });
              table += '</table>';

              const loc = turf.centroid(feature);
              const center = [loc.geometry.coordinates[1], loc.geometry.coordinates[0]];

              if (feature.properties.uploadedSpatial) {
                L.popup()
                  .setLatLng(center as L.LatLngExpression)
                  .setContent(table)
                  .openOn(map);
              } else {
                L.popup()
                  .setLatLng(center as L.LatLngExpression)
                  .setContent(content)
                  .openOn(map);
              }

              interactObj.onClickCallback();
            });
          }
        });
        newGeoKeys[key] = {
          hash: JSON.stringify(interactObj),
          geo: geo,
          updated: true
        };
      });
    }
    // Drawing step:
    Object.keys(newGeoKeys).forEach((key: any) => {
      if (newGeoKeys[key].updated === true) {
        // draw layers to map
        Object.values(newGeoKeys[key].geo._layers).forEach((layer: L.Layer) => {
          context.layerContainer.addLayer(layer);
        });
      } else if (newGeoKeys[key].updated === false) {
        return;
      } else {
        // remove old keys (delete step)
        Object.values(newGeoKeys[key].geo._layers).forEach((layer: L.Layer) => {
          context.layerContainer.removeLayer(layer);
        });
        delete newGeoKeys[key];
        return;
      }
      // reset updated status for next refresh:
      delete newGeoKeys[key].updated;
    });

    // update stored geos, mapped by key
    setGeoKeys(newGeoKeys);
  };

  useEffect(() => {
    if (!map) {
      return;
    }

    if (!props.geometryState?.geometry) {
      return;
    }

    setGeometryMapBounds();
    updateMapOnGeometryChange();
  }, [props.geometryState.geometry, props?.interactiveGeometryState?.interactiveGeometry]);

  // Get out if the tools are already defined.
  if (drawRef.current) return null;

  /**
   * This is where all the editing tool options are defined.
   * See: https://leaflet.github.io/Leaflet.draw/docs/leaflet-draw-latest.html
   */
  const options = {
    draw: {
      circlemarker: false
    },
    edit: {
      featureGroup: context.layerContainer,
      edit: true
    }
  };

  // Create drawing tool control
  drawRef.current = new (L.Control as any).Draw(options);

  // Add drawing tools to the map
  map.addControl(drawRef.current);

  return <div></div>;
};

export default EditTools;

import {Capacitor} from '@capacitor/core';
import {useLeafletContext} from '@react-leaflet/core';
import buffer from '@turf/buffer';
import bbox from '@turf/bbox';
import centroid from '@turf/centroid';
import * as turf from '@turf/helpers';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import React, {useEffect, useRef, useState} from 'react';
import {useMapEvent} from 'react-leaflet';
import {MobilePolylineDrawButton} from '../../Helpers/MobileDrawBtns';
import {MobileOnly} from "../../../../common/MobileOnly";

const circleORmarker = (feature, latLng, markerStyle) => {
  if (feature.properties.radius) {
    return L.circle(latLng, {radius: feature.properties.radius});
  } else {
    return L.circleMarker(latLng, markerStyle);
  }
};

const drawingStep = (newGeoKeys, context) => {
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
};

const formulateTable = (feature) => {
  let table = '<table><tr><th>Attribute</th><th>Value</th></tr>';
  Object.keys(feature.properties).forEach((f) => {
    if (f !== 'uploadedSpatial') {
      table += `<tr><td>${f}</td><td>${feature.properties[f]}</td></tr>`;
    }
  });
  table += '</table>';
  return table;
};

const EditTools = (props: any) => {
  // This should get the 'FeatureGroup' connected to the tools
  const [multiMode, setMultiMode] = useState(false);
  /* Removed toggling multimode for now:
  const toggleMode = () => {
    setMultiMode(!multiMode);
    var len = props.geometryState.geometry.length;
    if (!multiMode && len > 0) {
      var temp = props.geometryState.geometry[len - 1];
      props.geometryState.setGeometry([temp]);
    }
  };*/

  useEffect(() => {
    if (props.isPlanPage) {
      (context.layerContainer as any).clearLayers();
    } else {
      if (props.geometryState.geometry === null) {
        (context.layerContainer as any).clearLayers();
      }
    }
  }, [props.geometryState]);
  const context = useLeafletContext();
  const [geoKeys, setGeoKeys] = useState({});
  const drawRef = useRef();

  // Put new feature into the FeatureGroup
  const onDrawCreate = (e: any) => {
    (context.layerContainer as any).clearLayers();
    var newLayer = e.layer;

    context.layerContainer.addLayer(newLayer);

    let aGeo = newLayer.toGeoJSON();
    if (e.layerType === 'circle') {
      aGeo = {...aGeo, properties: {...aGeo.properties, radius: newLayer.getRadius()}};
    }
    aGeo = convertLineStringToPoly(aGeo);

    if (multiMode) {
      (context.layerContainer as any).clearLayers();
      let newState = [];
      newState = props.geometryState.geometry ? [...props.geometryState.geometry] : newState;
      newState = aGeo ? [...newState, aGeo] : newState;
      props.geometryState.setGeometry([...newState]);
    } else {
      (context.layerContainer as any).clearLayers();
      props.geometryState.setGeometry([aGeo]);
    }
  };
  const onEditStop = (e: any) => {
    let updatedGeoJSON = [];
    (context.layerContainer as any).eachLayer((layer) => {
      let aGeo = layer.toGeoJSON();
      if (layer.feature.properties.radius) {
        aGeo = {...aGeo, properties: {...aGeo.properties, radius: layer._mRadius}};
      }
      aGeo = convertLineStringToPoly(aGeo);

      updatedGeoJSON.push(aGeo);
    });

    props.geometryState.setGeometry(updatedGeoJSON);
  };

  const onDeleteStop = (e: any) => {
    let updatedGeoJSON = [];
    (context.layerContainer as any).eachLayer((layer) => {
      let aGeo = layer.toGeoJSON();
      aGeo = convertLineStringToPoly(aGeo);
      updatedGeoJSON.push(aGeo);
    });
    (context.layerContainer as any).clearLayers();
    props.geometryState.setGeometry(updatedGeoJSON);
  };

  // Grab the map object
  let map = useMapEvent('draw:created' as any, onDrawCreate);

  useMapEvent('draw:drawstart' as any, (e) => {
    // if (!multiMode) {
    (context.layerContainer as any).clearLayers();
    // }
  });
  useMapEvent('draw:deleted' as any, () => {
    props.geometryState.setGeometry([]);
  });
  useMapEvent('draw:deletestop' as any, onDeleteStop);
  useMapEvent('draw:edited' as any, onEditStop);

  const convertLineStringToPoly = (aGeo: any) => {
    if (aGeo?.geometry.type === 'LineString') {
      const buffer2 = prompt('Enter buffer width (total) in meters', '1');
      const buffered = buffer(aGeo.geometry, parseInt(buffer2, 10) / 1000, {units: 'kilometers', steps: 1});
      const result = turf.featureCollection([buffered, aGeo.geometry]);

      return {...aGeo, geometry: result.features[0].geometry};
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
      const bboxCoords = bbox(allGeosFeatureCollection);

      map.fitBounds([
        [bboxCoords[1], bboxCoords[0]],
        [bboxCoords[3], bboxCoords[2]]
      ]);
    }
  };

  // define default marker icon to override src defined in leaflet.css
  const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
  });

  const updateMapOnGeometryChange = () => {
    // upload from geometrystate props
    // updates drawnItems with the latest geo changes, attempting to only draw new geos and delete no-longer-present ones
    const newGeoKeys = {...geoKeys};

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
          pointToLayer: (feature: any, latLng: any) => circleORmarker(feature, latLng, markerStyle),
          onEachFeature: (feature: any, layer: any) => {
            context.layerContainer.addLayer(layer);
          }
        });
      });
    }
    // if (props.interactiveGeometryState?.interactiveGeometry) {
    //   props.interactiveGeometryState.interactiveGeometry.forEach((interactObj) => {
    //     const key = interactObj.recordDocID || interactObj._id;
    //     if (newGeoKeys[key] && newGeoKeys[key].hash === JSON.stringify(interactObj) && newGeoKeys[key] !== true) {
    //       // old unchanged geo, no need to redraw
    //       newGeoKeys[key] = {
    //         ...newGeoKeys[key],
    //         updated: false
    //       };
    //       return;
    //     }

    //     // else prepare new Geo for drawing:
    //     const style = {
    //       color: interactObj.color,
    //       weight: 4,
    //       opacity: 0.65
    //     };

    //     const markerStyle = {
    //       radius: 10,
    //       weight: 4,
    //       stroke: true
    //     };

    //     const geo = L.geoJSON(interactObj.geometry, {
    //       // Note: the result of this isn't actually used, it seems?
    //       style,
    //       pointToLayer: (feature: any, latLng: any) => circleORmarker(feature, latLng, markerStyle),
    //       onEachFeature: (feature: any, layer: any) => {
    //         const content = interactObj.popUpComponent(interactObj.description);
    //         layer.on('click', () => {
    //           // Fires on click of single feature

    //           // Formulate a table containing all attributes
    //           let table = formulateTable(feature);

    //           const loc = centroid(feature);
    //           const center = [loc.geometry.coordinates[1], loc.geometry.coordinates[0]];

    //           if (feature.properties.uploadedSpatial) {
    //             L.popup()
    //               .setLatLng(center as L.LatLngExpression)
    //               .setContent(table)
    //               .openOn(map);
    //           } else {
    //             L.popup()
    //               .setLatLng(center as L.LatLngExpression)
    //               .setContent(content)
    //               .openOn(map);
    //           }

    //           interactObj.onClickCallback();
    //         });
    //       }
    //     });
    //     newGeoKeys[key] = {
    //       hash: JSON.stringify(interactObj),
    //       geo: geo,
    //       updated: true
    //     };
    //   });
    // }
    // Drawing step:
    drawingStep(newGeoKeys, context);
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

    //setGeometryMapBounds();
    updateMapOnGeometryChange();
  }, [props.geometryState.geometry]);

  // Get out if the tools are already defined.
  if (!(drawRef?.current as any)?._map) {
    /**
     * This is where all the editing tool options are defined.
     * See: https://leaflet.github.io/Leaflet.draw/docs/leaflet-draw-latest.html
     */
    const options = {
      draw: {
        circlemarker: false,

        circle: false,
        polyline: {
          disabled: true
        },
        marker: {
          icon: DefaultIcon
        }
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
  }

  return (
    <div style={{}}>
      <MobileOnly>
        <MobilePolylineDrawButton
          convertLineStringToPoly={convertLineStringToPoly}
          setGeometry={props.geometryState.setGeometry}
          context={context.layerContainer}
        />
      </MobileOnly>

      {/*<IconButton
        //ref={divRef}
        className={themeContext.themeType ? toolClass.toolBtnDark : toolClass.toolBtnLight}
        onClick={toggleMode}>
        {multiMode ? (
          <img src={multi} style={{ width: 32, height: 32 }} />
        ) : (
          <img src={single} style={{ width: 32, height: 32 }} />
        )}
        </IconButton>*/}
    </div>
  );
};

export default EditTools;

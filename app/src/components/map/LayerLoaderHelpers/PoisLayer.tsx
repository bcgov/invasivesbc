import { DatabaseContext } from 'contexts/DatabaseContext';
import { useDataAccess } from 'hooks/useDataAccess';
import L from 'leaflet';
import React, { useContext, useState } from 'react';
import { useMap, useMapEvent } from 'react-leaflet';
import marker from '../Icons/POImarker.png';
import { GeoJSONVtLayer } from './GeoJsonVtLayer';
import { createPolygonFromBounds } from './LtlngBoundsToPoly';

export const PoisLayer = (props) => {
  const map = useMap();
  const mapBounds = createPolygonFromBounds(map.getBounds(), map).toGeoJSON();
  const [pois, setPois] = useState(null);
  //const [poiIDs, setPoiIDs] = useState(null);
  const [poiToRender, setPoiToRender] = useState([]);
  const dataAccess = useDataAccess();
  const databaseContext = useContext(DatabaseContext);
  /*
  useEffect(() => {
  const [poiIDs, setPoiIDs] = useState(null);
  const [pois, setPois] = useState(null);
  const [poiToRender, setPoiToRender] = useState([]);
  const dataAccess = useDataAccess();

  /*useEffect(() => {
    if (poiIDs.length > 0) {
      fetchPOIs();
    }
  }, [poiIDs]);*/

  const markerIcon = L.icon({
    iconUrl: marker,
    iconSize: [16, 16]
  });
  const options = {
    maxZoom: 24,
    tolerance: 3,
    debug: 0,
    style: {
      fillColor: '#00000',
      color: '#00000',
      stroke: true,
      opacity: props.opacity,
      fillOpacity: props.opacity - 0.2,
      weight: 5
    }
  };

  useMapEvent('moveend', () => {
    fetchData();
  });

  const fetchData = async () => {
    const poisData = await dataAccess.getPointsOfInterestLean({ search_feature: mapBounds }, databaseContext);
    const poisFeatureArray = [];
    const poisIDArray = [];
    console.log(poisData?.rows);
    poisData?.rows.forEach((row) => {
      poisFeatureArray.push(row.geojson ? row.geojson : row);
      poisIDArray.push(
        row.geojson
          ? row.geojson.properties.point_of_interest_id.toString()
          : row.properties.point_of_interest_id.toString()
      );
    });

    // removed for now: setPoiIDs(poisIDArray);
    setPois({ type: 'FeatureCollection', features: poisFeatureArray });
  };
  /*
  const fetchPOIs = async () => {
    console.log('fetching');
    console.log(await dataAccess.getPointsOfInterest({ point_of_interest_ids: things, limit: 50 }, databaseContext));
  };*/

  return (
    <>
      {
        pois && <GeoJSONVtLayer geoJSON={pois} options={options} /> //NOSONAR
        /*poiToRender &&
          poiToRender.map((poi) => {
            var coords = poi.point_of_interest_payload.geometry[0].geometry.coordinates;
            var species_positive = poi.point_of_interest_payload.species_positive;
            var species_negative = poi.point_of_interest_payload.species_negative;
            return (
              <Marker position={[coords[1], coords[0]]} icon={markerIcon}>
                <Tooltip direction="top" opacity={0.7}>
                  <div style={{ display: 'flex ', flexFlow: 'row nowrap' }}>
                    {species_positive && species_positive.map((s) => <>{s} </>)}
                    {species_negative && species_negative.map((s) => <>{s} </>)}
                  </div>
                </Tooltip>
              </Marker>
            );
          })*/
      }
    </>
  );
};

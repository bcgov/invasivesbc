import { Button, Grid, Theme, Typography, Card } from '@mui/material';
import { makeStyles } from '@mui/styles';
import RadioButtonCheckedIcon from '@mui/icons-material/RadioButtonChecked';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import area from '@turf/area';
import { polygon } from '@turf/helpers';
import L from 'leaflet';
import React, { useEffect, useRef, useState } from 'react';
import { GeoJSON, Marker, Popup, useMap, useMapEvent } from 'react-leaflet';
import dotMarker from '../../../Icons/dotMarker.png';

const useStyles = makeStyles((theme: Theme) => ({
  typography: {
    paddingLeft: theme.spacing(2),
    fontSize: 16,
    width: 150
  },
  button: {
    display: 'flex',
    justifyContent: 'flex-start',
    width: 150
  }
}));

const interactiveGeometryStyle = () => {
  return {
    color: '#ff7800',
    weight: 5,
    opacity: 1,
    stroke: true,
    strokeWidth: 10
  };
};

const calc_distance = (lat1: number, lat2: number, lng1: number, lng2: number) => {
  const R = 6371e3; // metres
  const φ1 = (lat1 * Math.PI) / 180; // φ, λ in radians
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
};

const geoJSON_checkDistance = (
  aGeoJSON: any,
  setGeoJSON: any,
  distanceObj: any,
  locArray: any,
  isMeasuringDistance: boolean
) => {
  if (aGeoJSON == null && locArray[0]) {
    setGeoJSON([
      ...aGeoJSON,
      {
        type: 'Feature',
        geometry: {
          type: 'Point',
          coordinates: [locArray[0].lng, locArray[0].lat]
        },
        properties: {
          name: 'Dinagat Islands'
        }
      }
    ]);
  } else if (locArray.length > 1) {
    for (var i = 0; i < locArray.length - 1; i++) {
      if (isMeasuringDistance) {
        setGeoJSON([
          ...aGeoJSON,
          {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: [
                [locArray[i].lng, locArray[i].lat],
                [locArray[i + 1].lng, locArray[i + 1].lat]
              ]
            },
            properties: {
              name: 'Dinagat Islands'
            }
          }
        ]);
        const distance = calc_distance(
          locArray[i].lat,
          locArray[i + 1].lat,
          locArray[i].lng,
          locArray[i + 1].lng
        ) as any;
        distanceObj.setTotalDistance(distanceObj.totalDistance + distance);
      }
    }
  }
};

const finishPolygon = (aGeoJSON: any, setGeoJSON: any, setPolyArea: any, locArray: any) => {
  const tempArr = [];
  for (var i = 0; i < locArray.length; i++) {
    tempArr[i] = [locArray[i].lng, locArray[i].lat];
    if (i === 0) {
      tempArr[locArray.length] = [locArray[i].lng, locArray[i].lat];
    }
  }
  var obj = {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [tempArr]
    },
    properties: {
      name: 'Dinagat Islands'
    }
  };
  setGeoJSON([...aGeoJSON, obj]);
  const tempPolygon = polygon([tempArr]);
  setPolyArea(area(tempPolygon));
};

const MeasureToolContainer = (props: any) => {
  const classes = useStyles();
  const [isMeasuringDistance, setIsMeasuringDistance] = useState(false);
  const [isMeasuringArea, setIsMeasuringArea] = useState(false);
  const [finishDraw, setFinishDraw] = useState(false);
  const [totalDistance, setTotalDistance] = useState(0);
  const [aKey, setKey] = useState(1);
  const [polyArea, setPolyArea] = useState(0);
  const [locArray, setLocArray] = useState([]);
  const [aGeoJSON, setGeoJSON] = useState([]);
  const distance = { totalDistance, setTotalDistance };
  const divRef = useRef(null);
  const map = useMap();

  useEffect(() => {
    console.log('measureToolContainerOpen', props.measureToolContainerOpen);
  }, [props.measureToolContainerOpen]);

  const markerIcon = L.icon({
    iconUrl: dotMarker,
    iconSize: [24, 24]
  });

  useEffect(() => {
    if (isMeasuringArea || isMeasuringDistance) {
      L.DomUtil.addClass((map as any).getContainer(), 'crosshair-cursor-enabled');
    } else {
      L.DomUtil.removeClass((map as any).getContainer(), 'crosshair-cursor-enabled');
    }
  }, [isMeasuringDistance, isMeasuringArea]);

  // get mouse click location on map
  useMapEvent('click', (e) => {
    const loc = e.latlng;
    //if we're measuring
    if (isMeasuringDistance) {
      setLocArray([...locArray, loc]);
    }
    if (isMeasuringArea) {
      setLocArray([...locArray, loc]);
    }
  });

  useEffect(() => {
    L.DomEvent.disableClickPropagation(divRef.current);
    L.DomEvent.disableScrollPropagation(divRef.current);
  }, []);

  useEffect(() => {
    // need for geoJSON
    setKey(Math.random()); //NOSONAR
  }, [aGeoJSON]);

  // used for measuring distance
  useEffect(() => {
    // we are dropping first point
    geoJSON_checkDistance(aGeoJSON, setGeoJSON, distance, locArray, isMeasuringDistance);
  }, [locArray]);

  function clearMeasure() {
    setPolyArea(0);
    setTotalDistance(0);
    setGeoJSON([]);
    setLocArray([]);
    setFinishDraw(false);
  }
  const toggleMeasureDistance = () => {
    clearMeasure();
    setIsMeasuringArea(false);
    setIsMeasuringDistance(!isMeasuringDistance);
  };
  const toggleMeasureArea = () => {
    clearMeasure();
    setIsMeasuringDistance(false);
    setIsMeasuringArea(!isMeasuringArea);
  };

  return (
    <>
      <GeoJSON key={aKey} data={aGeoJSON as any} style={interactiveGeometryStyle}>
        {isMeasuringDistance && (
          <Popup closeOnClick closeOnEscapeKey keepInView>
            {totalDistance.toFixed(1)} meters
          </Popup>
        )}
        {isMeasuringArea && (
          <Popup closeOnClick closeOnEscapeKey keepInView>
            {polyArea.toFixed(2)} meters&#178;
          </Popup>
        )}
      </GeoJSON>
      {isMeasuringArea && (
        <>
          {!finishDraw &&
            locArray.map((item: { lat: any; lng: any }) => (
              <Marker position={[item.lat, item.lng]} icon={markerIcon}></Marker>
            ))}
        </>
      )}
      {props.measureToolContainerOpen && (
        <Card
          ref={divRef}
          style={{ position: 'absolute', padding: '1rem', margin: '0.5rem' }}
          className={'topleft leaflet-control'}>
          <Grid container direction="column">
            <Grid item xs={3}>
              <Button className={classes.button} onClick={toggleMeasureDistance}>
                {isMeasuringDistance ? <RadioButtonCheckedIcon /> : <RadioButtonUncheckedIcon />}
                Distance
              </Button>
            </Grid>

            <Grid item xs={3}>
              {totalDistance !== 0 && (
                <Typography className={classes.typography}>{totalDistance.toFixed(2)} m</Typography>
              )}
            </Grid>

            <Grid item xs={3}>
              <Button className={classes.button} onClick={toggleMeasureArea}>
                {isMeasuringArea ? <RadioButtonCheckedIcon /> : <RadioButtonUncheckedIcon />}
                Area
              </Button>
            </Grid>

            <Grid item xs={3}>
              {polyArea !== 0 && <Typography className={classes.typography}>{polyArea.toFixed(2)}m&#178;</Typography>}
            </Grid>

            <Grid item xs={3}>
              {isMeasuringArea && (
                <Button
                  className={classes.button}
                  onClick={() => {
                    finishPolygon(aGeoJSON, setGeoJSON, setPolyArea, locArray);
                    setFinishDraw(true);
                  }}>
                  Finish Draw
                </Button>
              )}
            </Grid>

            <Grid item xs={3}>
              <Button className={classes.button} onClick={() => clearMeasure()}>
                Clear
              </Button>
            </Grid>
          </Grid>
        </Card>
      )}
    </>
  );
};

export default MeasureToolContainer;

import {
  Accordion,
  CircularProgress,
  AccordionDetails,
  AccordionSummary,
  Button,
  Grid,
  Typography,
  Dialog,
  DialogTitle,
  DialogActions
} from '@mui/material';
import MapContainer, { IMapContainerProps } from 'components/map/MapContainer';
import React, { useEffect, useState } from 'react';
import { ExpandMore } from '@mui/icons-material';
import distance from '@turf/distance';
import * as turf from '@turf/helpers';
import { lineString } from '@turf/helpers';
import lineToPolygon from '@turf/line-to-polygon';
import { calc_lat_long_from_utm } from 'components/map/Tools/ToolTypes/Nav/DisplayPosition';
import { MapRecordsContextProvider } from 'contexts/MapRecordsContext';
import { Geolocation } from '@capacitor/geolocation';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { RecordSetLayersRenderer } from 'components/map/LayerLoaderHelpers/RecordSetLayersRenderer';
import { ActivityMapExtentToggle } from 'components/map/Tools/ToolTypes/Nav/ActivityMapExtentToggle';
import { ExtentListener } from 'components/map/ExtentListener';
import { useSelector } from 'react-redux';
import { selectMap } from 'state/reducers/map';

const timer = ({ initialTime, setInitialTime }, { startTimer, setStartTimer }) => {
  if (initialTime > 0) {
    setTimeout(() => {
      setInitialTime(initialTime - 1);
    }, 1000);
  }
  if (initialTime === 0 && startTimer) {
    setStartTimer(false);
  }
};

const ActivityMapComponent: React.FC<IMapContainerProps> = (props) => {
  const mapState = useSelector(selectMap)
  const workingPolyline = [];
  const [initialTime, setInitialTime] = useState(0);
  const [startTimer, setStartTimer] = useState(false);
  const [map, setMap] = useState(null);
  const [dialog, setDialog] = useState(false);





  const isGreaterDistanceThan = (from, to, distanceV) => {
    let returnVal = null;
    try {
      var fromAsPoint = turf.point(from);
      var toAsPoint = turf.point(to);

      returnVal = distance(fromAsPoint, toAsPoint, { units: 'kilometers' }) > distanceV;
    } catch (e) {
      console.dir(e);
    }
    return returnVal;
  };

  const startTrack = async () => {
    try {
      //  startWatch({ enableHighAccuracy: true });
    } catch (e) {
      console.log('unable to start watch');
    }
    console.log('Starting track.');
  };

  const manualUTMEntry = () => {
    let validZone = false;
    let zone;
    let validNorthing = false;
    let northing;
    let validEasting = false;
    let easting;

    while (!validZone) {
      zone = prompt('Enter a valid UTM Zone');
      if (!isNaN(Number(zone))) {
        validZone = true;
        break;
      }
    }
    if (!validZone) {
      return; // allow for cancel
    }
    while (!validEasting) {
      easting = prompt('Enter a valid UTM Easting');
      if (!isNaN(Number(easting))) {
        validEasting = true;
        break;
      }
    }
    if (!validEasting) {
      //allow for cancel
      return;
    }
    while (!validNorthing) {
      northing = prompt('Enter a valid UTM Northing');
      if (!isNaN(Number(northing))) {
        validNorthing = true;
        break;
      }
    }
    if (!validNorthing) {
      return; // allow for cancel
    }

    let result = calc_lat_long_from_utm(Number(zone), Number(easting), Number(northing));
    const geo: any = {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [result[0], result[1]]
      },
      properties: {}
    };
    // let the page validate the utm:
    props.geometryState.setGeometry([geo]);
    map.setView([result[1], result[0]], 17);
  };

  // define default marker icon to override src defined in leaflet.css
  const DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41]
  });

  const getGPSLocationEntry = async () => {
    const draw = new (L as any).Draw.Marker(map, { icon: DefaultIcon });
    draw.enable();
    setInitialTime(3);
    setStartTimer(true);
    const position = await Geolocation.getCurrentPosition();
    timer({ initialTime, setInitialTime }, { startTimer, setStartTimer });
    props.geometryState.setGeometry([turf.point([position.coords.longitude, position.coords.latitude])]);
    draw.disable();
    map.setView([position.coords.latitude, position.coords.longitude], 17);
  };

  const endTrack = async () => {
    try {
      // convert poly to polygon
      if (workingPolyline.length >= 4) {
        var line = lineString(workingPolyline);
        var polygon = lineToPolygon(line);
        if (window.confirm('Convert track to polygon?')) {
          props.geometryState.setGeometry([polygon as any]);
          //          notifySuccess(databaseContext, JSON.stringify('Made a polygon!!  '));
          // clearWatch();
        } else {
          //         notifySuccess(databaseContext, JSON.stringify('Made a polyine!!  '));
          /// clearWatch();
        }
      } else {
        if (window.confirm("Sure you're done walkin'?  Didn't collect 4 points.")) {
          alert('Cancelled track.');
          //  clearWatch();
        }
      }
    } catch (e) {
      console.log('error stopping track');
    }
  };

  if (!props.activityId && props.isLoading) {
    return <CircularProgress />;
  }

  if (!props.activityId && !props.isLoading) {
    return <></>;
  }

  return (
    <MapRecordsContextProvider>
      <Accordion defaultExpanded={true}>
        <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel-map-content" id="panel-map-header">
          <Typography className={props.classes.heading}>Map</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid justifyContent={'space-around'} container>
            <Grid
              sx={{ flexWrap: 'nowrap' }}
              container
              justifyContent={'center'}
              alignItems={'stretch'}
              paddingBottom={'10px'}
              spacing={'space-evenly'}
              xs={3}
              item>
              <Button disabled={false} variant="contained" color="primary" onClick={manualUTMEntry}>
                Enter UTM Manually
              </Button>
              <Button
                id="drop-pin-button"
                disabled={false}
                variant="contained"
                color="primary"
                onClick={() => setDialog(true)}>
                Drop Pin
              </Button>
              <Dialog open={dialog} onClose={() => setDialog(false)}>
                <DialogTitle>Use current GPS position?</DialogTitle>
                <DialogActions>
                  <Button
                    onClick={async () => {
                      getGPSLocationEntry();
                      setDialog(false);
                    }}>
                    Yes
                  </Button>
                  <Button
                    onClick={() => {
                      new (L as any).Draw.Marker(map, {
                        icon: DefaultIcon
                      }).enable();
                      setDialog(false);
                    }}>
                    No
                  </Button>
                </DialogActions>
                <DialogActions>
                  <Button onClick={() => setDialog(false)}>Cancel</Button>
                </DialogActions>
              </Dialog>
            </Grid>
            {/* <Grid container justifyContent={'center'} alignItems={'stretch'} paddingBottom={'10px'} xs={3} item>
              <Button disabled={true} variant="contained" color="primary" onClick={startTrack}>
                Record a Polygon!
              </Button>
            </Grid> */}
            {/* <Grid container justifyContent={'center'} alignItems={'stretch'} paddingBottom={'10px'} xs={3} item>
              <Button disabled={true} variant="contained" color="primary" onClick={startTrack}>
                Record Buffered Line!
              </Button>
            </Grid>
            <Grid container justifyContent={'center'} alignItems={'stretch'} paddingBottom={'10px'} xs={3} item>
              <Button disabled={true} variant="contained" color="secondary" onClick={endTrack}>
                End Track Recording
              </Button>
            </Grid> */}
            <Grid xs={12} className={props.classes.mapContainer} item>
              <MapContainer {...props} activityId={props.activityId} setMapForActivityPage={setMap}>
                <RecordSetLayersRenderer />
              </MapContainer>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
    </MapRecordsContextProvider>
  );
};

export default ActivityMapComponent;

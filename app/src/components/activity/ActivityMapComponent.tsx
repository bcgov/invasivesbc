import {
  Accordion,
  CircularProgress,
  AccordionDetails,
  AccordionSummary,
  Button,
  Grid,
  Typography
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

const ActivityMapComponent: React.FC<IMapContainerProps> = (props) => {
  const [workingPolyline, setWorkingPolyline] = useState([]);
  const [isLoading, setIsLoading] = useState<boolean>(!props.activityId);

  useEffect(() => {
    if (!props.activityId) {
      setIsLoading(true);
    } else {
      setIsLoading(false);
    }
  }, [props.activityId]);

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

  if (isLoading) {
    return <CircularProgress />;
  }

  return (
    <MapRecordsContextProvider>
      <Accordion defaultExpanded={true}>
        <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel-map-content" id="panel-map-header">
          <Typography className={props.classes.heading}>Map</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid justifyContent={'space-around'} container>
            <Grid container justifyContent={'center'} alignItems={'stretch'} paddingBottom={'10px'} xs={3} item>
              <Button disabled={false} variant="contained" color="primary" onClick={manualUTMEntry}>
                Enter UTM Manually
              </Button>
            </Grid>
            <Grid container justifyContent={'center'} alignItems={'stretch'} paddingBottom={'10px'} xs={3} item>
              <Button disabled={true} variant="contained" color="primary" onClick={startTrack}>
                Record a Polygon!
              </Button>
            </Grid>
            <Grid container justifyContent={'center'} alignItems={'stretch'} paddingBottom={'10px'} xs={3} item>
              <Button disabled={true} variant="contained" color="primary" onClick={startTrack}>
                Record Buffered Line!
              </Button>
            </Grid>
            <Grid container justifyContent={'center'} alignItems={'stretch'} paddingBottom={'10px'} xs={3} item>
              <Button disabled={true} variant="contained" color="secondary" onClick={endTrack}>
                End Track Recording
              </Button>
            </Grid>
            <Grid xs={12} className={props.classes.mapContainer} item>
              <MapContainer {...props} activityId={props.activityId} />
            </Grid>
            <Grid xs={12} item>
              <Accordion>
                <AccordionSummary>KML Upload</AccordionSummary>
                <AccordionDetails>{/*<KMLUpload setGeo={props.geometryState.setGeometry />*/}</AccordionDetails>
              </Accordion>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
    </MapRecordsContextProvider>
  );
};

export default ActivityMapComponent;

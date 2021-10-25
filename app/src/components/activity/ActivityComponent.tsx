import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Grid, Typography } from '@material-ui/core';
import { ExpandMore, PermDeviceInformationSharp } from '@material-ui/icons';
import moment from 'moment';
import FormContainer, { IFormContainerProps } from 'components/form/FormContainer';
import PhotoContainer, { IPhotoContainerProps } from 'components/photo/PhotoContainer';
import { DatabaseContext2 } from 'contexts/DatabaseContext2';
import { ReviewStatus, FormValidationStatus, ActivitySyncStatus } from 'constants/activities';
import React, { useContext, useEffect, useState } from 'react';
import { notifySuccess, notifyError } from 'utils/NotificationUtils';
import { useDataAccess } from 'hooks/useDataAccess';
import { Geolocation } from '@capacitor/geolocation';
//import { useCurrentPosition, useWatchPosition } from '@ionic/react-hooks/geolocation';
import * as turf from '@turf/turf';
import MapContainer, { IMapContainerProps } from 'components/map/MapContainer';
import { useHistory } from 'react-router-dom';
import KMLUpload from 'components/map-buddy-components/KMLUpload';
import 'gridfix.css';
import { sanitizeRecord } from 'utils/addActivity';
import { useKeycloak } from '@react-keycloak/web';
import { calc_lat_long_from_utm } from 'components/map/Tools/DisplayPosition';
import { Feature } from '@turf/turf';

export interface IActivityComponentProps extends IMapContainerProps, IFormContainerProps, IPhotoContainerProps {
  classes?: any;
  activity: any;
  linkedActivity?: any;
  customValidation?: any;
  customErrorTransformer?: any;
  pasteFormData?: Function;
  copyFormData?: Function;
  cloneActivityButton?: Function;
  setParentFormRef?: Function;
  hideCheckFormForErrors?: boolean;
}

const ActivityComponent: React.FC<IActivityComponentProps> = (props) => {
  const [currentPosition, setCurrentPosition] = useState(null);
  const watchPosition = Geolocation.watchPosition;
  const startWatch = watchPosition;
  const clearWatch = Geolocation.clearWatch;
  const [workingPolyline, setWorkingPolyline] = useState([]);
  const databaseContext = useContext(DatabaseContext2);
  const dataAccess = useDataAccess();
  const { keycloak } = useKeycloak();
  const userInfo: any = keycloak?.userInfo;

  const getLocation = async () => {
    const position = await Geolocation.getCurrentPosition();
    setCurrentPosition(position);
  };

  useEffect(() => {
    try {
      // getPosition();
    } catch (e) {
      console.log('unable to get position');
    }
  }, []);

  const isGreaterDistanceThan = (from, to, distance) => {
    let returnVal = null;
    try {
      var fromAsPoint = turf.point(from);
      var toAsPoint = turf.point(to);

      returnVal = turf.distance(fromAsPoint, toAsPoint, { units: 'kilometers' }) > distance;
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
    notifySuccess(databaseContext, JSON.stringify('Starting track.'));
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
        break;
      }
    }
    while (!validNorthing) {
      northing = prompt('Enter a valid UTM Northing');
      if (!isNaN(Number(northing))) {
        break;
      }
    }
    while (!validEasting) {
      easting = prompt('Enter a valid UTM Easting');
      if (!isNaN(Number(easting))) {
        break;
      }
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
    props.geometryState.setGeometry([geo]);
  };

  const endTrack = async () => {
    try {
      // convert poly to polygon
      if (workingPolyline.length >= 4) {
        var line = turf.lineString(workingPolyline);
        var polygon = turf.lineToPolygon(line);
        if (window.confirm('Convert track to polygon?')) {
          props.geometryState.setGeometry([polygon as any]);
          notifySuccess(databaseContext, JSON.stringify('Made a polygon!!  '));
          // clearWatch();
        } else {
          notifySuccess(databaseContext, JSON.stringify('Made a polyine!!  '));
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

  const activity = props.activity;

  const onSave = async () => {
    try {
      // NOTE: duplicate code from RecordTables.  Should be moved to a common Actions definitions file
      if (
        activity.formStatus !== FormValidationStatus.VALID ||
        activity.syncStatus === ActivitySyncStatus.SAVE_SUCCESSFUL
      ) {
        return;
      }
      const dbActivity: any = await dataAccess.getActivityById(activity.activityId, databaseContext);
      console.dir('dbActivity', dbActivity);
      const result = await dataAccess.updateActivity(
        sanitizeRecord({
          ...dbActivity,
          sync_status: ActivitySyncStatus.SAVE_SUCCESSFUL
        }),
        databaseContext
      );
      if (!result?.activity_id) notifyError(databaseContext, 'Count not save to database.');
      else window.location.reload();
    } catch (error) {
      notifyError(databaseContext, 'Could not save to database.  Are you connected to the internet?');
    }
  };

  const onReview = async () => {
    try {
      if (
        activity.formStatus !== FormValidationStatus.VALID ||
        activity.syncStatus !== ActivitySyncStatus.SAVE_SUCCESSFUL ||
        activity.reviewStatus === ReviewStatus.UNDER_REVIEW
      )
        return;
      const dbActivity: any = await dataAccess.getActivityById(activity.activityId, databaseContext);
      const result = await dataAccess.updateActivity(
        sanitizeRecord({
          ...dbActivity,
          review_status: ReviewStatus.UNDER_REVIEW
        }),
        databaseContext
      );
      if (!result?.activity_id) notifyError(databaseContext, 'Count not submit form for review.');
      else window.location.reload();
    } catch (error) {
      notifyError(databaseContext, 'Could not submit form for review.  Are you connected to the internet?');
    }
  };

  const onApprove = async () => {
    try {
      if (activity.reviewStatus !== ReviewStatus.UNDER_REVIEW) return;
      const dbActivity: any = await dataAccess.getActivityById(activity.activityId, databaseContext);
      const result = await dataAccess.updateActivity(
        sanitizeRecord({
          ...dbActivity,
          review_status: ReviewStatus.APPROVED,
          reviewed_by: userInfo.preferred_username, // latest reviewer
          reviewed_at: moment(new Date()).format()
        }),
        databaseContext
      );
      if (!result?.activity_id) notifyError(databaseContext, 'Count not approve form.');
      else window.location.reload();
    } catch (error) {
      notifyError(databaseContext, 'Could not approve form.  Are you connected to the internet?');
    }
  };

  const onDisapprove = async () => {
    try {
      if (activity.reviewStatus !== ReviewStatus.UNDER_REVIEW) return;
      const dbActivity: any = await dataAccess.getActivityById(activity.activityId, databaseContext);
      const result = await dataAccess.updateActivity(
        sanitizeRecord({
          ...dbActivity,
          review_status: ReviewStatus.DISAPPROVED,
          reviewed_by: userInfo.preferred_username, // latest reviewer
          reviewed_at: moment(new Date()).format()
        }),
        databaseContext
      );
      if (!result?.activity_id) notifyError(databaseContext, 'Count not disapprove form.');
      else window.location.reload();
    } catch (error) {
      notifyError(databaseContext, 'Could not disapprove form.  Are you connected to the internet?');
    }
  };

  /*
  useEffect(() => {
    if (watchPosition) {
      if (workingPolyline.length == 0) {
        let newPolyline = [[watchPosition.coords.longitude, watchPosition.coords.latitude]];
        setWorkingPolyline(newPolyline);

        const userTrack: Feature = JSON.parse(
          `
          {
            "type": "Feature",
            "geometry": {
              "type": "LineString",
              "coordinates": ` +
            JSON.stringify(newPolyline) +
            `
            },
            "properties": {
            }
          }
          `
        );

        props.geometryState.setGeometry([userTrack as any]);
      } else {
        try {
          if (
            isGreaterDistanceThan(
              [watchPosition.coords.longitude, watchPosition.coords.latitude],
              workingPolyline[workingPolyline.length - 1],
              0.001
            )
          ) {
            setWorkingPolyline([...workingPolyline, [watchPosition.coords.longitude, watchPosition.coords.latitude]]);

            const userTrack = JSON.parse(
              `
          {
            "type": "Feature",
            "geometry": {
              "type": "LineString",
              "coordinates": ` +
                JSON.stringify(workingPolyline) +
                `
            },
            "properties": {
            }
          }
          `
            );
            props.geometryState.setGeometry([userTrack as any]);
          }
        } catch (e) {
          notifySuccess(databaseContext, JSON.stringify('Computer says no.  ' + JSON.stringify(e)));
        }
      }
    }
  }, [watchPosition]);
  */

  const history = useHistory();
  return (
    <>
      {props.cloneActivityButton && props.cloneActivityButton()}

      {/* Display the linked activity record information alongside the actual activity record */}
      {props.linkedActivity && (
        <>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel-form-content" id="panel-form-header">
              <Typography className={props.classes.heading}>Linked Activity Form</Typography>
            </AccordionSummary>
            <AccordionDetails className={props.classes.formContainer}>
              <>{/*  <FormContainer {...{ ...props, activity: props.linkedActivity, isDisabled: true }} /> */}</>
            </AccordionDetails>
          </Accordion>
          {props.linkedActivity.photos.length > 0 && (
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel-photo-content" id="panel-photo-header">
                <Typography className={props.classes.heading}>Linked Activity Photos</Typography>
              </AccordionSummary>
              <AccordionDetails className={props.classes.photoContainer}>
                <PhotoContainer {...{ ...props, activity: props.linkedActivity, isDisabled: true }} />
              </AccordionDetails>
            </Accordion>
          )}
        </>
      )}

      <Accordion defaultExpanded={true}>
        <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel-map-content" id="panel-map-header">
          <Typography className={props.classes.heading}>Map</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid alignItems="flex-start" container>
            <Grid xs={2} item>
              <Button disabled={false} variant="contained" color="primary" onClick={manualUTMEntry}>
                Enter UTM Manually
              </Button>
            </Grid>
            <Grid xs={2} item>
              <Button disabled={true} variant="contained" color="primary" onClick={startTrack}>
                Record a Polygon!
              </Button>
            </Grid>
            <Grid xs={2} item>
              <Button disabled={true} variant="contained" color="primary" onClick={startTrack}>
                Record Buffered Line!
              </Button>
            </Grid>
            <Grid xs={2} item>
              <Button disabled={true} variant="contained" color="secondary" onClick={endTrack}>
                End Track Recording
              </Button>
            </Grid>
            <Grid xs={12} className={props.classes.mapContainer} item>
              <MapContainer {...props} />
            </Grid>
            <Grid xs={12} item>
              <Accordion>
                <AccordionSummary>KML Upload</AccordionSummary>
                <AccordionDetails>
                  <KMLUpload setGeo={props.geometryState.setGeometry} />
                </AccordionDetails>
              </Accordion>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel-form-content" id="panel-form-header">
          <Typography className={props.classes.heading}>Activity Form</Typography>
        </AccordionSummary>
        <AccordionDetails className={props.classes.formContainer}>
          <FormContainer
            {...props}
            onSave={onSave}
            saveStatus={activity.syncStatus}
            disableSave={
              activity.syncStatus === ActivitySyncStatus.SAVE_SUCCESSFUL ||
              activity.formStatus !== FormValidationStatus.VALID
            }
            onReview={onReview}
            reviewStatus={activity.reviewStatus}
            disableReview={
              activity.syncStatus !== ActivitySyncStatus.SAVE_SUCCESSFUL ||
              activity.formStatus !== FormValidationStatus.VALID ||
              activity.reviewStatus === ReviewStatus.UNDER_REVIEW
            }
            onApprove={onApprove}
            disableApprove={activity.reviewStatus !== ReviewStatus.UNDER_REVIEW} // admins only check needed too
            onDisapprove={onDisapprove}
            disableDisapprove={activity.reviewStatus !== ReviewStatus.UNDER_REVIEW} // admins only check needed too
          />
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel-photo-content" id="panel-photo-header">
          <Typography className={props.classes.heading}>Activity Photos</Typography>
        </AccordionSummary>
        <AccordionDetails className={props.classes.photoContainer}>
          <PhotoContainer {...props} />
        </AccordionDetails>
      </Accordion>
      <Box display="flex" paddingTop={5} justifyContent="center" width="100%">
        <Button
          color="primary"
          style={{ width: 200, height: 100 }}
          variant="contained"
          onClick={() => history.push('/home/activities')}>
          I'm done here
        </Button>
      </Box>
    </>
  );
};

export default ActivityComponent;

import { Plugins } from '@capacitor/core';
import { Accordion, AccordionDetails, AccordionSummary, Button, Typography } from '@material-ui/core';
import { ExpandMore } from '@material-ui/icons';
import FormContainer, { IFormContainerProps } from 'components/form/FormContainer';
import MapContainer, { IMapContainerProps } from 'components/map/MapContainer';
import PhotoContainer, { IPhotoContainerProps } from 'components/photo/PhotoContainer';
import { DatabaseContext } from 'contexts/DatabaseContext';
import React, { useContext, useEffect, useState } from 'react';
import { notifySuccess } from 'utils/NotificationUtils';
import { useCurrentPosition, useWatchPosition, availableFeatures } from '@ionic/react-hooks/geolocation';
import * as turf  from '@turf/turf'
import { Units, unitsFactors } from '@turf/turf';

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
  const { currentPosition: watchPosition, startWatch, clearWatch } = useWatchPosition();
  const { error, currentPosition, getPosition } = useCurrentPosition();
  const [ workingPolyline, setWorkingPolyline] = useState([])


  const databaseContext = useContext(DatabaseContext);

  const makeGeoFromLatLong = (long: number, lat: number) => {
    return JSON.parse(`
    {
     "type": "Feature",
     "geometry": {
       "type": "Point",
       "coordinates": [` + long.toFixed(6) + `, ` + lat.toFixed(6) +`]
     },
     "properties": {
     }
   }`)
 }

  const makeGeoFromArray = (input) => {
    return JSON.parse(`
    {
     "type": "Feature",
     "geometry": {
       "type": "Point",
       "coordinates": ` + input + `
     },
     "properties": {
     }
   }`)
 }

const isGreaterDistanceThan = (from, to, distance) => {
    var fromAsPoint = turf.point(from);
    var toAsPoint = turf.point(to);

    return turf.distance(from, to, { units: 'kilometers'}) > distance;
}

  const startTrack = async () => {
     startWatch();
      notifySuccess(databaseContext, JSON.stringify("Starting track @ Latitude: " + watchPosition.coords.latitude + ", Longitude: " + watchPosition.coords.longitude));
  };

  const endTrack = async () => {
    // convert poly to polygon
    clearWatch();
  };

  useEffect(() => {
    if (watchPosition) {
      if(workingPolyline.length == 0)
      {
        setWorkingPolyline([[watchPosition.coords.longitude.toFixed(6), watchPosition.coords.latitude.toFixed(6)]])
      }
      else if(isGreaterDistanceThan(watchPosition.coords.longitude, watchPosition.coords.latitude, .01)){
        setWorkingPolyline([...workingPolyline, [watchPosition.coords.longitude.toFixed(6), watchPosition.coords.latitude.toFixed(6)]])
      }
    }
  }, [watchPosition]);

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
              <FormContainer {...{ ...props, activity: props.linkedActivity, isDisabled: true }} />
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
        <AccordionDetails className={props.classes.mapContainer}>
          <Button variant="contained" color="primary" onClick={startTrack}></Button>
          <Button variant="contained" color="secondary" onClick={endTrack}></Button>
          {JSON.stringify(watchPosition)}
          {JSON.stringify(currentPosition)}
          <MapContainer {...props} />
        </AccordionDetails>
      </Accordion>
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel-form-content" id="panel-form-header">
          <Typography className={props.classes.heading}>Activity Form</Typography>
        </AccordionSummary>
        <AccordionDetails className={props.classes.formContainer}>
          <FormContainer {...props} />
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
    </>
  );
};

export default ActivityComponent;

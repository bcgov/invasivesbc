import { Box, Button, CircularProgress, Container, makeStyles } from '@material-ui/core';
import { Save } from '@material-ui/icons';
import ActivityComponent from 'components/activity/ActivityComponent';
import { IPhoto } from 'components/photo/PhotoContainer';
import { ActivityStatus, FormValidationStatus } from 'constants/activities';
import { Feature } from 'geojson';
import { useInvasivesApi } from 'hooks/useInvasivesApi';
import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  getAreaValidator,
  getCustomValidator,
  getDateAndTimeValidator,
  getJurisdictionPercentValidator,
  getPlotIdentificatiomTreesValidator,
  getTemperatureValidator,
  getTransectOffsetDistanceValidator,
  getWindValidator
} from 'rjsf/business-rules/customValidation';
import { populateTransectLineAndPointData } from 'rjsf/business-rules/populateCalculatedFields';
import { debounced } from 'utils/FunctionUtils';
import { calculateGeometryArea, calculateLatLng } from 'utils/geometryHelpers';
import { getActivityByIdFromApi } from 'utils/getActivity';
import { MapContextMenuData } from '../map/MapContextMenu';

const useStyles = makeStyles((theme) => ({
  heading: {
    fontSize: theme.typography.pxToRem(18),
    fontWeight: theme.typography.fontWeightRegular
  },
  mapContainer: {
    height: '600px'
  },
  map: {
    height: '100%',
    width: '100%',
    zIndex: 0
  },
  formContainer: {},
  photoContainer: {}
}));

interface ISearchActivityPage {
  classes?: any;
}

const SearchActivityPage: React.FC<ISearchActivityPage> = (props) => {
  const urlParams = useParams();

  const classes = useStyles();

  const invasivesApi = useInvasivesApi();

  const [isLoading, setIsLoading] = useState(true);
  const [geometry, setGeometry] = useState<Feature[]>([]);
  const [extent, setExtent] = useState(null);
  const [contextMenuState, setContextMenuState] = useState<MapContextMenuData>({ isOpen: false, lat: 0, lng: 0 });
  const [activity, setActivity] = useState(null);
  const [photos, setPhotos] = useState<IPhoto[]>([]);
  const [parentFormRef, setParentFormRef] = useState(null);

  /**
   * Save the geometry.
   *
   * @param {Feature} geoJSON The geometry in GeoJSON format
   */
  const saveGeometry = useCallback((geom: Feature[]) => {
    setActivity((doc: any) => {
      const { latitude, longitude } = calculateLatLng(geom) || {};

      const formData = doc.formData;
      const areaOfGeometry = calculateGeometryArea(geom);

      const updatedFormData = {
        ...formData,
        activity_data: {
          ...formData.activity_data,
          latitude,
          longitude,
          reported_area: areaOfGeometry
        }
      };

      return {
        ...doc,
        geometry: geom,
        status: ActivityStatus.EDITED,
        dateUpdated: new Date(),
        formData: updatedFormData
      };
    });
  }, []);

  /**
   * Save the photos.
   *
   * @param {IPhoto} photosArr An array of photo objects.
   */
  const savePhotos = useCallback((photosArr: IPhoto[]) => {
    setActivity((doc: any) => {
      return {
        ...doc,
        photos: photosArr,
        dateUpdated: new Date()
      };
    });
  }, []);

  /*
    Function that runs if the form submit fails and has errors
  */
  const onFormSubmitError = () => {};

  /**
   * Save the form when it is submitted.
   *
   * Note: this runs after validation has run, and only if there were no errors.
   *
   * @param {*} event the form submit event
   */

  /**
   * Save the form whenever it changes.
   *
   * Note: debouncing will prevent this from running more than once per `100` milliseconds.
   *
   * @param {*} event the form change event
   */
  const onFormChange = useCallback(
    debounced(100, (event: any) => {
      let updatedActivitySubtypeData = { ...event.formData.activity_subtype_data };
      updatedActivitySubtypeData = populateTransectLineAndPointData(updatedActivitySubtypeData);

      return setActivity({
        ...activity,
        formData: { ...event.formData, activity_subtype_data: updatedActivitySubtypeData },
        status: ActivityStatus.EDITED,
        dateUpdated: new Date(),
        formStatus: FormValidationStatus.NOT_VALIDATED
      });
    }),
    [activity]
  );

  useEffect(() => {
    const getActivityData = async () => {
      const activityDoc = await getActivityByIdFromApi(invasivesApi, urlParams['id']);

      // TODO these are search result activities (online only), so determine if we have an extent to set
      setGeometry(activityDoc.geometry);
      setPhotos(activityDoc.photos);
      setActivity(activityDoc);

      setIsLoading(false);
    };

    getActivityData();
  }, []);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    saveGeometry(geometry);
  }, [geometry, isLoading, saveGeometry]);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    savePhotos(photos);
  }, [photos, isLoading, savePhotos]);

  if (isLoading) {
    return <CircularProgress />;
  }

  return (
    <Container className={props.classes.container}>
      <Box mb={3}>
        <Button variant="contained" color="primary" startIcon={<Save />} onClick={() => parentFormRef?.submit()}>
          Update Activity
        </Button>
      </Box>

      <ActivityComponent
        customValidation={getCustomValidator([
          getAreaValidator(activity.activitySubtype),
          getDateAndTimeValidator(activity.activitySubtype),
          getWindValidator(activity.activitySubtype),
          getTemperatureValidator(activity.activitySubtype),
          getTransectOffsetDistanceValidator(),
          getJurisdictionPercentValidator(),
          getPlotIdentificatiomTreesValidator(activity.activitySubtype)
        ])}
        classes={classes}
        activity={activity}
        onFormChange={onFormChange}
        //onFormSubmitSuccess={onFormSubmitSuccess}
        onFormSubmitError={onFormSubmitError}
        photoState={{ photos, setPhotos }}
        mapId={activity._id}
        showDrawControls={false}
        geometryState={{ geometry, setGeometry }}
        extentState={{ extent, setExtent }}
        contextMenuState={{ state: contextMenuState, setContextMenuState }}
        setParentFormRef={setParentFormRef}
        hideCheckFormForErrors={true}
      />

      <Box mt={3}>
        <Button variant="contained" color="primary" startIcon={<Save />} onClick={() => parentFormRef?.submit()}>
          Update Activity
        </Button>
      </Box>
    </Container>
  );
};

export default SearchActivityPage;

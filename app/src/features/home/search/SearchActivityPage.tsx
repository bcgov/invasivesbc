import { Box, Button, CircularProgress, Container, makeStyles } from '@material-ui/core';
import { Save } from '@material-ui/icons';
import ActivityComponent from 'components/activity/ActivityComponent';
import { IPhoto } from 'components/photo/PhotoContainer';
import { ActivityStatus, FormValidationStatus } from 'constants/activities';
import { Feature } from 'geojson';
import { useInvasivesApi } from 'hooks/useInvasivesApi';
import { ICreateOrUpdateActivity } from 'interfaces/useInvasivesApi-interfaces';
import React, { useCallback, useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { debounced } from 'utils/FunctionUtils';
import { MapContextMenuData } from '../map/MapContextMenu';
import { notifySuccess, notifyError } from 'utils/NotificationUtils';
import { DatabaseContext } from 'contexts/DatabaseContext';
import { populateHerbicideDilutionAndArea } from 'rjsf/business-rules/populateCalculatedFields';
import { calculateLatLng, calculateGeometryArea } from 'utils/geometryHelpers';
import { getCustomValidator, getAreaValidator, getWindValidator } from 'rjsf/business-rules/customValidation';

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
    width: '100%'
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

  const databaseContext = useContext(DatabaseContext);
  const [isLoading, setIsLoading] = useState(true);
  const [geometry, setGeometry] = useState<Feature[]>([]);
  const [extent, setExtent] = useState(null);
  const [contextMenuState, setContextMenuState] = useState<MapContextMenuData>({ isOpen: false, lat: 0, lng: 0 });
  const [activity, setActivity] = useState(null);
  const [photos, setPhotos] = useState<IPhoto[]>([]);

  const handleUpdate = async () => {
    try {
      const updatedActivity: ICreateOrUpdateActivity = {
        activity_id: activity.activityId,
        created_timestamp: activity.dateCreated,
        activity_type: activity.activityType,
        activity_subtype: activity.activitySubtype,
        geometry: activity.geometry,
        media: activity.photos.map((photo) => {
          return { file_name: photo.filepath, encoded_file: photo.dataUrl };
        }),
        form_data: activity.formData
      };

      await invasivesApi.updateActivity(updatedActivity);
      notifySuccess(databaseContext, 'Successfully updated activity.');
    } catch (error) {
      notifyError(databaseContext, 'Failed to update activity.');
    }
  };

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
    setActivity((activity: any) => {
      return {
        ...activity, photos: photosArr, dateUpdated: new Date()
      }
    });
  }, []);    

  /**
   * Save the form when it is submitted.
   *
   * Note: this runs after validation has run, and only if there were no errors.
   *
   * @param {*} event the form submit event
   */
  const onFormSubmitSuccess = (event: any, formRef: any) => {
    /*
    There is an issue where `schemaValidationErrors` and `schemaValidationErrorSchema` are not reset properly if the
    onSubmit hook triggers a re-render. This results in the validation errors persisting on the UI even after the
    user fixed the invalid field data.

    Temporary solution: manually reset the aforementioned fields.

    When the issue is resolved, only the `setActivity(...)` call is needed, and the `formRef.setState(...)` wrapper can be
    removed.

    See https://github.com/rjsf-team/react-jsonschema-form/issues/2102
    See https://github.com/rjsf-team/react-jsonschema-form/issues/666
    */
    formRef.setState({ ...formRef.state, schemaValidationErrors: [], schemaValidationErrorSchema: {} }, () => {
      setActivity({
        ...activity,
        formData: event.formData,
        status: ActivityStatus.EDITED,
        dateUpdated: new Date(),
        formStatus: FormValidationStatus.VALID
      });
    });
  };

  /**
   * Save the form whenever it changes.
   *
   * Note: debouncing will prevent this from running more than once per `100` milliseconds.
   *
   * @param {*} event the form change event
   */
  const onFormChange = useCallback(
    debounced(100, (event: any) => {
      const updatedActivitySubtypeData = populateHerbicideDilutionAndArea(event.formData.activity_subtype_data);

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
      const response = await invasivesApi.getActivityById(urlParams['id']);

      if (!response) {
        // TODO error messaging
        return;
      }

      const activityDoc = {
        _id: response.activity_id,
        activityId: response.activity_id,
        dateCreated: response.created_timestamp,
        activityType: response.activity_type,
        activitySubtype: response.activity_subtype,
        geometry: response.activity_payload.geometry,
        formData: response.activity_payload.form_data,
        photos:
          (response.media &&
            response.media.length &&
            response.media.map((media) => {
              return { filepath: media.file_name, dataUrl: media.encoded_file };
            })) ||
          []
      };

      // TODO these are search result activities (online only), so do we really have an extent to set? Or are we just zooming to where the geometry is?
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
        <Button variant="contained" color="primary" startIcon={<Save />} onClick={handleUpdate}>
          Update Activity
        </Button>
      </Box>

      <ActivityComponent
        customValidation={getCustomValidator([
          getAreaValidator(activity.activitySubtype),
          getWindValidator(activity.activitySubtype)
        ])}
        classes={classes}
        activity={activity}
        onFormChange={onFormChange}
        onFormSubmitSuccess={onFormSubmitSuccess}
        photoState={{ photos, setPhotos }}
        mapId={activity._id}
        geometryState={{ geometry, setGeometry }}
        extentState={{ extent, setExtent }}
        contextMenuState={{ state: contextMenuState, setContextMenuState }}
      />

      <Box mt={3}>
        <Button variant="contained" color="primary" startIcon={<Save />} onClick={handleUpdate}>
          Update Activity
        </Button>
      </Box>
    </Container>
  );
};

export default SearchActivityPage;

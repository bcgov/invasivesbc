import { CircularProgress, Container, makeStyles } from '@material-ui/core';
import ActivityComponent from 'components/activity/ActivityComponent';
import { IPhoto } from 'components/photo/PhotoContainer';
import { ActivityStatus, FormValidationStatus } from 'constants/activities';
import { DocType } from 'constants/database';
import { DatabaseContext } from 'contexts/DatabaseContext';
import { Feature } from 'geojson';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { debounced } from 'utils/FunctionUtils';
import { MapContextMenuData } from '../map/MapContextMenu';
import {
  getCustomValidator,
  getAreaValidator,
  getWindValidator,
  getHerbicideApplicationRateValidator
} from 'rjsf/business-rules/customValidation';
import { populateHerbicideDilutionAndArea } from 'rjsf/business-rules/populateCalculatedFields';
import { notifySuccess } from 'utils/NotificationUtils';
import { retrieveFormDataFromSession, saveFormDataToSession } from 'utils/saveRetrieveFormData';
import { calculateLatLng, calculateGeometryArea } from 'utils/geometryHelpers';

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
  }
}));

interface IActivityPageProps {
  classes?: any;
}

//why does this page think I need a map context menu ?
const ActivityPage: React.FC<IActivityPageProps> = (props) => {
  const classes = useStyles();

  const databaseContext = useContext(DatabaseContext);

  const [isLoading, setIsLoading] = useState(true);

  const [geometry, setGeometry] = useState<Feature[]>([]);
  const [extent, setExtent] = useState(null);
  // "is it open?", "what coordinates of the mouse?", that kind of thing:
  const initialContextMenuState: MapContextMenuData = { isOpen: false, lat: 0, lng: 0 };
  //const [contextMenuState, setContextMenuState] = useState({ isOpen: false });
  const [contextMenuState, setContextMenuState] = useState(initialContextMenuState);

  /* commented out for sonar cloud, but this will be needed to close the context menu for this page:
  const handleContextMenuClose = () => {
    setContextMenuState({ ...contextMenuState, isOpen: false });
  };
  */

  const [doc, setDoc] = useState(null);
  const docId = doc && doc._id;

  const [photos, setPhotos] = useState<IPhoto[]>([]);

  /**
   * Set the default form data values
   *
   * @param {*} activity The doc/activity object
   */
  const getDefaultFormDataValues = (activity: any) => {
    const { activity_data } = activity.formData || {};

    return {
      ...activity.formData,
      activity_data: {
        ...activity_data,
        reported_area: calculateGeometryArea(activity.geometry)
      }
    };
  };

  /**
   * Save the geometry added by the user
   *
   * @param {Feature} geoJSON The geometry in GeoJSON format
   */
  const saveGeometry = useCallback(
    (geom: Feature[]) => {
      setDoc((activity: any) => {
        const { latitude, longitude } = calculateLatLng(geom) || {};
        const formData = activity.formData;
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

        databaseContext.database.upsert(activity._id, (dbDoc) => {
          return {
            ...dbDoc,
            formData: updatedFormData,
            geometry: geom,
            status: ActivityStatus.EDITED,
            dateUpdated: new Date()
          };
        });

        return {
          ...activity,
          formData: updatedFormData,
          geometry: geom,
          status: ActivityStatus.EDITED,
          dateUpdated: new Date()
        };
      });
    },
    [databaseContext.database]
  );

  /**
   * Save the map Extent within the database
   *
   * @param {*} extent The leaflet bounds object
   */
  const saveExtent = useCallback(
    async (newExtent: any) => {
      await databaseContext.database.upsert(doc._id, (dbDoc) => {
        return { ...dbDoc, extent: newExtent };
      });
    },
    [databaseContext.database, doc]
  );

  /**
   * Save the photos.
   *
   * @param {IPhoto} photosArr An array of photo objects.
   */
  const savePhotos = useCallback(
    async (photosArr: IPhoto[]) => {
      await databaseContext.database.upsert(doc._id, (dbDoc) => {
        return { ...dbDoc, photos: photosArr, dateUpdated: new Date() };
      });
    },
    [databaseContext.database, doc]
  );

  /**
   * Save the form when it is submitted.
   *
   * @param {*} event the form submit event
   */
  const onFormSubmitSuccess = async (event: any) => {
    const updatedFormValues = {
      formData: event.formData,
      status: ActivityStatus.EDITED,
      dateUpdated: new Date(),
      formStatus: FormValidationStatus.VALID
    };

    setDoc({ ...doc, ...updatedFormValues });

    await databaseContext.database.upsert(doc._id, (activity) => {
      return {
        ...activity,
        ...updatedFormValues
      };
    });
  };

  /**
   * Save the form whenever it changes.
   *
   * Note: debouncing will prevent this from running more than once every `100` milliseconds.
   *
   * @param {*} event the form change event
   */
  const onFormChange = useCallback(
    debounced(100, async (event: any) => {
      const updatedActivitySubtypeData = populateHerbicideDilutionAndArea(event.formData.activity_subtype_data);

      const updatedFormValues = {
        formData: { ...event.formData, activity_subtype_data: updatedActivitySubtypeData },
        status: ActivityStatus.EDITED,
        dateUpdated: new Date(),
        formStatus: FormValidationStatus.VALID
      };

      setDoc({ ...doc, ...updatedFormValues });

      await databaseContext.database.upsert(docId, (activity) => {
        return {
          ...activity,
          ...updatedFormValues
        };
      });
    }),
    [doc]
  );

  /**
   * Paste copied form data saved in session storage
   * Update the doc (activity) with the latest form data and store it in DB
   */
  const pasteFormData = async () => {
    const formDataToPaste = retrieveFormDataFromSession(doc);

    const updatedFormValues = {
      formData: formDataToPaste,
      status: ActivityStatus.EDITED,
      dateUpdated: new Date(),
      formStatus: FormValidationStatus.VALID
    };

    setDoc({ ...doc, ...updatedFormValues });

    notifySuccess(databaseContext, 'Successfully pasted form data.');

    await databaseContext.database.upsert(docId, (activity) => {
      return {
        ...activity,
        ...updatedFormValues
      };
    });
  };

  /**
   * Copy form data into session storage
   */
  const copyFormData = () => {
    const { formData, activitySubtype } = doc;

    saveFormDataToSession(formData, activitySubtype);
    notifySuccess(databaseContext, 'Successfully copied form data.');
  };

  useEffect(() => {
    const getActivityData = async () => {
      const appStateResults = await databaseContext.database.find({ selector: { _id: DocType.APPSTATE } });

      if (!appStateResults || !appStateResults.docs || !appStateResults.docs.length) {
        return;
      }

      const activityResults = await databaseContext.database.find({
        selector: { _id: appStateResults.docs[0].activeActivity }
      });

      const updatedFormData = getDefaultFormDataValues(activityResults.docs[0]);
      const updatedDoc = { ...activityResults.docs[0], formData: updatedFormData };

      setGeometry(updatedDoc.geometry);
      setExtent(updatedDoc.extent);
      setPhotos(updatedDoc.photos || []);
      setDoc(updatedDoc);

      setIsLoading(false);
    };

    getActivityData();
  }, [databaseContext]);

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

    saveExtent(extent);
  }, [extent, isLoading, saveExtent]);

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
      <ActivityComponent
        customValidation={getCustomValidator([
          getAreaValidator(doc.activitySubtype),
          getWindValidator(doc.activitySubtype),
          getHerbicideApplicationRateValidator()
        ])}
        classes={classes}
        activity={doc}
        onFormChange={onFormChange}
        onFormSubmitSuccess={onFormSubmitSuccess}
        photoState={{ photos, setPhotos }}
        mapId={doc._id}
        geometryState={{ geometry, setGeometry }}
        extentState={{ extent, setExtent }}
        contextMenuState={{ state: contextMenuState, setContextMenuState }} // whether someone clicked, and click x & y
        pasteFormData={() => pasteFormData()}
        copyFormData={() => copyFormData()}
      />
    </Container>
  );
};

export default ActivityPage;

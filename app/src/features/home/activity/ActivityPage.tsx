import { CircularProgress, Container, makeStyles } from '@material-ui/core';
import ActivityComponent from 'components/activity/ActivityComponent';
import { IPhoto } from 'components/photo/PhotoContainer';
import { ActivityStatus, FormValidationStatus } from 'constants/activities';
import { DocType } from 'constants/database';
import { DatabaseContext } from 'contexts/DatabaseContext';
import { Feature } from 'geojson';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import moment from 'moment';
import area from '@turf/area';
import { debounced } from 'utils/FunctionUtils';
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
    width: '100%'
  },
  photoContainer: {}
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
   * Calculate the net area for the total geometry
   * 
   * @param {Feature} geoJSON The geometry in GeoJSON format 
   */
  const calculateGeometryArea = (geometry: Feature []) => {
    let totalArea = 0;

    if (!geometry || geometry.length === 0) return totalArea.toFixed(2);

    const geo = geometry[0];
    totalArea = geo.geometry.type === "Point"
      ? (Math.PI * Math.pow(geo.properties.radius, 2))
      : area(geo);

    return totalArea.toFixed(2);
  };

  /**
   * Set the default form data values
   * 
   * @param {*} doc The doc/activity object
   */
  const getDefaultFormDataValues = (doc: any) => {
    const { activity_type_data } = doc.formData || {};

    const areaOfGeometry = calculateGeometryArea(doc.geometry);
    const observationDateTime = activity_type_data && activity_type_data.observation_date_time
      ? activity_type_data.observation_date_time
      : moment(new Date()).format();

    return {
      ...doc.formData,
      activity_type_data: {
        ...activity_type_data,
        observation_date_time: observationDateTime,
        reported_area: areaOfGeometry
      }
    };
  };

  /**
   * Save the geometry added by the user
   *
   * @param {Feature} geoJSON The geometry in GeoJSON format
   */
  const saveGeometry = async (geometry: Feature[]) => {
    const formData = doc.formData;
    const areaOfGeometry = calculateGeometryArea(geometry);

    const updatedFormData = {
      ...formData,
      activity_type_data: {
        ...formData.activity_type_data,
        reported_area: areaOfGeometry
      }
    };

    setDoc({ ...doc, formData: updatedFormData });

    await databaseContext.database.upsert(doc._id, (dbDoc) => {
      return { ...dbDoc, formData: updatedFormData, geometry: geometry, status: ActivityStatus.EDITED, dateUpdated: new Date() };
    });
  };

  /**
   * Save the map Extent within the database
   *
   * @param {*} extent The leaflet bounds object
   */
  const saveExtent = async (newExtent: any) => {
    await databaseContext.database.upsert(doc._id, (dbDoc) => {
      return { ...dbDoc, extent: newExtent };
    });
  };

  /**
   * Save the photos.
   *
   * @param {IPhoto} photos An array of photo objects.
   */
  const savePhotos = async (photos: IPhoto[]) => {
    await databaseContext.database.upsert(doc._id, (dbDoc) => {
      return { ...dbDoc, photos: photos, dateUpdated: new Date() };
    });
  };

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
   * Note: debouncing will prevent this from running more than once every `500` milliseconds.
   *
   * @param {*} event the form change event
   */
  const onFormChange = useCallback(
    debounced(100, async (event: any) => {
      const updatedFormValues = {
        formData: event.formData,
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
    [docId]
  );

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
  }, [geometry]);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    saveExtent(extent);
  }, [extent]);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    savePhotos(photos);
  }, [photos]);

  if (isLoading) {
    return <CircularProgress />;
  }

  return (
    <Container className={props.classes.container}>
      <ActivityComponent
        classes={classes}
        activity={doc}
        onFormChange={onFormChange}
        onFormSubmitSuccess={onFormSubmitSuccess}
        photoState={{ photos, setPhotos }}
        mapId={doc._id}
        geometryState={{ geometry, setGeometry }}
        extentState={{ extent, setExtent }}
        contextMenuState={{ state: contextMenuState, setContextMenuState }} // whether someone clicked, and click x & y
      />
    </Container>
  );
};

export default ActivityPage;

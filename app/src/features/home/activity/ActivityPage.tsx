import { CircularProgress, Container, makeStyles } from '@material-ui/core';
import ActivityComponent from 'components/activity/ActivityComponent';
import { IPhoto } from 'components/photo/PhotoContainer';
import { ActivityStatus, FormValidationStatus } from 'constants/activities';
import { DocType } from 'constants/database';
import { DatabaseContext } from 'contexts/DatabaseContext';
import { Feature } from 'geojson';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import moment from 'moment';
import * as turf from '@turf/turf';
import { debounced } from 'utils/FunctionUtils';
import { MapContextMenuData } from '../map/MapContextMenu';
import { getCustomValidator, getAreaValidator, getWindValidator } from 'rjsf/business-rules/customValidation';
import { populateHerbicideRate } from 'rjsf/business-rules/populateCalculatedFields';

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
   * @param {Feature[]} geoJSON The geometry in GeoJSON format
   */
  const calculateGeometryArea = (geometry: Feature[]) => {
    let totalArea = 0;

    if (!geometry || !geometry.length || geometry[0].geometry.type === "LineString") {
      return parseFloat(totalArea.toFixed(0));
    }

    const geo = geometry[0];
    if (geo.geometry.type === "Point" && geo.properties.hasOwnProperty('radius')) {
      totalArea = (Math.PI * Math.pow(geo.properties.radius, 2));
    } else if (geo.geometry.type === "Polygon") {
      totalArea = turf.area(turf.polygon(geo.geometry['coordinates']));
    }

    return parseFloat(totalArea.toFixed(0));
  };

  /**
   * Calculate the anchor point lat/lng for the geometry
   * 
   * @param {Feature[]} geoJSON The geometry in GeoJSON format
   */
  const calculateLatLng = (geom: Feature[]) => {
    if (!geom[0] || !geom[0].geometry) return;

    const geo = geom[0].geometry;
    const firstCoord = geo['coordinates'][0];

    let latitude = null;
    let longitude = null;

    if (geo.type === 'Point') {
      latitude = geo.coordinates[1];
      longitude = firstCoord;
    } else if (geo.type === 'LineString') {
      latitude = firstCoord[1];
      longitude = firstCoord[0];
    } else if (!geom[0].properties.isRectangle) {
      latitude = firstCoord[0][1];
      longitude = firstCoord[0][0];
    } else {
      const centerPoint = turf.center(turf.polygon(geo['coordinates'])).geometry;
      latitude = centerPoint.coordinates[1];
      longitude = centerPoint.coordinates[0];
    }

    const latlng = {
      latitude: parseFloat(latitude.toFixed(6)),
      longitude: parseFloat(longitude.toFixed(6))
    }

    return latlng;
  };

  /**
   * Set the default form data values
   * 
   * @param {*} doc The doc/activity object
   */
  const getDefaultFormDataValues = (doc: any) => {
    const { activity_data } = doc.formData || {};

    const areaOfGeometry = calculateGeometryArea(doc.geometry);
    const activityDateTime = activity_data && activity_data.activity_date_time || moment(new Date()).format();

    return {
      ...doc.formData,
      activity_data: {
        ...activity_data,
        activity_date_time: activityDateTime,
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
    const { latitude, longitude } = calculateLatLng(geometry) || {};

    const formData = doc.formData;
    const areaOfGeometry = calculateGeometryArea(geometry);

    const updatedFormData = {
      ...formData,
      activity_data: {
        ...formData.activity_data,
        latitude,
        longitude,
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
   * Note: debouncing will prevent this from running more than once every `100` milliseconds.
   *
   * @param {*} event the form change event
   */
  const onFormChange = useCallback(
    debounced(100, async (event: any) => {
      // populate herbicide application rate
      const updatedActivitySubtypeData = populateHerbicideRate(
        doc.formData.activity_subtype_data,
        event.formData.activity_subtype_data
      );

      console.log('updatedsubtypedta', updatedActivitySubtypeData);

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

      console.log('doc in useeffect', updatedDoc)

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
        customValidation={getCustomValidator([getAreaValidator(doc.activitySubtype), getWindValidator(doc.activitySubtype)])}
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

import { CircularProgress, Container, makeStyles, Box, Button, Typography, Zoom, Tooltip } from '@material-ui/core';
import { FileCopy } from '@material-ui/icons';
import ActivityComponent from 'components/activity/ActivityComponent';
import { IPhoto } from 'components/photo/PhotoContainer';
import { ActivityStatus, FormValidationStatus } from 'constants/activities';
import { DocType } from 'constants/database';
import { DatabaseContext } from 'contexts/DatabaseContext';
import proj4 from 'proj4';
import { Feature } from 'geojson';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import { debounced } from 'utils/FunctionUtils';
import { MapContextMenuData } from '../map/MapContextMenu';
import {
  getCustomValidator,
  getAreaValidator,
  getDateAndTimeValidator,
  getWindValidator,
  getTemperatureValidator,
  getHerbicideApplicationRateValidator,
  getTransectOffsetDistanceValidator,
  getVegTransectPointsPercentCoverValidator,
  getJurisdictionPercentValidator,
  getSlopeAspectBothFlatValidator,
  getInvasivePlantsValidator,
  getDuplicateInvasivePlantsValidator
} from 'rjsf/business-rules/customValidation';
import { getCustomErrorTransformer } from 'rjsf/business-rules/customErrorTransformer';
import {
  populateHerbicideDilutionAndArea,
  populateTransectLineAndPointData
} from 'rjsf/business-rules/populateCalculatedFields';
import { notifySuccess, notifyError } from 'utils/NotificationUtils';
import { retrieveFormDataFromSession, saveFormDataToSession } from 'utils/saveRetrieveFormData';
import { calculateLatLng, calculateGeometryArea } from 'utils/geometryHelpers';
import { addClonedActivityToDB } from 'utils/addActivity';

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
  }
}));

interface IActivityPageProps {
  classes?: any;
  activityId?: string;
  setObservation?: Function;
  setFormHasErrors?: Function;
  setParentFormRef?: Function;
}

//why does this page think I need a map context menu ?
const ActivityPage: React.FC<IActivityPageProps> = (props) => {
  const classes = useStyles();

  const databaseContext = useContext(DatabaseContext);

  const [isLoading, setIsLoading] = useState(true);
  const [linkedActivity, setLinkedActivity] = useState(null);
  const [isCloned, setIsCloned] = useState(false);
  const [geometry, setGeometry] = useState<Feature[]>([]);
  const [extent, setExtent] = useState(null);
  // "is it open?", "what coordinates of the mouse?", that kind of thing:
  const initialContextMenuState: MapContextMenuData = { isOpen: false, lat: 0, lng: 0 };
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
        /**
         * latlong to utms / utm zone conversion
         */
        let utm_easting, utm_northing, utm_zone;
        //if statement prevents errors on page load, as lat/long isn't defined
        if (longitude !== undefined && latitude !== undefined) {
          utm_zone = ((Math.floor((longitude + 180) / 6) % 60) + 1).toString(); //getting utm zone
          proj4.defs([
            ['EPSG:4326', '+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees'],
            ['EPSG:AUTO', `+proj=utm +zone=${utm_zone} +datum=WGS84 +units=m +no_defs`]
          ]);
          const en_m = proj4('EPSG:4326', 'EPSG:AUTO', [longitude, latitude]); // conversion from (long/lat) to UTM (E/N)
          utm_easting = Number(en_m[0].toFixed(4));
          utm_northing = Number(en_m[1].toFixed(4));
        }

        const updatedFormData = {
          ...formData,
          activity_data: {
            ...formData.activity_data,
            latitude,
            longitude,
            utm_easting,
            utm_northing,
            utm_zone,
            reported_area: areaOfGeometry
          }
        };

        databaseContext.database.upsert(activity._id, (dbDoc) => {
          return {
            ...dbDoc,
            ...activity,
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

  /*
    Function that runs if the form submit fails and has errors
  */
  const onFormSubmitError = () => {
    notifyError(
      databaseContext,
      'There are errors in your form. Please make sure your form contains no errors and try again.'
    );
  };

  /**
   * Save the form when it is submitted.
   *
   * @param {*} event the form submit event
   */
  const onFormSubmitSuccess = async (event: any, formRef: any) => {
    if (props.setFormHasErrors) {
      props.setFormHasErrors(false);
    }

    const updatedFormValues = {
      formData: event.formData,
      status: ActivityStatus.EDITED,
      dateUpdated: new Date(),
      formStatus: FormValidationStatus.VALID
    };

    formRef.setState({ ...formRef.state, schemaValidationErrors: [], schemaValidationErrorSchema: {} }, () => {
      setDoc({ ...doc, ...updatedFormValues });
    });

    await databaseContext.database.upsert(doc._id, (activity) => {
      return {
        ...activity,
        ...updatedFormValues
      };
    });
  };

  const autoFillSlopeAspect = (formData: any, lastField: string) => {
    if (!lastField) {
      return formData;
    }
    const fieldId = lastField[0];
    if (
      fieldId.includes('slope_code') &&
      formData.activity_subtype_data.observation_plant_terrestrial_data.slope_code === 'FL'
    ) {
      formData.activity_subtype_data.observation_plant_terrestrial_data.aspect_code = 'FL';
    }
    if (
      fieldId.includes('aspect_code') &&
      formData.activity_subtype_data.observation_plant_terrestrial_data.aspect_code === 'FL'
    ) {
      formData.activity_subtype_data.observation_plant_terrestrial_data.slope_code = 'FL';
    }
    return formData;
  };
  /**
   * Save the form whenever it changes.
   *
   * Note: debouncing will prevent this from running more than once every `100` milliseconds.
   *
   * @param {*} event the form change event
   */
  const onFormChange = useCallback(
    debounced(100, async (event: any, ref: any, lastField: any) => {
      let updatedFormData = event.formData;

      updatedFormData.activity_subtype_data = populateHerbicideDilutionAndArea(updatedFormData.activity_subtype_data);
      updatedFormData.activity_subtype_data = populateTransectLineAndPointData(updatedFormData.activity_subtype_data);

      //auto fills slope or aspect to flat if other is chosen flat
      updatedFormData = autoFillSlopeAspect(updatedFormData, lastField);
      const updatedFormValues = {
        formData: updatedFormData,
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
   * Save the form whenever user the blur callback is fired.
   *
   * Callback is fired when user enters out of range value in the field and then proceeds with this value after the warning
   * this is used to update the validation errors. If user clicks proceed, the error associated with particular field gets popped
   *
   * @param {*} sentFormData the new formData that was sent from the form
   */
  const onFormBlur = useCallback(
    debounced(100, async (sentFormData: any) => {
      let updatedActivitySubtypeData = populateHerbicideDilutionAndArea(sentFormData.activity_subtype_data);
      updatedActivitySubtypeData = populateTransectLineAndPointData(updatedActivitySubtypeData);

      const updatedFormValues = {
        formData: { ...sentFormData, activity_subtype_data: updatedActivitySubtypeData },
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

  /*
    Function to pull activity results from the DB given an activityId if present
  */
  const getActivityResultsFromDB = async (activityId: any): Promise<any> => {
    const appStateResults = await databaseContext.database.find({ selector: { _id: DocType.APPSTATE } });

    if (!appStateResults || !appStateResults.docs || !appStateResults.docs.length) {
      return;
    }

    const activityResults = await databaseContext.database.find({
      selector: { _id: activityId || appStateResults.docs[0].activeActivity }
    });

    return activityResults;
  };

  /*
    Function to set the active activity in the DB context and the current activity view
  */
  const setActiveActivity = async (activeActivity: any) => {
    await databaseContext.database.upsert(DocType.APPSTATE, (appStateDoc) => {
      const updatedActivity = { ...appStateDoc, activeActivity: activeActivity._id };

      setIsCloned(true);

      return updatedActivity;
    });
  };

  /*
    Function to generate clone activity button component
  */
  const generateCloneActivityButton = () => {
    return (
      <Box mb={3} display="flex" flexDirection="row-reverse">
        <Tooltip TransitionComponent={Zoom} title="Create a new record with the same content.">
          <Button
            variant="contained"
            color="primary"
            startIcon={<FileCopy />}
            onClick={async () => {
              const addedActivity = await addClonedActivityToDB(databaseContext, doc);
              setActiveActivity(addedActivity);
              notifySuccess(databaseContext, 'Successfully cloned activity. You are now viewing the cloned activity.');
            }}>
            Clone Activity
          </Button>
        </Tooltip>
      </Box>
    );
  };

  /*
    Function to extract linked record id from record if it exists
    and then set the linkedActivity in state for reference within
    the form as an accordion and for population of certain fields later/validation
  */
  const handleRecordLinking = async (updatedDoc: any) => {
    let linkedRecordId: string = null;

    if (updatedDoc.activitySubtype.includes('ChemicalPlant')) {
      linkedRecordId = updatedDoc.formData?.activity_subtype_data?.activity_id;
    } else if (
      ['Treatment', 'Monitoring'].includes(updatedDoc.activityType) &&
      updatedDoc.activitySubtype.includes('Plant')
    ) {
      linkedRecordId = updatedDoc.formData?.activity_type_data?.activity_id;
    }

    if (linkedRecordId) {
      const linkedRecordActivityResults = await getActivityResultsFromDB(linkedRecordId);
      setLinkedActivity(linkedRecordActivityResults.docs[0]);
    }
  };

  //this sets up initial values for some of the fields in activity.
  const setUpInitialValues = (activity: any, formData: any): Object => {
    //Observations -- all:
    if (activity.activityType === 'Observation' && !formData.activity_subtype_data) {
      //set the invasice plants to start with 1 element, rather than with 0
      formData.activity_subtype_data = {};
      formData.activity_subtype_data.invasive_plants = [{ occurrence: 'Positive occurrence' }];
      //initialize slope and aspect code to '' so that its possible to auto fill flat values
      //even though 1 of the fields hasn't been touched
      formData.activity_subtype_data.observation_plant_terrestrial_data = {};
      formData.activity_subtype_data.observation_plant_terrestrial_data.slope_code = '';
      formData.activity_subtype_data.observation_plant_terrestrial_data.aspect_code = '';
    }
    //Observations -- Plant Terrestrial activity:
    if (activity.activitySubtype === 'Activity_Observation_PlantTerrestrial' && !formData.activity_subtype_data) {
      //set specific use to 'None'
      formData.activity_subtype_data = {};
      formData.activity_subtype_data.observation_plant_terrestrial_data = {};
      formData.activity_subtype_data.observation_plant_terrestrial_data.specific_use_code = 'NO';
    }
    return formData;
  };

  useEffect(() => {
    const getActivityData = async () => {
      const activityResults = await getActivityResultsFromDB(props.activityId || null);

      if (!activityResults) {
        setIsLoading(false);
        return;
      }

      let updatedFormData = getDefaultFormDataValues(activityResults.docs[0]);
      updatedFormData = setUpInitialValues(activityResults.docs[0], updatedFormData);
      const updatedDoc = { ...activityResults.docs[0], formData: updatedFormData };

      await handleRecordLinking(updatedDoc);

      setGeometry(updatedDoc.geometry);
      setExtent(updatedDoc.extent);
      setPhotos(updatedDoc.photos || []);
      setDoc(updatedDoc);

      setIsLoading(false);
    };

    getActivityData();
  }, [databaseContext, isCloned]);

  useEffect(() => {
    if (isLoading || !doc) {
      return;
    }

    saveGeometry(geometry);
  }, [geometry, isLoading, saveGeometry]);

  useEffect(() => {
    if (isLoading || !doc) {
      return;
    }

    saveExtent(extent);
  }, [extent, isLoading, saveExtent]);

  useEffect(() => {
    if (isLoading || !doc) {
      return;
    }

    savePhotos(photos);
  }, [photos, isLoading, savePhotos]);

  useEffect(() => {
    if (props.setObservation && doc) {
      props.setObservation(doc);
    }
  }, [doc]);

  if (isLoading) {
    return <CircularProgress />;
  }

  return (
    <Container className={props.classes.container}>
      {!doc && (
        <>
          <Box mb={3}>
            <Typography variant="h4">Current Activity </Typography>
          </Box>
          <Typography>
            There is no current activity. When you start creating an activity, it will become your current activity and
            show up in this tab.
          </Typography>
        </>
      )}
      {doc && (
        <ActivityComponent
          customValidation={getCustomValidator([
            getAreaValidator(doc.activitySubtype),
            getDateAndTimeValidator(doc.activitySubtype),
            getWindValidator(doc.activitySubtype),
            getSlopeAspectBothFlatValidator(),
            getTemperatureValidator(doc.activitySubtype),
            getDuplicateInvasivePlantsValidator(doc.activitySubtype),
            getHerbicideApplicationRateValidator(),
            getTransectOffsetDistanceValidator(),
            getVegTransectPointsPercentCoverValidator(),
            getJurisdictionPercentValidator(),
            getInvasivePlantsValidator(linkedActivity)
          ])}
          customErrorTransformer={getCustomErrorTransformer()}
          classes={classes}
          activity={doc}
          linkedActivity={linkedActivity}
          onFormChange={onFormChange}
          onFormBlur={onFormBlur}
          onFormSubmitSuccess={onFormSubmitSuccess}
          onFormSubmitError={onFormSubmitError}
          photoState={{ photos, setPhotos }}
          mapId={doc._id}
          geometryState={{ geometry, setGeometry }}
          extentState={{ extent, setExtent }}
          contextMenuState={{ state: contextMenuState, setContextMenuState }} // whether someone clicked, and click x & y
          pasteFormData={() => pasteFormData()}
          copyFormData={() => copyFormData()}
          cloneActivityButton={generateCloneActivityButton}
          setParentFormRef={props.setParentFormRef}
          showDrawControls={true}
        />
      )}
    </Container>
  );
};

export default ActivityPage;

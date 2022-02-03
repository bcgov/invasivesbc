import { Capacitor } from '@capacitor/core';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Snackbar,
  Theme,
  Tooltip,
  Typography,
  Zoom
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { FileCopy } from '@mui/icons-material';
import booleanWithin from '@turf/boolean-within';
import { calc_utm } from 'components/map/Tools/ToolTypes/Nav/DisplayPosition';
import { ActivityStatus, FormValidationStatus } from 'constants/activities';
import { DocType } from 'constants/database';
import { Feature } from 'geojson';
import { useInvasivesApi } from 'hooks/useInvasivesApi';
import React, { useCallback, useContext, useEffect, useState } from 'react';
import ActivityComponent from '../../../components/activity/ActivityComponent';
import { IWarningDialog, WarningDialog } from '../../../components/dialog/WarningDialog';
import bcArea from '../../../components/map/BC_AREA.json';
import { IPhoto } from '../../../components/photo/PhotoContainer';
import { DatabaseContext } from '../../../contexts/DatabaseContext';
import { useDataAccess } from '../../../hooks/useDataAccess';
import { getCustomErrorTransformer } from '../../../rjsf/business-rules/customErrorTransformer';
import {
  getAreaValidator,
  getCustomValidator,
  getDateAndTimeValidator,
  getPosAndNegObservationValidator,
  getInvasivePlantsValidator,
  getVegTransectPointsPercentCoverValidator,
  getShorelineTypesPercentValidator,
  getJurisdictionPercentValidator,
  getSlopeAspectBothFlatValidator,
  getTemperatureValidator,
  getTargetPhenologySumValidator,
  getTerrestrialAquaticPlantsValidator,
  getPestManagementPlanValidator,
  getWeatherCondTemperatureValidator,
  getTransectOffsetDistanceValidator,
  getWindValidator,
  transferErrorsFromChemDetails,
  getPlotIdentificatiomTreesValidator
} from '../../../rjsf/business-rules/customValidation';
import {
  autoFillSlopeAspect,
  autoFillTotalBioAgentQuantity,
  autoFillTotalReleaseQuantity,
  autoFillTreeNumbers,
  populateTransectLineAndPointData
} from '../../../rjsf/business-rules/populateCalculatedFields';
import { mapDBActivityToDoc, mapDocToDBActivity, populateSpeciesArrays } from '../../../utils/addActivity';
import { debounced } from '../../../utils/FunctionUtils';
import { calculateGeometryArea, calculateLatLng } from '../../../utils/geometryHelpers';
import { retrieveFormDataFromSession, saveFormDataToSession } from '../../../utils/saveRetrieveFormData';
import { MapContextMenuData } from '../map/MapContextMenu';
import { AuthStateContext } from '../../../contexts/authStateContext';
import './scrollbar.css';
import { MapRecordsContextProvider } from 'contexts/MapRecordsContext';

const useStyles = makeStyles((theme: Theme) => ({
  mapContainer: {
    height: '600px'
  },
  map: {
    height: '100%',
    width: '100%',
    zIndex: 0
  },
  formContainer: {
    display: 'block'
  },
  formSettingsContainer: {
    padding: 20,
    backgroundColor: theme.palette.background.default,
    border: '1px solid lightgray',
    marginBottom: 20
  }
}));

interface IActivityPageProps {
  classes?: any;
  activityId?: string;
  setObservation?: Function;
  setFormHasErrors?: Function;
  setParentFormRef?: Function;
  setWellIdandProximity?: Function;
}

//why does this page think I need a map context menu ?
const ActivityPage: React.FC<IActivityPageProps> = (props) => {
  const classes = useStyles();
  const dataAccess = useDataAccess();
  const authStateContext = useContext(AuthStateContext);
  const databaseContext = useContext(DatabaseContext);
  const api = useInvasivesApi();
  const [isLoading, setIsLoading] = useState(true);
  const [linkedActivity, setLinkedActivity] = useState(null);
  const [geometry, setGeometry] = useState<Feature[]>([]);
  const [extent, setExtent] = useState(null);
  // "is it open?", "what coordinates of the mouse?", that kind of thing:
  const initialContextMenuState: MapContextMenuData = { isOpen: false, lat: 0, lng: 0 };
  const [contextMenuState, setContextMenuState] = useState(initialContextMenuState);
  const [suggestedJurisdictions, setSuggestedJurisdictions] = useState();
  /* commented out for sonar cloud, but this will be needed to close the context menu for this page:
    const handleContextMenuClose = () => {
      setContextMenuState({ ...contextMenuState, isOpen: false });
    };
  */

  const [doc, setDoc] = useState(null);

  const [photos, setPhotos] = useState<IPhoto[]>([]);

  const [applicationUsers, setApplicationUsers] = useState([]);

  const isMobile = () => {
    return Capacitor.platform !== 'web';
  };

  /**
   * Applies overriding updates to the current doc,
   * and queues an update to the corresponding DB state
   *
   * @param {*} updates Updates as subsets of the doc/activity object
   */
  const updateDoc = async (updates) => {
    if (doc?.docType === DocType.REFERENCE_ACTIVITY) {
      return;
    }
    let updatedDoc = {
      ...doc,
      ...updates,
      // deep merge:
      formData: {
        ...doc?.formData,
        ...updates?.formData,
        activity_data: {
          ...doc?.formData?.activity_data,
          ...updates?.formData?.activity_data
        },
        activity_type_data: {
          ...doc?.formData?.activity_type_data,
          ...updates?.formData?.activity_type_data
        },
        activity_subtype_data: {
          ...doc?.formData?.activity_subtype_data,
          ...updates?.formData?.activity_subtype_data
        }
      }
    };
    const hashedNewDoc = JSON.stringify(updatedDoc);
    const hashedDoc = JSON.stringify(doc);
    if (!updatedDoc || hashedDoc === hashedNewDoc) {
      return false;
    }

    // SECOND-ORDER EFFECT OVERRIDES (changing one field affects another)
    updatedDoc = populateSpeciesArrays(updatedDoc);

    if (!updatedDoc._id) {
      return false;
    }

    setDoc(updatedDoc);
    try {
      const appStateResults = await dataAccess.getAppState(databaseContext);
      const dbUpdates = debounced(1000, async (updated) => {
        // TODO use an api endpoint to do this merge logic instead
        const oldActivity = await dataAccess.getActivityById(
          updated._id,
          databaseContext,
          false,
          appStateResults.referenceData
        );
        const newActivity = {
          ...oldActivity,
          ...mapDocToDBActivity(updated)
        };

        // this has to be a bug? if (!oldActivity) await dataAccess.createActivity(newActivity, databaseContext);
        await dataAccess.updateActivity(newActivity, databaseContext);
      });
      await dbUpdates(updatedDoc);
      return true;
    } catch (e) {
      return false;
    }
  };

  /**
   * Set the default form data values
   *
   * @param {*} activity The doc/activity object
   */
  const getDefaultFormDataValues = (activity: any) => {
    const { activity_data } = activity.formData || {};
    const activity_type_data = activity.formData.activity_type_data || {
      activity_persons: [{ person_name: undefined }]
    };

    let needsInsert = false;
    let userNameInject = '';
    if (activity_type_data?.activity_persons) {
      if (
        activity_type_data?.activity_persons.length > 0 &&
        activity_type_data?.activity_persons[0].person_name === undefined
      ) {
        needsInsert = true;
        if (authStateContext.userInfo.displayName) {
          userNameInject = authStateContext.userInfo?.displayName;
        } else {
          userNameInject = authStateContext.userInfo?.bceid_business_name;
        }
      }
    }
    return {
      ...activity.formData,
      activity_data: {
        ...activity_data,
        reported_area: calculateGeometryArea(activity.geometry)
      },
      activity_type_data: {
        ...activity_type_data,
        activity_persons: needsInsert ? [{ person_name: userNameInject }] : activity_type_data?.activity_persons || [{}]
      }
    };
  };

  /**
   * Save the geometry added by the user
   *
   * @param {Feature} geoJSON The geometry in GeoJSON format
   */
  const saveGeometry = useCallback((geom: Feature[]) => {
    setDoc(async (activity: any) => {
      const { latitude, longitude } = calculateLatLng(geom) || {};
      var utm = calc_utm(longitude, latitude);
      let utm_zone = utm[0];
      let utm_easting = utm[1];
      let utm_northing = utm[2];
      /*****exported DisplayPosition utm_zone function
      //latlong to utms / utm zone conversion
      let utm_easting, utm_northing, utm_zone;
      //if statement prevents errors on page load, as lat/long isn't defined
      if (longitude !== undefined && latitude !== undefined) {
        utm_zone = ((Math.floor((longitude + 180) / 6) % 60) + 1).toString(); //getting utm zone
        proj4.defs([
          ['EPSG:4326', '+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees'],
          ['EPSG:AUTO', `+proj=utm +zone= ${utm_zone} +datum=WGS84 +units=m +no_defs`]
        ]);
        const en_m = proj4('EPSG:4326', 'EPSG:AUTO', [longitude, latitude]); // conversion from (long/lat) to UTM (E/N)
        utm_easting = Number(en_m[0].toFixed(4));
        utm_northing = Number(en_m[1].toFixed(4));
      }*/

      const activityDoc = {
        ...activity,
        formData: {
          ...activity.formData,
          activity_data: {
            ...activity.formData.activity_data,
            latitude,
            longitude,
            utm_zone,
            utm_easting,
            utm_northing,
            reported_area: calculateGeometryArea(geom)
          }
        },
        geometry: geom,
        status: ActivityStatus.EDITED,
        dateUpdated: new Date()
      };
      await updateDoc(activityDoc);
      return activityDoc;
    });
  }, []);

  /**
   * Save the map Extent within the database
   *
   * @param {*} extent The leaflet bounds object
   */
  const saveExtent = async (newExtent: any) => {
    await updateDoc({ extent: newExtent });
  };

  /**
   * Save the photos.
   *
   * @param {IPhoto} photosArr An array of photo objects.
   */
  const savePhotos = async (photosArr: IPhoto[]) => {
    await updateDoc({ photos: photosArr, dateUpdated: new Date() });
  };

  /*
    Function that runs if the form submit fails and has errors
  */
  const [alertErrorsOpen, setAlertErrorsOpen] = useState(false);

  const onFormSubmitError = (error: any, formRef: any) => {
    setAlertErrorsOpen(true);
    console.log('setting doc');
    updateDoc({
      formData: formRef.current.state.formData,
      status: ActivityStatus.EDITED,
      dateUpdated: new Date(),
      formStatus: FormValidationStatus.INVALID
    });
  };

  const handleAlertErrorsClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }

    setAlertErrorsOpen(false);
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

    await formRef.setState({
      ...formRef.state,
      schemaValidationErrors: [],
      schemaValidationErrorSchema: {}
    });

    updateDoc({
      formData: event.formData,
      status: ActivityStatus.EDITED,
      dateUpdated: new Date(),
      formStatus: FormValidationStatus.VALID
    });
  };

  /**
   * Save the form whenever it changes.
   *
   * Note: debouncing will prevent this from running more than once every `100` milliseconds.
   *
   * @param {*} event the form change event
   */
  const onFormChange = debounced(100, async (event: any, ref: any, lastField: any, callbackFun: () => void) => {
    let updatedFormData = event.formData;

    updatedFormData.activity_subtype_data = populateTransectLineAndPointData(updatedFormData.activity_subtype_data);
    updatedFormData.activity_subtype_data = autoFillTreeNumbers(updatedFormData.activity_subtype_data);

    //auto fills slope or aspect to flat if other is chosen flat (plant terrastrial observation activity)
    updatedFormData = autoFillSlopeAspect(updatedFormData, lastField);
    //auto fills total release quantity (only on biocontrol release activity)
    updatedFormData = autoFillTotalReleaseQuantity(updatedFormData);
    //auto fills total bioagent quantity (only on biocontrol release monitoring activity)
    updatedFormData = autoFillTotalBioAgentQuantity(updatedFormData);

    if (callbackFun) {
      callbackFun();
    }
  });
  /**
   * Paste copied form data saved in session storage
   * Update the doc (activity) with the latest form data and store it in DB
   */
  const pasteFormData = async () => {
    await updateDoc({
      formData: retrieveFormDataFromSession(doc),
      status: ActivityStatus.EDITED,
      dateUpdated: new Date(),
      formStatus: FormValidationStatus.NOT_VALIDATED
    });
  };

  /**
   * Copy form data into session storage
   */
  const copyFormData = () => {
    const { formData, activitySubtype } = doc;

    saveFormDataToSession(formData, activitySubtype);
  };

  /*
    Function to pull activity results from the DB given an activityId if present
  */
  const getActivityResultsFromDB = async (activityId: any): Promise<any> => {
    const appStateResults = await dataAccess.getAppState(databaseContext);
    if (!appStateResults) {
      return;
    }

    let activityResults;
    if (Capacitor.getPlatform() === 'web') {
      activityResults = await dataAccess.getActivityById(
        activityId || (appStateResults.activeActivity as string),
        databaseContext,
        false
      );
    } else {
      try {
        activityResults = await dataAccess.getActivityById(
          activityId || appStateResults.activeActivity,
          databaseContext,
          true,
          appStateResults.referenceData
        );
      } catch (e) {
        console.log('error reading activity: ', JSON.stringify(e));
      }
    }
    return mapDBActivityToDoc(activityResults);
  };

  /*
    Function to set the active activity in the DB context and the current activity view
  */
  /* const setActiveActivity = async (activeActivity: any) => {
    setIsCloned(true);
    await dataAccess.setAppState({ activeActivity: activeActivity }, databaseContext);
  }; */

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
              // const addedActivity = await addClonedActivityToDB(databaseContextPouch, doc);
              //setActiveActivity(addedActivity);
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

    if (updatedDoc?.activitySubtype?.includes('ChemicalPlant')) {
      linkedRecordId = updatedDoc.formData?.activity_subtype_data?.activity_id;
    } else if (
      ['Treatment', 'Monitoring'].includes(updatedDoc.activityType) &&
      updatedDoc.activitySubtype.includes('Plant')
    ) {
      linkedRecordId = updatedDoc.formData?.activity_type_data?.activity_id;
    }

    if (linkedRecordId) {
      const linkedRecordActivityResult = await getActivityResultsFromDB(linkedRecordId);
      setLinkedActivity(linkedRecordActivityResult);
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

  const [warningDialog, setWarningDialog] = useState<IWarningDialog>({
    dialogActions: [],
    dialogOpen: false,
    dialogTitle: '',
    dialogContentText: null
  });

  //sets well id and proximity if there are any
  const setWellIdandProximity = async (wellIdandProximity: any) => {
    const activityResult = await getActivityResultsFromDB(props.activityId || null);
    //if nothing is received, don't do anything
    if (!wellIdandProximity) {
      return;
    } else {
      const newFormData = { ...doc };
      //set well_id and well_proximity fields
      newFormData['formData']['activity_subtype_data']['Well_Information']['well_id'] = wellIdandProximity.id
        ? wellIdandProximity.id
        : undefined;
      newFormData['formData']['activity_subtype_data']['Well_Information']['well_proximity'] =
        wellIdandProximity.proximity ? Number(wellIdandProximity.proximity.toFixed(0)) : undefined;

      const newValuesAreSame: boolean =
        newFormData['formData']['activity_subtype_data']['Well_Information']['well_id'] ===
          activityResult['formData']['activity_subtype_data']['Well_Information']['well_id'] &&
        newFormData['formData']['activity_subtype_data']['Well_Information']['well_proximity'] ===
          activityResult['formData']['activity_subtype_data']['Well_Information']['well_proximity'];

      //if it is a Chemical treatment and there are wells too close, display warning dialog
      if (
        doc.activitySubtype.includes('Treatment_ChemicalPlant') &&
        (wellIdandProximity.proximity < 50 || wellIdandProximity.wellInside) &&
        !newValuesAreSame
      ) {
        setWarningDialog({
          dialogOpen: true,
          dialogTitle: 'Warning!',
          dialogContentText: 'There are wells that either inside your area or too close to it. Do you wish to proceed?',
          dialogActions: [
            {
              actionName: 'No',
              actionOnClick: async () => {
                setWarningDialog({ ...warningDialog, dialogOpen: false });
                setGeometry(null);

                await updateDoc({
                  ...doc,
                  formData: {
                    ...doc.formData,
                    activity_data: {
                      ...doc.formData.activity_data,
                      latitude: undefined,
                      longitude: undefined,
                      utm_zone: undefined,
                      utm_northing: undefined,
                      utm_easting: undefined,
                      well_id: undefined,
                      well_proximity: undefined,
                      reported_area: undefined
                    }
                  }
                });
              }
            },
            {
              actionName: 'Yes',
              actionOnClick: async () => {
                setWarningDialog({ ...warningDialog, dialogOpen: false });

                await updateDoc({ formData: newFormData['formData'] });
              },
              autoFocus: true
            }
          ]
        });
      }
      //if it is a Observation and there are wells too close, display warning dialog
      else if (
        doc.activitySubtype.includes('Observation') &&
        (wellIdandProximity.proximity < 50 || wellIdandProximity.wellInside) &&
        !newValuesAreSame
      ) {
        setWarningDialog({
          dialogOpen: true,
          dialogTitle: 'Warning!',
          dialogContentText: 'There are wells that either inside your area or too close to it.',
          dialogActions: [
            {
              actionName: 'Ok',
              actionOnClick: async () => {
                setWarningDialog({ ...warningDialog, dialogOpen: false });
                await updateDoc({ formData: newFormData['formData'] });
              },
              autoFocus: true
            }
          ]
        });
      }
      //If not in Observation nor in Chemical Treatment, just make changes to fields
      else {
        await updateDoc({ formData: { ...newFormData['formData'] } });
      }
    }
  };

  const invasivesApi = useInvasivesApi();

  useEffect(() => {
    const getActivityData = async () => {
      const activityResult = await getActivityResultsFromDB(props.activityId || null);

      if (!activityResult) {
        setIsLoading(false);
        return;
      }

      let updatedFormData = getDefaultFormDataValues(activityResult);
      updatedFormData = setUpInitialValues(activityResult, updatedFormData);
      const updatedDoc = { ...activityResult, formData: updatedFormData };
      setGeometry(updatedDoc.geometry);
      // setExtent(updatedDoc.extent);
      setPhotos(updatedDoc.photos || []);
      setDoc(updatedDoc);

      await updateDoc(updatedDoc);

      if (updatedDoc.geometry) {
        const res = await dataAccess.getJurisdictions({ search_feature: updatedDoc.geometry[0] }, databaseContext);
        setSuggestedJurisdictions(res.rows);
      }

      setIsLoading(false);
    };

    getActivityData();
  }, [databaseContext]);

  useEffect(() => {
    if (isLoading || !doc) {
      return;
    }

    const getJurSuggestions = async () => {
      if (geometry[0]) {
        const res = await dataAccess.getJurisdictions({ search_feature: geometry[0] }, databaseContext);
        setSuggestedJurisdictions(res.rows);
      }
    };

    if (geometry && geometry[0]) {
      if (booleanWithin(geometry[0] as any, bcArea as any)) {
        saveGeometry(geometry);
        getJurSuggestions();
      } else {
        setWarningDialog({
          dialogOpen: true,
          dialogTitle: 'Error!',
          dialogContentText: 'The geometry drawn is outside the British Columbia.',
          dialogActions: [
            {
              actionName: 'OK',
              actionOnClick: async () => {
                setWarningDialog({ ...warningDialog, dialogOpen: false });
              },
              autoFocus: true
            }
          ]
        });
        //setGeometry(null);
      }
    }
  }, [geometry, isLoading, saveGeometry]);

  useEffect(() => {
    if (isLoading || !doc) {
      return;
    }

    if (doc.docType !== DocType.REFERENCE_ACTIVITY) {
      saveExtent(extent);
    }
  }, [extent, isLoading, saveExtent]);

  useEffect(() => {
    if (isLoading || !doc) {
      return;
    }
    if (isMobile()) {
      // Load users from cache
      dataAccess.getApplicationUsers(databaseContext).then((res) => {
        setApplicationUsers(res);
      });
    } else {
      api.getApplicationUsers().then((res) => {
        setApplicationUsers(res);
      });
    }
  }, [isLoading, doc]);

  useEffect(() => {
    if (isLoading || !doc) {
      return;
    }

    if (doc.docType !== DocType.REFERENCE_ACTIVITY) {
      savePhotos(photos);
    }
  }, [photos, isLoading]);

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
      <MapRecordsContextProvider>
        {/*
      <Paper style={{ width: '100%' }} elevation={5}>
        <Typography align="center" style={{ paddingTop: 50, paddingBottom: 30 }} variant="h3">
          How to test this page:
        </Typography>
        <Box display="flex" width="80%" justifyContent="center">
          <Typography
            align="left"
            style={{ whiteSpace: 'pre-line', paddingLeft: 100, paddingTop: 10, paddingBottom: 30 }}
            variant="body1">
            {`Make a geometry on the map near your current location. Add your form content and hit "Check Form For Errors". If there are none, hit "I'm done here." to return to My Records.
            
            Some tips:
            
            * The 'pin' button on the bottom right of the map jumps to your location.
            * This new map is in beta.  Ignore the layer pickers for the time being.
            * You can minimize the map, form, and photos boxes by clicking their titles (or anywhere on top of them).
            * There is a big scrollbar on the right.`}
          </Typography>
        </Box>
      </Paper>
      */}
        {!doc && (
          <>
            <Box mb={3}>
              <Typography variant="h4">Current Activity </Typography>
            </Box>
            <Typography>
              There is no current activity. When you start creating an activity, it will become your current activity
              and show up in this tab.
            </Typography>
          </>
        )}
        {doc && (
          <>
            <Box marginTop="2rem" mb={3}>
              <Typography align="center" variant="h4">
                {doc.activitySubtype &&
                  doc.activitySubtype
                    .replace(/([A-Z])/g, ' $1')
                    .replace(/_/g, '')
                    .replace(/^./, function (str) {
                      return str.toUpperCase();
                    })}
              </Typography>
            </Box>
            <Box display="flex" flexDirection="row" justifyContent="space-between" padding={1} mb={3}>
              <Typography align="center">Activity ID: {doc.shortId ? doc.shortId : 'unknown'}</Typography>
              <Typography align="center">
                Date created: {doc.dateCreated ? new Date(doc.dateCreated).toString() : 'unknown'}
              </Typography>
            </Box>
            <ActivityComponent
              customValidation={getCustomValidator([
                getAreaValidator(doc.activitySubtype),
                getDateAndTimeValidator(doc.activitySubtype),
                getWindValidator(doc.activitySubtype),
                getSlopeAspectBothFlatValidator(),
                getTemperatureValidator(doc.activitySubtype),
                getPosAndNegObservationValidator(),
                getTargetPhenologySumValidator(),
                getTerrestrialAquaticPlantsValidator(),
                getShorelineTypesPercentValidator(),
                getPestManagementPlanValidator(),
                getWeatherCondTemperatureValidator(),
                transferErrorsFromChemDetails(),
                getTransectOffsetDistanceValidator(),
                getVegTransectPointsPercentCoverValidator(),
                getJurisdictionPercentValidator(),
                getInvasivePlantsValidator(linkedActivity),
                getPlotIdentificatiomTreesValidator(doc.activitySubtype)
              ])}
              customErrorTransformer={getCustomErrorTransformer()}
              classes={classes}
              activity={doc}
              suggestedJurisdictions={suggestedJurisdictions}
              linkedActivity={linkedActivity}
              onFormChange={onFormChange}
              onFormSubmitSuccess={onFormSubmitSuccess}
              onFormSubmitError={onFormSubmitError}
              photoState={{ photos, setPhotos }}
              mapId={doc._id}
              geometryState={{ geometry, setGeometry }}
              //interactiveGeometryState={{ interactiveGeometry, setInteractiveGeometry }}
              extentState={{ extent, setExtent }}
              contextMenuState={{ state: contextMenuState, setContextMenuState }} // whether someone clicked, and click x & y
              pasteFormData={() => pasteFormData()}
              copyFormData={() => copyFormData()}
              //cloneActivityButton={generateCloneActivityButton}
              setParentFormRef={props.setParentFormRef}
              showDrawControls={true}
              setWellIdandProximity={setWellIdandProximity}
            />
          </>
        )}
        <WarningDialog
          dialogOpen={warningDialog.dialogOpen}
          dialogTitle={warningDialog.dialogTitle}
          dialogActions={warningDialog.dialogActions}
          dialogContentText={warningDialog.dialogContentText}
        />
      </MapRecordsContextProvider>
      <Snackbar open={alertErrorsOpen} autoHideDuration={6000} onClose={handleAlertErrorsClose}>
        <Alert onClose={handleAlertErrorsClose} severity="error" sx={{ width: '100%' }}>
          There are errors in your form. Please make sure your form contains no errors and try again.
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ActivityPage;

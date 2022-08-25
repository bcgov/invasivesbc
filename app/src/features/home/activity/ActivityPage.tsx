import { Alert, Box, Container, Snackbar, Theme, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import booleanWithin from '@turf/boolean-within';
import { ActivityStatus } from 'constants/activities';
import { Feature } from 'geojson';
import { useInvasivesApi } from 'hooks/useInvasivesApi';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import ActivityComponent from '../../../components/activity/ActivityComponent';
import { IGeneralDialog, GeneralDialog } from '../../../components/dialog/GeneralDialog';
import bcArea from '../../../components/map/BC_AREA.json';
import { IPhoto } from '../../../components/photo/PhotoContainer';
import { DatabaseContext } from '../../../contexts/DatabaseContext';
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
  getTreatedAreaValidator,
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
import { calculateGeometryArea, calculateLatLng } from '../../../utils/geometryHelpers';
import { retrieveFormDataFromSession, saveFormDataToSession } from '../../../utils/saveRetrieveFormData';
import './scrollbar.css';
import { useHistory } from 'react-router';
import ActivityMapComponent from 'components/activity/ActivityMapComponent';
import { getClosestWells } from 'components/activity/closestWellsHelpers';
import { useSelector } from '../../../state/utilities/use_selector';
import { selectAuth } from '../../../state/reducers/auth';
import { selectActivity } from '../../../state/reducers/activity';
import { selectNetworkConnected } from '../../../state/reducers/network';
import { selectConfiguration } from '../../../state/reducers/configuration';
import { useDispatch } from 'react-redux';
import {
  ACTIVITY_ON_FORM_CHANGE_REQUEST,
  ACTIVITY_SAVE_REQUEST,
  ACTIVITY_UPDATE_GEO_REQUEST,
  ACTIVITY_SUBMIT_REQUEST
} from 'state/actions';
import { selectUserSettings } from 'state/reducers/userSettings';

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
  setClosestWells?: Function;
}

//why does this page think I need a map context menu ?
const ActivityPage: React.FC<IActivityPageProps> = (props) => {
  const dispatch = useDispatch();
  const activityInStore = useSelector(selectActivity);
  const userSettingsState = useSelector(selectUserSettings);

  const [geometry, setGeometry] = useState<Feature[]>([]);

  useEffect(() => {
    if (geometry && geometry[0] && JSON.stringify(geometry) !== activityInStore.activity.geometry) {
      dispatch({ type: ACTIVITY_UPDATE_GEO_REQUEST, payload: { geometry: geometry } });
    }
  }, [geometry]);

  const classes = useStyles();
  const databaseContext = useContext(DatabaseContext);
  const api = useInvasivesApi();
  const { extendedInfo, displayName, roles } = useSelector(selectAuth);
  const { MOBILE } = useSelector(selectConfiguration);

  const [isLoading, setIsLoading] = useState(true);
  const [linkedActivity, setLinkedActivity] = useState(null);
  const [extent, setExtent] = useState(null);
  const [alertErrorsOpen, setAlertErrorsOpen] = useState(false);
  const [alertSavedOpen, setAlertSavedOpen] = useState(false);
  const [alertCopiedOpen, setAlertCopiedOpen] = useState(false);
  const [alertPastedOpen, setAlertPastedOpen] = useState(false);
  const history = useHistory();
  const [photos, setPhotos] = useState<IPhoto[]>([]);
  const connected = useSelector(selectNetworkConnected);
  const [warningDialog, setWarningDialog] = useState<IGeneralDialog>({
    dialogActions: [],
    dialogOpen: false,
    dialogTitle: '',
    dialogContentText: null
  });

  const [canSubmitWithoutErrors, setCanSubmitWithoutErrors] = useState(false);

  /**
   * Sets warning dialog when user tries to leave the page.
   * Warns user that unsaved form data will be lost
   */
  const onNavBack = () => {
    setWarningDialog({
      dialogOpen: true,
      dialogTitle: 'Unsaved Changes will be lost',
      dialogContentText: 'Are you sure you are ready to leave?  You will be lose unsaved changes.',
      dialogActions: [
        {
          actionName: 'No',
          actionOnClick: async () => {
            setWarningDialog({ ...warningDialog, dialogOpen: false });
          }
        },
        {
          actionName: 'Yes',
          actionOnClick: async () => {
            setWarningDialog({ ...warningDialog, dialogOpen: false });
            history.push('/home/activities');
          },
          autoFocus: true
        }
      ]
    });
  };

  /**
   * Submits activity as official record
   */
  const onSubmitAsOfficial = () => {
    setWarningDialog({
      dialogOpen: true,
      dialogTitle: 'Submit to Database (Publish Draft)',
      dialogContentText:
        'Are you sure you are ready to publish the record?  Once submitted, it will be viewable by all users with access to this record type.',
      dialogActions: [
        {
          actionName: 'No',
          actionOnClick: async () => {
            setWarningDialog({ ...warningDialog, dialogOpen: false });
          }
        },
        {
          actionName: 'Yes',
          actionOnClick: async () => {
            setWarningDialog({ ...warningDialog, dialogOpen: false });
            dispatch({
              type: ACTIVITY_SUBMIT_REQUEST,
              payload: {
                activity_ID: activityInStore.activity.activity_id
              }
            });
            try {
              setAlertSavedOpen(true);
              setTimeout(() => {
                history.push('/home/activities');
              }, 1000);
            } catch (e) {
              alert('Error submitting.  Please try again later.');
              console.log(e);
            }
          },
          autoFocus: true
        }
      ]
    });
  };

  const isAlreadySubmitted = () => {
    return (
      activityInStore.activity.form_status === ActivityStatus.SUBMITTED ||
      activityInStore.activity.formStatus === ActivityStatus.SUBMITTED
    );
  };

  const hasRole = (role: string) => {
    if (roles.some((r) => r.role_name === role)) {
      return true;
    }
    return false;
  };

  const isGov = () => {
    if (hasRole('bcgov_staff_animals') || hasRole('bcgov_staff_plants') || hasRole('bcgov_staff_both')) {
      return true;
    }
    return false;
  };

  /**
   * Set the default form data values
   *
   * @param {*} activity The doc/activity object
   */
  //TODO test to see which if any of these we still need to move to createactivitypayload
  //  ****ITS NOT USED HERE*****
  const getDefaultFormDataValues = (activity: any) => {
    if (!activity) {
      return;
    }
    let activitySubtype = activity.activitySubtype;
    let updatedActivity = activity;
    let { activity_data } = activity.formData || {};
    let activity_subtype_data = activity.formData.activity_subtype_data || {};
    let activity_type_data = activity.formData.activity_type_data || {
      activity_persons: [{ person_name: '', applicator_license: '' }]
    };

    let nameNeedsInsert = false;
    let pacNeedsInsert = false;
    let employerNeedsInsert = false;
    let agenciesNeedInsert = false;
    let psnNeedsInsert = false;

    let userNameInject = '';
    let applicatorLicenseInject = '';
    let employerInject = '';
    let agenciesInject = [];
    let psnInject = '';

    if (activity_type_data?.activity_persons) {
      if (
        activity_type_data?.activity_persons.length > 0 &&
        (activity_type_data?.activity_persons[0].person_name === undefined ||
          activity_type_data?.activity_persons[0].person_name === '')
      ) {
        nameNeedsInsert = true;

        userNameInject = displayName;
      }
      if (
        activity_type_data?.activity_persons.length > 0 &&
        (activity_type_data?.activity_persons[0].applicator_license === undefined ||
          activity_type_data?.activity_persons[0].applicator_license === '')
      ) {
        pacNeedsInsert = true;
        if (extendedInfo?.pac_number) {
          applicatorLicenseInject = extendedInfo.pac_number;
        }
      }
    }

    // ALL RECORDS: Auto fill user's employer
    if (!activity_data?.employer_code || activity_data?.employer_code === '') {
      employerNeedsInsert = true;
      employerInject = extendedInfo.employer;
    }

    console.log('employerNeedsInsert', employerNeedsInsert);
    console.log('employerInject', employerInject);

    if (!activity_data?.invasive_species_agency_code || activity_data?.invasive_species_agency_code === '') {
      agenciesNeedInsert = true;
      agenciesInject = extendedInfo.funding_agencies;
    }

    // // If chemical treatment, auto fill service license number
    if (
      activitySubtype === 'Activity_Treatment_ChemicalPlantTerrestrial' ||
      activitySubtype === 'Activity_Treatment_ChemicalPlantAquatic'
    ) {
      if (
        !activity_subtype_data?.Treatment_ChemicalPlant_Information?.pesticide_employer_code ||
        activity_subtype_data.Treatment_ChemicalPlant_Information?.pesticide_employer_code === ''
      ) {
        psnNeedsInsert = true;
        psnInject = extendedInfo.pac_service_number_1
          ? extendedInfo.pac_service_number_1
          : extendedInfo.pac_service_number_2
          ? extendedInfo.pac_service_number_2
          : '';
      }
    }

    let activitySubtypeData;
    if (psnNeedsInsert) {
      activitySubtypeData = {
        ...activity_subtype_data,
        Treatment_ChemicalPlant_Information: {
          // if government user, auto fill as 000000
          pesticide_employer_code: isGov() ? '0' : psnInject.replace(/^0+(\d)/, '')
        }
      };
    } else {
      activitySubtypeData = {
        ...activity_subtype_data
      };
    }

    const activity_persons = [...activity_type_data?.activity_persons] || [{}];

    if (nameNeedsInsert) {
      activity_persons[0]['person_name'] = userNameInject;
    }
    if (pacNeedsInsert) {
      activity_persons[0]['applicator_license'] = applicatorLicenseInject;
    }

    updatedActivity = {
      ...activity.formData,
      activity_data: {
        ...activity_data,
        employer_code: employerNeedsInsert
          ? employerInject
          : activity_data?.employer_code
          ? activity_data.employer_code
          : '',
        invasive_species_agency_code: agenciesNeedInsert
          ? agenciesInject
          : activity_data?.invasive_species_agency_code
          ? activity_data.invasive_species_agency_code
          : '',
        reported_area: calculateGeometryArea(activity.geometry)
      },
      activity_type_data: {
        ...activity_type_data,
        activity_persons: [...activity_persons]
      },
      activity_subtype_data: activitySubtypeData
    };

    return updatedActivity;
  };

  /**
   * Save the photos.
   *
   * @param {IPhoto} photosArr An array of photo objects.
   */
  const savePhotos = async (photosArr: IPhoto[]) => {
    //  await updateDoc({ photos: photosArr, dateUpdated: new Date() });
  };

  /*
    Function that runs if the form submit fails and has errors
  */
  const onFormSubmitError = async (error: any, formRef: any) => {
    setAlertErrorsOpen(true);
    console.log('ERROR: ', error);
    const formData = { ...activityInStore.activity.formData, ...formRef.current.state.formData };

    setCanSubmitWithoutErrors(false);

    dispatch({
      type: ACTIVITY_SAVE_REQUEST,
      payload: { activity_ID: activityInStore.activity.activity_id, updatedFormData: { ...formData } }
    });
  };

  const handleAlertErrorsClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setAlertErrorsOpen(false);
  };

  const handleAlertSavedClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setAlertSavedOpen(false);
  };

  const handleAlertCopiedClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setAlertCopiedOpen(false);
  };

  const handleAlertPastedClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setAlertPastedOpen(false);
  };

  /**
   /**
   * Save the form when it is submitted.
   *
   * @param {*} event the form submit event
   */
  const onFormSubmitSuccess = async (event: any, formRef: any) => {
    if (props.setFormHasErrors) {
      props.setFormHasErrors(false);
    }
    const formData = { ...activityInStore.activity.formData, ...formRef.current.state.formData };

    setCanSubmitWithoutErrors(true);

    dispatch({
      type: ACTIVITY_SAVE_REQUEST,
      payload: {
        activity_ID: activityInStore.activity.activity_id,
        updatedFormData: { ...formData, form_status: ActivityStatus.SUBMITTED }
      }
    });
    setAlertSavedOpen(true);
  };

  /**
   * Save the form whenever it changes.
   *
   * Note: debouncing will prevent this from running more than once every `100` milliseconds.
   *
   * @param {*} event the form change event
   */
  const onFormChange = async (event: any, ref: any, lastField: any, callbackFun: (updatedFormData) => void) => {
    if (lastField !== '' && lastField !== undefined && lastField !== null)
      dispatch({
        type: ACTIVITY_ON_FORM_CHANGE_REQUEST,
        payload: { eventFormData: event.formData, lastField: lastField }
      });

    if (callbackFun) {
      // callbackFun(updatedFormData);
    }
  };

  /**
   * Paste copied form data saved in session storage
   * Update the doc (activity) with the latest form data and store it in DB
   */
  //TODO redux copy and paste
  const pasteFormData = async () => {
    console.log('Pasting form data');
    /* await updateDoc({
      formData: retrieveFormDataFromSession(doc),
      status: ActivityStatus.DRAFT,
      dateUpdated: new Date(),
      formStatus: ActivityStatus.DRAFT
    });
    setAlertPastedOpen(true);
    */
  };

  /**
   * Copy form data into session storage
   */
  const copyFormData = () => {
    const { form_data, activity_subtype } = activityInStore?.activity;
    saveFormDataToSession(form_data, activity_subtype);
    setAlertCopiedOpen(true);
  };

  /*
    Function to extract linked record id from record if it exists
    and then set the linkedActivity in state for reference within
    the form as an accordion and for population of certain fields later/validation
  */
  //TODO REDUX
  const handleRecordLinking = async (formData: any) => {
    /*
    if (doc?.activitySubtype?.includes('Monitoring') && formData?.activity_type_data?.linked_id) {
      /*    await updateDoc({
        formData: {
          activity_type_data: {
            linked_id: formData.activity_type_data.linked_id
          }
        }
      });

      const getLinked = async () => {
        let linkedRecordId: string = null;
        if (doc?.activitySubtype?.includes('Monitoring') && doc?.formData?.activity_type_data?.linked_id) {
          linkedRecordId = activityInStore.activity.formData.activity_type_data.linked_id;
        }
        if (linkedRecordId) {
          //TODO need array in store for linked records
          //const linkedRecordActivityResult = await getActivityResultsFromDB(linkedRecordId);
          //if (linkedRecordActivityResult) setLinkedActivity(linkedRecordActivityResult);
        }
      };
      getLinked();
    }
    */
  };

  //TODO REDUX - needs more criteria though
  useEffect(() => {
    if (linkedActivity) setGeometry(linkedActivity?.geometry);
  }, [linkedActivity]);

  // TODO DO WE NEED THIS? Should all be moved to create activity payload if we do
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

  // TODO REDUX
  //sets well id and proximity if there are any
  const setClosestWells = async (incomingActivityDoc) => {
    let closestWells = await getClosestWells(geometry, databaseContext, api, true, connected);

    //if nothing is received, don't do anything
    if (!closestWells || !closestWells.well_objects || closestWells.well_objects.length < 1) {
      //todo set wells on geo save succes action
      /* updateDoc({
        ...incomingActivityDoc,
        formData: {
          ...incomingActivityactivityInStore.activity.formData,
          activity_data: { ...incomingActivityactivityInStore.activity.formData.activity_data },
          activity_subtype_data: {
            ...incomingActivityactivityInStore.activity.formData.activity_subtype_data,
            Well_Information: [
              {
                well_id: 'No wells found',
                well_proximity: 'No wells found'
              }
            ]
          }
        }
      });
      return;
    }
    */
      const { well_objects, areWellsInside } = closestWells;
      const wellInformationArr = [];
      well_objects.forEach((well) => {
        if (well.proximity) {
          wellInformationArr.push({
            well_id: well.properties.WELL_TAG_NUMBER,
            well_proximity: well.proximity.toString()
          });
        }
      });

      //if it is a Chemical treatment and there are wells too close, display warning dialog
      if (
        activityInStore.activity.activitySubtype.includes('Treatment_ChemicalPlant') &&
        (well_objects[0].proximity < 50 || areWellsInside)
      ) {
        setWarningDialog({
          dialogOpen: true,
          dialogTitle: 'Warning!',
          dialogContentText: 'There are wells that either inside your area or too close to it. Do you wish to proceed?',
          dialogActions: [
            {
              actionName: 'No',
              actionOnClick: () => {
                setGeometry(null);
                /*  updateDoc({
                ...incomingActivityDoc,
                formData: {
                  ...incomingActivityactivityInStore.activity.formData,
                  activity_data: { ...incomingActivityactivityInStore.activity.formData.activity_data },
                  activity_subtype_data: {
                    ...incomingActivityactivityInStore.activity.formData.activity_subtype_data,
                    Well_Information: [
                      {
                        well_id: 'No wells found',
                        well_proximity: 'No wells found'
                      }
                    ]
                  }
                }
              });*/
                setWarningDialog({ ...warningDialog, dialogOpen: false });
              }
            },
            {
              actionName: 'Yes',
              actionOnClick: () => {
                /* updateDoc({
                ...incomingActivityDoc,
                formData: {
                  ...incomingActivityactivityInStore.activity.formData,
                  activity_data: { ...incomingActivityactivityInStore.activity.formData.activity_data },
                  activity_subtype_data: {
                    ...incomingActivityactivityInStore.activity.formData.activity_subtype_data,
                    Well_Information: [...wellInformationArr]
                  }
                }
              });*/
                setWarningDialog({ ...warningDialog, dialogOpen: false });
              },
              autoFocus: true
            }
          ]
        });
      } else if (
        activityInStore.activity.activitySubtype.includes('Observation') &&
        (well_objects[0].proximity < 50 || areWellsInside)
      ) {
        setWarningDialog({
          dialogOpen: true,
          dialogTitle: 'Warning!',
          dialogContentText: 'There are wells that either inside your area or too close to it.',
          dialogActions: [
            {
              actionName: 'Ok',
              actionOnClick: () => {
                // TODO REDUX - why call update doc here??
                /*     updateDoc({
                ...incomingActivityDoc,
                formData: {
                  ...incomingActivityactivityInStore.activity.formData,
                  activity_data: { ...incomingActivityactivityInStore.activity.formData.activity_data },
                  activity_subtype_data: {
                    ...incomingActivityactivityInStore.activity.formData.activity_subtype_data,
                    Well_Information: [...wellInformationArr]
                  }
                }
              });*/
                setWarningDialog({ ...warningDialog, dialogOpen: false });
              },
              autoFocus: true
            }
          ]
        });
      } else {
        //TODO REDUX
        /*  updateDoc({
        ...incomingActivityDoc,
        formData: {
          ...incomingActivityactivityInStore.activity.formData,
          activity_data: { ...incomingActivityactivityInStore.activity.formData.activity_data },
          activity_subtype_data: {
            ...incomingActivityactivityInStore.activity.formData.activity_subtype_data,
            Well_Information: [...wellInformationArr]
          }
        }
      });*/
      }
    }
  };

  // check if new geo different than store
  //todo: fully move to redux saga
  useEffect(() => {
    if (activityInStore.activity.geometry) {
      //if geometry is withing british columbia boundries, save it
      setTimeout(() => {
        if (booleanWithin(activityInStore.activity.geometry[0] as any, bcArea.features[0] as any)) {
          //saveGeometry(geometry);
        }
        //if geometry is NOT withing british columbia boundries, display err
        else {
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
          setGeometry(null);
        }
      }, 500);
    }
  }, [JSON.stringify(activityInStore?.activity?.geometry)]);

  return (
    <Container className={props.classes.container}>
      {!activityInStore.activity && (
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

      {activityInStore.activity && (
        <>
          <Box marginTop="2rem" mb={3}>
            <Typography align="center" variant="h4">
              {activityInStore.activity.activitySubtype &&
                activityInStore.activity.activitySubtype
                  .replace(/([A-Z])/g, ' $1')
                  .replace(/_/g, '')
                  .replace(/^./, function (str) {
                    return str.toUpperCase();
                  })}
            </Typography>
          </Box>
          <Box display="flex" flexDirection="row" justifyContent="space-between" padding={1} mb={3}>
            <Typography align="center">
              Activity ID: {activityInStore.activity.short_id ? activityInStore.activity.short_id : 'unknown'}
            </Typography>
            <Typography align="center">
              Date created:{' '}
              {activityInStore.activity.date_created
                ? new Date(activityInStore.activity.date_created).toString()
                : 'unknown'}
            </Typography>
          </Box>
        </>
      )}

      {useMemo(
        () => (
          <ActivityMapComponent
            classes={classes}
            activityId={activityInStore.activity.activity_id}
            mapId={activityInStore.activity.activity_id}
            geometryState={{ geometry: [activityInStore.activity.geometry], setGeometry: setGeometry }}
            showDrawControls={true}
            //isLoading={isLoading}
            isLoading={false}
          />
        ),
        [classes, geometry, setGeometry, extent, setExtent, isLoading, activityInStore?.activity?.geometry]
      )}

      {activityInStore.activity && (
        <>
          <ActivityComponent
            customValidation={getCustomValidator([
              getAreaValidator(activityInStore.activity.activity_subtype),
              getDateAndTimeValidator(activityInStore.activity.activity_subtype),
              getWindValidator(activityInStore.activity.activity_subtype),
              getSlopeAspectBothFlatValidator(),
              getTemperatureValidator(activityInStore.activity.activity_subtype),
              getPosAndNegObservationValidator(),
              getTreatedAreaValidator(),
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
              getPlotIdentificatiomTreesValidator(activityInStore.activity.activity_subtype)
            ])}
            customErrorTransformer={getCustomErrorTransformer()}
            classes={classes}
            activity={activityInStore.activity}
            suggestedJurisdictions={activityInStore.suggestedJurisdictions}
            linkedActivity={linkedActivity}
            onFormChange={onFormChange}
            onFormSubmitSuccess={onFormSubmitSuccess}
            onSubmitAsOfficial={onSubmitAsOfficial}
            canBeSubmittedWithoutErrors={() => {
              return canSubmitWithoutErrors;
            }}
            onNavBack={onNavBack}
            onFormSubmitError={onFormSubmitError}
            isAlreadySubmitted={isAlreadySubmitted}
            photoState={{ photos, setPhotos }}
            pasteFormData={() => pasteFormData()}
            copyFormData={() => copyFormData()}
            //cloneActivityButton={generateCloneActivityButton}
            setParentFormRef={props.setParentFormRef}
            isLoading={isLoading}
          />
        </>
      )}
      <GeneralDialog
        dialogOpen={warningDialog.dialogOpen}
        dialogTitle={warningDialog.dialogTitle}
        dialogActions={warningDialog.dialogActions}
        dialogContentText={warningDialog.dialogContentText}
      />

      <Snackbar open={alertErrorsOpen} autoHideDuration={6000} onClose={handleAlertErrorsClose}>
        <Alert onClose={handleAlertErrorsClose} severity="warning" sx={{ width: '100%' }}>
          The form was saved with errors.
        </Alert>
      </Snackbar>
      <Snackbar open={alertSavedOpen} autoHideDuration={6000} onClose={handleAlertSavedClose}>
        <Alert onClose={handleAlertSavedClose} severity="success" sx={{ width: '100%' }}>
          The form was saved successfully.
        </Alert>
      </Snackbar>
      <Snackbar open={alertCopiedOpen} autoHideDuration={6000} onClose={handleAlertCopiedClose}>
        <Alert onClose={handleAlertCopiedClose} severity="success" sx={{ width: '100%' }}>
          The form data was copied successfully.
        </Alert>
      </Snackbar>
      <Snackbar open={alertPastedOpen} autoHideDuration={6000} onClose={handleAlertPastedClose}>
        <Alert onClose={handleAlertPastedClose} severity="success" sx={{ width: '100%' }}>
          The form data was pasted successfully.
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ActivityPage;

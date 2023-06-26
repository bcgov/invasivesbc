import {Alert, Box, Container, Snackbar, Theme, Typography} from '@mui/material';
import {makeStyles} from '@mui/styles';
import booleanWithin from '@turf/boolean-within';
import {Feature} from 'geojson';
import React, {useEffect, useMemo, useState} from 'react';
import ActivityComponent from '../../../components/activity/ActivityComponent';
import {GeneralDialog, IGeneralDialog} from '../../../components/dialog/GeneralDialog';
import bcArea from '../../../components/map/BC_AREA.json';
import {IPhoto} from '../../../components/photo/PhotoContainer';
import {getCustomErrorTransformer} from '../../../rjsf/business-rules/customErrorTransformer';
import {validatorForActivity} from '../../../rjsf/business-rules/customValidation';
import './scrollbar.css';
import {useHistory} from 'react-router';
import ActivityMapComponent from 'components/activity/ActivityMapComponent';
import {useSelector} from '../../../state/utilities/use_selector';
import {selectAuth} from '../../../state/reducers/auth';
import {selectActivity} from '../../../state/reducers/activity';
import {selectNetworkConnected} from '../../../state/reducers/network';
import {selectConfiguration} from '../../../state/reducers/configuration';
import {useDispatch} from 'react-redux';
import {
  ACTIVITY_COPY_REQUEST,
  ACTIVITY_ON_FORM_CHANGE_REQUEST,
  ACTIVITY_PASTE_REQUEST,
  ACTIVITY_SAVE_REQUEST,
  ACTIVITY_SUBMIT_REQUEST,
  ACTIVITY_UPDATE_GEO_REQUEST,
  ACTIVITY_TOGGLE_NOTIFICATION_REQUEST,
  ACTIVITY_SET_UNSAVED_NOTIFICATION,
} from 'state/actions';
import {selectUserSettings} from 'state/reducers/userSettings';
import {ActivityStatus, ActivitySubtype, MAX_AREA} from 'sharedAPI';
import booleanContains from '@turf/boolean-contains';
import { selectMap } from 'state/reducers/map';

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
  const { extendedInfo, displayName, roles } = useSelector(selectAuth);
  const { MOBILE } = useSelector(selectConfiguration);

  const [isLoading, setIsLoading] = useState(true);
  const [linkedActivity] = useState(null);
  const [extent, setExtent] = useState(null);
  const [alertErrorsOpen, setAlertErrorsOpen] = useState(false);
  const [alertSavedOpen, setAlertSavedOpen] = useState(false);
  const [alertCopiedOpen, setAlertCopiedOpen] = useState(false);
  const [alertPastedOpen, setAlertPastedOpen] = useState(false);
  const [unsavedDelay, setUnsavedDelay] = useState(false);
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
    const form_data = { ...activityInStore.activity.form_data, ...formRef.current.state.formData };

    setCanSubmitWithoutErrors(false);

    dispatch({
      type: ACTIVITY_SAVE_REQUEST,
      payload: { activity_ID: activityInStore.activity.activity_id, updatedFormData: { ...form_data } }
    });
  };

  const handleAPIErrorClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    dispatch({
      type: ACTIVITY_TOGGLE_NOTIFICATION_REQUEST,
      payload: {
        notification: {
          visible: false,
          message: '',
          severity: 'success'
        }
      }
    });
  };

  const handleUnsavedClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    dispatch({
      type: ACTIVITY_SET_UNSAVED_NOTIFICATION,
      payload: {
        notification: {
          visible: false,
          message: '',
          severity: 'error'
        }
      }
    });
  };

  useEffect(() => {
    setTimeout(() => {
      setUnsavedDelay(true);
    }, 5000);
  }, []);

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
  };

  /**
   * Save the form whenever it changes.
   *
   * Note: debouncing will prevent this from running more than once every `100` milliseconds.
   *
   * @param {*} event the form change event
   */
  const onFormChange = async (event: any, ref: any, lastField: any, callbackFun: (updatedFormData) => void) => {
    console.log('last field check');
    //    if (lastField !== '' && lastField !== undefined && lastField !== null)
    dispatch({
      type: ACTIVITY_ON_FORM_CHANGE_REQUEST,
      payload: { eventFormData: event.formData, lastField: lastField, unsavedDelay: unsavedDelay }
    });
  };

  /**
   * Paste copied form data saved in session storage
   * Update the doc (activity) with the latest form data and store it in DB
   */
  //TODO redux copy and paste
  const pasteFormData = async () => {
    dispatch({
      type: ACTIVITY_PASTE_REQUEST
    });
    setAlertPastedOpen(true);
  };

  /**
   * Copy form data into session storage
   */
  const copyFormData = () => {
    dispatch({type: ACTIVITY_COPY_REQUEST})
  //  const { form_data, activity_subtype } = activityInStore?.activity;
    // saveFormDataToSession(activityInStore.activity.form_data, activity_subtype);
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

  // TODO REDUX
  //sets well id and proximity if there are any
  const setClosestWells = () => {
    //if it is a Chemical treatment and there are wells too close, display warning dialog

    let shouldWarn = false;
    activityInStore.activity.form_data?.activity_subtype_data?.Well_Information?.map((well) => {
      if (Number(well.well_proximity) < 50) shouldWarn = true;
    });

    if (activityInStore.activity.activity_subtype.includes('Treatment_ChemicalPlant') && shouldWarn) {
      setWarningDialog({
        dialogOpen: true,
        dialogTitle: 'Warning!',
        dialogContentText: 'There are wells that either inside your area or too close to it. Do you wish to proceed?',
        dialogActions: [
          {
            actionName: 'No',
            actionOnClick: () => {
              setWarningDialog({ ...warningDialog, dialogOpen: false });
              dispatch({ type: ACTIVITY_UPDATE_GEO_REQUEST, payload: { geometry: null } });
            }
          },
          {
            actionName: 'Yes',
            actionOnClick: () => {
              setWarningDialog({ ...warningDialog, dialogOpen: false });
            },
            autoFocus: true
          }
        ]
      });
    }
  };

  // check if new geo different than store
  //todo: fully move to redux saga
  useEffect(() => {
    if (activityInStore?.activity?.geometry && activityInStore.activity.geometry[0]) {
      if (activityInStore?.activity?.form_data?.activity_data?.reported_area < MAX_AREA) {
        setClosestWells();
      }
      //if geometry is withing british columbia boundries, save it
      setTimeout(() => {
        if (booleanContains(bcArea.features[0] as any, activityInStore.activity.geometry[0] as any )) {
          //saveGeometry(geometry);
        }
        //if geometry is NOT withing british columbia boundries, display err
        else {
          setWarningDialog({
            dialogOpen: true,
            dialogTitle: 'Error!',
            dialogContentText: 'The geometry drawn is outside British Columbia, you cannot save the current geometry.',
            dialogActions: [
              {
                actionName: 'OK',
                actionOnClick: async () => {
                  setWarningDialog({ ...warningDialog, dialogOpen: false });
                  // dispatch({ type: ACTIVITY_UPDATE_GEO_REQUEST, payload: { geometry: null } });
                },
                autoFocus: true
              }
            ]
          });
        }
      }, 1000);
    }
  }, [JSON.stringify(activityInStore?.activity?.geometry)]);

  const getTitle = (inputSubtype) => {
    switch (inputSubtype) {
      case ActivitySubtype.Monitoring_MechanicalTerrestrialAquaticPlant:
        return 'Activity Monitoring Mechanical Terrestrial or Aquatic Plant';
        break;
      case ActivitySubtype.Monitoring_ChemicalTerrestrialAquaticPlant:
        return 'Activity Monitoring Chemical Terrestrial or Aquatic Plant';
        break;
      default:
        return inputSubtype
          .replace(/([A-Z])/g, ' $1')
          .replace(/_/g, '')
          .replace(/^./, function (str) {
            return str.toUpperCase();
          });
    }
  };

  const mapState = useSelector(selectMap)

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
              {activityInStore.activity.activity_subtype && getTitle(activityInStore.activity.activity_subtype)}
            </Typography>
          </Box>
          <Box display="flex" flexDirection="row" justifyContent="space-between" padding={1} mb={3}>
            <Typography align="left">
              Activity ID: {activityInStore.activity.short_id ? activityInStore.activity.short_id : 'unknown'}
            </Typography>
            <Typography style={{ display: 'block', whiteSpace: 'pre-line', wordWrap: 'break-word' }} align="left">
              Date created:
              {activityInStore.activity.date_created
                ? new Date(activityInStore.activity.date_created).toString()
                : 'unknown'}
              {'\n'}Created by: {activityInStore.activity.created_by ? activityInStore.activity.created_by : 'unknown'}
              {'\n'}Date modified:{' '}
              {activityInStore.activity.received_timestamp
                ? new Date(activityInStore.activity.received_timestamp).toString()
                : new Date(activityInStore.activity.date_created).toString()}
              {'\n'}Modified by: {activityInStore.activity.updated_by ? activityInStore.activity.updated_by : 'unknown'}
            </Typography>
          </Box>
        </>
      )}


      {mapState?.map_center && useMemo(
        () => (
          <ActivityMapComponent
            classes={classes}
            activityId={activityInStore?.activity?.activity_id}
            mapId={activityInStore?.activity?.activity_id}
            geometryState={{ geometry: [activityInStore?.activity?.geometry], setGeometry: setGeometry }}
            showDrawControls={true}
            //isLoading={isLoading}
            isLoading={false}
            center={mapState?.map_center}
            zoom={mapState?.map_zoom}
          />
        ),
        [classes, geometry, setGeometry, extent, setExtent, isLoading, JSON.stringify(activityInStore?.activity?.geometry)]
      )}

      {activityInStore.activity && (
        <>
          <ActivityComponent
            customValidation={validatorForActivity(activityInStore.activity, linkedActivity)}
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

      <Snackbar open={activityInStore.notification?.visible} autoHideDuration={6000} onClose={handleAPIErrorClose}>
        <Alert onClose={handleAPIErrorClose} severity={ activityInStore.notification?.severity } sx={{ width: '100%' }}>
          { activityInStore.notification?.message }
        </Alert>
      </Snackbar>
      <Snackbar open={activityInStore.unsaved_notification?.visible} onClose={handleUnsavedClose}>
        <Alert onClose={handleUnsavedClose} severity={ activityInStore.unsaved_notification?.severity } sx={{ width: '100%' }}>
          { activityInStore.unsaved_notification?.message }
        </Alert>
      </Snackbar>
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

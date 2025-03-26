import { Button } from '@mui/material';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'utils/use_selector';
import Activity from 'state/actions/activity/Activity';
import './FormMenuButtons.css';
import { selectOfflineActivity } from 'state/reducers/offlineActivity';
import { ACTIVITY_OFFLINE_DELETE_ITEM } from 'state/actions';
import { useHistory } from 'react-router';

const FormMenuButtons = () => {
  const dispatch = useDispatch();
  const history = useHistory();

  const [saveDisabled, setSaveDisabled] = useState(false);
  const [draftDisabled, setDraftDisabled] = useState(false);

  const accessRoles = useSelector((state) => state.Auth?.accessRoles);
  const activityCreatedBy = useSelector((state) => state.ActivityPage?.activity?.created_by);
  const activityErrors = useSelector((state) => state.ActivityPage?.activityErrors);
  const activity_id = useSelector((state) => state.ActivityPage.activity.activity_id);
  const { connected } = useSelector((state) => state.Network);
  const status = useSelector((state) => state.ActivityPage?.activity?.form_status);
  const { serializedActivities } = useSelector(selectOfflineActivity);
  const username = useSelector((state) => state.Auth?.username);

  const recordIsSerializedActivity = !!serializedActivities[activity_id];
  // Users must have write permission and be online to delete, or record is users offline record
  const blockUserFromDeletingRecord = (saveDisabled || !connected) && !recordIsSerializedActivity;

  useEffect(() => {
    if (!activityCreatedBy || !username || !accessRoles) return;
    const createdByUser = username === activityCreatedBy;
    const isAdmin = accessRoles.some((role: Record<string, any>) => role.role_id === 18);
    if (isAdmin || createdByUser) {
      setSaveDisabled(false);
    } else {
      setSaveDisabled(true);
    }
    if (status === 'Submitted') {
      setDraftDisabled(true);
    }
  }, [accessRoles, username, activityCreatedBy]);

  const handleSaveDraft = () => {
    dispatch(Activity.save());
  };
  const handlePublish = () => {
    dispatch(Activity.submit());
  };
  const handleCopy = () => {
    dispatch(Activity.copy());
  };
  const handlePaste = () => {
    dispatch(Activity.paste());
  };

  const handleDelete = () => {
    if (recordIsSerializedActivity) {
      dispatch({ type: ACTIVITY_OFFLINE_DELETE_ITEM, payload: { id: activity_id } });
    } else {
      dispatch(Activity.deleteReq());
    }
    setTimeout(() => history.push('/Records'), 500);
  };

  return (
    <div id="form-menu-buttons">
      <Button onClick={handleSaveDraft} disabled={saveDisabled || draftDisabled} variant="contained">
        SAVE TO DRAFT {connected || '(LOCAL OFFLINE)'}
      </Button>
      <Button onClick={handlePublish} disabled={saveDisabled || activityErrors?.length > 0} variant="contained">
        SAVE & PUBLISH TO SUBMITTED {connected || '(LOCAL OFFLINE)'}
      </Button>
      <Button onClick={handleCopy} variant="contained">
        COPY FORM
      </Button>
      <Button disabled={saveDisabled} onClick={handlePaste} variant="contained">
        PASTE FORM
      </Button>
      <Button disabled={blockUserFromDeletingRecord} onClick={handleDelete} variant="contained">
        DELETE {recordIsSerializedActivity && 'FROM LOCAL DEVICE'}
      </Button>
    </div>
  );
};

export default FormMenuButtons;

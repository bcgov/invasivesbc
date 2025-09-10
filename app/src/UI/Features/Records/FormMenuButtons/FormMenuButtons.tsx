import { Button } from '@mui/material';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'utils/use_selector';
import Activity from 'state/actions/activity/Activity';
import 'UI/Features/Records/FormMenuButtons/FormMenuButtons.css';
import { selectOfflineActivity } from 'state/reducers/offlineActivity';
import { useNavigate } from 'react-router';

const FormMenuButtons = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const activityErrors = useSelector((state) => state.ActivityPage?.activityErrors);
  const activity_id = useSelector((state) => state.ActivityPage?.activity?.activity_id);

  const can_delete = useSelector((state) => !!state.ActivityPage?.activeActivityPermissions?.can_delete);
  const can_edit = useSelector((state) => !!state.ActivityPage?.activeActivityPermissions?.can_edit);
  const can_write = useSelector((state) => state.Auth?.writePrivilege?.length > 0);

  const { connected } = useSelector((state) => state.Network);
  const { serializedActivities } = useSelector(selectOfflineActivity);
  const status = useSelector((state) => state.ActivityPage?.activity?.form_status);

  const [saveDisabled, setSaveDisabled] = useState<boolean>(true);
  const [draftDisabled, setDraftDisabled] = useState<boolean>(true);

  const recordIsSerializedActivity = !!serializedActivities[activity_id];
  // Users must have write permission and be online to delete, or record is users offline record

  useEffect(() => {
    setSaveDisabled(!can_edit);
    setDraftDisabled(status === 'Submitted' || !can_edit);
  }, [activity_id, can_edit]);

  const handleSaveDraft = () => {
    dispatch(Activity.save());
  };
  const handlePublish = () => {
    dispatch(Activity.submit());
  };
  const handleDuplicate = () => {
    dispatch(Activity.copy());
  };

  const handleDelete = () => {
    if (recordIsSerializedActivity) {
      dispatch(Activity.Offline.delete(activity_id));
    } else {
      dispatch(Activity.deleteReq());
    }
    setTimeout(() => navigate('/Records'), 500);
  };

  return (
    <div id="form-menu-buttons">
      <Button onClick={handleSaveDraft} disabled={draftDisabled} variant="contained">
        SAVE TO DRAFT {connected || '(LOCAL OFFLINE)'}
      </Button>
      <Button onClick={handlePublish} disabled={saveDisabled || activityErrors?.length > 0} variant="contained">
        SAVE & PUBLISH TO SUBMITTED {connected || '(LOCAL OFFLINE)'}
      </Button>
      <Button onClick={handleDuplicate} disabled={!can_write} variant="contained">
        Duplicate Form
      </Button>
      <Button disabled={!can_delete} onClick={handleDelete} variant="contained">
        DELETE {recordIsSerializedActivity && 'FROM LOCAL DEVICE'}
      </Button>
    </div>
  );
};

export default FormMenuButtons;

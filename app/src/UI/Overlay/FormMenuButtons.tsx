import { Button } from '@mui/material';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'utils/use_selector';
import { OVERLAY_MENU_TOGGLE } from 'state/actions';
import Activity from 'state/actions/activity/Activity';

export const FormMenuButtons = (props) => {
  const dispatch = useDispatch();

  const [saveDisabled, setSaveDisabled] = useState(false);
  const [draftDisabled, setDraftDisabled] = useState(false);

  const { connected } = useSelector((state) => state.Network);
  const activityCreatedBy = useSelector((state) => state.ActivityPage?.activity?.created_by);
  const activityErrors = useSelector((state) => state.ActivityPage?.activityErrors);
  const status = useSelector((state) => state.ActivityPage?.activity?.form_status);
  const username = useSelector((state) => state.Auth?.username);
  const accessRoles = useSelector((state) => state.Auth?.accessRoles);

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
    dispatch({ type: OVERLAY_MENU_TOGGLE });
  };
  const handlePublish = () => {
    dispatch(Activity.submit());
    dispatch({ type: OVERLAY_MENU_TOGGLE });
  };
  const handleCopy = () => {
    dispatch(Activity.copy());
    dispatch({ type: OVERLAY_MENU_TOGGLE });
  };
  const handlePaste = () => {
    dispatch(Activity.paste());
    dispatch({ type: OVERLAY_MENU_TOGGLE });
  };
  const handleDelete = () => {
    dispatch(Activity.deleteReq());
    dispatch({ type: OVERLAY_MENU_TOGGLE });
    setTimeout(() => history.back(), 5000);
  };

  return (
    <>
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
      <Button disabled={saveDisabled || !connected} onClick={handleDelete} variant="contained">
        DELETE
      </Button>
    </>
  );
};

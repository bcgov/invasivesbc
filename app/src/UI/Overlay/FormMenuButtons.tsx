import { Button } from '@mui/material';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from 'utils/use_selector';
import {
  ACTIVITY_COPY_REQUEST,
  ACTIVITY_DELETE_REQUEST,
  ACTIVITY_PASTE_REQUEST,
  ACTIVITY_SAVE_REQUEST,
  ACTIVITY_SUBMIT_REQUEST,
  OVERLAY_MENU_TOGGLE
} from 'state/actions';

export const FormMenuButtons = (props) => {
  const dispatch = useDispatch();

  const [saveDisabled, setSaveDisabled] = useState(false);
  const [draftDisabled, setDraftDisabled] = useState(false);

  const { connected } = useSelector((state) => state.Network);
  const activityCreatedBy = useSelector((state: any) => state.ActivityPage?.activity?.created_by);
  const activityErrors = useSelector((state: any) => state.ActivityPage?.activityErrors);
  const status = useSelector((state: any) => state.ActivityPage?.activity?.form_status);
  const username = useSelector((state: any) => state.Auth?.username);
  const accessRoles = useSelector((state: any) => state.Auth?.accessRoles);

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
    dispatch({ type: ACTIVITY_SAVE_REQUEST });
    dispatch({ type: OVERLAY_MENU_TOGGLE });
  };
  const handlePublish = () => {
    dispatch({ type: ACTIVITY_SUBMIT_REQUEST });
    dispatch({ type: OVERLAY_MENU_TOGGLE });
  };
  const handleCopy = () => {
    dispatch({ type: ACTIVITY_COPY_REQUEST });
    dispatch({ type: OVERLAY_MENU_TOGGLE });
  };
  const handlePaste = () => {
    dispatch({ type: ACTIVITY_PASTE_REQUEST });
    dispatch({ type: OVERLAY_MENU_TOGGLE });
  };
  const handleDelete = () => {
    dispatch({ type: ACTIVITY_DELETE_REQUEST });
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

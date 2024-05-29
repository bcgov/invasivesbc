import { Button } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  ACTIVITY_COPY_REQUEST,
  ACTIVITY_DELETE_REQUEST,
  ACTIVITY_PASTE_REQUEST,
  ACTIVITY_SAVE_REQUEST,
  ACTIVITY_SUBMIT_REQUEST,
  OVERLAY_MENU_TOGGLE
} from 'state/actions';
import { useSelector } from 'utils/use_selector';

export const FormMenuButtons = (props) => {
  const dispatch = useDispatch();

  const { connected } = useSelector((state) => state.Network);
  const activityCreatedBy = useSelector((state: any) => state.ActivityPage?.activity?.created_by);
  const activityErrors = useSelector((state: any) => state.ActivityPage?.activityErrors);
  const status = useSelector((state: any) => state.ActivityPage?.activity?.form_status);
  const username = useSelector((state: any) => state.Auth?.username);
  const accessRoles = useSelector((state: any) => state.Auth?.accessRoles);

  const [saveDisabled, setSaveDisabled] = useState(false);
  const [draftDisabled, setDraftDisabled] = useState(false);

  useEffect(() => {
    if (!activityCreatedBy || !username || !accessRoles) return;

    const notMine = username !== activityCreatedBy;
    const notAdmin =
      accessRoles.filter((role) => {
        return role.role_id === 18;
      }).length === 0;
    if (notAdmin && notMine) {
      setSaveDisabled(true);
    } else {
      setSaveDisabled(false);
    }
    if (status === 'Submitted') {
      setDraftDisabled(true);
    }
  }, [accessRoles, username, activityCreatedBy]);

  return (
    <>
      <Button
        onClick={() => {
          dispatch({ type: ACTIVITY_SAVE_REQUEST });
          dispatch({ type: OVERLAY_MENU_TOGGLE });
        }}
        disabled={saveDisabled || draftDisabled}
        variant="contained"
      >
        SAVE TO DRAFT {connected || '(LOCAL OFFLINE)'}
      </Button>
      <Button
        onClick={() => {
          dispatch({ type: ACTIVITY_SUBMIT_REQUEST });
          dispatch({ type: OVERLAY_MENU_TOGGLE });
        }}
        disabled={saveDisabled || !connected || activityErrors?.length > 0 ? true : false}
        variant="contained"
      >
        SAVE & PUBLISH TO SUBMITTED
      </Button>
      <Button
        onClick={() => {
          dispatch({ type: ACTIVITY_COPY_REQUEST });
          dispatch({ type: OVERLAY_MENU_TOGGLE });
        }}
        variant="contained"
      >
        COPY FORM
      </Button>
      <Button
        disabled={saveDisabled}
        onClick={() => {
          dispatch({ type: ACTIVITY_PASTE_REQUEST });
          dispatch({ type: OVERLAY_MENU_TOGGLE });
        }}
        variant="contained"
      >
        PASTE FORM
      </Button>
      <Button
        disabled={saveDisabled || !connected}
        onClick={() => {
          dispatch({ type: ACTIVITY_DELETE_REQUEST });
          dispatch({ type: OVERLAY_MENU_TOGGLE });
          setTimeout(() => history.back(), 5000);
        }}
        variant="contained"
      >
        DELETE
      </Button>
    </>
  );
};

import { Button } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { ACTIVITY_COPY_REQUEST, ACTIVITY_DELETE_REQUEST, ACTIVITY_PASTE_REQUEST, ACTIVITY_SAVE_REQUEST, ACTIVITY_SUBMIT_REQUEST, OVERLAY_MENU_TOGGLE } from "state/actions";
import { useSelector } from "util/use_selector";

export const FormMenuButtons = (props) => {
  const dispatch = useDispatch();
  const activityStatus = useSelector((state: any) => state.ActivityPage?.activity?.form_status);
  const activityCreatedBy = useSelector((state: any) => state.ActivityPage?.activity?.created_by);
  const username = useSelector((state: any) => state.Auth?.username);
  const accessRoles = useSelector((state: any) => state.Auth?.accessRoles);

  const [saveDisabled, setSaveDisabled] = useState(false);


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
  }, [accessRoles, username, activityCreatedBy]);

  return (
    <>
      <Button
        onClick={() => {
          dispatch({ type: ACTIVITY_SAVE_REQUEST });
          dispatch({ type: OVERLAY_MENU_TOGGLE });
        }}
        disabled={saveDisabled}
        variant="contained">
        SAVE TO DRAFT
      </Button>
      <Button
        onClick={() => {
          dispatch({ type: ACTIVITY_SUBMIT_REQUEST });
          dispatch({ type: OVERLAY_MENU_TOGGLE });
        }}
        disabled={activityStatus && activityStatus === "Submitted" ? true : false}
        variant="contained">
        PUBLISH DRAFT TO SUBMITTED
      </Button>
      <Button
        onClick={() => {
          dispatch({ type: ACTIVITY_COPY_REQUEST });
          dispatch({ type: OVERLAY_MENU_TOGGLE });
        }}
        variant="contained">
        COPY FORM
      </Button>
      <Button
        onClick={() => {
          dispatch({ type: ACTIVITY_PASTE_REQUEST });
          dispatch({ type: OVERLAY_MENU_TOGGLE });
        }}
        variant="contained">
        PASTE FORM
      </Button>
      <Button
        onClick={() => {
          dispatch({ type: ACTIVITY_DELETE_REQUEST });
          dispatch({ type: OVERLAY_MENU_TOGGLE });
        }}
        variant="contained">
        DELETE
      </Button>
    </>
  );
}
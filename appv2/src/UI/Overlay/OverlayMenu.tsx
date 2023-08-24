import React from "react"
import './OverlayMenu.css'
import { OVERLAY_MENU_TOGGLE } from "state/actions";
import { Button } from "@mui/material";
import { useDispatch } from "react-redux";

export const OverlayMenu = (props) => {
    const dispatch = useDispatch();
    return <div className="overlayMenu">
        {props.children}
        <Button onClick={()=> {dispatch({type: OVERLAY_MENU_TOGGLE})}} variant="contained">Cancel</Button>
    </div>
}
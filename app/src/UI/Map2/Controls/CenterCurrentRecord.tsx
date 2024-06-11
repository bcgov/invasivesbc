import { IconButton, Tooltip } from '@mui/material';
import React, { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import AssignmentIcon from '@mui/icons-material/Assignment';
import 'UI/Global.css';
import { IAPP_PAN_AND_ZOOM, PAN_AND_ZOOM_TO_ACTIVITY } from 'state/actions';

export const CenterCurrentRecord = (props) => {
  const dispatch = useDispatch();
  /**
   * TrackMeButton
   * @description Component to handle the functionality of the find me button
   * @returns {void}
   */
  // const toolClass = toolStyles();
  const [show, setShow] = React.useState(false);
  const divRef = useRef();
  if (true) {
    // this is to stop user from clicking it again while things are happening
    return (
      <div ref={divRef} className="map-btn">
        <Tooltip
          open={show}
          classes={{ tooltip: 'toolTip' }}
          onMouseEnter={() => setShow(true)}
          onMouseLeave={() => setShow(false)}
          title={props.type === 'Activity' ? 'Center Current Activity' : 'Center Current IAPP'}
          placement="top-end"
        >
          <span>
            <IconButton
              className={'button'}
              onClick={() => {
                setShow(false);
                {
                  props.type === 'Activity' ? dispatch(PAN_AND_ZOOM_TO_ACTIVITY()) : dispatch(IAPP_PAN_AND_ZOOM());
                }
              }}
            >
              {props.type === 'Activity' ? (
                <AssignmentIcon />
              ) : (
                <img alt="iapp logo" src={'/assets/iapp_logo.gif'} style={{ maxWidth: '1rem', marginBottom: '0px' }} />
              )}
            </IconButton>
          </span>
        </Tooltip>
      </div>
    );
  } else {
    return <></>;
  }
};

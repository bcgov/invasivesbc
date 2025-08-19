import { IconButton, Tooltip } from '@mui/material';
import React, { useRef } from 'react';
import { useDispatch } from 'react-redux';
import AssignmentIcon from '@mui/icons-material/Assignment';
import 'UI/Global.css';
import MapActions from 'state/actions/map';
import { RecordSetType } from 'interfaces/UserRecordSet';

export const CenterCurrentRecord = (props) => {
  const dispatch = useDispatch();
  /**
   * TrackMeButton
   * @description Component to handle the functionality of the find me button
   * @returns {void}
   */
  // const toolClass = toolStyles();
  const [show, setShow] = React.useState(false);
  const divRef = useRef<HTMLDivElement | null>(null);

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
              const panAction =
                props.type === RecordSetType.Activity ? MapActions.panToActivity() : MapActions.panToIAPP();
              dispatch(panAction);
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
};

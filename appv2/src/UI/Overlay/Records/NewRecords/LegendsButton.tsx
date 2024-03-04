import React, { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { IconButton, Tooltip } from '@mui/material';
import { useSelector } from 'util/use_selector';
import { MAP_TOGGLE_LEGENDS } from 'state/actions';
import 'UI/Global.css';
import InfoIcon from '@mui/icons-material/Info';
import { useHistory } from 'react-router-dom';

export const LegendsButton = (props) => {
  const legendsPopup = useSelector((state: any) => state.Map?.legendsPopup);
  const history = useHistory();
  const dispatch = useDispatch();
  const divRef = useRef();

  const [show, setShow] = React.useState(false);

  const toggleLegend = () => {
    if (legendsPopup) {
      history.goBack();
    } else {
      history.push('/Legend');
    }
    dispatch({ type: MAP_TOGGLE_LEGENDS });
  };

  return (
    <div ref={divRef} className={legendsPopup ? 'map-btn-selected' : 'map-btn'}>
      <Tooltip
        open={show}
        classes={{ tooltip: 'toolTip' }}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        title="Map Legend"
        placement="top-end">
        <span>
          <IconButton
            onClick={() => {
              toggleLegend();
            }}>
            <InfoIcon />
          </IconButton>
        </span>
      </Tooltip>
    </div>
  );
};

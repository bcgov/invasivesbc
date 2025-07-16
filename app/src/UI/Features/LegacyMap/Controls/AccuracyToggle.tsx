import React, { useRef } from 'react';
import { useDispatch } from 'react-redux';
import { IconButton, Tooltip } from '@mui/material';
import { useSelector } from 'utils/use_selector';
import 'UI/Global.css';

import AttributionIcon from '@mui/icons-material/Attribution';
import MapActions from 'state/actions/map';

export const AccuracyToggle = () => {
  const dispatch = useDispatch();
  const accuracyToggle = useSelector((state) => state.Map.accuracyToggle);

  const [show, setShow] = React.useState(false);
  const divRef = useRef<HTMLDivElement | null>(null);

  return (
    <div ref={divRef} className={accuracyToggle ? 'map-btn-selected' : 'map-btn'}>
      <Tooltip
        open={show}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        classes={{ tooltip: 'toolTip' }}
        title={accuracyToggle ? 'Hide Accuracy' : 'Show Accuracy'}
        placement="top-end"
      >
        <span>
          <IconButton
            className={'button'}
            onClick={() => {
              dispatch(MapActions.accuracyToggle());
            }}
          >
            <AttributionIcon />
          </IconButton>
        </span>
      </Tooltip>
    </div>
  );
};

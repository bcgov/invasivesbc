import { useRef, useState } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import FiberNewIcon from '@mui/icons-material/FiberNew';
import 'UI/Global.css';
import UserSettings from 'state/actions/userSettings/UserSettings';
import { useDispatch } from 'utils/use_selector';

export const NewRecord = () => {
  const dispatch = useDispatch();
  const divRef = useRef();

  const [show, setShow] = useState(false);

  return (
    <div ref={divRef} className="map-btn">
      <Tooltip
        open={show}
        classes={{ tooltip: 'toolTip' }}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        title={`New Record`}
        placement="top-end"
      >
        <span>
          <IconButton
            className={'button'}
            onClick={() => {
              dispatch(UserSettings.openNewRecordDialogue());
            }}
          >
            <FiberNewIcon />
          </IconButton>
        </span>
      </Tooltip>
    </div>
  );
};

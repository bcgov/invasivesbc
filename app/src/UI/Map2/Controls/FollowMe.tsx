import { Explore, ExploreOff } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import { useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import 'UI/Global.css';
import { useSelector } from 'utils/use_selector';

const FollowMe = () => {
  const { panned } = useSelector((state) => state.Map);
  const [show, setShow] = useState(false);
  const divRef = useRef();
  const dispatch = useDispatch();

  const handleClick = () => {
    setShow(false);
    dispatch({ type: '' });
  };

  return (
    <div ref={divRef} className={panned ? 'map-btn-selected' : 'map-btn'}>
      <Tooltip
        open={show}
        classes={{ tooltip: 'toolTip' }}
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        title="Map follows users location"
        placement="top-end"
      >
        <span>
          <IconButton className="button" onClick={handleClick}>
            {panned ? <Explore /> : <ExploreOff />}
          </IconButton>
        </span>
      </Tooltip>
    </div>
  );
};

export default FollowMe;

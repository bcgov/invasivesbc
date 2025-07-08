import { IconButton, Tooltip } from '@mui/material';
import 'UI/Global.css';
import InfoIcon from '@mui/icons-material/Info';
import { useHistory } from 'react-router-dom';
import { useState } from 'react';

export const LegendsButton = () => {
  const history = useHistory();

  const [show, setShow] = useState(false);

  const toggleLegend = () => history.push('/Legend');

  return (
    <div className={'map-btn'}>
      <Tooltip
        open={show}
        classes={{ tooltip: 'toolTip' }}
        onMouseEnter={() => {
          setShow(true);
          setTimeout(() => setShow(false), 3000);
        }}
        onMouseLeave={() => setShow(false)}
        title="Map Legend"
        placement="top-end"
      >
        <span>
          <IconButton
            className={'button'}
            onClick={() => {
              toggleLegend();
            }}
          >
            <InfoIcon />
          </IconButton>
        </span>
      </Tooltip>
    </div>
  );
};

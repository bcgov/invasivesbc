import { IconButton, Tooltip } from '@mui/material';
import 'UI/Global.css';
import InfoIcon from '@mui/icons-material/Info';
import { useState } from 'react';
import { useNavigate } from 'react-router';

export const LegendsButton = () => {
  const navigate = useNavigate();

  const [show, setShow] = useState(false);

  const toggleLegend = () => navigate('/Legend');

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

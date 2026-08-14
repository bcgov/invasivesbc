import { IconButton } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { useNavigate } from 'react-router';
import HoverTooltip from 'UI/Reusable/HoverTooltip/HoverTooltip';

export const LegendsButton = () => {
  const navigate = useNavigate();
  return (
    <div className={'map-btn'}>
      <HoverTooltip tooltipText="Map Legend">
        <IconButton className={'button'} onClick={() => navigate('/Legend')}>
          <InfoIcon />
        </IconButton>
      </HoverTooltip>
    </div>
  );
};

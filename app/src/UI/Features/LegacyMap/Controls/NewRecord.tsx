import { IconButton } from '@mui/material';
import FiberNewIcon from '@mui/icons-material/FiberNew';
import UserSettings from 'state/actions/userSettings/UserSettings';
import { useDispatch } from 'utils/use_selector';
import HoverTooltip from 'UI/Reusable/HoverTooltip/HoverTooltip';

export const NewRecord = () => {
  const dispatch = useDispatch();

  return (
    <div className="map-btn">
      <HoverTooltip tooltipText="New Record">
        <IconButton className={'button'} onClick={() => dispatch(UserSettings.openNewRecordDialogue())}>
          <FiberNewIcon />
        </IconButton>
      </HoverTooltip>
    </div>
  );
};

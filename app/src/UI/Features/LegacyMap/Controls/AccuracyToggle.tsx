import { IconButton } from '@mui/material';
import AttributionIcon from '@mui/icons-material/Attribution';
import { useDispatch, useSelector } from 'utils/use_selector';
import MapActions from 'state/actions/map';
import HoverTooltip from 'UI/Reusable/HoverTooltip/HoverTooltip';

export const AccuracyToggle = () => {
  const dispatch = useDispatch();
  const accuracyToggle = useSelector((state) => state.Map.accuracyToggle);
  return (
    <div className={accuracyToggle ? 'map-btn-selected' : 'map-btn'}>
      <HoverTooltip tooltipText={accuracyToggle ? 'Hide Accuracy' : 'Show Accuracy'}>
        <IconButton className={'button'} onClick={() => dispatch(MapActions.accuracyToggle())}>
          <AttributionIcon />
        </IconButton>
      </HoverTooltip>
    </div>
  );
};

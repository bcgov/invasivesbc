import { IconButton } from '@mui/material';
import MapActions from 'state/actions/map';
import { RecordSetType } from 'interfaces/UserRecordSet';
import { useDispatch, useSelector } from 'utils/use_selector';
import HoverTooltip from 'UI/Reusable/HoverTooltip/HoverTooltip';
import InvBcLogo from 'UI/Reusable/InvBcLogo/InvBcLogo';
import IappLogo from 'UI/Reusable/IappLogo';

type PropTypes = {
  type: RecordSetType;
};
export const CenterCurrentRecord = ({ type }: PropTypes) => {
  const disableButton = useSelector((state) => {
    if (type === RecordSetType.Activity) {
      return !state.ActivityPage?.formState?.shape;
    }
    return !state.IAPPSitePage?.site;
  });

  const CONFIG = {
    [RecordSetType.Activity]: {
      icon: <InvBcLogo />,
      center: MapActions.panToActivity(),
      tooltip: 'Move to Current Activity'
    },
    [RecordSetType.IAPP]: {
      icon: <IappLogo />,
      center: MapActions.panToIAPP(),
      tooltip: 'Move to Current IAPP Record'
    }
  };
  const { icon, center, tooltip } = CONFIG[type];
  const dispatch = useDispatch();

  return (
    <div className={'map-btn'}>
      <HoverTooltip tooltipText={tooltip}>
        <IconButton className={'button'} disabled={disableButton} onClick={() => dispatch(center)}>
          {icon}
        </IconButton>
      </HoverTooltip>
    </div>
  );
};

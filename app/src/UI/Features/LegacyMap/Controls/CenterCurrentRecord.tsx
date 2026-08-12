import { IconButton } from '@mui/material';
import 'UI/Global.css';
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
  const currentIapp = useSelector((state) => !!state.IAPPSitePage?.site);
  const currentActivity = useSelector((state) => !!state.ActivityPage.formState?.shape);

  const CONFIG = {
    [RecordSetType.Activity]: {
      icon: <InvBcLogo />,
      center: MapActions.panToActivity(),
      tooltip: 'Move to Current Activity',
      disabled: !currentActivity
    },
    [RecordSetType.IAPP]: {
      icon: <IappLogo />,
      center: MapActions.panToIAPP(),
      tooltip: 'Move to Current IAPP Record',
      disabled: !currentIapp
    }
  };
  const { icon, center, tooltip, disabled } = CONFIG[type];
  const dispatch = useDispatch();

  return (
    <div className={'map-btn'}>
      <HoverTooltip tooltipText={tooltip}>
        <IconButton className={'button'} disabled={disabled} onClick={() => dispatch(center)}>
          {icon}
        </IconButton>
      </HoverTooltip>
    </div>
  );
};

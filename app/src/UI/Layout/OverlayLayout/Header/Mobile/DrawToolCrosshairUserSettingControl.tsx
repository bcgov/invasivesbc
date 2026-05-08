import { AddCircleOutline } from '@mui/icons-material';
import { Switch } from '@mui/material';
import UserSettings from 'state/actions/userSettings/UserSettings';
import { useDispatch, useSelector } from 'utils/use_selector';

/**
 * Menu control to allow a user to disable/enable the virtual cursor for Drawtools on a mobile device based on preference.
 */
const DrawToolCrosshairUserSettingControl = () => {
  const dispatch = useDispatch();
  const drawToolCrosshairEnabled = useSelector((state) => state.UserSettings.drawToolCrosshairEnabled) ?? false;
  const handleClick = () => dispatch(UserSettings.toggleDrawtoolCrosshair());

  return (
    <form>
      <AddCircleOutline />
      <label htmlFor="draw-tool-crosshair-user-setting-control">Draw Tool Crosshair</label>
      <Switch
        id="draw-tool-crosshair-user-setting-control"
        checked={drawToolCrosshairEnabled}
        color="primary"
        size="medium"
        onClick={handleClick}
      />
    </form>
  );
};

export default DrawToolCrosshairUserSettingControl;

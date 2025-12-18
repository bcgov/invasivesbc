import { AddCircleOutline } from '@mui/icons-material';
import { Switch } from '@mui/material';
import UserSettings from 'state/actions/userSettings/UserSettings';
import { useDispatch, useSelector } from 'utils/use_selector';

/**
 * Menu control to allow a user to disable/enable the virtual cursor for Drawtools on a mobile device based on preference.
 */
const DrawtoolCrosshairUserSettingControl = () => {
  const dispatch = useDispatch();
  const drawtoolCrosshairEnabled = useSelector((state) => state.UserSettings.drawtoolCrosshairEnabled) ?? false;
  const handleClick = () => dispatch(UserSettings.toggleDrawtoolCrosshair());

  return (
    <form>
      <AddCircleOutline />
      <label htmlFor="drawtool-crosshair-user-setting-control">Drawtool Crosshair</label>
      <Switch
        id="drawtool-crosshair-user-setting-control"
        checked={drawtoolCrosshairEnabled}
        color="primary"
        size="medium"
        onClick={handleClick}
      />
    </form>
  );
};

export default DrawtoolCrosshairUserSettingControl;

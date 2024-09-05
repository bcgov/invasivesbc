import { Refresh } from '@mui/icons-material';
import { ListItemIcon, MenuItem } from '@mui/material';
import longPressEvent from 'utils/longPressEvent';

const RefreshButton = () => {
  const handleRefresh = () => location.reload();
  const { handlers } = longPressEvent(handleRefresh);
  return (
    <MenuItem {...handlers}>
      <ListItemIcon>
        <Refresh />
      </ListItemIcon>
      Hold to Refresh Page
    </MenuItem>
  );
};

export default RefreshButton;

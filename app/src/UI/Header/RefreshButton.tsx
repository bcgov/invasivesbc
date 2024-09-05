import { Refresh } from '@mui/icons-material';
import { ListItemIcon, MenuItem } from '@mui/material';
import useLongPress from 'utils/useLongPress';
const RefreshButton = () => {
  const handleRefresh = () => location.reload();
  const { handlers } = useLongPress(handleRefresh);
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

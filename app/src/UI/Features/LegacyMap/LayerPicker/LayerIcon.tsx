import { Visibility, VisibilityOff } from '@mui/icons-material';
import { SvgIconProps } from '@mui/material';

interface PropTypes extends SvgIconProps {
  active: boolean;
}
const LayerIcon = ({ active, ...props }: PropTypes) =>
  active ? <Visibility color="primary" {...props} /> : <VisibilityOff color="action" {...props} />;

export default LayerIcon;

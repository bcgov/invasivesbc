import { Assignment, ManageSearch, Map, WaterDrop } from '@mui/icons-material';
import { SvgIconProps } from '@mui/material';

const IappRecordsetIcon = (props: SvgIconProps) => <ManageSearch {...props} />;
const InvasivesRecordsetIcon = (props: SvgIconProps) => <Assignment {...props} />;
const OfflineMapIcon = (props: SvgIconProps) => <Map {...props} />;
const WellIcon = (props: SvgIconProps) => <WaterDrop {...props} />;

export { IappRecordsetIcon, InvasivesRecordsetIcon, OfflineMapIcon, WellIcon };

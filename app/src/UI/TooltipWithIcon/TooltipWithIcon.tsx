import { HelpOutline } from '@mui/icons-material';
import { Tooltip } from '@mui/material';
import { useState } from 'react';

type PropTypes = {
  tooltipText: string;
};
const TooltipWithIcon = ({ tooltipText }: PropTypes) => {
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  return (
    <Tooltip
      open={showTooltip}
      classes={{ tooltip: 'toolTip' }}
      onMouseEnter={setShowTooltip.bind(this, true)}
      onMouseLeave={setShowTooltip.bind(this, false)}
      onFocus={setShowTooltip.bind(this, true)}
      onBlur={setShowTooltip.bind(this, false)}
      title={tooltipText}
    >
      <HelpOutline color="info" />
    </Tooltip>
  );
};

export default TooltipWithIcon;

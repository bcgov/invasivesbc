import { HelpOutline } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
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
      <IconButton sx={{ padding: 0, margin: 0, pointerEvents: 'auto' }}>
        <HelpOutline color="info" />
      </IconButton>
    </Tooltip>
  );
};

export default TooltipWithIcon;

import { HelpOutline } from '@mui/icons-material';
import { IconButton, SvgIconProps, Tooltip } from '@mui/material';
import { ReactElement, ReactNode, useState } from 'react';
import './tooltipWithIcon.css';

type PropTypes = {
  tooltipText: string | ReactNode;
  icon?: ReactElement<SvgIconProps>;
};

const TooltipWithIcon = ({ tooltipText, icon }: PropTypes) => {
  const [showTooltip, setShowTooltip] = useState<boolean>(false);
  return (
    <Tooltip
      open={showTooltip}
      tabIndex={-1}
      classes={{ tooltip: 'tool-tip' }}
      onMouseEnter={setShowTooltip.bind(this, true)}
      onMouseLeave={setShowTooltip.bind(this, false)}
      onFocus={setShowTooltip.bind(this, true)}
      onBlur={setShowTooltip.bind(this, false)}
      title={tooltipText}
    >
      <IconButton tabIndex={-1} sx={{ padding: 0, margin: 0, pointerEvents: 'auto' }}>
        {icon ? icon : <HelpOutline color="info" />}
      </IconButton>
    </Tooltip>
  );
};

export default TooltipWithIcon;

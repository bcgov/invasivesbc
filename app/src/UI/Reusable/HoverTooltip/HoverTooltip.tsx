import { Tooltip } from '@mui/material';
import { PropsWithChildren, ReactNode, useState } from 'react';

interface PropTypes extends PropsWithChildren {
  tooltipText: string | ReactNode;
}

const HoverTooltip = ({ tooltipText, children }: PropTypes) => {
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
      placement={'top-end'}
    >
      <span>{children}</span>
    </Tooltip>
  );
};

export default HoverTooltip;

import { Tooltip } from '@mui/material';
import { PropsWithChildren, ReactNode } from 'react';
import './hoverTooltip.css';

interface PropTypes extends PropsWithChildren {
  tooltipText: string | ReactNode;
}

const HoverTooltip = ({ tooltipText, children }: PropTypes) => {
  return (
    <Tooltip classes={{ tooltip: 'tool-tip' }} title={tooltipText} placement={'top-end'}>
      <span>{children}</span>
    </Tooltip>
  );
};

export default HoverTooltip;

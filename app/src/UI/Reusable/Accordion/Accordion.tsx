import { ReactElement, ReactNode, useState } from 'react';
import 'UI/Reusable/Accordion/Accordion.css';
import { SvgIconProps } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';

/**
 * @desc Common Accordion Component
 * @property {ReactElement} icon MUI font icon
 * @external {@link https://mui.com/material-ui/icons/#icon-font-icons}
 * @property {ReactNode} children Accordion Contents
 * @property {string} title Title text for Accordion
 */
interface PropTypes {
  title: string;
  children: ReactNode;
  icon?: ReactElement<SvgIconProps>;
  initState?: boolean;
}

const Accordion = ({ title, children, icon, initState = false }: PropTypes) => {
  const [open, setOpen] = useState<boolean>(initState);

  return (
    <>
      <button className={`accordion-control ${open && 'active'}`} onClick={() => setOpen((prev) => !prev)}>
        {icon !== undefined && <span>{icon}</span>}
        {title}
        {open ? <ExpandLess color="disabled" /> : <ExpandMore color="disabled" />}
      </button>

      {open && <div className="accordion-panel">{children}</div>}
    </>
  );
};
export default Accordion;

import { ReactNode, useState } from 'react';
import './Accordion.css';
import { Icon } from '@mui/material';
import { ExpandLess, ExpandMore } from '@mui/icons-material';

type PropTypes = {
  title: string;
  children: ReactNode;
  icon?: string;
};
const Accordion = ({ title, children, icon }: PropTypes) => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <>
      <button className={`accordion-control ${open && 'active'}`} onClick={() => setOpen((prev) => !prev)}>
        {icon && <Icon>{icon}</Icon>}
        {title}
        {open ? <ExpandLess color="disabled" /> : <ExpandMore color="disabled" />}
      </button>

      {open && <div className="accordion-panel">{children}</div>}
    </>
  );
};
export default Accordion;

import { Dispatch, SetStateAction, useState } from 'react';
import { getInputWidth, Width } from '../../common/utils';
import { nanoid } from '@reduxjs/toolkit';
import TooltipWithIcon from 'UI/Reusable/TooltipWithIcon/TooltipWithIcon';
import './checkboxUI.css';

type PropTypes = {
  label: string;
  state: boolean;
  tooltip?: string;
  onChange: Dispatch<SetStateAction<boolean>>;
  width: Width;
};

const CheckboxUI = ({ label, onChange, state, tooltip, width }: PropTypes) => {
  const handleClick = () => onChange((prev: boolean) => !prev);

  const [id] = useState(nanoid());

  return (
    <div className={`form-ui-checkbox ${getInputWidth(width)}`}>
      <input id={id} onChange={handleClick} type="checkbox" checked={state} />
      <div className="label-section">
        <label htmlFor={id}>{label}</label>
        {tooltip && <TooltipWithIcon tooltipText={tooltip} />}
      </div>
    </div>
  );
};

export default CheckboxUI;

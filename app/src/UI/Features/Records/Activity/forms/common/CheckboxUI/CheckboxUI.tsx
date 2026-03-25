import { Dispatch, SetStateAction, useState } from 'react';
import { getInputWidth, Width } from 'UI/Features/Records/Activity/forms/common/utils';
import { nanoid } from '@reduxjs/toolkit';
import TooltipWithIcon from 'UI/Reusable/TooltipWithIcon/TooltipWithIcon';
import OptionalField from 'UI/Features/Records/Activity/forms/common/OptionalField/OptionalField';
import './checkboxUI.css';

type PropTypes = {
  label: string;
  disabled?: boolean;
  state: boolean;
  tooltip?: string;
  warningConfirmation?: boolean;
  required?: boolean;
  onChange: Dispatch<SetStateAction<boolean>>;
  width?: Width;
};

const CheckboxUI = ({
  label,
  onChange,
  warningConfirmation = false,
  required = false,
  state,
  disabled = false,
  tooltip,
  width
}: PropTypes) => {
  const handleClick = () => onChange((prev: boolean) => !prev);
  const [id] = useState(nanoid());

  return (
    <div className={`form-ui-checkbox ${getInputWidth(width)} ${warningConfirmation && 'warning'}`}>
      <input id={id} onChange={handleClick} type="checkbox" disabled={disabled} checked={state} />
      <div className="label-section">
        <label htmlFor={id}>
          {label}
          {!required && <OptionalField />}
        </label>
        {tooltip && <TooltipWithIcon tooltipText={tooltip} />}
      </div>
    </div>
  );
};

export default CheckboxUI;

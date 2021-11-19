import { Autocomplete, TextField } from '@mui/material';
import React, { useEffect, useState } from 'react';

export interface ICustomAutoComplete {
  label: string;
  id: string;
  className: string;
  classes: any;
  choices: any[];
  parentName?: string;
  fieldName: string;
  parentState: {
    state: any;
    setState: React.Dispatch<React.SetStateAction<any>>;
  };
  onChange: (event, value) => void;
}

const CustomAutoComplete = ({
  classes,
  className,
  id,
  label,
  onChange,
  parentState,
  choices,
  parentName,
  fieldName
}) => {
  let optionValueLabels = {};
  const [labelValuePair, setLabelValuePair] = useState({});

  useEffect(() => {
    if (parentName) {
      if (choices.length > 0 && parentState[parentName][fieldName]) {
        Object.values(choices as any[]).forEach((option) => {
          optionValueLabels[option.value] = option.label || option.title || option.value;
        });
        setLabelValuePair({
          value: parentState[parentName][fieldName] || null,
          label: optionValueLabels[parentState[parentName][fieldName]] || null
        });
      }
    } else {
      if (choices.length > 0 && parentState[fieldName]) {
        Object.values(choices as any[]).forEach((option) => {
          optionValueLabels[option.value] = option.label || option.title || option.value;
        });
        setLabelValuePair({
          value: parentState[fieldName] || null,
          label: optionValueLabels[parentState[fieldName]] || null
        });
      }
    }
  }, [choices, onChange]);

  return (
    <Autocomplete
      disablePortal
      className={classes[className]}
      id={id}
      options={choices}
      value={labelValuePair}
      getOptionLabel={(option) => ((option as any).label ? (option as any).label : '')}
      onChange={(event, value) => {
        onChange(event, value);
      }}
      renderInput={(params) => <TextField {...params} label={label} />}
    />
  );
};

export default CustomAutoComplete;

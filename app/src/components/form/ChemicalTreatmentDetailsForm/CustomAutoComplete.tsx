import { Autocomplete, TextField } from '@mui/material';
import React, { useEffect, useState } from 'react';

export interface ICustomAutoComplete {
  label: string;
  id: string;
  className: string;
  classes: any;
  choices: any[];
  actualValue: string;
  parentState: {
    state: any;
    setState: React.Dispatch<React.SetStateAction<any>>;
  };
  onChange: (event, value) => void;
}

const CustomAutoComplete = ({ classes, className, id, label, onChange, actualValue, parentState, choices }) => {
  let optionValueLabels = {};
  const [labelValuePair, setLabelValuePair] = useState(null);

  Object.values(choices as any[]).forEach((option) => {
    optionValueLabels[option.value] = option.label || option.title || option.value;
  });

  useEffect(() => {
    if (actualValue && optionValueLabels[actualValue]) {
      setLabelValuePair({
        value: actualValue,
        label: optionValueLabels[actualValue]
      });
    } else if (actualValue && !optionValueLabels[actualValue]) {
      setLabelValuePair({
        value: null,
        label: null
      });
      onChange(null, { value: null });
    } else {
      setLabelValuePair({
        value: null,
        label: null
      });
    }
  }, [choices, onChange]);

  return (
    <Autocomplete
      disablePortal
      className={classes[className]}
      id={id}
      options={choices}
      value={labelValuePair}
      isOptionEqualToValue={(option, value) => {
        if (id === 'herbicide-type') {
          // console.log(option);
          // console.log(value);
        }
        return (option as any).value === (value as any).value;
      }}
      getOptionLabel={(option) => ((option as any).label ? (option as any).label : '')}
      onChange={(event, value) => {
        onChange(event, value);
      }}
      renderInput={(params) => <TextField key={id} {...params} label={label} />}
    />
  );
};

export default CustomAutoComplete;

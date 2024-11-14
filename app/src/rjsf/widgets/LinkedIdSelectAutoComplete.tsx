import { TextField, MenuItem } from '@mui/material';
import { SelectAutoCompleteContext } from 'UI/Overlay/Records/Activity/form/SelectAutoCompleteContext';
import { ChangeEvent, useContext, useEffect, useState } from 'react';
import { WidgetProps } from '@rjsf/utils';
import { useSelector } from 'utils/use_selector';
import { nanoid } from '@reduxjs/toolkit';

const LinkedIdSelectAutoComplete = (props: WidgetProps) => {
  const selectAutoCompleteContext = useContext(SelectAutoCompleteContext);
  if (!selectAutoCompleteContext) {
    throw new Error('Context not provided to AgentSelectAutoComplete.tsx');
  }
  /**
   * @desc Change Handler for Select Menu, fires RJSF onChangeEvent and updates local state
   */
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
    props.onChange(event.target.value);
  };

  const { setLastFieldChanged } = selectAutoCompleteContext;
  const { suggestedTreatmentIDs } = useSelector((state) => state.ActivityPage);
  const [value, setValue] = useState(props.value ?? null);
  const [renderKey] = useState(props.id + nanoid());

  useEffect(() => {
    setLastFieldChanged({ id: props.id, option: value });
  }, [value]);

  return (
    <TextField
      select
      required={props.required}
      key={renderKey}
      onFocus={(event) => props.onFocus(event.target.id, event.target.nodeValue)}
      id={props.id}
      disabled={props.disabled}
      label={props.label}
      value={value ?? ''}
      onChange={handleChange}
      onLoad={() => {
        props.onChange(value);
      }}
      SelectProps={{
        MenuProps: {
          sx: { height: '300px' }
        }
      }}
    >
      {suggestedTreatmentIDs.map((entry) => (
        <MenuItem key={entry.value} value={entry.value}>
          {entry.label}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default LinkedIdSelectAutoComplete;

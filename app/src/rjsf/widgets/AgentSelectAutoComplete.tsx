import { TextField, MenuItem } from '@mui/material';
import { SelectAutoCompleteContext } from 'UI/Overlay/Records/Activity/form/SelectAutoCompleteContext';
import { ChangeEvent, useContext, useEffect, useState } from 'react';
import { WidgetProps } from '@rjsf/utils';
import { useSelector } from 'utils/use_selector';
import { nanoid } from '@reduxjs/toolkit';

type SelectOption = {
  value: string;
  label: string;
  'x-code_sort_order': number;
};
const AgentSelectAutoComplete = (props: WidgetProps) => {
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
  /**
   * @desc Filters the Options available based on the most recent plant value in the form compared to the plantToAgent entries in the database.
   * @returns {SelectOption[]} Filtered records for
   */
  const filterOptionsBasedOnPlants = (): SelectOption[] => {
    const agentSelectOptions = props.schema.options ?? [];
    const newPlantValue = lastFieldChanged?.option;
    const treatmentsBasedOnPlant: string[] = [];
    plantToAgentMap.forEach((item: Record<string, any>) => {
      if (item.plant_code_name === newPlantValue) {
        treatmentsBasedOnPlant.push(item.agent_code_name);
      }
    });
    return agentSelectOptions.filter((item: SelectOption) => treatmentsBasedOnPlant.includes(item.value));
  };

  const { setLastFieldChanged, lastFieldChanged } = selectAutoCompleteContext;
  const { plantToAgentMap } = useSelector((state) => state.ActivityPage.biocontrol);

  const [filteredOptions, setFilteredOptions] = useState<any[]>(props.schema.options ?? []);
  const [value, setValue] = useState(props.value ?? null);
  const [renderKey] = useState(props.id + nanoid());

  /**
   * @desc    Checks if the ID is the adjacent plant code to an agent field, then updates the dropdown filters if they match.
   * @example Codes that would identify a matching pair of values, linking the plant entry to the bio agent field
   *          the ID's denote the hierarchy, and the numbers in the Id denote the array position.
   *          root_activity_subtype_data_Biocontrol_Collection_Information_0_invasive_plant_code - PlantCode in index[0]
   *          root_activity_subtype_data_Biocontrol_Collection_Information_1_biological_agent_code - AgentCode in index[1] (No match)
   */
  useEffect(() => {
    const agentString = 'biological_agent_code';
    const plantRegex = /invasive_plant_code$/;
    const plantValueIsSameEntryAsAgent =
      lastFieldChanged?.id && new RegExp(lastFieldChanged.id.replace(plantRegex, agentString)).test(props.id);

    if (lastFieldChanged.id === props.id || !plantValueIsSameEntryAsAgent) {
      return;
    }
    const filteredValues: SelectOption[] = filterOptionsBasedOnPlants();
    if (!filteredValues.some((item: SelectOption) => item.value === value)) {
      setValue(null);
    }
    setFilteredOptions(filteredValues);
  }, [lastFieldChanged.id]);

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
    >
      {filteredOptions.map((entry) => (
        <MenuItem key={entry.value} value={entry.value}>
          {entry.label}
        </MenuItem>
      ))}
    </TextField>
  );
};

export default AgentSelectAutoComplete;

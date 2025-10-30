import { WidgetProps } from '@rjsf/utils';
import { Autocomplete, Checkbox, TextField } from '@mui/material';
import { useEffect, useState } from 'react';

const MultiSelectAutoComplete = (props: WidgetProps) => {
  /**
   * On a value selected or un-selected, call the parents onChange event to inform the form of the new value of the
   * widget.
   * @param {string[]} value
   */
  const handleOnChange = (value: string[]): void => {
    const newValue: string[] = [];
    value.forEach((value) => {
      newValue.push(value);
    });
    if (newValue.length < 1) {
      props.onChange(undefined);
    } else {
      props.onChange(newValue.join(','));
    }
  };

  const [options, setOptions] = useState<string[]>([]);
  useEffect(() => {
    setOptions(props.options?.enumOptions?.map((opt) => opt.value) ?? []);
  }, [props.options]);

  return (
    <>
      <Autocomplete
        id={`${props.id}`}
        onChange={(_event, value) => {
          handleOnChange(value);
        }}
        disabled={props.disabled}
        value={props.value?.split(',') ?? []}
        renderInput={(params) => <TextField {...params} label={props.label} />}
        renderOption={(props, opt) => {
          const { key, ...optionProps } = props;
          return (
            <li {...optionProps} key={key}>
              <Checkbox checked={!!optionProps['aria-selected']} />
              {opt}
            </li>
          );
        }}
        options={options}
        multiple
      ></Autocomplete>
    </>
  );
};

export default MultiSelectAutoComplete;

import { WidgetProps } from '@rjsf/core';
import chroma from 'chroma-js';
import { ThemeContext } from 'contexts/themeContext';
import React, { useContext, useState } from 'react';
import { MultipleSelect } from 'react-select-material-ui';

const MultiSelectAutoComplete = (props: WidgetProps) => {
  // @ts-ignore
  const enumOptions = props.schema.options as any[];
  const [focused, setFocused] = useState(false);
  const [hasValues, setHasValues] = useState(false);
  const themeContext = useContext(ThemeContext);
  const { themeType } = themeContext;

  /**
   * On a value selected or un-selected, call the parents onChange event to inform the form of the new value of the
   * widget.
   *
   * @param {React.ChangeEvent<{}>} event
   * @param {AutoCompleteMultiSelectOption[]} value
   */
  const handleOnChange = (value: any[]): void => {
    const newValue: any[] = [];
    value.forEach((value) => {
      newValue.push(value);
    });
    if (newValue.length < 1) {
      setHasValues(false);
      props.onChange(undefined);
    } else {
      setHasValues(true);
      props.onChange(newValue.toString());
    }
  };

  let optionArr: any[] = [];

  if (enumOptions) {
    enumOptions.forEach(({ value, label }) => {
      optionArr.push({ label: label, value: value, color: themeType ? '#FFF' : '#000' });
    });
  }

  const colourStyles = {
    container: (styles) => ({
      ...styles,
      borderStyle: 'solid',
      borderWidth: !hasValues && focused ? '2px' : '1px',
      boxSizing: 'border-box',
      borderRadius: '4px',
      zIndex: '1000',
      borderColor: props.rawErrors?.length > 0 ? 'red' : '#C4C4C4',
      marginTop: '0px',
      ':hover': {
        ...styles[':hover'],
        boxShadow: 'none'
      },
      ':active': {
        ...styles[':active'],
        boxShadow: props.rawErrors?.length > 0 ? '0px 0px 3px #ff000' : '0px 0px 3px #C4C4C4'
      }
    }),
    indicatorSeparator: (styles) => ({
      ...styles,
      display: 'none'
    }),
    control: (styles) => ({
      ...styles,
      border: 'none',
      boxShadow: 'none',
      outline: 'none',
      justifyContent: 'center'
    }),
    valueContainer: (styles) => ({
      ...styles,
      padding: '12px 4px',
      zIndex: '1000',
      fontSize: '1.2rem',
      lineHeight: '1.2rem'
    }),
    option: (styles, { data, isDisabled, isFocused, isSelected }) => {
      const color = chroma(data.color);
      return {
        ...styles,
        backgroundColor: themeType ? '#424242' : '#FFF',
        color: isDisabled ? '#ccc' : isSelected && data.color,
        cursor: isDisabled ? 'not-allowed' : 'default',
        ':active': {
          ...styles[':active'],
          backgroundColor: !isDisabled ? (isSelected ? data.color : color.alpha(0.3).css()) : undefined
        }
      };
    },
    multiValue: (styles, { data }) => {
      return {
        ...styles,
        backgroundColor: themeType ? '#424242' : '#FFF'
      };
    },
    multiValueLabel: (styles, { data }) => ({
      ...styles,
      color: themeType ? '#FFF' : '#000'
    }),
    multiValueRemove: (styles, { data }) => {
      return {
        ...styles,
        color: themeType ? '#FFF' : '#000',
        ':hover': {
          backgroundColor: themeType ? '#FFF' : '#223f75',
          color: themeType ? '#424242' : '#FFF'
        }
      };
    }
  };

  return (
    <div id="custom-multi-select">
      <MultipleSelect
        id="custom-multi-select-field"
        SelectProps={{ styles: colourStyles }}
        InputLabelProps={{
          style: {
            transform: focused === true ? 'translate(12px, -5px) scale(0.7)' : 'translate(12px, 20px) scale(1)',
            backgroundColor: themeType ? '#424242' : 'white',
            paddingInline: focused === true ? '5px' : '0px',
            zIndex: focused === true ? 1111111 : 0,
            position: 'absolute'
          }
        }}
        onChange={handleOnChange}
        values={props.value ? props.value?.split(',') : undefined}
        label={props.label}
        onFocus={() => {
          setFocused(true);
        }}
        onBlur={() => {
          if (hasValues === false) {
            setFocused(false);
          }
        }}
        options={optionArr}
      />
    </div>
  );
};

export default MultiSelectAutoComplete;

import { useState } from 'react';
import { MultipleSelect, SelectOption } from 'react-select-material-ui';
import { WidgetProps } from '@rjsf/utils';

const MultiSelectAutoComplete = (props: WidgetProps) => {
  enum Color {
    DarkGray = '#575757',
    MediumGray = '#DDD',
    SilverGray = '#C4C4C4',
    LightGray = '#EEEEEE50',
    Black = '#000',
    White = '#FFF',
    Yellow = '#FFF000'
  }
  /**
   * On a value selected or un-selected, call the parents onChange event to inform the form of the new value of the
   * widget.
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

  const enumOptions: SelectOption[] = props.schema.options ?? props.options.enumOptions ?? [];
  const hasErrors = props.rawErrors && props.rawErrors?.length > 0;
  const [focused, setFocused] = useState<boolean>(props.value ?? false);
  const [hasValues, setHasValues] = useState<boolean>(props.value ?? false);

  const colourStyles = {
    container: (styles) => {
      return {
        ...styles,
        borderStyle: 'solid',
        borderWidth: focused && !props.disabled ? '2px' : '1px',
        boxSizing: 'border-box',
        padding: '0 5pt',
        borderRadius: '4px',
        borderColor: (() => {
          if (hasErrors) {
            return 'var(--error-red)';
          } else if (props.disabled) {
            return Color.MediumGray;
          }
          return Color.SilverGray;
        })(),
        marginTop: '0px',
        ':active': {
          ...styles[':active'],
          boxShadow: `0px 0px 3px ${hasErrors ? Color.Yellow : Color.SilverGray}`
        }
      };
    },
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
    menu: (styles) => ({
      ...styles,
      textAlign: 'left',
      zIndex: 2
    }),
    valueContainer: (styles) => ({
      ...styles,
      padding: '12px 4px',
      fontSize: '1.2rem',
      lineHeight: '1.2rem'
    }),
    option: (styles, { isDisabled, isSelected }) => ({
      ...styles,
      backgroundColor: Color.White,
      ':hover': {
        backgroundColor: Color.MediumGray
      },
      color: isDisabled ? Color.SilverGray : Color.Black,
      cursor: isDisabled ? 'not-allowed' : 'default',
      ':active': {
        ...styles[':active'],
        backgroundColor: isSelected ? Color.White : Color.Black
      }
    }),
    multiValue: (styles, { isDisabled }) => ({
      ...styles,
      border: `1pt solid ${Color.SilverGray}`,
      color: isDisabled ? Color.MediumGray : Color.Black,
      borderRadius: '5pt',
      backgroundColor: Color.White
    }),
    multiValueLabel: (styles, { isDisabled }) => ({
      ...styles,
      color: isDisabled ? Color.SilverGray : Color.Black
    }),
    multiValueRemove: (styles) => ({
      ...styles,
      transition: '0.5s background-color',
      ':hover': {
        backgroundColor: 'var(--bc-blue)',
        color: 'var(--bc-yellow)',
        cursor: 'pointer'
      }
    })
  };

  return (
    <MultipleSelect
      id="custom-multi-select-field"
      SelectProps={{ styles: colourStyles }}
      InputLabelProps={{
        style: {
          transform: focused ? 'translate(12px, -5px) scale(0.7)' : 'translate(12px, 20px) scale(1)',
          backgroundColor: Color.White,
          paddingInline: focused ? '5px' : '0',
          zIndex: focused ? 1 : 0,
          position: 'absolute'
        }
      }}
      onChange={handleOnChange}
      values={props?.value?.split(',') ?? []}
      error={hasErrors && props.rawErrors?.[0] !== 'should be equal to one of the allowed values'}
      disabled={props.disabled}
      label={props.label}
      onFocus={setFocused.bind(this, true)}
      onBlur={() => {
        if (!hasValues) {
          setFocused(false);
        }
      }}
      options={enumOptions}
    />
  );
};

export default MultiSelectAutoComplete;

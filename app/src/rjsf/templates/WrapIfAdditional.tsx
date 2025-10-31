import { FormControl, Grid, Input, InputLabel } from '@mui/material';
import React from 'react';
import IconButton from 'rjsf/components/IconButton';
import { ADDITIONAL_PROPERTY_FLAG } from '@rjsf/utils';

type WrapIfAdditionalProps = {
  children: React.ReactElement;
  classNames: string;
  disabled: boolean;
  id: string;
  label: string;
  onDropPropertyClick: (index: string) => (event?) => void;
  onKeyChange: (index: string) => (event?) => void;
  readonly: boolean;
  required: boolean;
  schema;
};

const WrapIfAdditional = (props: WrapIfAdditionalProps) => {
  const keyLabel = `${props.label} Key`; // i18n ?
  const additional = Object.prototype.hasOwnProperty.call(props.schema, ADDITIONAL_PROPERTY_FLAG);
  const btnStyle = {
    flex: 1,
    paddingLeft: 6,
    paddingRight: 6,
    fontWeight: 'bold'
  };

  if (!additional) {
    return <>{props.children}</>;
  }

  const handleBlur = ({ target }: React.FocusEvent<HTMLInputElement>) => props.onKeyChange(target.value);
  return (
    <Grid container={true} key={`${props.id}-key`} alignItems="center" spacing={2}>
      <Grid>
        <FormControl fullWidth={true} required={props.required}>
          {keyLabel !== 'invisible' && <InputLabel>{keyLabel}</InputLabel>}
          <Input
            defaultValue={props.label}
            disabled={props.disabled || props.readonly}
            id={`${props.id}-key`}
            name={`${props.id}-key`}
            onBlur={!props.readonly ? handleBlur : undefined}
            type="text"
          />
        </FormControl>
      </Grid>
      <Grid>{props.children}</Grid>
      <Grid>
        <IconButton
          icon="remove"
          tabIndex={-1}
          style={btnStyle}
          disabled={props.disabled || props.readonly}
          onClick={props.onDropPropertyClick(props.label)}
        />
      </Grid>
    </Grid>
  );
};

export default WrapIfAdditional;

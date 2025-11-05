import React from 'react';
import AddButton from 'rjsf/components/AddButton';
import { Box, Grid } from '@mui/material';
import {
  ArrayFieldTemplateProps,
  DescriptionFieldProps,
  getTemplate,
  isMultiSelect,
  Registry,
  RJSFSchema,
  TitleFieldProps
} from '@rjsf/utils';
import { getDefaultRegistry } from '@rjsf/core';

const ArrayFieldTemplate = (props: ArrayFieldTemplateProps) => {
  const { schema, registry = getDefaultRegistry() } = props;

  // TODO: update types so we don't have to cast registry as any
  if (isMultiSelect(null, schema, registry.rootSchema)) {
    return <DefaultFixedArrayFieldTemplate {...props} />;
  } else {
    return <DefaultNormalArrayFieldTemplate {...props} />;
  }
};

type ArrayFieldTitleProps = {
  TitleField: React.ComponentType<TitleFieldProps<unknown, RJSFSchema, any>>;
  title: string;
  id: string;
  required: boolean;
  schema: RJSFSchema;
  registry: Registry;
};

const ArrayFieldTitle = ({ TitleField, id, title, required, schema, registry }: ArrayFieldTitleProps) => {
  if (!title) {
    return null;
  }

  return <TitleField id={`${id}__title`} title={title} required={required} schema={schema} registry={registry} />;
};

type ArrayFieldDescriptionProps = {
  DescriptionField: React.ComponentType<DescriptionFieldProps<unknown, RJSFSchema, any>>;
  id: string;
  description: string;
  schema: RJSFSchema;
  registry: Registry;
};

const ArrayFieldDescription = ({ DescriptionField, id, description, registry, schema }: ArrayFieldDescriptionProps) => {
  if (!description) {
    return null;
  }

  return <DescriptionField id={`${id}__description`} description={description} schema={schema} registry={registry} />;
};

const DefaultFixedArrayFieldTemplate = (props: ArrayFieldTemplateProps) => {
  const TitleField = getTemplate('TitleFieldTemplate', props.registry, props.uiSchema);

  if (props.uiSchema == null) {
    throw new Error('uiSchema is required for a FixedArrayFieldTemplate');
  }

  return (
    <fieldset className={props.className}>
      <ArrayFieldTitle
        schema={props.schema}
        registry={props.registry}
        key={`array-field-title-${props.uiSchema.$id}`}
        TitleField={TitleField}
        id={props.uiSchema.$id}
        title={props.uiSchema['ui:title'] || props.title}
        required={!!props.required}
      />

      {(props.uiSchema['ui:description'] || props.schema.description) && (
        <div className="field-description" key={`field-description-${props.uiSchema.$id}`}>
          {props.uiSchema['ui:description'] || props.schema.description}
        </div>
      )}

      <div className="row array-item-list" key={`array-item-list-${props.uiSchema.$id}`}>
        {props.items}
      </div>

      {props.canAdd && (
        <AddButton className="array-item-add" onClick={props.onAddClick} disabled={props.disabled || props.readonly} />
      )}
    </fieldset>
  );
};

const DefaultNormalArrayFieldTemplate = (props: ArrayFieldTemplateProps) => {
  const TitleField = getTemplate('TitleFieldTemplate', props.registry, props.uiSchema);
  const DescriptionField = getTemplate('DescriptionFieldTemplate', props.registry, props.uiSchema);

  if (props.uiSchema == null) {
    throw new Error('uiSchema is required for a NormalArrayFieldTemplate');
  }

  return (
    <Grid container direction={'column'} size={{ xs: 12 }}>
      <Grid size={{ xs: 12 }}>
        <ArrayFieldTitle
          key={`array-field-title-${props.uiSchema.$id}`}
          TitleField={TitleField}
          id={props.uiSchema.$id}
          title={props.uiSchema['ui:title'] || props.title}
          required={!!props.required}
          schema={props.schema}
          registry={props.registry}
        />
      </Grid>
      <Grid size={{ xs: 12 }}>
        {(props.uiSchema['ui:description'] || props.schema.description) && (
          <ArrayFieldDescription
            key={`array-field-description-${props.uiSchema.$id}`}
            DescriptionField={DescriptionField}
            id={props.uiSchema.$id}
            description={props.uiSchema['ui:description'] || (props.schema.description ?? '')}
            schema={props.schema}
            registry={props.registry}
          />
        )}
      </Grid>

      <Grid direction="column" spacing={2} container>
        {props.items}
        {props.canAdd && (
          <Grid container justifyContent="flex-end">
            <Grid sx={{ marginTop: 2 }}>
              <Box>
                <AddButton
                  className="array-item-add"
                  onClick={props.onAddClick}
                  disabled={props.disabled || props.readonly}
                />
              </Box>
            </Grid>
          </Grid>
        )}
      </Grid>
    </Grid>
  );
};

export default ArrayFieldTemplate;

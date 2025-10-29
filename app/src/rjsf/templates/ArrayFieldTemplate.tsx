import React from 'react';
import AddButton from 'rjsf/components/AddButton';
import IconButton from 'rjsf/components/IconButton';
import { Box, Grid, Paper } from '@mui/material';
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

// Used in the two templates
const DefaultArrayItem = (props) => {
  const btnStyle = {
    flex: 1,
    paddingLeft: 6,
    paddingRight: 6,
    fontWeight: 'bold'
  };

  return (
    <Grid container key={props.key} alignItems="center">
      <Grid size={{ xs: 12 }}>
        <Box>
          <Paper elevation={1}>
            <Box p={2}>{props.children}</Box>
          </Paper>
        </Box>
      </Grid>

      {props.hasToolbar && (
        <Grid>
          {(props.hasMoveUp || props.hasMoveDown) && (
            <IconButton
              icon="arrow-up"
              className="array-item-move-up"
              tabIndex={-1}
              style={btnStyle}
              disabled={props.disabled || props.readonly || !props.hasMoveUp}
              onClick={props.onReorderClick(props.index, props.index - 1)}
            />
          )}

          {(props.hasMoveUp || props.hasMoveDown) && (
            <IconButton
              icon="arrow-down"
              tabIndex={-1}
              style={btnStyle}
              disabled={props.disabled || props.readonly || !props.hasMoveDown}
              onClick={props.onReorderClick(props.index, props.index + 1)}
            />
          )}

          {props.hasRemove && (
            <IconButton
              icon="remove"
              tabIndex={-1}
              style={btnStyle}
              disabled={props.disabled || props.readonly}
              onClick={props.onDropIndexClick(props.index)}
            />
          )}
        </Grid>
      )}
    </Grid>
  );
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
        {props.items && props.items.map(DefaultArrayItem)}
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
    <Box>
      <ArrayFieldTitle
        key={`array-field-title-${props.uiSchema.$id}`}
        TitleField={TitleField}
        id={props.uiSchema.$id}
        title={props.uiSchema['ui:title'] || props.title}
        required={!!props.required}
        schema={props.schema}
        registry={props.registry}
      />

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

      <Grid direction="column" container key={`array-item-list-${props.uiSchema.$id}`}>
        {props.items && props.items.map((p) => DefaultArrayItem(p))}

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
    </Box>
  );
};

export default ArrayFieldTemplate;

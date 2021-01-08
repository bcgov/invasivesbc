import { Grid, Tooltip } from '@material-ui/core';
import HelpOutlineIcon from '@material-ui/icons/HelpOutline';
import { makeStyles } from '@material-ui/styles';
import { ObjectFieldTemplateProps, utils } from '@rjsf/core';
import React from 'react';
import AddButton from 'rjsf/components/AddButton';

const { canExpand } = utils;

const useStyles = makeStyles({
  root: {
    marginTop: 10
  }
});

const ObjectFieldTemplate = (props: ObjectFieldTemplateProps) => {
  const classes = useStyles();

  const DescriptionField = props.DescriptionField;
  const TitleField = props.TitleField;
  const invalidTooltipElements = ['activity_data', 'activity_type_data', 'activity_subtype_data'];

  return (
    <>
      {(props.uiSchema['ui:title'] || props.title) && (
        <TitleField id={`${props.idSchema.$id}-title`} title={props.title} required={props.required} />
      )}
      {props.description && (
        <DescriptionField id={`${props.idSchema.$id}-description`} description={props.description} />
      )}
      <Grid container={true} spacing={2} className={classes.root}>
        {props.properties.map((element: any, index: number) => (
          <Grid
            item={true}
            xs={props.uiSchema['ui:column-xs'] || 12}
            sm={props.uiSchema['ui:column-sm'] || props.uiSchema['ui:column-xs'] || 12}
            md={
              props.uiSchema['ui:column-md'] || props.uiSchema['ui:column-sm'] || props.uiSchema['ui:column-xs'] || 12
            }
            lg={
              props.uiSchema['ui:column-lg'] ||
              props.uiSchema['ui:column-md'] ||
              props.uiSchema['ui:column-sm'] ||
              props.uiSchema['ui:column-xs'] ||
              12
            }
            xl={
              props.uiSchema['ui:column-xl'] ||
              props.uiSchema['ui:column-lg'] ||
              props.uiSchema['ui:column-md'] ||
              props.uiSchema['ui:column-sm'] ||
              props.uiSchema['ui:column-xs'] ||
              12
            }
            key={index}
            style={{ marginBottom: '10px' }}>
            <>
              {!invalidTooltipElements.includes(element.name) && (
                <Tooltip title={element.content.props.schema.tooltipText || "Tooltip text TBD"} placement="left">
                  <HelpOutlineIcon style={{ float: 'right', marginBottom: 5 }}/>
                </Tooltip>
              )}
              {element.content}
            </>
          </Grid>
        ))}
        {canExpand(props.schema, props.uiSchema, props.formData) && (
          <Grid container justify="flex-end">
            <Grid item={true}>
              <AddButton
                className="object-property-expand"
                onClick={props.onAddClick(props.schema)}
                disabled={props.disabled || props.readonly}
              />
            </Grid>
          </Grid>
        )}
      </Grid>
    </>
  );
};

export default ObjectFieldTemplate;

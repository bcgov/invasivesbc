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

  console.log(props);

  return (
    <>
      {props.uiSchema['ui:title'] || (props.title && props.title !== 'invisible') ? (
        <TitleField id={`${props.idSchema.$id}-title`} title={props.title} required={props.required} />
      ) : (
        props.title === 'invisible' && <></>
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
              {element.content.props && element.content.props.schema && (
                <Tooltip
                  enterTouchDelay={0}
                  title={
                    element.content.props.schema['x-tooltip-text']
                      ? element.content.props.schema['x-tooltip-text']
                      : 'There was no help text provided for this field'
                  }
                  placement="left">
                  <HelpOutlineIcon style={{ float: 'right', marginBottom: 5, color: 'rgb(170, 170, 170)' }} />
                </Tooltip>
              )}
              {element.content}
            </>
          </Grid>
        ))}
        {canExpand(props.schema, props.uiSchema, props.formData) && (
          <Grid container justifyContent="flex-end">
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

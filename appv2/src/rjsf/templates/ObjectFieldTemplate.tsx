import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
//import makeStyles from '@mui/styles/makeStyles';
import React from 'react';
import AddButton from 'rjsf/components/AddButton';
import { Grid, Tooltip } from '@mui/material';
import { canExpand, getTemplate, ObjectFieldTemplateProps } from '@rjsf/utils';
import 'UI/Global.css';

/*const useStyles = makeStyles({
  root: {
    marginTop: 10
  }
});
*/

const ObjectFieldTemplate = (props: ObjectFieldTemplateProps) => {
  //const classes = useStyles();

  const DescriptionField = getTemplate('DescriptionFieldTemplate', props.registry, props.uiSchema);
  const TitleField = getTemplate('TitleFieldTemplate', props.registry, props.uiSchema);

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
      <Grid container={true} spacing={2} >
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
              {element.content.props.schema['x-tooltip-text'] && (
                <Tooltip
                  classes={{ tooltip: 'toolTip' }}
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

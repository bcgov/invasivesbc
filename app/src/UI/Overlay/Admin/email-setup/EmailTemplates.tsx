import { Card, CardContent, Grid } from '@mui/material';
import { Form } from '@rjsf/mui';
import { RJSFSchema, UiSchema } from '@rjsf/utils';
import validator from '@rjsf/validator-ajv8';
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { EMAIL_TEMPLATES_RETRIEVE_REQUEST, EMAIL_TEMPLATES_SET_ACTIVE, EMAIL_TEMPLATES_UPDATE } from 'state/actions';
import { selectEmailTemplates } from 'state/reducers/emailTemplates';

export const templateNames = ['Approved', 'Declined'];

const jsonSchemaEmailTemplates: RJSFSchema = {
  title: 'Email Template',
  type: 'object',
  properties: {
    templatename: {
      type: 'string',
      title: 'Template Name',
      enum: templateNames,
      default: templateNames[0]
    },
    fromemail: {
      title: 'From email',
      type: 'string'
    },
    emailsubject: {
      title: 'Email subject',
      type: 'string'
    },
    emailbody: {
      title: 'Email body',
      type: 'string'
    }
  }
};

const uiSchemaEmailTemplates: UiSchema = {
  templatename: {
    'ui:widget': 'select'
  },
  fromemail: {
    'ui:widget': 'text'
  },
  emailsubject: {
    'ui:widget': 'text'
  },
  emailbody: {
    'ui:widget': 'textarea'
  }
};

const EmailTemplates = (props) => {
  const emailTemplatesState = useSelector(selectEmailTemplates);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(EMAIL_TEMPLATES_RETRIEVE_REQUEST());
  }, []);

  const onSubmitEmailTemplates = ({ formData }) => {
    dispatch(EMAIL_TEMPLATES_UPDATE(formData));
  };

  const onFormChange = (event) => {
    if (emailTemplatesState.activetemplate != event.formData.templatename)
      dispatch(
        EMAIL_TEMPLATES_SET_ACTIVE({
          ...emailTemplatesState,
          activetemplate: event.formData.templatename
        })
      );
  };
  const getActiveTemplate = () => {
    if (emailTemplatesState.emailTemplates)
      return emailTemplatesState.emailTemplates.find(
        (template) => template.templatename === emailTemplatesState.activetemplate
      );
  };

  return (
    <Grid item xs={6}>
      <Card elevation={8}>
        <CardContent>
          <Form
            schema={jsonSchemaEmailTemplates}
            validator={validator}
            uiSchema={uiSchemaEmailTemplates}
            onSubmit={onSubmitEmailTemplates}
            formData={getActiveTemplate()}
            onChange={onFormChange}
          />
          {emailTemplatesState.message}
        </CardContent>
      </Card>
    </Grid>
  );
};

export default EmailTemplates;

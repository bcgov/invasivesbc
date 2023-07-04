import { RJSFSchema, UiSchema } from '@rjsf/utils';
import validator from '@rjsf/validator-ajv6';
import React, { useEffect } from 'react';
import { Form } from '@rjsf/mui';
import {
  Card,
  CardContent,
  Grid,
} from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import { EMAIL_TEMPLATES_RETRIEVE_REQUEST, EMAIL_TEMPLATES_UPDATE } from 'state/actions';
import { selectEmailTemplates } from 'state/reducers/emailTemplates';

const jsonSchemaEmailTemplates: RJSFSchema = {
  title: 'Email Template',
  type: 'object',
  properties: {
    fromEmail: {
      title: 'From email',
      type: 'string',
    },
    emailSubject: {
      title: 'Email subject',
      type: 'string',
    },
    emailBody: {
      title: 'Email body',
      type: 'string',
    },
  }
}

const uiSchemaEmailTemplates: UiSchema = {
  fromEmail: {
    'ui:widget': 'text'
  },
  emailSubject: {
    'ui:widget': 'text'
  },
  emailBody: {
    'ui:widget': 'textarea'
  },
}

const EmailTemplates = (props) => {

  const emailTemplatesState = useSelector(selectEmailTemplates);
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch({
      type: EMAIL_TEMPLATES_RETRIEVE_REQUEST,
    });
  }, [])

  const onSubmitEmailTemplates = ({ formData }) => {
    dispatch({
      type: EMAIL_TEMPLATES_UPDATE,
      payload: formData
    });
  }

  return (
    <Grid item xs={6}>
      <Card elevation={8}>
        <CardContent>
          <Form schema={jsonSchemaEmailTemplates}
            validator={validator}
            uiSchema={uiSchemaEmailTemplates}
            onSubmit={onSubmitEmailTemplates}
            formData={emailTemplatesState?.emailTemplates}
          />
          {emailTemplatesState.message}
        </CardContent>
      </Card>
    </Grid>
  );
};

export default EmailTemplates;

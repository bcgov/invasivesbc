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
import { EMAIL_SETTINGS_RETRIEVE_REQUEST, EMAIL_SETTINGS_UPDATE, } from 'state/actions';
import { selectEmailSettings } from 'state/reducers/emailSettings';

const jsonSchemaEmailSettings: RJSFSchema = {
  title: 'Email Settings',
  type: 'object',
  required: [
    'enabled',
    'authenticationURL',
    'emailServiceURL',
    'clientId',
    'clientSecret',
  ],
  properties: {
    enabled: {
      'title': 'Enabled',
      'type': 'boolean',
    },
    authenticationURL: {
      title: 'Authentication URL',
      type: 'string',
    },
    emailServiceURL: {
      title: 'Email service URL',
      type: 'string',
    },
    clientId: {
      title: 'Client id',
      type: 'string',
    },
    clientSecret: {
      title: 'Client secret',
      type: 'string',
    },
  }
}

const uiSchemaEmailSettings: UiSchema = {
  enabled: {
    'ui:widget': 'checkbox'
  },
  Authentication: {
    'ui:widget': 'text'
  },
  emailServiceURL: {
    'ui:widget': 'text'
  },
  clientId: {
    'ui:widget': 'text'
  },
  clientSecret: {
    'ui:widget': 'password'
  },
}

const EmailSettings = (props) => {

  const emailSettingsState = useSelector(selectEmailSettings);
  const dispatch = useDispatch()
  useEffect(() => {
    dispatch({
      type: EMAIL_SETTINGS_RETRIEVE_REQUEST
    });
  }, [])

  const onSubmitEmailSettings = ({ formData }) => {
    console.log('Update Called ****')
    dispatch({
      type: EMAIL_SETTINGS_UPDATE,
      payload: formData
    });
  }

  return (
    <Grid item xs={6} >
      <Card elevation={6}>
        <CardContent>
          <Form schema={jsonSchemaEmailSettings}
            validator={validator}
            uiSchema={uiSchemaEmailSettings}
            onSubmit={onSubmitEmailSettings}
            formData={emailSettingsState?.emailSettings}
          />
          {emailSettingsState.message}
        </CardContent>
      </Card>
    </Grid >
  );
};

export default EmailSettings;


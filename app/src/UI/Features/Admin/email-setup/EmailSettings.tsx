import { RJSFSchema, UiSchema } from '@rjsf/utils';
import validator from '@rjsf/validator-ajv8';
import { useEffect } from 'react';
import { Form } from '@rjsf/mui';
import { useDispatch, useSelector } from 'react-redux';
import { selectEmailSettings } from 'state/reducers/emailSettings';
import { EmailActions } from 'state/actions/email/emailActions';

const jsonSchemaEmailSettings: RJSFSchema = {
  type: 'object',
  required: ['enabled', 'authenticationURL', 'emailServiceURL', 'clientId', 'clientSecret'],
  properties: {
    enabled: {
      title: 'Enabled',
      type: 'boolean'
    },
    authenticationURL: {
      title: 'Authentication URL',
      type: 'string'
    },
    emailServiceURL: {
      title: 'Email service URL',
      type: 'string'
    },
    clientId: {
      title: 'Client id',
      type: 'string'
    },
    clientSecret: {
      title: 'Client secret',
      type: 'string'
    }
  }
};

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
  }
};

const EmailSettings = () => {
  const emailSettingsState = useSelector(selectEmailSettings);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(EmailActions.retrieveReq());
  }, []);

  const onSubmitEmailSettings = ({ formData }) => {
    dispatch(EmailActions.updateSettingsReq(formData));
  };

  return (
    <>
      <h2>Email Settings</h2>

      <Form
        schema={jsonSchemaEmailSettings}
        validator={validator}
        uiSchema={uiSchemaEmailSettings}
        onSubmit={onSubmitEmailSettings}
        formData={emailSettingsState?.emailSettings}
      />
      {emailSettingsState.message}
    </>
  );
};

export default EmailSettings;

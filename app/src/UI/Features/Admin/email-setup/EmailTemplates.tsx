import { Form } from '@rjsf/mui';
import { RJSFSchema, UiSchema } from '@rjsf/utils';
import validator from '@rjsf/validator-ajv8';
import { useEffect } from 'react';
import { EmailActions } from 'state/actions/email/emailActions';
import { selectEmailTemplates } from 'state/reducers/emailTemplates';
import { useDispatch, useSelector } from 'utils/use_selector';

export const templateNames = ['Approved', 'Declined'];

const jsonSchemaEmailTemplates: RJSFSchema = {
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

const EmailTemplates = () => {
  const emailTemplatesState = useSelector(selectEmailTemplates);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(EmailActions.retrieveTemplate());
  }, []);

  const onSubmitEmailTemplates = ({ formData }) => {
    dispatch(EmailActions.updateTemplate(formData));
  };

  const onFormChange = (event) => {
    if (emailTemplatesState.activetemplate != event.formData.templatename) {
      dispatch(EmailActions.setTemplate(event.formData.templatename));
    }
  };
  const getActiveTemplate = () => {
    if (emailTemplatesState.emailTemplates)
      return emailTemplatesState.emailTemplates.find(
        (template) => template.templatename === emailTemplatesState.activetemplate
      );
  };

  return (
    <>
      <h2>Email Message Templates</h2>
      <Form
        schema={jsonSchemaEmailTemplates}
        validator={validator}
        uiSchema={uiSchemaEmailTemplates}
        onSubmit={onSubmitEmailTemplates}
        formData={getActiveTemplate()}
        onChange={onFormChange}
      />
      {emailTemplatesState.message}
    </>
  );
};

export default EmailTemplates;

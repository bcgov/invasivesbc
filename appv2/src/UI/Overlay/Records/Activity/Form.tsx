import React from 'react';
import FormContainer from './form/FormContainer';

export const ActivityForm = (props) => {

  return (
    <FormContainer
     // isAlreadySubmitted={function (): boolean {
     //   return activityState.activity.form_status === 'Submitted'
     // }}
    /*  canBeSubmittedWithoutErrors={function (): boolean {
        return false;
      }}
      */
      //onFormChange={debouncedFormChange}
     // customValidation={validatorForActivity(activityState.activity, null)} //linked activity
    />
  );
};
import React, { useCallback, useEffect, useState } from 'react';
import FormContainer from './form/FormContainer';
import { useDispatch, useSelector } from 'react-redux';
import { selectActivity } from 'state/reducers/activity';
import _ from 'lodash';
import { ACTIVITY_ON_FORM_CHANGE_REQUEST } from 'state/actions';
import { validatorForActivity } from 'rjsf/business-rules/customValidation';

export const ActivityForm = (props) => {
  const activityState = useSelector(selectActivity);
  const dispatch = useDispatch();

  const debouncedFormChange = 
    _.debounce((event, ref, lastField, callbackFun) => {
      dispatch({
        type: ACTIVITY_ON_FORM_CHANGE_REQUEST,
        payload: { eventFormData: event.formData, lastField: lastField, unsavedDelay: null}
      });
    }, 150)

  return (
    <FormContainer
      activity={activityState.activity}
      isAlreadySubmitted={function (): boolean {
        return activityState.activity.form_status === 'Submitted'
      }}
      canBeSubmittedWithoutErrors={function (): boolean {
        return false;
      }}
      onFormChange={debouncedFormChange}
      customValidation={validatorForActivity(activityState.activity, null)} //linked activity
    />
  );
};
import React, { useCallback, useEffect, useState } from 'react';
import FormContainer from './form/FormContainer';
import { useDispatch, useSelector } from 'react-redux';
import { selectActivity } from 'state/reducers/activity';
import _ from 'lodash';
import { ACTIVITY_ON_FORM_CHANGE_REQUEST } from 'state/actions';

export const ActivityForm = (props) => {
  const activityState = useSelector(selectActivity);
  const [unsavedDelay, setUnsavedDelay] = useState(false);
  const dispatch = useDispatch();
  useEffect(() => {
    setTimeout(() => {
      setUnsavedDelay(true);
    }, 5000);
  }, []);

  const debouncedFormChange = useCallback(
    _.debounce((event, ref, lastField, callbackFun) => {
      dispatch({
        type: ACTIVITY_ON_FORM_CHANGE_REQUEST,
        payload: { eventFormData: event.formData, lastField: lastField, unsavedDelay: unsavedDelay }
      });
    }, 150),
    []
  );

  return (
    <FormContainer
      activity={activityState.activity}
      isAlreadySubmitted={function (): boolean {
        return false;
      }}
      canBeSubmittedWithoutErrors={function (): boolean {
        return false;
      }}
      onFormChange={debouncedFormChange}
    />
  );
};

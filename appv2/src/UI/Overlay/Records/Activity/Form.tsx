import React, { useRef } from 'react';
import FormContainer from './form/FormContainer';

export const ActivityForm = (props) => {
  const ref = useRef(0);
  ref.current += 1;
  console.log('%Activity Form render:' + ref.current.toString(), 'color: yellow');

  return <FormContainer />;
};

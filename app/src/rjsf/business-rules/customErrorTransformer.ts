//import { AjvError } from '@rjsf/core';

/**
 * Returns a custom error transformer.
 */
export const getCustomErrorTransformer = () => {
  const errorMessages = [
    'should be equal to one of the allowed values',
    'should match "then" schema',
    'should match exactly one schema in oneOf',
    'should match some schema in anyOf',
    'must match exactly one schema in oneOf',
    'must be equal to one of the allowed values'
  ];
  return (errors: any[]) =>
    errors.filter((error) => {
      if (error.message.includes('must have required property')) {
        error.message = 'is a required field';
        return error;
      }
      if (errorMessages.includes(error.message)) {
        return false;
      }
      if (error.message === 'should match pattern "[A-Za-z -]+"') {
        error.message = 'Only letters are allowed';
        return error;
      }
      return true;
    });
};

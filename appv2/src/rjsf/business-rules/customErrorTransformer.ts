import { AjvError } from '@rjsf/core';

/**
 * Returns a custom error transformer.
 *
 * @return {*}
 */
export const getCustomErrorTransformer = () => {
  return (errors: AjvError[]) => {
    return errors.filter((error) => {
      if (error.message === 'should be equal to one of the allowed values') {
        return false;
      }

      if (error.message === 'should match "then" schema') {
        return false;
      }

      if (error.message === 'should match exactly one schema in oneOf') {
        return false;
      }

      if (error.message === 'should match some schema in anyOf') {
        return false;
      }

      if (error.message === 'should match pattern "[A-Za-z -]+"') {
        error.message = 'Only letters are allowed';
        return error;
      }

      return true;
    });
  };
};
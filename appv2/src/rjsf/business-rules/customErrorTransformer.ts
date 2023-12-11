//import { AjvError } from '@rjsf/core';
import { ACTIVITY_ERRORS } from 'state/actions';
import { globalStore } from 'state/store';

/**
 * Returns a custom error transformer.
 *
 * @return {*}
 */
export const getCustomErrorTransformer = () => {
  return (errors: any[]) => {
  //dispatch({ type: ACTIVITY_ERRORS, payload: { source: 'custom error transformer', errors } })
    console.dir(errors)
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

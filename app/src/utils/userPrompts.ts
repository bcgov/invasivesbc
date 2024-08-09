/**
 * @desc Helper functions for Prompt system, used to ensure prop correctness when creating a prompts
 */

import { PromptTypes } from 'constants/promptEnums';
import {
  ConfirmationModalInterface,
  DateModalInterface,
  NumberModalInterface,
  TextModalInterface
} from 'interfaces/prompt-interfaces';
import { UnknownAction } from 'redux';
import { CLEAR_PROMPT, NEW_PROMPT } from 'state/actions';

/**
 * @desc DRY handler for closing input modal
 * @param id ID for the Payload object in the prompts array
 * @returns {ReduxPayload} Payload needed to delete the modal
 */
export const closeModal = (id: string): UnknownAction => ({
  type: CLEAR_PROMPT,
  payload: { id }
});

/**
 * @desc Helper function for creating modals to gather a 'boolean' input
 * @param {ConfirmationModalInterface} prompt component props
 */
export const promptConfirmationInput = (prompt: ConfirmationModalInterface) => {
  prompt.type = PromptTypes.Confirmation;
  return {
    type: NEW_PROMPT,
    payload: prompt
  };
};
/**
 * @desc Helper function for creating modals to gather a 'Date' input
 * @param {DateModalInterface} prompt component props
 */
export const promptDateInput = (prompt: DateModalInterface) => {
  prompt.type = PromptTypes.Date;
  return {
    type: NEW_PROMPT,
    payload: prompt
  };
};
/**
 * @desc Helper function for creating modals to gather a 'Number' input
 * @param {NumberModalInterface} prompt component props
 */
export const promptNumberInput = (prompt: NumberModalInterface) => {
  prompt.type = PromptTypes.Number;
  return {
    type: NEW_PROMPT,
    payload: prompt
  };
};
/**
 * @desc Helper function for creating modals to gather a string input
 * @param {TextModalInterface} prompt component props
 */
export const promptTextInput = (prompt: TextModalInterface) => {
  prompt.type = PromptTypes.Text;
  return {
    type: NEW_PROMPT,
    payload: prompt
  };
};

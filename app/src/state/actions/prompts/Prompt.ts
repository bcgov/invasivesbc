/**
 * @desc Helper functions for Prompt system, used to ensure prop correctness when creating a prompts
 * @external {@link https://github.com/bcgov/invasivesbc/wiki/User-Prompt-System }
 */
import {
  ConfirmationModalInterface,
  DateModalInterface,
  ManualUtmModalInterface,
  NumberModalInterface,
  RadioModalInterface,
  TextModalInterface
} from 'interfaces/prompt-interfaces';
import { createAction } from '@reduxjs/toolkit';
import { PromptTypes } from 'constants/promptEnums';
import { CLEAR_PROMPT, NEW_PROMPT } from 'state/actions';

class Prompt {
  /**
   * @desc Action type for creating new prompts.
   */
  static readonly NEW_PROMPT = NEW_PROMPT;
  /**
   * @desc Helper function for creating modals to gather a 'boolean' input
   * @param {ConfirmationModalInterface} prompt component props
   */
  static readonly confirmation = createAction(this.NEW_PROMPT, (prompt: ConfirmationModalInterface) => ({
    payload: { ...prompt, type: PromptTypes.Confirmation }
  }));

  /**
   * @desc Helper function for creating modals to gather a 'Date' input
   * @param {DateModalInterface} prompt component props
   */
  static readonly date = createAction(this.NEW_PROMPT, (prompt: DateModalInterface) => ({
    payload: { ...prompt, type: PromptTypes.Date }
  }));

  /**
   * @desc Helper function for creating modals to gather a 'Number' input
   * @param {NumberModalInterface} prompt component props
   */
  static readonly number = createAction(this.NEW_PROMPT, (prompt: NumberModalInterface) => ({
    payload: { ...prompt, type: PromptTypes.Number }
  }));

  /**
   * @desc Helper function for creating modals to present options to a user
   * @param {RadioModalInterface} prompt component props
   */
  static readonly radio = createAction(this.NEW_PROMPT, (prompt: RadioModalInterface) => ({
    payload: { ...prompt, type: PromptTypes.Radio }
  }));

  /**
   * @desc Helper function for creating modals to gather a string input
   * @param {TextModalInterface} prompt component props
   */
  static readonly text = createAction(this.NEW_PROMPT, (prompt: TextModalInterface) => ({
    payload: { ...prompt, type: PromptTypes.Text }
  }));

  /**
   * @desc Helper function for creating modals to gather manual UTM inputs
   * @param {ManualUtmModalInterface} prompt component props
   */
  static readonly utm = createAction(this.NEW_PROMPT, (prompt: ManualUtmModalInterface) => ({
    payload: { ...prompt, type: PromptTypes.ManualUtm }
  }));

  /**
   * @desc DRY handler for closing input modal
   * @param id ID for the Payload object in the prompts array
   * @returns {ReduxPayload} Payload needed to delete the modal
   */
  static readonly closeOne = createAction(CLEAR_PROMPT, (id: string) => ({ payload: { id } }));
}

export default Prompt;

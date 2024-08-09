/**
 * @desc Interfaces for Prompt System, contains all props for inputs.
 */
import { PromptTypes } from 'constants/promptEnums';

export interface ReduxPayload {
  type: string;
  payload?: Record<string, any>;
}
/**
 * @interface BasePromptInterface Confirmation Modal Prompts
 * @property {function} callback Function to trigger on user confirmation
 * @property {string} cancelText Text override for 'Cancel' button text
 * @property {function} closeModal Handler for closing modal after response
 * @property {string} confirmText Text override for 'Confirm' button text
 * @property {string} id Id for a given Prompt (Used for deleting)
 * @property {boolean} open state variable for modal opening
 * @property {string[] | string} prompt Main text body, Can use array to handle multiple paragraphs
 * @property {string} title Title for modal
 */
interface BasePromptInterface {
  id?: string;
  type?: PromptTypes;
  cancelText?: string;
  confirmText?: string;
  prompt: string[] | string;
  title: string;
}

/**
 * @type {Props} Confirmation Modal Prompts
 * @property {RegExp} regex Regex pattern to validate user input against
 * @property {string} regexErrorText Override error message for regex errors, otherwise shows pattern
 * @property {string[]} selectOptions curated set of options user can select from
 * @property {string} label Override label for user input field
 * @property {number} min minimum character length for response
 * @property {number} max maximum character length for response
 */
export interface TextModalInterface extends BasePromptInterface {
  callback: (input: string) => void | ReduxPayload[];
  label?: string;
  max?: number;
  min?: number;
  regex?: RegExp;
  regexErrorText?: string;
  selectOptions?: string[];
}

/**
 * @interface NumberModalInterface
 * @extends BasePromptInterface
 * @property {number[]} selectOptions curated set of options user can select from
 * @property {string} label Override label for user input field
 * @property {number} min minimum range for response
 * @property {number} max maximum range for response
 */
export interface NumberModalInterface extends BasePromptInterface {
  selectOptions?: number[];
  callback: (input: number) => void | ReduxPayload[];
  label?: string;
  max?: number;
  min?: number;
}

/**
 * @interface DateModalInterface
 * @extends BasePromptInterface
 * @property {string} label Override label for user input field
 * @property {Date} min Earliest valid date
 * @property {Date} max Latest valid date
 */
export interface DateModalInterface extends BasePromptInterface {
  label?: string;
  callback: (input: Date) => void | ReduxPayload[];
  max?: Date;
  min?: Date;
}

/**
 * @interface ConfirmationModalInterface
 * @extends BasePromptInterface
 * @boolean Action result for user input. if an array is returned, fires all redux actions contained
 */
export interface ConfirmationModalInterface extends BasePromptInterface {
  callback: (input: boolean) => void | ReduxPayload[];
}

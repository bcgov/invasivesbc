import {
  ConfirmationModalInterface,
  DateModalInterface,
  NumberModalInterface,
  TextModalInterface
} from 'interfaces/prompt-interfaces';

export const closeModal = (id: string) => {};
export const promptConfirmationInput = (prompt: ConfirmationModalInterface) => {};
export const promptDateInput = (prompt: DateModalInterface) => {};
export const promptNumberInput = (prompt: NumberModalInterface) => {};
export const promptTextInput = (prompt: TextModalInterface) => {};

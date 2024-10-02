import { createNextState, nanoid } from '@reduxjs/toolkit';
import { AppConfig } from '../config';
import AlertMessage from 'interfaces/AlertMessage';
import Alerts from 'state/actions/alerts/Alerts';
import Prompt from 'state/actions/prompts/Prompt';
import { PromptAction } from 'interfaces/prompt-interfaces';

interface AlertsAndPromptsState {
  alerts: AlertMessage[];
  prompts: any[];
}

const initialState: AlertsAndPromptsState = {
  alerts: [],
  prompts: []
};

export function createAlertsAndPromptsReducer(
  configuration: AppConfig
): (AlertsAndPromptsState, AnyAction) => AlertsAndPromptsState {
  return (state: AlertsAndPromptsState = initialState, action) => {
    return createNextState(state, (draftState) => {
      if (Alerts.create.match(action)) {
        const newID = nanoid();
        const newAlertIsDuplicate = state.alerts.some(
          (item) => action.payload.content === item.content && action.payload.severity === item.severity
        );
        if (!newAlertIsDuplicate) {
          draftState.alerts = [...state.alerts, { ...action.payload, id: newID }];
        }
      } else if (Alerts.deleteOne.match(action)) {
        draftState.alerts = state.alerts.filter((alert) => alert.id !== action.payload.id);
      } else if (Alerts.deleteAll.match(action)) {
        draftState.alerts = [];
      } else if (Prompt.closeOne.match(action)) {
        draftState.prompts = state.prompts.filter((prompt) => prompt.id !== action.payload.id);
      } else if (Prompt.closeAll.match(action)) {
        draftState.prompts = [];
      } else if (RegExp(Prompt.NEW_PROMPT).exec(action.type)) {
        const newPrompt: PromptAction = action.payload;
        const newID = nanoid();
        draftState.prompts = [...state.prompts, { ...newPrompt, id: newID }];
      }
    });
  };
}

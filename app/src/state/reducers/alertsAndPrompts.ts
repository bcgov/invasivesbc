import { createNextState, nanoid } from '@reduxjs/toolkit';
import { AppConfig } from '../config';
import { CLEAR_ALERT, CLEAR_ALERTS, CLEAR_PROMPT, CLEAR_PROMPTS, NEW_ALERT, NEW_PROMPT } from 'state/actions';
import AlertMessage from 'interfaces/AlertMessage';

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
      switch (action.type) {
        case NEW_ALERT: {
          const newID = nanoid();
          const newAlertIsDuplicate = state.alerts.some(
            (item: AlertMessage) => action.payload.content === item.content && action.payload.severity === item.severity
          );
          if (!newAlertIsDuplicate) {
            draftState.alerts = [...state.alerts, { ...action.payload, id: newID }];
          }
          break;
        }
        case NEW_PROMPT: {
          const newID = nanoid();
          draftState.prompts = [...state.prompts, { ...action.payload, id: newID }];
          break;
        }
        case CLEAR_ALERTS: {
          draftState.alerts = [];
          break;
        }
        case CLEAR_PROMPTS: {
          draftState.prompts = [];
          break;
        }
        case CLEAR_ALERT: {
          draftState.alerts = state.alerts.filter((alert) => alert.id !== action.payload.id);
          break;
        }
        case CLEAR_PROMPT: {
          draftState.prompts = state.prompts.filter((prompt) => prompt.id !== action.payload.id);
          break;
        }
        default: {
          break;
        }
      }
    });
  };
}

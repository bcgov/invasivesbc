import { createNextState, nanoid } from '@reduxjs/toolkit';
import { AppConfig } from '../config';
import AlertMessage from 'interfaces/AlertMessage';
import Alerts from 'state/actions/alerts/Alerts';
import Prompt from 'state/actions/prompts/Prompt';
import { PromptAction } from 'interfaces/prompt-interfaces';
import RecordCache from 'state/actions/cache/RecordCache';
import cacheAlertMessages from 'constants/alerts/cacheAlerts';

interface AlertsAndPromptsState {
  alerts: AlertMessage[];
  prompts: any[];
}

const initialState: AlertsAndPromptsState = {
  alerts: [],
  prompts: []
};

const filterDuplicates = (key: keyof AlertMessage, matchValue: any, state: AlertMessage[]): any[] =>
  state.filter((entry) => entry[key] !== matchValue);

export function createAlertsAndPromptsReducer(
  configuration: AppConfig
): (AlertsAndPromptsState, AnyAction) => AlertsAndPromptsState {
  return (state: AlertsAndPromptsState = initialState, action) => {
    return createNextState(state, (draftState) => {
      if (Alerts.create.match(action)) {
        const newAlertIsDuplicate = state.alerts.some(
          (item) => action.payload.content === item.content && action.payload.severity === item.severity
        );
        if (!newAlertIsDuplicate) {
          draftState.alerts = [...state.alerts, { ...action.payload, id: nanoid() }];
        }
      } else if (Alerts.deleteOne.match(action)) {
        draftState.alerts = filterDuplicates('id', action.payload.id, state.alerts);
      } else if (Alerts.deleteAll.match(action)) {
        draftState.alerts = [];
      } else if (Prompt.closeOne.match(action)) {
        draftState.prompts = filterDuplicates('id', action.payload.id, state.prompts);
        draftState.prompts = state.prompts.filter((prompt) => prompt.id !== action.payload.id);
      } else if (Prompt.closeAll.match(action)) {
        draftState.prompts = [];
      } else if (RegExp(Prompt.NEW_PROMPT).exec(action.type)) {
        const newPrompt: PromptAction = action.payload;
        draftState.prompts = [...state.prompts, { ...newPrompt, id: nanoid() }];
      } else if (RecordCache.requestCaching.fulfilled.match(action)) {
        draftState.alerts = [...state.alerts, { ...cacheAlertMessages.recordsetCacheSuccess, id: nanoid() }];
      } else if (RecordCache.requestCaching.rejected.match(action)) {
        draftState.alerts = [...state.alerts, { ...cacheAlertMessages.recordsetCacheFailed, id: nanoid() }];
      } else if (RecordCache.deleteCache.rejected.match(action)) {
        draftState.alerts = [...state.alerts, { ...cacheAlertMessages.recordsetDeleteCacheFailed, id: nanoid() }];
      } else if (RecordCache.deleteCache.fulfilled.match(action)) {
        draftState.alerts = [...state.alerts, { ...cacheAlertMessages.recordsetDeleteCacheSuccess, id: nanoid() }];
      }
    });
  };
}

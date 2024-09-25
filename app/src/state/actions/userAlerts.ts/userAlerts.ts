import { createAction } from '@reduxjs/toolkit';
import AlertMessage from 'interfaces/AlertMessage';
import { NEW_ALERT, CLEAR_ALERT, CLEAR_ALERTS } from 'state/actions';

/**
 * @desc Action Creator for adding User Alerts
 */
export const createAlert = createAction<AlertMessage>(NEW_ALERT);

/**
 * @desc Action Creator for deleting one User Alert
 * @param {string} id Identifier of alert being deleted
 */
export const clearAlert = createAction(CLEAR_ALERT, (id: string) => ({ payload: { id } }));

/**
 * @desc Action Creator for clearing ALL user alerts
 */
export const clearAllAlerts = createAction(CLEAR_ALERTS);

import { createAction } from '@reduxjs/toolkit';
import AlertMessage from 'interfaces/AlertMessage';
import { NEW_ALERT, CLEAR_ALERT, CLEAR_ALERTS } from 'state/actions';

class Alerts {
  /**
   * @desc Action Creator for adding User Alerts
   */
  static create = createAction<AlertMessage>(NEW_ALERT);

  /**
   * @desc Action Creator for deleting one User Alert
   * @param {string} id Identifier of alert being deleted
   */
  static deleteOne = createAction(CLEAR_ALERT, (id: string) => ({ payload: { id } }));

  /**
   * @desc Action Creator for clearing ALL user alerts
   */
  static deleteAll = createAction(CLEAR_ALERTS);
}

export default Alerts;

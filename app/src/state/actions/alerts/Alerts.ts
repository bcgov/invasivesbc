import { createAction } from '@reduxjs/toolkit';
import AlertMessage from 'interfaces/AlertMessage';

class Alerts {
  private static readonly PREFIX = 'Alerts';
  /**
   * @desc Action Creator for adding User Alerts
   */
  static readonly create = createAction<AlertMessage>(`${this.PREFIX}/create`);

  /**
   * @desc Action Creator for deleting one User Alert
   * @param {string} id Identifier of alert being deleted
   */
  static readonly deleteOne = createAction(`${this.PREFIX}/deleteOne`, (id: string) => ({ payload: { id } }));

  /**
   * @desc Action Creator for clearing ALL user alerts
   */
  static readonly deleteAll = createAction(`${this.PREFIX}/deleteAll`);
}

export default Alerts;

import {
  TABS_SET_ACTIVE_TAB_SUCCESS,
  TABS_SET_USER_MENU_OPEN_SUCCESS,
  TABS_SET_SHOW_LOGGED_IN_TABS_SUCCESS
} from '../actions';

import { AppConfig } from '../config';

class TabsState {
  activeTab: number;
  userMenuOpen: boolean;
  showLoggedInTabs: boolean;

  constructor() {
    this.userMenuOpen = false;

    // this.newRecordDialogState = {
    //   recordCategory:
    //     JSON.parse(localStorage.getItem('USER_SETTINGS_SET_NEW_RECORD_DIALOG_STATE'))?.recordCategory || '',
    //   recordType: JSON.parse(localStorage.getItem('USER_SETTINGS_SET_NEW_RECORD_DIALOG_STATE'))?.recordType || '',
    //   recordSubtype: JSON.parse(localStorage.getItem('USER_SETTINGS_SET_NEW_RECORD_DIALOG_STATE'))?.recordSubtype || ''
    // };
  }
}

const initialState = new TabsState();

function createTabsReducer(configuration: AppConfig): (TabsState, AnyAction) => TabsState {
  return (state = initialState, action) => {
    console.log('ACTION RECEIVED', action);
    switch (action.type) {
      case TABS_SET_ACTIVE_TAB_SUCCESS: {
        return {
          ...state,
          activeTab: action.activeTab
        };
      }

      case TABS_SET_USER_MENU_OPEN_SUCCESS:
        return {
          ...state,
          userMenuOpen: action.userMenuOpen
        };

      case TABS_SET_SHOW_LOGGED_IN_TABS_SUCCESS: {
        return {
          ...state,
          showLoggedInTabs: action.showLoggedInTabs
        };
      }
      default:
        return state;
    }
  };
}

const selectTabs: (state) => TabsState = (state) => state.Tabs;

export { createTabsReducer, selectTabs };

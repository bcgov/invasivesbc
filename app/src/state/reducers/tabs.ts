import {
  TABS_SET_ACTIVE_TAB_SUCCESS,
  TABS_SET_USER_MENU_OPEN_SUCCESS,
  TABS_GET_INITIAL_STATE_SUCCESS
} from '../actions';

import { AppConfig } from '../config';

class TabsState {
  initialized: boolean;
  activeTab: number;
  userMenuOpen: boolean;
  showLoggedInTabs: boolean;

  constructor() {
    this.initialized = false;
    this.userMenuOpen = false;
    this.showLoggedInTabs = false;
    this.activeTab = 0;
  }
}

const initialState = new TabsState();

function createTabsReducer(configuration: AppConfig): (TabsState, AnyAction) => TabsState {
  return (state = initialState, action) => {
    switch (action.type) {
      case TABS_GET_INITIAL_STATE_SUCCESS: {
        console.log('GOT INITAL STATE FOR TABS!', action.payload);
        return {
          ...state,
          initialized: true,
          activeTab: action.payload.activeTab,
          showLoggedInTabs: action.payload.showLoggedInTabs
        };
      }
      case TABS_SET_ACTIVE_TAB_SUCCESS: {
        console.log('SET ACTIVE TAB SUCCESS!', action);
        return {
          ...state,
          activeTab: action.payload.activeTab
        };
      }

      case TABS_SET_USER_MENU_OPEN_SUCCESS:
        console.log('SET USER MENU OPEN SUCCESS!', action);
        return {
          ...state,
          userMenuOpen: action.payload.userMenuOpen
        };
      default:
        return state;
    }
  };
}

const selectTabs: (state) => TabsState = (state) => state.Tabs;

export { createTabsReducer, selectTabs };

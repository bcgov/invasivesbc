import { TABS_SET_ACTIVE_TAB_SUCCESS, TABS_GET_INITIAL_STATE_SUCCESS } from '../actions';

import { AppConfig } from '../config';

class TabsState {
  initialized: boolean;
  activeTab: number;
  showLoggedInTabs: boolean;

  constructor() {
    this.initialized = false;
    this.showLoggedInTabs = false;
    this.activeTab = 0;
  }
}

const initialState = new TabsState();

function createTabsReducer(configuration: AppConfig): (TabsState, AnyAction) => TabsState {
  return (state = initialState, action) => {
    switch (action.type) {
      case TABS_GET_INITIAL_STATE_SUCCESS: {
        return {
          ...state,
          initialized: true,
          activeTab: Number(action.payload.activeTab),
          showLoggedInTabs: action.payload.showLoggedInTabs
        };
      }
      case TABS_SET_ACTIVE_TAB_SUCCESS: {
        return {
          ...state,
          activeTab: action.payload.activeTab
        };
      }

      default:
        return state;
    }
  };
}

const selectTabs: (state) => TabsState = (state) => state.Tabs;

export { createTabsReducer, selectTabs };

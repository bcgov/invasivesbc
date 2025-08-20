import { createNextState } from '@reduxjs/toolkit';
import EventActions from 'state/actions/events/EventActions';
import { DeviceMemoryInformation } from 'utils/memory-report/memoryReport';
import { LayoutMode } from 'UI/Layout/Routes/PrimaryNavigation';
import { LayoutComponent } from 'UI/App';
import { UnifiedConfig } from 'state/configuration/unified-config';
import AppActions from 'state/actions/appActions/appActions';

enum appModeEnum {
  'Records',
  'Record',
  'Landing',
  'Reports',
  'Batch',
  'IAPP'
}

interface AppModeState {
  viewLayout: appModeEnum;
  url: string | null;
  constraints: {
    memory: DeviceMemoryInformation | null;
    screenWidth: number | undefined;
    tinyScreen: boolean;
  };
  layout: {
    layout: LayoutComponent;
    viewLayout: LayoutMode;
  };
}

function createAppModeReducer(config: UnifiedConfig) {
  const initialState: AppModeState = {
    viewLayout: appModeEnum.Landing,
    layout: {
      layout: config.features.SIMPLIFIED_LAYOUT.enabled ? 'wide-layout' : 'overlay-layout',
      viewLayout: LayoutMode.MAP_HIDDEN
    },
    url: null,
    constraints: {
      memory: null,
      screenWidth: window.innerWidth,
      tinyScreen: window.innerWidth < 400
    }
  };

  return function appMode(state = initialState, action) {
    if (EventActions.viewportResize.match(action)) {
      return {
        ...state,
        constraints: {
          ...state.constraints,
          screenWidth: action.payload.width,
          tinyScreen: action.payload.width < 500
        }
      };
    } else if (EventActions.deviceMemoryReport.fulfilled.match(action)) {
      return {
        ...state,
        constraints: {
          ...state.constraints,
          memory: action.payload
        }
      };
    } else if (EventActions.setLayoutParameters.match(action)) {
      return {
        ...state,
        layout: {
          ...state.layout,
          viewLayout: action.payload.viewLayout
        }
      };
    } else if (EventActions.setLayoutComponent.match(action)) {
      return {
        ...state,
        layout: {
          ...state.layout,
          layout: action.payload
        }
      };
    } else if (AppActions.urlChange.match(action)) {
      return createNextState(state, (draftState) => {
        draftState.url = action?.payload;
        if (
          ['Batch', 'Reports', 'Training', 'Legend', 'Landing', 'News', 'Admin', 'Guide'].includes(
            action.payload.split('/')[1]
          )
        ) {
          draftState.layout.viewLayout = LayoutMode.MAP_HIDDEN;
        } else if (['Map'].includes(action.payload.split('/')[1])) {
          draftState.layout.viewLayout = LayoutMode.MAP_EXCLUSIVE;
        } else {
          draftState.layout.viewLayout = LayoutMode.MAP_FOCUSED;
        }
      });
    }
    return state;
  };
}

export { appModeEnum, createAppModeReducer };

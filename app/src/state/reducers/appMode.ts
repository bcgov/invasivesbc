import { createNextState } from '@reduxjs/toolkit';
import { SET_APP_MODE, URL_CHANGE } from 'state/actions';
import EventActions from 'state/actions/events/EventActions';
import { DeviceMemoryInformation } from 'utils/memory-report/memoryReport';
import { LayoutMode } from 'UI/Layout/Routes/PrimaryNavigation';

enum appModeEnum {
  'Records',
  'Record',
  'Landing',
  'Reports',
  'Batch',
  'IAPP'
}

interface AppModeState {
  mode: appModeEnum;
  url: string | null;
  constraints: {
    memory: DeviceMemoryInformation | null;
    screenWidth: number | undefined;
    tinyScreen: boolean;
  };
  layout: {
    mode: LayoutMode;
  };
}

const initialState: AppModeState = {
  mode: appModeEnum.Landing,
  layout: {
    mode: LayoutMode.MAP_HIDDEN
  },
  url: null,
  constraints: {
    memory: null,
    screenWidth: window.innerWidth,
    tinyScreen: window.innerWidth < 400
  }
};

export default function appMode(state = initialState, action) {
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
        ...action.payload
      }
    };
  } else {
    switch (action.type) {
      case SET_APP_MODE:
        return {
          ...state,
          mode: action.payload.mode
        };
      case URL_CHANGE: {
        return createNextState(state, (draftState) => {
          draftState.url = action?.payload?.url;
          if (
            ['Batch', 'Reports', 'Training', 'Legend', 'Landing', 'News', 'Admin'].includes(
              action.payload.url.split('/')[1]
            )
          ) {
            draftState.layout.mode = LayoutMode.MAP_HIDDEN;
          } else {
            draftState.layout.mode = LayoutMode.MAP_FOCUSED;
          }
        });
      }
      default:
        return state;
    }
  }
}

export { appModeEnum };

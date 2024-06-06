import { Button } from '@mui/material';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Route } from 'react-router';

import debounce from 'lodash.debounce';

import { OVERLAY_MENU_TOGGLE } from 'state/actions';
import './OverlayHeader.css';

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import SaveAsIcon from '@mui/icons-material/SaveAs';

const maximize = (e) => {
  const elementWeWant = document.getElementById('overlaydiv');
  if (elementWeWant !== null) {
    elementWeWant.style.height = 'calc(100% - 10vh)';
  }
};

const minimize = (e) => {
  const elementWeWant = document.getElementById('overlaydiv');
  const buttonContainer = document.getElementById('map-btn-container');
  if (elementWeWant !== null && buttonContainer !== null) {
    elementWeWant.style.height = '0px';
    buttonContainer.style.marginBottom = 5 + 'vh';
  }
};

const setButtonContainerHeight = (height) => {
  const buttonContainer = document.getElementById('map-btn-container');
  if (!buttonContainer?.style) return;
  buttonContainer.style.marginBottom = height + 10 + 'px';
};

const setOverlayHeight = (height) => {
  const elementWeWant = document.getElementById('overlaydiv');
  if (elementWeWant !== null) {
    elementWeWant.style.height = height + 'px';
  }
};

const getAppHeight = () => {
  const appElement = document.getElementById('app');
  if (appElement !== null) {
    const currentAppStyle = window.getComputedStyle(appElement);
    return parseInt(currentAppStyle.height.split('px')[0]);
  }
  return 0;
};

const computeDesiredDragHandleHeightFromMousePosition = (mouseY) => {
  const appHeight = getAppHeight();
  return appHeight - mouseY;
};

const getOverlayHeight = () => {
  const elementWeWant = document.getElementById('overlaydiv');
  if (elementWeWant !== null) {
    const currentOverlayStyle = window.getComputedStyle(elementWeWant);
    return parseInt(currentOverlayStyle.height.split('px')[0]);
  }
  return 0;
};

const debouncedDrag = debounce((e) => {
  let newOverlayHeight;
  if (e.type.includes('touch')) {
    const pos = e.touches[0].clientY;
    newOverlayHeight = computeDesiredDragHandleHeightFromMousePosition(pos);
  } else {
    const mousePos = e.y;
    newOverlayHeight = computeDesiredDragHandleHeightFromMousePosition(mousePos);
  }
  setOverlayHeight(newOverlayHeight);
  setButtonContainerHeight(newOverlayHeight);
}, 5);

const drag = (e) => {
  debouncedDrag(e);
};

const cleanup = () => {
  try {
    document.removeEventListener('mousemove', drag, false);
    //document.removeEventListener('mouseup', cleanup, false);
    document.removeEventListener('touchmove', drag, false);
    //document.removeEventListener('touchend', cleanup, false);
  } catch (e) {
    console.error(e);
  }
};

const onClickDragButton = (e) => {
  if (e.type.includes('touch')) {
    document.addEventListener('touchmove', drag, false);
    document.addEventListener('touchend', cleanup, true);
  } else {
    console.log('** click drag mouse');
    document.addEventListener('mousemove', drag, false);
    document.addEventListener('mouseup', cleanup, true);
  }

  setTimeout(() => {
    if (e) cleanup(e);
  }, 5000);
};

export const OverlayHeader = () => {
  const dispatch = useDispatch();

  const initDragHandlePosition = () => {
    const overlayHeight = getOverlayHeight();
    setButtonContainerHeight(overlayHeight);
  };

  useEffect(() => {
    setTimeout(initDragHandlePosition, 350);
    window.addEventListener('resize', initDragHandlePosition);

    return () => {
      window.removeEventListener('resize', initDragHandlePosition);
    };
  });

  return (
    <div className="overlay-header">
      <div></div>
      <div className="overlayMenuResizeButtons">
        <div className="fullScreenOverlayButton">
          <Button className="leftOverlayResizeButton" sx={{ height: '20px' }} onClick={maximize} variant="contained">
            <ArrowDropUpIcon />
          </Button>
        </div>

        <div onMouseDown={onClickDragButton} onTouchStart={onClickDragButton} className="dragMeToResize">
          <Button className="centerOverlayResizeButton" sx={{ height: '20px' }} variant="contained">
            <DragHandleIcon />
          </Button>
        </div>
        <div className="minimizeOverlayButton">
          <Button className="rightOverlayResizeButton" sx={{ height: '20px' }} onClick={minimize} variant="contained">
            <ArrowDropDownIcon />
          </Button>
        </div>
      </div>
      <div className="overlay-header-menu-button-container">
        <Route
          path="/Records/Activity:*"
          exact={false}
          render={() => {
            return (
              <Button
                className={'overlay-header-menu-button'}
                sx={{ height: '20px' }}
                variant="contained"
                onClick={() => {
                  dispatch({ type: OVERLAY_MENU_TOGGLE });
                }}
              >
                Save Menu
                <SaveAsIcon />
              </Button>
            );
          }}
        />
      </div>
    </div>
  );
};

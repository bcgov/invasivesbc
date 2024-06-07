import { Button } from '@mui/material';
import React from 'react';
import { useDispatch } from 'react-redux';
import { Route } from 'react-router';

import throttle from 'lodash.throttle';

import { OVERLAY_MENU_TOGGLE } from 'state/actions';
import './OverlayHeader.css';

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import SaveAsIcon from '@mui/icons-material/SaveAs';

const maximize = () => {
  setOverlayHeight('90%');
};

const minimize = () => {
  setOverlayHeight('0px');
};

const setOverlayHeight = (height) => {
  const sel = document.querySelector(':root');
  if (sel instanceof HTMLElement) {
    const MIN = `var(--overlay-grip-height)`;
    const MAX = `90%`;
    sel.style.setProperty('--overlay-height', `clamp(${MIN}, ${height}, ${MAX})`);
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

  const SNAP_TO_NEAREST = 25; // set to 1 for no snap

  return Math.floor((appHeight - mouseY) / SNAP_TO_NEAREST) * SNAP_TO_NEAREST;
};

const debouncedDrag = throttle((e) => {
  let newOverlayHeight;

  if (e.type.includes('touch')) {
    const pos = e.touches[0].clientY;
    newOverlayHeight = computeDesiredDragHandleHeightFromMousePosition(pos);
  } else {
    const mousePos = e.y;
    newOverlayHeight = computeDesiredDragHandleHeightFromMousePosition(mousePos);
  }

  setOverlayHeight(`${newOverlayHeight}px`);
}, 33);

const drag = (e) => {
  debouncedDrag(e);
};

const cleanup = () => {
  try {
    document.removeEventListener('mousemove', drag, false);
    document.removeEventListener('touchmove', drag, false);
  } catch (e) {
    console.error(e);
  }
};

const onClickDragButton = (e) => {
  if (e.type.includes('touch')) {
    document.addEventListener('touchmove', drag, false);
    document.addEventListener('touchend', cleanup, true);
  } else {
    document.addEventListener('mousemove', drag, false);
    document.addEventListener('mouseup', cleanup, true);
  }
};

export const OverlayHeader = () => {
  const dispatch = useDispatch();

  return (
    <div className="overlay-header">
      <div></div>
      <div className="overlayMenuResizeButtons">
        <div className="fullScreenOverlayButton">
          <Button className="leftOverlayResizeButton" onClick={maximize} variant="contained">
            <ArrowDropUpIcon />
          </Button>
        </div>

        <div onMouseDown={onClickDragButton} onTouchStart={onClickDragButton} className="dragMeToResize">
          <Button className="centerOverlayResizeButton" variant="contained">
            <DragHandleIcon />
          </Button>
        </div>
        <div className="minimizeOverlayButton">
          <Button className="rightOverlayResizeButton" onClick={minimize} variant="contained">
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

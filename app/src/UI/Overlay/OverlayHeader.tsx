import { Button, IconButton } from '@mui/material';
import React from 'react';
import { useDispatch } from 'react-redux';
import { Route } from 'react-router';

import debounce from 'lodash.debounce';

import { OVERLAY_MENU_TOGGLE } from 'state/actions';
import './OverlayHeader.css';
import SaveAsIcon from '@mui/icons-material/SaveAs';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

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
  const SNAP_TO_NEAREST = 10; // set to 1 for no snap
  return Math.floor((appHeight - mouseY) / SNAP_TO_NEAREST) * SNAP_TO_NEAREST;
};

const throttledResize = debounce(
  (height) => {
    setOverlayHeight(`${height}px`);
  },
  3,
  { leading: true }
);

const drag = (e) => {
  e.preventDefault();

  let newOverlayHeight;

  if (e.type.includes('touch')) {
    const pos = e.touches[0].clientY;
    newOverlayHeight = computeDesiredDragHandleHeightFromMousePosition(pos);
  } else {
    const mousePos = e.y;
    newOverlayHeight = computeDesiredDragHandleHeightFromMousePosition(mousePos);
  }

  throttledResize(newOverlayHeight);
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
  e.preventDefault();

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
      <div className={'left'}></div>
      <div className={'center'}>
        <IconButton className="overlay-control" onClick={maximize}>
          <ArrowDropUpIcon />
        </IconButton>
        <div onMouseDown={onClickDragButton} onTouchStart={onClickDragButton} className="dragMeToResize">
          <IconButton className="overlay-control">
            <DragHandleIcon />
          </IconButton>
        </div>
        <IconButton className="overlay-control" onClick={minimize}>
          <ArrowDropDownIcon />
        </IconButton>
      </div>
      <div className={'right'}>
        <Route
          path="/Records/Activity:*"
          exact={false}
          render={() => {
            return (
              <Button
                variant="contained"
                className={'overlay-menu'}
                onClick={() => {
                  dispatch(OVERLAY_MENU_TOGGLE());
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

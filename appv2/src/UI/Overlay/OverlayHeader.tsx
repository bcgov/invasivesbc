import { Button } from '@mui/material';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';

import './OverlayHeader.css';
import { OVERLAY_MENU_TOGGLE } from 'state/actions';
import { original } from '@reduxjs/toolkit';
import { debounce } from 'lodash';
import { appendFile } from 'fs';

import DragHandleIcon from '@mui/icons-material/DragHandle';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import CloseIcon from '@mui/icons-material/Close';
import MenuIcon from '@mui/icons-material/Menu';

const maximize = (e) => {
  const elementWeWant = document.getElementById('overlaydiv');
  elementWeWant.style.height = 'calc(100% - 10vh)';
};

const minimize = (e) => {
  const elementWeWant = document.getElementById('overlaydiv');
  elementWeWant.style.height = '5vh';
};

const debouncedDrag = debounce((e) => {
  //const debouncedDrag = (e) => {
  console.dir(e);

  console.log('dragging to resize');
  const elementWeWant = document.getElementById('overlaydiv');
  const appElement = document.getElementById('app');
  const buttonContainer = document.getElementById('map-btn-container');
  //const originalHeight = document.getElementById('overlaydiv').style.height;

  const currentAppStyle = window.getComputedStyle(appElement);
  const oldOverlayStyle = window.getComputedStyle(elementWeWant);
  //document.getElementById('overlaydiv').style.height = '100px';

  const currentAppHeight = parseInt(currentAppStyle.height.split('px')[0]);
  const mousePos = e.y;
  const newHeight = currentAppHeight - mousePos;
  elementWeWant.style.height = newHeight + 'px';
  buttonContainer.style.marginBottom = newHeight + 'px';
}, 10);
// }

const cleanup = (e) => {
  console.log('listener cleanup ');
  document.removeEventListener('mousemove', debouncedDrag, false);
  //document.removeEventListener('mouseup', cleanup);
};

const onClickDragButton = (e) => {
  console.log('drag button clicked');

  document.addEventListener('mousemove', debouncedDrag, false);
  document.addEventListener('mouseup', cleanup, false);
};

export const OverlayHeader = (props) => {
  const history = useHistory();
  const dispatch = useDispatch();

  const onClickClose = (e) => {
    e.stopPropagation();
    dispatch({ type: 'TOGGLE_PANEL' });
    history.push('/');
  };

  return (
    <div className="overlay-header">
      <div className="overlay-header-close-button">
        <Button variant="contained" onClick={props.closeCallback ? props.closeCallback : onClickClose}>
          <CloseIcon />
        </Button>
      </div>

      <div className="overlayMenuResizeButtons">
        <div className="fullScreenOverlayButton">
          <Button onClick={maximize} variant="contained">
            <ArrowDropUpIcon />
          </Button>
        </div>

        <div onMouseDown={onClickDragButton} className="dragMeToResize">
          <Button variant="contained">
            <DragHandleIcon />
          </Button>
        </div>
        <div className="minimizeOverlayButton">
          <Button onClick={minimize} variant="contained">
            <ArrowDropDownIcon />
          </Button>
        </div>
      </div>
      <div className="overlay-header-menu-button">
        <Button
          variant="contained"
          onClick={() => {
            dispatch({ type: OVERLAY_MENU_TOGGLE });
          }}>
          <MenuIcon />
        </Button>
      </div>
    </div>
  );
};

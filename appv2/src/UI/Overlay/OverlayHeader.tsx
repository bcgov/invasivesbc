import { Button } from '@mui/material';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Route } from 'react-router';

import { debounce, get, set } from 'lodash';
import { OVERLAY_MENU_TOGGLE } from 'state/actions';
import './OverlayHeader.css';

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import SaveAsIcon from '@mui/icons-material/SaveAs';

const maximize = (e) => {
  const elementWeWant = document.getElementById('overlaydiv');
  elementWeWant.style.height = 'calc(100% - 10vh)';
};

const minimize = (e) => {
  const elementWeWant = document.getElementById('overlaydiv');
  const buttonContainer = document.getElementById('map-btn-container');
  elementWeWant.style.height = '0px';
  buttonContainer.style.marginBottom = 5 + 'vh';
};


const setButtonContainerHeight = (height) => {
  const buttonContainer = document.getElementById('map-btn-container');
  buttonContainer.style.marginBottom = height + 10 + 'px';
}

const setOverlayHeight = (height) => {
  const elementWeWant = document.getElementById('overlaydiv');
  elementWeWant.style.height = height + 'px';
}

const getAppHeight = () => {
  const appElement = document.getElementById('app');
  const currentAppStyle = window.getComputedStyle(appElement);
  const currentAppHeight = parseInt(currentAppStyle.height.split('px')[0]);
  return currentAppHeight;
}

const computeDesiredDragHandleHeightFromMousePosition = (mouseY) => {
  const appHeight = getAppHeight();
  const newHeight = appHeight - mouseY;
  return newHeight;
}

const getOverlayHeight = () => {  
  const elementWeWant = document.getElementById('overlaydiv');
  const currentOverlayStyle = window.getComputedStyle(elementWeWant);
  const currentAppHeight = parseInt(currentOverlayStyle.height.split('px')[0]);
  return currentAppHeight;
}

const debouncedDrag = (e) => { //} debounce((e) => {
  const mousePos = e.y;
  const newOverlayHeight = computeDesiredDragHandleHeightFromMousePosition(mousePos);
  setOverlayHeight(newOverlayHeight);
  setButtonContainerHeight(newOverlayHeight);
}//, 10);

const cleanup = (e) => {
  document.removeEventListener('mousemove', debouncedDrag, false);
};

const onClickDragButton = (e?) => {

  document.addEventListener('mousemove', debouncedDrag, false);
  document.addEventListener('mouseup', cleanup, false);

  setTimeout(() => {
    if(e)
    cleanup(e);
  }, 10000);
};

export const OverlayHeader = (props) => {
  const dispatch = useDispatch();


  const initDragHandlePosition = () => {
    const overlayHeight = getOverlayHeight();
    setButtonContainerHeight(overlayHeight);

  }



  useEffect(()=> {
    setTimeout(initDragHandlePosition, 350);
    window.addEventListener('resize', initDragHandlePosition);

    return () => {
      window.removeEventListener('resize', initDragHandlePosition);
    }
  })




  return (
    <div className="overlay-header">
      <div></div>
      <div className="overlayMenuResizeButtons">
        <div className="fullScreenOverlayButton">
          <Button sx={{ height: '20px' }} onClick={maximize} variant="contained">
            <ArrowDropUpIcon />
          </Button>
        </div>

        <div onMouseDown={onClickDragButton} className="dragMeToResize">
          <Button sx={{ height: '20px' }} variant="contained">
            <DragHandleIcon />
          </Button>
        </div>
        <div className="minimizeOverlayButton">
          <Button sx={{ height: '20px' }} onClick={minimize} variant="contained">
            <ArrowDropDownIcon />
          </Button>
        </div>
      </div>
      <div className="overlay-header-menu-button">
        <Route
          path="/Records/Activity:*"
          exact={false}
          render={(props) => {
            return ( <Button
                sx={{ height: '20px' }}
                variant="contained"
                onClick={() => {
                  dispatch({ type: OVERLAY_MENU_TOGGLE });
                }}>
                <SaveAsIcon />
              </Button>);
          }}
        />
      </div>
    </div>
  );
};

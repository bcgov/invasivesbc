import { IconButton } from '@mui/material';
import debounce from 'lodash.debounce';
import 'UI/Layout/OverlayLayout/OverlayHeader.css';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import React, { useEffect } from 'react';
import ContextRoutes from 'UI/Layout/Routes/ContextRoutes';

const maximize = () => {
  setOverlayStyle({ top: '0px' });
};

const minimize = () => {
  setOverlayStyle({ top: getOverlayAnchorDimensions().height });
};

const defaultPosition = () => {
  setOverlayStyle({ top: '50vh' });
};

const setOverlayStyle = ({ top }) => {
  const sel = document.querySelector(':root');
  if (sel instanceof HTMLElement) {
    const MIN = `0px`;
    const MAX = `${getOverlayAnchorDimensions().height} - var(--overlay-grip-height)`;
    sel.style.setProperty('--overlay-top', `clamp(${MIN}, ${top}, ${MAX})`);
  }
};

const getOverlayAnchorDimensions = () => {
  const appElement = document.getElementById('overlay-anchor');

  if (appElement !== null) {
    const currentAppStyle = window.getComputedStyle(appElement);
    return {
      height: currentAppStyle.height,
      top: currentAppStyle.top
    };
  }

  return {
    height: '0',
    top: '0'
  };
};

const throttledRestyle = debounce(
  (newStyle) => {
    setOverlayStyle(newStyle);
  },
  8,
  { maxWait: 10, trailing: true }
);

const drag = (e: PointerEvent) => {
  e.preventDefault();

  const correctedClientY = e.clientY - 60;

  const SNAP_TO_NEAREST = 1; // set to 1 for no snap

  throttledRestyle({ top: `${Math.floor(correctedClientY / SNAP_TO_NEAREST) * SNAP_TO_NEAREST}px` });
};

const cleanup = () => {
  try {
    document.removeEventListener('pointermove', drag, false);
  } catch (e) {
    console.error(e);
  }
};

const onClickDragButton = (e) => {
  e.preventDefault();
  document.addEventListener('pointermove', drag, false);
  document.addEventListener('pointerup', cleanup, { once: true, passive: true });
  document.addEventListener('pointercancel', cleanup, { once: true, passive: true }); //Android needs this
};

export const OverlayHeader = () => {
  useEffect(() => {
    defaultPosition();
  }, []);

  return (
    <div className="overlay-header">
      <div className={'left'}></div>
      <div className={'center'}>
        <IconButton className="overlay-control" onClick={maximize}>
          <ArrowDropUpIcon />
        </IconButton>
        <div onPointerDown={onClickDragButton} className="dragMeToResize">
          <IconButton className="overlay-control resize-handle">
            <DragHandleIcon />
          </IconButton>
        </div>
        <IconButton className="overlay-control" onClick={minimize}>
          <ArrowDropDownIcon />
        </IconButton>
      </div>
      <div className={'right'}>
        <ContextRoutes />
      </div>
    </div>
  );
};

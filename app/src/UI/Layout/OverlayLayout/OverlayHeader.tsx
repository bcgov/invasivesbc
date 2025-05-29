import { IconButton } from '@mui/material';
import { Route } from 'react-router';
import debounce from 'lodash.debounce';
import 'UI/Layout/OverlayLayout/OverlayHeader.css';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import DragHandleIcon from '@mui/icons-material/DragHandle';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import CustomPopover from 'UI/Reusable/CustomPopover/CustomPopover';
import FormMenuButtons from 'UI/Features/Records/FormMenuButtons/FormMenuButtons';
import { useSelector } from 'utils/use_selector';

const maximize = () => {
  setOverlayHeight('100%');
};

const minimize = () => {
  setOverlayHeight('0px');
};

const setOverlayHeight = (height) => {
  const sel = document.querySelector(':root');
  if (sel instanceof HTMLElement) {
    const MIN = `var(--overlay-grip-height)`;
    const MAX = `100%`;
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
  const isCellPhoneWidth = useSelector((state) => state.AppMode.constraints.tinyScreen);

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
          render={() => (
            <CustomPopover
              buttonClasses={'overlay-menu'}
              buttonText={isCellPhoneWidth ? 'Save' : 'Save Menu'}
              closeAfterPress={true}
            >
              <FormMenuButtons />
            </CustomPopover>
          )}
        />
      </div>
    </div>
  );
};

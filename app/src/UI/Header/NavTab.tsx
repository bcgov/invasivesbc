import { PropsWithChildren, useCallback, useEffect, useRef } from 'react';
import { useHistory } from 'react-router';
import { TOGGLE_PANEL } from 'state/actions';
import { MOBILE } from 'state/build-time-config';
import { selectAuth } from 'state/reducers/auth';
import { useDispatch, useSelector } from 'utils/use_selector';

type TabPredicate =
  | 'authenticated_any'
  | 'authenticated_online'
  | 'working_offline'
  | 'unauthenticated'
  | 'always'
  | 'never';

type TabPlatformPredicate = 'web' | 'mobile' | 'both';

interface PropTypes extends PropsWithChildren {
  predicate: TabPredicate;
  platform: TabPlatformPredicate;
  path: string;
  label: string;
  panelOpen: boolean;
  panelFullScreen: boolean;
}

const NavTab = ({ predicate, platform, children, path, label, panelOpen, panelFullScreen }: PropTypes) => {
  const ref = useRef(0);
  ref.current += 1;

  const urlFromAppModeState = useSelector((state) => state.AppMode.url);

  const history = useHistory();

  const dispatch = useDispatch();
  const authenticated = useSelector((state) => state.Auth.authenticated && state?.Auth.roles.length > 0);
  const { workingOffline, loggedInOrWorkingOffline } = useSelector(selectAuth);

  const canDisplayCallBack = useCallback(() => {
    if (platform === 'mobile' && !MOBILE) {
      return false;
    }
    if (platform === 'web' && MOBILE) {
      return false;
    }

    switch (predicate) {
      case 'always':
        return true;
      case 'never':
        return false;
      case 'unauthenticated':
        return !loggedInOrWorkingOffline;
      case 'authenticated_online':
        return authenticated && !workingOffline;
      case 'working_offline':
        return workingOffline;
      case 'authenticated_any':
        return loggedInOrWorkingOffline;
    }
  }, [authenticated, workingOffline, predicate, platform, MOBILE, JSON.stringify(path)]);

  useEffect(() => {
    const scrollContainer = document.getElementById('ButtonWrapper');
    const rightIconContainer = document.getElementById('right-icon-container');
    const leftIconContainer = document.getElementById('left-icon-container');

    if (scrollContainer !== null && rightIconContainer !== null && leftIconContainer !== null) {
      // workaround for scroll = client on load race
      setTimeout(() => {
        if (scrollContainer.scrollWidth > scrollContainer.clientWidth) {
          rightIconContainer.style.visibility = 'visible';
        }
      }, 100);

      scrollContainer.addEventListener('scroll', () => {
        const enableVisibleLeft = scrollContainer.scrollLeft <= 5;
        const enableVisibleRight =
          scrollContainer.scrollLeft + scrollContainer.clientWidth >= scrollContainer.scrollWidth - 5;
        if (enableVisibleRight) {
          rightIconContainer.style.visibility = 'visible';
          leftIconContainer.style.visibility = 'hidden';
        } else if (enableVisibleLeft) {
          rightIconContainer.style.visibility = 'hidden';
          leftIconContainer.style.visibility = 'visible';
        } else {
          rightIconContainer.style.visibility = 'visible';
          leftIconContainer.style.visibility = 'visible';
        }
      });
    }
  }, []);

  return (
    <>
      {canDisplayCallBack() && (
        <button
          className={'Tab' + (urlFromAppModeState === path ? ' Tab__Indicator' : '')}
          onClick={() => {
            history.push(path);
            dispatch({
              type: TOGGLE_PANEL,
              payload: { panelOpen: panelOpen, fullScreen: panelFullScreen }
            });
          }}
        >
          <div className="Tab__Content">{children}</div>
          <div className="Tab__Label">{label}</div>
        </button>
      )}
    </>
  );
};

export default NavTab;

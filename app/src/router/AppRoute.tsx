import React, {Suspense, useContext, useEffect, useState} from 'react';
import {Route, RouteProps, useHistory} from 'react-router-dom';
import {ErrorContext} from 'contexts/ErrorContext';
import {ErrorBanner} from '../components/error/ErrorBanner';
import {useSelector} from '../state/utilities/use_selector';
import {selectAuth} from '../state/reducers/auth';
import {AccessLevel} from '../AppRouter';
import CheckAccess from './CheckAccess';
import HomeLayout from 'features/home/HomeLayout';
import {CircularProgress, Theme} from '@mui/material';
import {makeStyles} from '@mui/styles';
import {useDispatch} from 'react-redux';
import {selectTabs} from 'state/reducers/tabs';
import {TABS_SET_ACTIVE_TAB_REQUEST} from 'state/actions';

interface IPrivateRouteProps extends RouteProps {
  component: React.ComponentType<any>;
  title: string;
  accessLevel: AccessLevel;
}

const useStyles = makeStyles((theme: Theme) => ({
  mainContent: {
    flex: 1,
    width: 'inherit',
    height: 'inherit',
    overflow: 'auto'
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4)
  }
}));

const AppRoute: React.FC<IPrivateRouteProps> = (props) => {
  let {component: Component, title: pageTitle, accessLevel} = props;
  const classes = useStyles();
  const errorContext = useContext(ErrorContext);
  const {initialized: authInitialized} = useSelector(selectAuth);
  const [hasErrors, setHasErrors] = React.useState(false);
  const history = useHistory();
  const dispatch = useDispatch();
  const tabs = useSelector(selectTabs);

  const {computedMatch} = props;

  useEffect(() => {
    if (authInitialized) {
      const lastVisitedPath = localStorage.getItem('TABS_CURRENT_TAB_PATH');
      if (lastVisitedPath) {
        // auth is ready to go, redirect to last visited page
        history.push(lastVisitedPath);
      }
    }
  }, [authInitialized]);

  useEffect(() => {
    const tabIndex = tabs.tabConfig.findIndex((tab) => tab.path === history.location.pathname);
    dispatch({
      type: TABS_SET_ACTIVE_TAB_REQUEST,
      payload: {
        activeTab: tabIndex === -1 ? 0 : tabIndex
      }
    });
  }, [history.location.pathname]);

  document.title = pageTitle;

  useEffect(() => {
    if (errorContext.hasErrors) {
      setHasErrors(true);
    } else {
      setHasErrors(false);
    }
  }, [errorContext.hasErrors, errorContext.errorArray]);

  const [routeMatchProps, setRouteMatchProps] = useState({});

  useEffect(() => {
    setRouteMatchProps({
      match: computedMatch
    });
  }, [computedMatch]);

  return (
    <Route
      render={(renderProps) => {
        return (
          <>
            {
              // If the auth reducer is finished loading, logged in or not
              authInitialized ? (
                <>
                  <HomeLayout>
                    {hasErrors &&
                      errorContext.errorArray.map((error: any) => {
                        return (
                          <ErrorBanner
                            key={error.code.toString() + error.message + error.namespace}
                            code={error.code}
                            message={error.message}
                            namespace={error.namespace}
                          />
                        );
                      })}
                    <CheckAccess accessLevel={accessLevel}>
                      <Suspense fallback={<>loading</>}>
                        <Component {...renderProps} {...routeMatchProps} classes={classes}/>
                      </Suspense>
                    </CheckAccess>
                  </HomeLayout>
                </>
              ) : (
                <div>
                  <CircularProgress/>
                </div>
              )
            }
          </>
        );
      }}
    />
  );
};

export default AppRoute;

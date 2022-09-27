import React, { useContext, useEffect } from 'react';
import { Route, RouteProps } from 'react-router-dom';
import { ErrorContext } from 'contexts/ErrorContext';
import { ErrorBanner } from '../components/error/ErrorBanner';
import { useSelector } from '../state/utilities/use_selector';
import { selectAuth } from '../state/reducers/auth';
import { AccessLevel } from '../AppRouter';
import CheckAccess from './CheckAccess';
import HomeLayout from 'features/home/HomeLayout';
import { Box, CssBaseline, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';

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

const NewAppRoute: React.FC<IPrivateRouteProps> = (props) => {
  const classes = useStyles();
  console.log('PROPS IN NEWAPPROUTE: ', props);
  const errorContext = useContext(ErrorContext);
  const [hasErrors, setHasErrors] = React.useState(false);

  const { initialized: authInitialized } = useSelector(selectAuth);

  let { component: Component, title: pageTitle, accessLevel } = props;

  document.title = pageTitle;

  useEffect(() => {
    if (errorContext.hasErrors) {
      setHasErrors(true);
    } else {
      setHasErrors(false);
    }
  }, [errorContext.hasErrors, errorContext.errorArray]);
  return (
    <Route
      render={(renderProps) => {
        console.log('RENDERPROPS IN NEWAPPROUTE: ', renderProps);
        return (
          <>
            {
              // If the auth reducer is finished loading, logged in or not
              authInitialized ? (
                // TODO: Combine public and home layouts into one layout
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
                      <Component {...renderProps} classes={classes} />
                    </CheckAccess>
                  </HomeLayout>
                </>
              ) : (
                <h1>Loading...</h1>
              )
            }
          </>
        );
      }}
    />
  );
};

export default NewAppRoute;

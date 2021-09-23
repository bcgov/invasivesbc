import { Box, CssBaseline, makeStyles, Theme } from '@material-ui/core';
import React from 'react';

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

interface IPublicLayoutProps {
  keycloak?: any;
  keycloakConfig?: any;
  isMobileNoNetwork?: boolean;
}

const PublicLayout: React.FC<IPublicLayoutProps> = (props) => {
  const classes = useStyles();
  const { isMobileNoNetwork } = props;

  return (
    <Box mb={2} height="inherit" width="inherit" display="flex" flexDirection="column">
      <CssBaseline />
      <main className={classes.mainContent}>
        {React.Children.map(props.children, (child: any) => {
          return React.cloneElement(child, { classes: classes, isMobileNoNetwork: isMobileNoNetwork });
        })}
      </main>
    </Box>
  );
};

export default PublicLayout;

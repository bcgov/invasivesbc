import { Box, CssBaseline, Theme } from '@mui/material';
import { makeStyles } from '@mui/styles';
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

interface IPublicLayoutProps {}

const PublicLayout: React.FC<IPublicLayoutProps> = (props) => {
  const classes = useStyles();

  return (
    <Box mb={2} height="inherit" width="inherit" display="flex" flexDirection="column">
      <CssBaseline />
      <main className={classes.mainContent}>
        {React.Children.map(props.children, (child: any) => {
          return React.cloneElement(child, { classes: classes });
        })}
      </main>
    </Box>
  );
};

export default PublicLayout;

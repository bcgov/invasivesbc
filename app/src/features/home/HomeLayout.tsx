import { makeStyles, Theme } from '@material-ui/core';
import TabsContainer from 'components/tabs/TabsContainer';
import React from 'react';

const useStyles = makeStyles((theme: Theme) => ({
  homeLayoutRoot: {
    width: 'inherit',
    height: '100%',
    display: 'flex',
    flex: '1',
    flexDirection: 'column'
  },
  tabsContainer: {
    flexGrow: 1,
    width: '100%'
  },
  homeContainer: {
    flex: '1',
    overflow: 'auto'
  }
}));

const HomeLayout = (props: any) => {
  const classes = useStyles();

  return (
    <div className={classes.homeLayoutRoot}>
      <TabsContainer classes={classes.tabsContainer} />
      <div className={classes.homeContainer}>{props.children}</div>
    </div>
  );
};

export default HomeLayout;

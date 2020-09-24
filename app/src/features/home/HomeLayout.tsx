import { makeStyles, Theme } from '@material-ui/core';
import TabsContainer from 'components/tabs/TabsContainer';
import { DatabaseContext } from 'contexts/DatabaseContext';
import React, { useContext, useEffect, useState } from 'react';
import { Subscription } from 'rxjs';




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
  const databaseContext = useContext(DatabaseContext);

  const [errorText, setErrorText] = useState('')

  useEffect(() => {
    const updateComponent = (): Subscription => {
      if (!databaseContext.database) {
        // database not ready
        return;
      }

      // read from db on first render
      addToErrorsOnPage();

      if (!databaseContext.changes) {
        // changes observable not ready
        return;
      }

      // subscribe to changes and update list on emit
      const subscription = databaseContext.changes.subscribe(() => {
        addToErrorsOnPage();
      });

      // return subscription for use in cleanup
      return subscription;
    };

    const subscription = updateComponent();

    return () => {
      if (!subscription) {
        return;
      }

      // unsubscribe on cleanup
      subscription.unsubscribe();
    };
  }, [databaseContext]);

  const addToErrorsOnPage = async () => {
    const errors = await databaseContext.database.find({
      selector: { docType: "error" }
    });

    setErrorText(JSON.stringify(errors))
  };






  useEffect(() =>
   {
      const isDBOK = () => { if (!databaseContext.database) {
      // database not ready
      return; }
    
      addToErrorsOnPage()
     }
     isDBOK()
   },[errorText])






  return (
    <div className={classes.homeLayoutRoot}>
      <TabsContainer classes={classes.tabsContainer} />
      <div>{errorText}</div>
      <div className={classes.homeContainer}>{props.children}</div>
    </div>
  );
};

export default HomeLayout;

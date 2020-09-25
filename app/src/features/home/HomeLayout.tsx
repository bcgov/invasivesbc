import { Collapse, IconButton, makeStyles, Theme } from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';
import { Alert } from '@material-ui/lab';
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

  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const updateComponent = (): Subscription => {
      if (!databaseContext.database) {
        console.log('db not ready');
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
    console.log('add errors to page');

    //console.dir(databaseContext.database.allDocs())

    const errors = await databaseContext.database.find({
      selector: { docType: 'error', errorAcknowledged: false }
    });
    console.dir(errors);

    if (errors.docs.length > 0) {
      setError(errors.docs[0]);
      setIsOpen(true);
      console.log('it happened');
    }
  };

  const acknowledgeError = (docId: string) => {
    databaseContext.database.upsert(docId, (doc) => {
      return { ...doc, errorAcknowledged: true };
    });
    setIsOpen(false);
    console.log('acknowledged error');
  };

  /*useEffect(() => {
    const isDBOK = () => {
      if (!databaseContext.database) {
        // database not ready
        return;
      }

      addToErrorsOnPage()
    }
    isDBOK()
  }, [error])*/

  return (
    <div className={classes.homeLayoutRoot}>
      <TabsContainer classes={classes.tabsContainer} />
      <Collapse in={isOpen}>
        <Alert
          severity="error"
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => {
                acknowledgeError(error._id);
              }}>
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }>
          {error == null ? null : error.errorText}
        </Alert>
      </Collapse>
      <div className={classes.homeContainer}>{props.children}</div>
    </div>
  );
};

export default HomeLayout;

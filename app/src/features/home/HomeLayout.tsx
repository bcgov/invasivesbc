import { Collapse, IconButton, makeStyles, Snackbar, Theme, withWidth } from '@material-ui/core';
import TabsContainer from 'components/tabs/TabsContainer';
import { DatabaseContext } from 'contexts/DatabaseContext';
import React, { useContext, useEffect, useState } from 'react';
import { Subscription } from 'rxjs';
import CloseIcon from '@material-ui/icons/Close';
import { Alert } from '@material-ui/lab';
import MarkunreadMailboxIcon from '@material-ui/icons/MarkunreadMailbox';
import Badge from '@material-ui/core/Badge';

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

  const [isOpen, setIsOpen] = useState(false)
  const [notification, setNotification] = useState(null)
  const [notificationCount, setNotificationCount] = useState(0)

  useEffect(() => {
    const updateComponent = (): Subscription => {
      if (!databaseContext.database) {
        console.log('db not ready')
        // database not ready
        return;
      }

      // read from db on first render
      addNotificationsToPage();

      if (!databaseContext.changes) {
        // changes observable not ready
        return;
      }

      // subscribe to changes and update list on emit
      const subscription = databaseContext.changes.subscribe(() => {
        addNotificationsToPage();
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

  const addNotificationsToPage = async () => {
    console.log('add notifications to page')

    await databaseContext.database.createIndex({index: {name: 'notifyIndex', fields: ['dateCreated', 
                                                                                      '_id', 
                                                                                      'docType', 
                                                                                      'notificationType', 
                                                                                      'text', 
                                                                                      'acknowledged']}});
    console.log('index added')

    const notifyIndex = (await (await databaseContext.database.getIndexes()).indexes.find(e => e.name === 'notifyIndex'))

    const notifications = await databaseContext.database.find({
      selector: { dateCreated: {$gte: null }, 
                  _id: {$gte: null},
                  docType: "notification", 
                  notificationType: {$gte: null}, 
                  text: {$gte: null}, 
                  acknowledged: false }, 

      fields: ['dateCreated', '_id', 'docType', 'notificationType', 'text', 'acknowledged'], 
      sort: [{dateCreated: 'desc'}],    //    <--   can't find or use index
      use_index: notifyIndex.ddoc,
    });

    setNotificationCount(notifications.docs.length)
    if (notifications.docs.length > 0) {
      setNotification(notifications.docs[0])
      setIsOpen(true)
      console.log('it happened')
      //console.log(notifications.docs[0].notificationType)
    }

  };


  const acknowledgeNotification = (docId: string) => {
    databaseContext.database.upsert(docId, (doc) => { return { ...doc, acknowledged: true } })
    setIsOpen(false);
    console.log('acknowledged notification')
  }


  /*useEffect(() => {
    const isDBOK = () => {
      if (!databaseContext.database) {
        // database not ready
        return;
      }

      addToErrorsOnPage()
    }
    isDBOK()
  }, [notification])*/

  return (
    <div className={classes.homeLayoutRoot}>
      <TabsContainer classes={classes.tabsContainer} />
      <Collapse in={isOpen}>
        <Alert
          // severity can't be null so this is a workaround
          severity={notification == null ? "success": notification.notificationType}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => {
                acknowledgeNotification(notification._id)
              }}
            >
          <Badge badgeContent={notificationCount}>
            <MarkunreadMailboxIcon></MarkunreadMailboxIcon> 

          </Badge>
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
        >
          {notification == null ? null : notification.text}
        </Alert>
      </Collapse>
      <div className={classes.homeContainer}>{props.children}</div>
    </div>
  );
};

export default HomeLayout;

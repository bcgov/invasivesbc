import { Box, Collapse, IconButton } from '@material-ui/core';
import Badge from '@material-ui/core/Badge';
import { Close, MarkunreadMailbox } from '@material-ui/icons';
import { Alert } from '@material-ui/lab';
import Footer from 'components/Footer/Footer';
import TabsContainer from 'components/tabs/TabsContainer';
import { DocType } from 'constants/database';
import { DatabaseChangesContext } from 'contexts/DatabaseChangesContext';
import { DatabaseContext } from 'contexts/DatabaseContext';
import React, { useContext, useEffect, useState, useCallback } from 'react';

const HomeLayout = (props: any) => {
  const databaseContext = useContext(DatabaseContext);
  const databaseChangesContext = useContext(DatabaseChangesContext);

  const [isOpen, setIsOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const [notificationCount, setNotificationCount] = useState(0);

  const addNotificationsToPage = useCallback(async () => {
    await databaseContext.database.createIndex({
      index: {
        name: 'notifyIndex',
        fields: ['dateCreated', '_id', 'docType', 'notificationType', 'text', 'acknowledged']
      }
    });

    const notifyIndex = await (await databaseContext.database.getIndexes()).indexes.find(
      (e) => e.name === 'notifyIndex'
    );

    const notifications = await databaseContext.database.find({
      selector: {
        dateCreated: { $gte: null },
        _id: { $gte: null },
        docType: DocType.NOTIFICATION,
        notificationType: { $gte: null },
        text: { $gte: null },
        acknowledged: false
      },

      fields: ['dateCreated', '_id', 'docType', 'notificationType', 'text', 'acknowledged'],
      sort: [{ dateCreated: 'desc' }], //    <--   can't find or use index
      use_index: notifyIndex.ddoc
    });

    setNotificationCount(notifications.docs.length);

    if (notifications.docs.length > 0) {
      setNotification(notifications.docs[0]);
      setIsOpen(true);
    }
  }, [databaseContext.database]);

  useEffect(() => {
    const updateComponent = () => {
      addNotificationsToPage();
    };

    updateComponent();
  }, [databaseChangesContext, addNotificationsToPage]);

  const acknowledgeNotification = (docId: string) => {
    databaseContext.database.upsert(docId, (doc) => {
      return { ...doc, acknowledged: true };
    });

    setIsOpen(false);
  };

  return (
    <Box width="inherit" height="100%" display="flex" flex="1" flexDirection="column">
      <TabsContainer />
      <Collapse timeout={50} in={isOpen}>
        <Alert
          // severity can't be null so this is a workaround
          severity={notification == null ? 'success' : notification.notificationType}
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="medium"
              onClick={() => {
                acknowledgeNotification(notification._id);
              }}>
              <Badge badgeContent={notificationCount}>
                <MarkunreadMailbox />
              </Badge>
              <Close fontSize="inherit" />
            </IconButton>
          }>
          <strong>{notification == null ? null : notification.text}</strong>
        </Alert>
      </Collapse>
      <Box mb="43px" height="inherit" width="inherit" overflow="auto">
        {props.children}
      </Box>
      <Box position="absolute" bottom="0" left="0" right="0" bgcolor="primary.main" color="primary.contrastText">
        <Footer />
      </Box>
    </Box>
  );
};

export default HomeLayout;

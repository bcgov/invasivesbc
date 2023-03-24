import { Box } from '@mui/material';
import { copyToClipboard } from 'components/batch-upload/ClipboardHelper';
import { GeneralDialog } from 'components/dialog/GeneralDialog';
import Footer from 'components/Footer/Footer';
import TabsContainer from 'components/tabs/TabsContainer';
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { USER_SETTINGS_SET_ERROR_HANDLER_DIALOG_REQUEST } from 'state/actions';
import { selectUserSettings } from 'state/reducers/userSettings';

export interface IHomeLayoutProps {
  children: any;
}

const HomeLayout: React.FC<IHomeLayoutProps> = (props: any) => {
  const userSettings = useSelector(selectUserSettings);
  const dispatch = useDispatch();
  let errorHandlerDialog = {
    dialogOpen: userSettings.errorHandlerDialog.dialogOpen,
    dialogTitle: 'Error',
    dialogActions: [
      {
        actionName: 'Copy error message to clipboard',
        actionOnClick: async () => {
          copyToClipboard({
            message: userSettings.errorHandlerDialog.dialogContentText,
            value: userSettings.errorHandlerDialog.dialogContentText,
            alert: false
          });
        }
      },
      {
        actionName: 'Close',
        actionOnClick: async () => {
          dispatch({
            type: USER_SETTINGS_SET_ERROR_HANDLER_DIALOG_REQUEST,
            payload: {
              dialogOpen: false,
              dialogContent: ""
            }
          });
        }
      }
    ],
    dialogContentText: userSettings.errorHandlerDialog.dialogContentText
  }
  return (
    <Box width="100%" height="100%" display="flex" flex="1" flexDirection="column">
      <Box height="1vh - 80">
        <TabsContainer />
      </Box>
      <Box height="100%" width="100%" overflow="auto">
        {props.children}
      </Box>
      <Box
        style={{ zIndex: 1 }}
        position="fixed"
        bottom="0px"
        left="0"
        right="0"
        bgcolor="primary.main"
        color="primary.contrastText">
        <Footer />
      </Box>
      <GeneralDialog
        dialogOpen={errorHandlerDialog.dialogOpen}
        dialogTitle={errorHandlerDialog.dialogTitle}
        dialogActions={errorHandlerDialog.dialogActions}
        dialogContentText={errorHandlerDialog.dialogContentText}
      ></GeneralDialog>
    </Box>
  );
};

export default HomeLayout;

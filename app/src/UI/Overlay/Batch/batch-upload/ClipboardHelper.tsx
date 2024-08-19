import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { IconButton } from '@mui/material';
import { AlertSeverity, AlertSubjects } from 'constants/alertEnums';
import { useDispatch } from 'react-redux';
import { NEW_ALERT } from 'state/actions';

export const CopyToClipboardButton = (props: { content: string }) => {
  const dispatch = useDispatch();

  const copyToClipboard = async ({ value }: any) => {
    if (!navigator.clipboard) {
      dispatch({
        type: NEW_ALERT,
        payload: {
          content: 'No clipboard supported',
          subject: AlertSubjects.Form,
          severity: AlertSeverity.Error
        }
      });
      return;
    }
    await navigator.clipboard.writeText(value);
    dispatch({
      type: NEW_ALERT,
      payload: {
        content: 'Copied to clipboard!',
        subject: AlertSubjects.Form,
        severity: AlertSeverity.Success,
        autoClose: 3
      }
    });
  };

  return (
    <IconButton onClick={() => copyToClipboard({ value: props.content })}>
      <ContentCopyIcon />
    </IconButton>
  );
};

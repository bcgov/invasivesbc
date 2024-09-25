import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { IconButton } from '@mui/material';
import { AlertSeverity, AlertSubjects } from 'constants/alertEnums';
import { useDispatch } from 'react-redux';
import { createAlert } from 'state/actions/userAlerts.ts/userAlerts';

type PropTypes = {
  content: string;
};
export const CopyToClipboardButton = ({ content }: PropTypes) => {
  const dispatch = useDispatch();

  const copyToClipboard = async () => {
    if (!navigator.clipboard) {
      dispatch(
        createAlert({
          content: 'No clipboard supported',
          subject: AlertSubjects.Form,
          severity: AlertSeverity.Error
        })
      );
      return;
    }
    await navigator.clipboard.writeText(content);
    dispatch(
      createAlert({
        content: 'Copied to clipboard!',
        subject: AlertSubjects.Form,
        severity: AlertSeverity.Success,
        autoClose: 3
      })
    );
  };

  return (
    <IconButton onClick={copyToClipboard}>
      <ContentCopyIcon />
    </IconButton>
  );
};

import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { IconButton } from '@mui/material';
import { AlertSeverity, AlertSubjects } from 'constants/alertEnums';
import { useDispatch } from 'react-redux';
import Alerts from 'state/actions/alerts/Alerts';

type PropTypes = {
  content: string;
};
export const CopyToClipboardButton = ({ content }: PropTypes) => {
  const dispatch = useDispatch();

  const copyToClipboard = async () => {
    if (!navigator.clipboard) {
      dispatch(
        Alerts.create({
          content: 'No clipboard supported',
          subject: AlertSubjects.Form,
          severity: AlertSeverity.Error
        })
      );
      return;
    }
    await navigator.clipboard.writeText(content);
    dispatch(
      Alerts.create({
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

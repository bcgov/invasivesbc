import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { IconButton } from '@mui/material';
import React from 'react';

export const CopyToClipboardButton = (props: { content: string }) => {
  return (
    <IconButton onClick={() => copyToClipboard({ value: props.content, message: 'Copied to clipboard!' })}>
      <ContentCopyIcon></ContentCopyIcon>
    </IconButton>
  );
};

export const copyToClipboard = async ({ message, value }: any) => {
  if (!navigator.clipboard) {
    console.error('No clipboard support');
    return;
  }
  await navigator.clipboard.writeText(value);
  alert(message);
};

import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { IconButton } from '@mui/material';
import React from 'react'


export const CopyToClipboardButton = (props: { content: string}) => {
    return <IconButton onClick={() => copyToClipboard({value: props.content, message: 'Copied to clipboard!', alert: true})}><ContentCopyIcon></ContentCopyIcon></IconButton>
}


export const copyToClipboard = async ({ message, value, alert}: any) => {
    try {
      if (!navigator.clipboard) {
        throw new Error("Browser don't have support for native clipboard.");
      }
      await navigator.clipboard.writeText(value);
      if (alert) alert(message);
    } catch (error) {
      console.log(error.toString());
    }
}
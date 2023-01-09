import React from 'react';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import { Card, TextField } from '@mui/material';
import makeStyles from '@mui/styles/makeStyles';

const useStyles = makeStyles((theme: any) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    margin: 10,
    padding: 5
  },
  icon: { width: '100%', height: 100 },
  textField: { marginTop: 10 },
  statusRepresentationBox: {
    display: 'flex',
    justifyContent: 'space-around'
  }
}));

const UploadedItem = (props) => {
  const classes = useStyles();
  const { data, index, setTitle } = props;
  const { title, valid } = data;

  const handleTitleChange = (e) => {
    setTitle(e.target.value, index);
  };

  return (
    <Card style={{ backgroundColor: valid ? 'warning' : 'error' }} className={classes.container}>
      <AttachFileIcon className={classes.icon} />

      <TextField
        className={classes.textField}
        id="uploaded-file-title"
        value={title}
        onChange={handleTitleChange}
        label="File Title"
        variant="outlined"
      />
    </Card>
  );
};

export default UploadedItem;

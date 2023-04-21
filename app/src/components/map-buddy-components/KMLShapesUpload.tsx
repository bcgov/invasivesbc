import React, { useState, useContext } from 'react';
import { Box, Button, Theme, Typography } from '@mui/material';
import { useInvasivesApi } from '../../hooks/useInvasivesApi';
import { DropzoneDialog } from 'mui-file-dropzone';
import makeStyles from '@mui/styles/makeStyles';
import UploadedItem from './UploadedItem';
import { MapRequestContext } from 'contexts/MapRequestsContext';
import { useSelector } from '../../state/utilities/use_selector';
import { selectAuth } from '../../state/reducers/auth';

export interface IShapeUploadRequest {
  data: string;
  type: 'kml' | 'kmz';
  user_id: string;
  title: string;
}

const useStyles = makeStyles((theme: Theme) => ({
  itemsContainer: { display: 'flex', justifyContent: 'start', alignItems: 'center', width: '100%', flexWrap: 'wrap' },
  buttonsContainer: { display: 'flex', justifyContent: 'stretch' },
  button: { flexGrow: 1, marginLeft: 10, marginRight: 10 },
  componentContainer: { maxWidth: '500px', padding: 7 },
  messageContainer: {
    padding: 7,
    width: '100%'
  }
}));

//   var extension = input?.name?.split('.').pop();
export const KMLShapesUpload: React.FC<any> = (props) => {
  const classes = useStyles();
  const [uploadRequests, setUploadRequests] = useState([]);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const { extendedInfo } = useSelector(selectAuth);
  const mapRequestContext = useContext(MapRequestContext);
  const { setUploadLayersFlag } = mapRequestContext;
  const api = useInvasivesApi();
  const [resultMessage, setResultMessage] = useState('');
  const [uploadClicked, setUploadClicked] = useState(false);

  const doUpload = async () => {
    let response;
    try {
      for (let i = 0; i < uploadRequests.length; i++) {
        console.log();
        response = await api.postAdminUploadShape(uploadRequests[i]);
        console.log(response);
        if (response.code !== 201) {
          throw new Error(response.message);
        }
        setUploadRequests((prev) => {
          if (prev.length < 2) {
            return [];
          } else {
            return [...prev].splice(i, 1);
          }
        });
      }
      setResultMessage('Files uploaded successfully');
      setUploadClicked(false);
      setUploadLayersFlag(Math.random());
      setTimeout(() => {
        setResultMessage('');
        if (props?.callback) props.callback();
      }, 2000);
    } catch (err) {
      setUploadRequests([]);
      setResultMessage('There was an error: ' + err);
      setUploadClicked(false);
      setTimeout(() => {
        setResultMessage('');
      }, 2000);
    }
  };

  const acceptFiles = (files: File[]) => {
    setUploadRequests([]);
    if (files.length < 1) {
      return;
    }

    files.forEach((file) => {
      let status: string;
      const defaultTitle = file.name.split('.')[0];

      let fileType: string;
      fileType = file.name.split('.').pop();

      const reader = new FileReader();

      reader.onabort = () => (status = 'file reading was aborted');
      reader.onerror = () => (status = 'file reading has failed');
      reader.onload = () => {
        const encodedString = btoa(reader.result as string);

        setUploadRequests((prev) => {
          const newRequest = [...prev];
          newRequest.push({
            type: fileType,
            data: encodedString,
            user_id: extendedInfo.user_id,
            title: defaultTitle,
            status: status
          });
          return newRequest;
        });
      };

      reader.readAsBinaryString(file);
    });
  };

  const handleTitleChange = (title, index) => {
    setUploadRequests((prev) => {
      let reqChanged = prev[index];
      reqChanged['title'] = title;
      const newRequests = [...prev];
      newRequests[index] = reqChanged;
      return newRequests;
    });
  };

  if (!extendedInfo?.user_id) {
    return (
      <Box className={classes.componentContainer}>
        <Typography color="error" style={{ textAlign: 'center' }}>
          You have to be logged in to access this feature
        </Typography>
      </Box>
    );
  }
  return (
    <Box className={classes.componentContainer}>
      <DropzoneDialog
        acceptedFiles={['.kml,.kmz']}
        cancelButtonText={'cancel'}
        filesLimit={50}
        submitButtonText={'add'}
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={(files) => {
          acceptFiles(files);
          setDialogOpen(false);
        }}
        showPreviews={true}
        useChipsForPreview={true}
        showFileNamesInPreview={true}
      />

      <Box className={classes.buttonsContainer}>
        <Button className={classes.button} variant="contained" color="primary" onClick={() => setDialogOpen(true)}>
          Add KML/KMZ
        </Button>
        <Button
          className={classes.button}
          variant={'contained'}
          disabled={uploadRequests.length < 1 || uploadClicked}
          onClick={() => {
            setUploadClicked(true);
            doUpload()
          }}>
          Upload
        </Button>
      </Box>

      {resultMessage && <Box className={classes.messageContainer}>{resultMessage}</Box>}

      <Box className={classes.itemsContainer}>
        {uploadRequests.map((req, index) => {
          return <UploadedItem data={req} index={index} setTitle={handleTitleChange} />;
        })}
      </Box>
    </Box>
  );
};

export default KMLShapesUpload;

import React, { useEffect, useState } from 'react';
import { Box } from '@mui/material';
import { DropzoneDialog } from 'mui-file-dropzone';
import { useInvasivesApi } from 'hooks/useInvasivesApi';
import { useDispatch } from 'react-redux';
import { REFETCH_SERVER_BOUNDARIES } from 'state/actions';

export interface IShapeUploadRequest {
  data: string;
  type: 'kml' | 'kmz';
  user_id: string;
  title: string;
}

export const KMLShapesUpload: React.FC<any> = (props) => {
  const [uploadRequests, setUploadRequests] = useState([]);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const api = useInvasivesApi();
  const [resultMessage, setResultMessage] = useState('');
  const [uploadClicked, setUploadClicked] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (uploadRequests.length > 0)
      doUpload().then(() => {
        props.whenDone();
        dispatch({ type: REFETCH_SERVER_BOUNDARIES });
      });
  }, [uploadRequests]);

  const doUpload = async () => {
    let response;
    try {
      for (let i = 0; i < uploadRequests.length; i++) {
        response = await api.postAdminUploadShape(uploadRequests[i]);
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
    Promise.resolve();
  };

  const acceptFiles = (files: File[]) => {
    setUploadRequests([]);
    if (files.length < 1) {
      return;
    }

    files.forEach((file) => {
      let status: string;
      const defaultTitle = props.title.length > 0 ? props.title : file.name.split('.')[0];

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
            // user_id: extendedInfo.user_id,
            title: defaultTitle,
            status: status
          });
          return newRequest;
        });
      };

      reader.readAsBinaryString(file);
    });
  };

  return (
    <Box>
      <DropzoneDialog
        acceptedFiles={['.kml,.kmz']}
        filesLimit={1}
        cancelButtonText={'cancel'}
        onClose={() => {
          setDialogOpen(false);
          props.whenDone();
        }}
        submitButtonText={'Upload to InvasivesBC'}
        open={props.open}
        onSave={(files: any) => {
          acceptFiles(files);
        }}
        showPreviews={true}
        previewText={'File will be uploaded to InvasivesBC as ' + props.title}
        maxFileSize={10485760}
      />

      {resultMessage && <Box>{resultMessage}</Box>}
    </Box>
  );
};

export default KMLShapesUpload;

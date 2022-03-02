import React, { useState, useContext, useEffect } from 'react';
import { Box, Button } from '@mui/material';
import { useInvasivesApi } from '../../hooks/useInvasivesApi';
import { DropzoneArea } from 'mui-file-dropzone';
import { AuthStateContext } from 'contexts/authStateContext';
import UploadedItem from './UploadedItem';

export interface IShapeUploadRequest {
  data: string;
  type: 'kml' | 'kmz';
  user_id: string;
  title: string;
  state: string;
  valid: boolean;
}

//   var extension = input?.name?.split('.').pop();
export const KMLShapesUpload: React.FC<any> = (props) => {
  const [uploadRequests, setUploadRequests] = useState([]);

  const [valid, setValid] = useState(false);
  const [message, setMessage] = useState(null);

  const { userInfo } = useContext(AuthStateContext);
  const { user_id } = userInfo;
  const api = useInvasivesApi();

  const doUpload = async () => {
    if (!valid) {
      return;
    }

    try {
      for (let i = 0; i < uploadRequests.length; i++) {
        await api.postAdminUploadShape(uploadRequests[i]);
      }

      setUploadRequests([]);
      setMessage('Upload complete');
    } catch (err) {
      setMessage('Error occurred');
    }
  };

  const acceptFiles = (files: File[]) => {
    setUploadRequests([]);
    if (files.length < 1) {
      return;
    }

    files.forEach((file) => {
      let state: string;
      let valid: boolean;
      const extension = file.name.split('.').pop();
      const defaultTitle = file.name.split('.')[0];
      let fileType: string;

      if (extension.match(/kml/i)) {
        fileType = 'kml';
        valid = true;
      } else if (extension.match(/kmz/i)) {
        fileType = 'kmz';
        valid = true;
      } else {
        valid = false;
        state = 'Unrecognized extension ' + extension;
        return;
      }

      const reader = new FileReader();

      reader.onabort = () => (state = 'file reading was aborted');
      reader.onerror = () => (state = 'file reading has failed');
      reader.onload = () => {
        const encodedString = btoa(reader.result as string);

        state = 'Ready to upload';
        valid = true;

        setUploadRequests((prev) => {
          const newRequest = [...prev];
          newRequest.push({
            type: fileType,
            data: encodedString,
            user_id: user_id,
            title: defaultTitle,
            state: state,
            valid: valid
          });
          return newRequest;
        });
      };

      reader.readAsBinaryString(file);
    });
  };

  useEffect(() => {
    let allValid = true;

    uploadRequests.forEach((request) => {
      if (request.valid === false) {
        allValid = false;
      }
    });

    if (uploadRequests.length < 1) {
      allValid = false;
    }
    if (allValid) {
      setValid(true);
    }
  }, [uploadRequests]);

  const handleTitleChange = (title, index) => {
    setUploadRequests((prev) => {
      let reqChanged = prev[index];
      reqChanged['title'] = title;
      const newRequests = [...prev];
      newRequests[index] = reqChanged;
      return newRequests;
    });
  };

  return (
    <div style={{ maxWidth: '500px' }}>
      <DropzoneArea
        dropzoneText="Upload KML/KMZ here"
        onChange={acceptFiles}
        showPreviews={true}
        showPreviewsInDropzone={false}
        useChipsForPreview
      />

      <Box
        style={{
          display: 'flex',
          justifyContent: 'start',
          alignItems: 'center',
          width: '100%',
          flexWrap: 'wrap'
        }}>
        {uploadRequests.map((req, index) => {
          return <UploadedItem data={req} index={index} setTitle={handleTitleChange} />;
        })}
      </Box>

      <Box style={{ display: 'flex', justifyContent: 'center' }}>
        <Button variant={'contained'} disabled={!valid} onClick={() => doUpload()}>
          Upload
        </Button>
      </Box>
    </div>
  );
};

export default KMLShapesUpload;

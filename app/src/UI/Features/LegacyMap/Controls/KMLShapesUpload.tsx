import React, { useState } from 'react';
import { Box, Button } from '@mui/material';
import { useInvasivesApi } from 'hooks/useInvasivesApi';
import { useDispatch } from 'react-redux';
import MapActions from 'state/actions/map';
import { styled } from '@mui/material/styles';
import { FileUpload } from '@mui/icons-material';

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1
});

export interface IShapeUploadRequest {
  data: string;
  type: string;
  user_id?: string;
  title: string;
  status: string;
}

export const KMLShapesUpload: React.FC<{ open: boolean; whenDone: () => void; title: string }> = ({
  open,
  title,
  whenDone
}) => {
  const [uploadRequests, setUploadRequests] = useState<IShapeUploadRequest[]>([]);
  const api = useInvasivesApi();
  const [resultMessage, setResultMessage] = useState('');
  const dispatch = useDispatch();

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
      setTimeout(() => {
        setResultMessage('');
      }, 2000);
    } catch (err) {
      setUploadRequests([]);
      setResultMessage('There was an error: ' + err);
      setTimeout(() => {
        setResultMessage('');
      }, 2000);
    }
    await Promise.resolve();
  };

  const acceptFiles = (files: FileList) => {
    setUploadRequests([]);
    if (files.length < 1) {
      return;
    }

    [...files].forEach((file) => {
      let status: string;

      if (file.size > 10485760) {
        status = 'File exceeds maximum allowed size';
        return;
      }
      const defaultTitle = title.length > 0 ? title : file.name.split('.')[0];

      const fileType: string = file.name.split('.').pop() || '';

      const reader = new FileReader();

      reader.onabort = () => (status = 'file reading was aborted');
      reader.onerror = () => (status = 'file reading has failed');
      reader.onloadend = () => {
        const encodedString = btoa(
          new Uint8Array(reader.result as ArrayBuffer).reduce(
            (data: string, char) => data + String.fromCharCode(char),
            ''
          )
        );

        setUploadRequests((prev) => {
          const newRequest = [...prev];
          newRequest.push({
            type: fileType as '',
            data: encodedString,
            title: defaultTitle,
            status: status
          });
          return newRequest;
        });
      };

      reader.readAsArrayBuffer(file);
    });
  };

  if (!open) {
    return null;
  }

  return (
    <Box>
      <Button component="label" role={undefined} variant="contained" tabIndex={-1} startIcon={<FileUpload />}>
        Upload files
        <VisuallyHiddenInput
          type="file"
          onChange={(event) => {
            if (event.target.files) {
              acceptFiles(event.target.files);
            }
          }}
          accept={'.kml, .kmz'}
        />
      </Button>
      <ul>
        {uploadRequests.map((req) => (
          <li key={req.title}>{req.title}</li>
        ))}
      </ul>
      <Button
        disabled={uploadRequests.length === 0}
        onClick={() => {
          doUpload().then(() => {
            whenDone();
            dispatch(MapActions.refetchServerBoundaries());
          });
        }}
      >
        Upload
      </Button>
      <Button disabled={uploadRequests.length === 0} onClick={() => setUploadRequests([])}>
        Clear
      </Button>
      {resultMessage && <Box>{resultMessage}</Box>}
    </Box>
  );
};

export default KMLShapesUpload;
